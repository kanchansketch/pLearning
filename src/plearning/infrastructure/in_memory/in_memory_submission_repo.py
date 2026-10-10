"""In-memory Submission repository."""

from __future__ import annotations

import copy
from typing import Dict, List, Optional

from plearning.domain.entities.submission import Submission
from plearning.domain.repositories.submission_repository import SubmissionRepository
from plearning.domain.value_objects.ids import AssignmentId, SubmissionId


class InMemorySubmissionRepository(SubmissionRepository):

    def __init__(self) -> None:
        self._store: Dict[str, Submission] = {}

    async def save(self, submission: Submission) -> None:
        self._store[submission.id.value] = copy.deepcopy(submission)

    async def get_by_id(self, submission_id: SubmissionId) -> Optional[Submission]:
        s = self._store.get(submission_id.value)
        return copy.deepcopy(s) if s else None

    async def get_by_assignment(self, assignment_id: AssignmentId) -> List[Submission]:
        return [
            copy.deepcopy(s)
            for s in self._store.values()
            if s.assignment_id == assignment_id
        ]

    async def get_by_student_and_assignment(
        self, student_id: str, assignment_id: AssignmentId
    ) -> Optional[Submission]:
        for s in self._store.values():
            if s.student_id == student_id and s.assignment_id == assignment_id:
                return copy.deepcopy(s)
        return None

    async def get_by_student(self, student_id: str) -> List[Submission]:
        return [
            copy.deepcopy(s)
            for s in self._store.values()
            if s.student_id == student_id
        ]
