// ============================================================
// [용도] 영화 카드 컴포넌트 (포스터, 제목, 장르 표시)
// [사용법] <MovieCard movie={movieData} onClick={handleClick} />
// ============================================================

import type { Movie, RecommendedMovie } from '../../../api/movieApi.type';

// Movie 또는 RecommendedMovie 타입 모두 지원
type MovieType = Movie | RecommendedMovie;

interface MovieCardProps {
    movie: MovieType;
    onClick: () => void;
}

// RecommendedMovie 타입인지 확인
function isRecommendedMovie(movie: MovieType): movie is RecommendedMovie {
    return 'movie_id' in movie;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
    // 타입에 따라 속성 추출
    const posterUrl = isRecommendedMovie(movie) ? movie.poster_url : movie.poster;
    const title = movie.title;
    const genres = movie.genres;

    return (
        <div
            className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
            onClick={onClick}
        >
            {/* 포스터 이미지 */}
            <div className="aspect-[2/3] w-full relative">
                <img
                    src={posterUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x225?text=No+Image';
                    }}
                />
                {/* 호버 시 어두운 오버레이 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>

            {/* 제목 및 장르 */}
            <div className="p-2 bg-white dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {genres.join(", ")}
                </p>
            </div>
        </div>
    );
}
