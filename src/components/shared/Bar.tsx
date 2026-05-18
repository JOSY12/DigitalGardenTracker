import React from 'react';
import { StyleSheet, View } from 'react-native';
 
// ─── PROGRESS BAR ─────────────────────────────────────────────────
interface BarProps { value: number; color: string; height?: number; }
export const Bar = ({ value, color, height = 7 }: BarProps) => {
  const w = Math.max(2, Math.min(100, value));
  const isMax = value >= 100;
  return (
    <View style={[bar.track, { height }]}>
      <View style={[bar.fill, {
        width: `${w}%` as any,
        height,
        backgroundColor: isMax ? '#22C55E' : color,
        shadowColor: isMax ? '#22C55E' : color,
        shadowOpacity: isMax ? 0.6 : 0,
        shadowRadius: isMax ? 6 : 0,
        elevation: isMax ? 4 : 0,
      }]}/>
    </View>
  );
};
const bar = StyleSheet.create({
  track: { backgroundColor:'rgba(148,163,184,0.12)', borderRadius:99, overflow:'hidden', width:'100%' },
  fill:  { borderRadius:99 },
});
 