import asyncio
from collections.abc import Awaitable, Callable
from typing import Any
from loguru import logger
from nanobot.providers.base import LLMProvider, LLMResponse

class FallbackProvider(LLMProvider):
    """Wrapper provider that falls back to a secondary provider if the primary provider fails."""

    def __init__(self, primary: LLMProvider, fallback: LLMProvider, fallback_model: str):
        super().__init__(api_key=primary.api_key, api_base=primary.api_base)
        self.primary = primary
        self.fallback = fallback
        self.fallback_model = fallback_model
        self.use_fallback = False
        self.generation = primary.generation

    def get_default_model(self) -> str:
        if self.use_fallback:
            return self.fallback_model
        return self.primary.get_default_model()

    async def chat(
        self,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        model: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
        reasoning_effort: str | None = None,
        tool_choice: str | dict[str, Any] | None = None,
    ) -> LLMResponse:
        if self.use_fallback:
            return await self.fallback.chat(
                messages=messages,
                tools=tools,
                model=self.fallback_model,
                max_tokens=max_tokens,
                temperature=temperature,
                reasoning_effort=reasoning_effort,
                tool_choice=tool_choice,
            )

        response = await self.primary.chat(
            messages=messages,
            tools=tools,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            reasoning_effort=reasoning_effort,
            tool_choice=tool_choice,
        )

        if response.finish_reason == "error":
            logger.warning("Provedor primário falhou. Utilizando fallback para: {}", self.fallback_model)
            self.use_fallback = True
            
            # Executa a chamada no provedor de fallback
            response = await self.fallback.chat(
                messages=messages,
                tools=tools,
                model=self.fallback_model,
                max_tokens=max_tokens,
                temperature=temperature,
                reasoning_effort=reasoning_effort,
                tool_choice=tool_choice,
            )
            
            # Insere o aviso de fallback no início da resposta
            if response.content:
                response.content = "⚠️ *[Codex instável/deslogado. Utilizando fallback via OpenRouter...]*\n\n" + response.content
            return response
            
        return response

    async def chat_stream(
        self,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        model: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
        reasoning_effort: str | None = None,
        tool_choice: str | dict[str, Any] | None = None,
        on_content_delta: Callable[[str], Awaitable[None]] | None = None,
    ) -> LLMResponse:
        if self.use_fallback:
            return await self.fallback.chat_stream(
                messages=messages,
                tools=tools,
                model=self.fallback_model,
                max_tokens=max_tokens,
                temperature=temperature,
                reasoning_effort=reasoning_effort,
                tool_choice=tool_choice,
                on_content_delta=on_content_delta,
            )

        streamed_any = False

        async def _wrapped_delta(delta: str) -> None:
            nonlocal streamed_any
            streamed_any = True
            if on_content_delta:
                await on_content_delta(delta)

        try:
            response = await self.primary.chat_stream(
                messages=messages,
                tools=tools,
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                reasoning_effort=reasoning_effort,
                tool_choice=tool_choice,
                on_content_delta=_wrapped_delta,
            )
        except Exception as e:
            if not streamed_any:
                logger.warning("chat_stream do provedor primário gerou erro: {}. Utilizando fallback: {}", e, self.fallback_model)
                self.use_fallback = True
                
                # Avisa no stream sobre a mudança
                if on_content_delta:
                    await on_content_delta("⚠️ *[Codex instável/deslogado. Utilizando fallback via OpenRouter...]*\n\n")
                    
                response = await self.fallback.chat_stream(
                    messages=messages,
                    tools=tools,
                    model=self.fallback_model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    reasoning_effort=reasoning_effort,
                    tool_choice=tool_choice,
                    on_content_delta=on_content_delta,
                )
                if response.content:
                    response.content = "⚠️ *[Codex instável/deslogado. Utilizando fallback via OpenRouter...]*\n\n" + response.content
                return response
            raise e

        if response.finish_reason == "error" and not streamed_any:
            logger.warning("chat_stream do provedor primário falhou. Utilizando fallback: {}", self.fallback_model)
            self.use_fallback = True
            
            # Avisa no stream sobre a mudança
            if on_content_delta:
                await on_content_delta("⚠️ *[Codex instável/deslogado. Utilizando fallback via OpenRouter...]*\n\n")
                
            response = await self.fallback.chat_stream(
                messages=messages,
                tools=tools,
                model=self.fallback_model,
                max_tokens=max_tokens,
                temperature=temperature,
                reasoning_effort=reasoning_effort,
                tool_choice=tool_choice,
                on_content_delta=on_content_delta,
            )
            if response.content:
                response.content = "⚠️ *[Codex instável/deslogado. Utilizando fallback via OpenRouter...]*\n\n" + response.content
            return response
            
        return response
