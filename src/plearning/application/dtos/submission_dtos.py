"""Submission DTOs."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SubmitAssignmentDTO:
    assignment_id: str
    student_id: str
    content: str


@dataclass(frozen=True)
class SubmissionOut:
    id: str
    assignment_id: str
    student_id: str
    content: str
    submitted_at: str


@dataclass(frozen=True)
class EvaluateAssignmentDTO:
    submission_id: str
    score: float
    feedback: str


@dataclass(frozen=True)
class EvaluationOut:
    id: str
    submission_id: str
    score: float
    feedback: str
    evaluated_at: str
