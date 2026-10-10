"""
Course repository interface (port).

The domain layer depends only on this abstraction; concrete implementations
live in the infrastructure layer.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, Optional

from plearning.domain.entities.course import Course
from plearning.domain.value_objects.ids import CourseId


class CourseRepository(ABC):
    """Abstract repository for Course aggregate persistence."""

    @abstractmethod
    async def save(self, course: Course) -> None:
        """Persist a course (insert or update)."""
        ...

    @abstractmethod
    async def get_by_id(self, course_id: CourseId) -> Optional[Course]:
        """Retrieve a course by its ID, including modules/lessons/assignments."""
        ...

    @abstractmethod
    async def get_all(self) -> List[Course]:
        """Return all courses."""
        ...

    @abstractmethod
    async def get_by_teacher(self, teacher_id: str) -> List[Course]:
        """Return all courses owned by a teacher."""
        ...

    @abstractmethod
    async def delete(self, course_id: CourseId) -> None:
        """Delete a course."""
        ...
