"""In-memory Enrollment repository."""

from __future__ import annotations

import copy
from typing import Dict, List, Optional

from plearning.domain.entities.enrollment import Enrollment
from plearning.domain.repositories.enrollment_repository import EnrollmentRepository
from plearning.domain.value_objects.ids import CourseId


class InMemoryEnrollmentRepository(EnrollmentRepository):

    def __init__(self) -> None:
        self._store: Dict[str, Enrollment] = {}

    async def save(self, enrollment: Enrollment) -> None:
        self._store[enrollment.id.value] = copy.deepcopy(enrollment)

    async def find_by_student_and_course(
        self, student_id: str, course_id: CourseId
    ) -> Optional[Enrollment]:
        for e in self._store.values():
            if e.student_id == student_id and e.course_id == course_id:
                return copy.deepcopy(e)
        return None

    async def get_courses_for_student(self, student_id: str) -> List[Enrollment]:
        return [
            copy.deepcopy(e)
            for e in self._store.values()
            if e.student_id == student_id
        ]

    async def get_students_for_course(self, course_id: CourseId) -> List[Enrollment]:
        return [
            copy.deepcopy(e)
            for e in self._store.values()
            if e.course_id == course_id
        ]
