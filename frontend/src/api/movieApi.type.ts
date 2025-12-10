// [용도] 영화 관련 API 타입 정의
// [사용법] import { Movie, WatchHistory, Recommendation } from "./movieApi.type";

export interface Movie {
    id: number;
    title: string;
    genres: string[];
    year?: number;
    rating?: number;
    popularity?: number;
    poster: string;
    description: string;
    popular: boolean;
    watched?: boolean;
}

export interface WatchHistory {
    id: number;
    userId: number;
    movieId: number;
    watchedAt: string;
    rating: number;
}

export interface WatchHistoryWithMovie extends WatchHistory {
    movie: Movie;
}

export interface Recommendation {
    id: number;
    userId: number;
    movieId: number;
    recommendedAt: string;
    reason: string;
}

export interface RecommendationWithMovie extends Recommendation {
    movie: Movie;
}

export interface UserStats {
    totalWatched: number;
    averageRating: number;
    favoriteGenre: string;
    watchedByGenre: { [genre: string]: number };
}

export interface MovieRecommendationResult {
    algorithmic: Movie[];  // 알고리즘 기반 추천 3개
    popular: Movie[];      // 인기작 3개
}

// 챗봇 추천 요청 타입
export interface ChatbotRecommendRequest {
    runtime: number;          // 시청 가능 시간 (30~180분)
    genres: number[];         // 장르 ID 배열 (최대 3개)
    include_adult: boolean;   // 성인 콘텐츠 포함 여부
}

// 챗봇 추천 영화 타입
export interface RecommendedMovie {
    movie_id: number;
    title: string;
    runtime: number;
    genres: string[];
    poster_url: string;
    vote_average: number;
    overview: string;
}

// 챗봇 추천 응답 타입
export interface ChatbotRecommendResponse {
    recommendations: RecommendedMovie[];
    total: number;
    filters_applied: {
        runtime: number;
        genres: number[];
        include_adult: boolean;
    };
}
