"""
In-memory Course repository – used for unit/integration testing.
"""

from __future__ import annotations

import copy
from typing import Dict, List, Optional

from plearning.domain.entities.course import Course
from plearning.domain.repositories.course_repository import CourseRepository
from plearning.domain.value_objects.ids import CourseId


class InMemoryCourseRepository(CourseRepository):
    """Dictionary-backed course store for fast, dependency-free tests."""

    def __init__(self) -> None:
        self._store: Dict[str, Course] = {}

    async def save(self, course: Course) -> None:
        self._store[course.id.value] = copy.deepcopy(course)

    async def get_by_id(self, course_id: CourseId) -> Optional[Course]:
        course = self._store.get(course_id.value)
        return copy.deepcopy(course) if course else None

    async def get_all(self) -> List[Course]:
        return [copy.deepcopy(c) for c in self._store.values()]

    async def get_by_teacher(self, teacher_id: str) -> List[Course]:
        return [
            copy.deepcopy(c)
            for c in self._store.values()
            if c.teacher_id == teacher_id
        ]

    async def delete(self, course_id: CourseId) -> None:
        self._store.pop(course_id.value, None)
