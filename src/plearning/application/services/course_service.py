"""
Course Service – application use cases for course management.

Orchestrates domain entities and repositories to fulfill
/create_courses, /view_courses, /view_modules, /view_lessons, /view_assignments.
"""

from __future__ import annotations

from typing import List

from plearning.application.dtos.course_dtos import (
    AssignmentOut,
    CourseOut,
    CreateCourseDTO,
    LessonOut,
    ModuleOut,
    UpdateCourseDTO,
)
from plearning.domain.entities.assignment import Assignment
from plearning.domain.entities.course import Course
from plearning.domain.entities.lesson import Lesson
from plearning.domain.entities.module import Module
from plearning.domain.exceptions import CourseNotFoundError
from plearning.domain.repositories.course_repository import CourseRepository
from plearning.domain.value_objects.ids import CourseId


class CourseService:
    """Application service for course CRUD operations."""

    def __init__(self, course_repo: CourseRepository) -> None:
        self._course_repo = course_repo

    # ── /create_courses ───────────────────────────────────────────

    async def create_course(self, dto: CreateCourseDTO) -> CourseOut:
        """Create a full course with nested modules, lessons, assignments."""
        course = Course.create(
            title=dto.title,
            description=dto.description,
            teacher_id=dto.teacher_id,
        )

        for mod_dto in dto.modules:
            module = Module.create(
                course_id=course.id,
                title=mod_dto.title,
                description=mod_dto.description,
            )
            for les_dto in mod_dto.lessons:
                lesson = Lesson.create(
                    module_id=module.id,
                    title=les_dto.title,
                    description=les_dto.description,
                    content=les_dto.content,
                    content_url=les_dto.content_url,
                )
                for asg_dto in les_dto.assignments:
                    assignment = Assignment.create(
                        lesson_id=lesson.id,
                        title=asg_dto.title,
                        description=asg_dto.description,
                        questions=list(asg_dto.questions),
                    )
                    lesson.add_assignment(assignment)
                module.add_lesson(lesson)
            course.add_module(module)

        await self._course_repo.save(course)
        return self._to_course_out(course)

    # ── /view_courses ─────────────────────────────────────────────

    async def get_all_courses(self) -> List[CourseOut]:
        courses = await self._course_repo.get_all()
        return [self._to_course_out(c) for c in courses]

    async def get_course(self, course_id: str) -> CourseOut:
        course = await self._course_repo.get_by_id(CourseId(course_id))
        if course is None:
            raise CourseNotFoundError(course_id)
        return self._to_course_out(course)

    async def get_teacher_courses(self, teacher_id: str) -> List[CourseOut]:
        courses = await self._course_repo.get_by_teacher(teacher_id)
        return [self._to_course_out(c) for c in courses]

    # ── /view_modules ─────────────────────────────────────────────

    async def get_modules(self, course_id: str) -> List[ModuleOut]:
        course = await self._course_repo.get_by_id(CourseId(course_id))
        if course is None:
            raise CourseNotFoundError(course_id)
        return [self._to_module_out(m) for m in course.modules]

    # ── /view_lessons ─────────────────────────────────────────────

    async def get_lessons(self, course_id: str, module_id: str) -> List[LessonOut]:
        course = await self._course_repo.get_by_id(CourseId(course_id))
        if course is None:
            raise CourseNotFoundError(course_id)
        from plearning.domain.value_objects.ids import ModuleId

        module = course.get_module(ModuleId(module_id))
        return [self._to_lesson_out(ls) for ls in module.lessons]

    # ── /view_assignments ─────────────────────────────────────────

    async def get_assignments(
        self, course_id: str, module_id: str, lesson_id: str
    ) -> List[AssignmentOut]:
        course = await self._course_repo.get_by_id(CourseId(course_id))
        if course is None:
            raise CourseNotFoundError(course_id)
        from plearning.domain.value_objects.ids import LessonId, ModuleId

        module = course.get_module(ModuleId(module_id))
        lesson = module.get_lesson(LessonId(lesson_id))
        return [self._to_assignment_out(a) for a in lesson.assignments]

    # ── Update ────────────────────────────────────────────────────

    async def update_course(self, course_id: str, dto: UpdateCourseDTO) -> CourseOut:
        course = await self._course_repo.get_by_id(CourseId(course_id))
        if course is None:
            raise CourseNotFoundError(course_id)
        course.update(title=dto.title, description=dto.description)
        await self._course_repo.save(course)
        return self._to_course_out(course)

    # ── Mappers ───────────────────────────────────────────────────

    @staticmethod
    def _to_assignment_out(a: Assignment) -> AssignmentOut:
        return AssignmentOut(
            id=a.id.value,
            lesson_id=a.lesson_id.value,
            title=a.title,
            description=a.description,
            questions=list(a.questions),
        )

    @staticmethod
    def _to_lesson_out(ls: Lesson) -> LessonOut:
        return LessonOut(
            id=ls.id.value,
            module_id=ls.module_id.value,
            title=ls.title,
            description=ls.description,
            content=ls.content,
            content_url=ls.content_url,
            order=ls.order,
            assignments=[CourseService._to_assignment_out(a) for a in ls.assignments],
        )

    @staticmethod
    def _to_module_out(m: Module) -> ModuleOut:
        return ModuleOut(
            id=m.id.value,
            course_id=m.course_id.value,
            title=m.title,
            description=m.description,
            order=m.order,
            lessons=[CourseService._to_lesson_out(ls) for ls in m.lessons],
        )

    @staticmethod
    def _to_course_out(c: Course) -> CourseOut:
        return CourseOut(
            id=c.id.value,
            title=c.title,
            description=c.description,
            teacher_id=c.teacher_id,
            modules=[CourseService._to_module_out(m) for m in c.modules],
            created_at=c.created_at.isoformat(),
            updated_at=c.updated_at.isoformat(),
        )
