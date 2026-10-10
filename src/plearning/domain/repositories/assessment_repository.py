"""
Assessment repository interface.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, Optional

from plearning.domain.entities.assessment import Assessment, AssessmentAttempt
from plearning.domain.value_objects.ids import AssessmentId, AttemptId, ModuleId


class AssessmentRepository(ABC):

    @abstractmethod
    async def save_assessment(self, assessment: Assessment) -> None: ...

    @abstractmethod
    async def get_assessment_by_id(
        self, assessment_id: AssessmentId
    ) -> Optional[Assessment]: ...

    @abstractmethod
    async def get_assessments_by_module(
        self, module_id: ModuleId
    ) -> List[Assessment]: ...

    @abstractmethod
    async def save_attempt(self, attempt: AssessmentAttempt) -> None: ...

    @abstractmethod
    async def get_attempt_by_id(
        self, attempt_id: AttemptId
    ) -> Optional[AssessmentAttempt]: ...

    @abstractmethod
    async def get_attempts_by_student(
        self, student_id: str, assessment_id: AssessmentId
    ) -> List[AssessmentAttempt]: ...
