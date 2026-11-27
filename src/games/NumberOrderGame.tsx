import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lightbulb, Check } from 'lucide-react';
import { GameHeader, VictoryCard } from '../components/GameShell';
import { soundFX } from '../utils/sound';
import { GameProps } from '../types/game';

type GridCount = 9 | 16 | 25;

function shuffleNumbers(count: number): number[] {
  const arr = Array.from({ length: count }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function difficultyToCount(level?: 'easy' | 'normal' | 'hard'): GridCount {
  if (level === 'normal') return 16;
  if (level === 'hard') return 25;
  return 9;
}

export const NumberOrderGame: React.FC<GameProps> = ({
  soundEnabled,
  initialDifficulty,
  onToggleSound,
  onComplete,
  onBackHome,
}) => {
  const [gridCount, setGridCount] = useState<GridCount>(() =>
    difficultyToCount(initialDifficulty)
  );
  const [numbers, setNumbers] = useState<number[]>([]);
  const [nextTarget, setNextTarget] = useState(1);
  const [hintActive, setHintActive] = useState(false);
  const [wrongMessage, setWrongMessage] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);

  const hintTimerRef = useRef<number | null>(null);
  const msgTimerRef = useRef<number | null>(null);

  const startNewGame = useCallback((count: GridCount) => {
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
    if (msgTimerRef.current) window.clearTimeout(msgTimerRef.current);
    setNumbers(shuffleNumbers(count));
    setNextTarget(1);
    setHintActive(false);
    setWrongMessage(null);
    setElapsedSeconds(0);
    setStarted(false);
    setWon(false);
  }, []);

  useEffect(() => {
    startNewGame(gridCount);
    return () => {
      if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
      if (msgTimerRef.current) window.clearTimeout(msgTimerRef.current);
    };
  }, [gridCount, startNewGame]);

  useEffect(() => {
    if (!started || won) return;
    const id = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, won]);

  const handleTileTap = (num: number) => {
    if (won || num < nextTarget) return;

    if (!started) setStarted(true);

    if (num === nextTarget) {
      soundFX.scaleStep(soundEnabled, num);
      setHintActive(false);
      setWrongMessage(null);

      if (num === gridCount) {
        soundFX.win(soundEnabled);
        setWon(true);
        setNextTarget(gridCount + 1);
        onComplete({ numberSize: gridCount, seconds: elapsedSeconds });
      } else {
        setNextTarget(num + 1);
      }
    } else {
      soundFX.gentleWrong(soundEnabled);
      setWrongMessage(`지금은 ${nextTarget}번을 찾을 차례예요!`);
      if (msgTimerRef.current) window.clearTimeout(msgTimerRef.current);
      msgTimerRef.current = window.setTimeout(() => {
        setWrongMessage(null);
      }, 1800);
    }
  };

  const handleHint = () => {
    if (won) return;
    soundFX.hint(soundEnabled);
    setHintActive(true);
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
    hintTimerRef.current = window.setTimeout(() => {
      setHintActive(false);
    }, 2200);
  };

  const gridColsClass =
    gridCount === 9
      ? 'grid-cols-3'
      : gridCount === 16
      ? 'grid-cols-4'
      : 'grid-cols-5';

  const tileHeightClass =
    gridCount === 9
      ? 'min-h-[96px] sm:min-h-[112px] text-3xl sm:text-4xl'
      : gridCount === 16
      ? 'min-h-[76px] sm:min-h-[90px] text-2xl sm:text-3xl'
      : 'min-h-[60px] sm:min-h-[72px] text-xl sm:text-2xl';

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F2]">
      <GameHeader
        title="1부터 순서대로 누르기"
        onBackHome={onBackHome}
        onRestart={() => startNewGame(gridCount)}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
      />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Difficulty selector */}
        <div
          className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#E8ECE6] rounded-2xl"
          role="group"
          aria-label="숫자 개수 선택"
        >
          {[
            { value: 9 as GridCount, label: '쉬움 (1~9)' },
            { value: 16 as GridCount, label: '보통 (1~16)' },
            { value: 25 as GridCount, label: '도전 (1~25)' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                soundFX.tap(soundEnabled);
                setGridCount(opt.value);
              }}
              className={`min-h-[44px] px-2 py-2 rounded-xl text-sm sm:text-base font-bold transition-colors whitespace-nowrap ${
                gridCount === opt.value
                  ? 'bg-white text-[#146C43] shadow-sm'
                  : 'text-[#435049] hover:text-[#16201B]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Clear Target Banner */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white rounded-2xl border border-[#DDE2DC]">
          <div className="flex items-center gap-3">
            <span className="text-base sm:text-lg font-semibold text-[#435049]">
              다음 누를 숫자
            </span>
            <span className="inline-flex items-center justify-center min-w-[52px] h-12 px-3 rounded-xl bg-[#146C43] text-white text-2xl font-extrabold tabular-nums">
              {won ? '끝' : nextTarget}
            </span>
          </div>

          <div className="text-right">
            <div className="text-xs text-[#5D6962]">진행</div>
            <div className="text-base font-bold text-[#16201B] tabular-nums">
              {Math.min(nextTarget - 1, gridCount)} / {gridCount}
            </div>
          </div>
        </div>

        {/* Gentle status feedback */}
        <div className="min-h-[28px] flex items-center justify-center text-center">
          {wrongMessage ? (
            <p className="text-base font-bold text-[#B45309]">{wrongMessage}</p>
          ) : (
            <p className="text-sm sm:text-base text-[#435049]">
              1부터 {gridCount}까지 차례대로 천천히 눌러보세요.
            </p>
          )}
        </div>

        {/* Number Grid */}
        <div className={`grid ${gridColsClass} gap-2.5 sm:gap-3`}>
          {numbers.map((num) => {
            const isDone = num < nextTarget;
            const isHinted = hintActive && num === nextTarget;

            return (
              <button
                key={num}
                type="button"
                onClick={() => handleTileTap(num)}
                disabled={isDone || won}
                aria-label={`${num}번${isDone ? ' 완료됨' : ''}`}
                className={`${tileHeightClass} rounded-2xl border-2 font-extrabold tabular-nums flex flex-col items-center justify-center transition-transform duration-150 select-none ${
                  isDone
                    ? 'bg-[#E7F4EC] border-[#A7D7B8] text-[#146C43]/60'
                    : isHinted
                    ? 'bg-[#FEF3C7] border-[#D97706] text-[#92400E] scale-[1.04] shadow-md'
                    : 'bg-white border-[#CFD7CE] text-[#16201B] hover:border-[#146C43] active:scale-[0.95] shadow-sm'
                }`}
              >
                <span>{num}</span>
                {isDone && <Check className="w-4 h-4 mt-0.5 text-[#146C43]" aria-hidden="true" />}
                {isHinted && (
                  <span className="text-xs font-bold text-[#92400E] leading-none mt-0.5">여기</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Thumb Hint CTA */}
        <div className="pt-2 pb-4">
          <button
            type="button"
            onClick={handleHint}
            disabled={won}
            className="w-full min-h-[54px] px-6 py-3 rounded-2xl bg-[#FFFBEB] border border-[#F59E0B]/50 text-[#92400E] font-bold text-base hover:bg-[#FEF3C7] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lightbulb className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{nextTarget}번 어디 있는지 알려주세요 (힌트)</span>
          </button>
        </div>
      </main>

      {won && (
        <VictoryCard
          title="순서대로 모두 찾으셨습니다!"
          summary={`1부터 ${gridCount}까지 ${elapsedSeconds}초 만에 차근차근 잘 마치셨어요.`}
          onPlayAgain={() => startNewGame(gridCount)}
          onBackHome={onBackHome}
        />
      )}
    </div>
  );
};
