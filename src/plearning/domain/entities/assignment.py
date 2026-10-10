"""
Assignment entity – child of Lesson.

Assignments contain questions that students answer.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

from plearning.domain.exceptions import InvalidCourseDataError
from plearning.domain.value_objects.ids import AssignmentId, LessonId


@dataclass
class Assignment:
    """A graded task attached to a lesson."""

    id: AssignmentId
    lesson_id: LessonId
    title: str
    description: str
    questions: List[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        self._validate()

    # ── Factory ───────────────────────────────────────────────────

    @classmethod
    def create(
        cls,
        lesson_id: LessonId,
        title: str,
        description: str,
        questions: List[str] | None = None,
    ) -> Assignment:
        return cls(
            id=AssignmentId.generate(),
            lesson_id=lesson_id,
            title=title,
            description=description,
            questions=questions or [],
        )

    # ── Commands ──────────────────────────────────────────────────

    def add_question(self, question: str) -> None:
        if not question.strip():
            raise InvalidCourseDataError("Question text must not be empty.")
        self.questions.append(question)

    def update_questions(self, questions: List[str]) -> None:
        self.questions = questions

    # ── Private ───────────────────────────────────────────────────

    def _validate(self) -> None:
        if not self.title or not self.title.strip():
            raise InvalidCourseDataError("Assignment title must not be empty.")
