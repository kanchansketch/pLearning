"""
Content Service – /watch_content use case.
"""

from __future__ import annotations

from plearning.application.dtos.course_dtos import LessonOut
from plearning.application.services.course_service import CourseService
from plearning.domain.exceptions import (
    CourseNotFoundError,
    LessonNotFoundError,
    NotEnrolledError,
)
from plearning.domain.repositories.course_repository import CourseRepository
from plearning.domain.repositories.enrollment_repository import EnrollmentRepository
from plearning.domain.value_objects.ids import CourseId, LessonId, ModuleId


class ContentService:
    """Serves lesson content to enrolled students."""

    def __init__(
        self,
        course_repo: CourseRepository,
        enrollment_repo: EnrollmentRepository,
    ) -> None:
        self._course_repo = course_repo
        self._enrollment_repo = enrollment_repo

    async def watch_content(
        self,
        student_id: str,
        course_id: str,
        module_id: str,
        lesson_id: str,
    ) -> LessonOut:
        """Return lesson content if the student is enrolled."""
        cid = CourseId(course_id)

        # Verify enrollment
        enrollment = await self._enrollment_repo.find_by_student_and_course(
            student_id, cid
        )
        if enrollment is None:
            raise NotEnrolledError(student_id, course_id)

        # Fetch the lesson
        course = await self._course_repo.get_by_id(cid)
        if course is None:
            raise CourseNotFoundError(course_id)

        module = course.get_module(ModuleId(module_id))
        lesson = module.get_lesson(LessonId(lesson_id))

        return CourseService._to_lesson_out(lesson)
