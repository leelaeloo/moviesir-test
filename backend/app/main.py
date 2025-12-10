# MovieSir Backend API
# FastAPI + Python 3.11 + Pydantic v2

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import auth, movies, recommend


# FastAPI 앱 생성
app = FastAPI(
    title="MovieSir API",
    description="시간 기반 영화 추천 서비스 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 설정 (프론트엔드 localhost:5173 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite 개발 서버
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(recommend.router)


@app.get("/", tags=["헬스체크"])
async def root():
    """API 헬스체크"""
    return {
        "message": "MovieSir API에 오신 것을 환영합니다!",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health", tags=["헬스체크"])
async def health_check():
    """서버 상태 확인"""
    return {"status": "healthy"}
