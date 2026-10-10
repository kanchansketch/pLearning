import pytest
from plearning.domain.entities.lesson import Lesson
from plearning.domain.entities.module import Module
from plearning.domain.exceptions import InvalidCourseDataError, LessonNotFoundError
from plearning.domain.value_objects.ids import CourseId, LessonId


def test_create_module_success():
    course_id = CourseId.generate()
    module = Module.create(course_id, "Module 1", "Module description")
    assert module.id is not None
    assert module.course_id == course_id
    assert module.title == "Module 1"
    assert module.description == "Module description"
    assert module.lessons == []


def test_create_module_empty_title_raises():
    course_id = CourseId.generate()
    with pytest.raises(InvalidCourseDataError, match="Module title must not be empty."):
        Module.create(course_id, "  ", "Description")


def test_add_get_and_remove_lesson():
    course_id = CourseId.generate()
    module = Module.create(course_id, "Module 1", "Desc")

    lesson1 = Lesson.create(module.id, "Lesson 1", "Desc 1")
    lesson2 = Lesson.create(module.id, "Lesson 2", "Desc 2")

    module.add_lesson(lesson1)
    module.add_lesson(lesson2)

    assert len(module.lessons) == 2
    assert module.lessons[0].order == 1
    assert module.lessons[1].order == 2

    retrieved = module.get_lesson(lesson1.id)
    assert retrieved.id == lesson1.id

    module.remove_lesson(lesson1.id)
    assert len(module.lessons) == 1
    assert module.lessons[0].id == lesson2.id
    assert module.lessons[0].order == 1

    with pytest.raises(LessonNotFoundError):
        module.get_lesson(lesson1.id)

    with pytest.raises(LessonNotFoundError):
        module.remove_lesson(LessonId.generate())
