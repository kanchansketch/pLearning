"""
Course entity – Aggregate Root.

A Course is the top-level aggregate that owns Modules.
All invariants for the course structure are enforced here.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional

from plearning.domain.exceptions import (
    InvalidCourseDataError,
    ModuleNotFoundError,
)
from plearning.domain.value_objects.ids import CourseId, ModuleId


@dataclass
class Course:
    """Aggregate root for the course bounded context."""

    id: CourseId
    title: str
    description: str
    teacher_id: str
    modules: List["Module"] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self) -> None:
        self._validate()

    # ── Factory ───────────────────────────────────────────────────

    @classmethod
    def create(
        cls,
        title: str,
        description: str,
        teacher_id: str,
    ) -> Course:
        """Create a new course with generated ID."""
        return cls(
            id=CourseId.generate(),
            title=title,
            description=description,
            teacher_id=teacher_id,
        )

    # ── Commands ──────────────────────────────────────────────────

    def add_module(self, module: "Module") -> None:
        """Add a module to the course."""
        module.order = len(self.modules) + 1
        self.modules.append(module)
        self._touch()

    def remove_module(self, module_id: ModuleId) -> None:
        """Remove a module and re-order remaining."""
        original_len = len(self.modules)
        self.modules = [m for m in self.modules if m.id != module_id]
        if len(self.modules) == original_len:
            raise ModuleNotFoundError(module_id.value)
        self._reorder_modules()
        self._touch()

    def get_module(self, module_id: ModuleId) -> "Module":
        """Retrieve a module by ID."""
        for m in self.modules:
            if m.id == module_id:
                return m
        raise ModuleNotFoundError(module_id.value)

    def update(
        self,
        title: Optional[str] = None,
        description: Optional[str] = None,
    ) -> None:
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description
        self._validate()
        self._touch()

    # ── Private ───────────────────────────────────────────────────

    def _validate(self) -> None:
        if not self.title or not self.title.strip():
            raise InvalidCourseDataError("Title must not be empty.")
        if not self.teacher_id or not self.teacher_id.strip():
            raise InvalidCourseDataError("Teacher ID must not be empty.")

    def _touch(self) -> None:
        self.updated_at = datetime.now(timezone.utc)

    def _reorder_modules(self) -> None:
        for idx, mod in enumerate(self.modules, start=1):
            mod.order = idx
