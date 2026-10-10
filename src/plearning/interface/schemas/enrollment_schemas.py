"""Pydantic schemas for enrollment endpoints."""

from __future__ import annotations

from pydantic import BaseModel, Field


class EnrollCourseRequest(BaseModel):
    student_id: str = Field(..., min_length=1)
    course_id: str = Field(..., min_length=1)


class EnrollmentResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    course_id: str
    student_id: str
    enrolled_at: str
