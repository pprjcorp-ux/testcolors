"""End-to-end smoke test for the Tier-2 Worker graph.

Uses a fake worker LLM so the test runs without any env vars or
network calls. The fake returns a scripted sequence of ``AIMessage``
responses: first the plan, then a tool call, then a final answer.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any

import pytest
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatResult

from autotasker_backend.schemas.sop import SOP
from autotasker_backend.tools import REGISTRY  # noqa: F401  registers built-ins


class _ScriptedLLM(BaseChatModel):
    """A test double that yields a fixed sequence of AIMessage replies."""

    script: list[AIMessage] = []
    cursor: int = 0

    @property
    def _llm_type(self) -> str:  # pragma: no cover
        return "scripted"

    def bind_tools(self, tools: Any, **_kwargs: Any) -> "_ScriptedLLM":  # type: ignore[override]
        # bind_tools is a no-op for the test double — we already decide
        # the responses ahead of time.
        return self

    def _generate(
        self,
        messages: list[BaseMessage],
        stop: list[str] | None = None,
        run_manager: Any = None,
        **kwargs: Any,
    ) -> ChatResult:
        msg = self.script[self.cursor]
        self.cursor += 1
        return ChatResult(generations=[ChatGeneration(message=msg)])

    async def _agenerate(
        self,
        messages: list[BaseMessage],
        stop: list[str] | None = None,
        run_manager: Any = None,
        **kwargs: Any,
    ) -> ChatResult:
        return self._generate(messages, stop, run_manager, **kwargs)


def _mock_email_sop() -> SOP:
    return SOP.model_validate(
        {
            "name": "Test email SOP",
            "goal": "Send a single mock email to the user.",
            "tools": [{"tool_id": "mock_email"}],
            "steps": [
                {
                    "id": "send",
                    "description": "Send the email",
                    "tool_id": "mock_email",
                    "inputs": {
                        "to": "user@example.com",
                        "subject": "Hi",
                        "body": "Body.",
                    },
                }
            ],
            "trigger": {"type": "manual"},
        }
    )


def _install_scripted_llm(monkeypatch: pytest.MonkeyPatch, script: Sequence[AIMessage]) -> None:
    from autotasker_backend.graphs import worker as worker_module

    llm = _ScriptedLLM(script=list(script))
    monkeypatch.setattr(worker_module, "get_worker_llm", lambda: llm)


@pytest.mark.asyncio
async def test_worker_plan_call_finish(monkeypatch: pytest.MonkeyPatch) -> None:
    # Re-import after monkeypatching via _install_scripted_llm.
    from autotasker_backend.graphs.worker import build_worker_graph

    _install_scripted_llm(
        monkeypatch,
        [
            # plan_node
            AIMessage(
                content="1. Send the email via mock_email.",
                usage_metadata={"input_tokens": 10, "output_tokens": 5, "total_tokens": 15},
            ),
            # decide_node → tool call
            AIMessage(
                content="",
                tool_calls=[
                    {
                        "name": "mock_email",
                        "args": {
                            "to": "user@example.com",
                            "subject": "Hi",
                            "body": "Body.",
                        },
                        "id": "call_1",
                    }
                ],
                usage_metadata={"input_tokens": 20, "output_tokens": 10, "total_tokens": 30},
            ),
            # decide_node → final answer (no tool calls)
            AIMessage(
                content="Email sent.",
                usage_metadata={"input_tokens": 8, "output_tokens": 3, "total_tokens": 11},
            ),
        ],
    )

    sop = _mock_email_sop()
    graph = build_worker_graph(sop)
    result = await graph.ainvoke({"sop": sop})

    summary = result["summary"]
    assert summary["ok"] is True
    assert summary["answer"] == "Email sent."
    assert summary["plan"].startswith("1.")
    assert summary["step_count"] == 2  # two decide_node calls
    assert summary["tokens_in"] == 28  # 20 + 8 (plan is pre-loop, not summed)
    assert summary["tokens_out"] == 13  # 10 + 3


@pytest.mark.asyncio
async def test_worker_handles_unknown_tool(monkeypatch: pytest.MonkeyPatch) -> None:
    from autotasker_backend.graphs.worker import build_worker_graph

    _install_scripted_llm(
        monkeypatch,
        [
            # plan_node
            AIMessage(content="Plan.", usage_metadata={"input_tokens": 5, "output_tokens": 2}),
            # decide_node — hallucinates a tool id
            AIMessage(
                content="",
                tool_calls=[
                    {"name": "nonexistent_tool", "args": {}, "id": "call_bad"}
                ],
                usage_metadata={"input_tokens": 5, "output_tokens": 2},
            ),
            # decide_node — after seeing the error, yields a final answer
            AIMessage(
                content="Could not complete task.",
                usage_metadata={"input_tokens": 5, "output_tokens": 2},
            ),
        ],
    )

    sop = _mock_email_sop()
    graph = build_worker_graph(sop)
    result = await graph.ainvoke({"sop": sop})

    summary = result["summary"]
    assert summary["ok"] is True  # graph completed without raising
    assert summary["answer"] == "Could not complete task."
