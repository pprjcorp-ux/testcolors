"""Tests for the Tool Registry."""

from __future__ import annotations

from typing import Any

import pytest
from pydantic import BaseModel

from autotasker_backend.tools import REGISTRY  # noqa: F401  registers built-ins
from autotasker_backend.tools.registry import ToolRegistry, ToolSpec


class _DummyInput(BaseModel):
    x: int


async def _dummy_handler(raw: dict[str, Any]) -> dict[str, Any]:
    return {"echoed": raw.get("x")}


def _spec(tool_id: str = "dummy") -> ToolSpec:
    return ToolSpec(
        id=tool_id,
        name="Dummy",
        description="A test tool.",
        input_schema=_DummyInput,
        handler=_dummy_handler,
    )


def test_register_and_get():
    reg = ToolRegistry()
    reg.register(_spec())
    assert reg.has("dummy")
    assert reg.get("dummy").id == "dummy"


def test_register_duplicate_raises():
    reg = ToolRegistry()
    reg.register(_spec())
    with pytest.raises(ValueError, match="already registered"):
        reg.register(_spec())


def test_get_unknown_raises():
    reg = ToolRegistry()
    with pytest.raises(KeyError, match="Unknown tool"):
        reg.get("nonexistent")


def test_manifest_shape():
    reg = ToolRegistry()
    reg.register(_spec())
    manifest = reg.manifest()
    assert len(manifest) == 1
    entry = manifest[0]
    assert entry["id"] == "dummy"
    assert entry["name"] == "Dummy"
    assert "input_schema" in entry
    assert entry["requires_oauth"] is False


def test_builtin_tools_registered():
    """The module-level REGISTRY should be pre-populated at import time."""
    assert REGISTRY.has("web_scraper")
    assert REGISTRY.has("mock_email")
    ids = {t["id"] for t in REGISTRY.manifest()}
    assert {"web_scraper", "mock_email"}.issubset(ids)
