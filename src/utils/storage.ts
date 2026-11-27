export type GameId = 'memory' | 'word' | 'number' | 'math';

export interface PlayStats {
  lastPlayDate: string;
  todayGames: GameId[];
  todayClearCount: number;
  celebratedThreeToday: boolean;
  totalClears: number;
  bestNumberTime9: number | null;
  bestNumberTime16: number | null;
}

const PREFS_KEY = 'senior_playground_prefs_v1';
const STATS_KEY = 'senior_playground_stats_v1';

export interface UserPrefs {
  largeText: boolean;
  soundEnabled: boolean;
  preferredDifficulty: 'easy' | 'normal' | 'hard';
}

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function loadPrefs(): UserPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { largeText: true, soundEnabled: true, preferredDifficulty: 'easy' };
    const parsed = JSON.parse(raw);
    const diff =
      parsed.preferredDifficulty === 'easy' ||
      parsed.preferredDifficulty === 'normal' ||
      parsed.preferredDifficulty === 'hard'
        ? parsed.preferredDifficulty
        : 'easy';
    return {
      largeText: typeof parsed.largeText === 'boolean' ? parsed.largeText : true,
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      preferredDifficulty: diff,
    };
  } catch {
    return { largeText: true, soundEnabled: true, preferredDifficulty: 'easy' };
  }
}

export function savePrefs(prefs: UserPrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadStats(): PlayStats {
  const today = getTodayKey();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return {
        lastPlayDate: today,
        todayGames: [],
        todayClearCount: 0,
        celebratedThreeToday: false,
        totalClears: 0,
        bestNumberTime9: null,
        bestNumberTime16: null,
      };
    }
    const parsed = JSON.parse(raw) as Partial<PlayStats>;
    const isSameDay = parsed.lastPlayDate === today;
    return {
      lastPlayDate: today,
      todayGames: isSameDay && Array.isArray(parsed.todayGames) ? parsed.todayGames : [],
      todayClearCount:
        isSameDay && typeof parsed.todayClearCount === 'number'
          ? parsed.todayClearCount
          : isSameDay && Array.isArray(parsed.todayGames)
          ? parsed.todayGames.length
          : 0,
      celebratedThreeToday:
        isSameDay && typeof parsed.celebratedThreeToday === 'boolean'
          ? parsed.celebratedThreeToday
          : false,
      totalClears: typeof parsed.totalClears === 'number' ? parsed.totalClears : 0,
      bestNumberTime9: typeof parsed.bestNumberTime9 === 'number' ? parsed.bestNumberTime9 : null,
      bestNumberTime16: typeof parsed.bestNumberTime16 === 'number' ? parsed.bestNumberTime16 : null,
    };
  } catch {
    return {
      lastPlayDate: today,
      todayGames: [],
      todayClearCount: 0,
      celebratedThreeToday: false,
      totalClears: 0,
      bestNumberTime9: null,
      bestNumberTime16: null,
    };
  }
}

export function recordGameComplete(
  gameId: GameId,
  extra?: { numberSize?: number; seconds?: number }
): { stats: PlayStats; reachedThreeToday: boolean } {
  const current = loadStats();
  const todayGames = current.todayGames.includes(gameId)
    ? current.todayGames
    : [...current.todayGames, gameId];
  const todayClearCount = current.todayClearCount + 1;
  const reachedThreeToday = todayClearCount >= 3 && !current.celebratedThreeToday;

  let bestNumberTime9 = current.bestNumberTime9;
  let bestNumberTime16 = current.bestNumberTime16;

  if (gameId === 'number' && extra?.seconds !== undefined) {
    if (extra.numberSize === 9) {
      bestNumberTime9 =
        bestNumberTime9 === null ? extra.seconds : Math.min(bestNumberTime9, extra.seconds);
    } else if (extra.numberSize === 16) {
      bestNumberTime16 =
        bestNumberTime16 === null ? extra.seconds : Math.min(bestNumberTime16, extra.seconds);
    }
  }

  const next: PlayStats = {
    lastPlayDate: getTodayKey(),
    todayGames,
    todayClearCount,
    celebratedThreeToday: current.celebratedThreeToday || reachedThreeToday,
    totalClears: current.totalClears + 1,
    bestNumberTime9,
    bestNumberTime16,
  };

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
  return { stats: next, reachedThreeToday };
}

const VISIT_KEY = 'senior_playground_last_visit_v1';

export function getDailyRecommendedGameId(): GameId {
  const now = new Date();
  const seed = now.getFullYear() * 372 + (now.getMonth() + 1) * 31 + now.getDate();
  const order: GameId[] = ['memory', 'word', 'number', 'math'];
  return order[seed % order.length];
}

export function checkIsFirstVisitToday(): boolean {
  try {
    return localStorage.getItem(VISIT_KEY) !== getTodayKey();
  } catch {
    return true;
  }
}

export function markVisitedToday(): void {
  try {
    localStorage.setItem(VISIT_KEY, getTodayKey());
  } catch {
    // Ignore storage quota errors
  }
}
