# 인증 관련 API 라우터
# 현재는 더미 구현 (DB 연결 없음)

from fastapi import APIRouter, HTTPException, status

from ..schemas.auth import (
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    User,
    UserProfile,
    ErrorResponse
)


router = APIRouter(prefix="/auth", tags=["인증"])

# 더미 유저 정보
DUMMY_USER = {
    "email": "test@test.com",
    "password": "password123",
    "id": 1,
    "name": "테스트유저",
    "createdAt": "2025-01-01T00:00:00Z",
    "profile": {
        "favoriteGenres": ["SF", "드라마"],
        "ottServices": ["Netflix", "Disney+"]
    }
}


@router.post(
    "/login",
    response_model=LoginResponse,
    responses={
        400: {"model": ErrorResponse, "description": "로그인 실패"}
    }
)
async def login(request: LoginRequest):
    """
    로그인

    - email: test@test.com
    - password: password123
    위 정보로 로그인하면 성공, 그 외에는 400 에러
    """
    # 더미 유저 검증
    if request.email != DUMMY_USER["email"] or request.password != DUMMY_USER["password"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "INVALID_CREDENTIALS",
                "message": "아이디 또는 비밀번호가 일치하지 않습니다."
            }
        )

    # 더미 토큰 생성
    return LoginResponse(
        accessToken="dummy_access_token_12345",
        refreshToken="dummy_refresh_token_67890",
        user=User(
            id=DUMMY_USER["id"],
            email=DUMMY_USER["email"],
            name=DUMMY_USER["name"],
            createdAt=DUMMY_USER["createdAt"],
            profile=UserProfile(**DUMMY_USER["profile"])
        )
    )


@router.post("/logout", response_model=LogoutResponse)
async def logout():
    """
    로그아웃

    현재는 단순 응답만 반환 (세션/토큰 처리는 나중에 구현)
    """
    return LogoutResponse(message="로그아웃되었습니다.")
