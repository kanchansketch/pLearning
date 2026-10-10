"""
Progress repository interface.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from plearning.domain.entities.student_progress import StudentProgress
from plearning.domain.value_objects.ids import CourseId


class ProgressRepository(ABC):

    @abstractmethod
    async def save(self, progress: StudentProgress) -> None: ...

    @abstractmethod
    async def get(
        self, student_id: str, course_id: CourseId
    ) -> Optional[StudentProgress]: ...
