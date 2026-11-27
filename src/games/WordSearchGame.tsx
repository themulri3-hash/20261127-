import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Check } from 'lucide-react';
import { GameHeader, VictoryCard } from '../components/GameShell';
import { soundFX } from '../utils/sound';
import { GameProps } from '../types/game';

interface ThemePack {
  id: string;
  label: string;
  words: string[];
}

const THEME_PACKS: ThemePack[] = [
  {
    id: 'nature',
    label: '꽃과 나무',
    words: ['진달래', '개나리', '소나무', '벚꽃', '민들레'],
  },
  {
    id: 'food',
    label: '정겨운 밥상',
    words: ['김치', '보리밥', '미역국', '호박죽', '숭늉'],
  },
  {
    id: 'holiday',
    label: '우리 명절',
    words: ['추석', '설날', '송편', '윷놀이', '한복'],
  },
  {
    id: 'health',
    label: '건강한 하루',
    words: ['산책', '체조', '기지개', '웃음', '낮잠'],
  },
];

const FILLER_SYLLABLES = [
  '가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '하',
  '고', '노', '도', '로', '모', '보', '소', '오', '조', '수', '무',
  '두', '부', '구', '누', '루', '주', '해', '달', '별', '꽃', '봄',
  '산', '강', '물', '하', '늘', '구', '름', '바', '람', '정', '온',
];

const GRID_SIZE = 6;

interface Coord {
  r: number;
  c: number;
}

interface PlacedWord {
  word: string;
  cells: Coord[];
  directionLabel: string;
}

const WORD_COLOR_PALETTE = [
  'bg-[#DCFCE7] border-[#15803D] text-[#14532D]',
  'bg-[#DBEAFE] border-[#2563EB] text-[#1E3A8A]',
  'bg-[#FEF3C7] border-[#D97706] text-[#78350F]',
  'bg-[#FCE7F3] border-[#DB2777] text-[#831843]',
  'bg-[#EDE9FE] border-[#7C3AED] text-[#4C1D95]',
];

function getDirectionLabel(dr: number, dc: number): string {
  if (dr === 0) return '가로(→) 방향';
  if (dc === 0) return '세로(↓) 방향';
  return '대각선(↘) 방향';
}

function buildPuzzle(
  words: string[],
  difficulty: 'easy' | 'normal' | 'hard'
): { grid: string[][]; placements: PlacedWord[] } {
  const targetCount = difficulty === 'easy' ? 3 : difficulty === 'normal' ? 4 : 5;
  const activeWords = words.slice(0, targetCount);
  const dirs =
    difficulty === 'easy'
      ? [
          { dr: 0, dc: 1 }, // Horizontal
          { dr: 1, dc: 0 }, // Vertical
        ]
      : [
          { dr: 0, dc: 1 }, // Horizontal
          { dr: 1, dc: 0 }, // Vertical
          { dr: 1, dc: 1 }, // Diagonal down-right
        ];

  // Try up to 40 seeds until all words fit cleanly
  for (let attempt = 0; attempt < 40; attempt++) {
    const grid: (string | null)[][] = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(null)
    );
    const placements: PlacedWord[] = [];
    const sortedWords = [...activeWords].sort((a, b) => b.length - a.length);
    let allPlaced = true;

    for (const word of sortedWords) {
      let placed = false;
      const candidates: { r: number; c: number; dr: number; dc: number }[] = [];

      for (const { dr, dc } of dirs) {
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            const endR = r + dr * (word.length - 1);
            const endC = c + dc * (word.length - 1);
            if (endR < 0 || endR >= GRID_SIZE || endC < 0 || endC >= GRID_SIZE) continue;

            let fits = true;
            for (let i = 0; i < word.length; i++) {
              const cell = grid[r + dr * i][c + dc * i];
              if (cell !== null && cell !== word[i]) {
                fits = false;
                break;
              }
            }
            if (fits) candidates.push({ r, c, dr, dc });
          }
        }
      }

      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        const cells: Coord[] = [];
        for (let i = 0; i < word.length; i++) {
          const rr = pick.r + pick.dr * i;
          const cc = pick.c + pick.dc * i;
          grid[rr][cc] = word[i];
          cells.push({ r: rr, c: cc });
        }
        placements.push({
          word,
          cells,
          directionLabel: getDirectionLabel(pick.dr, pick.dc),
        });
        placed = true;
      }

      if (!placed) {
        allPlaced = false;
        break;
      }
    }

    if (allPlaced) {
      const filledGrid: string[][] = grid.map((row) =>
        row.map(
          (cell) =>
            cell ?? FILLER_SYLLABLES[Math.floor(Math.random() * FILLER_SYLLABLES.length)]
        )
      );
      return { grid: filledGrid, placements };
    }
  }

  // Guaranteed deterministic fallback layout
  const fallbackGrid = Array.from({ length: GRID_SIZE }, () =>
    Array.from(
      { length: GRID_SIZE },
      () => FILLER_SYLLABLES[Math.floor(Math.random() * FILLER_SYLLABLES.length)]
    )
  );
  const placements: PlacedWord[] = [];
  activeWords.forEach((word, rowIdx) => {
    const cells: Coord[] = [];
    for (let i = 0; i < word.length && i < GRID_SIZE; i++) {
      fallbackGrid[rowIdx][i] = word[i];
      cells.push({ r: rowIdx, c: i });
    }
    placements.push({ word, cells, directionLabel: '가로(→) 방향' });
  });
  return { grid: fallbackGrid, placements };
}

function getLineCells(start: Coord, end: Coord): Coord[] | null {
  const dr = end.r - start.r;
  const dc = end.c - start.c;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [start];

  const isStraight = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
  if (!isStraight) return null;

  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  const path: Coord[] = [];
  for (let i = 0; i <= steps; i++) {
    path.push({ r: start.r + stepR * i, c: start.c + stepC * i });
  }
  return path;
}

export const WordSearchGame: React.FC<GameProps> = ({
  soundEnabled,
  initialDifficulty = 'easy',
  onToggleSound,
  onComplete,
  onBackHome,
}) => {
  const [packIndex, setPackIndex] = useState(0);
  const [grid, setGrid] = useState<string[][]>([]);
  const [placements, setPlacements] = useState<PlacedWord[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [startCell, setStartCell] = useState<Coord | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    '찾고 싶은 단어의 첫 글자와 끝 글자를 순서대로 눌러주세요.'
  );
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [hintTargetWord, setHintTargetWord] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const currentPack = THEME_PACKS[packIndex];

  const startNewPuzzle = useCallback(
    (idx: number) => {
      const pack = THEME_PACKS[idx];
      const { grid: newGrid, placements: newPlacements } = buildPuzzle(
        pack.words,
        initialDifficulty
      );
    setGrid(newGrid);
    setPlacements(newPlacements);
    setFoundWords([]);
    setStartCell(null);
    setHintLevel(0);
    setHintTargetWord(null);
    setWon(false);
    setStatusMessage('찾고 싶은 단어의 첫 글자와 끝 글자를 순서대로 눌러주세요.');
  },
  [initialDifficulty]
  );

  useEffect(() => {
    startNewPuzzle(packIndex);
  }, [packIndex, startNewPuzzle]);

  const handleCellTap = (r: number, c: number) => {
    if (won) return;

    if (!startCell) {
      soundFX.tap(soundEnabled);
      setStartCell({ r, c });
      setStatusMessage(
        `첫 글자 '${grid[r][c]}'을(를) 눌렀어요. 이제 단어의 마지막 글자를 눌러주세요.`
      );
      return;
    }

    // Tapping the same cell deselects
    if (startCell.r === r && startCell.c === c) {
      soundFX.tap(soundEnabled);
      setStartCell(null);
      setStatusMessage('선택을 취소했어요. 첫 글자를 다시 골라주세요.');
      return;
    }

    const line = getLineCells(startCell, { r, c });
    if (!line) {
      soundFX.gentleWrong(soundEnabled);
      setStartCell(null);
      setStatusMessage('가로, 세로, 또는 대각선으로 반듯하게 이어진 글자를 눌러주세요.');
      return;
    }

    const selectedText = line.map((pt) => grid[pt.r][pt.c]).join('');
    const reversedText = [...selectedText].reverse().join('');

    const matched = placements.find(
      (p) =>
        !foundWords.includes(p.word) &&
        (p.word === selectedText || p.word === reversedText)
    );

    if (matched) {
      soundFX.match(soundEnabled);
      const nextFound = [...foundWords, matched.word];
      setFoundWords(nextFound);
      setStartCell(null);
      setHintLevel(0);
      setHintTargetWord(null);
      setStatusMessage(`잘하셨어요! '${matched.word}' 단어를 찾았습니다.`);

      if (nextFound.length === placements.length) {
        soundFX.win(soundEnabled);
        setWon(true);
        onComplete();
      }
    } else {
      soundFX.gentleWrong(soundEnabled);
      setStartCell(null);
      setStatusMessage(
        `'${selectedText}'은(는) 찾는 단어가 아니에요. 아래 목록을 보고 다시 찾아볼까요?`
      );
    }
  };

  const handleHint = () => {
    if (won) return;
    const unfound = placements.find((p) => !foundWords.includes(p.word));
    if (!unfound) return;

    soundFX.hint(soundEnabled);
    const nextLevel = hintTargetWord === unfound.word ? Math.min(hintLevel + 1, 3) : 1;
    setHintTargetWord(unfound.word);
    setHintLevel(nextLevel);

    if (nextLevel === 1) {
      setStatusMessage(
        `힌트 1단계: '${unfound.word}'의 첫 글자 '${unfound.word[0]}' 위치를 노란색으로 표시했어요.`
      );
    } else if (nextLevel === 2) {
      setStatusMessage(
        `힌트 2단계: '${unfound.word}'은(는) ${unfound.directionLabel}으로 놓여 있어요.`
      );
    } else {
      setStatusMessage(
        `힌트 3단계: '${unfound.word}' 전체 자리를 노란색으로 보여드렸어요. 첫 글자와 끝 글자를 눌러보세요!`
      );
    }
  };

  const getCellFoundColorIndex = (r: number, c: number): number => {
    for (let i = 0; i < foundWords.length; i++) {
      const word = foundWords[i];
      const placement = placements.find((p) => p.word === word);
      if (placement?.cells.some((cell) => cell.r === r && cell.c === c)) {
        return i % WORD_COLOR_PALETTE.length;
      }
    }
    return -1;
  };

  const isCellHinted = (r: number, c: number): boolean => {
    if (!hintTargetWord || hintLevel === 0) return false;
    const target = placements.find((p) => p.word === hintTargetWord);
    if (!target) return false;
    if (hintLevel >= 3) {
      return target.cells.some((cell) => cell.r === r && cell.c === c);
    }
    return target.cells[0].r === r && target.cells[0].c === c;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F2]">
      <GameHeader
        title="한국어 낱말 찾기"
        onBackHome={onBackHome}
        onRestart={() => startNewPuzzle(packIndex)}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Theme Selector */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-[#E8ECE6] rounded-2xl"
          role="group"
          aria-label="주제 선택"
        >
          {THEME_PACKS.map((pack, idx) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => {
                soundFX.tap(soundEnabled);
                setPackIndex(idx);
              }}
              className={`min-h-[44px] px-2 py-2 rounded-xl text-sm sm:text-base font-bold transition-colors whitespace-nowrap ${
                packIndex === idx
                  ? 'bg-white text-[#146C43] shadow-sm'
                  : 'text-[#435049] hover:text-[#16201B]'
              }`}
            >
              {pack.label}
            </button>
          ))}
        </div>

        {/* Guided Instruction Bar */}
        <div className="px-4 py-3 bg-white rounded-2xl border border-[#DDE2DC] text-center">
          <p className="text-base font-semibold text-[#16201B] leading-snug">
            {statusMessage}
          </p>
        </div>

        {/* 6x6 Large Hangul Grid */}
        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-[#DDE2DC] shadow-sm">
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
            {grid.map((row, r) =>
              row.map((letter, c) => {
                const isStart = startCell?.r === r && startCell?.c === c;
                const foundIdx = getCellFoundColorIndex(r, c);
                const hinted = isCellHinted(r, c);

                let cellStyle =
                  'bg-[#F8F9F7] border-[#D5DDD3] text-[#16201B] hover:border-[#146C43]';
                if (isStart) {
                  cellStyle =
                    'bg-[#146C43] border-[#0F5132] text-white scale-[1.04] shadow-md';
                } else if (foundIdx >= 0) {
                  cellStyle = WORD_COLOR_PALETTE[foundIdx];
                } else if (hinted) {
                  cellStyle =
                    'bg-[#FEF3C7] border-[#D97706] text-[#92400E] shadow-sm';
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellTap(r, c)}
                    aria-label={`${r + 1}번째 줄 ${c + 1}번째 글자 ${letter}`}
                    className={`aspect-square min-h-[46px] sm:min-h-[58px] rounded-xl border-2 text-xl sm:text-2xl font-bold flex items-center justify-center transition-transform duration-150 active:scale-[0.94] select-none ${cellStyle}`}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Word List to Find */}
        <div className="bg-white p-4 rounded-2xl border border-[#DDE2DC]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#16201B]">
              찾을 단어 ({currentPack.label})
            </h2>
            <span className="text-sm font-bold text-[#146C43] tabular-nums">
              {foundWords.length} / {placements.length}개 완료
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {placements.map((p) => {
              const isFound = foundWords.includes(p.word);
              return (
                <div
                  key={p.word}
                  className={`px-3.5 py-2 rounded-xl border text-base font-bold flex items-center gap-1.5 ${
                    isFound
                      ? 'bg-[#E7F4EC] border-[#A7D7B8] text-[#146C43] line-through'
                      : 'bg-[#F8F9F7] border-[#D5DDD3] text-[#16201B]'
                  }`}
                >
                  {isFound && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
                  <span>{p.word}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hint Button */}
        <div className="pb-4">
          <button
            type="button"
            onClick={handleHint}
            disabled={won}
            className="w-full min-h-[54px] px-6 py-3 rounded-2xl bg-[#FFFBEB] border border-[#F59E0B]/50 text-[#92400E] font-bold text-base hover:bg-[#FEF3C7] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lightbulb className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>어려우면 눌러보세요 (힌트 보기)</span>
          </button>
        </div>
      </main>

      {won && (
        <VictoryCard
          title="모든 낱말을 다 찾으셨어요!"
          summary={`'${currentPack.label}' 주제의 ${placements.length}개 단어를 모두 찾아내셨습니다.`}
          onPlayAgain={() => startNewPuzzle(packIndex)}
          onBackHome={onBackHome}
        />
      )}
    </div>
  );
};
