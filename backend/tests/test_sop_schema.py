"""Smoke tests for the SOP schema and Tool Registry."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from autotasker_backend.schemas.sop import SOP, SOPStep, ToolBinding, TriggerSpec
from autotasker_backend.tools import REGISTRY  # noqa: F401  registers built-ins


def _make_sop(**overrides):
    base = {
        "name": "Daily HN scrape",
        "goal": "Scrape Hacker News front page and email me the top 5 posts.",
        "tools": [{"tool_id": "web_scraper"}, {"tool_id": "mock_email"}],
        "steps": [
            {"id": "fetch", "description": "Fetch HN front page", "tool_id": "web_scraper",
             "inputs": {"url": "https://news.ycombinator.com/"}},
            {"id": "email", "description": "Send digest", "tool_id": "mock_email",
             "inputs": {"to": "me@example.com", "subject": "HN digest", "body": "..."}},
        ],
        "trigger": {"type": "cron", "cron": "0 9 * * *"},
    }
    base.update(overrides)
    return SOP.model_validate(base)


def test_sop_round_trip():
    sop = _make_sop()
    assert sop.required_tool_ids() == ["mock_email", "web_scraper"]
    assert sop.trigger.cron == "0 9 * * *"


def test_sop_rejects_duplicate_step_ids():
    with pytest.raises(ValidationError):
        _make_sop(steps=[
            {"id": "x", "description": "a"},
            {"id": "x", "description": "b"},
        ])


def test_sop_rejects_extra_fields():
    with pytest.raises(ValidationError):
        SOP.model_validate({
            "schema_version": "1.0",
            "name": "x", "goal": "y",
            "steps": [{"id": "a", "description": "a"}],
            "extra_field_that_shouldnt_exist": True,
        })


def test_trigger_validates_cron_shape():
    with pytest.raises(ValidationError):
        TriggerSpec.model_validate({"type": "cron", "cron": "* * *"})


def test_registry_has_builtin_tools():
    assert REGISTRY.has("web_scraper")
    assert REGISTRY.has("mock_email")
    manifest = REGISTRY.manifest()
    assert {t["id"] for t in manifest} >= {"web_scraper", "mock_email"}
