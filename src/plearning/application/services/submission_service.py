"""
Submission Service – /submit_assignment use case.
"""

from __future__ import annotations

from typing import List

from plearning.application.dtos.submission_dtos import SubmissionOut, SubmitAssignmentDTO
from plearning.domain.entities.submission import Submission
from plearning.domain.exceptions import DuplicateSubmissionError
from plearning.domain.repositories.submission_repository import SubmissionRepository
from plearning.domain.value_objects.ids import AssignmentId


class SubmissionService:
    """Handles student assignment submissions."""

    def __init__(self, submission_repo: SubmissionRepository) -> None:
        self._submission_repo = submission_repo

    async def submit_assignment(self, dto: SubmitAssignmentDTO) -> SubmissionOut:
        """Create a new submission for an assignment."""
        assignment_id = AssignmentId(dto.assignment_id)

        # Prevent duplicate submissions
        existing = await self._submission_repo.get_by_student_and_assignment(
            dto.student_id, assignment_id
        )
        if existing is not None:
            raise DuplicateSubmissionError(dto.student_id, dto.assignment_id)

        submission = Submission.create(
            assignment_id=assignment_id,
            student_id=dto.student_id,
            content=dto.content,
        )
        await self._submission_repo.save(submission)
        return self._to_out(submission)

    async def get_submissions_for_assignment(
        self, assignment_id: str
    ) -> List[SubmissionOut]:
        subs = await self._submission_repo.get_by_assignment(
            AssignmentId(assignment_id)
        )
        return [self._to_out(s) for s in subs]

    @staticmethod
    def _to_out(s: Submission) -> SubmissionOut:
        return SubmissionOut(
            id=s.id.value,
            assignment_id=s.assignment_id.value,
            student_id=s.student_id,
            content=s.content,
            submitted_at=s.submitted_at.isoformat(),
        )
