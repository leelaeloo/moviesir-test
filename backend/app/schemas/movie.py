# 영화 관련 Pydantic 스키마
# Pydantic v2 사용

from pydantic import BaseModel


class Genre(BaseModel):
    """장르 스키마"""
    id: int
    name: str


class Provider(BaseModel):
    """OTT 제공자 스키마"""
    provider_id: int
    provider_name: str


class MovieDetail(BaseModel):
    """영화 상세 정보 스키마 (문서 기준)"""
    movie_id: int
    title: str
    original_title: str
    poster_url: str
    overview: str
    runtime: int
    release_date: str
    genres: list[str]  # 장르 이름만 반환 ["SF", "드라마"]
    vote_average: float
    providers: list[Provider] = []


class MovieRecommendation(BaseModel):
    """추천 결과에 포함되는 영화 정보"""
    movie_id: int
    title: str
    runtime: int
    genres: list[str]  # 장르 이름만 반환
    poster_url: str
    vote_average: float
    overview: str


class MovieTagsResponse(BaseModel):
    """영화 태그 응답 스키마"""
    movie_id: int
    title: str
    tags: list[str]


class ErrorResponse(BaseModel):
    """에러 응답 스키마"""
    error: str
    message: str
