"""SQLAlchemy Assessment repository."""

from __future__ import annotations

import json
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from plearning.domain.entities.assessment import (
    Assessment,
    AssessmentAttempt,
    AttemptStatus,
)
from plearning.domain.repositories.assessment_repository import AssessmentRepository
from plearning.domain.value_objects.ids import AssessmentId, AttemptId, ModuleId
from plearning.infrastructure.persistence.models import AssessmentModel, AttemptModel


class SQLAlchemyAssessmentRepository(AssessmentRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save_assessment(self, assessment: Assessment) -> None:
        model = AssessmentModel(
            id=assessment.id.value,
            module_id=assessment.module_id.value,
            title=assessment.title,
            description=assessment.description,
            questions_json=json.dumps(assessment.questions),
            time_limit_minutes=assessment.time_limit_minutes,
        )
        merged = await self._session.merge(model)
        await self._session.commit()

    async def get_assessment_by_id(
        self, assessment_id: AssessmentId
    ) -> Optional[Assessment]:
        model = await self._session.get(AssessmentModel, assessment_id.value)
        return self._to_assessment(model) if model else None

    async def get_assessments_by_module(
        self, module_id: ModuleId
    ) -> List[Assessment]:
        stmt = select(AssessmentModel).where(
            AssessmentModel.module_id == module_id.value
        )
        result = await self._session.execute(stmt)
        return [self._to_assessment(m) for m in result.scalars().all()]

    async def save_attempt(self, attempt: AssessmentAttempt) -> None:
        model = AttemptModel(
            id=attempt.id.value,
            assessment_id=attempt.assessment_id.value,
            student_id=attempt.student_id,
            status=attempt.status.value,
            answers_json=json.dumps(attempt.answers),
            score=attempt.score,
            started_at=attempt.started_at,
            submitted_at=attempt.submitted_at,
        )
        await self._session.merge(model)
        await self._session.commit()

    async def get_attempt_by_id(
        self, attempt_id: AttemptId
    ) -> Optional[AssessmentAttempt]:
        model = await self._session.get(AttemptModel, attempt_id.value)
        return self._to_attempt(model) if model else None

    async def get_attempts_by_student(
        self, student_id: str, assessment_id: AssessmentId
    ) -> List[AssessmentAttempt]:
        stmt = select(AttemptModel).where(
            AttemptModel.student_id == student_id,
            AttemptModel.assessment_id == assessment_id.value,
        )
        result = await self._session.execute(stmt)
        return [self._to_attempt(m) for m in result.scalars().all()]

    @staticmethod
    def _to_assessment(model: AssessmentModel) -> Assessment:
        return Assessment(
            id=AssessmentId(model.id),
            module_id=ModuleId(model.module_id),
            title=model.title,
            description=model.description,
            questions=json.loads(model.questions_json),
            time_limit_minutes=model.time_limit_minutes,
        )

    @staticmethod
    def _to_attempt(model: AttemptModel) -> AssessmentAttempt:
        return AssessmentAttempt(
            id=AttemptId(model.id),
            assessment_id=AssessmentId(model.assessment_id),
            student_id=model.student_id,
            status=AttemptStatus(model.status),
            answers=json.loads(model.answers_json),
            score=model.score,
            started_at=model.started_at,
            submitted_at=model.submitted_at,
        )
