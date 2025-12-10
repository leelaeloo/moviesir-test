import { useState, useEffect } from 'react';
import type { ChatbotPanelProps } from "./chatbot.types";
import ChatMessageList, { type Message } from './ChatMessageList';
import FilterChatBlock from '../FilterBlock/FilterChatBlock';
import MovieDetailModal from '../MovieDetailModal/MovieDetailModal';
import MovieCard from './MovieCard';
import { useMovieStore } from '../../../store/useMovieStore';

export default function ChatbotPanel({ isOpen, onClose }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { fetchRecommendations } = useMovieStore();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessages: Message[] = [
        {
          id: '1',
          type: 'bot',
          content: '영화 추천을 위해 아래에서 필터를 선택해주세요!'
        },
        {
          id: '2',
          type: 'bot',
          content: <FilterChatBlock onApply={handleApplyFilters} />
        }
      ];
      setMessages(initialMessages);
    }
  }, [isOpen]);

  const handleApplyFilters = async () => {
    // 백엔드 API 호출
    await fetchRecommendations();

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'bot',
        content: '추천 결과입니다!'
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: (
          <div className="w-full">
            <h3 className="text-sm font-bold text-gray-500 mb-2">맞춤 추천</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <RecommendedList />
            </div>
          </div>
        )
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed bottom-5 left-5
        sm:left-1/2 sm:-translate-x-1/2
        w-full sm:w-[20em] lg:w-[32em]
        max-w-[calc(100%-2.5rem)]
        h-[30em]
        bg-white dark:bg-gray-800
        border-2 border-gray-900 dark:border-gray-600
        rounded-[20px]
        overflow-hidden
        z-panel
        flex flex-col
        animate-panel-appear
        shadow-[5px_5px_0px_rgba(0,0,0,0.8)]
        dark:shadow-[5px_5px_0px_rgba(96,165,250,1)]
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b-2 border-gray-900 dark:border-gray-600">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize text-center flex-1">
          무비서
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <ChatMessageList messages={messages} />
      </div>

      <MovieDetailModal />
    </div>
  );
}

// 추천 영화 목록
function RecommendedList() {
  const { recommendedMovies, setDetailMovie } = useMovieStore();

  if (recommendedMovies.length === 0) {
    return <p className="text-xs text-gray-400 col-span-3">조건에 맞는 영화가 없습니다.</p>;
  }

  return (
    <>
      {recommendedMovies.map(movie => (
        <MovieCard
          key={movie.movie_id}
          movie={movie}
          onClick={() => setDetailMovie(movie)}
        />
      ))}
    </>
  );
}
