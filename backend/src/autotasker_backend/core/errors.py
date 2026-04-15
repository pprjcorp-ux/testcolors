"""Client-safe error mapping.

Converts internal exceptions into short strings that are safe to show
to end users. Known exception classes get a specific message; anything
else falls back to a generic message with a trace id the user can
quote in a support request.
"""

from __future__ import annotations

from uuid import uuid4

from .logging import get_logger

log = get_logger(__name__)

# Exception class name → stable user-facing message.
_KNOWN_ERRORS: dict[str, str] = {
    "ValidationError": "The request payload was rejected as invalid.",
    "TimeoutError": "A backend operation timed out.",
    "ConnectionError": "Could not reach an upstream service.",
    "HTTPError": "An upstream HTTP call failed.",
    "APIError": "The LLM provider returned an error.",
    "AuthenticationError": "Auth provider rejected the credentials.",
    "RateLimitError": "The LLM provider rate-limited us. Please retry.",
}


def client_safe_error(exc: BaseException) -> str:
    """Return a client-facing message + log the real error with a trace id."""
    trace_id = uuid4().hex[:12]
    log.error("error.mapped", trace_id=trace_id, exc_type=type(exc).__name__, detail=str(exc))
    known = _KNOWN_ERRORS.get(type(exc).__name__)
    if known is not None:
        return f"{known} (trace {trace_id})"
    return f"Internal error. Quote trace id {trace_id} when reporting."
