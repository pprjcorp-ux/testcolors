"""Agents CRUD endpoints (used by the My Agents view).

Every route enforces ownership via ``get_current_user_id``: the
authenticated user's id is the only identity that matters, and a
mismatch always returns 404 (never 403) so we don't leak existence.
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from ..core.auth import get_current_user_id
from ..db.repositories import AgentRepository, ExecutionLogRepository
from ..schemas.agent import AgentRead, AgentStatus
from ..schemas.log import ExecutionLogRead

router = APIRouter(prefix="/agents", tags=["agents"])


def _load_owned_or_404(agent_id: UUID, user_id: UUID) -> AgentRead:
    agent = AgentRepository().get(agent_id, user_id=user_id)
    if agent is None:
        # 404, not 403 — don't reveal that the row exists but belongs
        # to someone else.
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.get("", response_model=list[AgentRead])
async def list_agents(
    user_id: UUID = Depends(get_current_user_id),
) -> list[AgentRead]:
    return AgentRepository().list_for_user(user_id)


@router.get("/{agent_id}", response_model=AgentRead)
async def get_agent(
    agent_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
) -> AgentRead:
    return _load_owned_or_404(agent_id, user_id)


@router.post("/{agent_id}/activate", response_model=AgentRead)
async def activate_agent(
    agent_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
) -> AgentRead:
    _load_owned_or_404(agent_id, user_id)
    return AgentRepository().update_status(agent_id, AgentStatus.ACTIVE)


@router.post("/{agent_id}/pause", response_model=AgentRead)
async def pause_agent(
    agent_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
) -> AgentRead:
    _load_owned_or_404(agent_id, user_id)
    return AgentRepository().update_status(agent_id, AgentStatus.PAUSED)


@router.get("/{agent_id}/logs", response_model=list[ExecutionLogRead])
async def list_agent_logs(
    agent_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    limit: int = Query(50, ge=1, le=200),
) -> list[ExecutionLogRead]:
    _load_owned_or_404(agent_id, user_id)
    return ExecutionLogRepository().list_for_agent(agent_id, limit=limit)
