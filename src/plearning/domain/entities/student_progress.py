"""
StudentProgress entity.

Tracks a student's progress through a Course.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List

from plearning.domain.value_objects.ids import CourseId, LessonId


@dataclass
class StudentProgress:
    """Tracks which lessons a student has completed in a course."""

    student_id: str
    course_id: CourseId
    completed_lesson_ids: List[str] = field(default_factory=list)
    current_lesson_id: str | None = None
    progress_percentage: float = 0.0
    last_accessed_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # ── Commands ──────────────────────────────────────────────────

    def mark_lesson_complete(
        self, lesson_id: LessonId, total_lessons: int
    ) -> None:
        """Mark a lesson as completed and recalculate progress."""
        lid = lesson_id.value
        if lid not in self.completed_lesson_ids:
            self.completed_lesson_ids.append(lid)
        self._recalculate_progress(total_lessons)
        self._touch()

    def set_current_lesson(self, lesson_id: LessonId) -> None:
        self.current_lesson_id = lesson_id.value
        self._touch()

    @property
    def is_course_complete(self) -> bool:
        return self.progress_percentage >= 100.0

    # ── Private ───────────────────────────────────────────────────

    def _recalculate_progress(self, total_lessons: int) -> None:
        if total_lessons == 0:
            self.progress_percentage = 0.0
        else:
            self.progress_percentage = round(
                (len(self.completed_lesson_ids) / total_lessons) * 100, 2
            )

    def _touch(self) -> None:
        self.last_accessed_at = datetime.now(timezone.utc)
