from plearning.domain.entities.student_progress import StudentProgress
from plearning.domain.value_objects.ids import CourseId, LessonId


def test_student_progress_initial():
    course_id = CourseId.generate()
    prog = StudentProgress(
        student_id="student_1",
        course_id=course_id,
    )
    assert prog.progress_percentage == 0.0
    assert not prog.is_course_complete
    assert prog.completed_lesson_ids == []
    assert prog.current_lesson_id is None


def test_mark_lesson_complete_and_progress_recalculation():
    course_id = CourseId.generate()
    prog = StudentProgress(student_id="student_1", course_id=course_id)
    l1 = LessonId.generate()
    l2 = LessonId.generate()

    prog.mark_lesson_complete(l1, total_lessons=2)
    assert prog.completed_lesson_ids == [l1.value]
    assert prog.progress_percentage == 50.0
    assert not prog.is_course_complete

    # Mark same lesson again shouldn't double count
    prog.mark_lesson_complete(l1, total_lessons=2)
    assert prog.progress_percentage == 50.0

    prog.mark_lesson_complete(l2, total_lessons=2)
    assert prog.progress_percentage == 100.0
    assert prog.is_course_complete


def test_set_current_lesson():
    course_id = CourseId.generate()
    prog = StudentProgress(student_id="student_1", course_id=course_id)
    l1 = LessonId.generate()
    prog.set_current_lesson(l1)
    assert prog.current_lesson_id == l1.value
