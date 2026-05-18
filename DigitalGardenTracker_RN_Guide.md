# 🌿 Digital Garden Tracker — Guía de Migración a React Native

**Creado por:** Josmer Uriel Bertel Calle  
**Stack destino:** React Native + Expo (recomendado) · TypeScript opcional

---

## 📋 ÍNDICE

1. [Configurar el proyecto](#1-configurar-el-proyecto)
2. [Estructura de carpetas](#2-estructura-de-carpetas)
3. [Instalar dependencias](#3-instalar-dependencias)
4. [Tabla de conversión HTML → RN](#4-tabla-de-conversión-html--rn)
5. [Conversiones archivo por archivo](#5-conversiones-archivo-por-archivo)
6. [Navegación (Tab Navigator)](#6-navegación-tab-navigator)
7. [AsyncStorage real](#7-asyncstorage-real)
8. [Iconos vectoriales](#8-iconos-vectoriales)
9. [Fuentes personalizadas (Outfit)](#9-fuentes-personalizadas-outfit)
10. [Animaciones](#10-animaciones)
11. [Gradientes](#11-gradientes)
12. [Modo oscuro del sistema](#12-modo-oscuro-del-sistema)
13. [Checklist de migración](#13-checklist-de-migración)

---

## 1. Configurar el proyecto

### Opción A — Expo (RECOMENDADO, más fácil)
```bash
# Instalar Expo CLI
npm install -g expo-cli

# Crear proyecto
npx create-expo-app DigitalGardenTracker
cd DigitalGardenTracker

# Correr en simulador
npx expo start
```

### Opción B — React Native CLI puro
```bash
npx react-native init DigitalGardenTracker
cd DigitalGardenTracker
npx react-native run-android   # o run-ios
```

> **Se recomienda Expo** porque incluye AsyncStorage, fuentes y gradientes con comandos simples.

---

## 2. Estructura de carpetas

Crea esta estructura dentro del proyecto:

```
DigitalGardenTracker/
├── app/                        ← si usas Expo Router (recomendado)
│   ├── (tabs)/
│   │   ├── tareas.tsx
│   │   └── jardin.tsx
│   └── _layout.tsx
├── src/
│   ├── constants/
│   │   ├── theme.ts            ← DARK, LIGHT, HC
│   │   ├── translations.ts     ← TR (i18n completo)
│   │   ├── levels.ts           ← XP_LEVELS, LEVEL_PERKS, getLevelInfo
│   │   └── data.ts             ← SEED_HABITS, SEED_HISTORY, PLANTS, POMO_OPTS
│   ├── components/
│   │   ├── shared/
│   │   │   ├── Bar.tsx         ← ProgressBar
│   │   │   ├── SectionHead.tsx
│   │   │   └── XPToast.tsx
│   │   ├── HabitCard.tsx
│   │   ├── ActionPanel.tsx     ← Bottom sheet con las 7 pestañas
│   │   ├── AddModal.tsx
│   │   ├── TutorialModal.tsx
│   │   └── panels/
│   │       ├── WaterPanel.tsx
│   │       ├── SubtaskPanel.tsx
│   │       ├── PomodoroPanel.tsx
│   │       ├── SchedulePanel.tsx
│   │       ├── HarvestPanel.tsx
│   │       ├── PausePanel.tsx
│   │       └── KillPanel.tsx
│   ├── screens/
│   │   ├── TareasScreen.tsx
│   │   └── JardinScreen.tsx
│   ├── hooks/
│   │   └── useGarden.ts        ← toda la lógica de estado y persistencia
│   └── types/
│       └── index.ts            ← tipos TypeScript
└── assets/
    └── fonts/
        └── Outfit-*.ttf
```

---

## 3. Instalar dependencias

Ejecuta estos comandos en orden:

```bash
# Navegación
npm install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# AsyncStorage real
npx expo install @react-native-async-storage/async-storage

# Fuentes Outfit
npx expo install expo-font @expo-google-fonts/outfit

# Gradientes (para la barra del ecosistema)
npx expo install expo-linear-gradient

# Bottom Sheet (para ActionPanel)
npm install @gorhom/bottom-sheet
npx expo install react-native-reanimated react-native-gesture-handler

# Iconos vectoriales
npm install lucide-react-native
# O alternativamente:
npx expo install @expo/vector-icons

# SVG (para el círculo del Pomodoro)
npx expo install react-native-svg

# Haptic feedback (vibración al regar/cosechar)
npx expo install expo-haptics

# Notificaciones push (para recordatorios de horario)
npx expo install expo-notifications
```

---

## 4. Tabla de conversión HTML → RN

Esta es la clave de toda la migración. Cada elemento HTML tiene su equivalente exacto:

| Web (actual)              | React Native                          | Notas                                      |
|---------------------------|---------------------------------------|--------------------------------------------|
| `<div>`                   | `<View>`                              | El más común                               |
| `<span>`                  | `<Text>`                              | Todo texto DEBE ir en `<Text>`             |
| `<p>`                     | `<Text>`                              | Igual que span                             |
| `<button onClick={fn}>`   | `<TouchableOpacity onPress={fn}>`     | O `Pressable` para más control             |
| `<input>`                 | `<TextInput>`                         | `onChangeText` en vez de `onChange`        |
| `<svg>`                   | `<Svg>` de `react-native-svg`         | Mismo viewBox y paths                      |
| `scroll` con `overflow`   | `<ScrollView>`                        | Envuelve el contenido scrolleable          |
| `position: fixed`         | `position: 'absolute'`                | En RN no existe `fixed`                    |
| `display: flex`           | Por defecto en RN                     | Todos los `View` son flex                  |
| `flexWrap: 'wrap'`        | `flexWrap: 'wrap'`                    | Igual ✅                                   |
| `fontSize`, `fontWeight`  | Igual dentro de `StyleSheet`          | Solo en componentes `<Text>`               |
| `borderRadius: 99`        | `borderRadius: 9999`                  | Igual ✅                                   |
| `backdropFilter`          | No existe en RN                       | Usar `BlurView` de `expo-blur`             |
| `animation` CSS           | `Animated` API o `react-native-reanimated` | Ver sección 10                        |
| `cursor: pointer`         | No necesario                          | Eliminar                                   |
| `@import url()` fuentes   | `useFonts()` de expo-font             | Ver sección 9                              |
| `onMouseDown/Up/Leave`    | `onPressIn` / `onPressOut`            | En `Pressable`                             |
| `overflow: hidden`        | `overflow: 'hidden'`                  | Igual ✅                                   |

---

## 5. Conversiones archivo por archivo

### 5.1 — `<Bar />` (ProgressBar)

**Actual (Web):**
```jsx
const Bar = ({ value, color, height=7, glow }) => (
  <div style={{ background:"rgba(148,163,184,0.12)", borderRadius:99, height, overflow:"hidden" }}>
    <div style={{ height:"100%", width:`${value}%`, background:`...`, borderRadius:99 }}/>
  </div>
);
```

**React Native:**
```tsx
import { View, StyleSheet } from 'react-native';

interface BarProps { value: number; color: string; height?: number; }

const Bar = ({ value, color, height = 7 }: BarProps) => (
  <View style={[styles.track, { height }]}>
    <View style={[styles.fill, {
      width: `${Math.max(2, Math.min(100, value))}%` as any,
      backgroundColor: color,
      height,
    }]}/>
  </View>
);

const styles = StyleSheet.create({
  track: { backgroundColor:'rgba(148,163,184,0.12)', borderRadius:99, overflow:'hidden', width:'100%' },
  fill:  { borderRadius:99 },
});
```

---

### 5.2 — `<Icon />` (SVG)

**Actual (Web):**
```jsx
const Icon = ({ name, size=20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" ...>
    {ICONS[name]}
  </svg>
);
```

**React Native** — usar lucide-react-native directamente:
```tsx
import { Droplets, Scissors, Timer, Calendar, Leaf, TreePine, 
         Plus, X, Check, HelpCircle, Globe, Zap, Star } from 'lucide-react-native';

// Mapa de nombre a componente
const ICON_MAP: Record<string, any> = {
  droplets: Droplets,
  scissors: Scissors,
  timer: Timer,
  calendar: Calendar,
  leaf: Leaf,
  tree: TreePine,
  plus: Plus,
  x: X,
  check: Check,
  help: HelpCircle,
  globe: Globe,
  zap: Zap,
  star: Star,
};

interface IconProps { name: string; size?: number; color?: string; }

const Icon = ({ name, size = 20, color = '#fff' }: IconProps) => {
  const Component = ICON_MAP[name];
  if (!Component) return null;
  return <Component size={size} color={color} strokeWidth={2} />;
};
```

---

### 5.3 — `<HabitCard />` (ejemplo completo)

**Actual (Web):**
```jsx
<div onClick={() => onOpen(habit)} style={{ background: T.card, borderRadius: 18, ... }}
  onMouseDown={e => e.currentTarget.style.transform = "scale(0.984)"}
  onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
>
  <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`...` }}/>
  <span style={{ fontSize:26 }}>{getPlant(health, category)}</span>
  <div style={{ color: T.text, fontSize: 14, fontWeight: 800 }}>{habit.title}</div>
  <Bar value={habit.health} color={hc.main} height={7}/>
</div>
```

**React Native:**
```tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HabitCard = ({ habit, T, L, onOpen }) => {
  const hc = getHC(habit.health);

  return (
    <TouchableOpacity
      onPress={() => onOpen(habit)}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: T.card, borderColor: T.cardBorder }]}
    >
      {/* top accent line */}
      <View style={[styles.accentLine, { backgroundColor: hc.main }]} />

      <View style={styles.row}>
        {/* Plant + category icon */}
        <View style={styles.plantWrap}>
          <View style={[styles.plantBox, { backgroundColor: hc.bg }]}>
            <Text style={styles.plantEmoji}>{getPlant(habit.health, habit.category)}</Text>
          </View>
          <View style={[styles.catBadge, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
            <Text style={styles.catEmoji}>{CAT_ICON[habit.category]}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={[styles.title, { color: T.text }]} numberOfLines={1}>
            {habit.title}
          </Text>
          <Text style={[styles.healthPct, { color: hc.text }]}>
            {Math.round(habit.health)}%
          </Text>
          <Bar value={habit.health} color={hc.main} height={7} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card:       { borderRadius:18, borderWidth:1.5, padding:15, marginBottom:11 },
  accentLine: { position:'absolute', top:0, left:0, right:0, height:3, borderRadius:2 },
  row:        { flexDirection:'row', gap:11, alignItems:'flex-start' },
  plantWrap:  { position:'relative' },
  plantBox:   { width:50, height:50, borderRadius:15, alignItems:'center', justifyContent:'center' },
  plantEmoji: { fontSize:26 },
  catBadge:   { position:'absolute', bottom:-4, right:-6, width:20, height:20, borderRadius:7, borderWidth:1.5, alignItems:'center', justifyContent:'center' },
  catEmoji:   { fontSize:11 },
  info:       { flex:1 },
  title:      { fontSize:14, fontWeight:'800', marginBottom:5 },
  healthPct:  { fontSize:12, fontWeight:'900', textAlign:'right' },
});
```

---

### 5.4 — `<ActionPanel />` (Bottom Sheet)

El ActionPanel usa `position: fixed` en web. En RN usar `@gorhom/bottom-sheet`:

```tsx
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRef, useCallback } from 'react';

const ActionPanel = ({ habit, T, L, onClose, ...handlers }) => {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['75%', '92%'];

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      onClose={onClose}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: T.card, borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: T.divider, width: 36 }}
    >
      <BottomSheetScrollView>
        {/* Header del panel */}
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: T.divider }}>
          <Text style={{ color: T.text, fontSize: 16, fontWeight: '800' }}>{habit.title}</Text>
        </View>

        {/* Tab row 1: 4 botones */}
        {/* Tab row 2: 3 botones */}
        {/* Contenido del tab activo */}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};
```

---

### 5.5 — `<AddModal />` (Modal nativo)

**Web:** `position: fixed`, `animation: slideUp`  
**React Native:**
```tsx
import { Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

const AddModal = ({ visible, T, L, onClose, onAdd }) => (
  <Modal
    visible={visible}
    animationType="slide"      // ← slideUp nativo del sistema
    presentationStyle="pageSheet"
    onRequestClose={onClose}
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: T.card }}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Contenido del modal */}
      </ScrollView>
    </KeyboardAvoidingView>
  </Modal>
);
```

---

### 5.6 — `<PomodoroPanel />` (SVG circular)

**Web:** `<svg>` con `<circle>`  
**React Native:**
```tsx
import Svg, { Circle } from 'react-native-svg';

const C = 2 * Math.PI * 50;

const PomodoroCircle = ({ pct, color, T }) => (
  <Svg width={130} height={130} viewBox="0 0 120 120">
    <Circle cx="60" cy="60" r="50" fill="none" stroke={T.divider} strokeWidth={8}/>
    <Circle
      cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth={8}
      strokeLinecap="round"
      strokeDasharray={C}
      strokeDashoffset={C * (1 - pct / 100)}
      rotation="-90"
      origin="60, 60"
    />
  </Svg>
);
```

---

## 6. Navegación (Tab Navigator)

Reemplaza los botones del tab bar manual por React Navigation:

**`app/(tabs)/_layout.tsx`:**
```tsx
import { Tabs } from 'expo-router';
import { Leaf, Trees } from 'lucide-react-native';
import { useGarden } from '../../src/hooks/useGarden';

export default function TabLayout() {
  const { T, L } = useGarden();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: T.textMuted,
        tabBarStyle: {
          backgroundColor: T.tabBar,
          borderTopColor: T.tabBorder,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
        },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
        // indicador activo (línea superior)
        tabBarIndicatorStyle: {
          top: 0, height: 3,
          backgroundColor: '#38BDF8',
          borderRadius: 3,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="tareas"
        options={{
          title: L.tabTareas,
          tabBarIcon: ({ color, size }) => <Leaf color={color} size={size}/>,
        }}
      />
      <Tabs.Screen
        name="jardin"
        options={{
          title: L.tabJardin,
          tabBarIcon: ({ color, size }) => <Trees color={color} size={size}/>,
        }}
      />
    </Tabs>
  );
}
```

---

## 7. AsyncStorage real

Reemplaza el mock `AS` por el real. Solo cambia el import:

**Actual (mock):**
```js
const AS = { _s:{}, getItem(k){...}, setItem(k,v){...} };
```

**React Native:**
```ts
// src/hooks/useGarden.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// El resto del código es IDÉNTICO:
// await AsyncStorage.getItem('habits')
// await AsyncStorage.setItem('habits', JSON.stringify(habits))
```

---

## 8. Iconos vectoriales

El componente `<Icon>` web usa SVG inline. En RN usar `lucide-react-native`:

```bash
npm install lucide-react-native
```

```tsx
// src/components/shared/Icon.tsx
import { Droplets, Scissors, Timer, Calendar, Leaf, TreePine,
         Plus, X, Check, HelpCircle, Globe, Zap, Skull, 
         Sprout, Award, Archive, Play, Pause } from 'lucide-react-native';

const ICONS: Record<string, React.ElementType> = {
  droplets: Droplets,
  scissors: Scissors,
  timer: Timer,
  calendar: Calendar,
  leaf: Leaf,
  tree: TreePine,
  plus: Plus,
  x: X,
  check: Check,
  help: HelpCircle,
  globe: Globe,
  zap: Zap,
  skull: Skull,
  sprout: Sprout,
  award: Award,
  archive: Archive,
  play: Play,
  pause: Pause,
};

export const Icon = ({ name, size=20, color='#fff' }) => {
  const Comp = ICONS[name];
  return Comp ? <Comp size={size} color={color} strokeWidth={2}/> : null;
};
```

---

## 9. Fuentes personalizadas (Outfit)

**`app/_layout.tsx`:**
```tsx
import { useFonts, Outfit_400Regular, Outfit_600SemiBold, 
         Outfit_700Bold, Outfit_800ExtraBold, Outfit_900Black } from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'Outfit-Regular':   Outfit_400Regular,
    'Outfit-SemiBold':  Outfit_600SemiBold,
    'Outfit-Bold':      Outfit_700Bold,
    'Outfit-ExtraBold': Outfit_800ExtraBold,
    'Outfit-Black':     Outfit_900Black,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;
  return <Stack/>;
}
```

**Uso en StyleSheet:**
```tsx
// En vez de fontWeight:'800', usa fontFamily:'Outfit-ExtraBold'
const styles = StyleSheet.create({
  title: { fontFamily: 'Outfit-ExtraBold', fontSize: 18, color: '#fff' },
  body:  { fontFamily: 'Outfit-Regular',   fontSize: 14 },
});
```

---

## 10. Animaciones

### XP Toast (aparece y sube flotando)
```tsx
import { Animated } from 'react-native';
import { useEffect, useRef } from 'react';

const XPToast = ({ amount, onDone }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity,     { toValue:1, duration:200, useNativeDriver:true }),
        Animated.timing(translateY,  { toValue:-10, duration:200, useNativeDriver:true }),
      ]),
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(opacity,    { toValue:0, duration:400, useNativeDriver:true }),
        Animated.timing(translateY, { toValue:-30, duration:400, useNativeDriver:true }),
      ]),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View style={[styles.toast, { opacity, transform:[{ translateY }] }]}>
      <Text style={styles.toastText}>⚡ +{amount} XP</Text>
    </Animated.View>
  );
};
```

### Scale press (reemplaza onMouseDown)
```tsx
import { Animated } from 'react-native';

const AnimatedCard = ({ onPress, children, style }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(scale, { toValue:0.97, useNativeDriver:true }).start();
  const pressOut = () => Animated.spring(scale, { toValue:1,    useNativeDriver:true }).start();

  return (
    <Animated.View style={[style, { transform:[{ scale }] }]}>
      <TouchableOpacity onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};
```

---

## 11. Gradientes

### Barra del ecosistema (rojo → amarillo → verde)
```tsx
import { LinearGradient } from 'expo-linear-gradient';

// Reemplaza el <div> con background gradient
<LinearGradient
  colors={['#F43F5E', '#F59E0B', '#22C55E']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={{ height: 10, borderRadius: 99 }}
/>

// Gradiente del header de tarjeta
<LinearGradient
  colors={[`${hc.main}00`, hc.main, `${hc.main}00`]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={{ height: 3, borderRadius: 2 }}
/>
```

---

## 12. Modo oscuro del sistema

Detecta automáticamente el tema del teléfono:

```tsx
// src/hooks/useGarden.ts
import { useColorScheme } from 'react-native';

export const useGarden = () => {
  const systemScheme = useColorScheme(); // 'dark' | 'light'
  const [darkOverride, setDarkOverride] = useState<boolean | null>(null);

  // Si el usuario no eligió manualmente, usar el del sistema
  const dark = darkOverride !== null ? darkOverride : systemScheme === 'dark';
  const T = dark ? DARK : LIGHT;

  const toggleDark = () => setDarkOverride(d => d === null ? !dark : !d);

  return { dark, T, toggleDark, ... };
};
```

---

## 13. Checklist de migración

Sigue este orden para no perderte:

### Fase 1 — Fundación
- [ ] `npx create-expo-app DigitalGardenTracker`
- [ ] Instalar todas las dependencias (sección 3)
- [ ] Crear estructura de carpetas (sección 2)
- [ ] Copiar `constants/theme.ts`, `constants/translations.ts`, `constants/levels.ts`, `constants/data.ts` — **sin cambios**, son lógica pura JS/TS

### Fase 2 — Shared components
- [ ] `Bar.tsx` — convertir `<div>` → `<View>`
- [ ] `Icon.tsx` — usar lucide-react-native
- [ ] `XPToast.tsx` — usar `Animated`
- [ ] `SectionHead.tsx` — `<View>` + `<Text>`
- [ ] Configurar fuentes Outfit en `_layout.tsx`

### Fase 3 — Navegación
- [ ] Crear `app/(tabs)/_layout.tsx` con Bottom Tabs
- [ ] Archivos `tareas.tsx` y `jardin.tsx` vacíos por ahora

### Fase 4 — Pantalla Tareas
- [ ] `HabitCard.tsx`
- [ ] `AddModal.tsx` — `<Modal>` + `<KeyboardAvoidingView>`
- [ ] `ActionPanel.tsx` — `@gorhom/bottom-sheet`
- [ ] Sub-paneles: `WaterPanel`, `SubtaskPanel`, `PomodoroPanel`, `SchedulePanel`, `HarvestPanel`, `PausePanel`, `KillPanel`
- [ ] `TareasScreen.tsx` completo

### Fase 5 — Pantalla Jardín
- [ ] `JardinScreen.tsx` con `<ScrollView>`
- [ ] Barra ecosistema con `<LinearGradient>`
- [ ] XP card + perks
- [ ] Historial, analytics, summary, footer

### Fase 6 — Lógica global
- [ ] `useGarden.ts` — todo el estado, AsyncStorage real, callbacks
- [ ] Tutorial modal
- [ ] Pruebas en emulador Android e iOS

### Fase 7 — Pulido final
- [ ] `expo-haptics` en acciones clave (regar, cosechar)
- [ ] `expo-notifications` para recordatorios de horario
- [ ] Safe area (evitar que UI quede bajo la notch o barra de inicio)
- [ ] Prueba en dispositivo físico
- [ ] Generar APK: `npx expo build:android` o `eas build`

---

## ⚡ Tip de velocidad

La lógica JS (XP, colores, traducciones, seed data, calcEco, getLevelInfo, etc.) es **100% reutilizable sin cambiar ni una línea**. Solo necesitas convertir la capa de UI: cambiar tags HTML por componentes RN y estilos inline por StyleSheet.

---

*Digital Garden Tracker · Josmer Uriel Bertel Calle · 2025*
