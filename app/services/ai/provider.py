"""
Abstract AI Provider interface.

All AI providers (OpenRouter, OpenAI, Claude, Gemini, local LLM)
implement this interface. The service layer depends only on this
abstraction — swapping providers requires zero frontend changes.
"""
from abc import ABC, abstractmethod


class AIProvider(ABC):
    """Base class for AI content generation providers."""

    @abstractmethod
    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """
        Send a prompt pair to the AI model and return the raw text response.

        Args:
            system_prompt: Instructions for the AI (role, output format).
            user_prompt: The user's content generation request.

        Returns:
            Raw string response from the model.

        Raises:
            AIProviderError: On network failure, timeout, or provider error.
        """
        ...


class AIProviderError(Exception):
    """Raised when an AI provider call fails."""

    def __init__(self, message: str, status_code: int | None = None, retryable: bool = False):
        super().__init__(message)
        self.status_code = status_code
        self.retryable = retryable
