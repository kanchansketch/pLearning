"""
Pydantic request/response schemas for Course endpoints.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


# ── Request Schemas ───────────────────────────────────────────────


class CreateAssignmentRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = ""
    questions: List[str] = Field(default_factory=list)


class CreateLessonRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = ""
    content: str = ""
    content_url: str = ""
    assignments: List[CreateAssignmentRequest] = Field(default_factory=list)


class CreateModuleRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = ""
    lessons: List[CreateLessonRequest] = Field(default_factory=list)


class CreateCourseRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = ""
    teacher_id: str = Field(..., min_length=1)
    modules: List[CreateModuleRequest] = Field(default_factory=list)


class UpdateCourseRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


# ── Response Schemas ──────────────────────────────────────────────


class AssignmentResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    lesson_id: str
    title: str
    description: str
    questions: List[str]


class LessonResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    module_id: str
    title: str
    description: str
    content: str
    content_url: str
    order: int
    assignments: List[AssignmentResponse]


class ModuleResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    course_id: str
    title: str
    description: str
    order: int
    lessons: List[LessonResponse]


class CourseResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    title: str
    description: str
    teacher_id: str
    modules: List[ModuleResponse]
    created_at: str
    updated_at: str
