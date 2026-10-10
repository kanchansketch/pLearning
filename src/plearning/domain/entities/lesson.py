"""
Lesson entity – child of Module.

A Lesson holds the actual learning content and may have Assignments.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

from plearning.domain.exceptions import (
    AssignmentNotFoundError,
    InvalidCourseDataError,
)
from plearning.domain.value_objects.ids import AssignmentId, LessonId, ModuleId


@dataclass
class Lesson:
    """An individual lesson containing learning content."""

    id: LessonId
    module_id: ModuleId
    title: str
    description: str
    content: str = ""
    content_url: str = ""          # video / document URL
    order: int = 0
    assignments: List["Assignment"] = field(default_factory=list)

    def __post_init__(self) -> None:
        self._validate()

    # ── Factory ───────────────────────────────────────────────────

    @classmethod
    def create(
        cls,
        module_id: ModuleId,
        title: str,
        description: str,
        content: str = "",
        content_url: str = "",
    ) -> Lesson:
        return cls(
            id=LessonId.generate(),
            module_id=module_id,
            title=title,
            description=description,
            content=content,
            content_url=content_url,
        )

    # ── Commands ──────────────────────────────────────────────────

    def add_assignment(self, assignment: "Assignment") -> None:
        self.assignments.append(assignment)

    def remove_assignment(self, assignment_id: AssignmentId) -> None:
        original_len = len(self.assignments)
        self.assignments = [a for a in self.assignments if a.id != assignment_id]
        if len(self.assignments) == original_len:
            raise AssignmentNotFoundError(assignment_id.value)

    def get_assignment(self, assignment_id: AssignmentId) -> "Assignment":
        for a in self.assignments:
            if a.id == assignment_id:
                return a
        raise AssignmentNotFoundError(assignment_id.value)

    # ── Private ───────────────────────────────────────────────────

    def _validate(self) -> None:
        if not self.title or not self.title.strip():
            raise InvalidCourseDataError("Lesson title must not be empty.")
