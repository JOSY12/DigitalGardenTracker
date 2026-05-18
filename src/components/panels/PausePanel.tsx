import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { Icon } from '@/components/shared/Icon';
import type { Theme } from '@/constants/theme';
import type { Labels } from '@/constants/translations';

interface PausePanelProps {
  T: Theme;
  L: Labels;
  paused: boolean;
  onToggle: () => void;
}

export function PausePanel({ T, L, paused, onToggle }: PausePanelProps) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.desc, { color: T.textMuted }]}>{L.pauseDesc}</Text>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: T.warning }]}
        onPress={onToggle}
        activeOpacity={0.85}
      >
        <Icon name={paused ? 'play' : 'pause'} size={22} color="#fff" />
        <Text style={styles.btnText}>{paused ? L.resumed : L.pause}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 16 },
  desc: { fontFamily: 'Outfit-Regular', fontSize: 14, textAlign: 'center' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
  },
  btnText: { fontFamily: 'Outfit-ExtraBold', fontSize: 16, color: '#fff' },
});
