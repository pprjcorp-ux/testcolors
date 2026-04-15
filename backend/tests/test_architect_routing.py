"""Tests for the Architect graph's routing logic.

These tests cover the pure routing function — the LLM-calling nodes
are exercised by integration tests under a separate marker so that
this file can run without any API keys.
"""

from __future__ import annotations

from autotasker_backend.graphs.architect import _route_after_feasibility
from autotasker_backend.graphs.state import FeasibilityReport


def _state(feasible: bool | None) -> dict:
    if feasible is None:
        return {"feasibility": None}
    return {
        "feasibility": FeasibilityReport(
            feasible=feasible,
            reason="test",
            matched_tool_ids=["mock_email"] if feasible else [],
        )
    }


def test_routes_to_architect_when_feasible():
    assert _route_after_feasibility(_state(True)) == "architect"  # type: ignore[arg-type]


def test_routes_to_reject_when_infeasible():
    assert _route_after_feasibility(_state(False)) == "reject"  # type: ignore[arg-type]


def test_routes_to_reject_when_feasibility_missing():
    """Defensive: a state with no feasibility report should not crash the graph."""
    assert _route_after_feasibility(_state(None)) == "reject"  # type: ignore[arg-type]
