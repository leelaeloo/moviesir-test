# 영화 관련 API 라우터

import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, status

from ..schemas.movie import MovieDetail, MovieTagsResponse, ErrorResponse, Provider


router = APIRouter(prefix="/movies", tags=["영화"])

# 더미 데이터 로드
DATA_PATH = Path(__file__).parent.parent / "data" / "dummy_movies.json"


def load_movies() -> list[dict]:
    """더미 영화 데이터 로드"""
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_movie_by_id(movie_id: int) -> dict | None:
    """movie_id로 영화 찾기"""
    movies = load_movies()
    for movie in movies:
        if movie["movie_id"] == movie_id:
            return movie
    return None


@router.get(
    "/{movie_id}",
    response_model=MovieDetail,
    responses={
        404: {"model": ErrorResponse, "description": "영화를 찾을 수 없음"}
    }
)
async def get_movie(movie_id: int):
    """
    영화 상세 정보 조회

    - movie_id: 영화 ID
    """
    movie = get_movie_by_id(movie_id)

    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "MOVIE_NOT_FOUND",
                "message": "해당 영화를 찾을 수 없습니다."
            }
        )

    # poster_path를 전체 URL로 변환
    poster_url = f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"

    # 장르 이름만 추출 ["SF", "드라마"]
    genre_names = [g["name"] for g in movie["genres"]]

    return MovieDetail(
        movie_id=movie["movie_id"],
        title=movie["title"],
        original_title=movie["original_title"],
        poster_url=poster_url,
        overview=movie["overview"],
        runtime=movie["runtime"],
        release_date=movie["release_date"],
        genres=genre_names,
        vote_average=movie["vote_average"],
        providers=[Provider(**p) for p in movie.get("providers", [])]
    )


@router.get(
    "/{movie_id}/tags",
    response_model=MovieTagsResponse,
    responses={
        404: {"model": ErrorResponse, "description": "영화를 찾을 수 없음"}
    }
)
async def get_movie_tags(movie_id: int):
    """
    영화 태그 조회

    - movie_id: 영화 ID
    """
    movie = get_movie_by_id(movie_id)

    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "MOVIE_NOT_FOUND",
                "message": "해당 영화를 찾을 수 없습니다."
            }
        )

    return MovieTagsResponse(
        movie_id=movie["movie_id"],
        title=movie["title"],
        tags=movie.get("tags", [])
    )
