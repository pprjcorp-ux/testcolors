"""Inngest webhook receiver for background Worker dispatch.

Inngest pushes ``agents.execute`` events here on the cron schedule
declared in each agent's SOP. The handler:

  1. Loads the agent + SOP from Supabase.
  2. Compiles a Worker graph for that SOP.
  3. Runs the graph with a hard recursion limit.
  4. Records start/finish rows in ``execution_logs``.

We deliberately keep this module thin: the heavy lifting lives in
``graphs.worker`` so the same code path is reachable from CLI tooling
and tests.
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from ..core.auth import require_inngest_secret
from ..core.logging import get_logger
from ..db.repositories import AgentRepository, ExecutionLogRepository
from ..graphs.worker import build_worker_graph
from ..schemas.log import ExecutionLogRead, ExecutionStatus

router = APIRouter(prefix="/inngest", tags=["inngest"])
log = get_logger(__name__)


class ExecuteAgentEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    agent_id: UUID
    run_id: str | None = Field(None, description="Inngest run id for tracing.")


@router.post(
    "/execute",
    response_model=ExecutionLogRead,
    dependencies=[Depends(require_inngest_secret)],
)
async def execute_agent(event: ExecuteAgentEvent) -> ExecutionLogRead:
    agents = AgentRepository()
    logs = ExecutionLogRepository()

    agent = agents.get(event.agent_id)
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")

    log_row = logs.start(agent_id=agent.id, user_id=agent.user_id, run_id=event.run_id)
    log.info("worker.start", agent_id=str(agent.id), log_id=str(log_row.id))

    graph = build_worker_graph(agent.sop)
    try:
        result = await graph.ainvoke({"sop": agent.sop})
        summary = result.get("summary") or {}
        ok = bool(summary.get("ok"))
        return logs.finish(
            log_id=log_row.id,
            status=ExecutionStatus.SUCCESS if ok else ExecutionStatus.FAILED,
            output=summary,
            error_message=summary.get("error"),
        )
    except Exception as exc:  # noqa: BLE001 — full traceback stays in logs only
        log.exception("worker.crashed", log_id=str(log_row.id))
        # Store only the exception class name in the DB row — the raw
        # message could leak credentials embedded in provider errors
        # (e.g. psycopg connection strings, httpx response bodies).
        return logs.finish(
            log_id=log_row.id,
            status=ExecutionStatus.FAILED,
            error_message=f"Worker crashed: {type(exc).__name__}",
        )
