"""Chat streaming endpoint that drives the Tier-1 Meta-Agent.

Streams Server-Sent Events (SSE) so the Next.js Forge UI can render the
Meta-Agent's progress incrementally. Each event is a single JSON line
prefixed with ``data: ``; the stream terminates with ``data: [DONE]``.

This is the synchronous side of the system. Tier-2 Worker dispatch
lives in :mod:`autotasker_backend.api.inngest`.
"""

from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator
from typing import Any
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessage, HumanMessage
from pydantic import BaseModel, ConfigDict, Field

from ..core.auth import get_current_user_id
from ..core.errors import client_safe_error
from ..core.logging import get_logger
from ..core.rate_limit import limiter
from ..graphs.architect import build_architect_graph
from ..graphs.state import ArchitectState

router = APIRouter(prefix="/chat", tags=["chat"])
log = get_logger(__name__)

# Compile the graph once at import time. It's stateless per invocation.
_ARCHITECT_GRAPH = build_architect_graph()


class ChatRequest(BaseModel):
    """Body of POST /chat/stream.

    The caller's identity comes from the ``Authorization: Bearer <jwt>``
    header — never from a client-supplied user_id — so a malicious
    client cannot impersonate another user by editing the JSON body.
    """

    model_config = ConfigDict(extra="forbid")

    thread_id: str | None = None
    message: str = Field(..., min_length=1, max_length=4000)


def _sse(payload: dict[str, Any]) -> str:
    return f"data: {json.dumps(payload, default=str)}\n\n"


async def _stream_architect(
    request: ChatRequest, user_id: UUID
) -> AsyncIterator[str]:
    thread_id = request.thread_id or str(uuid4())
    initial_state: ArchitectState = {
        "messages": [HumanMessage(content=request.message)],
        "user_id": str(user_id),
        "thread_id": thread_id,
        "status": "intake",
        "scratchpad": {},
    }

    yield _sse({"type": "start", "thread_id": thread_id})

    try:
        async for event in _ARCHITECT_GRAPH.astream(initial_state, stream_mode="updates"):
            # ``event`` is {node_name: partial_state}
            for node_name, partial in event.items():
                payload: dict[str, Any] = {"type": "node", "node": node_name}
                if "status" in partial:
                    payload["status"] = partial["status"]

                # Surface assistant messages produced by the node.
                for msg in partial.get("messages", []) or []:
                    if isinstance(msg, AIMessage):
                        yield _sse(
                            {
                                "type": "message",
                                "node": node_name,
                                "role": "assistant",
                                "content": msg.content if isinstance(msg.content, str) else str(msg.content),
                            }
                        )

                if "feasibility" in partial and partial["feasibility"] is not None:
                    payload["feasibility"] = partial["feasibility"].model_dump()
                if "sop" in partial and partial["sop"] is not None:
                    payload["sop_name"] = partial["sop"].name
                    payload["sop_step_count"] = len(partial["sop"].steps)
                if "persisted_agent_id" in partial:
                    payload["agent_id"] = partial["persisted_agent_id"]
                if "error" in partial and partial["error"]:
                    payload["error"] = partial["error"]

                yield _sse(payload)
    except asyncio.CancelledError:
        # Client disconnected — no need to yield anything; upstream
        # closes the response. Let the exception propagate so the
        # ASGI server knows the generator is done.
        log.info("chat.stream_cancelled")
        raise
    except Exception as exc:  # noqa: BLE001 — full traceback stays in logs only
        log.exception("chat.stream_failed")
        yield _sse({"type": "error", "error": client_safe_error(exc)})

    yield "data: [DONE]\n\n"


@router.post("/stream")
@limiter.limit("10/minute")
async def chat_stream(
    request: Request,  # required by slowapi to read the client IP
    body: ChatRequest,
    user_id: UUID = Depends(get_current_user_id),
) -> StreamingResponse:
    return StreamingResponse(
        _stream_architect(body, user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )
