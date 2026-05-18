import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { Icon } from '@/components/shared/Icon';
import type { Theme } from '@/constants/theme';
import type { Labels } from '@/constants/translations';

interface KillPanelProps {
  T: Theme;
  L: Labels;
  onKill: () => void;
}

export function KillPanel({ T, L, onKill }: KillPanelProps) {
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <View style={styles.wrap}>
        <Text style={[styles.desc, { color: T.textMuted }]}>{L.killDesc}</Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: T.danger }]}
          onPress={() => setConfirm(true)}
          activeOpacity={0.85}
        >
          <Icon name="skull" size={22} color="#fff" />
          <Text style={styles.btnText}>{L.kill}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.confirm, { color: T.text }]}>{L.confirmKill}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.half, { backgroundColor: T.danger }]}
          onPress={onKill}
        >
          <Text style={styles.btnText}>{L.yes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.half, { backgroundColor: T.inputBg, borderColor: T.cardBorder, borderWidth: 1 }]}
          onPress={() => setConfirm(false)}
        >
          <Text style={[styles.btnText, { color: T.text }]}>{L.no}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 16 },
  desc: { fontFamily: 'Outfit-Regular', fontSize: 14, textAlign: 'center' },
  confirm: { fontFamily: 'Outfit-Bold', fontSize: 15, textAlign: 'center' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
  },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
  btnText: { fontFamily: 'Outfit-ExtraBold', fontSize: 15, color: '#fff' },
});
