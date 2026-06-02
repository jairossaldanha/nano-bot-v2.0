import pytest
import dataclasses
from typing import Any
from nanobot.providers.base import LLMProvider, LLMResponse
from nanobot.providers.fallback_provider import FallbackProvider


class DummyProvider(LLMProvider):
    def __init__(self, name: str, response_to_return: LLMResponse, raise_exception: Exception | None = None):
        super().__init__(api_key=name, api_base="http://dummy")
        self.name = name
        self.response_to_return = response_to_return
        self.raise_exception = raise_exception
        self.calls = []

    def get_default_model(self) -> str:
        return f"{self.name}/model"

    async def chat(self, messages, tools=None, model=None, **kwargs) -> LLMResponse:
        self.calls.append(("chat", messages, model))
        if self.raise_exception:
            raise self.raise_exception
        return dataclasses.replace(self.response_to_return)

    async def chat_stream(self, messages, tools=None, model=None, on_content_delta=None, **kwargs) -> LLMResponse:
        self.calls.append(("chat_stream", messages, model))
        if self.raise_exception:
            raise self.raise_exception
        if on_content_delta and self.response_to_return.content and self.response_to_return.finish_reason != "error":
            # Simulate streaming only for non-error responses
            await on_content_delta(self.response_to_return.content)
        return dataclasses.replace(self.response_to_return)


@pytest.mark.asyncio
async def test_fallback_provider_success_no_fallback() -> None:
    primary_response = LLMResponse(content="Primary content", finish_reason="stop")
    fallback_response = LLMResponse(content="Fallback content", finish_reason="stop")

    primary = DummyProvider("primary", primary_response)
    fallback = DummyProvider("fallback", fallback_response)

    provider = FallbackProvider(primary, fallback, "fallback/model")

    response = await provider.chat(messages=[{"role": "user", "content": "hi"}])

    assert response.content == "Primary content"
    assert len(primary.calls) == 1
    assert len(fallback.calls) == 0
    assert provider.use_fallback is False


@pytest.mark.asyncio
async def test_fallback_provider_chat_error_trigger() -> None:
    primary_response = LLMResponse(content="Error calling primary", finish_reason="error")
    fallback_response = LLMResponse(content="Fallback content", finish_reason="stop")

    primary = DummyProvider("primary", primary_response)
    fallback = DummyProvider("fallback", fallback_response)

    provider = FallbackProvider(primary, fallback, "fallback/model")

    response = await provider.chat(messages=[{"role": "user", "content": "hi"}])

    # Should contain the warning prefix
    assert "⚠️ *[Codex instável/deslogado. Utilizando fallback via OpenRouter...]*" in response.content
    assert "Fallback content" in response.content
    assert len(primary.calls) == 1
    assert len(fallback.calls) == 1
    assert provider.use_fallback is True

    # Subsequent call should go directly to fallback
    response2 = await provider.chat(messages=[{"role": "user", "content": "hello again"}])
    assert response2.content == "Fallback content"  # No warning prefix on subsequent calls
    assert len(primary.calls) == 1  # Still 1
    assert len(fallback.calls) == 2


@pytest.mark.asyncio
async def test_fallback_provider_chat_stream_error_trigger() -> None:
    primary_response = LLMResponse(content="Error calling primary", finish_reason="error")
    fallback_response = LLMResponse(content="Fallback content", finish_reason="stop")

    primary = DummyProvider("primary", primary_response)
    fallback = DummyProvider("fallback", fallback_response)

    provider = FallbackProvider(primary, fallback, "fallback/model")

    streamed_deltas = []

    async def collect_delta(delta: str) -> None:
        streamed_deltas.append(delta)

    response = await provider.chat_stream(
        messages=[{"role": "user", "content": "hi"}],
        on_content_delta=collect_delta,
    )

    # In streaming error, delta warning should be sent, followed by fallback content
    assert "⚠️ *[Codex instável/deslogado. Utilizando fallback via OpenRouter...]*\n\n" in streamed_deltas
    assert "Fallback content" in streamed_deltas
    assert "⚠️ *[Codex instável/deslogado. Utilizando fallback via OpenRouter...]*" in response.content
    assert "Fallback content" in response.content
    assert len(primary.calls) == 1
    assert len(fallback.calls) == 1
    assert provider.use_fallback is True


@pytest.mark.asyncio
async def test_fallback_provider_chat_stream_exception_trigger() -> None:
    primary = DummyProvider("primary", LLMResponse(content=""), raise_exception=ValueError("API down"))
    fallback_response = LLMResponse(content="Fallback content", finish_reason="stop")
    fallback = DummyProvider("fallback", fallback_response)

    provider = FallbackProvider(primary, fallback, "fallback/model")

    streamed_deltas = []

    async def collect_delta(delta: str) -> None:
        streamed_deltas.append(delta)

    response = await provider.chat_stream(
        messages=[{"role": "user", "content": "hi"}],
        on_content_delta=collect_delta,
    )

    # In exception fallback, delta warning should be sent, followed by fallback content
    assert "⚠️ *[Codex instável/deslogado. Utilizando fallback via OpenRouter...]*\n\n" in streamed_deltas
    assert "Fallback content" in streamed_deltas
    assert "⚠️ *[Codex instável/deslogado. Utilizando fallback via OpenRouter...]*" in response.content
    assert "Fallback content" in response.content
    assert len(primary.calls) == 1
    assert len(fallback.calls) == 1
    assert provider.use_fallback is True
