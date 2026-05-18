import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

import type { Theme } from '@/constants/theme';
import type { Labels } from '@/constants/translations';
import type { Schedule } from '@/types';

interface SchedulePanelProps {
  T: Theme;
  L: Labels;
  schedule?: Schedule;
  onSave: (schedule: Schedule) => void;
}

export function SchedulePanel({ T, L, schedule, onSave }: SchedulePanelProps) {
  const [days, setDays] = useState<number[]>(schedule?.days ?? [1, 2, 3, 4, 5]);
  const [time, setTime] = useState(schedule?.time ?? '09:00');

  const toggleDay = (d: number) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: T.textMuted }]}>{L.schedule}</Text>
      <View style={styles.days}>
        {L.days.map((label, i) => (
          <TouchableOpacity
            key={label}
            onPress={() => toggleDay(i)}
            style={[
              styles.day,
              {
                backgroundColor: days.includes(i) ? T.accent : T.inputBg,
                borderColor: T.cardBorder,
              },
            ]}
          >
            <Text
              style={{
                color: days.includes(i) ? '#fff' : T.textMuted,
                fontFamily: 'Outfit-Bold',
                fontSize: 11,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        value={time}
        onChangeText={setTime}
        placeholder="09:00"
        placeholderTextColor={T.textMuted}
        style={[
          styles.input,
          { backgroundColor: T.inputBg, borderColor: T.cardBorder, color: T.text },
        ]}
      />
      <TouchableOpacity
        style={[styles.save, { backgroundColor: T.accent }]}
        onPress={() => onSave({ days, time })}
      >
        <Text style={styles.saveText}>{L.save}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 12 },
  label: { fontFamily: 'Outfit-SemiBold', fontSize: 13 },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  day: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
  },
  save: { padding: 14, borderRadius: 14, alignItems: 'center' },
  saveText: { fontFamily: 'Outfit-ExtraBold', color: '#fff', fontSize: 15 },
});
