"""Agent-row schemas (DB ↔ API)."""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from .sop import SOP


class AgentStatus(StrEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    ARCHIVED = "archived"


class AgentBase(BaseModel):
    """Fields shared by create / read / update."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., min_length=1, max_length=120)
    description: str | None = Field(None, max_length=1000)


class AgentCreate(AgentBase):
    """Payload accepted by ``POST /agents`` (typically written by the Architect node)."""

    sop: SOP
    trigger_cron: str | None = None
    recursion_limit: int = Field(default=25, ge=1, le=200)
    step_timeout_ms: int = Field(default=30_000, ge=1_000, le=600_000)


class AgentUpdate(BaseModel):
    """PATCH-style update; all fields optional."""

    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(None, min_length=1, max_length=120)
    description: str | None = Field(None, max_length=1000)
    status: AgentStatus | None = None
    trigger_cron: str | None = None


class AgentRead(AgentBase):
    """Full agent row as returned by the API."""

    id: UUID
    user_id: UUID
    sop: SOP
    required_tools: list[str]
    trigger_cron: str | None
    recursion_limit: int
    step_timeout_ms: int
    status: AgentStatus
    created_at: datetime
    updated_at: datetime
    last_run_at: datetime | None
