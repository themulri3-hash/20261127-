import React from 'react';
import { Play, CheckCircle2 } from 'lucide-react';
import { GameHeader } from './GameShell';
import { DifficultyLevel, GameMeta } from '../types/game';
import { soundFX } from '../utils/sound';

interface DifficultySelectScreenProps {
  game: GameMeta;
  selectedDifficulty: DifficultyLevel;
  onSelectDifficulty: (level: DifficultyLevel) => void;
  onStartGame: () => void;
  onBackHome: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const DifficultySelectScreen: React.FC<DifficultySelectScreenProps> = ({
  game,
  selectedDifficulty,
  onSelectDifficulty,
  onStartGame,
  onBackHome,
  soundEnabled,
  onToggleSound,
}) => {
  const selectedOption =
    game.difficultyOptions.find((opt) => opt.level === selectedDifficulty) ??
    game.difficultyOptions[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F2] text-[#16201B]">
      <GameHeader
        title={game.title}
        onBackHome={onBackHome}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
      />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-between gap-6">
        <div>
          {/* Clear guidance block */}
          <div className="mb-6">
            <p className="text-sm sm:text-base font-bold text-[#146C43] mb-1.5">
              {game.category} · {game.duration}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16201B] leading-snug text-balance mb-2">
              원하시는 난이도를 크게 눌러 확인해 주세요
            </h2>
            <p className="text-base sm:text-lg text-[#435049] leading-relaxed">
              {game.howToPlay}
            </p>
          </div>

          {/* 3 Giant Tactile Difficulty Options */}
          <div
            className="flex flex-col gap-3.5"
            role="radiogroup"
            aria-label={`${game.title} 난이도 선택`}
          >
            {game.difficultyOptions.map((option) => {
              const isSelected = option.level === selectedDifficulty;

              return (
                <button
                  key={option.level}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    soundFX.tap(soundEnabled);
                    onSelectDifficulty(option.level);
                  }}
                  className={`w-full min-h-[92px] p-5 rounded-3xl border-2 text-left transition-all active:scale-[0.98] flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#E7F4EC] border-[#146C43] shadow-md'
                      : 'bg-white border-[#CFD7CE] hover:border-[#146C43]/60 shadow-sm'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2.5 mb-1">
                      <span
                        className={`text-xl sm:text-2xl font-extrabold ${
                          isSelected ? 'text-[#0F5132]' : 'text-[#16201B]'
                        }`}
                      >
                        {option.title}
                      </span>
                      <span className="text-base font-bold text-[#146C43]">
                        {option.badgeText}
                      </span>
                    </div>
                    <p className="text-base text-[#435049] leading-snug">
                      {option.description}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col items-center justify-center min-w-[60px]">
                    {isSelected ? (
                      <>
                        <CheckCircle2
                          className="w-8 h-8 text-[#146C43]"
                          aria-hidden="true"
                        />
                        <span className="text-xs font-extrabold text-[#146C43] mt-0.5 whitespace-nowrap">
                          선택됨
                        </span>
                      </>
                    ) : (
                      <span className="w-7 h-7 rounded-full border-2 border-[#B8C2B7] bg-[#F8F9F7]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thumb-zone Primary Start CTA */}
        <div className="pt-2 pb-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              soundFX.tap(soundEnabled);
              onStartGame();
            }}
            className="w-full min-h-[62px] px-6 py-4 rounded-2xl bg-[#146C43] text-white font-extrabold text-xl hover:bg-[#0F5132] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-md whitespace-nowrap"
          >
            <Play className="w-6 h-6 fill-current shrink-0" aria-hidden="true" />
            <span>{selectedOption.title} 난이도로 시작하기</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.tap(soundEnabled);
              onBackHome();
            }}
            className="w-full min-h-[50px] px-5 py-3 rounded-2xl bg-white border border-[#CFD7CE] text-[#435049] font-bold text-base hover:bg-[#ECEFE9] active:scale-[0.98] transition-all"
          >
            다른 놀이 고르기
          </button>
        </div>
      </main>
    </div>
  );
};
