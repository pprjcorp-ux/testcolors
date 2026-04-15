"""Repository pattern over Supabase tables.

Each repository wraps a single table and converts between Supabase's
dict-shaped responses and our Pydantic schemas.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from ..core.logging import get_logger
from ..schemas.agent import AgentCreate, AgentRead, AgentStatus
from ..schemas.log import ExecutionLogRead, ExecutionStatus
from .client import get_supabase_admin

log = get_logger(__name__)


class AgentRepository:
    """CRUD over ``public.agents`` using the service-role client."""

    TABLE = "agents"

    def __init__(self) -> None:
        self._client = get_supabase_admin()

    def create(self, *, user_id: UUID, payload: AgentCreate) -> AgentRead:
        row = {
            "user_id": str(user_id),
            "name": payload.name,
            "description": payload.description,
            "sop": payload.sop.model_dump(mode="json"),
            "required_tools": payload.sop.required_tool_ids(),
            "trigger_cron": payload.trigger_cron,
            "recursion_limit": payload.recursion_limit,
            "step_timeout_ms": payload.step_timeout_ms,
            "status": AgentStatus.DRAFT.value,
        }
        log.info("agent.create", user_id=str(user_id), name=payload.name)
        result = self._client.table(self.TABLE).insert(row).execute()
        return AgentRead.model_validate(result.data[0])

    def list_for_user(self, user_id: UUID) -> list[AgentRead]:
        result = (
            self._client.table(self.TABLE)
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .execute()
        )
        return [AgentRead.model_validate(r) for r in (result.data or [])]

    def get(self, agent_id: UUID) -> AgentRead | None:
        result = (
            self._client.table(self.TABLE).select("*").eq("id", str(agent_id)).limit(1).execute()
        )
        if not result.data:
            return None
        return AgentRead.model_validate(result.data[0])

    def update_status(self, agent_id: UUID, status: AgentStatus) -> AgentRead:
        result = (
            self._client.table(self.TABLE)
            .update({"status": status.value})
            .eq("id", str(agent_id))
            .execute()
        )
        return AgentRead.model_validate(result.data[0])


class ExecutionLogRepository:
    """CRUD over ``public.execution_logs``."""

    TABLE = "execution_logs"

    def __init__(self) -> None:
        self._client = get_supabase_admin()

    def start(self, *, agent_id: UUID, user_id: UUID, run_id: str | None) -> ExecutionLogRead:
        row = {
            "agent_id": str(agent_id),
            "user_id": str(user_id),
            "status": ExecutionStatus.RUNNING.value,
            "run_id": run_id,
        }
        result = self._client.table(self.TABLE).insert(row).execute()
        return ExecutionLogRead.model_validate(result.data[0])

    def finish(
        self,
        *,
        log_id: UUID,
        status: ExecutionStatus,
        output: dict[str, Any] | None = None,
        error_message: str | None = None,
        tokens_in: int = 0,
        tokens_out: int = 0,
        cost_usd: float = 0.0,
    ) -> ExecutionLogRead:
        # PostgREST serialises this dict to JSON, so the value must be a
        # real ISO-8601 string — passing the literal "now()" would be
        # inserted verbatim and rejected as an invalid timestamptz.
        update = {
            "status": status.value,
            "finished_at": datetime.now(UTC).isoformat(),
            "output": output,
            "error_message": error_message[:4000] if error_message else None,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "cost_usd": cost_usd,
        }
        result = self._client.table(self.TABLE).update(update).eq("id", str(log_id)).execute()
        return ExecutionLogRead.model_validate(result.data[0])

    def list_for_agent(self, agent_id: UUID, *, limit: int = 50) -> list[ExecutionLogRead]:
        result = (
            self._client.table(self.TABLE)
            .select("*")
            .eq("agent_id", str(agent_id))
            .order("started_at", desc=True)
            .limit(limit)
            .execute()
        )
        return [ExecutionLogRead.model_validate(r) for r in (result.data or [])]
