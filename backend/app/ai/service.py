"""
Provider-agnostic AI service. Selects provider by AI_PROVIDER env (openai | anthropic).
Returns safe fallback strings when keys are missing; never crashes.
"""
from functools import lru_cache

from app.core.config import get_settings
from app.ai.providers.base import BaseAIProvider
from app.ai.providers.openai_provider import OpenAIProvider
from app.ai.providers.anthropic_provider import AnthropicProvider


def _get_provider() -> BaseAIProvider:
    settings = get_settings()
    provider_name = (settings.AI_PROVIDER or "openai").strip().lower()
    if provider_name == "anthropic":
        return AnthropicProvider(settings.ANTHROPIC_API_KEY)
    return OpenAIProvider(settings.OPENAI_API_KEY)


@lru_cache(maxsize=1)
def get_ai_provider() -> BaseAIProvider:
    return _get_provider()


async def ai_complete(
    prompt: str,
    *,
    system: str | None = None,
    max_tokens: int = 1024,
) -> str:
    """Run completion with configured provider. Safe fallback if unavailable."""
    return await get_ai_provider().complete(prompt, system=system, max_tokens=max_tokens)


def is_ai_configured() -> bool:
    """True if current AI provider has a key set."""
    return get_ai_provider().is_available
