"""
Enrollment Service – /enroll_courses use case.
"""

from __future__ import annotations

from typing import List

from plearning.application.dtos.enrollment_dtos import EnrollCourseDTO, EnrollmentOut
from plearning.domain.entities.enrollment import Enrollment
from plearning.domain.entities.student_progress import StudentProgress
from plearning.domain.exceptions import AlreadyEnrolledError, CourseNotFoundError
from plearning.domain.repositories.course_repository import CourseRepository
from plearning.domain.repositories.enrollment_repository import EnrollmentRepository
from plearning.domain.repositories.progress_repository import ProgressRepository
from plearning.domain.value_objects.ids import CourseId


class EnrollmentService:
    """Handles student enrollment into courses."""

    def __init__(
        self,
        enrollment_repo: EnrollmentRepository,
        course_repo: CourseRepository,
        progress_repo: ProgressRepository,
    ) -> None:
        self._enrollment_repo = enrollment_repo
        self._course_repo = course_repo
        self._progress_repo = progress_repo

    async def enroll(self, dto: EnrollCourseDTO) -> EnrollmentOut:
        """Enroll a student in a course.  Initialises progress tracking."""
        course_id = CourseId(dto.course_id)

        # Ensure course exists
        course = await self._course_repo.get_by_id(course_id)
        if course is None:
            raise CourseNotFoundError(dto.course_id)

        # Prevent duplicate enrolment
        existing = await self._enrollment_repo.find_by_student_and_course(
            dto.student_id, course_id
        )
        if existing is not None:
            raise AlreadyEnrolledError(dto.student_id, dto.course_id)

        enrollment = Enrollment.create(course_id=course_id, student_id=dto.student_id)
        await self._enrollment_repo.save(enrollment)

        # Bootstrap progress record
        progress = StudentProgress(
            student_id=dto.student_id,
            course_id=course_id,
        )
        await self._progress_repo.save(progress)

        return self._to_out(enrollment)

    async def get_student_enrollments(self, student_id: str) -> List[EnrollmentOut]:
        enrollments = await self._enrollment_repo.get_courses_for_student(student_id)
        return [self._to_out(e) for e in enrollments]

    @staticmethod
    def _to_out(e: Enrollment) -> EnrollmentOut:
        return EnrollmentOut(
            id=e.id.value,
            course_id=e.course_id.value,
            student_id=e.student_id,
            enrolled_at=e.enrolled_at.isoformat(),
        )
