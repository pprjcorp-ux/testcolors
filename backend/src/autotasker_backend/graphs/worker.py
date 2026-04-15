"""Tier-2 Worker graph (stub).

The Worker is **compiled per execution** from a stored SOP. The shape
of the graph is fixed:

    START → plan → tool_call → observe → (loop ≤ recursion_limit) → summarize → END

For Phase 1 we ship a working stub that:
  * Iterates through the SOP steps in order.
  * Looks up each step's tool in the registry and invokes its handler.
  * Honours the SOP's ``recursion_limit`` and per-step timeout.
  * Aggregates results into a final summary returned to Inngest.

The Phase 2 implementation will replace the deterministic loop with an
LLM-driven plan/observe loop using the worker LLM.
"""

from __future__ import annotations

import asyncio
from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from ..core.logging import get_logger
from ..schemas.sop import SOP
from ..tools.registry import REGISTRY

log = get_logger(__name__)


class WorkerState(TypedDict, total=False):
    sop: SOP
    cursor: int
    observations: list[dict[str, Any]]
    summary: dict[str, Any]
    error: str | None


async def plan_node(state: WorkerState) -> WorkerState:
    """Initialise the cursor and observation buffer."""
    return {"cursor": 0, "observations": []}


async def tool_call_node(state: WorkerState) -> WorkerState:
    """Execute the tool for the current step (if any)."""
    sop = state["sop"]
    cursor = state.get("cursor", 0)
    step = sop.steps[cursor]
    observations = list(state.get("observations") or [])

    if step.tool_id is None:
        observations.append({"step_id": step.id, "skipped": "reasoning_only"})
        return {"observations": observations}

    spec = REGISTRY.get(step.tool_id)
    log.info("worker.tool_call", step_id=step.id, tool_id=step.tool_id)

    try:
        result = await asyncio.wait_for(
            spec.handler(step.inputs),
            timeout=sop.step_timeout_ms / 1000,
        )
        observations.append({"step_id": step.id, "tool_id": step.tool_id, "result": result})
        return {"observations": observations}
    except TimeoutError:
        return {
            "error": f"Step {step.id!r} timed out after {sop.step_timeout_ms}ms",
            "observations": observations,
        }
    except Exception as exc:  # noqa: BLE001 — captured into log row
        return {
            "error": f"Step {step.id!r} failed: {exc}",
            "observations": observations,
        }


async def observe_node(state: WorkerState) -> WorkerState:
    """Advance the cursor."""
    return {"cursor": state.get("cursor", 0) + 1}


async def summarize_node(state: WorkerState) -> WorkerState:
    """Build the final summary returned to the orchestrator."""
    observations = state.get("observations") or []
    error = state.get("error")
    return {
        "summary": {
            "ok": error is None,
            "step_count": len(observations),
            "observations": observations,
            "error": error,
        }
    }


def _route_after_observe(state: WorkerState) -> str:
    if state.get("error"):
        return "summarize"
    sop = state["sop"]
    if state.get("cursor", 0) >= len(sop.steps):
        return "summarize"
    return "tool_call"


def build_worker_graph(sop: SOP):
    """Compile a Worker graph for the given SOP.

    The SOP is captured in the compiled graph's default state so the
    Inngest function only has to call ``graph.ainvoke({"sop": sop})``.
    """
    g: StateGraph = StateGraph(WorkerState)
    g.add_node("plan", plan_node)
    g.add_node("tool_call", tool_call_node)
    g.add_node("observe", observe_node)
    g.add_node("summarize", summarize_node)

    g.add_edge(START, "plan")
    g.add_edge("plan", "tool_call")
    g.add_edge("tool_call", "observe")
    g.add_conditional_edges(
        "observe",
        _route_after_observe,
        {"tool_call": "tool_call", "summarize": "summarize"},
    )
    g.add_edge("summarize", END)

    # The compiled graph carries the SOP-derived recursion limit so the
    # caller doesn't have to remember to pass it.
    return g.compile().with_config({"recursion_limit": sop.recursion_limit})
