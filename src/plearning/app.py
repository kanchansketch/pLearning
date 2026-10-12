"""
pLearning – Application entrypoint & FastAPI application definition.

Assembles the FastAPI app, registers routers, and boots the DB.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from plearning.infrastructure.persistence.database import init_db
from plearning.interface.api.routers import (
    assessment_router,
    content_router,
    course_router,
    enrollment_router,
    evaluation_router,
    progress_router,
    submission_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    await init_db()
    yield


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
        title="pLearning API",
        description="Adaptive Learning Platform – V1",
        version="1.0.0",
        lifespan=lifespan,
    )

    # ── CORS configuration ───────────────────────────────────────
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Register all routers ─────────────────────────────────────
    application.include_router(course_router.router)
    application.include_router(enrollment_router.router)
    application.include_router(content_router.router)
    application.include_router(progress_router.router)
    application.include_router(submission_router.router)
    application.include_router(evaluation_router.router)
    application.include_router(assessment_router.router)

    @application.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "ok"}

    return application


app = create_app()
