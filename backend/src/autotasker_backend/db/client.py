"""Supabase client factories.

We expose two clients:

* ``get_supabase_admin`` — uses the **service role** key. Bypasses RLS.
  Only the backend should ever instantiate this. Never expose it to the
  browser.
* ``get_supabase_user`` — uses the **anon** key with a user JWT. Honours
  RLS. Used when the backend needs to act *as* the authenticated user
  (e.g. when proxying a read on their behalf).
"""

from __future__ import annotations

from functools import lru_cache

from supabase import Client, create_client

from ..core.config import get_settings


@lru_cache(maxsize=1)
def get_supabase_admin() -> Client:
    """Return a service-role Supabase client (RLS bypassed)."""
    settings = get_settings()
    if not settings.supabase_url:
        raise RuntimeError("SUPABASE_URL is not configured.")
    return create_client(settings.supabase_url, settings.require_supabase_service_key())


def get_supabase_user(jwt: str) -> Client:
    """Return a Supabase client that acts as the user identified by ``jwt``."""
    settings = get_settings()
    if not settings.supabase_url or settings.supabase_anon_key is None:
        raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be configured.")

    client = create_client(settings.supabase_url, settings.supabase_anon_key.get_secret_value())
    client.postgrest.auth(jwt)
    return client
