"""SOP (Standard Operating Procedure) schema.

A SOP is the strict JSON document produced by the Tier-1 Meta-Agent and
consumed by the Tier-2 Worker. It must contain everything required to
deterministically compile a LangGraph instance at run time.

Design rules:
  * Pure data — no executable code, no Python objects.
  * Forward-compatible: unknown keys are *rejected* (model_config strict)
    so that the Worker never encounters undocumented fields.
  * Versioned via ``schema_version`` so we can migrate stored SOPs
    safely as the format evolves.
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

SOP_SCHEMA_VERSION: Literal["1.0"] = "1.0"


class ToolBinding(BaseModel):
    """A single tool the worker is allowed to invoke.

    The ``tool_id`` must match an entry in the Tool Registry. ``config``
    is a free-form bag of tool-specific parameters validated by the
    tool's own input schema at execution time.
    """

    model_config = ConfigDict(extra="forbid")

    tool_id: str = Field(..., description="Stable id from the Tool Registry, e.g. 'web_scraper'.")
    config: dict[str, Any] = Field(default_factory=dict)
    requires_oauth: bool = False
    oauth_provider: str | None = None


class SOPStep(BaseModel):
    """A single ordered step in the worker's plan."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(..., min_length=1, max_length=64)
    description: str = Field(..., min_length=1, max_length=500)
    tool_id: str | None = Field(
        None,
        description="If set, this step calls the named tool. If null, the step is reasoning-only.",
    )
    inputs: dict[str, Any] = Field(default_factory=dict)
    success_criteria: str | None = None


class TriggerSpec(BaseModel):
    """How the worker is invoked."""

    model_config = ConfigDict(extra="forbid")

    type: Literal["cron", "manual", "webhook"] = "manual"
    cron: str | None = Field(
        None, description="Standard 5-field cron expression. Required when type='cron'."
    )
    timezone: str = "UTC"

    @field_validator("cron")
    @classmethod
    def _validate_cron_shape(cls, v: str | None) -> str | None:
        if v is None:
            return v
        parts = v.split()
        if len(parts) != 5:
            raise ValueError("cron must be a standard 5-field expression (m h dom mon dow)")
        return v


class SOP(BaseModel):
    """The full Standard Operating Procedure document.

    This is what the Architect node emits and what gets persisted to
    ``agents.sop`` in Supabase.
    """

    model_config = ConfigDict(extra="forbid")

    schema_version: Literal["1.0"] = SOP_SCHEMA_VERSION
    name: str = Field(..., min_length=1, max_length=120)
    goal: str = Field(..., min_length=1, max_length=1000)

    tools: list[ToolBinding] = Field(default_factory=list)
    steps: list[SOPStep] = Field(..., min_length=1, max_length=50)
    trigger: TriggerSpec = Field(default_factory=TriggerSpec)

    # Hard execution ceilings honoured by the Worker graph.
    recursion_limit: int = Field(default=25, ge=1, le=200)
    step_timeout_ms: int = Field(default=30_000, ge=1_000, le=600_000)

    @field_validator("steps")
    @classmethod
    def _unique_step_ids(cls, v: list[SOPStep]) -> list[SOPStep]:
        seen: set[str] = set()
        for step in v:
            if step.id in seen:
                raise ValueError(f"duplicate step id: {step.id}")
            seen.add(step.id)
        return v

    def required_tool_ids(self) -> list[str]:
        """Return the unique tool ids referenced by this SOP."""
        ids = {b.tool_id for b in self.tools}
        ids.update(s.tool_id for s in self.steps if s.tool_id is not None)
        return sorted(ids)
