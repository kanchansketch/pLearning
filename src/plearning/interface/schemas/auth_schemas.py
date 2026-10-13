"""
Pydantic schemas for Authentication and User management.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)
    role: Optional[str] = "student"


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6)
    role: str = Field(default="student", pattern="^(student|teacher|admin)$")
    avatar: Optional[str] = ""
    bio: Optional[str] = ""
    specialization: Optional[str] = ""


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    name: str
    email: str
    role: str
    avatar: str = ""
    bio: str = ""
    specialization: str = ""
    created_at: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    specialization: Optional[str] = None
