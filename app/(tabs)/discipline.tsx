import * as Haptics from "expo-haptics";
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, Alert } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '@/components/screen-container';
import { SubTabBar } from '@/components/sub-tab-bar';
import { useColors } from '@/hooks/use-colors';
import { DisciplineRepo, NavRepo } from '@/lib/db/database';
import { KNOWLEDGE_ARTICLES } from '@/lib/db/seeds';

type Tab = 'dopamine' | 'journal' | 'knowledge';
const TABS = [
  { key: 'dopamine' as Tab, label: 'Dopamine', icon: '🧠' },
  { key: 'journal' as Tab, label: 'Journal', icon: '📔' },
  { key: 'knowledge' as Tab, label: 'Knowledge', icon: '📚' },
];

// ─── Dopamine Reset ────────────────────────────────────────────────────────────

function DopamineResetScreen() {
  const colors = useColors();
  const [pornStreak, setPornStreak] = useState(0);
  const [socialStreak, setSocialStreak] = useState(0);

  useEffect(() => {
    DisciplineRepo.getStreakPorn().then(setPornStreak);
    DisciplineRepo.getStreakSocial().then(setSocialStreak);
  }, []);

  const resetStreak = (type: 'porn' | 'social') => {
    Alert.alert('Reset Streak', `Are you sure you want to reset your ${type} streak?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset (I Relapsed)', style: 'destructive', onPress: async () => {
        if (type === 'porn') { setPornStreak(0); await DisciplineRepo.setStreakPorn(0); }
        else { setSocialStreak(0); await DisciplineRepo.setStreakSocial(0); }
      }}
    ]);
  };

  const addDay = async (type: 'porn' | 'social') => {
    if (type === 'porn') {
      const n = pornStreak + 1;
      setPornStreak(n);
      await DisciplineRepo.setStreakPorn(n);
    } else {
      const n = socialStreak + 1;
      setSocialStreak(n);
      await DisciplineRepo.setStreakSocial(n);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.error, marginBottom: 8 }}>The Dopamine Problem</Text>
        <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
          Porn and infinite scrolling give you 1000% dopamine spikes. Real life gives 50-100%.{"\n"}
          Your brain has adapted to expect 1000%. That's why you procrastinate and feel unmotivated.{"\n"}
          You MUST starve the cheap dopamine to make real effort feel rewarding again.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🔞</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.foreground }}>No Porn</Text>
          <Text style={{ fontSize: 36, fontWeight: '900', color: pornStreak > 7 ? colors.success : colors.warning, marginVertical: 8 }}>{pornStreak}</Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 12 }}>Days Clean</Text>
          <Pressable onPress={() => addDay('porn')} style={{ backgroundColor: colors.primary + '20', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>+ Add Day</Text>
          </Pressable>
          <Pressable onPress={() => resetStreak('porn')} style={{ paddingVertical: 8 }}>
            <Text style={{ color: colors.error, fontSize: 11, textDecorationLine: 'underline' }}>Reset</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>📱</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.foreground }}>No Mindless Scroll</Text>
          <Text style={{ fontSize: 36, fontWeight: '900', color: socialStreak > 7 ? colors.success : colors.warning, marginVertical: 8 }}>{socialStreak}</Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 12 }}>Days Clean</Text>
          <Pressable onPress={() => addDay('social')} style={{ backgroundColor: colors.primary + '20', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>+ Add Day</Text>
          </Pressable>
          <Pressable onPress={() => resetStreak('social')} style={{ paddingVertical: 8 }}>
            <Text style={{ color: colors.error, fontSize: 11, textDecorationLine: 'underline' }}>Reset</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ backgroundColor: colors.primary + '15', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.primary + '40' }}>
        <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 8 }}>Urge Survival Tactics</Text>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
          1. <Text style={{ fontWeight: '700' }}>20 Push-ups immediately.</Text> Forces blood to muscles.
          {"\n"}2. <Text style={{ fontWeight: '700' }}>Cold water on face.</Text> Activates mammalian dive reflex, lowers heart rate.
          {"\n"}3. <Text style={{ fontWeight: '700' }}>Change rooms.</Text> Physical movement breaks the mental loop.
          {"\n"}4. <Text style={{ fontWeight: '700' }}>Talk to AI Coach.</Text> Hit the "I want to relapse" quick prompt.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Journal ───────────────────────────────────────────────────────────────────

type JournalEntry = { date: string; content: string };

function JournalHistoryCard({ entry, onPress }: { entry: JournalEntry; onPress: () => void }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_LENGTH = 140;
  const needsTruncation = entry.content.length > PREVIEW_LENGTH;

  const formattedDate = (() => {
    try {
      return new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      });
    } catch { return entry.date; }
  })();

  const relativeDate = (() => {
    try {
      const entryDate = new Date(entry.date + 'T00:00:00');
      const today = new Date();
      today.setHours(0,0,0,0);
      const diffMs = today.getTime() - entryDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`;
      return `${Math.floor(diffDays/30)} months ago`;
    } catch { return ''; }
  })();

  return (
    <Pressable onPress={() => { setExpanded(!expanded); onPress?.(); }}
      style={({ pressed }) => ({
        backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.85 : 1,
      })}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '700' }}>{formattedDate}</Text>
          {relativeDate ? <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '600', marginTop: 2 }}>{relativeDate}</Text> : null}
        </View>
        <Text style={{ color: colors.muted, fontSize: 10 }}>{entry.content.split(/\s+/).filter(Boolean).length} words</Text>
      </View>
      <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>
        {expanded || !needsTruncation ? entry.content : entry.content.slice(0, PREVIEW_LENGTH) + '…'}
      </Text>
      {needsTruncation && (
        <Pressable onPress={() => setExpanded(!expanded)} style={{ marginTop: 8, paddingVertical: 4 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
            {expanded ? '▲ Show less' : '▼ Read full entry'}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

function JournalWriteView({ onSaved }: { onSaved: () => void }) {
  const colors = useColors();
  const [entry, setEntry] = useState('');
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const todayDisplay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    DisciplineRepo.getJournalReflection(today).then(s => { if (s) { setEntry(s); setSaved(true); } });
  }, []);

  const saveEntry = async () => {
    if (!entry.trim()) return;
    await DisciplineRepo.setJournalReflection(today, entry);
    setSaved(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSaved();
  };

  const prompts = [
    "What did I do well today?",
    "Where did my discipline slip?",
    "What is one thing I must accomplish tomorrow?",
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>Daily Reflection — {todayDisplay}</Text>

      <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12, marginBottom: 8 }}>Prompts</Text>
        {prompts.map((p, i) => (
          <Pressable key={i} onPress={() => setEntry(prev => prev ? prev + '\n\n' + p + '\n' : p + '\n')}>
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>• {p}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        value={entry}
        onChangeText={(t) => { setEntry(t); setSaved(false); }}
        placeholder="Write your reflection here..."
        placeholderTextColor={colors.muted}
        multiline
        textAlignVertical="top"
        style={{
          backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
          borderRadius: 14, padding: 16, color: colors.foreground, fontSize: 14,
          minHeight: 220, marginBottom: 16, lineHeight: 22,
        }}
      />

      <Pressable onPress={saveEntry} style={({ pressed }) => ({
        backgroundColor: saved ? colors.success : colors.primary,
        borderRadius: 14, paddingVertical: 16, alignItems: 'center', opacity: pressed ? 0.85 : 1,
      })}>
        <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>{saved ? '✓ Saved' : 'Save Entry'}</Text>
      </Pressable>

      {saved && (
        <Text style={{ color: colors.success, fontSize: 12, textAlign: 'center', marginTop: 10 }}>
          Your entry is saved. Switch to "Past Entries" to browse your journal.
        </Text>
      )}
    </ScrollView>
  );
}

function JournalHistoryView({ refreshKey }: { refreshKey: number }) {
  const colors = useColors();
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [search, setSearch] = useState('');

  const loadHistory = async () => {
    try {
      const entries = await DisciplineRepo.getAllJournalReflections();
      const filtered = entries
        .filter(e => !!e.content && e.content.trim().length > 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(filtered);
    } catch {}
  };

  useEffect(() => { loadHistory(); }, [refreshKey]);
  // Also reload every time the history view mounts / user focuses the tab
  useFocusEffect(useCallback(() => { loadHistory(); }, []));

  const visible = history.filter(h =>
    !search.trim() || h.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 20, paddingBottom: 8 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>Past Entries</Text>
        <TextInput
          placeholder="Search entries..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
            borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: colors.foreground, fontSize: 13,
          }}
        />
        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 8 }}>
          {history.length} {history.length === 1 ? 'entry' : 'entries'} total
          {search.trim() ? ` · ${visible.length} match` : ''}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        {visible.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 30 }}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📔</Text>
            <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center' }}>
              {history.length === 0
                ? "No past entries yet. Write today's reflection to start building your journal."
                : 'No entries match your search.'}
            </Text>
          </View>
        ) : (
          visible.map((h, i) => <JournalHistoryCard key={h.date} entry={h} onPress={() => {}} />)
        )}
      </ScrollView>
    </View>
  );
}

function JournalScreen() {
  const colors = useColors();
  const [journalView, setJournalView] = useState<'write' | 'history'>('write');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, gap: 8 }}>
        {([
          { k: 'write' as const, label: '✍️ Write Today' },
          { k: 'history' as const, label: '📚 Past Entries' },
        ]).map(tab => (
          <Pressable key={tab.k} onPress={() => setJournalView(tab.k)}
            style={({ pressed }) => ({
              flex: 1, paddingVertical: 10, borderRadius: 12,
              backgroundColor: journalView === tab.k ? colors.primary : colors.surface,
              borderWidth: 1, borderColor: journalView === tab.k ? colors.primary : colors.border,
              alignItems: 'center', opacity: pressed ? 0.85 : 1,
            })}>
            <Text style={{
              color: journalView === tab.k ? '#FFFFFF' : colors.foreground,
              fontWeight: '700', fontSize: 12,
            }}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
      {journalView === 'write'
        ? <JournalWriteView onSaved={() => setRefreshKey(k => k + 1)} />
        : <JournalHistoryView refreshKey={refreshKey} />}
    </View>
  );
}

// ─── Knowledge Base ────────────────────────────────────────────────────────────

function KnowledgeScreen() {
  const colors = useColors();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    const article = KNOWLEDGE_ARTICLES.find(a => a.id === selectedId);
    if (!article) return null;

    const renderMarkdown = (text: string) => {
      return text.split('\n').map((line, i) => {
        if (line.startsWith('# ')) return <Text key={i} style={{ fontSize: 22, fontWeight: '900', color: colors.foreground, marginTop: 16, marginBottom: 12 }}>{line.replace('# ', '')}</Text>;
        if (line.startsWith('## ')) return <Text key={i} style={{ fontSize: 18, fontWeight: '800', color: colors.primary, marginTop: 24, marginBottom: 10 }}>{line.replace('## ', '')}</Text>;
        if (line.startsWith('**') && line.endsWith('**')) return <Text key={i} style={{ fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>{line.replace(/\*\*/g, '')}</Text>;
        if (line.startsWith('- ')) return <Text key={i} style={{ color: colors.muted, fontSize: 14, marginLeft: 16, marginBottom: 6, lineHeight: 22 }}>• {line.replace('- ', '')}</Text>;
        if (line.trim() === '') return <View key={i} style={{ height: 12 }} />;

        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <Text key={i} style={{ color: colors.muted, fontSize: 14, marginBottom: 12, lineHeight: 22 }}>
            {parts.map((p, j) => p.startsWith('**')
              ? <Text key={j} style={{ fontWeight: '700', color: colors.foreground }}>{p.replace(/\*\*/g, '')}</Text>
              : p)}
          </Text>
        );
      });
    };

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Pressable onPress={() => setSelectedId(null)} style={({ pressed }) => ({
          flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8, opacity: pressed ? 0.7 : 1,
        })}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>←</Text>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Back</Text>
        </Pressable>

        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground, marginBottom: 6 }}>{article.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>{article.category}</Text>
          </View>
          <Text style={{ color: colors.muted, fontSize: 11 }}>{article.readingTime} min read</Text>
        </View>

        {renderMarkdown(article.content)}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 16 }}>Read these to understand the science behind your transformation plan. Knowledge breeds conviction.</Text>

      {KNOWLEDGE_ARTICLES.map(a => (
        <Pressable key={a.id} onPress={() => setSelectedId(a.id)}
          style={({ pressed }) => ({
            backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12,
            borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1,
            flexDirection: 'row', alignItems: 'center',
          })}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>{a.category}</Text>
              <Text style={{ color: colors.muted, fontSize: 10 }}>• {a.readingTime}m read</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>{a.title}</Text>
          </View>
          <Text style={{ color: colors.muted, fontSize: 16 }}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Main Discipline Screen ───────────────────────────────────────────────────

export default function DisciplineScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>('dopamine');

  useFocusEffect(useCallback(() => {
    NavRepo.consumePendingSubTab('/(tabs)/discipline').then((pending) => {
      if (pending && (pending === 'dopamine' || pending === 'journal' || pending === 'knowledge')) {
        setActiveTab(pending);
      }
    });
  }, []));

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: colors.foreground }}>Discipline 🧠</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Mindset · Reflection · Learning</Text>
        </View>

        <SubTabBar tabs={TABS} activeTab={activeTab as string} onTabChange={(k) => setActiveTab(k as Tab)} />

        <View style={{ flex: 1 }}>
          {activeTab === 'dopamine' && <DopamineResetScreen />}
          {activeTab === 'journal' && <JournalScreen />}
          {activeTab === 'knowledge' && <KnowledgeScreen />}
        </View>
      </View>
    </ScreenContainer>
  );
}
