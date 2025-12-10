// [용도] 챗봇 대화형 영화 추천 페이지
// [사용법] <Route path="/chatbot" element={<ChatbotPage />} />
// 백엔드 API 연동 버전

import { useState, useEffect } from 'react';
import ChatMessageList, { type Message } from '../services/chatbot/components/ChatMessageList';
import ChatInput from '../services/chatbot/components/ChatInput';
import { useMovieStore } from '../store/useMovieStore';
import type { RecommendedMovie } from '../api/movieApi.type';

// [타입] 대화 단계
type ConversationStep = 'greeting' | 'genre' | 'time' | 'result';

// [상수] 장르 목록
const GENRES = ["액션", "SF", "드라마", "로맨스", "애니메이션", "공포", "스릴러", "모험", "범죄", "판타지", "가족", "코미디"];

// [상수] 시간 옵션 (분 단위)
const TIME_OPTIONS = [
    { label: "1시간", value: 60 },
    { label: "1시간 30분", value: 90 },
    { label: "2시간", value: 120 },
    { label: "2시간 30분", value: 150 },
    { label: "3시간", value: 180 }
];

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationStep, setConversationStep] = useState<ConversationStep>('greeting');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedRuntime, setSelectedRuntime] = useState<number>(120);

    const {
        isLoading,
        setRuntime,
        toggleGenre,
        fetchRecommendations,
        resetFilters
    } = useMovieStore();

    // 초기 인사 메시지
    useEffect(() => {
        setMessages([{
            id: '1',
            type: 'bot',
            content: '안녕하세요! 🎬\n오늘은 어떤 영화를 보고 싶으세요?',
            quickReplies: ['영화 추천받기']
        }]);
    }, []);

    const addUserMessage = (text: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'user',
            content: text
        }]);
    };

    const addBotMessage = (content: string | React.ReactNode, quickReplies?: string[]) => {
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content,
            quickReplies
        }]);
    };

    const showBotResponse = (
        content: string | React.ReactNode,
        quickReplies?: string[],
        callback?: () => void
    ) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            addBotMessage(content, quickReplies);
            callback?.();
        }, 600);
    };

    // 영화 추천 실행
    const executeRecommendation = async () => {
        showBotResponse('잠시만요, 맞춤 영화를 찾고 있어요... 🔍');

        // 장르 적용
        selectedGenres.forEach(genre => toggleGenre(genre));
        setRuntime(selectedRuntime);

        // API 호출
        await fetchRecommendations();

        setTimeout(() => {
            addBotMessage(
                <ResultMovies />,
                ['다시 추천받기', '처음으로']
            );
            setConversationStep('result');
        }, 500);
    };

    // Quick Reply 클릭 처리
    const handleQuickReply = (reply: string) => {
        addUserMessage(reply);

        switch (conversationStep) {
            case 'greeting':
                if (reply === '영화 추천받기') {
                    resetFilters();
                    setSelectedGenres([]);
                    showBotResponse(
                        '어떤 장르를 좋아하세요? 😊\n최대 3개까지 선택 가능해요!',
                        [...GENRES, '선택 완료'],
                        () => setConversationStep('genre')
                    );
                }
                break;

            case 'genre':
                if (reply === '선택 완료') {
                    if (selectedGenres.length === 0) {
                        showBotResponse(
                            '장르를 선택하지 않으면 모든 장르에서 추천해드릴게요!\n시간이 얼마나 있으세요?',
                            TIME_OPTIONS.map(t => t.label),
                            () => setConversationStep('time')
                        );
                    } else {
                        showBotResponse(
                            `${selectedGenres.join(', ')} 장르로 선택하셨네요! 👍\n시간이 얼마나 있으세요?`,
                            TIME_OPTIONS.map(t => t.label),
                            () => setConversationStep('time')
                        );
                    }
                } else if (GENRES.includes(reply)) {
                    const newGenres = selectedGenres.includes(reply)
                        ? selectedGenres.filter(g => g !== reply)
                        : selectedGenres.length < 3
                            ? [...selectedGenres, reply]
                            : selectedGenres;

                    setSelectedGenres(newGenres);

                    if (newGenres.length >= 3 && !selectedGenres.includes(reply)) {
                        showBotResponse(
                            `최대 3개까지 선택 가능해요!\n현재 선택: ${newGenres.join(', ')}`,
                            [...GENRES, '선택 완료']
                        );
                    } else {
                        const msg = newGenres.length > 0
                            ? `현재 선택: ${newGenres.join(', ')}\n더 선택하거나 "선택 완료"를 눌러주세요!`
                            : '장르를 선택해주세요!';
                        showBotResponse(msg, [...GENRES, '선택 완료']);
                    }
                }
                break;

            case 'time':
                const timeOption = TIME_OPTIONS.find(t => t.label === reply);
                if (timeOption) {
                    setSelectedRuntime(timeOption.value);
                    showBotResponse(
                        `${reply} 이하의 영화를 찾아볼게요!`,
                        undefined,
                        () => executeRecommendation()
                    );
                }
                break;

            case 'result':
                if (reply === '다시 추천받기') {
                    resetFilters();
                    setSelectedGenres([]);
                    showBotResponse(
                        '다시 추천해드릴게요! 😊\n어떤 장르를 좋아하세요?',
                        [...GENRES, '선택 완료'],
                        () => setConversationStep('genre')
                    );
                } else if (reply === '처음으로') {
                    resetFilters();
                    setSelectedGenres([]);
                    setConversationStep('greeting');
                    showBotResponse(
                        '처음으로 돌아왔어요! 🎬\n영화 추천이 필요하시면 말씀해주세요!',
                        ['영화 추천받기']
                    );
                }
                break;
        }
    };

    // 텍스트 입력 처리
    const handleUserMessage = (text: string) => {
        addUserMessage(text);

        if (text.includes('추천') || text.includes('영화')) {
            handleQuickReply('영화 추천받기');
        } else if (text.includes('처음') || text.includes('다시')) {
            handleQuickReply('처음으로');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4 text-center">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    MovieSir 🎬
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    시간에 맞는 영화를 추천해드려요
                </p>
            </header>

            <div className="flex-1 overflow-hidden relative">
                <ChatMessageList
                    messages={messages}
                    isTyping={isTyping || isLoading}
                    onQuickReply={handleQuickReply}
                />
            </div>

            <ChatInput
                onSend={handleUserMessage}
                disabled={isTyping || isLoading}
                placeholder="메시지를 입력하거나 버튼을 클릭하세요..."
            />

            {/* 영화 상세 모달 */}
            <MovieDetailModal />
        </div>
    );
}

// 추천 결과 컴포넌트
function ResultMovies() {
    const { recommendedMovies, setDetailMovie } = useMovieStore();

    if (recommendedMovies.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-500">조건에 맞는 영화를 찾지 못했어요 😢</p>
                <p className="text-xs text-gray-400 mt-1">다른 조건으로 다시 시도해보세요!</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                🎯 추천 영화 ({recommendedMovies.length}개)
            </h3>
            <div className="space-y-3">
                {recommendedMovies.map(movie => (
                    <MovieCard
                        key={movie.movie_id}
                        movie={movie}
                        onClick={() => setDetailMovie(movie)}
                    />
                ))}
            </div>
        </div>
    );
}

// 영화 카드 컴포넌트
function MovieCard({ movie, onClick }: { movie: RecommendedMovie; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="flex gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
        >
            <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-16 h-24 object-cover rounded"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x96?text=No+Image';
                }}
            />
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {movie.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {movie.runtime}분 · ⭐ {movie.vote_average.toFixed(1)}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                    {movie.genres.slice(0, 3).join(', ')}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {movie.overview}
                </p>
            </div>
        </div>
    );
}

// 영화 상세 모달
function MovieDetailModal() {
    const { detailMovie, setDetailMovie } = useMovieStore();

    if (!detailMovie) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDetailMovie(null)}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <img
                    src={detailMovie.poster_url}
                    alt={detailMovie.title}
                    className="w-full h-64 object-cover rounded-t-xl"
                />
                <div className="p-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {detailMovie.title}
                    </h2>
                    <div className="flex gap-2 mt-2 text-sm text-gray-500">
                        <span>{detailMovie.runtime}분</span>
                        <span>·</span>
                        <span>⭐ {detailMovie.vote_average.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {detailMovie.genres.map(genre => (
                            <span
                                key={genre}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                        {detailMovie.overview}
                    </p>
                    <button
                        onClick={() => setDetailMovie(null)}
                        className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
