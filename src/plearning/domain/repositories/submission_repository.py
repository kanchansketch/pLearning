"""
Submission repository interface.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, Optional

from plearning.domain.entities.submission import Submission
from plearning.domain.value_objects.ids import AssignmentId, SubmissionId


class SubmissionRepository(ABC):

    @abstractmethod
    async def save(self, submission: Submission) -> None: ...

    @abstractmethod
    async def get_by_id(self, submission_id: SubmissionId) -> Optional[Submission]: ...

    @abstractmethod
    async def get_by_assignment(self, assignment_id: AssignmentId) -> List[Submission]: ...

    @abstractmethod
    async def get_by_student_and_assignment(
        self, student_id: str, assignment_id: AssignmentId
    ) -> Optional[Submission]: ...

    @abstractmethod
    async def get_by_student(self, student_id: str) -> List[Submission]: ...
