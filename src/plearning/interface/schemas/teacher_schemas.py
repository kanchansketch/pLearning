"""
Pydantic schemas for Teacher Studio & Curriculum Builder endpoints.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class TeacherMetricItem(BaseModel):
    label: str
    value: str
    delta: str
    positive: Optional[bool] = None


class TeacherAnalyticsResponse(BaseModel):
    total_enrollment: int
    avg_completion_rate: float
    active_learners_now: int
    student_satisfaction: float
    metrics: List[TeacherMetricItem]


class TeacherCourseSummary(BaseModel):
    id: str
    title: str
    description: str
    lessons: int
    modules: int
    students: int
    todayNew: int
    completion: float
    rating: float
    status: str
    category: str
    updated_at: str


class CreateTeacherCourseRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = ""
    category: str = "Architecture & Design"
    status: str = "Draft"
    rating: float = 4.8


class UpdateCourseStatusRequest(BaseModel):
    status: str = Field(..., pattern="^(Published|Draft|Archived)$")


class CurriculumLessonItem(BaseModel):
    id: str
    title: str
    content: str = ""
    content_type: str = "Rich Text Article"
    content_url: str = ""
    duration: str = "25 minutes"
    access: str = "Enrolled Students Only"
    active: bool = False


class CurriculumModuleItem(BaseModel):
    id: str
    title: str
    active: bool = False
    lessons: List[CurriculumLessonItem] = Field(default_factory=list)


class CurriculumTreeResponse(BaseModel):
    course_id: str
    title: str
    status: str
    modules: List[CurriculumModuleItem]


class SaveCurriculumTreeRequest(BaseModel):
    title: Optional[str] = None
    modules: List[CurriculumModuleItem]
