import { GameId } from '../utils/storage';

export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export interface DifficultyOption {
  level: DifficultyLevel;
  title: string;
  badgeText: string;
  description: string;
}

export interface GameMeta {
  id: GameId;
  title: string;
  subtitle: string;
  category: string;
  duration: string;
  difficulty: string;
  imageSrc: string;
  imageAlt: string;
  howToPlay: string;
  difficultyOptions: DifficultyOption[];
}

export interface GameProps {
  soundEnabled: boolean;
  initialDifficulty?: DifficultyLevel;
  onToggleSound: () => void;
  onComplete: (extra?: { numberSize?: number; seconds?: number }) => void;
  onBackHome: () => void;
}
