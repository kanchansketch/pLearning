"""Pydantic schemas for progress endpoints."""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class UpdateProgressRequest(BaseModel):
    student_id: str = Field(..., min_length=1)
    course_id: str = Field(..., min_length=1)
    lesson_id: str = Field(..., min_length=1)


class ProgressResponse(BaseModel):
    model_config = {"from_attributes": True}

    student_id: str
    course_id: str
    completed_lesson_ids: List[str]
    current_lesson_id: Optional[str]
    progress_percentage: float
    last_accessed_at: str
