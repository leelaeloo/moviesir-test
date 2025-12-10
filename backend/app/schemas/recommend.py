# 추천 관련 Pydantic 스키마
# Pydantic v2 사용

from pydantic import BaseModel, Field, field_validator
from .movie import MovieRecommendation


class RecommendRequest(BaseModel):
    """영화 추천 요청 스키마"""
    runtime: int = Field(..., ge=30, le=180, description="시청 가능 시간 (30~180분)")
    genres: list[int] = Field(default=[], max_length=3, description="장르 ID 배열 (최대 3개)")
    include_adult: bool = Field(default=False, description="성인 콘텐츠 포함 여부")

    @field_validator("genres")
    @classmethod
    def validate_genres(cls, v: list[int]) -> list[int]:
        if len(v) > 3:
            raise ValueError("장르는 최대 3개까지 선택 가능합니다.")
        return v


class FiltersApplied(BaseModel):
    """적용된 필터 정보"""
    runtime: int
    genres: list[int]
    include_adult: bool


class RecommendResponse(BaseModel):
    """영화 추천 응답 스키마"""
    recommendations: list[MovieRecommendation]
    total: int
    filters_applied: FiltersApplied
