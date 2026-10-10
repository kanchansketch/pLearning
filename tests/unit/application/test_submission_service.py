import pytest
from plearning.application.dtos.submission_dtos import (
    EvaluateAssignmentDTO,
    SubmitAssignmentDTO,
)
from plearning.application.services.evaluation_service import EvaluationService
from plearning.application.services.submission_service import SubmissionService
from plearning.domain.exceptions import (
    DuplicateSubmissionError,
    SubmissionNotFoundError,
)
from plearning.domain.value_objects.ids import AssignmentId
from plearning.infrastructure.in_memory.in_memory_evaluation_repo import (
    InMemoryEvaluationRepository,
)
from plearning.infrastructure.in_memory.in_memory_submission_repo import (
    InMemorySubmissionRepository,
)


@pytest.fixture
def submission_repo():
    return InMemorySubmissionRepository()


@pytest.fixture
def evaluation_repo():
    return InMemoryEvaluationRepository()


@pytest.fixture
def submission_service(submission_repo):
    return SubmissionService(submission_repo=submission_repo)


@pytest.fixture
def evaluation_service(evaluation_repo, submission_repo):
    return EvaluationService(
        evaluation_repo=evaluation_repo,
        submission_repo=submission_repo,
    )


@pytest.mark.asyncio
async def test_submit_assignment_success(submission_service):
    asg_id = AssignmentId.generate().value
    dto = SubmitAssignmentDTO(
        assignment_id=asg_id,
        student_id="student_1",
        content="Here is my code solution",
    )
    res = await submission_service.submit_assignment(dto)
    assert res.student_id == "student_1"
    assert res.assignment_id == asg_id
    assert res.content == "Here is my code solution"

    subs = await submission_service.get_submissions_for_assignment(asg_id)
    assert len(subs) == 1


@pytest.mark.asyncio
async def test_duplicate_submission_raises(submission_service):
    asg_id = AssignmentId.generate().value
    dto = SubmitAssignmentDTO(
        assignment_id=asg_id,
        student_id="student_1",
        content="My first submission",
    )
    await submission_service.submit_assignment(dto)

    with pytest.raises(DuplicateSubmissionError):
        await submission_service.submit_assignment(dto)


@pytest.mark.asyncio
async def test_evaluate_submission_success(submission_service, evaluation_service):
    asg_id = AssignmentId.generate().value
    sub_dto = SubmitAssignmentDTO(
        assignment_id=asg_id,
        student_id="student_1",
        content="Solution",
    )
    sub = await submission_service.submit_assignment(sub_dto)

    eval_dto = EvaluateAssignmentDTO(
        submission_id=sub.id,
        score=95.0,
        feedback="Excellent job!",
    )
    eval_res = await evaluation_service.evaluate(eval_dto)
    assert eval_res.score == 95.0
    assert eval_res.feedback == "Excellent job!"

    retrieved = await evaluation_service.get_evaluation(sub.id)
    assert retrieved.id == eval_res.id


@pytest.mark.asyncio
async def test_evaluate_nonexistent_submission(evaluation_service):
    eval_dto = EvaluateAssignmentDTO(
        submission_id="non-existent-sub",
        score=80.0,
        feedback="Ok",
    )
    with pytest.raises(SubmissionNotFoundError):
        await evaluation_service.evaluate(eval_dto)
