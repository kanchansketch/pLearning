"""In-memory Assessment repository."""

from __future__ import annotations

import copy
from typing import Dict, List, Optional

from plearning.domain.entities.assessment import Assessment, AssessmentAttempt
from plearning.domain.repositories.assessment_repository import AssessmentRepository
from plearning.domain.value_objects.ids import AssessmentId, AttemptId, ModuleId


class InMemoryAssessmentRepository(AssessmentRepository):

    def __init__(self) -> None:
        self._assessments: Dict[str, Assessment] = {}
        self._attempts: Dict[str, AssessmentAttempt] = {}

    async def save_assessment(self, assessment: Assessment) -> None:
        self._assessments[assessment.id.value] = copy.deepcopy(assessment)

    async def get_assessment_by_id(
        self, assessment_id: AssessmentId
    ) -> Optional[Assessment]:
        a = self._assessments.get(assessment_id.value)
        return copy.deepcopy(a) if a else None

    async def get_assessments_by_module(
        self, module_id: ModuleId
    ) -> List[Assessment]:
        return [
            copy.deepcopy(a)
            for a in self._assessments.values()
            if a.module_id == module_id
        ]

    async def save_attempt(self, attempt: AssessmentAttempt) -> None:
        self._attempts[attempt.id.value] = copy.deepcopy(attempt)

    async def get_attempt_by_id(
        self, attempt_id: AttemptId
    ) -> Optional[AssessmentAttempt]:
        a = self._attempts.get(attempt_id.value)
        return copy.deepcopy(a) if a else None

    async def get_attempts_by_student(
        self, student_id: str, assessment_id: AssessmentId
    ) -> List[AssessmentAttempt]:
        return [
            copy.deepcopy(a)
            for a in self._attempts.values()
            if a.student_id == student_id and a.assessment_id == assessment_id
        ]
