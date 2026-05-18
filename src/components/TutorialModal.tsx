import React, { useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HC, Theme } from '../constants/theme';
import { Translations } from '../constants/translations';

const { width } = Dimensions.get('window');

interface Props { visible: boolean; T: Theme; L: Translations; onClose: () => void; }

export const TutorialModal = ({ visible, T, L, onClose }: Props) => {
  const [step, setStep] = useState(0);
  const s = L.steps[step];
  const isLast = step === L.steps.length - 1;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s$.overlay}>
        <View style={[s$.card, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
          {/* dots */}
          <View style={s$.dots}>
            {L.steps.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setStep(i)}>
                <View style={[s$.dot, {
                  width: i === step ? 22 : 6,
                  backgroundColor: i === step ? HC.high.main : T.divider,
                }]}/>
              </TouchableOpacity>
            ))}
          </View>
          {/* content */}
          <Text style={s$.emoji}>{s.i}</Text>
          <Text style={[s$.title, { color: T.text }]}>{s.t}</Text>
          <Text style={[s$.desc, { color: T.textSub }]}>{s.d}</Text>
          {/* buttons */}
          <View style={s$.btns}>
            {step > 0 && (
              <TouchableOpacity onPress={() => setStep(p => p - 1)}
                style={[s$.btnSec, { borderColor: T.cardBorder }]}>
                <Text style={[s$.btnSecTxt, { color: T.textMuted }]}>{L.tutPrev}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => isLast ? onClose() : setStep(p => p + 1)}
              style={[s$.btnPrim, { flex: step > 0 ? 2 : 1 }]}>
              <Text style={s$.btnPrimTxt}>{isLast ? L.tutStart : L.tutNext}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onClose} style={{ marginTop:12, alignSelf:'center' }}>
            <Text style={{ color: T.textMuted, fontSize:12, fontFamily:'Outfit-SemiBold' }}>{L.tutSkip}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const s$ = StyleSheet.create({
  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.82)', alignItems:'center', justifyContent:'center', padding:20 },
  card:    { width:'100%', maxWidth:370, borderRadius:24, padding:24, borderWidth:1.5 },
  dots:    { flexDirection:'row', justifyContent:'center', gap:4, marginBottom:20 },
  dot:     { height: 5, borderRadius: 99 },
  emoji:   { textAlign:'center', fontSize:52, marginBottom:12 },
  title:   { textAlign:'center', fontSize:18, fontFamily:'Outfit-ExtraBold', marginBottom:10, lineHeight:26 },
  desc:    { textAlign:'center', fontSize:13, fontFamily:'Outfit-Regular', lineHeight:22, marginBottom:20 },
  btns:    { flexDirection:'row', gap:10 },
  btnPrim: { backgroundColor:'#0EA5E9', borderRadius:12, paddingVertical:12, alignItems:'center', justifyContent:'center',
             shadowColor:'#38BDF8', shadowOpacity:0.4, shadowRadius:10, elevation:6 },
  btnPrimTxt: { color:'#fff', fontSize:14, fontFamily:'Outfit-ExtraBold' },
  btnSec:  { flex:1, borderRadius:12, paddingVertical:12, alignItems:'center', justifyContent:'center', borderWidth:1.5 },
  btnSecTxt: { fontSize:13, fontFamily:'Outfit-Bold' },
});