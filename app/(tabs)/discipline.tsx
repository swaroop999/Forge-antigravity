import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react-native';
import { ScrollView, View, Text, Pressable, TextInput, Alert, Dimensions , RefreshControl} from "react-native";
import { ScreenContainer } from '@/components/screen-container';
import { SubTabBar } from '@/components/sub-tab-bar';
import { useColors } from '@/hooks/use-colors';
import { DailyLogRepo, DisciplineRepo, MilestoneRepo } from '@/lib/db/database';
import { HABITS, KNOWLEDGE_ARTICLES, DEFAULT_MILESTONES, type Habit } from '@/lib/db/seeds';

const { width } = Dimensions.get('window');

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
          Porn and infinite scrolling give you 1000% dopamine spikes. Real life gives 50-100%. 
          Your brain has adapted to expect 1000%. That's why you procrastinate and feel unmotivated. 
          You MUST starve the cheap dopamine to make real effort feel rewarding again.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        {/* Porn Tracker */}
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

        {/* Social Media Tracker */}
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
          {'\n'}2. <Text style={{ fontWeight: '700' }}>Cold water on face.</Text> Activates mammalian dive reflex, lowers heart rate.
          {'\n'}3. <Text style={{ fontWeight: '700' }}>Change rooms.</Text> Physical movement breaks the mental loop.
          {'\n'}4. <Text style={{ fontWeight: '700' }}>Talk to AI Coach.</Text> Hit the "I want to relapse" quick prompt.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Journal ───────────────────────────────────────────────────────────────────

function JournalScreen() {
  const colors = useColors();
  const [entry, setEntry] = useState('');
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<{ date: string; content: string }[]>([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    DisciplineRepo.getJournalReflection(today).then(s => { if (s) { setEntry(s); setSaved(true); } });
    
    // Load history
    const loadHistory = async () => {
      try {
        const entries = await DisciplineRepo.getAllJournalReflections();
        const filtered = entries
          .filter(e => e.date !== today)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(filtered);
      } catch (e) {}
    };
    loadHistory();
  }, []);

  const saveEntry = async () => {
    if (!entry.trim()) return;
    await DisciplineRepo.setJournalReflection(today, entry);
    setSaved(true);
    Alert.alert('Saved', 'Journal entry saved for today.');
  };

  const prompts = [
    "What did I do well today?",
    "Where did my discipline slip?",
    "What is one thing I must accomplish tomorrow?",
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>Daily Reflection — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
      
      <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12, marginBottom: 8 }}>Prompts</Text>
        {prompts.map((p, i) => (
          <Text key={i} style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>• {p}</Text>
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
          minHeight: 250, marginBottom: 16, lineHeight: 22,
        }}
      />

      <Pressable onPress={saveEntry} style={{ backgroundColor: saved ? colors.success : colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}>
        <Text style={{ color: colors.background, fontWeight: '800', fontSize: 16 }}>{saved ? '✓ Saved' : 'Save Entry'}</Text>
      </Pressable>


      {history.length > 0 && (
        <View style={{ marginTop: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}>Past Entries</Text>
            <View style={{ backgroundColor: colors.primary + '22', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{history.length} entries</Text>
            </View>
          </View>
          {history.map((h, i) => (
            <JournalHistoryCard key={i} entry={h} />
          ))}
        </View>
      )}

      {history.length === 0 && saved && (
        <View style={{ marginTop: 24, alignItems: 'center', padding: 16 }}>
          <Text style={{ fontSize: 24, marginBottom: 8 }}>📔</Text>
          <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center' }}>This is your first journal entry. Past entries will appear here over time.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function JournalHistoryCard({ entry }: { entry: { date: string; content: string } }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_LENGTH = 120;
  const needsTruncation = entry.content.length > PREVIEW_LENGTH;

  const formattedDate = (() => {
    try {
      return new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
    } catch { return entry.date; }
  })();

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{formattedDate}</Text>
        <Text style={{ color: colors.muted, fontSize: 10 }}>{entry.content.length} chars</Text>
      </View>
      <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>
        {expanded || !needsTruncation ? entry.content : entry.content.slice(0, PREVIEW_LENGTH) + '…'}
      </Text>
      {needsTruncation && (
        <Pressable onPress={() => setExpanded(!expanded)} style={{ marginTop: 8 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
            {expanded ? '▲ Show less' : '▼ Read full entry'}
          </Text>
        </Pressable>
      )}
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
    
    // Simple markdown parser for the article content
    const renderMarkdown = (text: string) => {
      return text.split('\n').map((line, i) => {
        if (line.startsWith('# ')) return <Text key={i} style={{ fontSize: 22, fontWeight: '900', color: colors.foreground, marginTop: 16, marginBottom: 12 }}>{line.replace('# ', '')}</Text>;
        if (line.startsWith('## ')) return <Text key={i} style={{ fontSize: 18, fontWeight: '800', color: colors.primary, marginTop: 24, marginBottom: 10 }}>{line.replace('## ', '')}</Text>;
        if (line.startsWith('**') && line.endsWith('**')) return <Text key={i} style={{ fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>{line.replace(/\*\*/g, '')}</Text>;
        if (line.startsWith('- ')) return <Text key={i} style={{ color: colors.muted, fontSize: 14, marginLeft: 16, marginBottom: 6, lineHeight: 22 }}>• {line.replace('- ', '')}</Text>;
        if (line.trim() === '') return <View key={i} style={{ height: 12 }} />;
        
        // Handle bolding within lines
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <Text key={i} style={{ color: colors.muted, fontSize: 14, marginBottom: 12, lineHeight: 22 }}>
            {parts.map((p, j) => p.startsWith('**') ? <Text key={j} style={{ fontWeight: '700', color: colors.foreground }}>{p.replace(/\*\*/g, '')}</Text> : p)}
          </Text>
        );
      });
    };

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Pressable onPress={() => setSelectedId(null)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>←</Text>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Back</Text>
        </Pressable>
        
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
            flexDirection: 'row', alignItems: 'center'
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

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: colors.foreground }}>Discipline 🧠</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Dopamine · Journal · Knowledge</Text>
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
