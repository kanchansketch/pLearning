import pytest
from plearning.application.dtos.enrollment_dtos import EnrollCourseDTO
from plearning.application.services.enrollment_service import EnrollmentService
from plearning.domain.entities.course import Course
from plearning.domain.exceptions import AlreadyEnrolledError, CourseNotFoundError
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
    course_repo = InMemoryCourseRepository()
    enrollment_repo = InMemoryEnrollmentRepository()
    progress_repo = InMemoryProgressRepository()
    return course_repo, enrollment_repo, progress_repo


@pytest.fixture
def enrollment_service(repos):
    course_repo, enrollment_repo, progress_repo = repos
    return EnrollmentService(
        enrollment_repo=enrollment_repo,
        course_repo=course_repo,
        progress_repo=progress_repo,
    )


@pytest.mark.asyncio
async def test_enroll_success(enrollment_service, repos):
    course_repo, _, progress_repo = repos
    course = Course.create("Python 101", "Basics", "t1")
    await course_repo.save(course)

    dto = EnrollCourseDTO(student_id="s1", course_id=course.id.value)
    out = await enrollment_service.enroll(dto)

    assert out.student_id == "s1"
    assert out.course_id == course.id.value

    # Check progress record was initialized
    prog = await progress_repo.get(student_id="s1", course_id=course.id)
    assert prog is not None
    assert prog.progress_percentage == 0.0

    # Get student enrollments
    enrollments = await enrollment_service.get_student_enrollments("s1")
    assert len(enrollments) == 1


@pytest.mark.asyncio
async def test_enroll_course_not_found(enrollment_service):
    dto = EnrollCourseDTO(student_id="s1", course_id="non-existent")
    with pytest.raises(CourseNotFoundError):
        await enrollment_service.enroll(dto)


@pytest.mark.asyncio
async def test_enroll_duplicate_raises_already_enrolled(enrollment_service, repos):
    course_repo, _, _ = repos
    course = Course.create("Python 101", "Basics", "t1")
    await course_repo.save(course)

    dto = EnrollCourseDTO(student_id="s1", course_id=course.id.value)
    await enrollment_service.enroll(dto)

    with pytest.raises(AlreadyEnrolledError):
        await enrollment_service.enroll(dto)
