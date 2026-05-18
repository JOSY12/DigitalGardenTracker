export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  frequency: string;
  health: number;
  streak: number;
  completedToday: boolean;
  totalDays: number;
  completedDays: number;
  createdAt: number;
  paused: boolean;
  subtasks: Subtask[];
  pomodoroBoost: boolean;
  scheduleDays: string[];
  pomoDuration: number;
}

export interface HistoryEntry {
  id: string;
  title: string;
  category: string;
  health: number;
  finalStatus: 'harvested' | 'completed' | 'abandoned';
  archivedAt: number;
  xp: number;
}