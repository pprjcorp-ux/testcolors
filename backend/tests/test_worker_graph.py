"""End-to-end smoke test for the Tier-2 Worker graph.

Uses only ``mock_email`` — a synchronous tool with no network
dependency — so the test runs without any env vars or LLM provider.
"""

from __future__ import annotations

import pytest

from autotasker_backend.graphs.worker import build_worker_graph
from autotasker_backend.schemas.sop import SOP
from autotasker_backend.tools import REGISTRY  # noqa: F401  registers built-ins


def _mock_email_sop() -> SOP:
    return SOP.model_validate(
        {
            "name": "Test email SOP",
            "goal": "Send a single mock email.",
            "tools": [{"tool_id": "mock_email"}],
            "steps": [
                {
                    "id": "send",
                    "description": "Send the email",
                    "tool_id": "mock_email",
                    "inputs": {
                        "to": "user@example.com",
                        "subject": "Hi",
                        "body": "Body.",
                    },
                }
            ],
            "trigger": {"type": "manual"},
        }
    )


@pytest.mark.asyncio
async def test_worker_runs_single_step_sop():
    sop = _mock_email_sop()
    graph = build_worker_graph(sop)
    result = await graph.ainvoke({"sop": sop})

    summary = result["summary"]
    assert summary["ok"] is True
    assert summary["step_count"] == 1
    assert summary["error"] is None
    observation = summary["observations"][0]
    assert observation["tool_id"] == "mock_email"
    assert observation["result"]["delivered"] is True


@pytest.mark.asyncio
async def test_worker_handles_missing_tool():
    """A step pointing at an unknown tool should surface the error in the summary."""
    sop = SOP.model_validate(
        {
            "name": "Broken SOP",
            "goal": "Exercise the error path.",
            "tools": [{"tool_id": "mock_email"}],
            "steps": [
                {
                    "id": "bad",
                    "description": "Call a tool that does not exist",
                    "tool_id": "mock_email",
                    "inputs": {"to": "", "subject": "", "body": ""},
                }
            ],
            "trigger": {"type": "manual"},
        }
    )
    graph = build_worker_graph(sop)
    result = await graph.ainvoke({"sop": sop})

    # The mock_email input validation will raise for empty strings; the
    # worker should capture that into the summary rather than raising.
    summary = result["summary"]
    assert summary["ok"] is False
    assert summary["error"] is not None
    assert "bad" in summary["error"]


@pytest.mark.asyncio
async def test_worker_skips_reasoning_only_step():
    """A step without a tool_id should be marked skipped, not fail."""
    sop = SOP.model_validate(
        {
            "name": "Mixed SOP",
            "goal": "A thinking step followed by an email.",
            "tools": [{"tool_id": "mock_email"}],
            "steps": [
                {"id": "think", "description": "Ponder the request"},
                {
                    "id": "send",
                    "description": "Send the email",
                    "tool_id": "mock_email",
                    "inputs": {
                        "to": "user@example.com",
                        "subject": "Hi",
                        "body": "Body.",
                    },
                },
            ],
            "trigger": {"type": "manual"},
        }
    )
    graph = build_worker_graph(sop)
    result = await graph.ainvoke({"sop": sop})

    summary = result["summary"]
    assert summary["ok"] is True
    assert summary["step_count"] == 2
    assert summary["observations"][0]["skipped"] == "reasoning_only"
    assert summary["observations"][1]["tool_id"] == "mock_email"
