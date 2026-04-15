"""Tool Registry — declarative catalogue of platform capabilities.

A :class:`ToolSpec` is a pure description of what a tool can do, what
inputs it requires, and how to execute it. The registry is consulted
by:

  1. The Feasibility Gate (Tier 1) — to determine if a user request
     can be satisfied at all.
  2. The Architect node (Tier 1) — to know which tool ids are valid
     when emitting an SOP.
  3. The Worker graph (Tier 2) — to look up the runtime handler at
     execution time and expose tools to ``bind_tools(...)``.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import Any

from langchain_core.tools import StructuredTool
from pydantic import BaseModel
from tenacity import (
    AsyncRetrying,
    RetryError,
    stop_after_attempt,
    wait_exponential,
)

from ..core.logging import get_logger

log = get_logger(__name__)

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
    max_retries: int = 2

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
            "max_retries": self.max_retries,
        }

    async def run(self, raw_inputs: dict[str, Any]) -> dict[str, Any]:
        """Execute the handler with exponential-backoff retries.

        ``max_retries`` is the number of *additional* attempts after
        the first call, so a tool with ``max_retries=2`` will try up
        to 3 times total. Backoff is ``2s → 4s`` capped at 10s.
        """
        attempts = self.max_retries + 1
        try:
            async for attempt in AsyncRetrying(
                stop=stop_after_attempt(attempts),
                wait=wait_exponential(multiplier=1, min=2, max=10),
                reraise=True,
            ):
                with attempt:
                    log.info(
                        "tool.run",
                        tool_id=self.id,
                        attempt=attempt.retry_state.attempt_number,
                    )
                    return await self.handler(raw_inputs)
        except RetryError as exc:  # pragma: no cover — reraise=True covers this
            raise exc.last_attempt.exception() or exc
        # Unreachable: AsyncRetrying always either returns or raises.
        raise RuntimeError(f"Tool {self.id!r} exhausted retries without a result.")

    def as_langchain_tool(self) -> StructuredTool:
        """Expose this spec as a LangChain ``StructuredTool``.

        Used by the Worker graph's ``bind_tools(...)`` call so the
        worker LLM can invoke tools through the standard LangChain
        tool-calling protocol.
        """
        handler = self.run
        schema = self.input_schema

        async def _coro(**kwargs: Any) -> dict[str, Any]:
            return await handler(kwargs)

        return StructuredTool.from_function(
            coroutine=_coro,
            name=self.id,
            description=self.description,
            args_schema=schema,
        )


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

    def as_langchain_tools(self, *, only: list[str] | None = None) -> list[StructuredTool]:
        """Return LangChain tools for ``bind_tools(...)``.

        ``only`` restricts the set to a subset of tool ids (typically
        the ids declared in a single SOP) so the worker LLM can't be
        tempted to call capabilities outside its designated scope.
        """
        specs = self._tools.values() if only is None else (self._tools[t] for t in only if t in self._tools)
        return [s.as_langchain_tool() for s in specs]


# Module-level singleton. Tool modules import this and call ``REGISTRY.register``.
REGISTRY = ToolRegistry()
