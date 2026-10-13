"""
Database session management.

Uses async SQLAlchemy with aiosqlite for local development
and can be swapped to asyncpg for PostgreSQL in production.
"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

DATABASE_URL = "sqlite+aiosqlite:///./plearning.db"

engine: AsyncEngine = create_async_engine(DATABASE_URL, echo=False)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncSession:  # type: ignore[misc]
    """Yield an async session (for FastAPI Depends)."""
    async with async_session_factory() as session:
        yield session


async def init_db() -> None:
    """Create all tables (for development bootstrap) and ensure new columns exist."""
    from sqlalchemy import text
    from plearning.infrastructure.persistence.models import Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        # Migration helper for SQLite development: ensure newly added columns exist
        try:
            res = await conn.execute(text("PRAGMA table_info(courses)"))
            existing_course_cols = {row[1] for row in res.fetchall()}
            if existing_course_cols:
                if "status" not in existing_course_cols:
                    await conn.execute(text("ALTER TABLE courses ADD COLUMN status VARCHAR(30) DEFAULT 'Published'"))
                if "category" not in existing_course_cols:
                    await conn.execute(text("ALTER TABLE courses ADD COLUMN category VARCHAR(100) DEFAULT 'Architecture & Design'"))
                if "rating" not in existing_course_cols:
                    await conn.execute(text("ALTER TABLE courses ADD COLUMN rating FLOAT DEFAULT 4.8"))
                if "thumbnail_url" not in existing_course_cols:
                    await conn.execute(text("ALTER TABLE courses ADD COLUMN thumbnail_url VARCHAR(512) DEFAULT ''"))

            res_lessons = await conn.execute(text("PRAGMA table_info(lessons)"))
            existing_lesson_cols = {row[1] for row in res_lessons.fetchall()}
            if existing_lesson_cols:
                if "content_type" not in existing_lesson_cols:
                    await conn.execute(text("ALTER TABLE lessons ADD COLUMN content_type VARCHAR(50) DEFAULT 'Rich Text Article'"))
                if "duration_minutes" not in existing_lesson_cols:
                    await conn.execute(text("ALTER TABLE lessons ADD COLUMN duration_minutes INTEGER DEFAULT 20"))
                if "access_level" not in existing_lesson_cols:
                    await conn.execute(text("ALTER TABLE lessons ADD COLUMN access_level VARCHAR(50) DEFAULT 'Enrolled Students Only'"))
        except Exception:
            pass
