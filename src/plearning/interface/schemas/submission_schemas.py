"""Pydantic schemas for submission and evaluation endpoints."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class SubmitAssignmentRequest(BaseModel):
    assignment_id: str = Field(..., min_length=1)
    student_id: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)


class SubmissionResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    assignment_id: str
    student_id: str
    content: str
    submitted_at: str


class EvaluateAssignmentRequest(BaseModel):
    submission_id: str = Field(..., min_length=1)
    score: float = Field(..., ge=0, le=100)
    feedback: str = ""


class EvaluationResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    submission_id: str
    score: float
    feedback: str
    evaluated_at: str
