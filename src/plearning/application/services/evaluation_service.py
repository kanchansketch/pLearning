"""
Evaluation Service – /evaluate_assignment use case.
"""

from __future__ import annotations

from plearning.application.dtos.submission_dtos import (
    EvaluateAssignmentDTO,
    EvaluationOut,
)
from plearning.domain.entities.evaluation import Evaluation
from plearning.domain.exceptions import SubmissionNotFoundError
from plearning.domain.repositories.evaluation_repository import EvaluationRepository
from plearning.domain.repositories.submission_repository import SubmissionRepository
from plearning.domain.value_objects.ids import SubmissionId


class EvaluationService:
    """Handles teacher evaluations of submissions."""

    def __init__(
        self,
        evaluation_repo: EvaluationRepository,
        submission_repo: SubmissionRepository,
    ) -> None:
        self._evaluation_repo = evaluation_repo
        self._submission_repo = submission_repo

    async def evaluate(self, dto: EvaluateAssignmentDTO) -> EvaluationOut:
        """Evaluate a student's submission."""
        submission_id = SubmissionId(dto.submission_id)

        # Verify the submission exists
        submission = await self._submission_repo.get_by_id(submission_id)
        if submission is None:
            raise SubmissionNotFoundError(dto.submission_id)

        evaluation = Evaluation.create(
            submission_id=submission_id,
            score=dto.score,
            feedback=dto.feedback,
        )
        await self._evaluation_repo.save(evaluation)
        return self._to_out(evaluation)

    async def get_evaluation(self, submission_id: str) -> EvaluationOut:
        sid = SubmissionId(submission_id)
        evaluation = await self._evaluation_repo.get_by_submission(sid)
        if evaluation is None:
            raise SubmissionNotFoundError(submission_id)
        return self._to_out(evaluation)

    @staticmethod
    def _to_out(e: Evaluation) -> EvaluationOut:
        return EvaluationOut(
            id=e.id.value,
            submission_id=e.submission_id.value,
            score=e.score,
            feedback=e.feedback,
            evaluated_at=e.evaluated_at.isoformat(),
        )
