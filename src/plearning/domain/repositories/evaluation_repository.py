"""
Evaluation repository interface.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, Optional

from plearning.domain.entities.evaluation import Evaluation
from plearning.domain.value_objects.ids import EvaluationId, SubmissionId


class EvaluationRepository(ABC):

    @abstractmethod
    async def save(self, evaluation: Evaluation) -> None: ...

    @abstractmethod
    async def get_by_id(self, evaluation_id: EvaluationId) -> Optional[Evaluation]: ...

    @abstractmethod
    async def get_by_submission(
        self, submission_id: SubmissionId
    ) -> Optional[Evaluation]: ...

    @abstractmethod
    async def get_all_for_assignment_submissions(
        self, submission_ids: List[SubmissionId]
    ) -> List[Evaluation]: ...
