"""Submission Router – /submit_assignment"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from plearning.application.dtos.submission_dtos import SubmitAssignmentDTO
from plearning.application.services.submission_service import SubmissionService
from plearning.domain.exceptions import DomainException
from plearning.interface.api.dependencies import get_submission_service
from plearning.interface.schemas.submission_schemas import (
    SubmissionResponse,
    SubmitAssignmentRequest,
)

router = APIRouter(tags=["Submissions"])


@router.post(
    "/submit_assignment",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit an assignment",
)
async def submit_assignment(
    body: SubmitAssignmentRequest,
    service: SubmissionService = Depends(get_submission_service),
) -> SubmissionResponse:
    try:
        dto = SubmitAssignmentDTO(
            assignment_id=body.assignment_id,
            student_id=body.student_id,
            content=body.content,
        )
        result = await service.submit_assignment(dto)
        return SubmissionResponse.model_validate(result)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get(
    "/submit_assignment/{assignment_id}",
    response_model=List[SubmissionResponse],
    summary="View submissions for an assignment",
)
async def view_submissions(
    assignment_id: str,
    service: SubmissionService = Depends(get_submission_service),
) -> List[SubmissionResponse]:
    results = await service.get_submissions_for_assignment(assignment_id)
    return [SubmissionResponse.model_validate(r) for r in results]
