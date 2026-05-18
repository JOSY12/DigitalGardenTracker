import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { Icon } from '@/components/shared/Icon';
import type { Theme } from '@/constants/theme';
import type { Labels } from '@/constants/translations';

interface HarvestPanelProps {
  T: Theme;
  L: Labels;
  onHarvest: () => void;
}

export function HarvestPanel({ T, L, onHarvest }: HarvestPanelProps) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.desc, { color: T.textMuted }]}>{L.harvestDesc}</Text>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: T.success }]}
        onPress={onHarvest}
        activeOpacity={0.85}
      >
        <Icon name="scissors" size={22} color="#fff" />
        <Text style={styles.btnText}>{L.harvest}</Text>
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
