import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { HC, PLANTS, POMO_OPTS, Theme } from '../constants/theme';
import { Subtask } from '../types';
import { Lbl } from './shared/Lbl';

interface Props {
  visible: boolean; T: Theme; L: any;
  onClose: () => void;
  onAdd: (data: any) => void;
}

export const AddModal = ({ visible, T, L, onClose, onAdd }: Props) => {
  const [title, setTitle]   = useState('');
  const [cat,   setCat]     = useState('custom');
  const [freq,  setFreq]    = useState('daily');
  const [days,  setDays]    = useState<string[]>([]);
  const [subs,  setSubs]    = useState<Subtask[]>([]);
  const [newSub,setNewSub]  = useState('');
  const [dur,   setDur]     = useState(25);
  const [err,   setErr]     = useState('');

  const reset = () => { setTitle(''); setCat('custom'); setFreq('daily'); setDays([]); setSubs([]); setNewSub(''); setDur(25); setErr(''); };
  const close = () => { reset(); onClose(); };
  const toggleDay = (d: string) => setDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  const addSub = () => {
    if (!newSub.trim() || subs.length >= 5) return;
    setSubs(p => [...p, { id:`s${Date.now()}`, text:newSub.trim(), done:false }]);
    setNewSub('');
  };
  const submit = () => {
    if (!title.trim()) { setErr(L.nameError); return; }
    onAdd({ title:title.trim(), category:cat, frequency:freq, scheduleDays:days, subtasks:subs, pomoDuration:dur });
    close();
  };
  const pomoOpt = POMO_OPTS.find(o => o.min === dur) || POMO_OPTS[4];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={close}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <KeyboardAvoidingView
        style={[s.root, { backgroundColor: T.card }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        {/* header */}
        <View style={[s.header, { borderBottomColor:T.divider }]}>
          <Text style={[s.title, { color:T.text }]}>{L.modalTitle}</Text>
          <TouchableOpacity onPress={close} style={[s.closeBtn, { backgroundColor:T.pill }]}>
            <Text style={{ color:T.textMuted, fontSize:18 }}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* name */}
          <Lbl T={T}>{L.labelName}</Lbl>
          <TextInput value={title} onChangeText={t => { setTitle(t); setErr(''); }}
            placeholder={L.namePlaceholder} placeholderTextColor={T.textMuted}
            autoFocus style={[s.input, { backgroundColor:T.input, borderColor: err ? HC.low.main : T.inputBorder, color:T.text }]}/>
          {err ? <Text style={{ color:HC.low.text, fontSize:12, marginTop:4 }}>{err}</Text> : null}

          {/* category */}
          <Lbl T={T} mt={18}>{L.labelCat}</Lbl>
          <View style={s.wrap}>
            {L.cats.map((c: any) => (
              <TouchableOpacity key={c.id} onPress={() => setCat(c.id)}
                style={[s.pill, { borderColor: cat===c.id ? HC.high.main : T.cardBorder, backgroundColor: cat===c.id ? HC.high.bg : 'transparent' }]}>
                <Text style={{ color: cat===c.id ? HC.high.text : T.textMuted, fontSize:12, fontFamily:'Outfit-Bold' }}>{c.e} {c.l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* frequency */}
          <Lbl T={T} mt={18}>{L.labelFreq}</Lbl>
          <View style={s.grid2}>
            {L.freqs.map((f: any) => (
              <TouchableOpacity key={f.id} onPress={() => setFreq(f.id)}
                style={[s.freqBtn, { borderColor: freq===f.id ? HC.mid.main : T.cardBorder, backgroundColor: freq===f.id ? HC.mid.bg : 'transparent' }]}>
                <Text style={{ color: freq===f.id ? HC.mid.text : T.textSub, fontSize:12, fontFamily:'Outfit-Bold' }}>{f.e} {f.l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* days */}
          <Lbl T={T} mt={18}>{L.labelDays} <Text style={{ fontFamily:'Outfit-Regular', textTransform:'none' }}>{L.labelOptional}</Text></Lbl>
          <View style={{ flexDirection:'row', gap:5 }}>
            {L.days.map((d: string) => (
              <TouchableOpacity key={d} onPress={() => toggleDay(d)} style={[s.dayBtn, {
                borderColor: days.includes(d) ? HC.full.main : T.cardBorder,
                backgroundColor: days.includes(d) ? HC.full.bg : 'transparent',
              }]}>
                <Text style={{ color: days.includes(d) ? HC.full.text : T.textMuted, fontSize:10, fontFamily:'Outfit-ExtraBold' }}>{d.slice(0,2)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* subtasks */}
          <Lbl T={T} mt={20}>{L.labelSubtasks}</Lbl>
          <Text style={{ color:T.textMuted, fontSize:12, fontFamily:'Outfit-Regular', lineHeight:18, marginBottom:10 }}>{L.subtaskHint}</Text>
          {subs.map(sub => (
            <View key={sub.id} style={s.subRow}>
              <View style={[s.subDot, { backgroundColor:T.textMuted }]}/>
              <Text style={{ flex:1, color:T.text, fontSize:13, fontFamily:'Outfit-Regular' }}>{sub.text}</Text>
              <TouchableOpacity onPress={() => setSubs(p => p.filter(x => x.id !== sub.id))}>
                <Text style={{ color:T.textMuted, fontSize:16 }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          {subs.length < 5 ? (
            <View style={[s.subInputRow, { borderColor:T.inputBorder }]}>
              <TextInput value={newSub} onChangeText={setNewSub} onSubmitEditing={addSub}
                placeholder={L.subtaskPlaceholder} placeholderTextColor={T.textMuted}
                style={[s.subInput, { color:T.text, backgroundColor:T.input }]}/>
              <TouchableOpacity onPress={addSub} style={[s.subAddBtn, { backgroundColor: HC.mid.bg }]}>
                <Text style={{ color:HC.mid.text, fontSize:20, fontFamily:'Outfit-Black' }}>+</Text>
              </TouchableOpacity>
            </View>
          ) : <Text style={{ color:T.textMuted, fontSize:11 }}>{L.subtaskMax}</Text>}

          {/* pomodoro */}
          <Lbl T={T} mt={20}>{L.labelPomo}</Lbl>
          <View style={s.wrap}>
            {POMO_OPTS.map(o => (
              <TouchableOpacity key={o.min} onPress={() => setDur(o.min)}
                style={[s.pill, { borderColor: dur===o.min ? HC.mid.main : T.cardBorder, backgroundColor: dur===o.min ? HC.mid.bg : 'transparent' }]}>
                <Text style={{ color: dur===o.min ? HC.mid.text : T.textMuted, fontSize:12, fontFamily:'Outfit-Bold' }}>{o.min}min</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[s.pomoHint, { backgroundColor:HC.mid.bg }]}>
            <Text style={{ color:HC.mid.text, fontSize:12, fontFamily:'Outfit-SemiBold' }}>⏱️ {L.pomoHint(pomoOpt.min, pomoOpt.bonus)}</Text>
          </View>

          {/* preview */}
          <View style={[s.preview, { backgroundColor:T.input, borderColor:T.cardBorder }]}>
            <Text style={{ fontSize:32 }}>{PLANTS[cat]?.[2] || '🌿'}</Text>
            <View>
              <Text style={{ color:T.text, fontSize:13, fontFamily:'Outfit-Bold' }}>{title || L.namePlaceholder.split(',')[0]}</Text>
              <Text style={{ color:T.textMuted, fontSize:11, fontFamily:'Outfit-Regular', marginTop:2 }}>
                {L.cats.find((c: any) => c.id===cat)?.l} · {L.freqs.find((f: any) => f.id===freq)?.l} · ⏱️{dur}min
              </Text>
            </View>
          </View>

          {/* submit */}
          <TouchableOpacity onPress={submit} style={s.submitBtn}>
            <Text style={s.submitTxt}>{L.submitBtn}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const s = StyleSheet.create({
  root:       { flex:1 },
  header:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, paddingBottom:16, borderBottomWidth:1 },
  title:      { fontSize:18, fontFamily:'Outfit-ExtraBold' },
  closeBtn:   { width:34, height:34, borderRadius:10, alignItems:'center', justifyContent:'center' },
  scroll:     { padding:20, paddingBottom:40 },
  input:      { borderRadius:12, borderWidth:1.5, paddingVertical:12, paddingHorizontal:14, fontSize:15, fontFamily:'Outfit-Regular' },
  wrap:       { flexDirection:'row', flexWrap:'wrap', gap:8 },
  pill:       { paddingVertical:6, paddingHorizontal:13, borderRadius:99, borderWidth:1.5 },
  grid2:      { flexDirection:'row', flexWrap:'wrap', gap:8 },
  freqBtn:    { width:'47%', paddingVertical:10, paddingHorizontal:10, borderRadius:11, borderWidth:1.5 },
  dayBtn:     { flex:1, paddingVertical:8, borderRadius:9, borderWidth:1.5, alignItems:'center' },
  subRow:     { flexDirection:'row', alignItems:'center', gap:10, marginBottom:8 },
  subDot:     { width:7, height:7, borderRadius:99 },
  subInputRow:{ flexDirection:'row', borderWidth:1.5, borderRadius:10, overflow:'hidden', marginTop:10, gap:0 },
  subInput:   { flex:1, paddingVertical:10, paddingHorizontal:12, fontSize:13 },
  subAddBtn:  { paddingHorizontal:16, justifyContent:'center', alignItems:'center' },
  pomoHint:   { borderRadius:10, padding:10, marginTop:8 },
  preview:    { borderRadius:14, padding:14, borderWidth:1, flexDirection:'row', alignItems:'center', gap:14, marginTop:20 },
  submitBtn:  { marginTop:20, backgroundColor:'#16A34A', borderRadius:14, paddingVertical:14, alignItems:'center', shadowColor:'#22C55E', shadowOpacity:0.35, shadowRadius:12, elevation:8 },
  submitTxt:  { color:'#fff', fontSize:15, fontFamily:'Outfit-Black' },
});