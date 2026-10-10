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
    """Create all tables (for development bootstrap)."""
    from plearning.infrastructure.persistence.models import Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
