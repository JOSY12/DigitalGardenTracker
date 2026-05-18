import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CAT_ICON, HC, Theme, getHC, getPlant } from '../constants/theme';
import { Habit } from '../types';
import { Bar } from './shared/Bar';

interface Props { habit: Habit; T: Theme; L: any; onOpen: (h: Habit) => void; }

export const HabitCard = ({ habit, T, L, onOpen }: Props) => {
  const hc   = getHC(habit.health);
  const scale = useRef(new Animated.Value(1)).current;
  const doneSubs  = (habit.subtasks || []).filter(s => s.done).length;
  const totalSubs = (habit.subtasks || []).length;
  const healthLabel = (() => {
    if (habit.health >= 100) return L.healthLabels[3];
    if (habit.health >= 65)  return L.healthLabels[2];
    if (habit.health >= 35)  return L.healthLabels[1];
    return L.healthLabels[0];
  })();

  const pressIn  = () => Animated.spring(scale, { toValue:0.97, useNativeDriver:true, speed:30 }).start();
  const pressOut = () => Animated.spring(scale, { toValue:1,    useNativeDriver:true, speed:30 }).start();

  return (
    <Animated.View style={{ transform:[{ scale }] }}>
      <TouchableOpacity onPress={() => onOpen(habit)} onPressIn={pressIn} onPressOut={pressOut}
        activeOpacity={1}
        style={[s.card, { backgroundColor:T.card, borderColor:T.cardBorder,
          shadowColor: hc.main, shadowOpacity:0.12, shadowRadius:12, elevation:4 }]}>

        {/* top accent line */}
        <View style={[s.accent, { backgroundColor: hc.main }]}/>

        {habit.paused && (
          <View style={[s.pauseBadge, { backgroundColor: HC.mid.bg, borderColor:`${HC.mid.main}44` }]}>
            <Text style={[s.pauseTxt, { color: HC.mid.text }]}>{L.seedBadge}</Text>
          </View>
        )}

        <View style={s.row}>
          {/* plant + category icon */}
          <View style={s.plantWrap}>
            <View style={[s.plantBox, { backgroundColor: hc.bg }]}>
              <Text style={s.plantEmoji}>{getPlant(habit.health, habit.category)}</Text>
            </View>
            <View style={[s.catBox, { backgroundColor:T.card, borderColor:T.cardBorder }]}>
              <Text style={s.catEmoji}>{CAT_ICON[habit.category] || '✨'}</Text>
            </View>
          </View>

          <View style={s.info}>
            {/* title row */}
            <View style={s.titleRow}>
              <Text style={[s.title, { color:T.text }]} numberOfLines={1}>{habit.title}</Text>
              <View style={[s.badge, { backgroundColor: hc.bg }]}>
                <Text style={[s.badgeTxt, { color: hc.text }]}>{healthLabel}</Text>
              </View>
            </View>

            {/* chips */}
            <View style={s.chips}>
              {habit.streak > 0 && <Text style={[s.chip, { color:T.textSub }]}>🔥 {habit.streak}d</Text>}
              {habit.completedToday && <Text style={[s.chip, { color:HC.full.text }]}>✓ {L.actionTabs[0].l}</Text>}
              {habit.pomodoroBoost  && <Text style={[s.chip, { color:HC.mid.text  }]}>⚡ ×2</Text>}
              {totalSubs > 0        && <Text style={[s.chip, { color:T.textMuted  }]}>✂️ {doneSubs}/{totalSubs}</Text>}
            </View>

            {/* health bar */}
            <View style={s.barSection}>
              <View style={s.barHeader}>
                <Text style={[s.barLabel, { color:T.textMuted }]}>{L.healthLabel}</Text>
                <Text style={[s.barPct,   { color:hc.text     }]}>{Math.round(habit.health)}%</Text>
              </View>
              <Bar value={habit.health} color={hc.main} height={7}/>
            </View>

            {/* subtask dots */}
            {totalSubs > 0 && (
              <View style={[s.subDots, { marginTop:8 }]}>
                {habit.subtasks.map(sub => (
                  <View key={sub.id} style={[s.dot, {
                    backgroundColor: sub.done ? HC.full.main : T.divider,
                  }]}/>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* tap hint */}
        <View style={s.tapHint}>
          <Text style={[s.tapTxt, { color:T.textMuted }]}>{L.tapManage}</Text>
          <Text style={{ color:T.textMuted, fontSize:10 }}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  card:     { borderRadius:18, borderWidth:1.5, padding:15, marginBottom:11, position:'relative', overflow:'hidden' },
  accent:   { position:'absolute', top:0, left:0, right:0, height:3, borderTopLeftRadius:18, borderTopRightRadius:18 },
  pauseBadge:{ position:'absolute', top:10, right:10, paddingHorizontal:8, paddingVertical:2, borderRadius:8, borderWidth:1 },
  pauseTxt: { fontSize:10, fontFamily:'Outfit-ExtraBold' },
  row:      { flexDirection:'row', gap:12, alignItems:'flex-start' },
  plantWrap:{ position:'relative' },
  plantBox: { width:50, height:50, borderRadius:15, alignItems:'center', justifyContent:'center' },
  plantEmoji:{ fontSize:26 },
  catBox:   { position:'absolute', bottom:-4, right:-6, width:20, height:20, borderRadius:7, borderWidth:1.5, alignItems:'center', justifyContent:'center' },
  catEmoji: { fontSize:11 },
  info:     { flex:1 },
  titleRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 },
  title:    { fontSize:14, fontFamily:'Outfit-ExtraBold', lineHeight:20, flex:1, marginRight:6 },
  badge:    { paddingHorizontal:8, paddingVertical:2, borderRadius:99 },
  badgeTxt: { fontSize:9, fontFamily:'Outfit-ExtraBold' },
  chips:    { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:8 },
  chip:     { fontSize:11, fontFamily:'Outfit-SemiBold' },
  barSection:{ gap:5 },
  barHeader:{ flexDirection:'row', justifyContent:'space-between' },
  barLabel: { fontSize:10, fontFamily:'Outfit-Bold', letterSpacing:0.6, textTransform:'uppercase' },
  barPct:   { fontSize:12, fontFamily:'Outfit-Black' },
  subDots:  { flexDirection:'row', gap:4 },
  dot:      { width:10, height:10, borderRadius:3 },
  tapHint:  { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:4, marginTop:10, opacity:0.3 },
  tapTxt:   { fontSize:10, fontFamily:'Outfit-SemiBold' },
});