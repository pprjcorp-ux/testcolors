"""Tool Registry — declarative catalogue of platform capabilities.

A :class:`ToolSpec` is a pure description of what a tool can do, what
inputs it requires, and how to execute it. The registry is consulted
by:

  1. The Feasibility Gate (Tier 1) — to determine if a user request
     can be satisfied at all.
  2. The Architect node (Tier 1) — to know which tool ids are valid
     when emitting an SOP.
  3. The Worker graph (Tier 2) — to look up the runtime handler at
     execution time.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import Any

from pydantic import BaseModel

# A tool handler receives validated inputs and returns a JSON-serialisable result.
ToolHandler = Callable[[dict[str, Any]], Awaitable[dict[str, Any]]]


@dataclass(frozen=True)
class ToolSpec:
    """Declarative description of a single tool."""

    id: str
    name: str
    description: str
    input_schema: type[BaseModel]
    handler: ToolHandler
    requires_oauth: bool = False
    oauth_provider: str | None = None
    tags: tuple[str, ...] = field(default_factory=tuple)

    def manifest(self) -> dict[str, Any]:
        """Return the JSON manifest exposed to the Meta-Agent."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "input_schema": self.input_schema.model_json_schema(),
            "requires_oauth": self.requires_oauth,
            "oauth_provider": self.oauth_provider,
            "tags": list(self.tags),
        }


class ToolRegistry:
    """Append-only registry of tools.

    Tools register themselves at import time via :meth:`register`. The
    registry is intentionally *not* dynamic per-request — capabilities
    are a deployment-time concern.
    """

    def __init__(self) -> None:
        self._tools: dict[str, ToolSpec] = {}

    def register(self, spec: ToolSpec) -> ToolSpec:
        if spec.id in self._tools:
            raise ValueError(f"Tool already registered: {spec.id!r}")
        self._tools[spec.id] = spec
        return spec

    def get(self, tool_id: str) -> ToolSpec:
        try:
            return self._tools[tool_id]
        except KeyError as exc:
            raise KeyError(f"Unknown tool: {tool_id!r}") from exc

    def has(self, tool_id: str) -> bool:
        return tool_id in self._tools

    def all(self) -> list[ToolSpec]:
        return list(self._tools.values())

    def manifest(self) -> list[dict[str, Any]]:
        """All tool manifests — embedded into the Meta-Agent system prompt."""
        return [t.manifest() for t in self._tools.values()]


# Module-level singleton. Tool modules import this and call ``REGISTRY.register``.
REGISTRY = ToolRegistry()
