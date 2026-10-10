import pytest
from plearning.domain.entities.assessment import (
    Assessment,
    AssessmentAttempt,
    AttemptStatus,
)
from plearning.domain.exceptions import (
    AttemptAlreadySubmittedError,
    AttemptNotInProgressError,
)
from plearning.domain.value_objects.ids import AssessmentId, ModuleId


def test_create_assessment():
    mod_id = ModuleId.generate()
    assessment = Assessment.create(
        module_id=mod_id,
        title="Midterm Exam",
        description="Covers modules 1-3",
        questions=["Q1?", "Q2?"],
        time_limit_minutes=60,
    )
    assert assessment.id is not None
    assert assessment.module_id == mod_id
    assert assessment.title == "Midterm Exam"
    assert len(assessment.questions) == 2
    assert assessment.time_limit_minutes == 60


def test_assessment_attempt_lifecycle():
    assessment_id = AssessmentId.generate()
    attempt = AssessmentAttempt.start(
        assessment_id=assessment_id,
        student_id="student_1",
    )
    assert attempt.status == AttemptStatus.IN_PROGRESS
    assert attempt.answers == []
    assert attempt.score is None

    # Submit answers
    attempt.submit(answers=["Ans 1", "Ans 2"])
    assert attempt.status == AttemptStatus.SUBMITTED
    assert attempt.answers == ["Ans 1", "Ans 2"]
    assert attempt.submitted_at is not None

    # Submitting again raises error
    with pytest.raises(AttemptAlreadySubmittedError):
        attempt.submit(["Other answers"])

    # Grade
    attempt.grade(88.5)
    assert attempt.status == AttemptStatus.GRADED
    assert attempt.score == 88.5

    # Submitting after graded raises AttemptNotInProgressError
    with pytest.raises(AttemptNotInProgressError):
        attempt.submit(["Other answers"])
