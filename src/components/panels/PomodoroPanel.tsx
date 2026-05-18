import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { POMO_OPTS } from '@/constants/data';
import type { Theme } from '@/constants/theme';
import type { Labels } from '@/constants/translations';

const C = 2 * Math.PI * 50;

interface PomodoroPanelProps {
  T: Theme;
  L: Labels;
  onComplete: (minutes: number) => void;
}

function PomodoroCircle({ pct, color, T }: { pct: number; color: string; T: Theme }) {
  return (
    <Svg width={130} height={130} viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="50" fill="none" stroke={T.divider} strokeWidth={8} />
      <Circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - pct / 100)}
        rotation="-90"
        origin="60, 60"
      />
    </Svg>
  );
}

export function PomodoroPanel({ T, L, onComplete }: PomodoroPanelProps) {
  const [minutes, setMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = minutes * 60;
  const pct = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          onComplete(minutes);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, minutes, onComplete]);

  const start = () => {
    setSecondsLeft(minutes * 60);
    setRunning(true);
  };

  const pause = () => setRunning(false);

  const reset = () => {
    setRunning(false);
    setSecondsLeft(0);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <View style={styles.wrap}>
      <View style={styles.opts}>
        {POMO_OPTS.map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => !running && setMinutes(m)}
            style={[
              styles.opt,
              {
                backgroundColor: minutes === m ? T.accent : T.inputBg,
                borderColor: T.cardBorder,
              },
            ]}
          >
            <Text style={{ color: minutes === m ? '#fff' : T.text, fontFamily: 'Outfit-Bold' }}>
              {m}m
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.circleWrap}>
        <PomodoroCircle pct={pct} color={T.accent} T={T} />
        <Text style={[styles.timer, { color: T.text }]}>
          {running || secondsLeft > 0 ? `${mm}:${ss}` : `${minutes}:00`}
        </Text>
      </View>

      <View style={styles.actions}>
        {!running ? (
          <TouchableOpacity style={[styles.btn, { backgroundColor: T.accent }]} onPress={start}>
            <Text style={styles.btnText}>{L.startPomo}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, { backgroundColor: T.warning }]} onPress={pause}>
            <Text style={styles.btnText}>{L.pausePomo}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.btnOutline, { borderColor: T.divider }]} onPress={reset}>
          <Text style={[styles.btnOutlineText, { color: T.textMuted }]}>{L.resetPomo}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, alignItems: 'center', gap: 16 },
  opts: { flexDirection: 'row', gap: 8 },
  opt: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  circleWrap: { alignItems: 'center', justifyContent: 'center' },
  timer: {
    position: 'absolute',
    fontFamily: 'Outfit-Black',
    fontSize: 22,
  },
  actions: { width: '100%', gap: 8 },
  btn: { padding: 14, borderRadius: 14, alignItems: 'center' },
  btnText: { fontFamily: 'Outfit-ExtraBold', color: '#fff', fontSize: 15 },
  btnOutline: { padding: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  btnOutlineText: { fontFamily: 'Outfit-SemiBold', fontSize: 14 },
});
