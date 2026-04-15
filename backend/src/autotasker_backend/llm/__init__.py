"""LLM provider abstraction.

Both the Meta-Agent and the Worker get their chat models through
:func:`get_meta_agent_llm` / :func:`get_worker_llm` so that swapping
providers (Anthropic ⇄ OpenAI) is a one-line change.
"""

from .provider import get_meta_agent_llm, get_worker_llm

__all__ = ["get_meta_agent_llm", "get_worker_llm"]
