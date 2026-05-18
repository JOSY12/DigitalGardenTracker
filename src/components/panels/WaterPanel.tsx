import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { Icon } from '@/components/shared/Icon';
import type { Theme } from '@/constants/theme';
import type { Labels } from '@/constants/translations';

interface WaterPanelProps {
  T: Theme;
  L: Labels;
  onWater: () => void;
}

export function WaterPanel({ T, L, onWater }: WaterPanelProps) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.desc, { color: T.textMuted }]}>{L.waterDesc}</Text>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: '#0EA5E9' }]}
        onPress={onWater}
        activeOpacity={0.85}
      >
        <Icon name="droplets" size={22} color="#fff" />
        <Text style={styles.btnText}>{L.water}</Text>
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
