"""Chat-model factories.

We deliberately type the return as :class:`BaseChatModel` so that any
LangChain-compatible model can be substituted without touching the
graph code. Selection is driven by the model id prefix:

* ``claude-*``  → :class:`ChatAnthropic`
* anything else → :class:`ChatOpenAI`
"""

from __future__ import annotations

from langchain_anthropic import ChatAnthropic
from langchain_core.language_models import BaseChatModel
from langchain_openai import ChatOpenAI

from ..core.config import get_settings


def _build(model_id: str, *, temperature: float, max_tokens: int) -> BaseChatModel:
    settings = get_settings()
    if model_id.startswith("claude"):
        return ChatAnthropic(
            model=model_id,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=settings.require_anthropic_key(),
            timeout=60.0,
        )
    if settings.openai_api_key is None:
        raise RuntimeError(
            f"Model {model_id!r} requires OPENAI_API_KEY but it is not configured."
        )
    return ChatOpenAI(
        model=model_id,
        temperature=temperature,
        max_tokens=max_tokens,
        api_key=settings.openai_api_key.get_secret_value(),
        timeout=60.0,
    )


def get_meta_agent_llm() -> BaseChatModel:
    """Chat model for the Tier-1 Meta-Agent. High capability, low temp."""
    settings = get_settings()
    return _build(settings.meta_agent_model, temperature=0.1, max_tokens=4096)


def get_worker_llm() -> BaseChatModel:
    """Chat model for the Tier-2 Worker. Cheaper / faster."""
    settings = get_settings()
    return _build(settings.worker_model, temperature=0.0, max_tokens=2048)
