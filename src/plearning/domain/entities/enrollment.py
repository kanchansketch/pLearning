"""
Enrollment entity.

Represents a student's enrollment in a Course.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from plearning.domain.value_objects.ids import CourseId, EnrollmentId


@dataclass
class Enrollment:
    """Tracks that a student is enrolled in a course."""

    id: EnrollmentId
    course_id: CourseId
    student_id: str
    enrolled_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # ── Factory ───────────────────────────────────────────────────

    @classmethod
    def create(cls, course_id: CourseId, student_id: str) -> Enrollment:
        return cls(
            id=EnrollmentId.generate(),
            course_id=course_id,
            student_id=student_id,
        )
