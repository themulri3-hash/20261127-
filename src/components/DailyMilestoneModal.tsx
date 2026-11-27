import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Award, Home, Check } from 'lucide-react';

interface DailyMilestoneModalProps {
  todayClearCount: number;
  onGoHome: () => void;
  onKeepPlaying: () => void;
}

const CONFETTI_PIECES = [
  { x: -76, y: -54, rotate: -22, color: '#146C43', delay: 0.05 },
  { x: -42, y: -74, rotate: 18, color: '#D97706', delay: 0.1 },
  { x: 46, y: -72, rotate: -15, color: '#DC2626', delay: 0.08 },
  { x: 78, y: -50, rotate: 25, color: '#2563EB', delay: 0.14 },
  { x: -86, y: 12, rotate: -30, color: '#F59E0B', delay: 0.16 },
  { x: 86, y: 16, rotate: 28, color: '#15803D', delay: 0.12 },
];

export const DailyMilestoneModal: React.FC<DailyMilestoneModalProps> = ({
  todayClearCount,
  onGoHome,
  onKeepPlaying,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-milestone-title"
    >
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white rounded-3xl border-2 border-[#146C43]/30 shadow-2xl p-6 sm:p-8 text-center overflow-hidden"
      >
        {/* Celebratory Emblem + Gentle Confetti Animation */}
        <div className="relative w-28 h-28 mx-auto mb-4 flex items-center justify-center">
          {!shouldReduceMotion &&
            CONFETTI_PIECES.map((piece, idx) => (
              <motion.span
                key={idx}
                aria-hidden="true"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: piece.x,
                  y: [0, piece.y, piece.y + 18],
                  scale: [0.4, 1.1, 0.9],
                  rotate: piece.rotate,
                }}
                transition={{
                  duration: 1.8,
                  delay: piece.delay,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  ease: 'easeOut',
                }}
                className="absolute w-3.5 h-3.5 rounded-sm"
                style={{ backgroundColor: piece.color }}
              />
            ))}

          <motion.div
            initial={shouldReduceMotion ? false : { scale: 0.7, rotate: -8 }}
            animate={
              shouldReduceMotion
                ? undefined
                : { scale: [0.7, 1.08, 1], rotate: [-8, 4, 0] }
            }
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-20 h-20 rounded-3xl bg-[#E7F4EC] border-2 border-[#A7D7B8] text-[#146C43] flex items-center justify-center shadow-sm"
          >
            <Award className="w-11 h-11" aria-hidden="true" />
          </motion.div>
        </div>

        <p className="text-sm sm:text-base font-bold text-[#146C43] mb-1.5 tabular-nums">
          오늘 놀이 {todayClearCount}회 달성 축하
        </p>

        <h2
          id="daily-milestone-title"
          className="text-3xl sm:text-4xl font-extrabold text-[#16201B] leading-tight text-balance mb-3"
        >
          오늘도 정말 잘하셨어요!
        </h2>

        <p className="text-base sm:text-lg text-[#435049] leading-relaxed mb-6">
          하루 동안 벌써 놀이를 {todayClearCount}번이나 끝까지 마치셨습니다. 꾸준한 두뇌 체조가 건강에 큰 힘이 됩니다.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onKeepPlaying}
            className="w-full min-h-[56px] px-6 py-3 rounded-2xl bg-[#146C43] text-white font-bold text-lg hover:bg-[#0F5132] active:scale-[0.98] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Check className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>고맙습니다 · 계속하기</span>
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="w-full min-h-[52px] px-6 py-3 rounded-2xl bg-[#F1F4F0] text-[#16201B] font-semibold text-base hover:bg-[#E4E9E2] active:scale-[0.98] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Home className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>놀이터 처음으로 가기</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
