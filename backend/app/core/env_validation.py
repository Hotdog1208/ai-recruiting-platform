"""
Validate required env values and detect placeholders. Never log or print secrets.
Raises RuntimeError with actionable messages.
"""

# Substrings that indicate DATABASE_URL is still a template (not a real URL)
DATABASE_URL_PLACEHOLDERS = (
    "user:password@host:port",
    "@host:port",
    ":port/",
    "host:port",
    "/database",
)

# Substrings that indicate SUPABASE_JWT_SECRET is still a template
JWT_SECRET_PLACEHOLDERS = (
    "your_supabase",
    "your-jwt-secret",
    "jwt_secret",
    "replace_me",
    "example",
)


def validate_database_url(url: str | None) -> str:
    """
    Validate DATABASE_URL is set and not a placeholder. Returns the URL.
    Raises RuntimeError with a clear, multi-line message if invalid.
    """
    if not url or not (url := url.strip()):
        raise RuntimeError(
            "DATABASE_URL is missing or empty.\n\n"
            "Set it in backend/.env (copy from backend/.env.example if needed).\n\n"
            "Where to get it:\n"
            "  • Supabase: Project Settings → Database → Connection string (URI).\n"
            "  • Use the URI format; port must be a number (usually 5432).\n"
            "  • If your password has special characters, URL-encode them.\n\n"
            "Example shape (no real secrets):\n"
            "  postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres\n"
            "  or postgresql://user:password@localhost:5432/mydb"
        )

    lower = url.lower()
    for placeholder in DATABASE_URL_PLACEHOLDERS:
        if placeholder in lower:
            raise RuntimeError(
                "DATABASE_URL looks like the template placeholder from .env.example.\n\n"
                "Edit backend/.env and set DATABASE_URL to your real Postgres connection string.\n\n"
                "Where to get it:\n"
                "  • Supabase: Project Settings → Database → Connection string (URI).\n"
                "  • Port must be a number (e.g. 5432), not the word 'port'.\n"
                "  • If your password contains special characters, URL-encode them (e.g. @ → %40).\n\n"
                "Example shape (no real secrets):\n"
                "  postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
            )

    if not url.startswith(("postgresql://", "postgres://")):
        raise RuntimeError(
            "DATABASE_URL must be a Postgres connection URI starting with postgresql:// or postgres://.\n\n"
            "Set the correct value in backend/.env. See .env.example for comments."
        )

    return url


def validate_supabase_jwt_secret(secret: str | None) -> str:
    """
    Validate SUPABASE_JWT_SECRET is set and not a placeholder. Returns the secret.
    Raises RuntimeError with a clear message if invalid.
    """
    if not secret or not (secret := secret.strip()):
        raise RuntimeError(
            "SUPABASE_JWT_SECRET is missing or empty.\n\n"
            "Set it in backend/.env. Get it from Supabase: Dashboard → Project Settings → API → JWT Secret.\n"
            "It is used to verify access tokens; never commit the real value."
        )

    lower = secret.lower()
    for placeholder in JWT_SECRET_PLACEHOLDERS:
        if placeholder in lower and len(secret) < 40:
            raise RuntimeError(
                "SUPABASE_JWT_SECRET looks like a placeholder.\n\n"
                "Replace it with your real JWT Secret in backend/.env.\n"
                "Get it from Supabase: Dashboard → Project Settings → API → JWT Secret (long string)."
            )

    return secret
