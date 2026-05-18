import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SH } from '@/components/shared/SectionHead';
import { Bar } from '@/components/shared/Bar';
import { calcEco, fmtAgo } from '@/constants/data';
import { getLevelInfo, LEVEL_PERKS } from '@/constants/levels';
import { useGarden } from '@/hooks/useGarden';

export function JardinScreen() {
  const {
    T,
    L,
    lang,
    habits,
    history,
    totalXP,
    toggleDark,
    toggleLang,
    openTutorial,
  } = useGarden();

  const insets = useSafeAreaInsets();
  const list = habits ?? [];
  const hist = history ?? [];
  const active = useMemo(() => list.filter((h) => !h.paused), [list]);
  const eco = calcEco(list, hist);
  const level = getLevelInfo(totalXP);
  const lvlTitle = level.title[lang];
  const abandoned = hist.filter((h) => h.finalStatus === 'abandoned').length;
  const harvested = hist.filter((h) => h.finalStatus === 'harvested').length;
  const maxStreak = list.reduce((m, h) => Math.max(m, h.streak), 0);
  const ecoLabel =
    eco >= 70 ? L.ecoVibrant : eco >= 40 ? L.ecoStable : L.ecoCrisis;
  const perk = LEVEL_PERKS.find((p) => p.level === level.level);
  const perkText = perk ? (lang === 'es' ? perk.es : perk.en) : '';

  const successRate =
    hist.length > 0
      ? `${Math.round(
          (hist.filter((h) => h.finalStatus !== 'abandoned').length / hist.length) * 100,
        )}%`
      : '—';

  const statusBadge = (s: string) => {
    if (s === 'harvested') return L.badgeHarvested;
    if (s === 'completed') return L.badgeCompleted;
    return L.badgeAbandoned;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: T.text }]}>{L.tabJardin}</Text>

        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
          <SH T={T}>{L.ecoTitle}</SH>
          <Text style={[styles.ecoLabel, { color: T.text }]}>{ecoLabel}</Text>
          <LinearGradient
            colors={['#F43F5E', '#F59E0B', '#22C55E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ecoBar}
          />
          <Text style={[styles.ecoPct, { color: '#38BDF8' }]}>{eco}%</Text>
          {abandoned > 0 ? (
            <Text style={[styles.ecoWarn, { color: T.textMuted }]}>
              {L.ecoWarning(abandoned)}
            </Text>
          ) : null}
          <View style={styles.metrics}>
            <Text style={[styles.metric, { color: T.textMuted }]}>
              {L.metricsHarvested}: {harvested}
            </Text>
            <Text style={[styles.metric, { color: T.textMuted }]}>
              {L.metricsAbandoned}: {abandoned}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
          <SH T={T}>{L.xpTitle}</SH>
          <Text style={[styles.lvl, { color: T.text }]}>
            {L.xpLevelLabel} {level.level} · {lvlTitle}
          </Text>
          <Text style={[styles.xpVal, { color: T.text }]}>{totalXP} XP</Text>
          <Bar value={level.pct} color="#A78BFA" height={10} />
          <Text style={[styles.xpNext, { color: T.textMuted }]}>
            {level.max === Infinity
              ? L.xpMaxLevel
              : L.xpNextLevel(level.next)}
          </Text>
          {perkText ? (
            <Text style={[styles.perk, { color: T.textSub }]}>{perkText}</Text>
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
          <SH T={T}>{L.summaryTitle}</SH>
          {L.summaryRows(list.length + hist.length, successRate, maxStreak, lvlTitle).map(
            (row) => (
              <View key={row.l} style={styles.row}>
                <Text style={[styles.rowL, { color: T.textMuted }]}>{row.l}</Text>
                <Text style={[styles.rowV, { color: T.text }]}>{row.v}</Text>
              </View>
            ),
          )}
        </View>

        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
          <SH T={T}>{L.activePlantsTitle(active.length)}</SH>
          {active.length === 0 ? (
            <Text style={[styles.muted, { color: T.textMuted }]}>{L.emptyDesc}</Text>
          ) : (
            active.map((h) => (
              <View key={h.id} style={[styles.plantRow, { borderBottomColor: T.divider }]}>
                <Text style={styles.plantEmoji}>
                  {h.health >= 100 ? '🌾' : h.health >= 65 ? '🌿' : h.health >= 35 ? '🌱' : '🥀'}
                </Text>
                <View style={styles.plantInfo}>
                  <Text style={[styles.plantTitle, { color: T.text }]} numberOfLines={1}>
                    {h.title}
                  </Text>
                  <Bar value={h.health} color="#38BDF8" height={6} />
                </View>
                <Text style={[styles.plantPct, { color: T.textMuted }]}>
                  {Math.round(h.health)}%
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
          <SH T={T}>{L.historyTitle}</SH>
          {hist.length === 0 ? (
            <Text style={[styles.muted, { color: T.textMuted }]}>{L.historyEmpty}</Text>
          ) : (
            hist.slice(0, 10).map((e) => (
              <View key={e.id} style={[styles.histRow, { borderBottomColor: T.divider }]}>
                <View style={styles.histTop}>
                  <Text style={[styles.histTitle, { color: T.text }]} numberOfLines={1}>
                    {e.title}
                  </Text>
                  <Text style={[styles.histXp, { color: '#A78BFA' }]}>+{e.xp} XP</Text>
                </View>
                <Text style={[styles.histMeta, { color: T.textMuted }]}>
                  {statusBadge(e.finalStatus)} · {fmtAgo(e.archivedAt, lang)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footBtn, { backgroundColor: T.card, borderColor: T.cardBorder }]}
            onPress={toggleDark}
          >
            <Text style={[styles.footText, { color: T.text }]}>
              {lang === 'es' ? 'Tema oscuro' : 'Dark theme'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footBtn, { backgroundColor: T.card, borderColor: T.cardBorder }]}
            onPress={toggleLang}
          >
            <Text style={[styles.footText, { color: T.text }]}>{L.langLabel}: {L.langBtn}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footBtn, { backgroundColor: T.card, borderColor: T.cardBorder }]}
            onPress={openTutorial}
          >
            <Text style={[styles.footText, { color: T.text }]}>
              {lang === 'es' ? 'Ver tutorial' : 'View tutorial'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20 },
  title: { fontFamily: 'Outfit-Black', fontSize: 24, marginBottom: 16 },
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  ecoLabel: { fontFamily: 'Outfit-Bold', fontSize: 15, marginBottom: 10 },
  ecoBar: { height: 10, borderRadius: 99, marginBottom: 8 },
  ecoPct: { fontFamily: 'Outfit-Black', fontSize: 28, textAlign: 'center' },
  ecoWarn: { fontFamily: 'Outfit-Regular', fontSize: 12, textAlign: 'center', marginTop: 8 },
  metrics: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  metric: { fontFamily: 'Outfit-SemiBold', fontSize: 12 },
  lvl: { fontFamily: 'Outfit-Bold', fontSize: 14, marginBottom: 4 },
  xpVal: { fontFamily: 'Outfit-Black', fontSize: 22, marginBottom: 10 },
  xpNext: { fontFamily: 'Outfit-Regular', fontSize: 12, marginTop: 8 },
  perk: { fontFamily: 'Outfit-Regular', fontSize: 13, marginTop: 6, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowL: { fontFamily: 'Outfit-Regular', fontSize: 13, flex: 1 },
  rowV: { fontFamily: 'Outfit-ExtraBold', fontSize: 13 },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  plantEmoji: { fontSize: 22 },
  plantInfo: { flex: 1, gap: 4 },
  plantTitle: { fontFamily: 'Outfit-Bold', fontSize: 14 },
  plantPct: { fontFamily: 'Outfit-Bold', fontSize: 12, width: 36, textAlign: 'right' },
  histRow: { paddingVertical: 10, borderBottomWidth: 1 },
  histTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  histTitle: { fontFamily: 'Outfit-Bold', fontSize: 14, flex: 1 },
  histXp: { fontFamily: 'Outfit-Bold', fontSize: 12 },
  histMeta: { fontFamily: 'Outfit-Regular', fontSize: 12, marginTop: 4 },
  muted: { fontFamily: 'Outfit-Regular', fontSize: 14 },
  footer: { gap: 10, marginTop: 4 },
  footBtn: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  footText: { fontFamily: 'Outfit-SemiBold', fontSize: 14 },
});
