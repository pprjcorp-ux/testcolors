"""Tier-2 Worker graph — LLM-driven plan / act / observe loop.

The Worker is **compiled per execution** from a stored SOP. The shape
of the graph is fixed:

    START → plan → decide → (tool_call → observe → decide)* → summarize → END

Phase-3 implementation:
  * ``plan_node`` asks the worker LLM to turn the SOP goal + allowed
    tools into a bullet-point plan. The plan is stored in state for
    debugging and seeding the decision loop.
  * ``decide_node`` calls the worker LLM with ``bind_tools(...)``
    restricted to the tools declared in the SOP. It either returns
    a final answer (→ summarize) or a ``ToolMessage``-producing
    tool call (→ tool_call).
  * ``tool_call_node`` dispatches every requested call through the
    registry's retry-wrapped ``ToolSpec.run``. Each dispatch is
    bounded by ``SOP.step_timeout_ms`` via ``asyncio.wait_for``.
  * ``observe_node`` appends the tool results to history and loops
    back to ``decide_node``.
  * ``summarize_node`` aggregates token usage from every AIMessage
    in the history so the Inngest runner can write accurate
    ``tokens_in`` / ``tokens_out`` into ``execution_logs``.

The compiled graph carries the SOP-derived ``recursion_limit`` via
``.with_config(...)`` so the caller only has to ``ainvoke({"sop": ...})``.
"""

from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING, Annotated, Any, TypedDict

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages

from ..core.logging import get_logger
from ..llm.provider import get_worker_llm
from ..schemas.sop import SOP
from ..tools.registry import REGISTRY

if TYPE_CHECKING:
    from langchain_core.runnables import Runnable

log = get_logger(__name__)


class WorkerState(TypedDict, total=False):
    """State carried through the Worker graph."""

    sop: SOP
    plan: str
    messages: Annotated[list[Any], add_messages]
    step_count: int
    tokens_in: int
    tokens_out: int
    summary: dict[str, Any]
    error: str | None


# ---------------------------------------------------------------------------
# System prompts
# ---------------------------------------------------------------------------


def _worker_system_prompt(sop: SOP) -> str:
    tool_lines = "\n".join(
        f"- {t.tool_id}" for t in sop.tools
    ) or "- (none)"
    return (
        f"You are the execution worker for an AutoTasker agent named '{sop.name}'.\n"
        f"\n"
        f"Goal: {sop.goal}\n"
        f"\n"
        f"You may ONLY use these tools:\n{tool_lines}\n"
        f"\n"
        f"Rules:\n"
        f"- Follow the plan step by step.\n"
        f"- When you need to call a tool, use the function-call protocol.\n"
        f"- When the goal is achieved, respond in plain prose (no tool call).\n"
        f"- Never invent tool ids outside the list above.\n"
        f"- Keep reasoning concise."
    )


def _plan_prompt(sop: SOP) -> str:
    return (
        f"Write a concise numbered plan to accomplish this goal using the "
        f"allowed tools. Be specific. 3–6 steps.\n\nGoal: {sop.goal}"
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _extract_tokens(msg: Any) -> tuple[int, int]:
    """Pull (input, output) token counts from an AIMessage, if available."""
    meta = getattr(msg, "usage_metadata", None) or {}
    return int(meta.get("input_tokens", 0) or 0), int(meta.get("output_tokens", 0) or 0)


# ---------------------------------------------------------------------------
# Nodes
# ---------------------------------------------------------------------------


async def plan_node(state: WorkerState) -> WorkerState:
    """Ask the worker LLM to draft a high-level plan."""
    sop = state["sop"]
    llm = get_worker_llm()
    response = await llm.ainvoke(
        [
            SystemMessage(content=_worker_system_prompt(sop)),
            HumanMessage(content=_plan_prompt(sop)),
        ]
    )
    plan_text = response.content if isinstance(response.content, str) else str(response.content)
    tokens_in, tokens_out = _extract_tokens(response)

    log.info("worker.plan", agent=sop.name, plan_len=len(plan_text))

    return {
        "plan": plan_text,
        "messages": [
            SystemMessage(content=_worker_system_prompt(sop)),
            HumanMessage(content=f"Your plan:\n{plan_text}\n\nBegin executing."),
        ],
        "step_count": 0,
        "tokens_in": tokens_in,
        "tokens_out": tokens_out,
    }


async def decide_node(state: WorkerState) -> WorkerState:
    """Call the worker LLM with SOP-restricted bound tools."""
    sop = state["sop"]
    step_count = state.get("step_count", 0)

    if step_count >= sop.recursion_limit:
        return {
            "error": f"Recursion limit {sop.recursion_limit} exceeded.",
        }

    tool_ids = [t.tool_id for t in sop.tools]
    bound_tools = REGISTRY.as_langchain_tools(only=tool_ids)
    llm = get_worker_llm().bind_tools(bound_tools)

    response = await llm.ainvoke(state.get("messages") or [])
    tokens_in, tokens_out = _extract_tokens(response)

    return {
        "messages": [response],
        "step_count": step_count + 1,
        "tokens_in": state.get("tokens_in", 0) + tokens_in,
        "tokens_out": state.get("tokens_out", 0) + tokens_out,
    }


async def tool_call_node(state: WorkerState) -> WorkerState:
    """Dispatch every tool call from the most recent AIMessage."""
    sop = state["sop"]
    messages = state.get("messages") or []
    last = messages[-1] if messages else None
    tool_calls = getattr(last, "tool_calls", None) or []

    new_messages: list[Any] = []
    for call in tool_calls:
        tool_id = call.get("name") if isinstance(call, dict) else getattr(call, "name", None)
        args = call.get("args") if isinstance(call, dict) else getattr(call, "args", {})
        call_id = (
            call.get("id") if isinstance(call, dict) else getattr(call, "id", "")
        ) or ""

        if tool_id is None or not REGISTRY.has(tool_id):
            new_messages.append(
                ToolMessage(
                    content=f"Error: unknown tool '{tool_id}'.",
                    tool_call_id=call_id,
                )
            )
            continue

        spec = REGISTRY.get(tool_id)
        try:
            result = await asyncio.wait_for(
                spec.run(args or {}),
                timeout=sop.step_timeout_ms / 1000,
            )
            new_messages.append(
                ToolMessage(content=str(result), tool_call_id=call_id)
            )
        except TimeoutError:
            new_messages.append(
                ToolMessage(
                    content=f"Error: tool '{tool_id}' timed out after "
                    f"{sop.step_timeout_ms}ms.",
                    tool_call_id=call_id,
                )
            )
        except Exception as exc:  # noqa: BLE001 — captured into the conversation
            log.exception("worker.tool_failed", tool_id=tool_id)
            new_messages.append(
                ToolMessage(
                    content=f"Error: tool '{tool_id}' failed — {type(exc).__name__}.",
                    tool_call_id=call_id,
                )
            )

    return {"messages": new_messages}


async def summarize_node(state: WorkerState) -> WorkerState:
    """Build the final summary returned to the orchestrator."""
    messages = state.get("messages") or []
    error = state.get("error")

    # Find the last AIMessage with plain-text content for the final answer.
    final_text: str | None = None
    for msg in reversed(messages):
        if isinstance(msg, AIMessage) and not getattr(msg, "tool_calls", None):
            content = msg.content if isinstance(msg.content, str) else str(msg.content)
            if content.strip():
                final_text = content
                break

    return {
        "summary": {
            "ok": error is None,
            "answer": final_text,
            "plan": state.get("plan"),
            "step_count": state.get("step_count", 0),
            "tokens_in": state.get("tokens_in", 0),
            "tokens_out": state.get("tokens_out", 0),
            "error": error,
        }
    }


# ---------------------------------------------------------------------------
# Routing
# ---------------------------------------------------------------------------


def _route_after_decide(state: WorkerState) -> str:
    if state.get("error"):
        return "summarize"
    messages = state.get("messages") or []
    last = messages[-1] if messages else None
    tool_calls = getattr(last, "tool_calls", None) or []
    return "tool_call" if tool_calls else "summarize"


# ---------------------------------------------------------------------------
# Graph construction
# ---------------------------------------------------------------------------


def build_worker_graph(sop: SOP) -> "Runnable[dict[str, Any], dict[str, Any]]":
    """Compile a Worker graph for the given SOP.

    Returns a ``Runnable`` — specifically a ``RunnableBinding`` wrapping
    the compiled ``CompiledStateGraph``, because ``.with_config(...)``
    produces a binding. Callers only need the ``.ainvoke()`` surface.

    The SOP is passed into the initial state; callers invoke with
    ``graph.ainvoke({"sop": sop})``.
    """
    g: StateGraph = StateGraph(WorkerState)
    g.add_node("plan", plan_node)
    g.add_node("decide", decide_node)
    g.add_node("tool_call", tool_call_node)
    g.add_node("summarize", summarize_node)

    g.add_edge(START, "plan")
    g.add_edge("plan", "decide")
    g.add_conditional_edges(
        "decide",
        _route_after_decide,
        {"tool_call": "tool_call", "summarize": "summarize"},
    )
    g.add_edge("tool_call", "decide")
    g.add_edge("summarize", END)

    # The compiled graph carries the SOP-derived recursion limit so the
    # caller doesn't have to remember to pass it.
    return g.compile().with_config({"recursion_limit": sop.recursion_limit})
