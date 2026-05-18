import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Icon } from '@/components/shared/Icon';
import type { Theme } from '@/constants/theme';
import type { Labels } from '@/constants/translations';
import type { Subtask } from '@/types';

interface SubtaskPanelProps {
  T: Theme;
  L: Labels;
  subtasks: Subtask[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
}

export function SubtaskPanel({ T, L, subtasks, onAdd, onToggle }: SubtaskPanelProps) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={L.addSubtask}
          placeholderTextColor={T.textMuted}
          style={[
            styles.input,
            { backgroundColor: T.inputBg, borderColor: T.cardBorder, color: T.text },
          ]}
          onSubmitEditing={submit}
        />
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: T.accent }]} onPress={submit}>
          <Icon name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {subtasks.map((s) => (
        <TouchableOpacity
          key={s.id}
          style={[styles.item, { borderColor: T.divider }]}
          onPress={() => onToggle(s.id)}
        >
          <View style={[styles.check, { borderColor: T.accent, backgroundColor: s.done ? T.accent : 'transparent' }]}>
            {s.done ? <Icon name="check" size={14} color="#fff" /> : null}
          </View>
          <Text
            style={[
              styles.itemText,
              { color: T.text },
              s.done && styles.doneText,
            ]}
          >
            {s.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 10 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { fontFamily: 'Outfit-Regular', fontSize: 14, flex: 1 },
  doneText: { textDecorationLine: 'line-through', opacity: 0.5 },
});
