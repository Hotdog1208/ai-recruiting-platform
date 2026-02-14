"""OpenAI provider. Safe fallback when key missing or on error."""
import logging
from .base import BaseAIProvider

logger = logging.getLogger(__name__)

FALLBACK = "AI is not configured. Please set OPENAI_API_KEY to enable this feature."


class OpenAIProvider(BaseAIProvider):
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
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self._api_key)
            messages = []
            if system:
                messages.append({"role": "system", "content": system})
            messages.append({"role": "user", "content": prompt})
            resp = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=max_tokens,
            )
            if resp.choices and resp.choices[0].message.content:
                return resp.choices[0].message.content.strip()
            return FALLBACK
        except Exception as e:
            logger.warning("OpenAI completion failed: %s", type(e).__name__)
            return FALLBACK
