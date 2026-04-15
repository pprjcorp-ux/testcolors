"""Application settings loaded from environment variables.

Uses ``pydantic-settings`` so that all configuration is strictly typed and
validated at process start. The settings object is exposed as a cached
singleton via :func:`get_settings`.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "staging", "production"]
LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]


class Settings(BaseSettings):
    """Strictly-typed application settings.

    All values are loaded from environment variables (or a local ``.env``
    file in development). Missing required values raise a validation error
    at startup rather than at first use — fail fast.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- Runtime ---------------------------------------------------------
    environment: Environment = "development"
    log_level: LogLevel = "INFO"
    host: str = "0.0.0.0"
    port: int = 8000
    allowed_origins: str = "http://localhost:3000"

    # --- LLM providers ---------------------------------------------------
    anthropic_api_key: SecretStr | None = None
    openai_api_key: SecretStr | None = None
    meta_agent_model: str = "claude-opus-4-6"
    worker_model: str = "claude-haiku-4-5-20251001"

    # --- Supabase --------------------------------------------------------
    supabase_url: str = ""
    supabase_anon_key: SecretStr | None = None
    supabase_service_role_key: SecretStr | None = None

    # --- Postgres (LangGraph checkpointer) -------------------------------
    database_url: str = "postgresql://postgres:postgres@localhost:54322/postgres"

    # --- Inngest ---------------------------------------------------------
    inngest_event_key: SecretStr | None = None
    inngest_signing_key: SecretStr | None = None
    inngest_dev: bool = True

    # --- Browserbase -----------------------------------------------------
    browserbase_api_key: SecretStr | None = None
    browserbase_project_id: str | None = None

    # --- Derived ---------------------------------------------------------
    @property
    def cors_origins(self) -> list[str]:
        """Comma-separated origin list parsed into a Python list."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    # --- Convenience -----------------------------------------------------
    def require_anthropic_key(self) -> str:
        if self.anthropic_api_key is None:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is required for the Meta-Agent. Set it in your .env file."
            )
        return self.anthropic_api_key.get_secret_value()

    def require_supabase_service_key(self) -> str:
        if self.supabase_service_role_key is None:
            raise RuntimeError(
                "SUPABASE_SERVICE_ROLE_KEY is required for backend writes. Set it in your .env file."
            )
        return self.supabase_service_role_key.get_secret_value()


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the cached :class:`Settings` singleton."""
    return Settings()
