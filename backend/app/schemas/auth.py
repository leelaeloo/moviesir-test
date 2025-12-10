# 인증 관련 Pydantic 스키마
# Pydantic v2 사용

from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserProfile(BaseModel):
    """사용자 프로필"""
    favoriteGenres: list[str] = []
    ottServices: list[str] = []


class User(BaseModel):
    """사용자 정보"""
    id: int
    email: str
    name: str
    createdAt: str
    profile: UserProfile


class LoginRequest(BaseModel):
    """로그인 요청"""
    email: str
    password: str


class LoginResponse(BaseModel):
    """로그인 응답"""
    accessToken: str
    refreshToken: str
    user: User


class LogoutResponse(BaseModel):
    """로그아웃 응답"""
    message: str


class ErrorResponse(BaseModel):
    """에러 응답"""
    error: str
    message: str
