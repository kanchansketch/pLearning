"""Content Router – /watch_content"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from plearning.application.services.content_service import ContentService
from plearning.domain.exceptions import DomainException
from plearning.interface.api.dependencies import get_content_service
from plearning.interface.schemas.course_schemas import LessonResponse

router = APIRouter(tags=["Content"])


@router.get(
    "/watch_content/{course_id}/{module_id}/{lesson_id}",
    response_model=LessonResponse,
    summary="Watch lesson content (student must be enrolled)",
)
async def watch_content(
    course_id: str,
    module_id: str,
    lesson_id: str,
    student_id: str = "",
    service: ContentService = Depends(get_content_service),
) -> LessonResponse:
    try:
        result = await service.watch_content(
            student_id=student_id,
            course_id=course_id,
            module_id=module_id,
            lesson_id=lesson_id,
        )
        return LessonResponse.model_validate(result)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
