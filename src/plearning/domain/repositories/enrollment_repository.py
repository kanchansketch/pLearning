"""
Enrollment repository interface.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, Optional

from plearning.domain.entities.enrollment import Enrollment
from plearning.domain.value_objects.ids import CourseId


class EnrollmentRepository(ABC):

    @abstractmethod
    async def save(self, enrollment: Enrollment) -> None: ...

    @abstractmethod
    async def find_by_student_and_course(
        self, student_id: str, course_id: CourseId
    ) -> Optional[Enrollment]: ...

    @abstractmethod
    async def get_courses_for_student(self, student_id: str) -> List[Enrollment]: ...

    @abstractmethod
    async def get_students_for_course(self, course_id: CourseId) -> List[Enrollment]: ...
