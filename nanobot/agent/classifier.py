"""Task classifier: lightweight pre-processing to categorize tasks before execution.

Classifies incoming messages by type, complexity, and skill relevance
using keyword heuristics — no LLM call required. This helps the agent
select skills more deterministically and build appropriate checklists.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class TaskClassification:
    """Result of classifying an incoming user task."""

    task_type: str  # research | writing | analysis | automation | coding | general
    complexity: str  # low | medium | high
    requires_skill: bool
    required_outputs: list[str] = field(default_factory=list)
    suggested_skills: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Keyword tables for heuristic classification
# ---------------------------------------------------------------------------

_TYPE_KEYWORDS: dict[str, list[str]] = {
    "research": [
        "pesquisa", "pesquisar", "buscar", "busca", "encontrar", "encontre",
        "search", "find", "research", "investigate", "look up", "discover",
    ],
    "writing": [
        "escrever", "escreva", "redigir", "redija", "compor", "draft",
        "write", "compose", "artigo", "post", "email", "documento", "texto",
        "relatório", "report", "proposta",
    ],
    "analysis": [
        "analisar", "analise", "avaliar", "avalie", "comparar", "compare",
        "revisar", "review", "analyze", "diagnose", "diagnosticar",
        "avaliar", "examinar",
    ],
    "automation": [
        "agendar", "agenda", "cron", "schedule", "automatizar", "automatize",
        "monitor", "monitorar", "watch", "trigger", "rotina",
    ],
    "coding": [
        "código", "code", "script", "função", "function", "debug",
        "fix", "implement", "implementar", "refatorar", "refactor",
        "programa", "programar", "deploy", "build", "compilar",
    ],
}

_COMPLEXITY_HIGH_KEYWORDS: list[str] = [
    "completo", "completa", "detalhado", "detalhada", "comprehensive",
    "múltiplas etapas", "multi-step", "relatório completo", "full report",
    "plano completo", "full plan", "análise completa", "full analysis",
    "todas as", "all the", "passo a passo", "step by step",
    "do início ao fim", "end to end",
]


def classify_task(
    message: str,
    available_skills: list[dict[str, str]] | None = None,
) -> TaskClassification:
    """Classify a user message by type, complexity, and skill relevance.

    This is a fast heuristic classifier — no LLM call involved.

    Args:
        message: The raw user message text.
        available_skills: Optional list of skill dicts with 'name' and
            'description' keys, used to suggest relevant skills.

    Returns:
        A :class:`TaskClassification` with inferred metadata.
    """
    lower = message.lower()

    # --- Task type ---
    task_type = "general"
    best_score = 0
    for t, keywords in _TYPE_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in lower)
        if score > best_score:
            best_score = score
            task_type = t

    # --- Complexity ---
    word_count = len(message.split())
    complexity = "low"
    if word_count > 120 or any(kw in lower for kw in _COMPLEXITY_HIGH_KEYWORDS):
        complexity = "high"
    elif word_count > 50:
        complexity = "medium"

    # --- Skill suggestion ---
    suggested: list[str] = []
    if available_skills:
        # Split the first meaningful words of the message for matching
        query_words = set(lower.split()[:15])
        for skill in available_skills:
            name = skill.get("name", "")
            desc = (skill.get("description") or "").lower()
            # Score: name match is strongest signal, then description overlap
            name_match = name.lower() in lower
            desc_overlap = len(query_words & set(desc.split()))
            if name_match or desc_overlap >= 2:
                suggested.append(name)

    return TaskClassification(
        task_type=task_type,
        complexity=complexity,
        requires_skill=bool(suggested),
        suggested_skills=suggested[:5],
    )
