import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lightbulb, Eye } from 'lucide-react';
import { GameHeader, VictoryCard } from '../components/GameShell';
import { MEMORY_SYMBOLS, MemorySymbol } from '../components/CardIllustrations';
import { soundFX } from '../utils/sound';
import { GameProps } from '../types/game';

interface CardItem {
  uid: number;
  symbol: MemorySymbol;
  flipped: boolean;
  matched: boolean;
}

type Difficulty = 6 | 8 | 10;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function difficultyToPairs(level?: 'easy' | 'normal' | 'hard'): Difficulty {
  if (level === 'normal') return 8;
  if (level === 'hard') return 10;
  return 6;
}

export const MemoryCardGame: React.FC<GameProps> = ({
  soundEnabled,
  initialDifficulty,
  onToggleSound,
  onComplete,
  onBackHome,
}) => {
  const [pairCount, setPairCount] = useState<Difficulty>(() =>
    difficultyToPairs(initialDifficulty)
  );
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isPeeking, setIsPeeking] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [hintIndices, setHintIndices] = useState<number[]>([]);
  const [won, setWon] = useState(false);

  const peekTimerRef = useRef<number | null>(null);
  const matchTimerRef = useRef<number | null>(null);
  const hintTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (peekTimerRef.current) window.clearTimeout(peekTimerRef.current);
    if (matchTimerRef.current) window.clearTimeout(matchTimerRef.current);
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
  }, []);

  const startNewGame = useCallback(
    (pairs: Difficulty) => {
      clearTimers();
      const chosen = shuffle(MEMORY_SYMBOLS).slice(0, pairs);
      const deck: CardItem[] = shuffle([...chosen, ...chosen]).map((symbol, idx) => ({
        uid: idx,
        symbol,
        flipped: false,
        matched: false,
      }));
      setCards(deck);
      setSelectedIndices([]);
      setMoves(0);
      setHintIndices([]);
      setWon(false);
      setIsLocked(false);
      setIsPeeking(true);

      peekTimerRef.current = window.setTimeout(() => {
        setIsPeeking(false);
      }, 2400);
    },
    [clearTimers]
  );

  useEffect(() => {
    startNewGame(pairCount);
    return () => clearTimers();
  }, [pairCount, startNewGame, clearTimers]);

  const handleCardTap = (index: number) => {
    if (isPeeking || isLocked || won) return;
    const target = cards[index];
    if (!target || target.flipped || target.matched) return;

    soundFX.tap(soundEnabled);
    setHintIndices([]);

    const updated = cards.map((c, idx) => (idx === index ? { ...c, flipped: true } : c));
    setCards(updated);

    const nextSelected = [...selectedIndices, index];
    setSelectedIndices(nextSelected);

    if (nextSelected.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = nextSelected;
      const firstCard = updated[firstIdx];
      const secondCard = updated[secondIdx];

      if (firstCard.symbol.id === secondCard.symbol.id) {
        setIsLocked(true);
        matchTimerRef.current = window.setTimeout(() => {
          soundFX.match(soundEnabled);
          setCards((prev) => {
            const nextCards = prev.map((c, idx) =>
              idx === firstIdx || idx === secondIdx ? { ...c, matched: true } : c
            );
            const allMatched = nextCards.every((c) => c.matched);
            if (allMatched) {
              soundFX.win(soundEnabled);
              setWon(true);
              onComplete();
            }
            return nextCards;
          });
          setSelectedIndices([]);
          setIsLocked(false);
        }, 320);
      } else {
        setIsLocked(true);
        matchTimerRef.current = window.setTimeout(() => {
          soundFX.gentleWrong(soundEnabled);
          setCards((prev) =>
            prev.map((c, idx) =>
              idx === firstIdx || idx === secondIdx ? { ...c, flipped: false } : c
            )
          );
          setSelectedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  const handleHint = () => {
    if (isPeeking || isLocked || won) return;
    const unmatched = cards
      .map((c, idx) => ({ c, idx }))
      .filter(({ c }) => !c.matched && !c.flipped);
    if (unmatched.length < 2) return;

    const first = unmatched[0];
    const partner = unmatched.find(
      ({ c, idx }) => idx !== first.idx && c.symbol.id === first.c.symbol.id
    );
    if (!partner) return;

    soundFX.hint(soundEnabled);
    setHintIndices([first.idx, partner.idx]);
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
    hintTimerRef.current = window.setTimeout(() => {
      setHintIndices([]);
    }, 1800);
  };

  const handlePeekAgain = () => {
    if (isPeeking || isLocked || won) return;
    soundFX.hint(soundEnabled);
    setIsPeeking(true);
    if (peekTimerRef.current) window.clearTimeout(peekTimerRef.current);
    peekTimerRef.current = window.setTimeout(() => {
      setIsPeeking(false);
    }, 1800);
  };

  const matchedPairs = cards.filter((c) => c.matched).length / 2;
  const gridColsClass =
    pairCount === 6
      ? 'grid-cols-3 sm:grid-cols-4'
      : 'grid-cols-4';

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F2]">
      <GameHeader
        title="같은 그림 찾기"
        onBackHome={onBackHome}
        onRestart={() => startNewGame(pairCount)}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Difficulty selector */}
        <div
          className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#E8ECE6] rounded-2xl"
          role="group"
          aria-label="난이도 선택"
        >
          {[
            { value: 6 as Difficulty, label: '쉬움 (12장)' },
            { value: 8 as Difficulty, label: '보통 (16장)' },
            { value: 10 as Difficulty, label: '도전 (20장)' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                soundFX.tap(soundEnabled);
                setPairCount(opt.value);
              }}
              className={`min-h-[44px] px-2 py-2 rounded-xl text-sm sm:text-base font-bold transition-colors whitespace-nowrap ${
                pairCount === opt.value
                  ? 'bg-white text-[#146C43] shadow-sm'
                  : 'text-[#435049] hover:text-[#16201B]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Status strip */}
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-[#DDE2DC]">
          <div className="text-base font-semibold text-[#16201B]">
            {isPeeking ? (
              <span className="text-[#B45309]">그림 위치를 잠깐 기억해보세요!</span>
            ) : (
              <span>
                맞힌 짝{' '}
                <strong className="text-[#146C43] tabular-nums text-lg">
                  {matchedPairs} / {pairCount}
                </strong>
              </span>
            )}
          </div>
          <div className="text-sm sm:text-base text-[#435049] tabular-nums font-medium">
            시도 {moves}번
          </div>
        </div>

        {/* Card grid */}
        <div className={`grid ${gridColsClass} gap-2.5 sm:gap-3`}>
          {cards.map((card, idx) => {
            const showFace = isPeeking || card.flipped || card.matched;
            const isHinted = hintIndices.includes(idx);

            return (
              <button
                key={card.uid}
                type="button"
                onClick={() => handleCardTap(idx)}
                disabled={showFace || isPeeking}
                aria-label={
                  showFace ? `${card.symbol.label} 카드` : `${idx + 1}번 뒷면 카드 열기`
                }
                className={`relative min-h-[92px] sm:min-h-[112px] rounded-2xl border-2 transition-transform duration-150 flex flex-col items-center justify-center p-2 select-none ${
                  card.matched
                    ? 'bg-[#ECFDF5] border-[#146C43] opacity-90'
                    : showFace
                    ? `${card.symbol.bgTint} border-[#16201B]/20 shadow-sm`
                    : isHinted
                    ? 'bg-[#FEF3C7] border-[#D97706] scale-[1.03] shadow-md'
                    : 'bg-[#146C43] border-[#0F5132] hover:bg-[#157347] active:scale-[0.96] shadow-sm'
                }`}
              >
                {showFace ? (
                  <>
                    {card.symbol.renderIcon('w-10 h-10 sm:w-12 sm:h-12 mb-1')}
                    <span className="text-sm sm:text-base font-bold text-[#16201B] leading-tight whitespace-nowrap">
                      {card.symbol.label}
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span
                      className={`text-xl sm:text-2xl font-bold tabular-nums ${
                        isHinted ? 'text-[#92400E]' : 'text-white/90'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    {isHinted && (
                      <span className="text-xs font-bold text-[#92400E] mt-0.5">여기!</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Thumb-zone helper buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1 pb-4">
          <button
            type="button"
            onClick={handleHint}
            disabled={isPeeking || won}
            className="min-h-[54px] px-4 py-3 rounded-2xl bg-[#FFFBEB] border border-[#F59E0B]/50 text-[#92400E] font-bold text-base hover:bg-[#FEF3C7] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            <Lightbulb className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>힌트 보기</span>
          </button>

          <button
            type="button"
            onClick={handlePeekAgain}
            disabled={isPeeking || won}
            className="min-h-[54px] px-4 py-3 rounded-2xl bg-white border border-[#CFD7CE] text-[#16201B] font-bold text-base hover:bg-[#ECEFE9] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            <Eye className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>잠깐 다 보기</span>
          </button>
        </div>
      </main>

      {won && (
        <VictoryCard
          title="모든 짝을 다 찾으셨습니다!"
          summary={`총 ${moves}번 만에 ${pairCount}쌍의 그림을 모두 맞추셨어요. 기억력이 정말 좋으시네요!`}
          onPlayAgain={() => startNewGame(pairCount)}
          onBackHome={onBackHome}
        />
      )}
    </div>
  );
};
