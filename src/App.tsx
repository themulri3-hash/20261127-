import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Type,
  Play,
  CheckCircle2,
  Grid2x2,
  BookOpen,
  Hash,
  Calculator,
} from 'lucide-react';
import { DifficultyLevel, GameMeta } from './types/game';
import {
  GameId,
  PlayStats,
  UserPrefs,
  loadPrefs,
  savePrefs,
  loadStats,
  recordGameComplete,
  getDailyRecommendedGameId,
  checkIsFirstVisitToday,
  markVisitedToday,
} from './utils/storage';
import { soundFX } from './utils/sound';
import { MemoryCardGame } from './games/MemoryCardGame';
import { WordSearchGame } from './games/WordSearchGame';
import { NumberOrderGame } from './games/NumberOrderGame';
import { MarketMathGame } from './games/MarketMathGame';
import { DailyMilestoneModal } from './components/DailyMilestoneModal';
import { DifficultySelectScreen } from './components/DifficultySelectScreen';

const GAMES: GameMeta[] = [
  {
    id: 'memory',
    title: '같은 그림 찾기',
    subtitle: '카드를 한 장씩 뒤집어 똑같은 그림 짝을 맞추는 기억력 놀이입니다.',
    category: '기억력',
    duration: '약 3분',
    difficulty: '12장 · 16장 · 20장',
    imageSrc: '/src/assets/images/game_memory_cards_1795757861032.jpg',
    imageAlt: '나무 탁자 위에 동백꽃과 소나무 그림 카드가 놓여 있는 모습',
    howToPlay: '처음에 그림을 잠깐 보여드린 뒤 뒤집어집니다. 같은 그림 두 장을 찾아보세요.',
    difficultyOptions: [
      {
        level: 'easy',
        title: '쉬움',
        badgeText: '12장 (6쌍)',
        description: '큰 카드 12장으로 부담 없이 편안하게 시작해요.',
      },
      {
        level: 'normal',
        title: '보통',
        badgeText: '16장 (8쌍)',
        description: '알맞은 16장으로 기억력을 즐겁게 키워요.',
      },
      {
        level: 'hard',
        title: '도전',
        badgeText: '20장 (10쌍)',
        description: '카드 20장을 모두 맞추는 데 도전해 보세요.',
      },
    ],
  },
  {
    id: 'word',
    title: '한국어 낱말 찾기',
    subtitle: '큰 한글 글자판에서 꽃과 나무, 정겨운 밥상 단어를 찾아보세요.',
    category: '어휘·집중력',
    duration: '약 4분',
    difficulty: '3단어 · 4단어 · 5단어',
    imageSrc: '/src/assets/images/game_word_puzzle_1795757860847.jpg',
    imageAlt: '따뜻한 보리차 한 잔과 돋보기, 나무 퍼즐 조각이 놓인 모습',
    howToPlay: '단어의 첫 글자를 누른 뒤 마지막 글자를 누르면 단어가 완성됩니다.',
    difficultyOptions: [
      {
        level: 'easy',
        title: '쉬움',
        badgeText: '3단어 · 반듯한 줄',
        description: '가로와 세로로만 놓인 3개 단어를 천천히 찾아요.',
      },
      {
        level: 'normal',
        title: '보통',
        badgeText: '4단어 · 대각선 포함',
        description: '대각선까지 포함된 4개 단어를 찾아보세요.',
      },
      {
        level: 'hard',
        title: '도전',
        badgeText: '5단어 · 전체',
        description: '5개 낱말을 모두 찾는 알찬 두뇌 놀이입니다.',
      },
    ],
  },
  {
    id: 'number',
    title: '1부터 순서대로 누르기',
    subtitle: '흩어져 있는 숫자 가운데 1부터 차례대로 찾아 누르는 집중력 놀이입니다.',
    category: '주의력·눈손협응',
    duration: '약 2분',
    difficulty: '9개 · 16개 · 25개',
    imageSrc: '/src/assets/images/game_number_order_1795757862069.jpg',
    imageAlt: '초록 매트 위에 1부터 20까지 나무 숫자 블록이 나란히 놓인 모습',
    howToPlay: '화면 위쪽에 안내되는 다음 숫자를 찾아 천천히 눌러주세요.',
    difficultyOptions: [
      {
        level: 'easy',
        title: '쉬움',
        badgeText: '1 ~ 9번',
        description: '큼직한 숫자 9개를 1부터 차례대로 눌러요.',
      },
      {
        level: 'normal',
        title: '보통',
        badgeText: '1 ~ 16번',
        description: '16개 숫자를 차근차근 찾아 집중력을 길러요.',
      },
      {
        level: 'hard',
        title: '도전',
        badgeText: '1 ~ 25번',
        description: '25개 숫자 모두 순서대로 빠르게 도전해 보세요.',
      },
    ],
  },
  {
    id: 'math',
    title: '알뜰 장보기 산수',
    subtitle: '사과, 두부, 달걀 값을 더하고 거스름돈을 맞히는 생활 계산 놀이입니다.',
    category: '계산력',
    duration: '약 3분',
    difficulty: '5문제 · 8문제 · 10문제',
    imageSrc: '/src/assets/images/game_math_market_1795757862241.jpg',
    imageAlt: '밝은 주방 식탁 위 바구니에 빨간 사과와 노란 배가 담긴 모습',
    howToPlay: '문제를 읽고 아래 네 개의 큰 숫자 보기 중에서 정답을 골라주세요.',
    difficultyOptions: [
      {
        level: 'easy',
        title: '쉬움',
        badgeText: '5문제 · 쉬운 수',
        description: '작은 수 계산과 장보기 5문제로 가볍게 풀어요.',
      },
      {
        level: 'normal',
        title: '보통',
        badgeText: '8문제 · 생활 계산',
        description: '장보기 합계와 거스름돈 8문제를 풀어보세요.',
      },
      {
        level: 'hard',
        title: '도전',
        badgeText: '10문제 · 큰 수',
        description: '조금 더 큰 숫자를 포함한 10문제에 도전해요.',
      },
    ],
  },
];

function renderFallbackIcon(id: GameId) {
  switch (id) {
    case 'memory':
      return <Grid2x2 className="w-12 h-12 text-[#146C43]" aria-hidden="true" />;
    case 'word':
      return <BookOpen className="w-12 h-12 text-[#146C43]" aria-hidden="true" />;
    case 'number':
      return <Hash className="w-12 h-12 text-[#146C43]" aria-hidden="true" />;
    case 'math':
      return <Calculator className="w-12 h-12 text-[#146C43]" aria-hidden="true" />;
  }
}

export default function App() {
  const [pendingGameId, setPendingGameId] = useState<GameId | null>(null);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [prefs, setPrefs] = useState<UserPrefs>(() => loadPrefs());
  const [stats, setStats] = useState<PlayStats>(() => loadStats());
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [showDailyMilestone, setShowDailyMilestone] = useState(false);
  const [isFirstVisitToday] = useState<boolean>(() => checkIsFirstVisitToday());

  useEffect(() => {
    markVisitedToday();
  }, []);

  const dailyGameId = getDailyRecommendedGameId();
  const dailyGame = GAMES.find((g) => g.id === dailyGameId) ?? GAMES[0];
  const dailyCompleted = stats.todayGames.includes(dailyGame.id);
  const todayKoreanDate = new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-large-text',
      prefs.largeText ? 'true' : 'false'
    );
    savePrefs(prefs);
  }, [prefs]);

  const toggleLargeText = () => {
    soundFX.tap(prefs.soundEnabled);
    setPrefs((prev) => ({ ...prev, largeText: !prev.largeText }));
  };

  const toggleSound = () => {
    const nextSound = !prefs.soundEnabled;
    if (nextSound) {
      soundFX.tap(true);
    }
    setPrefs((prev) => ({ ...prev, soundEnabled: nextSound }));
  };

  const handleOpenGame = (id: GameId) => {
    soundFX.tap(prefs.soundEnabled);
    setPendingGameId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDifficulty = (level: DifficultyLevel) => {
    setPrefs((prev) => ({ ...prev, preferredDifficulty: level }));
  };

  const handleConfirmStartGame = () => {
    if (!pendingGameId) return;
    setActiveGame(pendingGameId);
    setPendingGameId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGameComplete = (
    id: GameId,
    extra?: { numberSize?: number; seconds?: number }
  ) => {
    const { stats: updated, reachedThreeToday } = recordGameComplete(id, extra);
    setStats(updated);
    if (reachedThreeToday) {
      window.setTimeout(() => {
        soundFX.win(prefs.soundEnabled);
        setShowDailyMilestone(true);
      }, 450);
    }
  };

  const milestoneOverlay = showDailyMilestone ? (
    <DailyMilestoneModal
      todayClearCount={stats.todayClearCount}
      onKeepPlaying={() => {
        soundFX.tap(prefs.soundEnabled);
        setShowDailyMilestone(false);
      }}
      onGoHome={() => {
        soundFX.tap(prefs.soundEnabled);
        setShowDailyMilestone(false);
        setActiveGame(null);
        setPendingGameId(null);
      }}
    />
  ) : null;

  if (pendingGameId && !activeGame) {
    const pendingMeta = GAMES.find((g) => g.id === pendingGameId);
    if (pendingMeta) {
      return (
        <DifficultySelectScreen
          game={pendingMeta}
          selectedDifficulty={prefs.preferredDifficulty}
          onSelectDifficulty={handleSelectDifficulty}
          onStartGame={handleConfirmStartGame}
          onBackHome={() => setPendingGameId(null)}
          soundEnabled={prefs.soundEnabled}
          onToggleSound={toggleSound}
        />
      );
    }
  }

  if (activeGame === 'memory') {
    return (
      <>
        <MemoryCardGame
          soundEnabled={prefs.soundEnabled}
          initialDifficulty={prefs.preferredDifficulty}
          onToggleSound={toggleSound}
          onComplete={() => handleGameComplete('memory')}
          onBackHome={() => setActiveGame(null)}
        />
        {milestoneOverlay}
      </>
    );
  }

  if (activeGame === 'word') {
    return (
      <>
        <WordSearchGame
          soundEnabled={prefs.soundEnabled}
          initialDifficulty={prefs.preferredDifficulty}
          onToggleSound={toggleSound}
          onComplete={() => handleGameComplete('word')}
          onBackHome={() => setActiveGame(null)}
        />
        {milestoneOverlay}
      </>
    );
  }

  if (activeGame === 'number') {
    return (
      <>
        <NumberOrderGame
          soundEnabled={prefs.soundEnabled}
          initialDifficulty={prefs.preferredDifficulty}
          onToggleSound={toggleSound}
          onComplete={(extra) => handleGameComplete('number', extra)}
          onBackHome={() => setActiveGame(null)}
        />
        {milestoneOverlay}
      </>
    );
  }

  if (activeGame === 'math') {
    return (
      <>
        <MarketMathGame
          soundEnabled={prefs.soundEnabled}
          initialDifficulty={prefs.preferredDifficulty}
          onToggleSound={toggleSound}
          onComplete={() => handleGameComplete('math')}
          onBackHome={() => setActiveGame(null)}
        />
        {milestoneOverlay}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F2] text-[#16201B]">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 bg-[#F6F6F2]/95 backdrop-blur-md border-b border-[#D9DFD7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 sm:gap-8">
          <a
            href="#top"
            className="text-lg sm:text-xl font-bold tracking-tight text-[#16201B] whitespace-nowrap shrink-0"
          >
            시니어클럽 행복놀이터
          </a>

          <nav
            aria-label="주요 메뉴"
            className="hidden md:flex items-center gap-6 text-base font-medium text-[#435049]"
          >
            <a
              href="#games"
              className="hover:text-[#16201B] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              전체 놀이
            </a>
            <a
              href="#today-progress"
              className="hover:text-[#16201B] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              오늘의 기록
            </a>
            <a
              href="#guide"
              className="hover:text-[#16201B] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              이용 안내
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={toggleLargeText}
              aria-pressed={prefs.largeText}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm sm:text-base font-bold border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                prefs.largeText
                  ? 'bg-[#146C43] border-[#0F5132] text-white'
                  : 'bg-white border-[#CFD7CE] text-[#16201B] hover:bg-[#ECEFE9]'
              }`}
            >
              <Type className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{prefs.largeText ? '큰 글씨 켜짐' : '글자 더 크게'}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Warm Welcome & Today's Recommended Game Spotlight */}
        <section className="mb-8 sm:mb-10" aria-labelledby="daily-pick-heading">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div className="max-w-2xl">
              <p className="text-sm sm:text-base font-semibold text-[#146C43] mb-1.5">
                {isFirstVisitToday
                  ? `오늘 첫 방문을 환영합니다 · ${todayKoreanDate}`
                  : `어르신 맞춤형 두뇌 건강 놀이터 · ${todayKoreanDate}`}
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#16201B] tracking-tight leading-snug text-balance">
                오늘도 즐겁고 편안한 두뇌 체조를 시작해보세요
              </h1>
            </div>

            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={prefs.soundEnabled}
              className="self-start sm:self-auto min-h-[48px] px-4 py-2.5 rounded-2xl bg-white border border-[#CFD7CE] text-[#16201B] font-bold text-base hover:bg-[#ECEFE9] active:scale-[0.98] transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              {prefs.soundEnabled ? (
                <>
                  <Volume2 className="w-5 h-5 text-[#146C43] shrink-0" aria-hidden="true" />
                  <span>소리 켜짐</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-5 h-5 text-[#5D6962] shrink-0" aria-hidden="true" />
                  <span>소리 꺼짐</span>
                </>
              )}
            </button>
          </div>

          {/* Highlighted Today's Recommended Game Card */}
          <div className="bg-white rounded-3xl border-2 border-[#146C43]/40 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto bg-[#ECEFE9] overflow-hidden">
              {!brokenImages[dailyGame.id] ? (
                <img
                  src={dailyGame.imageSrc}
                  alt={dailyGame.imageAlt}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setBrokenImages((prev) => ({ ...prev, [dailyGame.id]: true }))
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#ECFDF5] to-[#E8ECE6] p-6">
                  {renderFallbackIcon(dailyGame.id)}
                  <span className="text-lg font-bold text-[#16201B]">{dailyGame.title}</span>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 p-5 sm:p-8 flex flex-col justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-bold text-[#146C43] mb-2">
                  <span>오늘의 추천 놀이</span>
                  <span aria-hidden="true" className="text-[#9AA59E]">·</span>
                  <span className="text-[#435049] font-medium">{dailyGame.category}</span>
                  <span aria-hidden="true" className="text-[#9AA59E]">·</span>
                  <span className="text-[#435049] font-medium">{dailyGame.duration}</span>
                  {dailyCompleted && (
                    <>
                      <span aria-hidden="true" className="text-[#9AA59E]">·</span>
                      <span className="inline-flex items-center gap-1 text-[#146C43]">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        오늘 도전 완료
                      </span>
                    </>
                  )}
                </div>

                <h2
                  id="daily-pick-heading"
                  className="text-2xl sm:text-3xl font-extrabold text-[#16201B] mb-2.5 text-balance"
                >
                  {dailyGame.title}
                </h2>

                <p className="text-base sm:text-lg text-[#435049] leading-relaxed">
                  {dailyCompleted
                    ? '오늘의 추천 놀이를 멋지게 마치셨어요! 한 번 더 즐기거나 아래의 다른 놀이도 골라보세요.'
                    : isFirstVisitToday
                    ? `오늘 처음 오셨네요! ${dailyGame.subtitle}`
                    : dailyGame.subtitle}
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenGame(dailyGame.id)}
                  className="w-full sm:w-auto min-h-[56px] px-7 py-3.5 rounded-2xl bg-[#146C43] text-white font-extrabold text-lg hover:bg-[#0F5132] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2.5 whitespace-nowrap shadow-sm"
                >
                  <Play className="w-5 h-5 fill-current shrink-0" aria-hidden="true" />
                  <span>
                    {dailyCompleted ? '오늘의 추천 놀이 다시 하기' : '오늘의 추천 놀이 시작하기'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Unboxed Daily Record Summary Strip */}
          <div
            id="today-progress"
            className="mt-8 py-4 border-t border-b border-[#DDE2DC] grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6"
          >
            <div>
              <div className="text-sm text-[#5D6962] font-medium">오늘 완료한 놀이</div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#16201B] tabular-nums mt-0.5">
                {stats.todayClearCount >= 3
                  ? `${stats.todayClearCount}회 (오늘 목표 달성)`
                  : `${stats.todayClearCount} / 3회`}
              </div>
            </div>

            <div>
              <div className="text-sm text-[#5D6962] font-medium">지금까지 완료 횟수</div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#146C43] tabular-nums mt-0.5">
                {stats.totalClears}회
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="text-sm text-[#5D6962] font-medium">순서 누르기 최고 기록</div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#16201B] tabular-nums mt-0.5">
                {stats.bestNumberTime9 !== null
                  ? `1~9번 ${stats.bestNumberTime9}초`
                  : stats.bestNumberTime16 !== null
                  ? `1~16번 ${stats.bestNumberTime16}초`
                  : '첫 기록 도전'}
              </div>
            </div>
          </div>
        </section>

        {/* 4 Game Cards Grid */}
        <section id="games" aria-labelledby="games-heading" className="mb-12">
          <div className="flex items-baseline justify-between mb-5">
            <h2 id="games-heading" className="text-2xl font-bold text-[#16201B]">
              원하시는 놀이를 골라보세요
            </h2>
            <span className="text-sm sm:text-base text-[#5D6962] tabular-nums">
              총 {GAMES.length}가지
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GAMES.map((game) => {
              const completedToday = stats.todayGames.includes(game.id);
              const imgFailed = brokenImages[game.id];

              return (
                <article
                  key={game.id}
                  className="bg-white rounded-3xl border border-[#DDE2DC] overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#146C43]/50 transition-colors"
                >
                  <div>
                    {/* 4:3 Illustration with CSS/SVG fallback */}
                    <div className="aspect-[4/3] w-full bg-[#ECEFE9] overflow-hidden relative">
                      {!imgFailed ? (
                        <img
                          src={game.imageSrc}
                          alt={game.imageAlt}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setBrokenImages((prev) => ({ ...prev, [game.id]: true }))
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#ECFDF5] to-[#E8ECE6] p-6">
                          {renderFallbackIcon(game.id)}
                          <span className="text-lg font-bold text-[#16201B]">
                            {game.title}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 sm:p-6">
                      {/* Zero-Pill Unboxed Metadata Line */}
                      <div className="flex flex-wrap items-center gap-2 text-sm text-[#5D6962] font-medium mb-2">
                        <span className="text-[#146C43] font-bold">{game.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{game.duration}</span>
                        <span aria-hidden="true">·</span>
                        <span>{game.difficulty}</span>
                        {completedToday && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 text-[#146C43] font-bold">
                              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                              오늘 완료
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-[#16201B] mb-2">
                        {game.title}
                      </h3>

                      <p className="text-base text-[#435049] leading-relaxed">
                        {game.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenGame(game.id)}
                      className="w-full min-h-[54px] px-5 py-3 rounded-2xl bg-[#146C43] text-white font-bold text-lg hover:bg-[#0F5132] active:scale-[0.98] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Play className="w-5 h-5 fill-current shrink-0" aria-hidden="true" />
                      <span>게임 시작하기</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Simple Senior-Friendly Usage Guide */}
        <section
          id="guide"
          aria-labelledby="guide-heading"
          className="pt-8 border-t border-[#DDE2DC]"
        >
          <h2 id="guide-heading" className="text-xl sm:text-2xl font-bold text-[#16201B] mb-5">
            어르신 이용 안내
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-bold text-[#146C43] mb-1.5">
                01. 큰 글씨로 편하게 보세요
              </h3>
              <p className="text-base text-[#435049] leading-relaxed">
                화면 오른쪽 위의 &lsquo;큰 글씨 켜짐&rsquo; 버튼을 누르시면 글자와 버튼 크기를 자유롭게 바꾸실 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#146C43] mb-1.5">
                02. 시간에 쫓기지 마세요
              </h3>
              <p className="text-base text-[#435049] leading-relaxed">
                제한 시간으로 재촉하지 않습니다. 틀려도 점수가 깎이지 않으니 천천히 생각하며 눌러보세요.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#146C43] mb-1.5">
                03. 막힐 땐 노란 힌트 버튼
              </h3>
              <p className="text-base text-[#435049] leading-relaxed">
                어려운 문제가 나오면 화면 아래의 노란색 힌트 버튼을 눌러 도움을 받으실 수 있습니다.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#DDE2DC] py-6 px-4 text-center text-sm text-[#5D6962]">
        시니어클럽 행복놀이터 · 어르신 두뇌 건강을 위한 모바일 놀이 공간
      </footer>
      {milestoneOverlay}
    </div>
  );
}
