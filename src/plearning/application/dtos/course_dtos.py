"""
Course DTOs – plain data containers for the application layer.

These decouple the domain entities from the interface layer,
ensuring the API never leaks internal domain details.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


# ── Input DTOs (commands) ─────────────────────────────────────────


@dataclass(frozen=True)
class CreateAssignmentDTO:
    title: str
    description: str
    questions: List[str] = field(default_factory=list)


@dataclass(frozen=True)
class CreateLessonDTO:
    title: str
    description: str
    content: str = ""
    content_url: str = ""
    assignments: List[CreateAssignmentDTO] = field(default_factory=list)


@dataclass(frozen=True)
class CreateModuleDTO:
    title: str
    description: str
    lessons: List[CreateLessonDTO] = field(default_factory=list)


@dataclass(frozen=True)
class CreateCourseDTO:
    title: str
    description: str
    teacher_id: str
    modules: List[CreateModuleDTO] = field(default_factory=list)


@dataclass(frozen=True)
class UpdateCourseDTO:
    title: Optional[str] = None
    description: Optional[str] = None


# ── Output DTOs (read models) ────────────────────────────────────


@dataclass(frozen=True)
class AssignmentOut:
    id: str
    lesson_id: str
    title: str
    description: str
    questions: List[str]


@dataclass(frozen=True)
class LessonOut:
    id: str
    module_id: str
    title: str
    description: str
    content: str
    content_url: str
    order: int
    assignments: List[AssignmentOut]


@dataclass(frozen=True)
class ModuleOut:
    id: str
    course_id: str
    title: str
    description: str
    order: int
    lessons: List[LessonOut]


@dataclass(frozen=True)
class CourseOut:
    id: str
    title: str
    description: str
    teacher_id: str
    modules: List[ModuleOut]
    created_at: str
    updated_at: str
