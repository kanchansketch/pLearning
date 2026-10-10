"""SQLAlchemy Evaluation repository."""

from __future__ import annotations

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from plearning.domain.entities.evaluation import Evaluation
from plearning.domain.repositories.evaluation_repository import EvaluationRepository
from plearning.domain.value_objects.ids import EvaluationId, SubmissionId
from plearning.infrastructure.persistence.models import EvaluationModel


class SQLAlchemyEvaluationRepository(EvaluationRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, evaluation: Evaluation) -> None:
        model = EvaluationModel(
            id=evaluation.id.value,
            submission_id=evaluation.submission_id.value,
            score=evaluation.score,
            feedback=evaluation.feedback,
            evaluated_at=evaluation.evaluated_at,
        )
        self._session.add(model)
        await self._session.commit()

    async def get_by_id(
        self, evaluation_id: EvaluationId
    ) -> Optional[Evaluation]:
        model = await self._session.get(EvaluationModel, evaluation_id.value)
        return self._to_entity(model) if model else None

    async def get_by_submission(
        self, submission_id: SubmissionId
    ) -> Optional[Evaluation]:
        stmt = select(EvaluationModel).where(
            EvaluationModel.submission_id == submission_id.value
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all_for_assignment_submissions(
        self, submission_ids: List[SubmissionId]
    ) -> List[Evaluation]:
        id_values = [sid.value for sid in submission_ids]
        stmt = select(EvaluationModel).where(
            EvaluationModel.submission_id.in_(id_values)
        )
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    @staticmethod
    def _to_entity(model: EvaluationModel) -> Evaluation:
        return Evaluation(
            id=EvaluationId(model.id),
            submission_id=SubmissionId(model.submission_id),
            score=model.score,
            feedback=model.feedback,
            evaluated_at=model.evaluated_at,
        )
