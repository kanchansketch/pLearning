"""
Assessment & AssessmentAttempt entities.

Assessments are quizzes/tests attached to a Module or Lesson.
Attempts track a student's interaction with an assessment.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from plearning.domain.exceptions import (
    AttemptAlreadySubmittedError,
    AttemptNotInProgressError,
)
from plearning.domain.value_objects.ids import AssessmentId, AttemptId, ModuleId


class AttemptStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"


@dataclass
class Assessment:
    """A quiz or test associated with a module."""

    id: AssessmentId
    module_id: ModuleId
    title: str
    description: str
    questions: List[str] = field(default_factory=list)
    time_limit_minutes: int = 0  # 0 = no limit

    @classmethod
    def create(
        cls,
        module_id: ModuleId,
        title: str,
        description: str,
        questions: List[str] | None = None,
        time_limit_minutes: int = 0,
    ) -> Assessment:
        return cls(
            id=AssessmentId.generate(),
            module_id=module_id,
            title=title,
            description=description,
            questions=questions or [],
            time_limit_minutes=time_limit_minutes,
        )


@dataclass
class AssessmentAttempt:
    """A student's attempt at completing an assessment."""

    id: AttemptId
    assessment_id: AssessmentId
    student_id: str
    status: AttemptStatus = AttemptStatus.IN_PROGRESS
    answers: List[str] = field(default_factory=list)
    score: Optional[float] = None
    started_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    submitted_at: Optional[datetime] = None

    @classmethod
    def start(
        cls,
        assessment_id: AssessmentId,
        student_id: str,
    ) -> AssessmentAttempt:
        return cls(
            id=AttemptId.generate(),
            assessment_id=assessment_id,
            student_id=student_id,
        )

    def submit(self, answers: List[str]) -> None:
        """Submit answers and mark the attempt as submitted."""
        if self.status != AttemptStatus.IN_PROGRESS:
            if self.status == AttemptStatus.SUBMITTED:
                raise AttemptAlreadySubmittedError(self.id.value)
            raise AttemptNotInProgressError(self.id.value)
        self.answers = answers
        self.status = AttemptStatus.SUBMITTED
        self.submitted_at = datetime.now(timezone.utc)

    def grade(self, score: float) -> None:
        """Grade the attempt."""
        self.score = score
        self.status = AttemptStatus.GRADED
