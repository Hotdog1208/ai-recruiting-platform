"""Anthropic provider. Safe fallback when key missing or on error. Install anthropic only if used."""
import logging
from .base import BaseAIProvider

logger = logging.getLogger(__name__)

FALLBACK = "AI is not configured. Please set ANTHROPIC_API_KEY to enable this feature."


class AnthropicProvider(BaseAIProvider):
    def __init__(self, api_key: str | None) -> None:
        self._api_key = (api_key or "").strip()

    @property
    def is_available(self) -> bool:
        return bool(self._api_key)

    async def complete(
        self,
        prompt: str,
        *,
        system: str | None = None,
        max_tokens: int = 1024,
    ) -> str:
        if not self.is_available:
            return FALLBACK
        try:
            from anthropic import AsyncAnthropic
            client = AsyncAnthropic(api_key=self._api_key)
            kwargs: dict = {"model": "claude-3-haiku-20240307", "max_tokens": max_tokens, "messages": [{"role": "user", "content": prompt}]}
            if system:
                kwargs["system"] = system
            resp = await client.messages.create(**kwargs)
            if resp.content and len(resp.content) > 0 and hasattr(resp.content[0], "text"):
                return resp.content[0].text.strip()
            return FALLBACK
        except ImportError:
            logger.warning("anthropic package not installed. pip install anthropic to use Anthropic provider.")
            return FALLBACK
        except Exception as e:
            logger.warning("Anthropic completion failed: %s", type(e).__name__)
            return FALLBACK
