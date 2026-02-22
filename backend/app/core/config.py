"""
Application config via Pydantic Settings. Fail-fast with clear errors if required vars missing.
Never log or print secret values.
Loads backend/.env by path so running from repo root or backend/ both work.
"""
import os
from functools import lru_cache
from pydantic import Field
  # type: ignore  # pyre-ignore\nfrom pydantic_settings import BaseSettings, SettingsConfigDict
  # type: ignore  # pyre-ignore\nfrom dotenv import load_dotenv
  # type: ignore  # pyre-ignore\n
from app.core.env_validation import validate_database_url, validate_supabase_jwt_secret
  # type: ignore  # pyre-ignore\n
# Resolve backend/.env so uvicorn works from repo root or backend/ (and with --reload subprocess)
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_ENV_FILE = os.path.join(_BACKEND_DIR, ".env")

# Load into os.environ first so Pydantic and any subprocess see the vars
load_dotenv(_ENV_FILE, override=False)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Required for app to run
    DATABASE_URL: str = Field(..., min_length=1, description="Postgres connection URL")
    SUPABASE_JWT_SECRET: str = Field(..., min_length=1, description="Supabase JWT secret for verification")

    # CORS
    FRONTEND_ORIGIN: str = Field(default="http://localhost:3000,http://127.0.0.1:3000", description="Allowed frontend origin(s), comma-separated")

    # Optional (AI, billing, jobs)
    AI_PROVIDER: str = Field(default="openai", description="AI provider: openai | anthropic")
    OPENAI_API_KEY: str | None = Field(default=None, description="OpenAI API key for resume/matching")
    OPENAI_EMBEDDING_MODEL: str = Field(default="text-embedding-3-small", description="Model for matching embeddings")
    ANTHROPIC_API_KEY: str | None = Field(default=None, description="Anthropic API key (when AI_PROVIDER=anthropic)")
    STRIPE_SECRET_KEY: str | None = Field(default=None, description="Stripe secret key")
    STRIPE_WEBHOOK_SECRET: str | None = Field(default=None, description="Stripe webhook signing secret")
    RAPIDAPI_KEY: str | None = Field(default=None)
    ADZUNA_APP_ID: str | None = Field(default=None)
    ADZUNA_APP_KEY: str | None = Field(default=None)

    @property
    def frontend_origins(self) -> list[str]:
        return [o.strip() for o in self.FRONTEND_ORIGIN.split(",") if o.strip()]

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    @property
    def frontend_base_url(self) -> str:
        """First allowed origin, used for Stripe redirects and similar. Defaults to localhost if unset."""
        origins = self.frontend_origins
        return origins[0] if origins else "http://localhost:3000"

    def mask_secret(self, value: str | None) -> str:
        if not value or len(value) < 8:
            return "***"
        return value[:4] + "..." + value[-2:]
  # type: ignore  # pyre-ignore\n

@lru_cache
def get_settings() -> Settings:
    try:
        s = Settings()
        validate_database_url(s.DATABASE_URL)
        validate_supabase_jwt_secret(s.SUPABASE_JWT_SECRET)
        return s
    except RuntimeError:
        raise
    except Exception as e:
        msg = str(e)
        if "DATABASE_URL" in msg:
            raise RuntimeError(
                "Missing or invalid DATABASE_URL. Set it in backend/.env (see .env.example)."
            ) from e
        if "SUPABASE_JWT_SECRET" in msg:
            raise RuntimeError(
                "Missing or invalid SUPABASE_JWT_SECRET. Set it in backend/.env (see .env.example)."
            ) from e
        raise RuntimeError(f"Invalid configuration: {msg}") from e
