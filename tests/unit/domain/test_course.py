import pytest
from plearning.domain.entities.course import Course
from plearning.domain.entities.module import Module
from plearning.domain.exceptions import InvalidCourseDataError, ModuleNotFoundError
from plearning.domain.value_objects.ids import ModuleId


def test_create_course_success():
    course = Course.create(
        title="Python Mastery",
        description="Comprehensive Python course",
        teacher_id="teacher_123",
    )
    assert course.id is not None
    assert course.title == "Python Mastery"
    assert course.description == "Comprehensive Python course"
    assert course.teacher_id == "teacher_123"
    assert course.modules == []


def test_create_course_empty_title_raises_error():
    with pytest.raises(InvalidCourseDataError, match="Title must not be empty."):
        Course.create(
            title="   ",
            description="Description",
            teacher_id="teacher_123",
        )


def test_create_course_empty_teacher_id_raises_error():
    with pytest.raises(InvalidCourseDataError, match="Teacher ID must not be empty."):
        Course.create(
            title="Course Title",
            description="Description",
            teacher_id="",
        )


def test_add_module_reorders_and_updates_course():
    course = Course.create("Course Title", "Description", "teacher_1")
    mod1 = Module.create(course.id, "Module 1", "Desc 1")
    mod2 = Module.create(course.id, "Module 2", "Desc 2")

    course.add_module(mod1)
    course.add_module(mod2)

    assert len(course.modules) == 2
    assert course.modules[0].order == 1
    assert course.modules[1].order == 2


def test_get_and_remove_module():
    course = Course.create("Course Title", "Description", "teacher_1")
    mod1 = Module.create(course.id, "Module 1", "Desc 1")
    mod2 = Module.create(course.id, "Module 2", "Desc 2")

    course.add_module(mod1)
    course.add_module(mod2)

    retrieved = course.get_module(mod1.id)
    assert retrieved.id == mod1.id

    course.remove_module(mod1.id)
    assert len(course.modules) == 1
    assert course.modules[0].id == mod2.id
    assert course.modules[0].order == 1

    with pytest.raises(ModuleNotFoundError):
        course.get_module(mod1.id)

    with pytest.raises(ModuleNotFoundError):
        course.remove_module(ModuleId.generate())


def test_update_course():
    course = Course.create("Initial Title", "Initial Desc", "teacher_1")
    course.update(title="Updated Title", description="Updated Desc")
    assert course.title == "Updated Title"
    assert course.description == "Updated Desc"

    with pytest.raises(InvalidCourseDataError):
        course.update(title="")
