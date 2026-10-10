import pytest
from plearning.application.dtos.assessment_dtos import (
    StartAssessmentDTO,
    SubmitAssessmentDTO,
)
from plearning.application.services.assessment_service import AssessmentService
from plearning.domain.entities.assessment import Assessment
from plearning.domain.exceptions import (
    AssessmentNotFoundError,
    AttemptAlreadySubmittedError,
    AttemptNotFoundError,
)
from plearning.domain.value_objects.ids import ModuleId
from plearning.infrastructure.in_memory.in_memory_assessment_repo import (
    InMemoryAssessmentRepository,
)


@pytest.fixture
def assessment_repo():
    return InMemoryAssessmentRepository()


@pytest.fixture
def assessment_service(assessment_repo):
    return AssessmentService(assessment_repo=assessment_repo)


@pytest.mark.asyncio
async def test_start_and_submit_assessment(assessment_repo, assessment_service):
    assessment = Assessment.create(
        module_id=ModuleId.generate(),
        title="Quiz 1",
        description="Math Quiz",
        questions=["1 + 1 = ?"],
    )
    await assessment_repo.save_assessment(assessment)

    # Start attempt
    start_dto = StartAssessmentDTO(
        assessment_id=assessment.id.value,
        student_id="student_1",
    )
    attempt = await assessment_service.start_assessment(start_dto)
    assert attempt.status == "in_progress"
    assert attempt.student_id == "student_1"
    assert attempt.assessment_id == assessment.id.value

    # Submit attempt
    sub_dto = SubmitAssessmentDTO(
        attempt_id=attempt.id,
        answers=["2"],
    )
    submitted = await assessment_service.submit_assessment(sub_dto)
    assert submitted.status == "submitted"
    assert submitted.answers == ["2"]
    assert submitted.submitted_at is not None

    # Submitting again raises AttemptAlreadySubmittedError
    with pytest.raises(AttemptAlreadySubmittedError):
        await assessment_service.submit_assessment(sub_dto)


@pytest.mark.asyncio
async def test_start_nonexistent_assessment(assessment_service):
    with pytest.raises(AssessmentNotFoundError):
        await assessment_service.start_assessment(
            StartAssessmentDTO(assessment_id="missing", student_id="s1")
        )


@pytest.mark.asyncio
async def test_submit_nonexistent_attempt(assessment_service):
    with pytest.raises(AttemptNotFoundError):
        await assessment_service.submit_assessment(
            SubmitAssessmentDTO(attempt_id="missing", answers=["ans"])
        )
