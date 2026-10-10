"""Pydantic schemas for assessment endpoints."""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class StartAssessmentRequest(BaseModel):
    assessment_id: str = Field(..., min_length=1)
    student_id: str = Field(..., min_length=1)


class SubmitAssessmentRequest(BaseModel):
    attempt_id: str = Field(..., min_length=1)
    answers: List[str] = Field(..., min_length=1)


class AssessmentResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    module_id: str
    title: str
    description: str
    questions: List[str]
    time_limit_minutes: int


class AttemptResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    assessment_id: str
    student_id: str
    status: str
    answers: List[str]
    score: Optional[float]
    started_at: str
    submitted_at: Optional[str]
