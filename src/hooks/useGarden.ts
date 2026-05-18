import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { SEED_HABITS, SEED_HISTORY } from '../constants/data';
import { XP_HARVEST, XP_S10, XP_S5, XP_SUB, XP_WATER } from '../constants/levels';
import { DARK, LIGHT } from '../constants/theme';
import { Lang, TR } from '../constants/translations';
import { Habit, HistoryEntry, Subtask } from '../types';

const GardenContext = createContext<ReturnType<typeof useGardenState> | null>(null);

function useGardenState() {
  const systemScheme = useColorScheme();
  const [darkOverride, setDarkOverride] = useState<boolean | null>(null);
  const [lang, setLangState] = useState<Lang>('es');
  const [habits, setHabits]   = useState<Habit[]>(SEED_HABITS);
  const [history, setHistory] = useState<HistoryEntry[]>(SEED_HISTORY);
  const [totalXP, setTotalXP] = useState<number>(
    () => SEED_HISTORY.reduce((s, h) => s + (h.xp || 0), 0)
  );
  const [tutorial, setTutorial] = useState(false);
  const [xpToast, setXPToast]   = useState<number | null>(null);

  const dark = darkOverride !== null ? darkOverride : systemScheme === 'dark';
  const T = dark ? DARK : LIGHT;
  const L = TR[lang];

  // ── Load from storage ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [h, hist, d, l, xp, tut] = await Promise.all([
        AsyncStorage.getItem('habits'),
        AsyncStorage.getItem('history'),
        AsyncStorage.getItem('dark'),
        AsyncStorage.getItem('lang'),
        AsyncStorage.getItem('xp'),
        AsyncStorage.getItem('tutSeen'),
      ]);
      if (h) {
        try {
          const parsed = JSON.parse(h);
          if (Array.isArray(parsed)) setHabits(parsed);
        } catch {
          /* keep seed */
        }
      }
      if (hist) {
        try {
          const parsed = JSON.parse(hist);
          if (Array.isArray(parsed)) setHistory(parsed);
        } catch {
          /* keep seed */
        }
      }
      if (d !== null) setDarkOverride(d === 'true');
      if (l)    setLangState(l as Lang);
      if (xp)   setTotalXP(Number(xp));
      if (!tut) setTutorial(true);
    })();
  }, []);

  // ── Persist ────────────────────────────────────────────────────
  useEffect(() => { AsyncStorage.setItem('habits',  JSON.stringify(habits)); }, [habits]);
  useEffect(() => { AsyncStorage.setItem('history', JSON.stringify(history)); }, [history]);
  useEffect(() => { AsyncStorage.setItem('xp', String(totalXP)); }, [totalXP]);
  useEffect(() => { if (darkOverride !== null) AsyncStorage.setItem('dark', String(darkOverride)); }, [darkOverride]);
  useEffect(() => { AsyncStorage.setItem('lang', lang); }, [lang]);

  // ── XP ─────────────────────────────────────────────────────────
  const addXP = useCallback((amt: number) => {
    setTotalXP(x => x + amt);
    setXPToast(amt);
  }, []);

  const closeTutorial = useCallback(() => {
    setTutorial(false);
    AsyncStorage.setItem('tutSeen', '1');
  }, []);

  const openTutorial = useCallback(() => {
    setTutorial(true);
  }, []);

  const toggleDark = useCallback(() => setDarkOverride(d => d === null ? !dark : !d), [dark]);
  const toggleLang = useCallback(() => setLangState(l => l === 'es' ? 'en' : 'es'), []);

  // ── Actions ────────────────────────────────────────────────────
  const onAction = useCallback((id: string, delta: number, actionId: string, xpAmt = 0) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const d = h.pomodoroBoost && actionId === 'water' ? delta * 2 : delta;
      return {
        ...h,
        health: Math.min(100, h.health + d),
        completedToday: actionId === 'water' ? true : h.completedToday,
        streak: actionId === 'water' ? h.streak + 1 : h.streak,
        completedDays: actionId === 'water' ? h.completedDays + 1 : h.completedDays,
        totalDays: actionId === 'water' ? h.totalDays + 1 : h.totalDays,
        pomodoroBoost: actionId === 'pomo' ? true : h.pomodoroBoost,
      };
    }));
    if (xpAmt > 0) addXP(xpAmt);
    if (Platform.OS !== 'web' && actionId === 'water') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [addXP]);

  const onHarvest = useCallback((id: string, xpAmt = XP_HARVEST) => {
    const h = habits.find(x => x.id === id); if (!h) return;
    setHistory(prev => [...prev, { id:`h${Date.now()}`, title:h.title, category:h.category, health:100, finalStatus:'harvested', archivedAt:Date.now(), xp:xpAmt }]);
    setHabits(prev => prev.filter(x => x.id !== id));
    addXP(xpAmt);
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [habits, addXP]);

  const onKill = useCallback((id: string) => {
    const h = habits.find(x => x.id === id); if (!h) return;
    setHistory(prev => [...prev, { id:`h${Date.now()}`, title:h.title, category:h.category, health:Math.round(h.health), finalStatus:'abandoned', archivedAt:Date.now(), xp:0 }]);
    setHabits(prev => prev.filter(x => x.id !== id));
  }, [habits]);

  const onPause = useCallback((id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, paused: !h.paused } : h));
  }, []);

  const onSubUpdate = useCallback((id: string, subs: Subtask[]) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const newDone = subs.filter(s => s.done).length;
      const oldDone = (h.subtasks || []).filter(s => s.done).length;
      const bonus = Math.max(0, newDone - oldDone);
      if (bonus > 0) addXP(XP_SUB * bonus);
      return { ...h, subtasks: subs, health: Math.min(100, h.health + bonus * 5) };
    }));
  }, [addXP]);

  const onSchedSave = useCallback((id: string, days: string[]) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, scheduleDays: days } : h));
  }, []);

  const onPomoComplete = useCallback((id: string, bonus: number, xpAmt: number) => {
    onAction(id, bonus, 'pomo', xpAmt || 15);
  }, [onAction]);

  const onAdd = useCallback((data: {
    title: string; category: string; frequency: string;
    scheduleDays: string[]; subtasks: Subtask[]; pomoDuration: number;
  }) => {
    const xpStreak = (habits.find(h => h.id === data.title)?.streak || 0) >= 10 ? XP_S10 : 0;
    setHabits(prev => [{
      id: String(Date.now()), title: data.title, category: data.category,
      frequency: data.frequency, health: 20, streak: 0, completedToday: false,
      totalDays: 0, completedDays: 0, createdAt: Date.now(), paused: false,
      subtasks: data.subtasks || [], pomodoroBoost: false,
      scheduleDays: data.scheduleDays || [], pomoDuration: data.pomoDuration || 25,
    }, ...prev]);
  }, [habits]);

  const waterXP = (streak: number) =>
    XP_WATER + (streak >= 10 ? XP_S10 : streak >= 5 ? XP_S5 : 0);

  return {
    dark, T, lang, L, habits, history, totalXP, tutorial, xpToast,
    toggleDark, toggleLang, closeTutorial, openTutorial, setXPToast,
    onAction, onHarvest, onKill, onPause, onSubUpdate, onSchedSave, onPomoComplete, onAdd, addXP, waterXP,
  };
}

export function GardenProvider({ children }: { children: ReactNode }) {
  const value = useGardenState();
  return createElement(GardenContext.Provider, { value }, children);
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) {
    throw new Error('useGarden must be used within GardenProvider');
  }
  return ctx;
}