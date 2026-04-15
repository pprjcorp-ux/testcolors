"""Tool registry and built-in tool implementations.

The registry is the **single source of truth** for what the platform
can do. The Feasibility Gate consults it before the Meta-Agent commits
to designing a workflow.
"""

from .mock_email import MOCK_EMAIL_TOOL
from .registry import REGISTRY, ToolRegistry, ToolSpec
from .web_scraper import WEB_SCRAPER_TOOL

__all__ = ["MOCK_EMAIL_TOOL", "REGISTRY", "ToolRegistry", "ToolSpec", "WEB_SCRAPER_TOOL"]
