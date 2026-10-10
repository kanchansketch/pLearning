"""
Module entity – child of Course aggregate.

A Module groups related Lessons within a Course.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

from plearning.domain.exceptions import InvalidCourseDataError, LessonNotFoundError
from plearning.domain.value_objects.ids import CourseId, LessonId, ModuleId


@dataclass
class Module:
    """A logical grouping of lessons inside a course."""

    id: ModuleId
    course_id: CourseId
    title: str
    description: str
    order: int = 0
    lessons: List["Lesson"] = field(default_factory=list)

    def __post_init__(self) -> None:
        self._validate()

    # ── Factory ───────────────────────────────────────────────────

    @classmethod
    def create(
        cls,
        course_id: CourseId,
        title: str,
        description: str,
    ) -> Module:
        return cls(
            id=ModuleId.generate(),
            course_id=course_id,
            title=title,
            description=description,
        )

    # ── Commands ──────────────────────────────────────────────────

    def add_lesson(self, lesson: "Lesson") -> None:
        lesson.order = len(self.lessons) + 1
        self.lessons.append(lesson)

    def remove_lesson(self, lesson_id: LessonId) -> None:
        original_len = len(self.lessons)
        self.lessons = [ls for ls in self.lessons if ls.id != lesson_id]
        if len(self.lessons) == original_len:
            raise LessonNotFoundError(lesson_id.value)
        self._reorder_lessons()

    def get_lesson(self, lesson_id: LessonId) -> "Lesson":
        for ls in self.lessons:
            if ls.id == lesson_id:
                return ls
        raise LessonNotFoundError(lesson_id.value)

    # ── Private ───────────────────────────────────────────────────

    def _validate(self) -> None:
        if not self.title or not self.title.strip():
            raise InvalidCourseDataError("Module title must not be empty.")

    def _reorder_lessons(self) -> None:
        for idx, ls in enumerate(self.lessons, start=1):
            ls.order = idx
