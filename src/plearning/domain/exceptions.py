"""
Domain exceptions.

These represent business-rule violations and are raised by entities
and domain services.  The interface layer maps them to HTTP status codes.
"""


class DomainException(Exception):
    """Base class for all domain exceptions."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


# ── Course Aggregate ──────────────────────────────────────────────


class CourseNotFoundError(DomainException):
    def __init__(self, course_id: str) -> None:
        super().__init__(f"Course '{course_id}' not found.")


class ModuleNotFoundError(DomainException):
    def __init__(self, module_id: str) -> None:
        super().__init__(f"Module '{module_id}' not found.")


class LessonNotFoundError(DomainException):
    def __init__(self, lesson_id: str) -> None:
        super().__init__(f"Lesson '{lesson_id}' not found.")


class AssignmentNotFoundError(DomainException):
    def __init__(self, assignment_id: str) -> None:
        super().__init__(f"Assignment '{assignment_id}' not found.")


class InvalidCourseDataError(DomainException):
    def __init__(self, detail: str) -> None:
        super().__init__(f"Invalid course data: {detail}")


# ── Enrollment ────────────────────────────────────────────────────


class AlreadyEnrolledError(DomainException):
    def __init__(self, student_id: str, course_id: str) -> None:
        super().__init__(
            f"Student '{student_id}' is already enrolled in course '{course_id}'."
        )


class NotEnrolledError(DomainException):
    def __init__(self, student_id: str, course_id: str) -> None:
        super().__init__(
            f"Student '{student_id}' is not enrolled in course '{course_id}'."
        )


# ── Submission & Evaluation ───────────────────────────────────────


class SubmissionNotFoundError(DomainException):
    def __init__(self, submission_id: str) -> None:
        super().__init__(f"Submission '{submission_id}' not found.")


class DuplicateSubmissionError(DomainException):
    def __init__(self, student_id: str, assignment_id: str) -> None:
        super().__init__(
            f"Student '{student_id}' has already submitted assignment '{assignment_id}'."
        )


class EvaluationNotFoundError(DomainException):
    def __init__(self, evaluation_id: str) -> None:
        super().__init__(f"Evaluation '{evaluation_id}' not found.")


# ── Assessment ────────────────────────────────────────────────────


class AssessmentNotFoundError(DomainException):
    def __init__(self, assessment_id: str) -> None:
        super().__init__(f"Assessment '{assessment_id}' not found.")


class AttemptNotFoundError(DomainException):
    def __init__(self, attempt_id: str) -> None:
        super().__init__(f"Assessment attempt '{attempt_id}' not found.")


class AttemptAlreadySubmittedError(DomainException):
    def __init__(self, attempt_id: str) -> None:
        super().__init__(f"Attempt '{attempt_id}' has already been submitted.")


class AttemptNotInProgressError(DomainException):
    def __init__(self, attempt_id: str) -> None:
        super().__init__(f"Attempt '{attempt_id}' is not in progress.")


# ── Progress ──────────────────────────────────────────────────────


class ProgressNotFoundError(DomainException):
    def __init__(self, student_id: str, course_id: str) -> None:
        super().__init__(
            f"Progress for student '{student_id}' in course '{course_id}' not found."
        )
