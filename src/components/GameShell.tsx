import React from 'react';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, CheckCircle2, Home } from 'lucide-react';

interface GameHeaderProps {
  title: string;
  onBackHome: () => void;
  onRestart?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  title,
  onBackHome,
  onRestart,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F6F6F2]/95 backdrop-blur-md border-b border-[#D9DFD7]">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackHome}
          className="min-h-[44px] px-3 flex items-center gap-1.5 rounded-xl bg-white border border-[#CFD7CE] text-[#16201B] font-semibold text-sm hover:bg-[#ECEFE9] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
          aria-label="놀이터 처음으로 돌아가기"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>처음으로</span>
        </button>

        <h1 className="text-base sm:text-lg font-bold text-[#16201B] truncate text-center">
          {title}
        </h1>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            className="min-h-[44px] min-w-[44px] px-2.5 flex items-center justify-center rounded-xl bg-white border border-[#CFD7CE] text-[#16201B] hover:bg-[#ECEFE9] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            aria-label={soundEnabled ? '소리 끄기' : '소리 켜기'}
            title={soundEnabled ? '소리 끄기' : '소리 켜기'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-[#146C43]" aria-hidden="true" />
            ) : (
              <VolumeX className="w-5 h-5 text-[#5D6962]" aria-hidden="true" />
            )}
          </button>

          {onRestart && (
            <button
              type="button"
              onClick={onRestart}
              className="min-h-[44px] px-3 flex items-center gap-1.5 rounded-xl bg-white border border-[#CFD7CE] text-[#16201B] font-semibold text-sm hover:bg-[#ECEFE9] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">다시 하기</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

interface VictoryCardProps {
  title: string;
  summary: string;
  onPlayAgain: () => void;
  onBackHome: () => void;
}

export const VictoryCard: React.FC<VictoryCardProps> = ({
  title,
  summary,
  onPlayAgain,
  onBackHome,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#D9DFD7] shadow-xl p-6 sm:p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#E7F4EC] text-[#146C43] flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
        </div>

        <h2 id="victory-title" className="text-2xl font-bold text-[#16201B] mb-2 text-balance">
          {title}
        </h2>
        <p className="text-base text-[#435049] leading-relaxed mb-6">{summary}</p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full min-h-[54px] px-6 py-3 rounded-2xl bg-[#146C43] text-white font-bold text-lg hover:bg-[#0F5132] active:scale-[0.98] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
            <span>한 번 더 하기</span>
          </button>

          <button
            type="button"
            onClick={onBackHome}
            className="w-full min-h-[52px] px-6 py-3 rounded-2xl bg-[#F1F4F0] text-[#16201B] font-semibold text-base hover:bg-[#E4E9E2] active:scale-[0.98] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            <span>다른 게임 고르기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
