import type { Theme } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';
// ─── SECTION HEAD ─────────────────────────────────────────────────
export const SH = ({ T, children, mt = 0 }: { T: Theme; children: React.ReactNode; mt?: number }) => (
  <View style={[sh.row, { marginTop: mt, marginBottom: 10 }]}>
    <Text style={[sh.label, { color: T.textMuted }]}>{children}</Text>
    <View style={[sh.line, { backgroundColor: T.divider }]}/>
  </View>
);
const sh = StyleSheet.create({
  row:   { flexDirection:'row', alignItems:'center', gap:8 },
  label: { fontSize:11, fontFamily:'Outfit-Bold', letterSpacing:0.8, textTransform:'uppercase' },
  line:  { flex:1, height:1 },
});
 
 