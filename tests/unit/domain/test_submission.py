import pytest
from plearning.domain.entities.evaluation import Evaluation
from plearning.domain.entities.submission import Submission
from plearning.domain.exceptions import DomainException
from plearning.domain.value_objects.ids import AssignmentId, SubmissionId


def test_create_submission():
    assignment_id = AssignmentId.generate()
    sub = Submission.create(
        assignment_id=assignment_id,
        student_id="student_1",
        content="My answer to the assignment",
    )
    assert sub.id is not None
    assert sub.assignment_id == assignment_id
    assert sub.student_id == "student_1"
    assert sub.content == "My answer to the assignment"
    assert sub.submitted_at is not None


def test_create_evaluation():
    submission_id = SubmissionId.generate()
    evaln = Evaluation.create(
        submission_id=submission_id,
        score=95.0,
        feedback="Great work!",
    )
    assert evaln.id is not None
    assert evaln.submission_id == submission_id
    assert evaln.score == 95.0
    assert evaln.feedback == "Great work!"


def test_create_evaluation_invalid_score():
    submission_id = SubmissionId.generate()
    with pytest.raises(DomainException, match="Score must be between 0 and 100"):
        Evaluation.create(submission_id, -5.0, "Poor")

    with pytest.raises(DomainException, match="Score must be between 0 and 100"):
        Evaluation.create(submission_id, 105.0, "Over max")
