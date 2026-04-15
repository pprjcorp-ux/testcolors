"""Execution-log schemas."""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ExecutionStatus(StrEnum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ExecutionLogRead(BaseModel):
    """Row returned to the dashboard for the My Agents view."""

    model_config = ConfigDict(extra="forbid")

    id: UUID
    agent_id: UUID
    user_id: UUID
    status: ExecutionStatus
    run_id: str | None
    started_at: datetime
    finished_at: datetime | None
    duration_ms: int | None
    output: dict[str, Any] | None
    error_message: str | None
    tokens_in: int
    tokens_out: int
    cost_usd: float
