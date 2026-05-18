export const XP_WATER   = 10;
export const XP_SUB     = 5;
export const XP_HARVEST = 80;
export const XP_S5      = 20;
export const XP_S10     = 50;

export const XP_LEVELS = [
  { level:1,  min:0,    max:150,       title:{ es:'Aprendiz 🌱',       en:'Apprentice 🌱'      }},
  { level:2,  min:150,  max:350,       title:{ es:'Jardinero 🌿',      en:'Gardener 🌿'        }},
  { level:3,  min:350,  max:650,       title:{ es:'Cultivador 🌾',     en:'Cultivator 🌾'      }},
  { level:4,  min:650,  max:1100,      title:{ es:'Botanista 🌳',      en:'Botanist 🌳'        }},
  { level:5,  min:1100, max:1800,      title:{ es:'Naturalista 🌲',    en:'Naturalist 🌲'      }},
  { level:6,  min:1800, max:2800,      title:{ es:'Maestro Jardín 🏡', en:'Garden Master 🏡'   }},
  { level:7,  min:2800, max:4200,      title:{ es:'Guardián Verde 🌍', en:'Green Guardian 🌍'  }},
  { level:8,  min:4200, max:6500,      title:{ es:'Arcano Vegetal 🧙', en:'Plant Arcane 🧙'    }},
  { level:9,  min:6500, max:9500,      title:{ es:'Gran Maestro 👑',   en:'Grand Master 👑'    }},
  { level:10, min:9500, max:Infinity,  title:{ es:'Leyenda Viva 🌟',   en:'Living Legend 🌟'   }},
];

export const LEVEL_PERKS = [
  { level:1,  es:'Acceso básico al jardín.',                                    en:'Basic garden access.'                               },
  { level:2,  es:'+1 subtarea extra por planta (hasta 5 en total).',            en:'+1 extra subtask per plant (up to 5 total).'        },
  { level:3,  es:'Modo Invernadero: plantas resisten 2 días sin regar.',        en:'Greenhouse Mode: plants survive 2 days without watering.' },
  { level:4,  es:'El riego vale +2% de salud adicional.',                       en:'Watering gives +2% extra health.'                   },
  { level:5,  es:'Pomodoro de 5 min otorga recompensa de 15 min.',             en:'5-min Pomodoro gives 15-min reward.'                },
  { level:6,  es:'Las plantas cosechadas dan +20 XP de bonus.',                en:'Harvested plants give +20 bonus XP.'                },
  { level:7,  es:'Racha de 3 días genera crecimiento automático +3%.',         en:'3-day streak auto-grows plant +3%.'                 },
  { level:8,  es:'Plantas pausadas conservan el 100% de su salud.',            en:'Paused plants retain 100% of their health.'         },
  { level:9,  es:'El ecosistema se recupera un 5% diario de forma pasiva.',    en:'Ecosystem passively recovers 5% daily.'             },
  { level:10, es:'Leyenda: todas las recompensas ×1.5 para siempre.',          en:'Legend: all rewards ×1.5 forever.'                  },
];

export const getLevelInfo = (xp: number) => {
  const lvl = XP_LEVELS.find(l => xp < l.max) || XP_LEVELS[XP_LEVELS.length - 1];
  const pct = lvl.max === Infinity ? 100 : Math.round(((xp - lvl.min) / (lvl.max - lvl.min)) * 100);
  return { ...lvl, pct, next: lvl.max === Infinity ? 0 : lvl.max - xp };
};