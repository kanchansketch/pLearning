"""Enrollment DTOs."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class EnrollCourseDTO:
    student_id: str
    course_id: str


@dataclass(frozen=True)
class EnrollmentOut:
    id: str
    course_id: str
    student_id: str
    enrolled_at: str
