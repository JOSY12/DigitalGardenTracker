import { Habit, HistoryEntry } from '../types';
import { XP_HARVEST } from './levels';

const N = Date.now();

export const SEED_HABITS: Habit[] = [
  { id:'1', title:'Correr 5km',      category:'fitness',     frequency:'daily',  health:82,  streak:7, completedToday:false, totalDays:14, completedDays:12, createdAt:N-1209600000, paused:false, subtasks:[], pomodoroBoost:false, scheduleDays:[], pomoDuration:25 },
  { id:'2', title:'Aprender TS',     category:'learning',    frequency:'daily',  health:47,  streak:2, completedToday:true,  totalDays:10, completedDays:5,  createdAt:N-864000000,  paused:false, subtasks:[{id:'s1',text:'Tipos básicos',done:true},{id:'s2',text:'Interfaces',done:false}], pomodoroBoost:false, scheduleDays:[], pomoDuration:25 },
  { id:'3', title:'Meditación',      category:'mindfulness', frequency:'daily',  health:23,  streak:0, completedToday:false, totalDays:8,  completedDays:2,  createdAt:N-691200000,  paused:false, subtasks:[], pomodoroBoost:false, scheduleDays:[], pomoDuration:15 },
  { id:'4', title:'Dibujo Creativo', category:'creativity',  frequency:'weekly', health:100, streak:4, completedToday:false, totalDays:12, completedDays:10, createdAt:N-1036800000, paused:false, subtasks:[], pomodoroBoost:false, scheduleDays:[], pomoDuration:30 },
];

export const SEED_HISTORY: HistoryEntry[] = [
  { id:'h1', title:'Leer 30 Minutos',     category:'learning',    health:90,  finalStatus:'completed', archivedAt:N-2592000000, xp:95       },
  { id:'h2', title:'Beber 2L de Agua',   category:'nutrition',   health:15,  finalStatus:'abandoned',  archivedAt:N-1728000000, xp:0        },
  { id:'h3', title:'Journaling Nocturno', category:'mindfulness', health:78,  finalStatus:'completed', archivedAt:N-864000000,  xp:80       },
  { id:'h4', title:'Estiramientos',      category:'fitness',     health:100, finalStatus:'harvested',  archivedAt:N-432000000,  xp:XP_HARVEST },
];

export const calcEco = (habits: Habit[], history: HistoryEntry[]): number => {
  const scores = [
    ...habits.map(h => h.paused ? h.health * 0.5 : h.health),
    ...history.map(h => h.finalStatus === 'harvested' ? 100 : h.finalStatus === 'completed' ? 75 : 8),
  ];
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
};

export const fmtAgo = (ts: number, lang: string): string => {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (lang === 'en') return d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d}d ago`;
  return d === 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d}d`;
};