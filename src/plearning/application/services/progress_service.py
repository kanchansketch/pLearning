"""
Progress Service – /update_progress use case.
"""

from __future__ import annotations

from plearning.application.dtos.progress_dtos import ProgressOut, UpdateProgressDTO
from plearning.domain.entities.student_progress import StudentProgress
from plearning.domain.exceptions import (
    CourseNotFoundError,
    NotEnrolledError,
    ProgressNotFoundError,
)
from plearning.domain.repositories.course_repository import CourseRepository
from plearning.domain.repositories.enrollment_repository import EnrollmentRepository
from plearning.domain.repositories.progress_repository import ProgressRepository
from plearning.domain.value_objects.ids import CourseId, LessonId


class ProgressService:
    """Manages student progress tracking."""

    def __init__(
        self,
        progress_repo: ProgressRepository,
        course_repo: CourseRepository,
        enrollment_repo: EnrollmentRepository,
    ) -> None:
        self._progress_repo = progress_repo
        self._course_repo = course_repo
        self._enrollment_repo = enrollment_repo

    async def update_progress(self, dto: UpdateProgressDTO) -> ProgressOut:
        """Mark a lesson as complete and update the student's progress percentage."""
        course_id = CourseId(dto.course_id)

        # Verify enrollment
        enrollment = await self._enrollment_repo.find_by_student_and_course(
            dto.student_id, course_id
        )
        if enrollment is None:
            raise NotEnrolledError(dto.student_id, dto.course_id)

        # Get course for total lesson count
        course = await self._course_repo.get_by_id(course_id)
        if course is None:
            raise CourseNotFoundError(dto.course_id)

        total_lessons = sum(len(m.lessons) for m in course.modules)

        # Get or create progress
        progress = await self._progress_repo.get(dto.student_id, course_id)
        if progress is None:
            progress = StudentProgress(
                student_id=dto.student_id, course_id=course_id
            )

        progress.mark_lesson_complete(LessonId(dto.lesson_id), total_lessons)
        await self._progress_repo.save(progress)

        return self._to_out(progress)

    async def get_progress(self, student_id: str, course_id: str) -> ProgressOut:
        cid = CourseId(course_id)
        progress = await self._progress_repo.get(student_id, cid)
        if progress is None:
            raise ProgressNotFoundError(student_id, course_id)
        return self._to_out(progress)

    @staticmethod
    def _to_out(p: StudentProgress) -> ProgressOut:
        return ProgressOut(
            student_id=p.student_id,
            course_id=p.course_id.value,
            completed_lesson_ids=list(p.completed_lesson_ids),
            current_lesson_id=p.current_lesson_id,
            progress_percentage=p.progress_percentage,
            last_accessed_at=p.last_accessed_at.isoformat(),
        )
