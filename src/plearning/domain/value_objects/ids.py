"""
Typed identity value objects.

Each domain entity gets its own ID type so the compiler/type-checker
prevents accidental mix-ups (e.g. passing a ModuleId where a CourseId
is expected).  All IDs are UUID-backed strings.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class CourseId:
    value: str

    @classmethod
    def generate(cls) -> CourseId:
        return cls(value=str(uuid.uuid4()))


@dataclass(frozen=True, slots=True)
class ModuleId:
    value: str

    @classmethod
    def generate(cls) -> ModuleId:
        return cls(value=str(uuid.uuid4()))


@dataclass(frozen=True, slots=True)
class LessonId:
    value: str

    @classmethod
    def generate(cls) -> LessonId:
        return cls(value=str(uuid.uuid4()))


@dataclass(frozen=True, slots=True)
class AssignmentId:
    value: str

    @classmethod
    def generate(cls) -> AssignmentId:
        return cls(value=str(uuid.uuid4()))


@dataclass(frozen=True, slots=True)
class SubmissionId:
    value: str

    @classmethod
    def generate(cls) -> SubmissionId:
        return cls(value=str(uuid.uuid4()))


@dataclass(frozen=True, slots=True)
class EvaluationId:
    value: str

    @classmethod
    def generate(cls) -> EvaluationId:
        return cls(value=str(uuid.uuid4()))


@dataclass(frozen=True, slots=True)
class EnrollmentId:
    value: str

    @classmethod
    def generate(cls) -> EnrollmentId:
        return cls(value=str(uuid.uuid4()))


@dataclass(frozen=True, slots=True)
class AssessmentId:
    value: str

    @classmethod
    def generate(cls) -> AssessmentId:
        return cls(value=str(uuid.uuid4()))


@dataclass(frozen=True, slots=True)
class AttemptId:
    value: str

    @classmethod
    def generate(cls) -> AttemptId:
        return cls(value=str(uuid.uuid4()))
