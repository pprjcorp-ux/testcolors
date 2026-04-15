"""Shared state types for the LangGraph graphs.

LangGraph reads these as :class:`TypedDict` schemas. Where we want
reducers (e.g. message append), we wrap the field type in
:func:`typing.Annotated`.
"""

from __future__ import annotations

from typing import Annotated, Any, Literal, TypedDict

from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field

from ..schemas.sop import SOP

# ---------------------------------------------------------------------------
# Tier 1 — Meta-Agent state
# ---------------------------------------------------------------------------

ArchitectStatus = Literal[
    "intake",
    "checking_feasibility",
    "infeasible",
    "clarifying",
    "designing",
    "persisting",
    "done",
    "error",
]


class FeasibilityReport(BaseModel):
    """Result of the Feasibility Gate.

    ``feasible`` is the only required field for the conditional edge to
    work; the rest are surfaced to the user when ``feasible`` is False.
    """

    feasible: bool
    reason: str = Field(..., description="Human-readable explanation.")
    matched_tool_ids: list[str] = Field(default_factory=list)
    missing_capabilities: list[str] = Field(default_factory=list)


class ArchitectState(TypedDict, total=False):
    """State carried through the Tier-1 Meta-Agent graph.

    All fields are optional (``total=False``) so individual nodes can
    write only the slice they care about. LangGraph merges the partials
    via the per-field reducers.
    """

    # Conversation
    messages: Annotated[list[AnyMessage], add_messages]

    # Identity
    user_id: str
    thread_id: str

    # Pipeline progress
    status: ArchitectStatus
    intent: str | None
    feasibility: FeasibilityReport | None
    sop: SOP | None
    persisted_agent_id: str | None
    error: str | None

    # Free-form scratchpad for future nodes
    scratchpad: dict[str, Any]
