"""Assessment DTOs."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass(frozen=True)
class StartAssessmentDTO:
    assessment_id: str
    student_id: str


@dataclass(frozen=True)
class SubmitAssessmentDTO:
    attempt_id: str
    answers: List[str]


@dataclass(frozen=True)
class AssessmentOut:
    id: str
    module_id: str
    title: str
    description: str
    questions: List[str]
    time_limit_minutes: int


@dataclass(frozen=True)
class AttemptOut:
    id: str
    assessment_id: str
    student_id: str
    status: str
    answers: List[str]
    score: Optional[float]
    started_at: str
    submitted_at: Optional[str]
