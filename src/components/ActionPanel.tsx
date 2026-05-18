import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { XP_HARVEST } from '../constants/levels';
import { CAT_ICON, HC, POMO_OPTS, Theme, getHC, getPlant } from '../constants/theme';
import { Habit, Subtask } from '../types';
import { Bar } from './shared/Bar';

const { height: SCREEN_H } = Dimensions.get('window');

interface Props {
  habit: Habit; T: Theme; L: any; visible: boolean;
  onClose: () => void;
  onAction: (id: string, delta: number, a: string, xp?: number) => void;
  onHarvest: (id: string, xp: number) => void;
  onPause: (id: string) => void;
  onKill: (id: string) => void;
  onSubUpdate: (id: string, subs: Subtask[]) => void;
  onSchedSave: (id: string, days: string[]) => void;
  onPomoComplete: (id: string, bonus: number, xp: number) => void;
  waterXP: (streak: number) => number;
}

// ─── SUBTASK PANEL ────────────────────────────────────────────────
const SubPanel = ({ T, L, habit, onUpdate }: any) => {
  const [newT, setNewT] = useState('');
  const subs = habit.subtasks || [];
  const add  = () => { if (!newT.trim() || subs.length >= 5) return; onUpdate(habit.id, [...subs, { id:`s${Date.now()}`, text:newT.trim(), done:false }]); setNewT(''); };
  const tog  = (id: string) => onUpdate(habit.id, subs.map((s: Subtask) => s.id === id ? { ...s, done:!s.done } : s));
  const rem  = (id: string) => onUpdate(habit.id, subs.filter((s: Subtask) => s.id !== id));
  return (
    <View>
      <Text style={{ color:T.textSub, fontSize:12, fontFamily:'Outfit-Regular', lineHeight:18, marginBottom:12 }}>{L.subHint}</Text>
      {subs.map((s: Subtask) => (
        <View key={s.id} style={sp.row}>
          <TouchableOpacity onPress={() => tog(s.id)} style={[sp.check, { borderColor: s.done ? HC.full.main : T.cardBorder, backgroundColor: s.done ? HC.full.bg : 'transparent' }]}>
            {s.done && <Text style={{ color:HC.full.main, fontSize:10 }}>✓</Text>}
          </TouchableOpacity>
          <Text style={[sp.txt, { color: s.done ? T.textMuted : T.text, textDecorationLine: s.done ? 'line-through' : 'none' }]}>{s.text}</Text>
          <TouchableOpacity onPress={() => rem(s.id)}><Text style={{ color:T.textMuted, fontSize:16 }}>×</Text></TouchableOpacity>
        </View>
      ))}
      {subs.length < 5 ? (
        <View style={[sp.inputRow, { borderColor: T.inputBorder }]}>
          <TextInput value={newT} onChangeText={setNewT} onSubmitEditing={add}
            placeholder={L.subtaskPlaceholder} placeholderTextColor={T.textMuted}
            style={[sp.input, { color:T.text, fontFamily:'Outfit-Regular' }]}/>
          <TouchableOpacity onPress={add} style={[sp.addBtn, { backgroundColor: HC.mid.bg }]}>
            <Text style={{ color:HC.mid.text, fontSize:20, fontFamily:'Outfit-Black' }}>+</Text>
          </TouchableOpacity>
        </View>
      ) : <Text style={{ color:T.textMuted, fontSize:11 }}>{L.subMax}</Text>}
    </View>
  );
};
const sp = StyleSheet.create({
  row:      { flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  check:    { width:22, height:22, borderRadius:6, borderWidth:1.5, alignItems:'center', justifyContent:'center' },
  txt:      { flex:1, fontSize:13, fontFamily:'Outfit-Regular' },
  inputRow: { flexDirection:'row', gap:8, borderWidth:1.5, borderRadius:10, overflow:'hidden', marginTop:12 },
  input:    { flex:1, paddingVertical:10, paddingHorizontal:12, fontSize:13 },
  addBtn:   { paddingHorizontal:16, justifyContent:'center' },
});

// ─── POMODORO PANEL ───────────────────────────────────────────────
const PomoPanel = ({ T, L, habit, onComplete, onClose }: any) => {
  const dur = habit.pomoDuration || 25;
  const opt = POMO_OPTS.find(o => o.min === dur) || POMO_OPTS[4];
  const xpEarned = Math.round(15 + (opt.bonus / 50) * 30);
  const [secs, setSecs]       = useState(dur * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone]       = useState(false);
  const ref = useRef<any>(null);
  useEffect(() => {
    if (running && secs > 0) {
      ref.current = setInterval(() => setSecs(s => { if (s <= 1) { clearInterval(ref.current); setRunning(false); setDone(true); return 0; } return s - 1; }), 1000);
    }
    return () => clearInterval(ref.current);
  }, [running]);
  const C = 2 * Math.PI * 50;
  const pct = ((dur * 60 - secs) / (dur * 60)) * 100;
  const mm = String(Math.floor(secs / 60)).padStart(2,'0');
  const ss = String(secs % 60).padStart(2,'0');
  return (
    <View style={{ alignItems:'center', paddingVertical:8 }}>
      {done ? (
        <>
          <Text style={{ fontSize:52, marginBottom:10 }}>🌱✨</Text>
          <Text style={{ color:HC.full.text, fontSize:16, fontFamily:'Outfit-ExtraBold', marginBottom:6 }}>{L.pomoDoneTitle}</Text>
          <Text style={{ color:T.textSub, fontSize:13, fontFamily:'Outfit-Regular', marginBottom:10 }}>{L.pomoDoneDesc}</Text>
          <View style={{ flexDirection:'row', gap:10, marginBottom:18 }}>
            <View style={[pp.chip, { backgroundColor:HC.mid.bg }]}><Text style={{ color:HC.mid.text, fontSize:12, fontFamily:'Outfit-Bold' }}>+{opt.bonus}% {L.healthLabels[2]}</Text></View>
            <View style={[pp.chip, { backgroundColor:HC.xp.bg }]}><Text style={{ color:HC.xp.text, fontSize:12, fontFamily:'Outfit-Bold' }}>+{xpEarned} XP</Text></View>
          </View>
          <TouchableOpacity onPress={() => { onComplete(habit.id, opt.bonus, xpEarned); onClose(); }} style={pp.applyBtn}>
            <Text style={pp.applyTxt}>{L.pomoApply}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={[pp.chip, { backgroundColor:HC.mid.bg, flexDirection:'row', gap:8 }]}>
            <Text style={{ color:HC.mid.text, fontSize:12, fontFamily:'Outfit-Bold' }}>⏱️ {dur} min → +{opt.bonus}% {L.healthLabel} +{xpEarned} XP</Text>
          </View>
          <View style={pp.circleWrap}>
            <Svg width={130} height={130} viewBox="0 0 120 120">
              <Circle cx="60" cy="60" r="50" fill="none" stroke={T.divider} strokeWidth={8}/>
              <Circle cx="60" cy="60" r="50" fill="none" stroke={HC.mid.main} strokeWidth={8}
                strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C*(1-pct/100)}
                rotation="-90" origin="60,60"/>
            </Svg>
            <View style={pp.circleCenter}>
              <Text style={[pp.timerText, { color:T.text }]}>{mm}:{ss}</Text>
            </View>
          </View>
          <View style={{ flexDirection:'row', gap:12, marginTop:4 }}>
            <TouchableOpacity onPress={() => setRunning(r => !r)} style={[pp.ctrlBtn, running ? { backgroundColor:HC.low.bg, borderColor:HC.low.main, borderWidth:1.5 } : { backgroundColor:'#D97706' }]}>
              <Text style={[pp.ctrlTxt, { color: running ? HC.low.text : '#fff' }]}>{running ? L.pomoRunning : L.pomoStart}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setRunning(false); setSecs(dur*60); setDone(false); }}
              style={[pp.ctrlBtn, { backgroundColor:'transparent', borderWidth:1.5, borderColor:T.cardBorder }]}>
              <Text style={{ color:T.textMuted, fontSize:16, fontFamily:'Outfit-Bold' }}>{L.pomoReset}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};
const pp = StyleSheet.create({
  chip:       { paddingHorizontal:14, paddingVertical:6, borderRadius:99, marginBottom:16 },
  applyBtn:   { backgroundColor:'#16A34A', paddingVertical:12, paddingHorizontal:28, borderRadius:12, shadowColor:'#22C55E', shadowOpacity:0.4, shadowRadius:10, elevation:6 },
  applyTxt:   { color:'#fff', fontSize:14, fontFamily:'Outfit-ExtraBold' },
  circleWrap: { width:130, height:130, marginVertical:18, position:'relative', alignItems:'center', justifyContent:'center' },
  circleCenter:{ position:'absolute', alignItems:'center', justifyContent:'center' },
  timerText:  { fontSize:26, fontFamily:'Outfit-Black' },
  ctrlBtn:    { paddingVertical:10, paddingHorizontal:20, borderRadius:12 },
  ctrlTxt:    { fontSize:14, fontFamily:'Outfit-ExtraBold' },
});

// ─── SCHEDULE PANEL ───────────────────────────────────────────────
const SchedPanel = ({ T, L, habit, onSave }: any) => {
  const [days, setDays] = useState<string[]>(habit.scheduleDays || []);
  const tog = (d: string) => setDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  return (
    <View>
      <Text style={{ color:T.textSub, fontSize:13, fontFamily:'Outfit-Regular', lineHeight:20, marginBottom:14 }}>{L.schedHint}</Text>
      <View style={{ flexDirection:'row', gap:5, marginBottom:20 }}>
        {L.days.map((d: string) => (
          <TouchableOpacity key={d} onPress={() => tog(d)} style={[schp.day, {
            borderColor: days.includes(d) ? HC.high.main : T.cardBorder,
            backgroundColor: days.includes(d) ? HC.high.bg : 'transparent',
          }]}>
            <Text style={{ color: days.includes(d) ? HC.high.text : T.textMuted, fontSize:10, fontFamily:'Outfit-ExtraBold' }}>{d.slice(0,2)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={() => onSave(habit.id, days)} style={schp.saveBtn}>
        <Text style={schp.saveTxt}>{L.schedSave}</Text>
      </TouchableOpacity>
    </View>
  );
};
const schp = StyleSheet.create({
  day:     { flex:1, paddingVertical:9, borderRadius:9, borderWidth:1.5, alignItems:'center' },
  saveBtn: { backgroundColor:'#0EA5E9', borderRadius:12, paddingVertical:12, alignItems:'center', shadowColor:'#38BDF8', shadowOpacity:0.4, shadowRadius:10, elevation:6 },
  saveTxt: { color:'#fff', fontSize:14, fontFamily:'Outfit-ExtraBold' },
});

// ─── KILL PANEL ───────────────────────────────────────────────────
const KillPanel = ({ T, L, habit, onKill, onClose }: any) => {
  const [confirm, setConfirm] = useState(false);
  return (
    <View style={{ alignItems:'center' }}>
      <Text style={{ fontSize:52, marginBottom:12 }}>☠️</Text>
      <Text style={{ color:T.text, fontSize:16, fontFamily:'Outfit-ExtraBold', marginBottom:8 }}>{L.killTitle}</Text>
      <Text style={{ color:T.textSub, fontSize:13, fontFamily:'Outfit-Regular', lineHeight:20, marginBottom:20, textAlign:'center' }}>{L.killDesc}</Text>
      {!confirm ? (
        <View style={{ flexDirection:'row', gap:10, width:'100%' }}>
          <TouchableOpacity onPress={onClose} style={[kp.btn, { borderWidth:1.5, borderColor:T.cardBorder }]}>
            <Text style={{ color:T.textMuted, fontFamily:'Outfit-Bold', fontSize:14 }}>{L.killCancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setConfirm(true)} style={[kp.btn, { backgroundColor: HC.low.bg, borderWidth:1.5, borderColor:`${HC.low.main}55` }]}>
            <Text style={{ color:HC.low.text, fontFamily:'Outfit-Bold', fontSize:14 }}>{L.killTitle}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => { onKill(habit.id); onClose(); }}
          style={{ width:'100%', backgroundColor:'#BE123C', borderRadius:12, paddingVertical:14, alignItems:'center', shadowColor:'#F43F5E', shadowOpacity:0.5, shadowRadius:12, elevation:8 }}>
          <Text style={{ color:'#fff', fontSize:15, fontFamily:'Outfit-Black' }}>{L.killConfirm}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
const kp = StyleSheet.create({
  btn: { flex:1, borderRadius:12, paddingVertical:11, alignItems:'center', justifyContent:'center' },
});

// ─── TAB BUTTON ───────────────────────────────────────────────────
const TabBtn = ({ t, active, T, onPress, isKill }: any) => {
  const acc = isKill ? HC.low.main : HC.high.main;
  const accT = isKill ? HC.low.text : T.text;
  return (
    <TouchableOpacity onPress={onPress} style={[tb.btn, {
      borderBottomWidth: active ? 2.5 : 0,
      borderBottomColor: acc,
      backgroundColor: active ? (isKill ? 'rgba(244,63,94,0.07)' : 'rgba(56,189,248,0.07)') : 'transparent',
    }]}>
      <Text style={{ fontSize:16 }}>{t.e}</Text>
      <Text style={{ color: active ? accT : T.textMuted, fontSize:10, fontFamily: active ? 'Outfit-ExtraBold' : 'Outfit-SemiBold', marginTop:2 }}>{t.l}</Text>
    </TouchableOpacity>
  );
};
const tb = StyleSheet.create({
  btn: { flex:1, paddingVertical:9, alignItems:'center', gap:2 },
});

// ─── MAIN ACTION PANEL ────────────────────────────────────────────
export const ActionPanel = (props: Props) => {
  const { habit, T, L, visible, onClose, onAction, onHarvest, onPause, onKill, onSubUpdate, onSchedSave, onPomoComplete, waterXP } = props;
  const insets = useSafeAreaInsets();
  const [aTab, setATab] = useState('water');

  useEffect(() => {
    if (visible) setATab('water');
  }, [visible, habit.id]);
  const hc = getHC(habit.health);
  const row1 = L.actionTabs.slice(0, 4);
  const row2 = L.actionTabs.slice(4);
  const xpW = waterXP(habit.streak);

  const healthLabel = (() => {
    if (habit.health >= 100) return L.healthLabels[3];
    if (habit.health >= 65)  return L.healthLabels[2];
    if (habit.health >= 35)  return L.healthLabels[1];
    return L.healthLabels[0];
  })();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={ap.container}>
        <Pressable style={ap.overlay} onPress={onClose} accessibilityRole="button" />
        <View
          style={[
            ap.sheet,
            {
              backgroundColor: T.card,
              borderTopColor: T.cardBorder,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
        {/* handle */}
        <View style={[ap.handle, { backgroundColor:T.divider }]}/>

        {/* habit header */}
        <View style={[ap.header, { borderBottomColor:T.divider }]}>
          <View style={{ position:'relative' }}>
            <View style={[ap.plantBox, { backgroundColor:hc.bg }]}>
              <Text style={{ fontSize:24 }}>{getPlant(habit.health, habit.category)}</Text>
            </View>
            <View style={[ap.catBadge, { backgroundColor:T.card, borderColor:T.cardBorder }]}>
              <Text style={{ fontSize:9 }}>{CAT_ICON[habit.category] || '✨'}</Text>
            </View>
          </View>
          <View style={{ flex:1 }}>
            <Text style={[ap.habitTitle, { color:T.text }]}>{habit.title}</Text>
            <View style={{ flexDirection:'row', gap:8, marginTop:3 }}>
              <View style={[ap.badgeSmall, { backgroundColor:hc.bg }]}>
                <Text style={[ap.badgeSmallTxt, { color:hc.text }]}>{healthLabel}</Text>
              </View>
              {habit.streak > 0 && <Text style={{ color:T.textMuted, fontSize:11, fontFamily:'Outfit-SemiBold' }}>🔥 {habit.streak}d</Text>}
            </View>
          </View>
          <View style={{ alignItems:'flex-end', minWidth:52 }}>
            <Text style={[ap.pct, { color:hc.text }]}>{Math.round(habit.health)}%</Text>
            <Bar value={habit.health} color={hc.main} height={4}/>
          </View>
        </View>

        {/* tab rows */}
        <View style={[ap.tabsWrap, { borderBottomColor:T.divider }]}>
          <View style={[ap.tabRow, { borderBottomWidth:1, borderBottomColor:T.divider }]}>
            {row1.map((t: any) => <TabBtn key={t.id} t={t} active={aTab===t.id} T={T} onPress={() => setATab(t.id)}/>)}
          </View>
          <View style={ap.tabRow}>
            {row2.map((t: any) => <TabBtn key={t.id} t={t} active={aTab===t.id} T={T} onPress={() => setATab(t.id)} isKill={t.id==='kill'}/>)}
          </View>
        </View>

        {/* content */}
        <ScrollView
          style={ap.scrollBody}
          contentContainerStyle={ap.content}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {aTab === 'water' && (
            habit.completedToday ? (
              <View style={{ alignItems:'center', paddingTop:8 }}>
                <Text style={{ fontSize:52, marginBottom:10 }}>✅</Text>
                <Text style={{ color:HC.full.text, fontSize:16, fontFamily:'Outfit-ExtraBold', marginBottom:6 }}>{L.waterDone}</Text>
                <Text style={{ color:T.textSub, fontSize:13, fontFamily:'Outfit-Regular' }}>{L.waterDoneDesc(habit.streak)}</Text>
              </View>
            ) : (
              <View style={{ alignItems:'center', paddingTop:8 }}>
                <Text style={{ fontSize:64, marginBottom:12 }}>💧</Text>
                <Text style={{ color:T.text, fontSize:16, fontFamily:'Outfit-ExtraBold', marginBottom:6 }}>{L.waterTitle}</Text>
                <Text style={{ color:T.textSub, fontSize:13, fontFamily:'Outfit-Regular', marginBottom:8, textAlign:'center' }}>{L.waterDesc(habit.pomodoroBoost)}</Text>
                <View style={[ap.xpChip, { backgroundColor:HC.xp.bg }]}>
                  <Text style={{ color:HC.xp.text, fontSize:12, fontFamily:'Outfit-Bold' }}>⚡ {L.waterXPLabel(xpW)}</Text>
                </View>
                <TouchableOpacity onPress={() => { onAction(habit.id, habit.pomodoroBoost?24:12, 'water', xpW); onClose(); }}
                  style={ap.mainBtn}>
                  <Text style={ap.mainBtnTxt}>{L.waterBtn(habit.pomodoroBoost?24:12)}</Text>
                </TouchableOpacity>
              </View>
            )
          )}
          {aTab === 'prune'    && <SubPanel T={T} L={L} habit={habit} onUpdate={onSubUpdate}/>}
          {aTab === 'pomo'     && <PomoPanel T={T} L={L} habit={habit} onComplete={onPomoComplete} onClose={onClose}/>}
          {aTab === 'schedule' && <SchedPanel T={T} L={L} habit={habit} onSave={onSchedSave}/>}
          {aTab === 'harvest' && (
            habit.health >= 100 ? (
              <View style={{ alignItems:'center', paddingTop:8 }}>
                <Text style={{ fontSize:56, marginBottom:10 }}>🌾✨</Text>
                <Text style={{ color:HC.full.text, fontSize:17, fontFamily:'Outfit-ExtraBold', marginBottom:8 }}>{L.harvestReady}</Text>
                <Text style={{ color:T.textSub, fontSize:13, fontFamily:'Outfit-Regular', marginBottom:16, textAlign:'center' }}>{L.harvestReadyDesc(XP_HARVEST)}</Text>
                <TouchableOpacity onPress={() => { onHarvest(habit.id, XP_HARVEST); onClose(); }}
                  style={[ap.mainBtn, { backgroundColor:'#16A34A', shadowColor:'#22C55E' }]}>
                  <Text style={ap.mainBtnTxt}>{L.harvestBtn(XP_HARVEST)}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems:'center', paddingTop:8 }}>
                <Text style={{ fontSize:48, marginBottom:10 }}>🌱</Text>
                <Text style={{ color:T.text, fontSize:15, fontFamily:'Outfit-ExtraBold', marginBottom:8 }}>{L.harvestNotReady}</Text>
                <Text style={{ color:T.textSub, fontSize:13, fontFamily:'Outfit-Regular', marginBottom:14, textAlign:'center' }}>{L.harvestNotReadyDesc(100-Math.round(habit.health))}</Text>
                <View style={{ width:'100%' }}><Bar value={habit.health} color={HC.full.main} height={8}/></View>
              </View>
            )
          )}
          {aTab === 'pause' && (
            <View style={{ alignItems:'center', paddingTop:8 }}>
              <Text style={{ fontSize:52, marginBottom:10 }}>🪴</Text>
              <Text style={{ color:T.text, fontSize:16, fontFamily:'Outfit-ExtraBold', marginBottom:8 }}>{L.pauseTitle(habit.paused)}</Text>
              <Text style={{ color:T.textSub, fontSize:13, fontFamily:'Outfit-Regular', marginBottom:20, textAlign:'center' }}>{L.pauseDesc(habit.paused)}</Text>
              <TouchableOpacity onPress={() => { onPause(habit.id); onClose(); }}
                style={[ap.outlineBtn, { borderColor: habit.paused ? HC.full.main : HC.mid.main, backgroundColor: habit.paused ? HC.full.bg : HC.mid.bg }]}>
                <Text style={{ color: habit.paused ? HC.full.text : HC.mid.text, fontSize:14, fontFamily:'Outfit-ExtraBold' }}>{L.pauseBtn(habit.paused)}</Text>
              </TouchableOpacity>
            </View>
          )}
          {aTab === 'kill' && <KillPanel T={T} L={L} habit={habit} onKill={onKill} onClose={onClose}/>}
        </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const ap = StyleSheet.create({
  container:  { flex: 1, justifyContent: 'flex-end' },
  overlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.72)' },
  sheet:      {
    maxHeight: SCREEN_H * 0.9,
    width: '100%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  scrollBody: { maxHeight: SCREEN_H * 0.48 },
  handle:     { width:36, height:4, borderRadius:99, alignSelf:'center', marginTop:10, marginBottom:0 },
  header:     { flexDirection:'row', alignItems:'center', gap:12, padding:14, paddingTop:12, borderBottomWidth:1 },
  plantBox:   { width:46, height:46, borderRadius:13, alignItems:'center', justifyContent:'center' },
  catBadge:   { position:'absolute', bottom:-4, right:-5, width:18, height:18, borderRadius:6, borderWidth:1.5, alignItems:'center', justifyContent:'center' },
  habitTitle: { fontSize:15, fontFamily:'Outfit-ExtraBold' },
  badgeSmall: { paddingHorizontal:7, paddingVertical:2, borderRadius:99 },
  badgeSmallTxt:{ fontSize:10, fontFamily:'Outfit-ExtraBold' },
  pct:        { fontSize:22, fontFamily:'Outfit-Black' },
  tabsWrap:   { borderBottomWidth:1 },
  tabRow:     { flexDirection:'row' },
  content:    { padding:20, paddingBottom:32 },
  xpChip:     { paddingHorizontal:14, paddingVertical:4, borderRadius:99, marginBottom:18 },
  mainBtn:    { backgroundColor:'#0EA5E9', paddingVertical:13, paddingHorizontal:36, borderRadius:14, shadowColor:'#38BDF8', shadowOpacity:0.4, shadowRadius:10, elevation:6 },
  mainBtnTxt: { color:'#fff', fontSize:15, fontFamily:'Outfit-ExtraBold' },
  outlineBtn: { paddingVertical:11, paddingHorizontal:28, borderRadius:12, borderWidth:1.5 },
});