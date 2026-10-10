"""Progress DTOs."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass(frozen=True)
class UpdateProgressDTO:
    student_id: str
    course_id: str
    lesson_id: str


@dataclass(frozen=True)
class ProgressOut:
    student_id: str
    course_id: str
    completed_lesson_ids: List[str]
    current_lesson_id: Optional[str]
    progress_percentage: float
    last_accessed_at: str
