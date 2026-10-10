"""Progress Router – /update_progress"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from plearning.application.dtos.progress_dtos import UpdateProgressDTO
from plearning.application.services.progress_service import ProgressService
from plearning.domain.exceptions import DomainException
from plearning.interface.api.dependencies import get_progress_service
from plearning.interface.schemas.progress_schemas import (
    ProgressResponse,
    UpdateProgressRequest,
)

router = APIRouter(tags=["Progress"])


@router.put(
    "/update_progress",
    response_model=ProgressResponse,
    summary="Mark a lesson as complete and update progress",
)
async def update_progress(
    body: UpdateProgressRequest,
    service: ProgressService = Depends(get_progress_service),
) -> ProgressResponse:
    try:
        dto = UpdateProgressDTO(
            student_id=body.student_id,
            course_id=body.course_id,
            lesson_id=body.lesson_id,
        )
        result = await service.update_progress(dto)
        return ProgressResponse.model_validate(result)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get(
    "/update_progress/{student_id}/{course_id}",
    response_model=ProgressResponse,
    summary="View student progress for a course",
)
async def view_progress(
    student_id: str,
    course_id: str,
    service: ProgressService = Depends(get_progress_service),
) -> ProgressResponse:
    try:
        result = await service.get_progress(student_id, course_id)
        return ProgressResponse.model_validate(result)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
