"""
Base interface for AI providers. All providers must implement this.
"""
from abc import ABC, abstractmethod


class BaseAIProvider(ABC):
    """Interface for chat/completion providers (OpenAI, Anthropic, etc.)."""

    @property
    @abstractmethod
    def is_available(self) -> bool:
        """True if the provider is configured and can be used."""
        ...

    @abstractmethod
    async def complete(
        self,
        prompt: str,
        *,
        system: str | None = None,
        max_tokens: int = 1024,
    ) -> str:
        """
        Run a completion. Returns a safe fallback string if unavailable or on error.
        Never raises; never logs secrets.
        """
        ...
