"""
Submission entity.

Represents a student's submission for an Assignment.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from plearning.domain.value_objects.ids import AssignmentId, SubmissionId


@dataclass
class Submission:
    """A student's submitted work for a specific assignment."""

    id: SubmissionId
    assignment_id: AssignmentId
    student_id: str
    content: str
    submitted_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # ── Factory ───────────────────────────────────────────────────

    @classmethod
    def create(
        cls,
        assignment_id: AssignmentId,
        student_id: str,
        content: str,
    ) -> Submission:
        return cls(
            id=SubmissionId.generate(),
            assignment_id=assignment_id,
            student_id=student_id,
            content=content,
        )
