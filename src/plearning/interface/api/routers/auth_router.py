"""
Authentication & User router.
"""

from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from plearning.application.services.auth_service import AuthService
from plearning.domain.exceptions import DomainException
from plearning.infrastructure.persistence.database import get_session
from plearning.interface.schemas.auth_schemas import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service(session: AsyncSession = Depends(get_session)) -> AuthService:
    return AuthService(session)


@router.post("/login", response_model=AuthResponse, summary="User login")
async def login(
    req: LoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    try:
        return await service.login(req.email, req.password, req.role)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    req: RegisterRequest,
    service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    try:
        return await service.register(req)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get("/me", response_model=UserResponse, summary="Get current user profile")
async def get_me(
    user_id: str = Query("teacher_marcus", description="User ID"),
    service: AuthService = Depends(get_auth_service),
) -> UserResponse:
    try:
        return await service.get_user_by_id(user_id)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.put("/profile", response_model=UserResponse, summary="Update user profile")
async def update_profile(
    req: UpdateProfileRequest,
    user_id: str = Query("teacher_marcus", description="User ID"),
    service: AuthService = Depends(get_auth_service),
) -> UserResponse:
    try:
        return await service.update_profile(user_id, req)
    except DomainException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
