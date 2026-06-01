"""Custom user-defined slash commands backed by a JSON file."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from loguru import logger

from nanobot.bus.events import InboundMessage, OutboundMessage
from nanobot.command.router import CommandContext, CommandRouter

# Built-in command names that cannot be overridden by custom commands.
_RESERVED_NAMES: frozenset[str] = frozenset({
    "stop", "restart", "status", "new", "dream",
    "dream-log", "dream-restore", "help",
    "cmd-add", "cmd-remove", "cmd-list", "cmd-edit",
})

_FILENAME = "custom_commands.json"


@dataclass
class CustomCommand:
    """A single user-defined command."""

    prompt: str
    description: str = ""


class CustomCommandStore:
    """Persistent store for user-defined slash commands.

    Commands are kept in ``<workspace>/custom_commands.json`` and registered
    into the :class:`CommandRouter` so they behave exactly like built-in
    commands (intercepted before the LLM sees the raw ``/`` text).
    """

    def __init__(self, workspace: Path) -> None:
        self._path = workspace / _FILENAME
        self._commands: dict[str, CustomCommand] = {}
        self._router: CommandRouter | None = None
        self.load()

    # -- Persistence ---------------------------------------------------------

    def load(self) -> None:
        """Load commands from disk. Silently starts empty if the file is missing or corrupt."""
        if not self._path.exists():
            self._commands = {}
            return
        try:
            raw = json.loads(self._path.read_text(encoding="utf-8"))
            self._commands = {
                name: CustomCommand(
                    prompt=entry.get("prompt", ""),
                    description=entry.get("description", ""),
                )
                for name, entry in raw.items()
                if isinstance(entry, dict) and entry.get("prompt")
            }
            logger.info("Loaded {} custom command(s) from {}", len(self._commands), self._path)
        except (json.JSONDecodeError, OSError) as exc:
            logger.warning("Failed to load custom commands from {}: {}", self._path, exc)
            self._commands = {}

    def save(self) -> None:
        """Persist current commands to disk."""
        data: dict[str, dict[str, str]] = {
            name: {"prompt": cmd.prompt, "description": cmd.description}
            for name, cmd in sorted(self._commands.items())
        }
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._path.write_text(
            json.dumps(data, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )

    # -- CRUD ----------------------------------------------------------------

    def add(self, name: str, prompt: str, description: str = "") -> str | None:
        """Add or overwrite a command. Returns an error string or *None* on success."""
        name = self._normalize(name)
        if name in _RESERVED_NAMES:
            return f"The name `/{name}` is reserved and cannot be used."
        if not prompt.strip():
            return "The prompt cannot be empty."
        is_update = name in self._commands
        self._commands[name] = CustomCommand(prompt=prompt.strip(), description=description.strip())
        self.save()
        if self._router:
            self._register_one(name, self._router)
        return None

    def edit(self, name: str, prompt: str) -> str | None:
        """Edit an existing command's prompt. Returns an error string or *None*."""
        name = self._normalize(name)
        cmd = self._commands.get(name)
        if cmd is None:
            return f"Command `/{name}` does not exist. Use `/cmd-add` to create it."
        if not prompt.strip():
            return "The prompt cannot be empty."
        cmd.prompt = prompt.strip()
        self.save()
        return None

    def remove(self, name: str) -> str | None:
        """Remove a command. Returns an error string or *None*."""
        name = self._normalize(name)
        if name not in self._commands:
            return f"Command `/{name}` does not exist."
        del self._commands[name]
        self.save()
        # Note: CommandRouter has no unregister; the handler stays in the
        # router's dict but will check the store at dispatch time and return
        # None, falling through to the LLM.  On next restart it won't be
        # registered at all.
        return None

    def get(self, name: str) -> CustomCommand | None:
        return self._commands.get(self._normalize(name))

    def list_all(self) -> dict[str, CustomCommand]:
        return dict(self._commands)

    # -- Router integration --------------------------------------------------

    def register_all(self, router: CommandRouter) -> None:
        """Register every stored command into *router*."""
        self._router = router
        for name in self._commands:
            self._register_one(name, router)

    def _register_one(self, name: str, router: CommandRouter) -> None:
        """Register a single custom command (exact + prefix) into *router*."""
        handler = self._make_handler(name)
        cmd = f"/{name}"
        router.exact(cmd, handler)
        router.prefix(f"{cmd} ", handler)

    def _make_handler(self, name: str):
        """Return an async handler that re-injects the stored prompt into the bus."""
        store = self

        async def _handler(ctx: CommandContext) -> OutboundMessage | None:
            cmd = store.get(name)
            if cmd is None:
                # Command was removed at runtime — fall through to LLM.
                return None

            prompt = cmd.prompt
            # Append any user-supplied arguments after the command name.
            args = getattr(ctx, "args", "").strip()
            if args:
                prompt = f"{prompt} {args}"

            # Re-inject as a fresh inbound message so the LLM processes it
            # as a normal user prompt (with skills, memory, etc.).
            new_msg = InboundMessage(
                channel=ctx.msg.channel,
                sender_id=ctx.msg.sender_id,
                chat_id=ctx.msg.chat_id,
                content=prompt,
                media=ctx.msg.media,
                metadata=ctx.msg.metadata,
                session_key_override=ctx.msg.session_key_override,
            )
            await ctx.loop.bus.publish_inbound(new_msg)
            return None  # Suppress direct response — the re-injected message will produce one.

        return _handler

    # -- Helpers -------------------------------------------------------------

    @staticmethod
    def _normalize(name: str) -> str:
        """Strip leading '/' and lower-case the name."""
        return name.lstrip("/").strip().lower()
