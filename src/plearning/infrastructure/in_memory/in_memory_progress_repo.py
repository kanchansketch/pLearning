"""In-memory Progress repository."""

from __future__ import annotations

import copy
from typing import Dict, Optional

from plearning.domain.entities.student_progress import StudentProgress
from plearning.domain.repositories.progress_repository import ProgressRepository
from plearning.domain.value_objects.ids import CourseId


class InMemoryProgressRepository(ProgressRepository):

    def __init__(self) -> None:
        self._store: Dict[str, StudentProgress] = {}

    def _key(self, student_id: str, course_id: CourseId) -> str:
        return f"{student_id}::{course_id.value}"

    async def save(self, progress: StudentProgress) -> None:
        key = self._key(progress.student_id, progress.course_id)
        self._store[key] = copy.deepcopy(progress)

    async def get(
        self, student_id: str, course_id: CourseId
    ) -> Optional[StudentProgress]:
        key = self._key(student_id, course_id)
        p = self._store.get(key)
        return copy.deepcopy(p) if p else None
