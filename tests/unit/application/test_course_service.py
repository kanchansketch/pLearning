import pytest
from plearning.application.dtos.course_dtos import (
    CreateAssignmentDTO,
    CreateCourseDTO,
    CreateLessonDTO,
    CreateModuleDTO,
    UpdateCourseDTO,
)
from plearning.application.services.course_service import CourseService
from plearning.domain.exceptions import CourseNotFoundError
from plearning.infrastructure.in_memory.in_memory_course_repo import (
    InMemoryCourseRepository,
)


@pytest.fixture
def course_service():
    repo = InMemoryCourseRepository()
    return CourseService(course_repo=repo)


@pytest.mark.asyncio
async def test_create_and_get_course(course_service):
    dto = CreateCourseDTO(
        title="FastAPI Course",
        description="Learn FastAPI",
        teacher_id="teacher_1",
        modules=[
            CreateModuleDTO(
                title="Module 1",
                description="Intro",
                lessons=[
                    CreateLessonDTO(
                        title="Lesson 1",
                        description="Setup",
                        content="Setup instructions",
                        content_url="https://video.url",
                        assignments=[
                            CreateAssignmentDTO(
                                title="Assignment 1",
                                description="Install python",
                                questions=["Done?"],
                            )
                        ],
                    )
                ],
            )
        ],
    )

    course_out = await course_service.create_course(dto)
    assert course_out.title == "FastAPI Course"
    assert len(course_out.modules) == 1
    assert len(course_out.modules[0].lessons) == 1
    assert len(course_out.modules[0].lessons[0].assignments) == 1

    fetched = await course_service.get_course(course_out.id)
    assert fetched.id == course_out.id

    all_courses = await course_service.get_all_courses()
    assert len(all_courses) == 1

    teacher_courses = await course_service.get_teacher_courses("teacher_1")
    assert len(teacher_courses) == 1


@pytest.mark.asyncio
async def test_get_modules_lessons_assignments(course_service):
    dto = CreateCourseDTO(
        title="Course With Tree",
        description="Desc",
        teacher_id="t1",
        modules=[
            CreateModuleDTO(
                title="Mod 1",
                description="Mod 1 desc",
                lessons=[
                    CreateLessonDTO(
                        title="Les 1",
                        description="Les 1 desc",
                        content="Content",
                        assignments=[
                            CreateAssignmentDTO(
                                title="Asg 1",
                                description="Asg 1 desc",
                                questions=["Q1"],
                            )
                        ],
                    )
                ],
            )
        ],
    )
    course_out = await course_service.create_course(dto)
    c_id = course_out.id

    modules = await course_service.get_modules(c_id)
    assert len(modules) == 1
    m_id = modules[0].id

    lessons = await course_service.get_lessons(c_id, m_id)
    assert len(lessons) == 1
    l_id = lessons[0].id

    assignments = await course_service.get_assignments(c_id, m_id, l_id)
    assert len(assignments) == 1
    assert assignments[0].title == "Asg 1"


@pytest.mark.asyncio
async def test_get_course_not_found(course_service):
    with pytest.raises(CourseNotFoundError):
        await course_service.get_course("non-existent-id")


@pytest.mark.asyncio
async def test_update_course(course_service):
    dto = CreateCourseDTO(
        title="Old Title",
        description="Old Desc",
        teacher_id="t1",
    )
    course_out = await course_service.create_course(dto)

    updated = await course_service.update_course(
        course_out.id,
        UpdateCourseDTO(title="New Title", description="New Desc"),
    )
    assert updated.title == "New Title"
    assert updated.description == "New Desc"
