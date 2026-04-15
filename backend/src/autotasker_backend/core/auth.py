"""Supabase JWT authentication dependency.

Every protected FastAPI route adds ``Depends(get_current_user_id)``.
The dependency extracts the bearer token, validates it against
Supabase Auth using the anon client, and returns the caller's UUID.

Failures surface as :class:`HTTPException` with status 401, 403, or
503 so the frontend can react sensibly.
"""

from __future__ import annotations

from functools import lru_cache
from uuid import UUID

from fastapi import Header, HTTPException, status
from supabase import Client, create_client

from .config import get_settings
from .logging import get_logger

log = get_logger(__name__)


@lru_cache(maxsize=1)
def _anon_client() -> Client:
    """Return a Supabase client that uses the anon key for JWT verification.

    We use the anon key (not the service-role key) so that a user's
    JWT still gets checked against Supabase's own auth service. The
    service-role client is only used once the user's identity has
    been established, inside repository write paths.
    """
    settings = get_settings()
    if not settings.supabase_url or settings.supabase_anon_key is None:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_ANON_KEY must be configured for auth."
        )
    return create_client(
        settings.supabase_url, settings.supabase_anon_key.get_secret_value()
    )


def _extract_bearer(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return parts[1]


async def get_current_user_id(
    authorization: str | None = Header(default=None),
) -> UUID:
    """FastAPI dependency returning the authenticated user's UUID.

    Raises 401 on any validation failure. The exception body is
    deliberately terse — no leaking whether the token was malformed
    vs. expired vs. revoked.
    """
    token = _extract_bearer(authorization)

    try:
        client = _anon_client()
        response = client.auth.get_user(token)
    except Exception:  # noqa: BLE001 — sanitised for client
        log.exception("auth.verify_failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth provider is unavailable.",
        ) from None

    user = getattr(response, "user", None)
    if user is None or not getattr(user, "id", None):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        return UUID(str(user.id))
    except (TypeError, ValueError) as exc:
        log.error("auth.non_uuid_sub", sub=str(user.id))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject.",
        ) from exc


def require_inngest_secret(
    x_inngest_signature: str | None = Header(default=None),
) -> None:
    """Shared-secret gate for the Inngest webhook.

    Phase-2 minimal version: checks that the header matches the
    configured ``INNGEST_SIGNING_KEY``. Phase-2b will upgrade this
    to Inngest's HMAC signature scheme.
    """
    settings = get_settings()
    if settings.inngest_signing_key is None:
        # Dev mode: no key configured → accept all, but log a warning.
        log.warning("inngest.signing_key_missing")
        return
    expected = settings.inngest_signing_key.get_secret_value()
    if x_inngest_signature != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Inngest signature.",
        )
