// ============================================================
// [용도] 영화 상세 정보 모달
// [사용법] <MovieDetailModal /> (Zustand store에서 detailMovie 감지)
// ============================================================

import Modal from '../../../components/Modal';
import { useMovieStore } from '../../../store/useMovieStore';
import { Clock, Star } from 'lucide-react';

export default function MovieDetailModal() {
    const { detailMovie, setDetailMovie } = useMovieStore();

    return (
        <Modal isOpen={!!detailMovie} onClose={() => setDetailMovie(null)}>
            {detailMovie && (
                <div className="flex flex-col md:flex-row">
                    {/* 포스터 이미지 */}
                    <div className="w-full md:w-1/3 aspect-[2/3] relative">
                        <img
                            src={detailMovie.poster_url}
                            alt={detailMovie.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
                            }}
                        />
                    </div>

                    {/* 상세 정보 영역 */}
                    <div className="w-full md:w-2/3 p-6 flex flex-col">
                        {/* 제목 */}
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {detailMovie.title}
                        </h2>

                        {/* 장르 뱃지들 */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {detailMovie.genres.map((genre: string) => (
                                <span key={genre} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                    {genre}
                                </span>
                            ))}
                        </div>

                        {/* 설명 */}
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 flex-1">
                            {detailMovie.overview}
                        </p>

                        {/* 평점, 시간 정보 */}
                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                            <div className="flex flex-col items-center">
                                <Star className="text-yellow-400 mb-1" size={20} />
                                <span className="text-xs text-gray-500">평점</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {detailMovie.vote_average.toFixed(1)}
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Clock className="text-blue-500 mb-1" size={20} />
                                <span className="text-xs text-gray-500">러닝타임</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {detailMovie.runtime}분
                                </span>
                            </div>
                        </div>

                        {/* 닫기 버튼 */}
                        <button
                            className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                            onClick={() => setDetailMovie(null)}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
