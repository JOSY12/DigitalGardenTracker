import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionPanel } from '@/components/ActionPanel';
import { AddModal } from '@/components/AddModal';
import { HabitCard } from '@/components/HabitCard';
import { TutorialModal } from '@/components/TutorialModal';
import { XPToast } from '@/components/shared/XPToast';
import { calcEco } from '@/constants/data';
import { useGarden } from '@/hooks/useGarden';
import type { Habit } from '@/types';

export function TareasScreen() {
  const {
    T,
    L,
    habits,
    history,
    tutorial,
    xpToast,
    setXPToast,
    closeTutorial,
    toggleLang,
    onAdd,
    onAction,
    onHarvest,
    onKill,
    onPause,
    onSubUpdate,
    onSchedSave,
    onPomoComplete,
    waterXP,
  } = useGarden();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const insets = useSafeAreaInsets();

  const list = habits ?? [];
  const selected = useMemo(
    () => (selectedId ? list.find((h) => h.id === selectedId) ?? null : null),
    [list, selectedId],
  );

  useEffect(() => {
    if (selectedId && !list.some((h) => h.id === selectedId)) {
      setSelectedId(null);
    }
  }, [list, selectedId]);
  const active = useMemo(() => list.filter((h) => !h.paused), [list]);
  const seedbed = useMemo(() => list.filter((h) => h.paused), [list]);
  const eco = calcEco(list, history ?? []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: T.text }]}>{L.tabTareas}</Text>
          <Text style={[styles.sub, { color: T.textMuted }]}>
            {L.appSubtitle(active.length, eco)}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleLang} hitSlop={8}>
            <Text style={[styles.langBtn, { color: T.textMuted }]}>{L.langBtn}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: '#0EA5E9' }]}
            onPress={() => setShowAdd(true)}
          >
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {active.length === 0 && seedbed.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🪴</Text>
            <Text style={[styles.emptyTitle, { color: T.text }]}>{L.emptyTitle}</Text>
            <Text style={[styles.emptyDesc, { color: T.textMuted }]}>{L.emptyDesc}</Text>
          </View>
        ) : (
          <>
            {active.map((h) => (
              <HabitCard key={h.id} habit={h} T={T} L={L} onOpen={(habit) => setSelectedId(habit.id)} />
            ))}
            {seedbed.length > 0 ? (
              <>
                <Text style={[styles.section, { color: T.textMuted }]}>{L.seedSection}</Text>
                {seedbed.map((h) => (
                  <HabitCard key={h.id} habit={h} T={T} L={L} onOpen={(habit) => setSelectedId(habit.id)} />
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.addBar,
          { backgroundColor: '#0EA5E9', bottom: Math.max(insets.bottom, 8) + 8 },
        ]}
        onPress={() => setShowAdd(true)}
        activeOpacity={0.9}
      >
        <Text style={styles.addBarText}>{L.addBtn}</Text>
      </TouchableOpacity>

      {selected ? (
        <ActionPanel
          habit={selected}
          T={T}
          L={L}
          visible={!!selected}
          onClose={() => setSelectedId(null)}
          onAction={onAction}
          onHarvest={onHarvest}
          onPause={onPause}
          onKill={(id) => {
            onKill(id);
            setSelectedId(null);
          }}
          onSubUpdate={onSubUpdate}
          onSchedSave={onSchedSave}
          onPomoComplete={onPomoComplete}
          waterXP={waterXP}
        />
      ) : null}

      <AddModal
        visible={showAdd}
        T={T}
        L={L}
        onClose={() => setShowAdd(false)}
        onAdd={(data) => {
          onAdd(data);
          setShowAdd(false);
        }}
      />

      <TutorialModal visible={tutorial} T={T} L={L} onClose={closeTutorial} />

      {xpToast !== null ? (
        <XPToast amount={xpToast} onDone={() => setXPToast(null)} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: { fontFamily: 'Outfit-Black', fontSize: 24 },
  sub: { fontFamily: 'Outfit-Regular', fontSize: 13, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  langBtn: { fontFamily: 'Outfit-Bold', fontSize: 13 },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { color: '#fff', fontSize: 22, fontFamily: 'Outfit-Bold' },
  scroll: { paddingHorizontal: 20, paddingBottom: 140 },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontFamily: 'Outfit-ExtraBold', fontSize: 18, marginBottom: 8 },
  emptyDesc: { fontFamily: 'Outfit-Regular', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  section: {
    fontFamily: 'Outfit-Bold',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  addBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  addBarText: { color: '#fff', fontFamily: 'Outfit-ExtraBold', fontSize: 15 },
});
