"""
SQLAlchemy Course repository implementation.

Maps between SQLAlchemy ORM models and domain entities.
"""

from __future__ import annotations

import json
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from plearning.domain.entities.assignment import Assignment
from plearning.domain.entities.course import Course
from plearning.domain.entities.lesson import Lesson
from plearning.domain.entities.module import Module
from plearning.domain.repositories.course_repository import CourseRepository
from plearning.domain.value_objects.ids import (
    AssignmentId,
    CourseId,
    LessonId,
    ModuleId,
)
from plearning.infrastructure.persistence.models import (
    AssignmentModel,
    CourseModel,
    LessonModel,
    ModuleModel,
)


class SQLAlchemyCourseRepository(CourseRepository):
    """Concrete course repository backed by SQLAlchemy."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, course: Course) -> None:
        # Upsert: delete existing and re-insert (simple approach for aggregates)
        existing = await self._session.get(CourseModel, course.id.value)
        if existing:
            await self._session.delete(existing)
            await self._session.flush()

        model = self._to_model(course)
        self._session.add(model)
        await self._session.commit()

    async def get_by_id(self, course_id: CourseId) -> Optional[Course]:
        stmt = (
            select(CourseModel)
            .options(
                selectinload(CourseModel.modules)
                .selectinload(ModuleModel.lessons)
                .selectinload(LessonModel.assignments)
            )
            .where(CourseModel.id == course_id.value)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self) -> List[Course]:
        stmt = select(CourseModel).options(
            selectinload(CourseModel.modules)
            .selectinload(ModuleModel.lessons)
            .selectinload(LessonModel.assignments)
        )
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_teacher(self, teacher_id: str) -> List[Course]:
        stmt = (
            select(CourseModel)
            .options(
                selectinload(CourseModel.modules)
                .selectinload(ModuleModel.lessons)
                .selectinload(LessonModel.assignments)
            )
            .where(CourseModel.teacher_id == teacher_id)
        )
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def delete(self, course_id: CourseId) -> None:
        existing = await self._session.get(CourseModel, course_id.value)
        if existing:
            await self._session.delete(existing)
            await self._session.commit()

    # ── Mappers ───────────────────────────────────────────────────

    @staticmethod
    def _to_model(course: Course) -> CourseModel:
        return CourseModel(
            id=course.id.value,
            title=course.title,
            description=course.description,
            teacher_id=course.teacher_id,
            created_at=course.created_at,
            updated_at=course.updated_at,
            modules=[
                ModuleModel(
                    id=m.id.value,
                    course_id=course.id.value,
                    title=m.title,
                    description=m.description,
                    order=m.order,
                    lessons=[
                        LessonModel(
                            id=ls.id.value,
                            module_id=m.id.value,
                            title=ls.title,
                            description=ls.description,
                            content=ls.content,
                            content_url=ls.content_url,
                            order=ls.order,
                            assignments=[
                                AssignmentModel(
                                    id=a.id.value,
                                    lesson_id=ls.id.value,
                                    title=a.title,
                                    description=a.description,
                                    questions_json=json.dumps(a.questions),
                                )
                                for a in ls.assignments
                            ],
                        )
                        for ls in m.lessons
                    ],
                )
                for m in course.modules
            ],
        )

    @staticmethod
    def _to_entity(model: CourseModel) -> Course:
        course = Course(
            id=CourseId(model.id),
            title=model.title,
            description=model.description,
            teacher_id=model.teacher_id,
            modules=[],
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
        for mm in model.modules:
            module = Module(
                id=ModuleId(mm.id),
                course_id=CourseId(mm.course_id),
                title=mm.title,
                description=mm.description,
                order=mm.order,
                lessons=[],
            )
            for lm in mm.lessons:
                lesson = Lesson(
                    id=LessonId(lm.id),
                    module_id=ModuleId(lm.module_id),
                    title=lm.title,
                    description=lm.description,
                    content=lm.content,
                    content_url=lm.content_url,
                    order=lm.order,
                    assignments=[],
                )
                for am in lm.assignments:
                    assignment = Assignment(
                        id=AssignmentId(am.id),
                        lesson_id=LessonId(am.lesson_id),
                        title=am.title,
                        description=am.description,
                        questions=json.loads(am.questions_json),
                    )
                    lesson.assignments.append(assignment)
                module.lessons.append(lesson)
            course.modules.append(module)
        return course
