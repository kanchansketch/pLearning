"""In-memory Evaluation repository."""

from __future__ import annotations

import copy
from typing import Dict, List, Optional

from plearning.domain.entities.evaluation import Evaluation
from plearning.domain.repositories.evaluation_repository import EvaluationRepository
from plearning.domain.value_objects.ids import EvaluationId, SubmissionId


class InMemoryEvaluationRepository(EvaluationRepository):

    def __init__(self) -> None:
        self._store: Dict[str, Evaluation] = {}

    async def save(self, evaluation: Evaluation) -> None:
        self._store[evaluation.id.value] = copy.deepcopy(evaluation)

    async def get_by_id(
        self, evaluation_id: EvaluationId
    ) -> Optional[Evaluation]:
        e = self._store.get(evaluation_id.value)
        return copy.deepcopy(e) if e else None

    async def get_by_submission(
        self, submission_id: SubmissionId
    ) -> Optional[Evaluation]:
        for e in self._store.values():
            if e.submission_id == submission_id:
                return copy.deepcopy(e)
        return None

    async def get_all_for_assignment_submissions(
        self, submission_ids: List[SubmissionId]
    ) -> List[Evaluation]:
        id_set = {sid.value for sid in submission_ids}
        return [
            copy.deepcopy(e)
            for e in self._store.values()
            if e.submission_id.value in id_set
        ]
