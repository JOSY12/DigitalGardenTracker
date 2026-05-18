// ─── THEME COLORS ─────────────────────────────────────────────────
export const DARK = {
  bg: '#080D16', card: '#141E2E', cardBorder: '#1E2E44',
  text: '#EEF5FF', textMuted: '#6B90B8', textSub: '#9BBDE0',
  tabBar: '#0C1422', tabBorder: '#1A2A3E',
  input: '#0C1828', inputBorder: '#243650',
  headerBg: '#0C1422', divider: '#1A2A3E', pill: '#1A2A3E',
};
export const LIGHT = {
  bg: '#EEF3FA', card: '#FFFFFF', cardBorder: '#C0D4EC',
  text: '#071426', textMuted: '#2B4B6E', textSub: '#334E6C',
  tabBar: '#FFFFFF', tabBorder: '#C0D4EC',
  input: '#EEF5FF', inputBorder: '#8AAED0',
  headerBg: '#FFFFFF', divider: '#C0D4EC', pill: '#DDE9F8',
};
export type Theme = typeof DARK;

// ─── HEALTH COLORS ────────────────────────────────────────────────
export const HC = {
  full: { main: '#22C55E', bg: 'rgba(34,197,94,0.14)',  text: '#15803D', glow: 'rgba(34,197,94,0.35)'  },
  high: { main: '#38BDF8', bg: 'rgba(56,189,248,0.13)', text: '#0369A1', glow: 'rgba(56,189,248,0.3)'  },
  mid:  { main: '#F59E0B', bg: 'rgba(245,158,11,0.13)', text: '#92400E', glow: 'rgba(245,158,11,0.3)'  },
  low:  { main: '#F43F5E', bg: 'rgba(244,63,94,0.13)',  text: '#9F1239', glow: 'rgba(244,63,94,0.3)'   },
  xp:   { main: '#A78BFA', bg: 'rgba(167,139,250,0.14)',text: '#6D28D9', glow: 'rgba(167,139,250,0.3)' },
};
export type HCEntry = { main: string; bg: string; text: string; glow: string };

export const getHC = (h: number): HCEntry => {
  if (h >= 100) return HC.full;
  if (h >= 65)  return HC.high;
  if (h >= 35)  return HC.mid;
  return HC.low;
};

// ─── PLANTS ───────────────────────────────────────────────────────
export const PLANTS: Record<string, string[]> = {
  fitness:     ['🥀','🌿','🌱','🌻'],
  learning:    ['🍂','🪴','🌿','🌳'],
  mindfulness: ['🥀','🌸','🌺','💐'],
  nutrition:   ['🍂','🌱','🥦','🍀'],
  creativity:  ['🍂','🌾','🌿','🎋'],
  social:      ['🥀','🌷','🌸','🌹'],
  custom:      ['💀','🌱','🌿','🌳'],
};
export const CAT_ICON: Record<string, string> = {
  fitness:'🏃', learning:'📚', mindfulness:'🧘',
  nutrition:'🥗', creativity:'🎨', social:'🤝', custom:'✨',
};
export const getPlant = (h: number, cat: string): string => {
  const a = PLANTS[cat] || PLANTS.custom;
  if (h >= 100) return a[3]; if (h >= 65) return a[2];
  if (h >= 35)  return a[1]; return a[0];
};

// ─── POMODORO OPTIONS ─────────────────────────────────────────────
export const POMO_OPTS = [
  { min:5,  bonus:6  }, { min:10, bonus:10 }, { min:15, bonus:14 }, { min:20, bonus:18 },
  { min:25, bonus:24 }, { min:30, bonus:30 }, { min:45, bonus:40 }, { min:60, bonus:50 },
];