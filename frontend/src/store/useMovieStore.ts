import { create } from 'zustand';
import { type RecommendedMovie, type Movie } from '../api/movieApi.type';
import { getChatbotRecommendations } from '../api/movieApi';

// 장르 이름 → ID 매핑 (백엔드 기준)
const GENRE_NAME_TO_ID: { [key: string]: number } = {
    "액션": 1, "Action": 1,
    "모험": 2, "Adventure": 2,
    "애니메이션": 3, "Animation": 3,
    "코미디": 4, "Comedy": 4,
    "범죄": 5, "Crime": 5,
    "다큐멘터리": 6, "Documentary": 6,
    "드라마": 7, "Drama": 7,
    "가족": 8, "Family": 8,
    "판타지": 9, "Fantasy": 9,
    "역사": 10, "History": 10,
    "공포": 11, "Horror": 11,
    "음악": 12, "Music": 12,
    "미스터리": 13, "Mystery": 13,
    "로맨스": 14, "Romance": 14,
    "SF": 15, "Sci-Fi": 15,
    "스릴러": 16, "Thriller": 16
};

// 기존 호환성을 위한 Filters 인터페이스
interface Filters {
    time: string;           // 기존 호환 (HH:MM 형식)
    genres: string[];       // 기존 호환 (장르 이름 배열)
    runtime: number;        // 새로운 (분 단위)
    genreIds: number[];     // 새로운 (장르 ID 배열)
    includeAdult: boolean;
}

interface MovieState {
    filters: Filters;
    allMovies: Movie[];
    recommendedMovies: RecommendedMovie[];
    popularMovies: Movie[];
    detailMovie: RecommendedMovie | null;
    isLoading: boolean;
    error: string | null;

    // 기존 호환 Actions
    setTime: (time: string) => void;
    toggleGenre: (genreName: string) => void;
    loadMovies: () => Promise<void>;
    loadRecommended: () => void;
    loadPopular: () => void;

    // 새로운 Actions
    setRuntime: (minutes: number) => void;
    setIncludeAdult: (include: boolean) => void;
    fetchRecommendations: () => Promise<void>;

    setDetailMovie: (movie: RecommendedMovie | null) => void;
    resetFilters: () => void;
}

export const useMovieStore = create<MovieState>((set, get) => ({
    filters: {
        time: "02:00",
        genres: [],
        runtime: 120,
        genreIds: [],
        includeAdult: false
    },
    allMovies: [],
    recommendedMovies: [],
    popularMovies: [],
    detailMovie: null,
    isLoading: false,
    error: null,

    // 기존 호환: 시간 설정 (HH:MM 형식)
    setTime: (time) => set((state) => {
        const [hours, minutes] = time.split(':').map(Number);
        const runtime = hours * 60 + minutes;
        return {
            filters: { ...state.filters, time, runtime }
        };
    }),

    // 장르 토글 (이름으로)
    toggleGenre: (genreName) => set((state) => {
        // 장르 이름 배열 업데이트
        const genres = state.filters.genres.includes(genreName)
            ? state.filters.genres.filter(g => g !== genreName)
            : [...state.filters.genres, genreName];

        // 장르 ID 배열 업데이트
        const genreId = GENRE_NAME_TO_ID[genreName];
        const genreIds = genreId
            ? (state.filters.genreIds.includes(genreId)
                ? state.filters.genreIds.filter(id => id !== genreId)
                : [...state.filters.genreIds, genreId].slice(0, 3))
            : state.filters.genreIds;

        return { filters: { ...state.filters, genres, genreIds } };
    }),

    // 기존 호환: 영화 로드 (더미)
    loadMovies: async () => {
        set({ isLoading: true });
        // 기존 로직 - 현재는 빈 배열
        set({ allMovies: [], isLoading: false });
    },

    // 기존 호환: 추천 영화 로드
    loadRecommended: () => {
        // 새 API 호출로 대체
        get().fetchRecommendations();
    },

    // 기존 호환: 인기 영화 로드
    loadPopular: () => {
        // 현재는 빈 배열 (추후 구현)
        set({ popularMovies: [] });
    },

    // 새로운: 런타임 설정 (분 단위)
    setRuntime: (minutes) => set((state) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const time = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        return {
            filters: { ...state.filters, runtime: minutes, time }
        };
    }),

    setIncludeAdult: (include) => set((state) => ({
        filters: { ...state.filters, includeAdult: include }
    })),

    // 새로운: 백엔드 API 호출
    fetchRecommendations: async () => {
        const { filters } = get();
        set({ isLoading: true, error: null });

        try {
            const response = await getChatbotRecommendations({
                runtime: filters.runtime,
                genres: filters.genreIds,
                include_adult: filters.includeAdult
            });

            set({
                recommendedMovies: response.recommendations,
                isLoading: false
            });
        } catch (error) {
            console.error("Failed to fetch recommendations:", error);
            set({
                error: "영화 추천을 불러오는데 실패했습니다",
                isLoading: false,
                recommendedMovies: []
            });
        }
    },

    setDetailMovie: (movie) => set({ detailMovie: movie }),

    resetFilters: () => set({
        filters: {
            time: "02:00",
            genres: [],
            runtime: 120,
            genreIds: [],
            includeAdult: false
        },
        recommendedMovies: [],
        popularMovies: []
    })
}));
