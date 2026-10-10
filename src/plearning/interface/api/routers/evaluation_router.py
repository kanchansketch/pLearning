"""Evaluation Router – /evaluate_assignment"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from plearning.application.dtos.submission_dtos import EvaluateAssignmentDTO
from plearning.application.services.evaluation_service import EvaluationService
from plearning.domain.exceptions import DomainException
from plearning.interface.api.dependencies import get_evaluation_service
from plearning.interface.schemas.submission_schemas import (
    EvaluateAssignmentRequest,
    EvaluationResponse,
)

router = APIRouter(tags=["Evaluations"])


@router.post(
    "/evaluate_assignment",
    response_model=EvaluationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Evaluate a student's submission",
)
async def evaluate_assignment(
    body: EvaluateAssignmentRequest,
    service: EvaluationService = Depends(get_evaluation_service),
) -> EvaluationResponse:
    try:
        dto = EvaluateAssignmentDTO(
            submission_id=body.submission_id,
            score=body.score,
            feedback=body.feedback,
        )
        result = await service.evaluate(dto)
        return EvaluationResponse.model_validate(result)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get(
    "/evaluate_assignment/{submission_id}",
    response_model=EvaluationResponse,
    summary="Get evaluation for a submission",
)
async def get_evaluation(
    submission_id: str,
    service: EvaluationService = Depends(get_evaluation_service),
) -> EvaluationResponse:
    try:
        result = await service.get_evaluation(submission_id)
        return EvaluationResponse.model_validate(result)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
