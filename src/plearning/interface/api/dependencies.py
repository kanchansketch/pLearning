"""
Dependency Injection container for FastAPI.

Wires repository implementations to application services using
FastAPI's Depends() mechanism.
"""

from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from plearning.application.services.assessment_service import AssessmentService
from plearning.application.services.content_service import ContentService
from plearning.application.services.course_service import CourseService
from plearning.application.services.enrollment_service import EnrollmentService
from plearning.application.services.evaluation_service import EvaluationService
from plearning.application.services.progress_service import ProgressService
from plearning.application.services.submission_service import SubmissionService
from plearning.infrastructure.persistence.database import get_session
from plearning.infrastructure.persistence.repositories.sqlalchemy_assessment_repo import (
    SQLAlchemyAssessmentRepository,
)
from plearning.infrastructure.persistence.repositories.sqlalchemy_course_repo import (
    SQLAlchemyCourseRepository,
)
from plearning.infrastructure.persistence.repositories.sqlalchemy_enrollment_repo import (
    SQLAlchemyEnrollmentRepository,
)
from plearning.infrastructure.persistence.repositories.sqlalchemy_evaluation_repo import (
    SQLAlchemyEvaluationRepository,
)
from plearning.infrastructure.persistence.repositories.sqlalchemy_progress_repo import (
    SQLAlchemyProgressRepository,
)
from plearning.infrastructure.persistence.repositories.sqlalchemy_submission_repo import (
    SQLAlchemySubmissionRepository,
)


# ── Repository providers ─────────────────────────────────────────


def get_course_repo(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemyCourseRepository:
    return SQLAlchemyCourseRepository(session)


def get_enrollment_repo(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemyEnrollmentRepository:
    return SQLAlchemyEnrollmentRepository(session)


def get_submission_repo(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemySubmissionRepository:
    return SQLAlchemySubmissionRepository(session)


def get_evaluation_repo(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemyEvaluationRepository:
    return SQLAlchemyEvaluationRepository(session)


def get_progress_repo(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemyProgressRepository:
    return SQLAlchemyProgressRepository(session)


def get_assessment_repo(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemyAssessmentRepository:
    return SQLAlchemyAssessmentRepository(session)


# ── Service providers ────────────────────────────────────────────


def get_course_service(
    course_repo: SQLAlchemyCourseRepository = Depends(get_course_repo),
) -> CourseService:
    return CourseService(course_repo=course_repo)


def get_enrollment_service(
    enrollment_repo: SQLAlchemyEnrollmentRepository = Depends(get_enrollment_repo),
    course_repo: SQLAlchemyCourseRepository = Depends(get_course_repo),
    progress_repo: SQLAlchemyProgressRepository = Depends(get_progress_repo),
) -> EnrollmentService:
    return EnrollmentService(
        enrollment_repo=enrollment_repo,
        course_repo=course_repo,
        progress_repo=progress_repo,
    )


def get_content_service(
    course_repo: SQLAlchemyCourseRepository = Depends(get_course_repo),
    enrollment_repo: SQLAlchemyEnrollmentRepository = Depends(get_enrollment_repo),
) -> ContentService:
    return ContentService(
        course_repo=course_repo,
        enrollment_repo=enrollment_repo,
    )


def get_progress_service(
    progress_repo: SQLAlchemyProgressRepository = Depends(get_progress_repo),
    course_repo: SQLAlchemyCourseRepository = Depends(get_course_repo),
    enrollment_repo: SQLAlchemyEnrollmentRepository = Depends(get_enrollment_repo),
) -> ProgressService:
    return ProgressService(
        progress_repo=progress_repo,
        course_repo=course_repo,
        enrollment_repo=enrollment_repo,
    )


def get_submission_service(
    submission_repo: SQLAlchemySubmissionRepository = Depends(get_submission_repo),
) -> SubmissionService:
    return SubmissionService(submission_repo=submission_repo)


def get_evaluation_service(
    evaluation_repo: SQLAlchemyEvaluationRepository = Depends(get_evaluation_repo),
    submission_repo: SQLAlchemySubmissionRepository = Depends(get_submission_repo),
) -> EvaluationService:
    return EvaluationService(
        evaluation_repo=evaluation_repo,
        submission_repo=submission_repo,
    )


def get_assessment_service(
    assessment_repo: SQLAlchemyAssessmentRepository = Depends(get_assessment_repo),
) -> AssessmentService:
    return AssessmentService(assessment_repo=assessment_repo)
