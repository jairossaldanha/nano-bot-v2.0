"""Tests for nanobot.agent.classifier."""

from __future__ import annotations

from nanobot.agent.classifier import classify_task


def test_classify_task_low_complexity() -> None:
    classification = classify_task("olá, tudo bem?")
    assert classification.complexity == "low"
    assert classification.task_type == "general"


def test_classify_task_high_complexity_by_keywords() -> None:
    classification = classify_task("Por favor, implemente uma skill de envio de email passo a passo")
    assert classification.complexity == "high"
    assert classification.task_type == "coding"


def test_classify_task_high_complexity_by_word_count() -> None:
    long_msg = "pesquisar " * 130
    classification = classify_task(long_msg)
    assert classification.complexity == "high"
    assert classification.task_type == "research"


def test_classify_task_suggested_skills() -> None:
    skills = [
        {"name": "git", "description": "Git commands and repository management"},
        {"name": "python", "description": "Python standards, FastAPI and formatting"},
    ]
    classification = classify_task("código em python", available_skills=skills)
    assert "python" in classification.suggested_skills
