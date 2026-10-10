import pytest
from plearning.domain.entities.assignment import Assignment
from plearning.domain.exceptions import InvalidCourseDataError
from plearning.domain.value_objects.ids import LessonId


def test_create_assignment_success():
    lesson_id = LessonId.generate()
    assignment = Assignment.create(
        lesson_id=lesson_id,
        title="Assignment 1",
        description="First homework",
        questions=["What is DDD?"],
    )
    assert assignment.id is not None
    assert assignment.lesson_id == lesson_id
    assert assignment.title == "Assignment 1"
    assert len(assignment.questions) == 1


def test_create_assignment_empty_title_raises():
    lesson_id = LessonId.generate()
    with pytest.raises(InvalidCourseDataError, match="Assignment title must not be empty."):
        Assignment.create(
            lesson_id=lesson_id,
            title="",
            description="Desc",
        )


def test_add_and_update_questions():
    lesson_id = LessonId.generate()
    assignment = Assignment.create(
        lesson_id=lesson_id,
        title="Homework",
        description="Desc",
    )
    assignment.add_question("Q1: Explain entity vs value object.")
    assert len(assignment.questions) == 1

    with pytest.raises(InvalidCourseDataError, match="Question text must not be empty."):
        assignment.add_question("   ")

    assignment.update_questions(["Q1", "Q2", "Q3"])
    assert len(assignment.questions) == 3
