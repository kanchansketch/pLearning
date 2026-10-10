"""Assessment Router – /start_assessment, /submit_assessment"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from plearning.application.dtos.assessment_dtos import (
    StartAssessmentDTO,
    SubmitAssessmentDTO,
)
from plearning.application.services.assessment_service import AssessmentService
from plearning.domain.exceptions import DomainException
from plearning.interface.api.dependencies import get_assessment_service
from plearning.interface.schemas.assessment_schemas import (
    AttemptResponse,
    StartAssessmentRequest,
    SubmitAssessmentRequest,
)

router = APIRouter(tags=["Assessments"])


@router.post(
    "/start_assessment",
    response_model=AttemptResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start an assessment attempt",
)
async def start_assessment(
    body: StartAssessmentRequest,
    service: AssessmentService = Depends(get_assessment_service),
) -> AttemptResponse:
    try:
        dto = StartAssessmentDTO(
            assessment_id=body.assessment_id,
            student_id=body.student_id,
        )
        result = await service.start_assessment(dto)
        return AttemptResponse.model_validate(result)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.post(
    "/submit_assessment",
    response_model=AttemptResponse,
    summary="Submit answers for an assessment",
)
async def submit_assessment(
    body: SubmitAssessmentRequest,
    service: AssessmentService = Depends(get_assessment_service),
) -> AttemptResponse:
    try:
        dto = SubmitAssessmentDTO(
            attempt_id=body.attempt_id,
            answers=list(body.answers),
        )
        result = await service.submit_assessment(dto)
        return AttemptResponse.model_validate(result)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
