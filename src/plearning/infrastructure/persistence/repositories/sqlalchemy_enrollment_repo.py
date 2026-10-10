"""SQLAlchemy Enrollment repository."""

from __future__ import annotations

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from plearning.domain.entities.enrollment import Enrollment
from plearning.domain.repositories.enrollment_repository import EnrollmentRepository
from plearning.domain.value_objects.ids import CourseId, EnrollmentId
from plearning.infrastructure.persistence.models import EnrollmentModel


class SQLAlchemyEnrollmentRepository(EnrollmentRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, enrollment: Enrollment) -> None:
        model = EnrollmentModel(
            id=enrollment.id.value,
            course_id=enrollment.course_id.value,
            student_id=enrollment.student_id,
            enrolled_at=enrollment.enrolled_at,
        )
        self._session.add(model)
        await self._session.commit()

    async def find_by_student_and_course(
        self, student_id: str, course_id: CourseId
    ) -> Optional[Enrollment]:
        stmt = select(EnrollmentModel).where(
            EnrollmentModel.student_id == student_id,
            EnrollmentModel.course_id == course_id.value,
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_courses_for_student(self, student_id: str) -> List[Enrollment]:
        stmt = select(EnrollmentModel).where(
            EnrollmentModel.student_id == student_id
        )
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_students_for_course(self, course_id: CourseId) -> List[Enrollment]:
        stmt = select(EnrollmentModel).where(
            EnrollmentModel.course_id == course_id.value
        )
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    @staticmethod
    def _to_entity(model: EnrollmentModel) -> Enrollment:
        return Enrollment(
            id=EnrollmentId(model.id),
            course_id=CourseId(model.course_id),
            student_id=model.student_id,
            enrolled_at=model.enrolled_at,
        )
