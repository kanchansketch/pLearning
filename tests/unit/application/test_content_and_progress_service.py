import pytest
from plearning.application.dtos.progress_dtos import UpdateProgressDTO
from plearning.application.services.content_service import ContentService
from plearning.application.services.progress_service import ProgressService
from plearning.domain.entities.course import Course
from plearning.domain.entities.enrollment import Enrollment
from plearning.domain.entities.lesson import Lesson
from plearning.domain.entities.module import Module
from plearning.domain.exceptions import NotEnrolledError, ProgressNotFoundError
from plearning.infrastructure.in_memory.in_memory_course_repo import (
    InMemoryCourseRepository,
)
from plearning.infrastructure.in_memory.in_memory_enrollment_repo import (
    InMemoryEnrollmentRepository,
)
from plearning.infrastructure.in_memory.in_memory_progress_repo import (
    InMemoryProgressRepository,
)


@pytest.fixture
def repos():
    return (
        InMemoryCourseRepository(),
        InMemoryEnrollmentRepository(),
        InMemoryProgressRepository(),
    )


@pytest.fixture
def services(repos):
    course_repo, enrollment_repo, progress_repo = repos
    content_service = ContentService(course_repo, enrollment_repo)
    progress_service = ProgressService(progress_repo, course_repo, enrollment_repo)
    return content_service, progress_service


@pytest.mark.asyncio
async def test_watch_content_enrolled(repos, services):
    course_repo, enrollment_repo, _ = repos
    content_service, _ = services

    course = Course.create("FastAPI Masterclass", "Learn fast", "t1")
    mod = Module.create(course.id, "Module 1", "Basics")
    les = Lesson.create(
        mod.id, "Lesson 1", "Desc", content="Hello world", content_url="http://vid.mp4"
    )
    mod.add_lesson(les)
    course.add_module(mod)
    await course_repo.save(course)

    # Student not enrolled yet
    with pytest.raises(NotEnrolledError):
        await content_service.watch_content(
            "student_1", course.id.value, mod.id.value, les.id.value
        )

    # Enroll student
    enrollment = Enrollment.create(course.id, "student_1")
    await enrollment_repo.save(enrollment)

    # Now can watch
    lesson_out = await content_service.watch_content(
        "student_1", course.id.value, mod.id.value, les.id.value
    )
    assert lesson_out.id == les.id.value
    assert lesson_out.content == "Hello world"
    assert lesson_out.content_url == "http://vid.mp4"


@pytest.mark.asyncio
async def test_update_and_get_progress(repos, services):
    course_repo, enrollment_repo, _ = repos
    _, progress_service = services

    course = Course.create("Course 1", "Desc", "t1")
    mod = Module.create(course.id, "Mod 1", "Desc")
    les1 = Lesson.create(mod.id, "Les 1", "Desc")
    les2 = Lesson.create(mod.id, "Les 2", "Desc")
    mod.add_lesson(les1)
    mod.add_lesson(les2)
    course.add_module(mod)
    await course_repo.save(course)

    enrollment = Enrollment.create(course.id, "student_1")
    await enrollment_repo.save(enrollment)

    dto = UpdateProgressDTO(
        student_id="student_1",
        course_id=course.id.value,
        lesson_id=les1.id.value,
    )
    prog_out = await progress_service.update_progress(dto)
    assert prog_out.progress_percentage == 50.0
    assert les1.id.value in prog_out.completed_lesson_ids

    fetched = await progress_service.get_progress("student_1", course.id.value)
    assert fetched.progress_percentage == 50.0


@pytest.mark.asyncio
async def test_get_progress_not_found(services):
    _, progress_service = services
    with pytest.raises(ProgressNotFoundError):
        await progress_service.get_progress("s1", "c1")
