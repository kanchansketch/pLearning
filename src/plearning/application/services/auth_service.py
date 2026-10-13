"""
Authentication & User application service.
"""

from __future__ import annotations

import hashlib
import uuid
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from plearning.domain.exceptions import DomainException
from plearning.infrastructure.persistence.models import UserModel
from plearning.interface.schemas.auth_schemas import (
    AuthResponse,
    RegisterRequest,
    UpdateProfileRequest,
    UserResponse,
)


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def login(self, email: str, password: str, requested_role: Optional[str] = None) -> AuthResponse:
        clean_email = email.strip().lower()
        stmt = select(UserModel).where(UserModel.email == clean_email)
        res = await self._session.execute(stmt)
        user = res.scalar_one_or_none()

        if user is None:
            raise DomainException(f"Invalid email or password for {email}")

        if user.password_hash != _hash_password(password):
            raise DomainException("Invalid email or password")

        # Create token (simple secure token string for this app)
        token = f"token_{user.id}_{uuid.uuid4().hex[:12]}"

        user_resp = UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            avatar=user.avatar or "",
            bio=user.bio or "",
            specialization=user.specialization or "",
            created_at=user.created_at.isoformat() if user.created_at else None,
        )

        return AuthResponse(access_token=token, token_type="bearer", user=user_resp)

    async def register(self, req: RegisterRequest) -> AuthResponse:
        clean_email = req.email.strip().lower()
        stmt = select(UserModel).where(UserModel.email == clean_email)
        res = await self._session.execute(stmt)
        if res.scalar_one_or_none() is not None:
            raise DomainException(f"Account with email {clean_email} already exists")

        user_id = f"user_{uuid.uuid4().hex[:8]}"
        user = UserModel(
            id=user_id,
            name=req.name.strip(),
            email=clean_email,
            password_hash=_hash_password(req.password),
            role=req.role.lower(),
            avatar=req.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={clean_email}",
            bio=req.bio or "",
            specialization=req.specialization or "",
        )
        self._session.add(user)
        await self._session.commit()
        await self._session.refresh(user)

        token = f"token_{user.id}_{uuid.uuid4().hex[:12]}"
        user_resp = UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            avatar=user.avatar,
            bio=user.bio,
            specialization=user.specialization,
            created_at=user.created_at.isoformat() if user.created_at else None,
        )
        return AuthResponse(access_token=token, token_type="bearer", user=user_resp)

    async def get_user_by_id(self, user_id: str) -> UserResponse:
        user = await self._session.get(UserModel, user_id)
        if user is None:
            raise DomainException(f"User {user_id} not found")
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            avatar=user.avatar or "",
            bio=user.bio or "",
            specialization=user.specialization or "",
            created_at=user.created_at.isoformat() if user.created_at else None,
        )

    async def update_profile(self, user_id: str, req: UpdateProfileRequest) -> UserResponse:
        user = await self._session.get(UserModel, user_id)
        if user is None:
            raise DomainException(f"User {user_id} not found")

        if req.name is not None:
            user.name = req.name.strip()
        if req.avatar is not None:
            user.avatar = req.avatar
        if req.bio is not None:
            user.bio = req.bio
        if req.specialization is not None:
            user.specialization = req.specialization

        await self._session.commit()
        await self._session.refresh(user)

        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            avatar=user.avatar or "",
            bio=user.bio or "",
            specialization=user.specialization or "",
            created_at=user.created_at.isoformat() if user.created_at else None,
        )
