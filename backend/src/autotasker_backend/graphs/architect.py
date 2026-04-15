"""Tier-1 Meta-Agent graph (a.k.a. The Architect).

Pipeline:

    START
      │
      ▼
    intake_node ─────────────► (extract user intent into structured form)
      │
      ▼
    feasibility_node ─────────► (check Tool Registry, then LLM reasoning)
      │
      ├──[infeasible]──► reject_node ──► END
      │
      ▼
    architect_node ───────────► (emit SOP JSON, validated by Pydantic)
      │
      ▼
    persist_node ─────────────► (write to Supabase agents table)
      │
      ▼
    END

Notes:
  * We use ``StateGraph`` with the modern LangGraph API only (no
    deprecated ``Chain``/``LLMChain`` constructs).
  * The architect node is constrained to emit JSON via
    ``with_structured_output(SOP)``, so an invalid SOP raises *before*
    Persist runs.
  * Streaming is handled at the FastAPI layer using ``graph.astream``.
"""

from __future__ import annotations

import json
from typing import TYPE_CHECKING, cast
from uuid import UUID

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.graph import END, START, StateGraph

from ..core.logging import get_logger
from ..db.repositories import AgentRepository
from ..llm.provider import get_meta_agent_llm
from ..schemas.agent import AgentCreate
from ..schemas.sop import SOP
from ..tools.registry import REGISTRY
from .state import ArchitectState, FeasibilityReport

if TYPE_CHECKING:
    from langgraph.graph.state import CompiledStateGraph

log = get_logger(__name__)


# ---------------------------------------------------------------------------
# System prompts
# ---------------------------------------------------------------------------

INTAKE_SYSTEM = """You are the Intake stage of the AutoTasker Meta-Agent.

Your job is to read the user's most recent message and re-state, in one
crisp sentence, what *task* they want automated. Do not propose a
solution. Do not ask questions. Output ONLY the restated intent — no
preamble, no quotes."""


def _feasibility_system_prompt() -> str:
    manifest = REGISTRY.manifest()
    pretty = json.dumps([{"id": t["id"], "name": t["name"], "description": t["description"]} for t in manifest], indent=2)
    return f"""You are the Feasibility Gate of the AutoTasker Meta-Agent.

You are given the user's task intent. You must decide whether AutoTasker's
current tool set is sufficient to perform the task autonomously on a
schedule.

Available tools (this is the COMPLETE list — there are no others):

{pretty}

Respond with a single JSON object matching this exact schema:

{{
  "feasible": <true|false>,
  "reason": "<one sentence explanation>",
  "matched_tool_ids": ["<tool_id>", ...],
  "missing_capabilities": ["<capability>", ...]
}}

Rules:
- "matched_tool_ids" MUST be a subset of the tool ids listed above.
- If you cannot match every required capability to a listed tool, set
  feasible=false and list the gaps in "missing_capabilities".
- Do NOT invent tools. Do NOT respond with prose."""


def _architect_system_prompt() -> str:
    manifest = REGISTRY.manifest()
    return f"""You are the Architect stage of the AutoTasker Meta-Agent.

You design a Standard Operating Procedure (SOP) that a background Worker
Agent will execute on a schedule. The SOP must be expressible using ONLY
the tools below.

Tool catalogue (with input schemas):

{json.dumps(manifest, indent=2)}

Output a SOP that conforms to the AutoTasker SOP schema (v1.0). Keep it
small: typically 2-6 steps. Each step that calls a tool MUST set
"tool_id" to a valid id from the catalogue above. Step ids must be
unique. Choose a sensible cron expression in trigger.cron if the user
implied a schedule; otherwise leave trigger.type='manual'."""


# ---------------------------------------------------------------------------
# Nodes
# ---------------------------------------------------------------------------


async def intake_node(state: ArchitectState) -> ArchitectState:
    """Restate the user's last message as a single-sentence intent."""
    messages = state.get("messages") or []
    if not messages:
        return {"status": "error", "error": "No user message provided."}

    llm = get_meta_agent_llm()
    response = await llm.ainvoke([SystemMessage(content=INTAKE_SYSTEM), *messages])
    intent = (response.content if isinstance(response.content, str) else str(response.content)).strip()
    log.info("architect.intake", intent=intent)

    return {
        "status": "checking_feasibility",
        "intent": intent,
        "messages": [AIMessage(content=f"Got it — interpreting your task as: *{intent}*")],
    }


async def feasibility_node(state: ArchitectState) -> ArchitectState:
    """Decide whether we have the tools to do this at all."""
    intent = state.get("intent")
    if not intent:
        return {"status": "error", "error": "Feasibility called without intent."}

    llm = get_meta_agent_llm().with_structured_output(FeasibilityReport)
    report = cast(
        FeasibilityReport,
        await llm.ainvoke(
            [
                SystemMessage(content=_feasibility_system_prompt()),
                HumanMessage(content=f"User intent: {intent}"),
            ]
        ),
    )

    # Defensive: drop any hallucinated tool ids so downstream nodes never
    # see a tool that isn't in the registry.
    report = report.model_copy(
        update={"matched_tool_ids": [tid for tid in report.matched_tool_ids if REGISTRY.has(tid)]}
    )

    log.info("architect.feasibility", feasible=report.feasible, matched=report.matched_tool_ids)

    if not report.feasible:
        return {
            "status": "infeasible",
            "feasibility": report,
            "messages": [
                AIMessage(
                    content=(
                        "I can't build this agent yet. " + report.reason
                        + (
                            "\n\nMissing capabilities: " + ", ".join(report.missing_capabilities)
                            if report.missing_capabilities
                            else ""
                        )
                    )
                )
            ],
        }

    return {
        "status": "designing",
        "feasibility": report,
        "messages": [
            AIMessage(
                content=(
                    "Looks doable — I'll design a worker using: "
                    + ", ".join(report.matched_tool_ids)
                )
            )
        ],
    }


async def reject_node(state: ArchitectState) -> ArchitectState:
    """Terminal node when the task is infeasible."""
    return {"status": "infeasible"}


async def architect_node(state: ArchitectState) -> ArchitectState:
    """Emit a strict SOP JSON document."""
    intent = state.get("intent") or ""
    feasibility = state.get("feasibility")
    matched = feasibility.matched_tool_ids if feasibility else []

    llm = get_meta_agent_llm().with_structured_output(SOP)
    sop = cast(
        SOP,
        await llm.ainvoke(
            [
                SystemMessage(content=_architect_system_prompt()),
                HumanMessage(
                    content=(
                        f"User intent: {intent}\n"
                        f"Tools you must use (subset is OK): {matched}\n"
                        "Design the SOP now."
                    )
                ),
            ]
        ),
    )

    # Hard guard: every referenced tool id must exist in the registry.
    for tid in sop.required_tool_ids():
        if not REGISTRY.has(tid):
            return {
                "status": "error",
                "error": f"Architect emitted unknown tool id: {tid!r}",
            }

    log.info("architect.sop_designed", name=sop.name, steps=len(sop.steps))

    return {
        "status": "persisting",
        "sop": sop,
        "messages": [
            AIMessage(
                content=(
                    f"Drafted **{sop.name}** ({len(sop.steps)} steps, "
                    f"{len(sop.required_tool_ids())} tools). Saving to your workspace…"
                )
            )
        ],
    }


async def persist_node(state: ArchitectState) -> ArchitectState:
    """Write the SOP to Supabase as a draft agent row."""
    sop = state.get("sop")
    user_id = state.get("user_id")
    if sop is None or user_id is None:
        return {"status": "error", "error": "Persist called without sop/user_id."}

    repo = AgentRepository()
    payload = AgentCreate(
        name=sop.name,
        description=sop.goal,
        sop=sop,
        trigger_cron=sop.trigger.cron,
        recursion_limit=sop.recursion_limit,
        step_timeout_ms=sop.step_timeout_ms,
    )
    try:
        agent = repo.create(user_id=UUID(user_id), payload=payload)
    except Exception as exc:  # noqa: BLE001 — surface to user
        log.exception("architect.persist_failed")
        return {"status": "error", "error": f"Failed to save agent: {exc}"}

    return {
        "status": "done",
        "persisted_agent_id": str(agent.id),
        "messages": [
            AIMessage(
                content=(
                    f"Saved as draft agent `{agent.id}`. Activate it from "
                    "the **My Agents** tab whenever you're ready."
                )
            )
        ],
    }


# ---------------------------------------------------------------------------
# Graph construction
# ---------------------------------------------------------------------------


def _route_after_feasibility(state: ArchitectState) -> str:
    feasibility = state.get("feasibility")
    if feasibility is None or not feasibility.feasible:
        return "reject"
    return "architect"


def build_architect_graph() -> "CompiledStateGraph":
    """Construct and compile the Tier-1 Meta-Agent graph.

    The compiled graph is safe to cache for the lifetime of the process —
    nodes are stateless and pull dependencies (LLM, repos) lazily.
    """
    g: StateGraph = StateGraph(ArchitectState)

    g.add_node("intake", intake_node)
    g.add_node("feasibility", feasibility_node)
    g.add_node("reject", reject_node)
    g.add_node("architect", architect_node)
    g.add_node("persist", persist_node)

    g.add_edge(START, "intake")
    g.add_edge("intake", "feasibility")
    g.add_conditional_edges(
        "feasibility",
        _route_after_feasibility,
        {"reject": "reject", "architect": "architect"},
    )
    g.add_edge("reject", END)
    g.add_edge("architect", "persist")
    g.add_edge("persist", END)

    return g.compile()
