"""
OpenRouter API integration.
Implements the AIProvider interface using httpx for async, non-blocking requests.
"""
import asyncio
import logging

import httpx

from app.core.config import settings
from app.services.ai.provider import AIProvider, AIProviderError

logger = logging.getLogger(__name__)


class OpenRouterProvider(AIProvider):
    """
    Concrete provider for OpenRouter API.
    """

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or settings.OPENROUTER_API_KEY
        self.model = model or settings.OPENROUTER_MODEL
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://o2geeks.com",  # Required by OpenRouter
            "X-Title": "O2geeks Headless CMS",
            "Content-Type": "application/json",
        }
        self.timeout = httpx.Timeout(60.0)

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """
        Generates content from OpenRouter, with 1 automatic retry on transient errors.
        """
        if not self.api_key:
            raise AIProviderError("OPENROUTER_API_KEY is not configured.", status_code=503)

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
        }

        # Attempt 1
        try:
            return await self._make_request(payload)
        except AIProviderError as e:
            if e.retryable:
                logger.warning(f"OpenRouter transient error ({e.status_code}), retrying in 2s...")
                await asyncio.sleep(2)
                # Attempt 2
                try:
                    return await self._make_request(payload)
                except AIProviderError as retry_e:
                    logger.error(f"OpenRouter retry failed: {retry_e}")
                    raise retry_e
            else:
                raise e

    async def _make_request(self, payload: dict) -> str:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(self.base_url, headers=self.headers, json=payload)
                
                if response.status_code != 200:
                    retryable = response.status_code in {429, 500, 502, 503}
                    raise AIProviderError(
                        f"OpenRouter error: {response.text}",
                        status_code=response.status_code,
                        retryable=retryable,
                    )
                
                data = response.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content")
                if not content:
                    raise AIProviderError("Malformed response from OpenRouter: missing content.")
                
                return content
                
        except httpx.RequestError as e:
            raise AIProviderError(f"OpenRouter network error: {str(e)}", retryable=True)
