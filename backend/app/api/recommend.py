# 영화 추천 API 라우터

import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, status

from ..schemas.recommend import RecommendRequest, RecommendResponse, FiltersApplied
from ..schemas.movie import MovieRecommendation, ErrorResponse


router = APIRouter(prefix="/chatbot", tags=["챗봇 추천"])

# 더미 데이터 로드
DATA_PATH = Path(__file__).parent.parent / "data" / "dummy_movies.json"


def load_movies() -> list[dict]:
    """더미 영화 데이터 로드"""
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post(
    "/recommend",
    response_model=RecommendResponse,
    responses={
        404: {"model": ErrorResponse, "description": "조건에 맞는 영화 없음"}
    }
)
async def recommend_movies(request: RecommendRequest):
    """
    영화 추천 API (핵심!)

    - runtime: 시청 가능 시간 (30~180분) - runtime 이하 영화만 필터링
    - genres: 장르 ID 배열 (최대 3개, 선택)
    - include_adult: 성인 콘텐츠 포함 여부 (기본값: false)
    """
    # 유효성 검사는 Pydantic에서 처리됨 (30~180분)
    movies = load_movies()
    filtered_movies = []

    for movie in movies:
        # 1. runtime 필터링 (요청한 시간 이하만)
        if movie["runtime"] > request.runtime:
            continue

        # 2. 성인 콘텐츠 필터링
        if not request.include_adult and movie.get("adult", False):
            continue

        # 3. 장르 필터링 (선택한 장르 중 하나라도 포함)
        if request.genres:
            movie_genre_ids = [g["id"] for g in movie["genres"]]
            if not any(genre_id in movie_genre_ids for genre_id in request.genres):
                continue

        # poster_path를 전체 URL로 변환
        poster_url = f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"

        # 장르 이름만 추출
        genre_names = [g["name"] for g in movie["genres"]]

        filtered_movies.append(MovieRecommendation(
            movie_id=movie["movie_id"],
            title=movie["title"],
            runtime=movie["runtime"],
            genres=genre_names,
            poster_url=poster_url,
            vote_average=movie["vote_average"],
            overview=movie["overview"]
        ))

    # 인기도순으로 정렬
    filtered_movies.sort(key=lambda x: x.vote_average, reverse=True)

    # 결과 없으면 404 에러
    if not filtered_movies:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "NO_RECOMMENDATIONS",
                "message": "조건에 맞는 영화를 찾을 수 없습니다."
            }
        )

    return RecommendResponse(
        recommendations=filtered_movies,
        total=len(filtered_movies),
        filters_applied=FiltersApplied(
            runtime=request.runtime,
            genres=request.genres,
            include_adult=request.include_adult
        )
    )
