"""
Evaluation entity.

A teacher's evaluation of a student Submission.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from plearning.domain.exceptions import DomainException
from plearning.domain.value_objects.ids import EvaluationId, SubmissionId


@dataclass
class Evaluation:
    """Teacher-provided grade and feedback for a submission."""

    id: EvaluationId
    submission_id: SubmissionId
    score: float
    feedback: str
    evaluated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    def __post_init__(self) -> None:
        self._validate()

    # ── Factory ───────────────────────────────────────────────────

    @classmethod
    def create(
        cls,
        submission_id: SubmissionId,
        score: float,
        feedback: str,
    ) -> Evaluation:
        return cls(
            id=EvaluationId.generate(),
            submission_id=submission_id,
            score=score,
            feedback=feedback,
        )

    # ── Private ───────────────────────────────────────────────────

    def _validate(self) -> None:
        if self.score < 0 or self.score > 100:
            raise DomainException("Score must be between 0 and 100.")
