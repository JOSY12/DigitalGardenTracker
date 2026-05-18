import { useState, useEffect, useCallback, useRef } from "react";

// ══════════════════════════════════════════════════════════════════
// XP / LEVEL SYSTEM
// ══════════════════════════════════════════════════════════════════
const XP_LEVELS = [
  { level:1,  min:0,    max:150,  title:{ es:"Aprendiz 🌱",       en:"Apprentice 🌱"     } },
  { level:2,  min:150,  max:350,  title:{ es:"Jardinero 🌿",      en:"Gardener 🌿"       } },
  { level:3,  min:350,  max:650,  title:{ es:"Cultivador 🌾",     en:"Cultivator 🌾"     } },
  { level:4,  min:650,  max:1100, title:{ es:"Botanista 🌳",      en:"Botanist 🌳"       } },
  { level:5,  min:1100, max:1800, title:{ es:"Naturalista 🌲",    en:"Naturalist 🌲"     } },
  { level:6,  min:1800, max:2800, title:{ es:"Maestro Jardín 🏡", en:"Garden Master 🏡"  } },
  { level:7,  min:2800, max:4200, title:{ es:"Guardián Verde 🌍", en:"Green Guardian 🌍" } },
  { level:8,  min:4200, max:6500, title:{ es:"Arcano Vegetal 🧙", en:"Plant Arcane 🧙"   } },
  { level:9,  min:6500, max:9500, title:{ es:"Gran Maestro 👑",   en:"Grand Master 👑"   } },
  { level:10, min:9500, max:Infinity, title:{ es:"Leyenda Viva 🌟", en:"Living Legend 🌟" } },
];
const getLevelInfo = xp => {
  const lvl = XP_LEVELS.find(l => xp < l.max) || XP_LEVELS[XP_LEVELS.length-1];
  const pct = lvl.max === Infinity ? 100 : Math.round(((xp-lvl.min)/(lvl.max-lvl.min))*100);
  return { ...lvl, pct, next: lvl.max === Infinity ? 0 : lvl.max - xp };
};
const XP_WATER   = 10;
const XP_SUB     = 5;
const XP_HARVEST = 80;
const XP_S5      = 20;
const XP_S10     = 50;

// Real perks unlocked at each level — displayed in the Garden
const LEVEL_PERKS = [
  { level:1,  es:"Acceso básico al jardín.",                              en:"Basic garden access."                               },
  { level:2,  es:"+1 subtarea extra por planta (hasta 5 en total).",     en:"+1 extra subtask per plant (up to 5 total)."        },
  { level:3,  es:"Modo Invernadero activo: tus plantas resisten 2 días sin regar.", en:"Greenhouse Mode: plants survive 2 days without watering." },
  { level:4,  es:"El riego vale +2% de salud adicional.",                en:"Watering gives +2% extra health."                   },
  { level:5,  es:"Pomodoro de 5 min otorga recompensa de 15 min.",       en:"5-min Pomodoro gives 15-min reward."                },
  { level:6,  es:"Las plantas cosechadas dan +20 XP de bonus.",          en:"Harvested plants give +20 bonus XP."                },
  { level:7,  es:"Racha de 3 días genera crecimiento automático +3%.",   en:"3-day streak auto-grows plant +3%."                 },
  { level:8,  es:"Plantas pausadas conservan el 100% de su salud.",      en:"Paused plants retain 100% of their health."         },
  { level:9,  es:"El ecosistema se recupera un 5% diario de forma pasiva.", en:"Ecosystem passively recovers 5% daily."          },
  { level:10, es:"Leyenda: todas las recompensas x1.5 para siempre.",    en:"Legend: all rewards ×1.5 forever."                  },
];

// ══════════════════════════════════════════════════════════════════
// i18n
// ══════════════════════════════════════════════════════════════════
const TR = {
  es: {
    // Header
    appSubtitle:(n,eco)=>`${n} plantas · ${eco}% ecosistema`,
    // Tabs
    tabTareas:"Tareas", tabJardin:"Jardín",
    // Task screen stats
    statsActive:"Activas", statsSeed:"Semillero", statsStreak:"Racha Máx", statsToday:"Hoy",
    // Task screen empty
    emptyTitle:"Jardín vacío", emptyDesc:"Planta tu primer hábito con el botón de abajo.",
    addBtn:"Plantar Nuevo Hábito",
    seedSection:"🪴 Semillero",
    seedBadge:"🪴 Semillero",
    tapManage:"Toca para gestionar",
    healthLabel:"Salud",
    // Add Modal
    modalTitle:"Nueva Planta 🌱",
    labelName:"Nombre del Hábito", namePlaceholder:"Ej: Correr 30 min, Meditar, Leer…", nameError:"El nombre del hábito es requerido.",
    labelCat:"Categoría", labelFreq:"Frecuencia",
    labelDays:"Días específicos", labelOptional:"(opcional)",
    labelSubtasks:"Subtareas iniciales",
    subtaskPlaceholder:"Nueva subtarea…", subtaskHint:"Hasta 5 subtareas. Cada completada da +5% salud y +5 XP.", subtaskMax:"Máximo de 5 subtareas alcanzado.",
    labelPomo:"Duración del Fertilizante (Pomodoro)",
    pomoHint:(min,bonus)=>`${min} min → +${bonus}% salud al completar`,
    previewLabel:"Vista previa",
    submitBtn:"Plantar Semilla 🌿",
    cats:[
      {id:"fitness",   l:"Fitness",     e:"🏃"},{id:"learning",  l:"Aprendizaje", e:"📚"},
      {id:"mindfulness",l:"Mindfulness", e:"🧘"},{id:"nutrition", l:"Nutrición",   e:"🥗"},
      {id:"creativity",l:"Creatividad", e:"🎨"},{id:"social",    l:"Social",      e:"🤝"},
      {id:"custom",    l:"Otro",        e:"✨"},
    ],
    freqs:[
      {id:"daily",    l:"Diaria",        e:"📆"},{id:"weekly",  l:"Semanal",         e:"🗓️"},
      {id:"weekdays", l:"Lun–Vie",       e:"💼"},{id:"weekends",l:"Fin de semana",   e:"🏖️"},
    ],
    days:["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
    // Action panel tabs (7 items — rendered as 4+3 grid)
    actionTabs:[
      {id:"water",   e:"💧", l:"Regar"},
      {id:"prune",   e:"✂️", l:"Podar"},
      {id:"pomo",    e:"⏱️", l:"Fertilizar"},
      {id:"schedule",e:"📅", l:"Horario"},
      {id:"harvest", e:"🌾", l:"Cosechar"},
      {id:"pause",   e:"🪴", l:"Semillero"},
      {id:"kill",    e:"☠️", l:"Secar"},
    ],
    healthLabels:["Muriendo","Marchitando","Floreciendo","¡Lista para Cosechar!"],
    // Water panel
    waterDone:"¡Ya regaste hoy!", waterDoneDesc:s=>`Racha: ${s} días. Vuelve mañana.`,
    waterBtn:d=>`💧 Regar (+${d}% salud)`, waterTitle:"Registrar progreso del día",
    waterDesc:boost=>`Regar sana tu planta y mantiene tu racha.${boost?" ⚡ ¡Fertilizante activo — crecerá el doble!":""}`,
    waterXPLabel:xp=>`+${xp} XP`,
    // Pomodoro panel
    pomoRunning:"⏸ Pausar", pomoStart:"▶ Iniciar Pomodoro", pomoReset:"↺ Reiniciar",
    pomoDoneTitle:"¡Pomodoro completado!", pomoDoneDesc:"Tu planta crece el doble hoy.",
    pomoApply:"Aplicar Fertilizante 🌿",
    // Schedule panel
    schedHint:"Los días no seleccionados la planta entra en Modo Invernadero 🏡 — sin morir.",
    schedSave:"Guardar Horario 📅",
    // Harvest panel
    harvestReady:"¡Lista para Cosechar!", harvestReadyDesc:xp=>`Gana ${xp} XP y guarda este logro en tu Invernadero.`,
    harvestBtn:xp=>`🌾 Cosechar (+${xp} XP)`,
    harvestNotReady:"Aún no está lista", harvestNotReadyDesc:n=>`Necesitas llegar al 100%. Faltan ${n}%.`,
    // Pause panel
    pauseTitle:p=>p?"Retomar del Semillero":"Mudar al Semillero",
    pauseDesc:p=>p?"Trae tu planta de vuelta al jardín activo.":"Convierte la planta en semilla. Quedará esperando sin morir.",
    pauseBtn:p=>p?"🌱 Retomar Planta":"🪴 Mudar al Semillero",
    // Kill panel
    killTitle:"Secar la Planta", killDesc:"Eliminará permanentemente la planta. No hay vuelta atrás.",
    killConfirm:"☠️ Sí, secar la planta", killCancel:"Cancelar",
    // Subtask panel
    subHint:"Hasta 5 subtareas. Cada completada da +5% salud y +5 XP.",
    subMax:"Máximo de 5 subtareas alcanzado.",
    // Garden screen
    ecoTitle:"Salud del Ecosistema", ecoVibrant:"🌳 Ecosistema Vibrante", ecoStable:"🌿 Ecosistema Estable", ecoCrisis:"🥀 Ecosistema en Crisis",
    ecoWarning:n=>`${n} planta${n>1?"s":""} abandonada${n>1?"s":""} afecta${n>1?"n":""} tu ecosistema.`,
    metricsHarvested:"Cosechadas", metricsAbandoned:"Abandonadas",
    // XP/Level
    xpTitle:"Nivel de Jardinero",
    xpLevelLabel:"Nivel",
    xpNextLevel:n=>`${n} XP para siguiente nivel`,
    xpMaxLevel:"¡Nivel máximo alcanzado! 🌟",
    xpRewardsTitle:"¿Cómo ganar XP?",
    xpRows:[
      {e:"💧",a:"Regar (check diario)",    v:`+${XP_WATER} XP`},
      {e:"✂️",a:"Completar subtarea",      v:`+${XP_SUB} XP`},
      {e:"⏱️",a:"Completar Pomodoro",     v:"+15–45 XP"},
      {e:"🌾",a:"Cosechar planta",         v:`+${XP_HARVEST} XP`},
      {e:"🔥",a:"Racha de 5 días",         v:`+${XP_S5} XP`},
      {e:"🔥",a:"Racha de 10 días",        v:`+${XP_S10} XP`},
    ],
    xpPerksTitle:"Beneficios de tu nivel actual",
    xpPerksDesc:"Cada nivel desbloquea ventajas reales en el jardín.",
    xpAllPerks:"Todos los beneficios desbloqueados",
    activePlantsTitle:n=>`🌿 Plantas Activas (${n})`,
    historyTitle:"📜 Historial del Jardín", historyEmpty:"El historial está vacío.",
    badgeHarvested:"🌾 Cosechada", badgeCompleted:"✅ Completada", badgeAbandoned:"☠️ Abandonada",
    analyticsTitle:"📊 Estadísticas por Categoría", analyticsEmpty:"Sin datos aún.",
    summaryTitle:"📈 Resumen de Rendimiento",
    summaryRows:(total,rate,streak,lvlTitle)=>[
      {l:"Total de hábitos creados",v:total},
      {l:"Tasa de éxito",v:rate},
      {l:"Racha máxima activa",v:`${streak}d 🔥`},
      {l:"Nivel de jardinero",v:lvlTitle},
    ],
    // Header buttons
    langLabel:"Idioma", langBtn:"EN",
    // Tutorial
    tutSkip:"Saltar tutorial", tutNext:"Siguiente →", tutStart:"¡Empezar! 🌱", tutPrev:"← Anterior",
    steps:[
      {i:"🌱",t:"Bienvenido al Digital Garden",d:"Cada hábito que creas se convierte en una planta viva. Cuídala con constancia y tu jardín florecerá. ¡Abandónala y morirá!"},
      {i:"💧",t:"Regar · Check Diario",d:"Registra tu progreso diario. Sana la planta si estaba marchita. Hazlo cada día para mantener tu racha y ganar XP."},
      {i:"✂️",t:"Podar · Subtareas",d:"Divide hábitos grandes en hasta 5 subtareas. Completar cada una da +5% de crecimiento extra y +5 XP."},
      {i:"⏱️",t:"Fertilizante · Pomodoro",d:"Activa un temporizador de enfoque. Más tiempo configurado = más recompensa. ¡Al terminar, crecimiento doble ese día!"},
      {i:"📅",t:"Horarios · Días Activos",d:"Configura qué días aplica tu hábito. Los demás días la planta entra en Modo Invernadero y no muere."},
      {i:"🌾",t:"Cosechar · Meta Cumplida",d:"Al llegar al 100% puedes cosecharla. Ganas XP, subes de nivel como jardinero y pasa a tu Invernadero de Logros."},
      {i:"🪴",t:"Semillero · Pausar",d:"¿Saturado? Convierte la planta en semilla. Queda en espera sin morir hasta que estés listo para retomar."},
      {i:"☠️",t:"Secar · Eliminar",d:"Para eliminar definitivamente una planta puedes secarla. Pasa al historial como abandonada y afecta tu ecosistema."},
      {i:"⚡",t:"Sistema de XP y Niveles",d:"Cada acción te da XP. Sube de nivel desde Aprendiz hasta Leyenda Viva. Tu nivel refleja tu constancia real y se muestra en el Jardín."},
    ],
  },
  en: {
    appSubtitle:(n,eco)=>`${n} plants · ${eco}% ecosystem`,
    tabTareas:"Tasks", tabJardin:"Garden",
    statsActive:"Active", statsSeed:"Seedbed", statsStreak:"Max Streak", statsToday:"Today",
    emptyTitle:"Empty garden", emptyDesc:"Plant your first habit using the button below.",
    addBtn:"Plant New Habit",
    seedSection:"🪴 Seedbed",
    seedBadge:"🪴 Seedbed",
    tapManage:"Tap to manage",
    healthLabel:"Health",
    modalTitle:"New Plant 🌱",
    labelName:"Habit Name", namePlaceholder:"E.g.: Run 30 min, Meditate, Read…", nameError:"Habit name is required.",
    labelCat:"Category", labelFreq:"Frequency",
    labelDays:"Specific days", labelOptional:"(optional)",
    labelSubtasks:"Initial subtasks",
    subtaskPlaceholder:"New subtask…", subtaskHint:"Up to 5 subtasks. Each gives +5% health and +5 XP.", subtaskMax:"Maximum of 5 subtasks reached.",
    labelPomo:"Fertilizer duration (Pomodoro)",
    pomoHint:(min,bonus)=>`${min} min → +${bonus}% health on complete`,
    previewLabel:"Preview",
    submitBtn:"Plant Seed 🌿",
    cats:[
      {id:"fitness",   l:"Fitness",     e:"🏃"},{id:"learning",  l:"Learning",  e:"📚"},
      {id:"mindfulness",l:"Mindfulness", e:"🧘"},{id:"nutrition", l:"Nutrition", e:"🥗"},
      {id:"creativity",l:"Creativity",  e:"🎨"},{id:"social",    l:"Social",    e:"🤝"},
      {id:"custom",    l:"Other",       e:"✨"},
    ],
    freqs:[
      {id:"daily",    l:"Daily",    e:"📆"},{id:"weekly",  l:"Weekly",   e:"🗓️"},
      {id:"weekdays", l:"Mon–Fri",  e:"💼"},{id:"weekends",l:"Weekends", e:"🏖️"},
    ],
    days:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    actionTabs:[
      {id:"water",   e:"💧", l:"Water"},
      {id:"prune",   e:"✂️", l:"Prune"},
      {id:"pomo",    e:"⏱️", l:"Fertilize"},
      {id:"schedule",e:"📅", l:"Schedule"},
      {id:"harvest", e:"🌾", l:"Harvest"},
      {id:"pause",   e:"🪴", l:"Seedbed"},
      {id:"kill",    e:"☠️", l:"Wither"},
    ],
    healthLabels:["Dying","Wilting","Thriving","Ready to Harvest!"],
    waterDone:"Already watered today!", waterDoneDesc:s=>`Streak: ${s} days. Come back tomorrow.`,
    waterBtn:d=>`💧 Water (+${d}% health)`, waterTitle:"Log today's progress",
    waterDesc:boost=>`Watering heals your plant and keeps your streak.${boost?" ⚡ Fertilizer active — double growth!":""}`,
    waterXPLabel:xp=>`+${xp} XP`,
    pomoRunning:"⏸ Pause", pomoStart:"▶ Start Pomodoro", pomoReset:"↺ Reset",
    pomoDoneTitle:"Pomodoro complete!", pomoDoneDesc:"Your plant grows twice as fast today.",
    pomoApply:"Apply Fertilizer 🌿",
    schedHint:"On unselected days your plant enters Greenhouse Mode 🏡 — won't die.",
    schedSave:"Save Schedule 📅",
    harvestReady:"Ready to Harvest!", harvestReadyDesc:xp=>`Earn ${xp} XP and save this to your Greenhouse.`,
    harvestBtn:xp=>`🌾 Harvest (+${xp} XP)`,
    harvestNotReady:"Not ready yet", harvestNotReadyDesc:n=>`You need to reach 100%. ${n}% remaining.`,
    pauseTitle:p=>p?"Resume from Seedbed":"Move to Seedbed",
    pauseDesc:p=>p?"Bring your plant back to the active garden.":"Turn the plant into a seed. It'll wait safely until you're ready.",
    pauseBtn:p=>p?"🌱 Resume Plant":"🪴 Move to Seedbed",
    killTitle:"Wither the Plant", killDesc:"This permanently removes the plant. There's no going back.",
    killConfirm:"☠️ Yes, wither it", killCancel:"Cancel",
    subHint:"Up to 5 subtasks. Each completed one gives +5% health and +5 XP.",
    subMax:"Maximum of 5 subtasks reached.",
    ecoTitle:"Ecosystem Health", ecoVibrant:"🌳 Vibrant Ecosystem", ecoStable:"🌿 Stable Ecosystem", ecoCrisis:"🥀 Ecosystem in Crisis",
    ecoWarning:n=>`${n} abandoned plant${n>1?"s":""} weigh${n>1?"":"s"} on your ecosystem.`,
    metricsHarvested:"Harvested", metricsAbandoned:"Abandoned",
    xpTitle:"Gardener Level",
    xpLevelLabel:"Level",
    xpNextLevel:n=>`${n} XP to next level`,
    xpMaxLevel:"Max level reached! 🌟",
    xpRewardsTitle:"How to earn XP?",
    xpRows:[
      {e:"💧",a:"Water (daily check)",    v:`+${XP_WATER} XP`},
      {e:"✂️",a:"Complete a subtask",     v:`+${XP_SUB} XP`},
      {e:"⏱️",a:"Complete a Pomodoro",   v:"+15–45 XP"},
      {e:"🌾",a:"Harvest at 100%",        v:`+${XP_HARVEST} XP`},
      {e:"🔥",a:"5-day streak bonus",     v:`+${XP_S5} XP`},
      {e:"🔥",a:"10-day streak bonus",    v:`+${XP_S10} XP`},
    ],
    xpPerksTitle:"Your current level benefits",
    xpPerksDesc:"Each level unlocks real advantages in the garden.",
    xpAllPerks:"All benefits unlocked",
    activePlantsTitle:n=>`🌿 Active Plants (${n})`,
    historyTitle:"📜 Garden History", historyEmpty:"History is empty.",
    badgeHarvested:"🌾 Harvested", badgeCompleted:"✅ Completed", badgeAbandoned:"☠️ Abandoned",
    analyticsTitle:"📊 Stats by Category", analyticsEmpty:"No data yet.",
    summaryTitle:"📈 Performance Summary",
    summaryRows:(total,rate,streak,lvlTitle)=>[
      {l:"Total habits created",v:total},
      {l:"Success rate",v:rate},
      {l:"Max active streak",v:`${streak}d 🔥`},
      {l:"Gardener level",v:lvlTitle},
    ],
    langLabel:"Language", langBtn:"ES",
    tutSkip:"Skip tutorial", tutNext:"Next →", tutStart:"Let's Start! 🌱", tutPrev:"← Back",
    steps:[
      {i:"🌱",t:"Welcome to Digital Garden",d:"Every habit you create becomes a living plant. Care for it consistently and your garden will flourish. Neglect it and it will die!"},
      {i:"💧",t:"Water · Daily Check",d:"Log your daily progress. Watering heals a wilting plant. Do it every day to keep your streak alive and earn XP."},
      {i:"✂️",t:"Prune · Subtasks",d:"Break big habits into up to 5 subtasks. Completing each one gives +5% extra growth and +5 XP."},
      {i:"⏱️",t:"Fertilizer · Pomodoro",d:"Start a focus timer. More time = more reward. On completion, your plant gets double growth that day!"},
      {i:"📅",t:"Schedule · Active Days",d:"Set which days your habit applies. Other days, the plant enters Greenhouse Mode and won't die."},
      {i:"🌾",t:"Harvest · Goal Met",d:"At 100% you can harvest it. Earn XP, level up your gardener rank, and save it to your Hall of Fame."},
      {i:"🪴",t:"Seedbed · Pause",d:"Feeling overwhelmed? Turn the plant into a seed. It waits safely until you're ready to continue."},
      {i:"☠️",t:"Wither · Delete",d:"To permanently remove a plant, wither it. It moves to history as abandoned and hurts your ecosystem."},
      {i:"⚡",t:"XP & Level System",d:"Every action earns XP. Level up from Apprentice to Living Legend. Your level reflects real consistency and is shown in the Garden."},
    ],
  },
};

// ══════════════════════════════════════════════════════════════════
// THEME
// ══════════════════════════════════════════════════════════════════
const DARK={
  bg:"#080D16",card:"#141E2E",cardBorder:"#1E2E44",
  text:"#EEF5FF",textMuted:"#6B90B8",textSub:"#9BBDE0",
  tabBar:"#0C1422",tabBorder:"#1A2A3E",
  input:"#0C1828",inputBorder:"#243650",
  headerBg:"#0C1422",shadow:"rgba(0,0,0,0.55)",
  pill:"#1A2A3E",divider:"#1A2A3E",
};
const LIGHT={
  bg:"#EEF3FA",card:"#FFFFFF",cardBorder:"#C0D4EC",
  text:"#071426",textMuted:"#2B4B6E",textSub:"#334E6C",
  tabBar:"#FFFFFF",tabBorder:"#C0D4EC",
  input:"#EEF5FF",inputBorder:"#8AAED0",
  headerBg:"#FFFFFF",shadow:"rgba(10,40,90,0.10)",
  pill:"#DDE9F8",divider:"#C0D4EC",
};

const HC={
  full:{main:"#22C55E",bg:"rgba(34,197,94,0.14)", text:"#15803D",glow:"rgba(34,197,94,0.35)"},
  high:{main:"#38BDF8",bg:"rgba(56,189,248,0.13)",text:"#0369A1",glow:"rgba(56,189,248,0.3)"},
  mid: {main:"#F59E0B",bg:"rgba(245,158,11,0.13)",text:"#92400E",glow:"rgba(245,158,11,0.3)"},
  low: {main:"#F43F5E",bg:"rgba(244,63,94,0.13)", text:"#9F1239",glow:"rgba(244,63,94,0.3)"},
  xp:  {main:"#A78BFA",bg:"rgba(167,139,250,0.14)",text:"#6D28D9",glow:"rgba(167,139,250,0.3)"},
};
const getHC=h=>{ if(h>=100)return HC.full; if(h>=65)return HC.high; if(h>=35)return HC.mid; return HC.low; };
const getHL=(h,L)=>{ if(h>=100)return L.healthLabels[3]; if(h>=65)return L.healthLabels[2]; if(h>=35)return L.healthLabels[1]; return L.healthLabels[0]; };

const PLANTS={
  fitness:    ["🥀","🌿","🌱","🌻"],learning:   ["🍂","🪴","🌿","🌳"],
  mindfulness:["🥀","🌸","🌺","💐"],nutrition:  ["🍂","🌱","🥦","🍀"],
  creativity: ["🍂","🌾","🌿","🎋"],social:     ["🥀","🌷","🌸","🌹"],
  custom:     ["💀","🌱","🌿","🌳"],
};
const CAT_ICON={fitness:"🏃",learning:"📚",mindfulness:"🧘",nutrition:"🥗",creativity:"🎨",social:"🤝",custom:"✨"};
const getPlant=(h,cat)=>{ const a=PLANTS[cat]||PLANTS.custom; if(h>=100)return a[3]; if(h>=65)return a[2]; if(h>=35)return a[1]; return a[0]; };

const POMO_OPTS=[
  {min:5,bonus:6},{min:10,bonus:10},{min:15,bonus:14},{min:20,bonus:18},
  {min:25,bonus:24},{min:30,bonus:30},{min:45,bonus:40},{min:60,bonus:50},
];

// ══════════════════════════════════════════════════════════════════
// STORAGE / SEED DATA
// ══════════════════════════════════════════════════════════════════
const AS={_s:{},getItem(k){return Promise.resolve(this._s[k]??null);},setItem(k,v){this._s[k]=v;return Promise.resolve();}};
const N=Date.now();
const SEED_HABITS=[
  {id:"1",title:"Correr 5km",      category:"fitness",    frequency:"daily",  health:82,streak:7, completedToday:false,totalDays:14,completedDays:12,createdAt:N-1209600000,paused:false,subtasks:[],                                                           pomodoroBoost:false,scheduleDays:[],pomoDuration:25},
  {id:"2",title:"Aprender TS",     category:"learning",   frequency:"daily",  health:47,streak:2, completedToday:true, totalDays:10,completedDays:5, createdAt:N-864000000, paused:false,subtasks:[{id:"s1",text:"Tipos básicos",done:true},{id:"s2",text:"Interfaces",done:false}],pomodoroBoost:false,scheduleDays:[],pomoDuration:25},
  {id:"3",title:"Meditación",      category:"mindfulness",frequency:"daily",  health:23,streak:0, completedToday:false,totalDays:8, completedDays:2, createdAt:N-691200000, paused:false,subtasks:[],                                                           pomodoroBoost:false,scheduleDays:[],pomoDuration:15},
  {id:"4",title:"Dibujo Creativo", category:"creativity", frequency:"weekly", health:100,streak:4,completedToday:false,totalDays:12,completedDays:10,createdAt:N-1036800000,paused:false,subtasks:[],                                                           pomodoroBoost:false,scheduleDays:[],pomoDuration:30},
];
const SEED_HISTORY=[
  {id:"h1",title:"Leer 30 Minutos",    category:"learning",   health:90, finalStatus:"completed",archivedAt:N-2592000000,xp:95},
  {id:"h2",title:"Beber 2L de Agua",  category:"nutrition",  health:15, finalStatus:"abandoned", archivedAt:N-1728000000,xp:0},
  {id:"h3",title:"Journaling Nocturno",category:"mindfulness",health:78, finalStatus:"completed",archivedAt:N-864000000, xp:80},
  {id:"h4",title:"Estiramientos",     category:"fitness",    health:100,finalStatus:"harvested", archivedAt:N-432000000, xp:XP_HARVEST},
];

// ══════════════════════════════════════════════════════════════════
// ICONS
// ══════════════════════════════════════════════════════════════════
const ICONS={
  sun:<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
  moon:<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
  leaf:<><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></>,
  tree:<><path d="M17 22V12L12 2 7 12v10"/><path d="M7 22h10"/></>,
  plus:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  x:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  check:<polyline points="20 6 9 17 4 12"/>,
  help:<><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  chevron:<polyline points="9 18 15 12 9 6"/>,
  globe:<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  zap:<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  star:<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
};
const Icon=({name,size=20,color="currentColor",style})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    {ICONS[name]||null}
  </svg>
);

// ══════════════════════════════════════════════════════════════════
// SHARED UI
// ══════════════════════════════════════════════════════════════════
const Bar=({value,color,height=7,glow})=>(
  <div style={{background:"rgba(148,163,184,0.12)",borderRadius:99,height,overflow:"hidden",width:"100%"}}>
    <div style={{height:"100%",width:`${Math.max(2,Math.min(100,value))}%`,
      background:value>=100?"linear-gradient(90deg,#15803D,#22C55E,#4ADE80)":`linear-gradient(90deg,${color}88,${color})`,
      borderRadius:99,transition:"width 0.7s cubic-bezier(0.34,1.4,0.64,1)",
      boxShadow:glow?`0 0 8px ${glow}`:"none",
    }}/>
  </div>
);
const Lbl=({T,children,mt=0})=>(
  <div style={{color:T.textMuted,fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8,marginTop:mt}}>{children}</div>
);
const SH=({T,children,mt=0})=>(
  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:mt,marginBottom:10}}>
    <span style={{color:T.textMuted,fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</span>
    <div style={{flex:1,height:1,background:T.divider}}/>
  </div>
);

const calcEco=(habits,history)=>{
  const s=[...habits.map(h=>h.paused?h.health*0.5:h.health),...history.map(h=>h.finalStatus==="harvested"?100:h.finalStatus==="completed"?75:8)];
  return s.length?Math.round(s.reduce((a,b)=>a+b,0)/s.length):50;
};
const fmtAgo=(ts,lang)=>{
  const d=Math.floor((Date.now()-ts)/86400000);
  if(lang==="en") return d===0?"today":d===1?"yesterday":`${d}d ago`;
  return d===0?"hoy":d===1?"ayer":`hace ${d}d`;
};

// ══════════════════════════════════════════════════════════════════
// XP TOAST
// ══════════════════════════════════════════════════════════════════
const XPToast=({amount,onDone})=>{
  useEffect(()=>{const t=setTimeout(onDone,2000);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:"fixed",top:76,left:"50%",transform:"translateX(-50%)",
      background:"linear-gradient(135deg,#7C3AED,#A78BFA)",color:"#fff",
      padding:"8px 20px",borderRadius:99,fontSize:15,fontWeight:900,
      boxShadow:"0 4px 20px rgba(124,58,237,0.5)",zIndex:500,pointerEvents:"none",
      display:"flex",alignItems:"center",gap:7,animation:"xpFloat 2s ease forwards"}}>
      <Icon name="zap" size={16} color="#fff"/> +{amount} XP
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// TUTORIAL
// ══════════════════════════════════════════════════════════════════
const TutorialModal=({T,L,onClose})=>{
  const [step,setStep]=useState(0);
  const s=L.steps[step]; const isLast=step===L.steps.length-1;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:24,padding:"24px 22px 22px",width:"100%",maxWidth:370,border:`1.5px solid ${T.cardBorder}`,boxShadow:"0 24px 80px rgba(0,0,0,0.5)",animation:"popIn 0.32s cubic-bezier(0.34,1.4,0.64,1)"}}>
        <div style={{display:"flex",gap:4,justifyContent:"center",marginBottom:20}}>
          {L.steps.map((_,i)=><div key={i} onClick={()=>setStep(i)} style={{width:i===step?22:6,height:5,borderRadius:99,background:i===step?HC.high.main:T.divider,transition:"all 0.3s",cursor:"pointer"}}/>)}
        </div>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:52,marginBottom:12}}>{s.i}</div>
          <div style={{color:T.text,fontSize:18,fontWeight:800,marginBottom:10,lineHeight:1.3}}>{s.t}</div>
          <div style={{color:T.textSub,fontSize:13,lineHeight:1.65}}>{s.d}</div>
        </div>
        <div style={{display:"flex",gap:9}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"11px",borderRadius:12,border:`1.5px solid ${T.cardBorder}`,background:"transparent",color:T.textMuted,fontWeight:700,cursor:"pointer",fontSize:13}}>{L.tutPrev}</button>}
          <button onClick={()=>isLast?onClose():setStep(s=>s+1)} style={{flex:2,padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#38BDF8,#0EA5E9)",color:"#fff",fontWeight:800,cursor:"pointer",fontSize:14,boxShadow:"0 4px 16px rgba(56,189,248,0.4)"}}>
            {isLast?L.tutStart:L.tutNext}
          </button>
        </div>
        <button onClick={onClose} style={{display:"block",margin:"12px auto 0",background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600}}>{L.tutSkip}</button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// ADD MODAL
// ══════════════════════════════════════════════════════════════════
const AddModal=({T,L,onClose,onAdd})=>{
  const [title,setTitle]=useState(""); const [cat,setCat]=useState("custom");
  const [freq,setFreq]=useState("daily"); const [days,setDays]=useState([]);
  const [subs,setSubs]=useState([]); const [newSub,setNewSub]=useState("");
  const [dur,setDur]=useState(25); const [err,setErr]=useState("");
  const toggleDay=d=>setDays(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d]);
  const addSub=()=>{if(!newSub.trim()||subs.length>=5)return;setSubs(p=>[...p,{id:`s${Date.now()}`,text:newSub.trim(),done:false}]);setNewSub("");};
  const submit=()=>{if(!title.trim()){setErr(L.nameError);return;}onAdd({title:title.trim(),category:cat,frequency:freq,scheduleDays:days,subtasks:subs,pomoDuration:dur});onClose();};
  const pomoBonus=POMO_OPTS.find(o=>o.min===dur)||POMO_OPTS[4];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(7px)",zIndex:150,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:"24px 24px 0 0",padding:"20px 20px 36px",width:"100%",maxWidth:430,borderTop:`1px solid ${T.cardBorder}`,boxShadow:`0 -20px 60px ${T.shadow}`,animation:"slideUp 0.32s cubic-bezier(0.34,1.2,0.64,1)",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,borderRadius:99,background:T.divider,margin:"0 auto 18px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{color:T.text,fontSize:18,fontWeight:800}}>{L.modalTitle}</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon name="x" size={20} color={T.textMuted}/></button>
        </div>
        <Lbl T={T}>{L.labelName}</Lbl>
        <input value={title} onChange={e=>{setTitle(e.target.value);setErr("");}} placeholder={L.namePlaceholder} autoFocus
          style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${err?"#F43F5E":T.inputBorder}`,background:T.input,color:T.text,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"'Outfit',sans-serif"}}/>
        {err&&<p style={{color:"#F43F5E",fontSize:12,marginTop:5,marginBottom:0}}>{err}</p>}
        <Lbl T={T} mt={18}>{L.labelCat}</Lbl>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {L.cats.map(c=><button key={c.id} onClick={()=>setCat(c.id)} style={{padding:"6px 13px",borderRadius:99,border:`1.5px solid ${cat===c.id?HC.high.main:T.cardBorder}`,background:cat===c.id?HC.high.bg:"transparent",color:cat===c.id?HC.high.text:T.textMuted,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>{c.e} {c.l}</button>)}
        </div>
        <Lbl T={T} mt={18}>{L.labelFreq}</Lbl>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {L.freqs.map(f=><button key={f.id} onClick={()=>setFreq(f.id)} style={{padding:"9px 10px",borderRadius:11,border:`1.5px solid ${freq===f.id?HC.mid.main:T.cardBorder}`,background:freq===f.id?HC.mid.bg:"transparent",color:freq===f.id?HC.mid.text:T.textSub,fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"left"}}>{f.e} {f.l}</button>)}
        </div>
        <Lbl T={T} mt={18}>{L.labelDays} <span style={{fontWeight:500,textTransform:"none"}}>{L.labelOptional}</span></Lbl>
        <div style={{display:"flex",gap:5}}>
          {L.days.map(d=><button key={d} onClick={()=>toggleDay(d)} style={{flex:1,padding:"7px 2px",borderRadius:9,fontSize:10,fontWeight:800,border:`1.5px solid ${days.includes(d)?HC.full.main:T.cardBorder}`,background:days.includes(d)?HC.full.bg:"transparent",color:days.includes(d)?HC.full.text:T.textMuted,cursor:"pointer"}}>{d.slice(0,2)}</button>)}
        </div>
        <Lbl T={T} mt={20}>{L.labelSubtasks}</Lbl>
        <p style={{color:T.textMuted,fontSize:12,marginBottom:10,lineHeight:1.5}}>{L.subtaskHint}</p>
        {subs.map(s=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
            <div style={{width:7,height:7,borderRadius:99,background:T.textMuted,flexShrink:0}}/>
            <span style={{flex:1,color:T.text,fontSize:13}}>{s.text}</span>
            <button onClick={()=>setSubs(p=>p.filter(x=>x.id!==s.id))} style={{background:"none",border:"none",cursor:"pointer"}}><Icon name="x" size={13} color={T.textMuted}/></button>
          </div>
        ))}
        {subs.length<5
          ?<div style={{display:"flex",gap:8}}><input value={newSub} onChange={e=>setNewSub(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSub()} placeholder={L.subtaskPlaceholder} style={{flex:1,padding:"9px 12px",borderRadius:10,border:`1.5px solid ${T.inputBorder}`,background:T.input,color:T.text,fontSize:13,outline:"none",fontFamily:"'Outfit',sans-serif"}}/><button onClick={addSub} style={{padding:"9px 16px",borderRadius:10,border:"none",background:HC.mid.bg,color:HC.mid.text,fontWeight:700,cursor:"pointer",fontSize:18}}>+</button></div>
          :<p style={{color:T.textMuted,fontSize:11}}>{L.subtaskMax}</p>}
        <Lbl T={T} mt={20}>{L.labelPomo}</Lbl>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          {POMO_OPTS.map(o=><button key={o.min} onClick={()=>setDur(o.min)} style={{padding:"6px 12px",borderRadius:99,border:`1.5px solid ${dur===o.min?HC.mid.main:T.cardBorder}`,background:dur===o.min?HC.mid.bg:"transparent",color:dur===o.min?HC.mid.text:T.textMuted,fontSize:12,fontWeight:700,cursor:"pointer"}}>{o.min}min</button>)}
        </div>
        <div style={{background:HC.mid.bg,border:`1px solid ${HC.mid.main}44`,borderRadius:10,padding:"8px 12px",fontSize:12,color:HC.mid.text,fontWeight:600}}>⏱️ {L.pomoHint(pomoBonus.min,pomoBonus.bonus)}</div>
        <div style={{background:T.input,border:`1px solid ${T.cardBorder}`,borderRadius:14,padding:"12px 16px",marginTop:20,display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:32}}>{PLANTS[cat]?.[2]||"🌿"}</span>
          <div>
            <div style={{color:T.text,fontSize:13,fontWeight:700}}>{title||(lang==="es"?"Tu nueva planta":"Your new plant")}</div>
            <div style={{color:T.textMuted,fontSize:11,marginTop:2}}>{L.cats.find(c=>c.id===cat)?.l} · {L.freqs.find(f=>f.id===freq)?.l} · ⏱️{dur}min</div>
          </div>
        </div>
        <button onClick={submit} style={{marginTop:20,width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#22C55E,#16A34A)",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:"0 4px 20px rgba(34,197,94,0.35)"}}>
          {L.submitBtn}
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// SUBTASK PANEL
// ══════════════════════════════════════════════════════════════════
const SubtaskPanel=({T,L,habit,onUpdate})=>{
  const [newT,setNewT]=useState("");
  const subs=habit.subtasks||[];
  const add=()=>{if(!newT.trim()||subs.length>=5)return;onUpdate(habit.id,[...subs,{id:`s${Date.now()}`,text:newT.trim(),done:false}]);setNewT("");};
  const tog=id=>onUpdate(habit.id,subs.map(s=>s.id===id?{...s,done:!s.done}:s));
  const rem=id=>onUpdate(habit.id,subs.filter(s=>s.id!==id));
  return(
    <div style={{paddingTop:8}}>
      <p style={{color:T.textSub,fontSize:12,marginBottom:12,lineHeight:1.5}}>{L.subHint}</p>
      {subs.map(s=>(
        <div key={s.id} style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}>
          <button onClick={()=>tog(s.id)} style={{width:22,height:22,borderRadius:6,flexShrink:0,border:`1.5px solid ${s.done?HC.full.main:T.cardBorder}`,background:s.done?HC.full.bg:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {s.done&&<Icon name="check" size={12} color={HC.full.main}/>}
          </button>
          <span style={{flex:1,color:s.done?T.textMuted:T.text,fontSize:13,textDecoration:s.done?"line-through":"none"}}>{s.text}</span>
          <button onClick={()=>rem(s.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><Icon name="x" size={14} color={T.textMuted}/></button>
        </div>
      ))}
      {subs.length<5
        ?<div style={{display:"flex",gap:8,marginTop:12}}><input value={newT} onChange={e=>setNewT(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder={L.subtaskPlaceholder} style={{flex:1,padding:"9px 12px",borderRadius:10,border:`1.5px solid ${T.inputBorder}`,background:T.input,color:T.text,fontSize:13,outline:"none",fontFamily:"'Outfit',sans-serif"}}/><button onClick={add} style={{padding:"9px 14px",borderRadius:10,border:"none",background:HC.mid.bg,color:HC.mid.text,fontWeight:700,cursor:"pointer"}}><Icon name="plus" size={14} color={HC.mid.main}/></button></div>
        :<p style={{color:T.textMuted,fontSize:11,marginTop:8}}>{L.subMax}</p>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// POMODORO PANEL
// ══════════════════════════════════════════════════════════════════
const PomodoroPanel=({T,L,habitId,pomoDuration,onComplete,onClose})=>{
  const dur=pomoDuration||25;
  const opt=POMO_OPTS.find(o=>o.min===dur)||POMO_OPTS[4];
  const [secs,setSecs]=useState(dur*60);
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(false);
  const ref=useRef();
  const xpEarned=Math.round(15+(opt.bonus/50)*30); // 15–45 XP scaled
  useEffect(()=>{
    if(running&&secs>0){ ref.current=setInterval(()=>setSecs(s=>{if(s<=1){clearInterval(ref.current);setRunning(false);setDone(true);return 0;}return s-1;}),1000); }
    return()=>clearInterval(ref.current);
  },[running]);
  const mm=String(Math.floor(secs/60)).padStart(2,"0");
  const ss=String(secs%60).padStart(2,"0");
  const pct=((dur*60-secs)/(dur*60))*100;
  const C=2*Math.PI*50;
  return(
    <div style={{padding:"16px 0 8px",textAlign:"center"}}>
      {done?(
        <>
          <div style={{fontSize:52,marginBottom:10}}>🌱✨</div>
          <div style={{color:HC.full.text,fontSize:16,fontWeight:800,marginBottom:6}}>{L.pomoDoneTitle}</div>
          <div style={{color:T.textSub,fontSize:13,marginBottom:10}}>{L.pomoDoneDesc}</div>
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:18}}>
            <span style={{background:HC.mid.bg,border:`1px solid ${HC.mid.main}44`,borderRadius:99,padding:"4px 14px",fontSize:13,color:HC.mid.text,fontWeight:700}}>+{opt.bonus}% {L.healthLabels[2]}</span>
            <span style={{background:HC.xp.bg,border:`1px solid ${HC.xp.main}44`,borderRadius:99,padding:"4px 14px",fontSize:13,color:HC.xp.text,fontWeight:700}}>+{xpEarned} XP</span>
          </div>
          <button onClick={()=>{onComplete(habitId,opt.bonus,xpEarned);onClose();}} style={{padding:"12px 28px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#22C55E,#16A34A)",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer"}}>{L.pomoApply}</button>
        </>
      ):(
        <>
          <div style={{background:HC.mid.bg,border:`1px solid ${HC.mid.main}44`,borderRadius:10,padding:"7px 12px",fontSize:12,color:HC.mid.text,fontWeight:600,marginBottom:16,display:"inline-flex",gap:8,alignItems:"center"}}>
            <span>⏱️ {dur} min</span><span>→</span><span>+{opt.bonus}% {L.healthLabel}</span><span>+{xpEarned} XP</span>
          </div>
          <div style={{position:"relative",width:130,height:130,margin:"0 auto 18px"}}>
            <svg viewBox="0 0 120 120" width="130" height="130">
              <circle cx="60" cy="60" r="50" fill="none" stroke={T.divider} strokeWidth="8"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke={HC.mid.main} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C*(1-pct/100)} transform="rotate(-90 60 60)" style={{transition:"stroke-dashoffset 1s linear"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:T.text,fontSize:26,fontWeight:900}}>{mm}:{ss}</span>
              <span style={{color:T.textMuted,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>min</span>
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <button onClick={()=>setRunning(r=>!r)} style={{padding:"10px 28px",borderRadius:12,border:running?`1.5px solid ${HC.low.main}`:"none",background:running?HC.low.bg:"linear-gradient(135deg,#F59E0B,#D97706)",color:running?HC.low.text:"#fff",fontWeight:800,fontSize:14,cursor:"pointer"}}>
              {running?L.pomoRunning:L.pomoStart}
            </button>
            <button onClick={()=>{setRunning(false);setSecs(dur*60);setDone(false);}} style={{padding:"10px 16px",borderRadius:12,border:`1.5px solid ${T.cardBorder}`,background:"transparent",color:T.textMuted,fontWeight:800,fontSize:14,cursor:"pointer"}}>{L.pomoReset}</button>
          </div>
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// SCHEDULE PANEL
// ══════════════════════════════════════════════════════════════════
const SchedulePanel=({T,L,habit,onSave})=>{
  const [days,setDays]=useState(habit.scheduleDays||[]);
  const tog=d=>setDays(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d]);
  return(
    <div style={{paddingTop:8}}>
      <p style={{color:T.textSub,fontSize:13,marginBottom:14,lineHeight:1.55}}>{L.schedHint}</p>
      <div style={{display:"flex",gap:5,marginBottom:20}}>
        {L.days.map(d=><button key={d} onClick={()=>tog(d)} style={{flex:1,padding:"9px 2px",borderRadius:9,fontSize:11,fontWeight:800,border:`1.5px solid ${days.includes(d)?HC.high.main:T.cardBorder}`,background:days.includes(d)?HC.high.bg:"transparent",color:days.includes(d)?HC.high.text:T.textMuted,cursor:"pointer"}}>{d.slice(0,2)}</button>)}
      </div>
      <button onClick={()=>onSave(habit.id,days)} style={{width:"100%",padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#38BDF8,#0EA5E9)",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer"}}>{L.schedSave}</button>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// KILL PANEL
// ══════════════════════════════════════════════════════════════════
const KillPanel=({T,L,habit,onKill,onClose})=>{
  const [confirm,setConfirm]=useState(false);
  return(
    <div style={{paddingTop:8,textAlign:"center"}}>
      <div style={{fontSize:52,marginBottom:12}}>☠️</div>
      <div style={{color:T.text,fontSize:16,fontWeight:800,marginBottom:8}}>{L.killTitle}</div>
      <div style={{color:T.textSub,fontSize:13,lineHeight:1.55,marginBottom:20}}>{L.killDesc}</div>
      {!confirm
        ?<div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:12,border:`1.5px solid ${T.cardBorder}`,background:"transparent",color:T.textMuted,fontWeight:700,cursor:"pointer",fontSize:14}}>{L.killCancel}</button>
          <button onClick={()=>setConfirm(true)} style={{flex:1,padding:"11px",borderRadius:12,border:`1.5px solid ${HC.low.main}55`,background:HC.low.bg,color:HC.low.text,fontWeight:800,cursor:"pointer",fontSize:14}}>{L.killTitle}</button>
        </div>
        :<button onClick={()=>{onKill(habit.id);onClose();}} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#F43F5E,#BE123C)",color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer"}}>
          {L.killConfirm}
        </button>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// ACTION PANEL  ← key fix: 4+3 grid, all 7 items fully visible
// ══════════════════════════════════════════════════════════════════
const ActionPanel=({T,L,habit,onClose,onAction,onHarvest,onPause,onKill,onSubUpdate,onSchedSave,onPomoComplete})=>{
  const [aTab,setATab]=useState("water");
  const hc=getHC(habit.health);
  const harvestXP=XP_HARVEST;
  const row1=L.actionTabs.slice(0,4);
  const row2=L.actionTabs.slice(4);   // 3 items, centred

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(6px)",zIndex:160,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:430,border:`1px solid ${T.cardBorder}`,boxShadow:`0 -24px 80px ${T.shadow}`,animation:"slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1)",maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {/* handle */}
        <div style={{padding:"10px 0 0",display:"flex",justifyContent:"center"}}><div style={{width:36,height:4,borderRadius:99,background:T.divider}}/></div>
        {/* header */}
        <div style={{padding:"10px 18px 10px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${T.divider}`}}>
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:46,height:46,borderRadius:13,background:hc.bg,border:`1.5px solid ${hc.main}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{getPlant(habit.health,habit.category)}</div>
            <div style={{position:"absolute",bottom:-4,right:-5,width:18,height:18,borderRadius:6,background:T.card,border:`1.5px solid ${T.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9}}>{CAT_ICON[habit.category]||"✨"}</div>
          </div>
          <div style={{flex:1}}>
            <div style={{color:T.text,fontSize:15,fontWeight:800}}>{habit.title}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
              <span style={{background:hc.bg,color:hc.text,fontSize:10,fontWeight:800,padding:"2px 7px",borderRadius:99}}>{getHL(habit.health,L)}</span>
              {habit.streak>0&&<span style={{color:T.textMuted,fontSize:11}}>🔥 {habit.streak}d</span>}
            </div>
          </div>
          <div style={{textAlign:"right",minWidth:52}}>
            <div style={{color:hc.text,fontSize:22,fontWeight:900}}>{Math.round(habit.health)}%</div>
            <Bar value={habit.health} color={hc.main} height={4}/>
          </div>
        </div>

        {/* ── ACTION TABS: two rows, all 7 always visible ─────────── */}
        <div style={{background:T.card,borderBottom:`1px solid ${T.divider}`,paddingTop:2}}>
          {/* row 1: 4 items */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
            {row1.map(t=>(<TabBtn key={t.id} t={t} active={aTab===t.id} T={T} onClick={()=>setATab(t.id)}/>))}
          </div>
          {/* row 2: 3 items centred */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",borderTop:`1px solid ${T.divider}`}}>
            {row2.map(t=>(<TabBtn key={t.id} t={t} active={aTab===t.id} T={T} onClick={()=>setATab(t.id)} isKill={t.id==="kill"}/>))}
          </div>
        </div>

        {/* content */}
        <div style={{padding:"16px 20px 28px",overflowY:"auto"}}>
          {aTab==="water"&&(
            <div style={{textAlign:"center",paddingTop:8}}>
              {habit.completedToday
                ?<><div style={{fontSize:52,marginBottom:10}}>✅</div>
                  <div style={{color:HC.full.text,fontSize:16,fontWeight:800,marginBottom:6}}>{L.waterDone}</div>
                  <div style={{color:T.textSub,fontSize:13,lineHeight:1.5}}>{L.waterDoneDesc(habit.streak)}</div></>
                :<><div style={{fontSize:64,marginBottom:12}}>💧</div>
                  <div style={{color:T.text,fontSize:16,fontWeight:800,marginBottom:6}}>{L.waterTitle}</div>
                  <div style={{color:T.textSub,fontSize:13,marginBottom:8,lineHeight:1.5}}>{L.waterDesc(habit.pomodoroBoost)}</div>
                  <span style={{display:"inline-block",background:HC.xp.bg,color:HC.xp.text,fontSize:12,fontWeight:700,padding:"3px 12px",borderRadius:99,marginBottom:18,border:`1px solid ${HC.xp.main}44`}}>
                    ⚡ {L.waterXPLabel(XP_WATER+(habit.streak>=10?XP_S10:habit.streak>=5?XP_S5:0))}
                  </span>
                  <br/>
                  <button onClick={()=>{onAction(habit.id,habit.pomodoroBoost?24:12,"water",XP_WATER+(habit.streak>=10?XP_S10:habit.streak>=5?XP_S5:0));onClose();}} style={{padding:"13px 36px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#38BDF8,#0EA5E9)",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 4px 20px rgba(56,189,248,0.4)"}}>
                    {L.waterBtn(habit.pomodoroBoost?24:12)}
                  </button></>
              }
            </div>
          )}
          {aTab==="prune"&&<SubtaskPanel T={T} L={L} habit={habit} onUpdate={onSubUpdate}/>}
          {aTab==="pomo"&&<PomodoroPanel T={T} L={L} habitId={habit.id} pomoDuration={habit.pomoDuration} onComplete={onPomoComplete} onClose={onClose}/>}
          {aTab==="schedule"&&<SchedulePanel T={T} L={L} habit={habit} onSave={onSchedSave}/>}
          {aTab==="harvest"&&(
            <div style={{textAlign:"center",paddingTop:8}}>
              {habit.health>=100
                ?<><div style={{fontSize:56,marginBottom:10}}>🌾✨</div>
                  <div style={{color:HC.full.text,fontSize:17,fontWeight:800,marginBottom:8}}>{L.harvestReady}</div>
                  <div style={{color:T.textSub,fontSize:13,marginBottom:16,lineHeight:1.5}}>{L.harvestReadyDesc(harvestXP)}</div>
                  <button onClick={()=>{onHarvest(habit.id,harvestXP);onClose();}} style={{padding:"13px 32px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#22C55E,#16A34A)",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 4px 20px rgba(34,197,94,0.4)"}}>{L.harvestBtn(harvestXP)}</button></>
                :<><div style={{fontSize:48,marginBottom:10}}>🌱</div>
                  <div style={{color:T.text,fontSize:15,fontWeight:800,marginBottom:8}}>{L.harvestNotReady}</div>
                  <div style={{color:T.textSub,fontSize:13,lineHeight:1.5,marginBottom:14}}>{L.harvestNotReadyDesc(100-Math.round(habit.health))}</div>
                  <Bar value={habit.health} color={HC.full.main} height={8}/></>
              }
            </div>
          )}
          {aTab==="pause"&&(
            <div style={{textAlign:"center",paddingTop:8}}>
              <div style={{fontSize:52,marginBottom:10}}>🪴</div>
              <div style={{color:T.text,fontSize:16,fontWeight:800,marginBottom:8}}>{L.pauseTitle(habit.paused)}</div>
              <div style={{color:T.textSub,fontSize:13,lineHeight:1.5,marginBottom:20}}>{L.pauseDesc(habit.paused)}</div>
              <button onClick={()=>{onPause(habit.id);onClose();}} style={{padding:"11px 28px",borderRadius:12,border:`1.5px solid ${habit.paused?HC.full.main:HC.mid.main}`,background:habit.paused?HC.full.bg:HC.mid.bg,color:habit.paused?HC.full.text:HC.mid.text,fontWeight:800,fontSize:14,cursor:"pointer"}}>
                {L.pauseBtn(habit.paused)}
              </button>
            </div>
          )}
          {aTab==="kill"&&<KillPanel T={T} L={L} habit={habit} onKill={onKill} onClose={onClose}/>}
        </div>
      </div>
    </div>
  );
};

// helper tab button
const TabBtn=({t,active,T,onClick,isKill})=>{
  const acc=isKill?HC.low.main:HC.high.main;
  const accT=isKill?HC.low.text:T.text;
  return(
    <button onClick={onClick} style={{padding:"9px 4px 8px",border:"none",borderBottom:`2.5px solid ${active?acc:"transparent"}`,background:active?(isKill?"rgba(244,63,94,0.07)":"rgba(56,189,248,0.07)"):"transparent",color:active?accT:T.textMuted,fontSize:10,fontWeight:active?800:500,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all 0.15s"}}>
      <span style={{fontSize:16}}>{t.e}</span><span>{t.l}</span>
    </button>
  );
};

// ══════════════════════════════════════════════════════════════════
// HABIT CARD
// ══════════════════════════════════════════════════════════════════
const HabitCard=({habit,T,L,onOpen})=>{
  const hc=getHC(habit.health);
  const doneSubs=(habit.subtasks||[]).filter(s=>s.done).length;
  const totalSubs=(habit.subtasks||[]).length;
  return(
    <div onClick={()=>onOpen(habit)} style={{background:T.card,borderRadius:18,border:`1.5px solid ${T.cardBorder}`,padding:"15px 15px 11px",marginBottom:11,boxShadow:`0 3px 18px ${T.shadow}`,cursor:"pointer",position:"relative",overflow:"hidden",transition:"transform 0.14s"}}
      onMouseDown={e=>e.currentTarget.style.transform="scale(0.984)"}
      onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
      onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${hc.main}00,${hc.main},${hc.main}00)`}}/>
      {habit.paused&&<div style={{position:"absolute",top:10,right:10,background:HC.mid.bg,border:`1px solid ${HC.mid.main}44`,borderRadius:8,padding:"2px 7px",fontSize:10,fontWeight:800,color:HC.mid.text}}>{L.seedBadge}</div>}
      <div style={{display:"flex",gap:11,alignItems:"flex-start"}}>
        <div style={{position:"relative",flexShrink:0}}>
          <div style={{width:50,height:50,borderRadius:15,background:hc.bg,border:`1.5px solid ${hc.main}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{getPlant(habit.health,habit.category)}</div>
          <div style={{position:"absolute",bottom:-4,right:-6,width:20,height:20,borderRadius:7,background:T.card,border:`1.5px solid ${T.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>{CAT_ICON[habit.category]||"✨"}</div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
            <div style={{color:T.text,fontSize:14,fontWeight:800,lineHeight:1.2,marginRight:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"58%"}}>{habit.title}</div>
            <span style={{background:hc.bg,color:hc.text,fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:99,flexShrink:0}}>{getHL(habit.health,L)}</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",marginBottom:8}}>
            {habit.streak>0&&<span style={{color:T.textSub,fontSize:11,fontWeight:600}}>🔥 {habit.streak}d</span>}
            {habit.completedToday&&<span style={{color:HC.full.text,fontSize:11,fontWeight:700}}>✓ {L.actionTabs[0].l}</span>}
            {habit.pomodoroBoost&&<span style={{color:HC.mid.text,fontSize:11,fontWeight:700}}>⚡ ×2</span>}
            {totalSubs>0&&<span style={{color:T.textMuted,fontSize:11}}>✂️ {doneSubs}/{totalSubs}</span>}
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{color:T.textMuted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{L.healthLabel}</span>
              <span style={{color:hc.text,fontSize:12,fontWeight:900}}>{Math.round(habit.health)}%</span>
            </div>
            <Bar value={habit.health} color={hc.main} height={7} glow={habit.health>=100?"rgba(34,197,94,0.5)":null}/>
          </div>
        </div>
      </div>
      <div style={{marginTop:9,display:"flex",alignItems:"center",justifyContent:"center",gap:4,opacity:0.3}}>
        <span style={{color:T.textMuted,fontSize:10,fontWeight:600}}>{L.tapManage}</span>
        <Icon name="chevron" size={11} color={T.textMuted}/>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// SCREEN: TAREAS
// ══════════════════════════════════════════════════════════════════
const TareasScreen=({habits,T,L,onAction,onHarvest,onPause,onKill,onSubUpdate,onSchedSave,onPomoComplete,onAdd})=>{
  const [showModal,setShowModal]=useState(false);
  const [panel,setPanel]=useState(null);
  const active=habits.filter(h=>!h.paused);
  const seeded=habits.filter(h=>h.paused);
  return(
    <div style={{flex:1,overflowY:"auto",padding:"14px 14px 100px"}}>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[
          {v:active.length,l:L.statsActive,c:HC.high.main},
          {v:seeded.length,l:L.statsSeed,c:HC.mid.main},
          {v:Math.max(0,...habits.map(h=>h.streak)),l:L.statsStreak,c:"#FB923C"},
          {v:habits.filter(h=>h.completedToday).length,l:L.statsToday,c:HC.full.main},
        ].map(s=>(
          <div key={s.l} style={{flex:1,background:T.card,borderRadius:11,padding:"9px 4px",border:`1px solid ${T.cardBorder}`,textAlign:"center"}}>
            <div style={{color:s.c,fontSize:17,fontWeight:900}}>{s.v}</div>
            <div style={{color:T.textMuted,fontSize:9,fontWeight:700,marginTop:2,textTransform:"uppercase",letterSpacing:"0.04em"}}>{s.l}</div>
          </div>
        ))}
      </div>
      {active.length===0&&seeded.length===0
        ?<div style={{textAlign:"center",padding:"44px 20px"}}>
          <div style={{fontSize:52,marginBottom:14}}>🪴</div>
          <div style={{color:T.text,fontSize:17,fontWeight:800,marginBottom:8}}>{L.emptyTitle}</div>
          <div style={{color:T.textSub,fontSize:13}}>{L.emptyDesc}</div>
        </div>
        :<>
          {active.map(h=><HabitCard key={h.id} habit={h} T={T} L={L} onOpen={setPanel}/>)}
          {seeded.length>0&&(
            <>
              <SH T={T} mt={6}>{L.seedSection}</SH>
              {seeded.map(h=><HabitCard key={h.id} habit={h} T={T} L={L} onOpen={setPanel}/>)}
            </>
          )}
        </>
      }
      <button onClick={()=>setShowModal(true)} style={{width:"100%",padding:"13px",borderRadius:14,border:`1.5px dashed ${T.cardBorder}`,background:"transparent",color:T.textMuted,fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4,transition:"all 0.2s"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=HC.full.main;e.currentTarget.style.color=HC.full.text;e.currentTarget.style.background=HC.full.bg;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=T.cardBorder;e.currentTarget.style.color=T.textMuted;e.currentTarget.style.background="transparent";}}>
        <Icon name="plus" size={16} color="currentColor"/>{L.addBtn}
      </button>
      {showModal&&<AddModal T={T} L={L} onClose={()=>setShowModal(false)} onAdd={onAdd}/>}
      {panel&&(
        <ActionPanel T={T} L={L} habit={panel} onClose={()=>setPanel(null)}
          onAction={(id,d,a,xpAmt)=>{
            onAction(id,d,a,xpAmt);
            setPanel(p=>p&&p.id===id?{...p,health:Math.min(100,p.health+d),completedToday:a==="water"?true:p.completedToday,streak:a==="water"?p.streak+1:p.streak}:p);
          }}
          onHarvest={(id,xp)=>{onHarvest(id,xp);setPanel(null);}}
          onPause={id=>{onPause(id);setPanel(p=>p&&p.id===id?{...p,paused:!p.paused}:p);}}
          onKill={id=>{onKill(id);setPanel(null);}}
          onSubUpdate={(id,subs)=>{onSubUpdate(id,subs);setPanel(p=>p&&p.id===id?{...p,subtasks:subs}:p);}}
          onSchedSave={(id,d)=>{onSchedSave(id,d);setPanel(p=>p&&p.id===id?{...p,scheduleDays:d}:p);}}
          onPomoComplete={(id,bonus,xpAmt)=>{onPomoComplete(id,bonus,xpAmt);setPanel(p=>p&&p.id===id?{...p,pomodoroBoost:true,health:Math.min(100,p.health+bonus)}:p);}}
        />
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// SCREEN: JARDÍN
// ══════════════════════════════════════════════════════════════════
const JardinScreen=({habits,history,T,L,totalXP,lang})=>{
  const active=habits.filter(h=>!h.paused);
  const eco=calcEco(habits,history);
  const ecoHC=getHC(eco);
  const harvested=history.filter(h=>h.finalStatus==="harvested");
  const completed=history.filter(h=>h.finalStatus==="completed");
  const abandoned=history.filter(h=>h.finalStatus==="abandoned");
  const lvl=getLevelInfo(totalXP);

  const catStats={};
  [...habits,...history].forEach(h=>{
    if(!catStats[h.category])catStats[h.category]={good:0,bad:0};
    const st=h.finalStatus;
    if(st==="harvested"||st==="completed")catStats[h.category].good++;
    else if(st==="abandoned")catStats[h.category].bad++;
    else{catStats[h.category][h.health>=50?"good":"bad"]++;}
  });

  return(
    <div style={{flex:1,overflowY:"auto",padding:"14px 14px 100px"}}>
      {/* ECOSYSTEM */}
      <div style={{borderRadius:20,padding:"20px",marginBottom:14,background:T.card,border:`1.5px solid ${T.cardBorder}`,boxShadow:`0 4px 20px ${T.shadow}`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(244,63,94,0.05),rgba(245,158,11,0.05),rgba(34,197,94,0.07))",pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{color:T.textMuted,fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{L.ecoTitle}</div>
              <div style={{color:T.text,fontSize:42,fontWeight:900,lineHeight:1}}>{eco}<span style={{fontSize:18,color:T.textMuted}}>%</span></div>
              <div style={{color:ecoHC.text,fontSize:13,fontWeight:700,marginTop:4}}>{eco>=65?L.ecoVibrant:eco>=35?L.ecoStable:L.ecoCrisis}</div>
            </div>
            <div style={{fontSize:52}}>{eco>=80?"🌳":eco>=65?"🌿":eco>=35?"🌾":"🥀"}</div>
          </div>
          <div style={{height:10,borderRadius:99,background:"linear-gradient(90deg,#F43F5E,#F59E0B 45%,#22C55E)",marginBottom:6,position:"relative"}}>
            <div style={{position:"absolute",top:"50%",left:`${Math.min(98,Math.max(2,eco))}%`,transform:"translate(-50%,-50%)",width:16,height:16,borderRadius:99,background:"#fff",border:`2.5px solid ${ecoHC.main}`,boxShadow:`0 2px 8px ${ecoHC.glow}`,transition:"left 0.8s"}}/>
          </div>
          {abandoned.length>0&&(
            <div style={{background:HC.low.bg,border:`1px solid ${HC.low.main}44`,borderRadius:10,padding:"8px 12px",marginTop:10,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:14}}>⚠️</span>
              <span style={{color:HC.low.text,fontSize:12,fontWeight:600}}>{L.ecoWarning(abandoned.length)}</span>
            </div>
          )}
        </div>
      </div>

      {/* XP / LEVEL CARD */}
      <div style={{borderRadius:18,padding:"18px",marginBottom:14,background:T.card,border:`1.5px solid ${HC.xp.main}44`,boxShadow:`0 4px 20px ${T.shadow}`}}>
        {/* rank header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{color:T.textMuted,fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{L.xpTitle}</div>
            <div style={{color:HC.xp.text,fontSize:26,fontWeight:900,lineHeight:1.1}}>{lvl.title[lang]}</div>
            <div style={{color:T.textMuted,fontSize:12,marginTop:3}}>{L.xpLevelLabel} {lvl.level} · {totalXP} XP total</div>
          </div>
          <div style={{background:HC.xp.bg,border:`1.5px solid ${HC.xp.main}55`,borderRadius:16,padding:"8px 16px",textAlign:"center",minWidth:58}}>
            <div style={{fontSize:26}}>⚡</div>
            <div style={{color:HC.xp.text,fontSize:20,fontWeight:900}}>{lvl.level}</div>
          </div>
        </div>
        {/* XP progress bar */}
        <Bar value={lvl.pct} color={HC.xp.main} height={9}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6,marginBottom:16}}>
          <span style={{color:T.textMuted,fontSize:11}}>{totalXP - lvl.min} / {lvl.max===Infinity?"∞":lvl.max-lvl.min} XP</span>
          <span style={{color:HC.xp.text,fontSize:11,fontWeight:700}}>{lvl.max===Infinity?L.xpMaxLevel:L.xpNextLevel(lvl.next)}</span>
        </div>

        {/* ── PERKS UNLOCKED ── */}
        <div style={{background:HC.xp.bg,borderRadius:14,padding:"14px",marginBottom:14}}>
          <div style={{color:HC.xp.text,fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>{L.xpPerksTitle}</div>
          <p style={{color:T.textSub,fontSize:12,lineHeight:1.5,marginBottom:12}}>{L.xpPerksDesc}</p>
          {LEVEL_PERKS.filter(p=>p.level<=lvl.level).map(p=>(
            <div key={p.level} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
              <div style={{width:22,height:22,borderRadius:7,background:HC.xp.main,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                <span style={{color:"#fff",fontSize:11,fontWeight:900}}>{p.level}</span>
              </div>
              <span style={{color:T.text,fontSize:13,lineHeight:1.4}}>{lang==="es"?p.es:p.en}</span>
            </div>
          ))}
          {lvl.level>=10&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4,padding:"6px 10px",background:"rgba(167,139,250,0.2)",borderRadius:9}}>
              <span style={{fontSize:16}}>🌟</span>
              <span style={{color:HC.xp.text,fontSize:12,fontWeight:700}}>{L.xpAllPerks}</span>
            </div>
          )}
        </div>

        {/* next perk preview */}
        {lvl.level < 10 && (
          <div style={{border:`1px dashed ${HC.xp.main}55`,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:24,height:24,borderRadius:8,background:`${HC.xp.main}22`,border:`1.5px dashed ${HC.xp.main}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{color:HC.xp.main,fontSize:12,fontWeight:900}}>{lvl.level+1}</span>
            </div>
            <div>
              <div style={{color:T.textMuted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{lang==="es"?"Próximo beneficio":"Next benefit"}</div>
              <div style={{color:T.textSub,fontSize:12}}>{lang==="es"?LEVEL_PERKS[lvl.level].es:LEVEL_PERKS[lvl.level].en}</div>
            </div>
          </div>
        )}

        {/* XP reward table */}
        <div style={{background:T.input,borderRadius:12,padding:"12px 14px",border:`1px solid ${T.cardBorder}`}}>
          <div style={{color:T.textMuted,fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{L.xpRewardsTitle}</div>
          {L.xpRows.map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<L.xpRows.length-1?`1px solid ${T.divider}`:"none"}}>
              <span style={{color:T.textSub,fontSize:12}}><span style={{marginRight:6}}>{r.e}</span>{r.a}</span>
              <span style={{color:HC.xp.text,fontSize:12,fontWeight:800}}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* METRICS */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:HC.full.bg,border:`1px solid ${HC.full.main}33`,borderRadius:14,padding:"14px 10px",textAlign:"center"}}>
          <div style={{fontSize:22}}>🌾</div>
          <div style={{color:HC.full.text,fontSize:24,fontWeight:900}}>{harvested.length+completed.length}</div>
          <div style={{color:HC.full.text,fontSize:10,fontWeight:700,opacity:0.8}}>{L.metricsHarvested}</div>
        </div>
        <div style={{background:HC.low.bg,border:`1px solid ${HC.low.main}33`,borderRadius:14,padding:"14px 10px",textAlign:"center"}}>
          <div style={{fontSize:22}}>☠️</div>
          <div style={{color:HC.low.text,fontSize:24,fontWeight:900}}>{abandoned.length}</div>
          <div style={{color:HC.low.text,fontSize:10,fontWeight:700,opacity:0.8}}>{L.metricsAbandoned}</div>
        </div>
      </div>

      {/* ACTIVE PLANTS MINI */}
      {active.length>0&&(
        <>
          <SH T={T}>{L.activePlantsTitle(active.length)}</SH>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
            {active.map(h=>{const c=getHC(h.health);return(
              <div key={h.id} style={{background:c.bg,border:`1px solid ${c.main}44`,borderRadius:10,padding:"5px 10px",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:14}}>{getPlant(h.health,h.category)}</span>
                <div><div style={{color:c.text,fontSize:11,fontWeight:700}}>{h.title}</div><div style={{color:c.text,fontSize:10,opacity:0.8}}>{h.health}%</div></div>
              </div>
            );})}
          </div>
        </>
      )}

      {/* HISTORY */}
      <SH T={T}>{L.historyTitle}</SH>
      {history.length===0
        ?<div style={{textAlign:"center",padding:"24px 20px",color:T.textMuted}}><div style={{fontSize:32,marginBottom:8}}>📜</div><div style={{fontSize:13}}>{L.historyEmpty}</div></div>
        :history.slice().reverse().map(item=>{
          const isH=item.finalStatus==="harvested",isC=item.finalStatus==="completed";
          const bc=isH?HC.full:isC?HC.high:HC.low;
          const badge=isH?L.badgeHarvested:isC?L.badgeCompleted:L.badgeAbandoned;
          return(
            <div key={item.id} style={{background:T.card,borderRadius:13,border:`1px solid ${T.cardBorder}`,padding:"11px 13px",marginBottom:8,display:"flex",alignItems:"center",gap:10,boxShadow:`0 2px 8px ${T.shadow}`}}>
              <span style={{fontSize:22}}>{getPlant(item.health,item.category)}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:T.text,fontSize:13,fontWeight:800}}>{item.title}</div>
                <div style={{color:T.textSub,fontSize:11,marginTop:2}}>{fmtAgo(item.archivedAt,lang)} · {item.health}% · {item.xp||0} XP</div>
              </div>
              <span style={{background:bc.bg,color:bc.text,fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:99,border:`1px solid ${bc.main}33`,flexShrink:0}}>{badge}</span>
            </div>
          );
        })
      }

      {/* ANALYTICS */}
      <SH T={T} mt={6}>{L.analyticsTitle}</SH>
      {Object.keys(catStats).length===0
        ?<div style={{color:T.textMuted,fontSize:13,padding:"16px 0"}}>{L.analyticsEmpty}</div>
        :Object.entries(catStats).map(([cat,{good,bad}])=>{
          const total=good+bad;if(!total)return null;
          const pct=Math.round((good/total)*100);
          const info=TR.es.cats.find(c=>c.id===cat)||{e:"✨",l:cat};
          return(
            <div key={cat} style={{background:T.card,borderRadius:14,border:`1px solid ${T.cardBorder}`,padding:"12px 14px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:18}}>{info.e}</span>
                  <span style={{color:T.text,fontSize:13,fontWeight:700}}>{L.cats.find(c=>c.id===cat)?.l||info.l}</span>
                  <span style={{color:T.textMuted,fontSize:11}}>{total}🌿</span>
                </div>
                <span style={{color:pct>=65?HC.full.text:pct>=35?HC.mid.text:HC.low.text,fontSize:13,fontWeight:800}}>{pct}%</span>
              </div>
              <Bar value={pct} color={pct>=65?HC.full.main:pct>=35?HC.mid.main:HC.low.main} height={6}/>
            </div>
          );
        })
      }

      {/* SUMMARY */}
      <div style={{background:T.card,borderRadius:16,padding:"15px",border:`1px solid ${T.cardBorder}`,marginTop:8}}>
        <div style={{color:T.text,fontSize:13,fontWeight:800,marginBottom:12}}>{L.summaryTitle}</div>
        {L.summaryRows(
          habits.length+history.length,
          `${habits.length+history.length>0?Math.round(((harvested.length+completed.length)/(habits.length+history.length))*100):0}%`,
          Math.max(0,...habits.map(h=>h.streak)),
          getLevelInfo(totalXP).title[lang],
        ).map((row,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.cardBorder}`}}>
            <span style={{color:T.textSub,fontSize:13}}>{row.l}</span>
            <span style={{color:T.text,fontSize:13,fontWeight:800}}>{row.v}</span>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{marginTop:28,marginBottom:8,textAlign:"center"}}>
        <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:6,padding:"18px 28px",borderRadius:18,border:`1px solid ${T.cardBorder}`,background:T.card}}>
          <span style={{fontSize:28}}>🌿</span>
          <span style={{color:T.text,fontSize:14,fontWeight:800,letterSpacing:"-0.01em"}}>Digital Garden Tracker</span>
          <div style={{width:32,height:2,borderRadius:99,background:`linear-gradient(90deg,${HC.high.main},#22C55E)`,margin:"2px 0"}}/>
          <span style={{color:T.textSub,fontSize:12,fontWeight:600}}>Creado por</span>
          <span style={{color:HC.xp.text,fontSize:15,fontWeight:900,letterSpacing:"0.01em"}}>Josmer Uriel Bertel Calle</span>
          <span style={{color:T.textMuted,fontSize:11,fontWeight:500,marginTop:2}}>📅 {lang==="es"?"Enero":"January"} 2025</span>
          <div style={{display:"flex",gap:6,marginTop:4}}>
            <span style={{background:HC.full.bg,color:HC.full.text,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:99,border:`1px solid ${HC.full.main}33`}}>v1.0</span>
            <span style={{background:HC.high.bg,color:HC.high.text,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:99,border:`1px solid ${HC.high.main}33`}}>React · AsyncStorage</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════
// expose lang to AddModal via closure
let lang="es";
export default function App(){
  const [dark,setDark]=useState(true);
  const [langState,setLang]=useState("es");
  const [tab,setTab]=useState("tareas");
  const [habits,setHabits]=useState(SEED_HABITS);
  const [history,setHistory]=useState(SEED_HISTORY);
  const [totalXP,setTotalXP]=useState(()=>SEED_HISTORY.reduce((s,h)=>s+(h.xp||0),0));
  const [tutorial,setTutorial]=useState(false);
  const [xpToast,setXPToast]=useState(null);

  lang=langState;
  const T=dark?DARK:LIGHT;
  const L=TR[langState];

  useEffect(()=>{
    AS.getItem("habits").then(v=>v&&setHabits(JSON.parse(v)));
    AS.getItem("history").then(v=>v&&setHistory(JSON.parse(v)));
    AS.getItem("dark").then(v=>{if(v!==null)setDark(v==="true");});
    AS.getItem("lang").then(v=>{if(v){setLang(v);lang=v;}});
    AS.getItem("xp").then(v=>{if(v)setTotalXP(Number(v));});
    AS.getItem("tutSeen").then(v=>{if(!v)setTutorial(true);});
  },[]);
  useEffect(()=>{AS.setItem("habits",JSON.stringify(habits));},[habits]);
  useEffect(()=>{AS.setItem("history",JSON.stringify(history));},[history]);
  useEffect(()=>{AS.setItem("dark",String(dark));},[dark]);
  useEffect(()=>{AS.setItem("lang",langState);},[langState]);
  useEffect(()=>{AS.setItem("xp",String(totalXP));},[totalXP]);

  const addXP=useCallback(amt=>{
    setTotalXP(x=>x+amt);
    setXPToast(amt);
  },[]);

  const onAction=useCallback((id,delta,actionId,xpAmt=0)=>{
    setHabits(prev=>prev.map(h=>{
      if(h.id!==id)return h;
      const d=h.pomodoroBoost&&actionId==="water"?delta*2:delta;
      return{...h,
        health:Math.min(100,h.health+d),
        completedToday:actionId==="water"?true:h.completedToday,
        streak:actionId==="water"?h.streak+1:h.streak,
        completedDays:actionId==="water"?h.completedDays+1:h.completedDays,
        totalDays:actionId==="water"?h.totalDays+1:h.totalDays,
        pomodoroBoost:actionId==="pomo"?true:h.pomodoroBoost,
      };
    }));
    if(xpAmt>0)addXP(xpAmt);
  },[addXP]);

  const onHarvest=useCallback((id,xpAmt=XP_HARVEST)=>{
    const h=habits.find(x=>x.id===id);if(!h)return;
    setHistory(prev=>[...prev,{id:`h${Date.now()}`,title:h.title,category:h.category,health:100,finalStatus:"harvested",archivedAt:Date.now(),xp:xpAmt}]);
    setHabits(prev=>prev.filter(x=>x.id!==id));
    addXP(xpAmt);
  },[habits,addXP]);

  const onKill=useCallback(id=>{
    const h=habits.find(x=>x.id===id);if(!h)return;
    setHistory(prev=>[...prev,{id:`h${Date.now()}`,title:h.title,category:h.category,health:Math.round(h.health),finalStatus:"abandoned",archivedAt:Date.now(),xp:0}]);
    setHabits(prev=>prev.filter(x=>x.id!==id));
  },[habits]);

  const onPause=useCallback(id=>{setHabits(prev=>prev.map(h=>h.id===id?{...h,paused:!h.paused}:h));},[]);

  const onSubUpdate=useCallback((id,subs)=>{
    setHabits(prev=>prev.map(h=>{
      if(h.id!==id)return h;
      const newDone=subs.filter(s=>s.done).length;
      const oldDone=(h.subtasks||[]).filter(s=>s.done).length;
      const bonus=Math.max(0,(newDone-oldDone));
      if(bonus>0)addXP(XP_SUB*bonus);
      return{...h,subtasks:subs,health:Math.min(100,h.health+bonus*5)};
    }));
  },[addXP]);

  const onSchedSave=useCallback((id,days)=>{setHabits(prev=>prev.map(h=>h.id===id?{...h,scheduleDays:days}:h));},[]);

  const onPomoComplete=useCallback((id,bonus,xpAmt)=>{
    onAction(id,bonus,"pomo",xpAmt||15);
  },[onAction]);

  const onAdd=useCallback(({title,category,frequency,scheduleDays,subtasks,pomoDuration})=>{
    setHabits(prev=>[{id:String(Date.now()),title,category,frequency,health:20,streak:0,completedToday:false,totalDays:0,completedDays:0,createdAt:Date.now(),paused:false,subtasks:subtasks||[],pomodoroBoost:false,scheduleDays:scheduleDays||[],pomoDuration:pomoDuration||25},...prev]);
  },[]);

  const eco=calcEco(habits,history);
  const ecoHC=getHC(eco);
  const lvl=getLevelInfo(totalXP);
  const TABS=[{id:"tareas",label:L.tabTareas,icon:"leaf"},{id:"jardin",label:L.tabJardin,icon:"tree"}];

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        body{font-family:'Outfit',sans-serif;background:#080D16;}
        ::-webkit-scrollbar{display:none;}
        @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        @keyframes xpFloat{0%{opacity:0;transform:translateX(-50%) translateY(0)}10%{opacity:1}80%{opacity:1;transform:translateX(-50%) translateY(-20px)}100%{opacity:0;transform:translateX(-50%) translateY(-30px)}}
        input::placeholder{opacity:0.45;}
        button,input{font-family:'Outfit',sans-serif;}
      `}</style>

      <div style={{background:T.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",fontFamily:"'Outfit',sans-serif",transition:"background 0.3s",position:"relative"}}>

        {/* HEADER */}
        <div style={{background:T.headerBg,borderBottom:`1px solid ${T.tabBorder}`,padding:"11px 16px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40,boxShadow:`0 2px 14px ${T.shadow}`}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:20}}>🌿</span>
              <span style={{color:T.text,fontSize:18,fontWeight:900,letterSpacing:"-0.02em"}}>Digital Garden</span>
            </div>
            <div style={{color:ecoHC.text,fontSize:10,fontWeight:700,letterSpacing:"0.05em",marginLeft:27,marginTop:1}}>
              {L.appSubtitle(habits.length,eco)} · {lvl.title[langState]}
            </div>
          </div>
          <div style={{display:"flex",gap:7,alignItems:"center"}}>
            <button onClick={()=>setLang(l=>l==="es"?"en":"es")} style={{background:T.pill,border:`1px solid ${T.cardBorder}`,borderRadius:10,padding:"0 10px",height:34,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              <Icon name="globe" size={13} color={T.textMuted}/>
              <span style={{color:T.textMuted,fontSize:11,fontWeight:800}}>{L.langBtn}</span>
            </button>
            <button onClick={()=>setTutorial(true)} style={{background:T.pill,border:`1px solid ${T.cardBorder}`,borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon name="help" size={15} color={T.textMuted}/>
            </button>
            <button onClick={()=>setDark(d=>!d)} style={{background:T.pill,border:`1px solid ${T.cardBorder}`,borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s"}}>
              <Icon name={dark?"sun":"moon"} size={15} color={dark?"#F59E0B":"#334155"}/>
            </button>
          </div>
        </div>

        {/* SCREENS */}
        <div key={tab} style={{flex:1,display:"flex",flexDirection:"column",animation:"fadeIn 0.25s ease"}}>
          {tab==="tareas"
            ?<TareasScreen habits={habits} T={T} L={L} onAction={onAction} onHarvest={onHarvest} onPause={onPause} onKill={onKill} onSubUpdate={onSubUpdate} onSchedSave={onSchedSave} onPomoComplete={onPomoComplete} onAdd={onAdd}/>
            :<JardinScreen habits={habits} history={history} T={T} L={L} totalXP={totalXP} lang={langState}/>
          }
        </div>

        {/* TAB BAR */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:T.tabBar,borderTop:`1px solid ${T.tabBorder}`,display:"flex",boxShadow:`0 -4px 20px ${T.shadow}`,zIndex:40}}>
          {TABS.map((item,i)=>{
            const isActive=tab===item.id;
            return(
              <button key={item.id} onClick={()=>setTab(item.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,background:"none",border:"none",cursor:"pointer",padding:"10px 0 20px",position:"relative",borderRight:i<TABS.length-1?`1px solid ${T.divider}`:"none",transition:"all 0.2s"}}>
                {/* full-width top indicator */}
                <div style={{position:"absolute",top:0,left:0,right:0,height:isActive?3:0,background:`linear-gradient(90deg,${HC.high.main},#22C55E)`,borderRadius:"0 0 3px 3px",transition:"height 0.25s cubic-bezier(0.34,1.4,0.64,1)",boxShadow:isActive?`0 2px 10px ${HC.high.glow}`:"none"}}/>
                <div style={{width:46,height:36,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:isActive?HC.high.bg:"transparent",transition:"all 0.2s"}}>
                  <Icon name={item.icon} size={24} color={isActive?HC.high.main:T.textMuted}/>
                </div>
                <span style={{color:isActive?HC.high.text:T.textMuted,fontSize:13,fontWeight:isActive?800:600,letterSpacing:"0.01em"}}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tutorial&&<TutorialModal T={T} L={L} onClose={()=>{setTutorial(false);AS.setItem("tutSeen","1");}}/>}
      {xpToast&&<XPToast amount={xpToast} onDone={()=>setXPToast(null)}/>}
    </>
  );
}
