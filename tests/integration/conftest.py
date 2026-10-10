import os
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from plearning.app import app
from plearning.infrastructure.persistence.database import get_session
from plearning.infrastructure.persistence.models import Base

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_plearning.db"

async_test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
async_test_session_factory = async_sessionmaker(
    bind=async_test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    async with async_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with async_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await async_test_engine.dispose()
    if os.path.exists("test_plearning.db"):
        try:
            os.remove("test_plearning.db")
        except Exception:
            pass


@pytest_asyncio.fixture
async def client():
    async def override_get_session():
        async with async_test_session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
