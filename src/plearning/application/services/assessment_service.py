"""
Assessment Service – /start_assessment and /submit_assessment use cases.
"""

from __future__ import annotations

from plearning.application.dtos.assessment_dtos import (
    AssessmentOut,
    AttemptOut,
    StartAssessmentDTO,
    SubmitAssessmentDTO,
)
from plearning.domain.entities.assessment import AssessmentAttempt
from plearning.domain.exceptions import (
    AssessmentNotFoundError,
    AttemptNotFoundError,
)
from plearning.domain.repositories.assessment_repository import AssessmentRepository
from plearning.domain.value_objects.ids import AssessmentId, AttemptId


class AssessmentService:
    """Handles starting and submitting assessments."""

    def __init__(self, assessment_repo: AssessmentRepository) -> None:
        self._assessment_repo = assessment_repo

    async def start_assessment(self, dto: StartAssessmentDTO) -> AttemptOut:
        """Start a new assessment attempt."""
        assessment_id = AssessmentId(dto.assessment_id)

        assessment = await self._assessment_repo.get_assessment_by_id(assessment_id)
        if assessment is None:
            raise AssessmentNotFoundError(dto.assessment_id)

        attempt = AssessmentAttempt.start(
            assessment_id=assessment_id,
            student_id=dto.student_id,
        )
        await self._assessment_repo.save_attempt(attempt)
        return self._attempt_to_out(attempt)

    async def submit_assessment(self, dto: SubmitAssessmentDTO) -> AttemptOut:
        """Submit answers for an in-progress assessment attempt."""
        attempt_id = AttemptId(dto.attempt_id)

        attempt = await self._assessment_repo.get_attempt_by_id(attempt_id)
        if attempt is None:
            raise AttemptNotFoundError(dto.attempt_id)

        attempt.submit(dto.answers)
        await self._assessment_repo.save_attempt(attempt)
        return self._attempt_to_out(attempt)

    async def get_assessment(self, assessment_id: str) -> AssessmentOut:
        aid = AssessmentId(assessment_id)
        assessment = await self._assessment_repo.get_assessment_by_id(aid)
        if assessment is None:
            raise AssessmentNotFoundError(assessment_id)
        return self._assessment_to_out(assessment)

    @staticmethod
    def _assessment_to_out(a) -> AssessmentOut:
        return AssessmentOut(
            id=a.id.value,
            module_id=a.module_id.value,
            title=a.title,
            description=a.description,
            questions=list(a.questions),
            time_limit_minutes=a.time_limit_minutes,
        )

    @staticmethod
    def _attempt_to_out(a: AssessmentAttempt) -> AttemptOut:
        return AttemptOut(
            id=a.id.value,
            assessment_id=a.assessment_id.value,
            student_id=a.student_id,
            status=a.status.value,
            answers=list(a.answers),
            score=a.score,
            started_at=a.started_at.isoformat(),
            submitted_at=a.submitted_at.isoformat() if a.submitted_at else None,
        )
