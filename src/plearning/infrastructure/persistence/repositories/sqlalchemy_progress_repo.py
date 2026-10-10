"""SQLAlchemy Progress repository."""

from __future__ import annotations

import json
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from plearning.domain.entities.student_progress import StudentProgress
from plearning.domain.repositories.progress_repository import ProgressRepository
from plearning.domain.value_objects.ids import CourseId
from plearning.infrastructure.persistence.models import ProgressModel


class SQLAlchemyProgressRepository(ProgressRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, progress: StudentProgress) -> None:
        # Upsert: find existing or create
        stmt = select(ProgressModel).where(
            ProgressModel.student_id == progress.student_id,
            ProgressModel.course_id == progress.course_id.value,
        )
        result = await self._session.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            existing.completed_lesson_ids_json = json.dumps(
                progress.completed_lesson_ids
            )
            existing.current_lesson_id = progress.current_lesson_id
            existing.progress_percentage = progress.progress_percentage
            existing.last_accessed_at = progress.last_accessed_at
        else:
            model = ProgressModel(
                student_id=progress.student_id,
                course_id=progress.course_id.value,
                completed_lesson_ids_json=json.dumps(
                    progress.completed_lesson_ids
                ),
                current_lesson_id=progress.current_lesson_id,
                progress_percentage=progress.progress_percentage,
                last_accessed_at=progress.last_accessed_at,
            )
            self._session.add(model)

        await self._session.commit()

    async def get(
        self, student_id: str, course_id: CourseId
    ) -> Optional[StudentProgress]:
        stmt = select(ProgressModel).where(
            ProgressModel.student_id == student_id,
            ProgressModel.course_id == course_id.value,
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    @staticmethod
    def _to_entity(model: ProgressModel) -> StudentProgress:
        return StudentProgress(
            student_id=model.student_id,
            course_id=CourseId(model.course_id),
            completed_lesson_ids=json.loads(model.completed_lesson_ids_json),
            current_lesson_id=model.current_lesson_id,
            progress_percentage=model.progress_percentage,
            last_accessed_at=model.last_accessed_at,
        )
