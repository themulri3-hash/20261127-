import React, { useState, useCallback, useEffect } from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { GameHeader, VictoryCard } from '../components/GameShell';
import { soundFX } from '../utils/sound';
import { GameProps } from '../types/game';

interface MathQuestion {
  categoryLabel: string;
  prompt: string;
  detailText?: string;
  answer: number;
  unit: string;
  choices: number[];
  hintText: string;
}

const MARKET_ITEMS = [
  { name: '사과 한 봉지', unitPrice: 3000 },
  { name: '배 한 개', unitPrice: 2500 },
  { name: '두부 한 모', unitPrice: 1500 },
  { name: '콩나물 한 봉지', unitPrice: 1000 },
  { name: '시금치 한 단', unitPrice: 2000 },
  { name: '달걀 한 줄', unitPrice: 3500 },
  { name: '고구마 한 봉지', unitPrice: 4000 },
  { name: '가래떡 한 팩', unitPrice: 2500 },
];

function shuffleChoices(correct: number, step: number): number[] {
  const set = new Set<number>([correct]);
  const offsets = [-step * 2, -step, step, step * 2, step * 3];
  while (set.size < 4) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)];
    const candidate = correct + offset;
    if (candidate > 0) set.add(candidate);
  }
  return Array.from(set).sort((a, b) => a - b);
}

function generateRoundQuestions(difficulty: 'easy' | 'normal' | 'hard'): MathQuestion[] {
  const questions: MathQuestion[] = [];
  const totalCount = difficulty === 'easy' ? 5 : difficulty === 'normal' ? 8 : 10;

  for (let i = 0; i < totalCount; i++) {
    const mode = i % 4;
    if (mode === 0) {
      // Market addition (two items)
      const shuffled = [...MARKET_ITEMS].sort(() => Math.random() - 0.5);
      const itemA = shuffled[0];
      const itemB = shuffled[1];
      const total = itemA.unitPrice + itemB.unitPrice;
      questions.push({
        categoryLabel: '장보기 합계',
        prompt: `${itemA.name}(${itemA.unitPrice.toLocaleString()}원)과 ${itemB.name}(${itemB.unitPrice.toLocaleString()}원)을 사면 모두 얼마일까요?`,
        detailText: `${itemA.unitPrice.toLocaleString()}원 + ${itemB.unitPrice.toLocaleString()}원`,
        answer: total,
        unit: '원',
        choices: shuffleChoices(total, 500),
        hintText: `${itemA.unitPrice.toLocaleString()}원에 ${itemB.unitPrice.toLocaleString()}원을 더해보세요.`,
      });
    } else if (mode === 1) {
      // Market change from 5,000 or 10,000 won
      const item = MARKET_ITEMS[Math.floor(Math.random() * MARKET_ITEMS.length)];
      const paid = difficulty === 'hard' ? 10000 : item.unitPrice <= 3500 ? 5000 : 10000;
      const change = paid - item.unitPrice;
      questions.push({
        categoryLabel: '거스름돈 계산',
        prompt: `${item.name}(${item.unitPrice.toLocaleString()}원)을 사고 ${paid.toLocaleString()}원짜리 지폐를 냈어요. 거스름돈은 얼마일까요?`,
        detailText: `${paid.toLocaleString()}원 - ${item.unitPrice.toLocaleString()}원`,
        answer: change,
        unit: '원',
        choices: shuffleChoices(change, 500),
        hintText: `${paid.toLocaleString()}원에서 ${item.unitPrice.toLocaleString()}원을 빼면 얼마가 남을까요?`,
      });
    } else if (mode === 2) {
      // Clean addition scaled by difficulty
      const a =
        difficulty === 'easy'
          ? 5 + Math.floor(Math.random() * 12)
          : difficulty === 'normal'
          ? 12 + Math.floor(Math.random() * 25)
          : 25 + Math.floor(Math.random() * 45);
      const b =
        difficulty === 'easy'
          ? 3 + Math.floor(Math.random() * 10)
          : difficulty === 'normal'
          ? 11 + Math.floor(Math.random() * 24)
          : 18 + Math.floor(Math.random() * 35);
      const ans = a + b;
      questions.push({
        categoryLabel: '생활 암산 더하기',
        prompt: `다음 덧셈의 정답을 눌러주세요.`,
        detailText: `${a} + ${b} = ?`,
        answer: ans,
        unit: '',
        choices: shuffleChoices(ans, difficulty === 'easy' ? 1 : 2),
        hintText: `일의 자리(${a % 10} + ${b % 10})부터 먼저 더하면 쉬워요!`,
      });
    } else {
      // Clean subtraction scaled by difficulty
      const b =
        difficulty === 'easy'
          ? 3 + Math.floor(Math.random() * 8)
          : difficulty === 'normal'
          ? 11 + Math.floor(Math.random() * 18)
          : 18 + Math.floor(Math.random() * 28);
      const ans =
        difficulty === 'easy'
          ? 6 + Math.floor(Math.random() * 10)
          : difficulty === 'normal'
          ? 14 + Math.floor(Math.random() * 22)
          : 22 + Math.floor(Math.random() * 35);
      const a = b + ans;
      questions.push({
        categoryLabel: '생활 암산 빼기',
        prompt: `다음 뺄셈의 정답을 눌러주세요.`,
        detailText: `${a} - ${b} = ?`,
        answer: ans,
        unit: '',
        choices: shuffleChoices(ans, difficulty === 'easy' ? 1 : 2),
        hintText: `${a}에서 먼저 ${Math.floor(b / 10) * 10}을 빼고, 나머지 ${b % 10}을 빼보세요.`,
      });
    }
  }

  return questions;
}

export const MarketMathGame: React.FC<GameProps> = ({
  soundEnabled,
  initialDifficulty = 'easy',
  onToggleSound,
  onComplete,
  onBackHome,
}) => {
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [eliminatedChoices, setEliminatedChoices] = useState<number[]>([]);
  const [solvedCurrent, setSolvedCurrent] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [hadWrongOnCurrent, setHadWrongOnCurrent] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const startNewRound = useCallback(() => {
    setQuestions(generateRoundQuestions(initialDifficulty));
    setCurrentIndex(0);
    setEliminatedChoices([]);
    setSolvedCurrent(false);
    setShowHint(false);
    setFirstTryCount(0);
    setHadWrongOnCurrent(false);
    setFeedback(null);
    setWon(false);
  }, [initialDifficulty]);

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const handleChoiceTap = (choice: number) => {
    if (solvedCurrent || eliminatedChoices.includes(choice)) return;

    if (choice === currentQ.answer) {
      soundFX.match(soundEnabled);
      setSolvedCurrent(true);
      if (!hadWrongOnCurrent) {
        setFirstTryCount((c) => c + 1);
      }
      setFeedback('정답입니다! 참 잘하셨어요.');
    } else {
      soundFX.gentleWrong(soundEnabled);
      setHadWrongOnCurrent(true);
      setEliminatedChoices((prev) => [...prev, choice]);
      setFeedback(
        choice < currentQ.answer
          ? `${choice.toLocaleString()}${currentQ.unit}보다는 조금 더 큰 수예요.`
          : `${choice.toLocaleString()}${currentQ.unit}보다는 조금 더 작은 수예요.`
      );
    }
  };

  const handleNextQuestion = () => {
    soundFX.tap(soundEnabled);
    if (currentIndex + 1 >= questions.length) {
      soundFX.win(soundEnabled);
      setWon(true);
      onComplete();
    } else {
      setCurrentIndex((idx) => idx + 1);
      setEliminatedChoices([]);
      setSolvedCurrent(false);
      setShowHint(false);
      setHadWrongOnCurrent(false);
      setFeedback(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F2]">
      <GameHeader
        title="알뜰 장보기 산수"
        onBackHome={onBackHome}
        onRestart={startNewRound}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
      />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Progress bar */}
        <div className="bg-white px-4 py-3 rounded-2xl border border-[#DDE2DC]">
          <div className="flex items-center justify-between mb-2 text-sm sm:text-base font-bold">
            <span className="text-[#146C43]">{currentQ.categoryLabel}</span>
            <span className="text-[#16201B] tabular-nums">
              {currentIndex + 1} / {questions.length} 문제
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#E8ECE6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#146C43] rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + (solvedCurrent ? 1 : 0)) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <section className="bg-white p-5 sm:p-7 rounded-3xl border border-[#DDE2DC] shadow-sm text-center">
          <p className="text-lg sm:text-xl font-bold text-[#16201B] leading-relaxed text-balance">
            {currentQ.prompt}
          </p>

          {currentQ.detailText && (
            <div className="mt-4 py-3 px-4 rounded-2xl bg-[#F6F6F2] border border-[#E2E7E0] text-2xl sm:text-3xl font-extrabold text-[#146C43] tabular-nums">
              {currentQ.detailText}
            </div>
          )}

          {showHint && (
            <p className="mt-3 text-base font-semibold text-[#92400E] bg-[#FFFBEB] py-2.5 px-4 rounded-xl border border-[#F59E0B]/40">
              {currentQ.hintText}
            </p>
          )}
        </section>

        {/* Feedback */}
        <div className="min-h-[28px] flex items-center justify-center text-center">
          {feedback && (
            <p
              className={`text-base sm:text-lg font-bold ${
                solvedCurrent ? 'text-[#146C43]' : 'text-[#B45309]'
              }`}
            >
              {feedback}
            </p>
          )}
        </div>

        {/* 4 Giant Choice Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {currentQ.choices.map((choice) => {
            const isEliminated = eliminatedChoices.includes(choice);
            const isCorrectShown = solvedCurrent && choice === currentQ.answer;

            return (
              <button
                key={choice}
                type="button"
                onClick={() => handleChoiceTap(choice)}
                disabled={isEliminated || solvedCurrent}
                className={`min-h-[68px] sm:min-h-[76px] px-4 py-3 rounded-2xl border-2 text-xl sm:text-2xl font-extrabold tabular-nums transition-all active:scale-[0.97] ${
                  isCorrectShown
                    ? 'bg-[#146C43] border-[#0F5132] text-white shadow-md'
                    : isEliminated
                    ? 'bg-[#EFECE6] border-[#E2DED6] text-[#9A958C] line-through'
                    : 'bg-white border-[#CFD7CE] text-[#16201B] hover:border-[#146C43] shadow-sm'
                }`}
              >
                {choice.toLocaleString()}
                {currentQ.unit}
              </button>
            );
          })}
        </div>

        {/* Bottom Thumb Action */}
        <div className="pt-1 pb-4">
          {solvedCurrent ? (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full min-h-[58px] px-6 py-3 rounded-2xl bg-[#146C43] text-white font-bold text-lg hover:bg-[#0F5132] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>
                {currentIndex + 1 >= questions.length ? '결과 확인하기' : '다음 문제 풀기'}
              </span>
              <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundFX.hint(soundEnabled);
                setShowHint(true);
              }}
              className="w-full min-h-[54px] px-6 py-3 rounded-2xl bg-[#FFFBEB] border border-[#F59E0B]/50 text-[#92400E] font-bold text-base hover:bg-[#FEF3C7] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Lightbulb className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>계산 도움말 보기</span>
            </button>
          )}
        </div>
      </main>

      {won && (
        <VictoryCard
          title={`장보기 산수 ${questions.length}문제를 다 푸셨어요!`}
          summary={`${questions.length}문제 중 ${firstTryCount}문제를 한 번에 맞히셨습니다. 오늘도 두뇌가 반짝반짝하네요!`}
          onPlayAgain={startNewRound}
          onBackHome={onBackHome}
        />
      )}
    </div>
  );
};
