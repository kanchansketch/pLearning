import pytest
from plearning.domain.entities.assignment import Assignment
from plearning.domain.entities.lesson import Lesson
from plearning.domain.exceptions import AssignmentNotFoundError, InvalidCourseDataError
from plearning.domain.value_objects.ids import AssignmentId, ModuleId


def test_create_lesson_success():
    mod_id = ModuleId.generate()
    lesson = Lesson.create(
        module_id=mod_id,
        title="Intro to Fastapi",
        description="FastAPI basics",
        content="Lesson content body",
        content_url="https://example.com/video.mp4",
    )
    assert lesson.id is not None
    assert lesson.module_id == mod_id
    assert lesson.title == "Intro to Fastapi"
    assert lesson.content == "Lesson content body"
    assert lesson.content_url == "https://example.com/video.mp4"
    assert lesson.assignments == []


def test_create_lesson_empty_title_raises():
    mod_id = ModuleId.generate()
    with pytest.raises(InvalidCourseDataError, match="Lesson title must not be empty."):
        Lesson.create(module_id=mod_id, title="", description="Desc")


def test_add_get_remove_assignment():
    mod_id = ModuleId.generate()
    lesson = Lesson.create(mod_id, "Lesson 1", "Desc")

    assign1 = Assignment.create(lesson.id, "Quiz 1", "Quiz 1 desc")
    assign2 = Assignment.create(lesson.id, "Quiz 2", "Quiz 2 desc")

    lesson.add_assignment(assign1)
    lesson.add_assignment(assign2)
    assert len(lesson.assignments) == 2

    assert lesson.get_assignment(assign1.id).id == assign1.id

    lesson.remove_assignment(assign1.id)
    assert len(lesson.assignments) == 1
    assert lesson.assignments[0].id == assign2.id

    with pytest.raises(AssignmentNotFoundError):
        lesson.get_assignment(assign1.id)

    with pytest.raises(AssignmentNotFoundError):
        lesson.remove_assignment(AssignmentId.generate())
