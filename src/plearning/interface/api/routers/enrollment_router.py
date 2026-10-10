"""Enrollment Router – /enroll_courses"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from plearning.application.dtos.enrollment_dtos import EnrollCourseDTO
from plearning.application.services.enrollment_service import EnrollmentService
from plearning.domain.exceptions import DomainException
from plearning.interface.api.dependencies import get_enrollment_service
from plearning.interface.schemas.enrollment_schemas import (
    EnrollCourseRequest,
    EnrollmentResponse,
)

router = APIRouter(tags=["Enrollment"])


@router.post(
    "/enroll_courses",
    response_model=EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enroll a student in a course",
)
async def enroll_course(
    body: EnrollCourseRequest,
    service: EnrollmentService = Depends(get_enrollment_service),
) -> EnrollmentResponse:
    try:
        dto = EnrollCourseDTO(student_id=body.student_id, course_id=body.course_id)
        result = await service.enroll(dto)
        return EnrollmentResponse.model_validate(result)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get(
    "/enroll_courses/{student_id}",
    response_model=List[EnrollmentResponse],
    summary="View a student's enrollments",
)
async def view_enrollments(
    student_id: str,
    service: EnrollmentService = Depends(get_enrollment_service),
) -> List[EnrollmentResponse]:
    results = await service.get_student_enrollments(student_id)
    return [EnrollmentResponse.model_validate(r) for r in results]
