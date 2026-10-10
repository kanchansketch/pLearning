"""SQLAlchemy Submission repository."""

from __future__ import annotations

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from plearning.domain.entities.submission import Submission
from plearning.domain.repositories.submission_repository import SubmissionRepository
from plearning.domain.value_objects.ids import AssignmentId, SubmissionId
from plearning.infrastructure.persistence.models import SubmissionModel


class SQLAlchemySubmissionRepository(SubmissionRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, submission: Submission) -> None:
        model = SubmissionModel(
            id=submission.id.value,
            assignment_id=submission.assignment_id.value,
            student_id=submission.student_id,
            content=submission.content,
            submitted_at=submission.submitted_at,
        )
        self._session.add(model)
        await self._session.commit()

    async def get_by_id(self, submission_id: SubmissionId) -> Optional[Submission]:
        model = await self._session.get(SubmissionModel, submission_id.value)
        return self._to_entity(model) if model else None

    async def get_by_assignment(self, assignment_id: AssignmentId) -> List[Submission]:
        stmt = select(SubmissionModel).where(
            SubmissionModel.assignment_id == assignment_id.value
        )
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_student_and_assignment(
        self, student_id: str, assignment_id: AssignmentId
    ) -> Optional[Submission]:
        stmt = select(SubmissionModel).where(
            SubmissionModel.student_id == student_id,
            SubmissionModel.assignment_id == assignment_id.value,
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_student(self, student_id: str) -> List[Submission]:
        stmt = select(SubmissionModel).where(
            SubmissionModel.student_id == student_id
        )
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    @staticmethod
    def _to_entity(model: SubmissionModel) -> Submission:
        return Submission(
            id=SubmissionId(model.id),
            assignment_id=AssignmentId(model.assignment_id),
            student_id=model.student_id,
            content=model.content,
            submitted_at=model.submitted_at,
        )
