"""WebScraperTool — fetches a URL and returns extracted text.

This is a deliberately minimal *mock-grade* implementation that proves
the end-to-end flow without pulling in headless browser machinery. The
production version will swap the body for a Browserbase / Stagehand
session.
"""

from __future__ import annotations

import re
from typing import Any

import httpx
from pydantic import BaseModel, Field, HttpUrl

from .registry import REGISTRY, ToolSpec

_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")
_MAX_CHARS = 8_000


class WebScraperInput(BaseModel):
    """Inputs accepted by the web scraper."""

    url: HttpUrl = Field(..., description="Absolute URL to fetch.")
    selector_hint: str | None = Field(
        None,
        description="Optional CSS-like hint for the production browser tool. Ignored here.",
    )
    max_chars: int = Field(default=_MAX_CHARS, ge=100, le=50_000)


def _strip_html(html: str) -> str:
    text = _TAG_RE.sub(" ", html)
    return _WS_RE.sub(" ", text).strip()


async def _handler(raw_inputs: dict[str, Any]) -> dict[str, Any]:
    inputs = WebScraperInput.model_validate(raw_inputs)
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(str(inputs.url))
        response.raise_for_status()
        text = _strip_html(response.text)[: inputs.max_chars]
        return {
            "url": str(inputs.url),
            "status_code": response.status_code,
            "content_type": response.headers.get("content-type", ""),
            "text": text,
            "char_count": len(text),
        }


WEB_SCRAPER_TOOL = REGISTRY.register(
    ToolSpec(
        id="web_scraper",
        name="Web Scraper",
        description=(
            "Fetches a public URL and returns the extracted plain-text content. "
            "Use this when the task requires reading data from a website that does "
            "not require login."
        ),
        input_schema=WebScraperInput,
        handler=_handler,
        requires_oauth=False,
        tags=("web", "read"),
    )
)
