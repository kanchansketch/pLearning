"""
Teacher Studio Router – /teacher/analytics, /teacher/courses, /teacher/curriculum
"""

from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from plearning.application.services.teacher_service import TeacherService
from plearning.domain.exceptions import DomainException
from plearning.infrastructure.persistence.database import get_session
from plearning.interface.schemas.teacher_schemas import (
    CreateTeacherCourseRequest,
    CurriculumTreeResponse,
    SaveCurriculumTreeRequest,
    TeacherAnalyticsResponse,
    TeacherCourseSummary,
    UpdateCourseStatusRequest,
)

router = APIRouter(prefix="/teacher", tags=["Teacher Studio"])


def get_teacher_service(session: AsyncSession = Depends(get_session)) -> TeacherService:
    return TeacherService(session)


@router.get(
    "/analytics",
    response_model=TeacherAnalyticsResponse,
    summary="Get Teacher Studio dashboard analytics and metrics",
)
async def get_analytics(
    teacher_id: str = Query("teacher_marcus", description="Teacher ID"),
    service: TeacherService = Depends(get_teacher_service),
) -> TeacherAnalyticsResponse:
    try:
        return await service.get_analytics(teacher_id)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get(
    "/courses",
    response_model=List[TeacherCourseSummary],
    summary="Get courses managed by teacher with enrollment and completion statistics",
)
async def get_teacher_courses(
    teacher_id: Optional[str] = Query(None, description="Teacher ID"),
    service: TeacherService = Depends(get_teacher_service),
) -> List[TeacherCourseSummary]:
    try:
        return await service.get_teacher_courses(teacher_id)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.post(
    "/courses",
    response_model=TeacherCourseSummary,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new course draft in Teacher Studio",
)
async def create_course(
    req: CreateTeacherCourseRequest,
    teacher_id: str = Query("teacher_marcus", description="Teacher ID"),
    service: TeacherService = Depends(get_teacher_service),
) -> TeacherCourseSummary:
    try:
        return await service.create_course(teacher_id, req)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.patch(
    "/courses/{course_id}/status",
    response_model=TeacherCourseSummary,
    summary="Toggle or update course status (Published/Draft/Archived)",
)
async def update_status(
    course_id: str,
    req: UpdateCourseStatusRequest,
    service: TeacherService = Depends(get_teacher_service),
) -> TeacherCourseSummary:
    try:
        return await service.update_status(course_id, req.status)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.get(
    "/curriculum/{course_id}",
    response_model=CurriculumTreeResponse,
    summary="Get hierarchical curriculum tree for Curriculum Builder editor",
)
async def get_curriculum(
    course_id: str,
    service: TeacherService = Depends(get_teacher_service),
) -> CurriculumTreeResponse:
    try:
        return await service.get_curriculum(course_id)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.put(
    "/curriculum/{course_id}",
    response_model=CurriculumTreeResponse,
    summary="Save / Auto-save entire curriculum tree from Curriculum Builder",
)
async def save_curriculum(
    course_id: str,
    req: SaveCurriculumTreeRequest,
    service: TeacherService = Depends(get_teacher_service),
) -> CurriculumTreeResponse:
    try:
        return await service.save_curriculum(course_id, req)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
