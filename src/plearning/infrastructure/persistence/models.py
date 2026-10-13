"""
SQLAlchemy ORM models.

These are the persistence models that map to database tables.
They are distinct from domain entities to maintain DDD separation.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="student")  # "student" | "teacher" | "admin"
    avatar = Column(String(512), default="")
    bio = Column(Text, default="")
    specialization = Column(String(255), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class CourseModel(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    teacher_id = Column(String(255), nullable=False, index=True)
    status = Column(String(30), default="Published")  # "Published" | "Draft" | "Archived"
    category = Column(String(100), default="Architecture & Design")
    rating = Column(Float, default=4.8)
    thumbnail_url = Column(String(512), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    modules = relationship(
        "ModuleModel",
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="ModuleModel.order",
    )


class ModuleModel(Base):
    __tablename__ = "modules"

    id = Column(String(36), primary_key=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    order = Column(Integer, default=0)

    course = relationship("CourseModel", back_populates="modules")
    lessons = relationship(
        "LessonModel",
        back_populates="module",
        cascade="all, delete-orphan",
        order_by="LessonModel.order",
    )


class LessonModel(Base):
    __tablename__ = "lessons"

    id = Column(String(36), primary_key=True)
    module_id = Column(String(36), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    content = Column(Text, default="")
    content_url = Column(String(512), default="")
    content_type = Column(String(50), default="Rich Text Article")
    duration_minutes = Column(Integer, default=20)
    access_level = Column(String(50), default="Enrolled Students Only")
    order = Column(Integer, default=0)

    module = relationship("ModuleModel", back_populates="lessons")
    assignments = relationship(
        "AssignmentModel",
        back_populates="lesson",
        cascade="all, delete-orphan",
    )


class AssignmentModel(Base):
    __tablename__ = "assignments"

    id = Column(String(36), primary_key=True)
    lesson_id = Column(String(36), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    questions_json = Column(Text, default="[]")  # JSON-encoded list

    lesson = relationship("LessonModel", back_populates="assignments")


class EnrollmentModel(Base):
    __tablename__ = "enrollments"

    id = Column(String(36), primary_key=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(255), nullable=False, index=True)
    enrolled_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class SubmissionModel(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True)
    assignment_id = Column(String(36), ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(255), nullable=False, index=True)
    content = Column(Text, default="")
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class EvaluationModel(Base):
    __tablename__ = "evaluations"

    id = Column(String(36), primary_key=True)
    submission_id = Column(String(36), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, unique=True)
    score = Column(Float, nullable=False)
    feedback = Column(Text, default="")
    evaluated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ProgressModel(Base):
    __tablename__ = "student_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(255), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    completed_lesson_ids_json = Column(Text, default="[]")  # JSON-encoded
    current_lesson_id = Column(String(36), nullable=True)
    progress_percentage = Column(Float, default=0.0)
    last_accessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AssessmentModel(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True)
    module_id = Column(String(36), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    questions_json = Column(Text, default="[]")
    time_limit_minutes = Column(Integer, default=0)


class AttemptModel(Base):
    __tablename__ = "assessment_attempts"

    id = Column(String(36), primary_key=True)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(255), nullable=False, index=True)
    status = Column(String(20), default="in_progress")
    answers_json = Column(Text, default="[]")
    score = Column(Float, nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    submitted_at = Column(DateTime, nullable=True)
