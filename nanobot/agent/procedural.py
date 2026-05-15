"""Procedural memory: playbooks and learned execution patterns.

This module adds the third memory layer to the nanobot:

- **Factual** (``MEMORY.md``, ``USER.md``, ``SOUL.md``): persistent facts.
- **Episodic** (``history.jsonl``): what happened in past sessions.
- **Procedural** (``playbooks.jsonl``): *how* to solve recurring task types
  successfully, extracted from past complex executions.

Playbooks are lightweight JSON records stored in append-only JSONL.
They are searched by keyword overlap and injected into the system prompt
so the agent can reuse proven procedures instead of improvising.
"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any


class ProceduralMemory:
    """Manage procedural playbooks stored in ``memory/playbooks.jsonl``.

    Each playbook captures:
    - ``task_type``: category (research, writing, coding, …)
    - ``summary``: one-line description
    - ``steps``: ordered list of actions taken
    - ``skills_used``: which skills were involved
    - ``outcome``: success / partial / failure
    - ``tags``: free-form keywords for retrieval
    """

    _PLAYBOOK_FILE = "playbooks.jsonl"
    _MAX_PLAYBOOKS_FOR_CONTEXT = 3

    def __init__(self, memory_dir: Path):
        self.memory_dir = memory_dir
        self.playbook_file = memory_dir / self._PLAYBOOK_FILE

    # -- write ---------------------------------------------------------------

    def save_playbook(
        self,
        task_type: str,
        summary: str,
        steps: list[str],
        skills_used: list[str] | None = None,
        outcome: str = "success",
        tags: list[str] | None = None,
    ) -> int:
        """Persist a new playbook and return its auto-incrementing ID."""
        entry = {
            "id": self._next_id(),
            "timestamp": datetime.now().isoformat(),
            "task_type": task_type,
            "summary": summary,
            "steps": steps,
            "skills_used": skills_used or [],
            "outcome": outcome,
            "tags": tags or [],
        }
        with open(self.playbook_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        return entry["id"]

    # -- read / search -------------------------------------------------------

    def search_similar(
        self,
        query: str,
        task_type: str | None = None,
        limit: int | None = None,
    ) -> list[dict[str, Any]]:
        """Find playbooks relevant to *query* using keyword overlap.

        Args:
            query: Current task description (user message).
            task_type: Optional filter by task category.
            limit: Max results (defaults to ``_MAX_PLAYBOOKS_FOR_CONTEXT``).

        Returns:
            Playbooks sorted by descending relevance score.
        """
        if limit is None:
            limit = self._MAX_PLAYBOOKS_FOR_CONTEXT

        entries = self._read_all()
        if not entries:
            return []

        query_words = set(query.lower().split())
        if not query_words:
            return []

        scored: list[tuple[int, dict[str, Any]]] = []
        for entry in entries:
            if entry.get("outcome", "success") == "failure":
                continue
            if task_type and entry.get("task_type") != task_type:
                continue
            searchable = " ".join([
                entry.get("summary", ""),
                " ".join(entry.get("tags", [])),
                " ".join(entry.get("steps", [])),
            ]).lower()
            overlap = len(query_words & set(searchable.split()))
            if overlap > 0:
                scored.append((overlap, entry))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [e for _, e in scored[:limit]]

    def format_for_context(self, playbooks: list[dict[str, Any]]) -> str:
        """Format playbooks as markdown for system prompt injection.

        Returns an empty string when there are no playbooks to show.
        """
        if not playbooks:
            return ""

        lines: list[str] = []
        for pb in playbooks:
            lines.append(
                f"### {pb.get('task_type', 'unknown')}: {pb.get('summary', '')}"
            )
            skills = pb.get("skills_used", [])
            if skills:
                lines.append(f"Skills: {', '.join(skills)}")
            steps = pb.get("steps", [])
            if steps:
                lines.append("Steps:")
                for step in steps:
                    lines.append(f"  - {step}")
            lines.append("")
        return "\n".join(lines)

    # -- internal helpers ----------------------------------------------------

    def _read_all(self) -> list[dict[str, Any]]:
        entries: list[dict[str, Any]] = []
        try:
            with open(self.playbook_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            entries.append(json.loads(line))
                        except json.JSONDecodeError:
                            continue
        except FileNotFoundError:
            pass
        return entries

    def _next_id(self) -> int:
        entries = self._read_all()
        if not entries:
            return 1
        return max((e.get("id", 0) for e in entries), default=0) + 1
