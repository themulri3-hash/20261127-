import React from 'react';

export interface MemorySymbol {
  id: string;
  label: string;
  bgTint: string;
  renderIcon: (className?: string) => React.ReactNode;
}

export const MEMORY_SYMBOLS: MemorySymbol[] = [
  {
    id: 'camellia',
    label: '동백꽃',
    bgTint: 'bg-[#FFF1F2]',
    renderIcon: (className = 'w-11 h-11') => (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <circle cx="32" cy="20" r="11" fill="#DC2626" />
        <circle cx="20" cy="31" r="11" fill="#E11D48" />
        <circle cx="44" cy="31" r="11" fill="#E11D48" />
        <circle cx="25" cy="43" r="11" fill="#DC2626" />
        <circle cx="39" cy="43" r="11" fill="#DC2626" />
        <circle cx="32" cy="32" r="7" fill="#FACC15" />
        <path d="M14 52 C22 48, 26 50, 28 54" stroke="#15803D" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M50 52 C42 48, 38 50, 36 54" stroke="#15803D" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'pine',
    label: '소나무',
    bgTint: 'bg-[#ECFDF5]',
    renderIcon: (className = 'w-11 h-11') => (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <rect x="28" y="42" width="8" height="16" rx="2" fill="#78350F" />
        <ellipse cx="32" cy="20" rx="14" ry="10" fill="#15803D" />
        <ellipse cx="22" cy="33" rx="13" ry="9" fill="#166534" />
        <ellipse cx="42" cy="33" rx="13" ry="9" fill="#166534" />
        <ellipse cx="32" cy="31" rx="15" ry="10" fill="#15803D" />
      </svg>
    ),
  },
  {
    id: 'sun',
    label: '밝은 해',
    bgTint: 'bg-[#FEFCE8]',
    renderIcon: (className = 'w-11 h-11') => (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <circle cx="32" cy="32" r="14" fill="#F59E0B" />
        <g stroke="#D97706" strokeWidth="4" strokeLinecap="round">
          <line x1="32" y1="6" x2="32" y2="13" />
          <line x1="32" y1="51" x2="32" y2="58" />
          <line x1="6" y1="32" x2="13" y2="32" />
          <line x1="51" y1="32" x2="58" y2="32" />
          <line x1="14" y1="14" x2="19" y2="19" />
          <line x1="45" y1="45" x2="50" y2="50" />
          <line x1="50" y1="14" x2="45" y2="19" />
          <line x1="19" y1="45" x2="14" y2="50" />
        </g>
      </svg>
    ),
  },
  {
    id: 'moon',
    label: '초승달',
    bgTint: 'bg-[#EFF6FF]',
    renderIcon: (className = 'w-11 h-11') => (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path
          d="M42 12 C27 14, 18 27, 22 41 C25 51, 35 56, 46 53 C35 51, 30 41, 32 30 C33 22, 37 16, 42 12 Z"
          fill="#2563EB"
        />
        <circle cx="46" cy="22" r="3" fill="#F59E0B" />
        <circle cx="51" cy="33" r="2.5" fill="#F59E0B" />
      </svg>
    ),
  },
  {
    id: 'apple',
    label: '사과',
    bgTint: 'bg-[#FEF2F2]',
    renderIcon: (className = 'w-11 h-11') => (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path d="M32 16 C22 14, 14 23, 15 35 C16 48, 24 55, 32 53 C40 55, 48 48, 49 35 C50 23, 42 14, 32 16 Z" fill="#DC2626" />
        <path d="M32 17 C32 11, 35 8, 38 8" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <ellipse cx="40" cy="13" rx="6" ry="3.5" transform="rotate(-20 40 13)" fill="#16A34A" />
        <ellipse cx="24" cy="27" rx="3" ry="6" transform="rotate(-15 24 27)" fill="#FCA5A5" opacity="0.65" />
      </svg>
    ),
  },
  {
    id: 'pouch',
    label: '복주머니',
    bgTint: 'bg-[#FFF7ED]',
    renderIcon: (className = 'w-11 h-11') => (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path d="M22 18 L26 10 L32 14 L38 10 L42 18 Z" fill="#EA580C" />
        <path d="M18 22 C13 30, 14 48, 24 53 C29 55, 35 55, 40 53 C50 48, 51 30, 46 22 Z" fill="#EA580C" />
        <rect x="20" y="18" width="24" height="5" rx="2.5" fill="#FACC15" />
        <circle cx="32" cy="37" r="7" fill="#FEF08A" />
        <path d="M32 32 L32 42 M27 37 L37 37" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'butterfly',
    label: '호랑나비',
    bgTint: 'bg-[#FAF5FF]',
    renderIcon: (className = 'w-11 h-11') => (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <ellipse cx="21" cy="25" rx="12" ry="10" fill="#7C3AED" />
        <ellipse cx="43" cy="25" rx="12" ry="10" fill="#7C3AED" />
        <ellipse cx="22" cy="41" rx="9" ry="8" fill="#9333EA" />
        <ellipse cx="42" cy="41" rx="9" ry="8" fill="#9333EA" />
        <rect x="30" y="18" width="4" height="28" rx="2" fill="#1E1B4B" />
        <circle cx="20" cy="24" r="3.5" fill="#FDE047" />
        <circle cx="44" cy="24" r="3.5" fill="#FDE047" />
      </svg>
    ),
  },
  {
    id: 'peach',
    label: '천도복숭아',
    bgTint: 'bg-[#FFF1F2]',
    renderIcon: (className = 'w-11 h-11') => (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path d="M32 18 C20 18, 13 28, 16 40 C19 49, 28 54, 32 54 C36 54, 45 49, 48 40 C51 28, 44 18, 32 18 Z" fill="#FB7185" />
        <path d="M32 19 C32 28, 30 37, 32 53" stroke="#E11D48" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="14" rx="8" ry="4" transform="rotate(-18 38 14)" fill="#16A34A" />
      </svg>
    ),
  },
  {
    id: 'persimmon',
    label: '단감',
    bgTint: 'bg-[#FFF7ED]',
    renderIcon: (className = 'w-11 h-11') => (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <ellipse cx="32" cy="36" rx="18" ry="15" fill="#EA580C" />
        <path d="M23 22 L32 25 L41 22 L37 17 L27 17 Z" fill="#15803D" />
        <rect x="30" y="12" width="4" height="6" rx="1.5" fill="#78350F" />
      </svg>
    ),
  },
  {
    id: 'umbrella',
    label: '우산',
    bgTint: 'bg-[#ECFEFF]',
    renderIcon: (className = 'w-11 h-11') => (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path d="M10 32 C10 18, 20 11, 32 11 C44 11, 54 18, 54 32 Z" fill="#0284C7" />
        <path d="M32 32 L32 48 C32 52, 27 54, 24 51" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <line x1="32" y1="8" x2="32" y2="12" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    ),
  },
];
