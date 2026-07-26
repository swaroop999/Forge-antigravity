import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, Alert, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyLogRepo } from '@/lib/db/database';
import { HABITS, KNOWLEDGE_ARTICLES, DEFAULT_MILESTONES, type Habit } from '@/lib/db/seeds';

const { width } = Dimensions.get('window');

type Tab = 'habits' | 'dopamine' | 'journal' | 'milestones' | 'bodylang' | 'knowledge' | 'commitment';
const TABS = [
  { key: 'habits' as Tab, label: 'Habits', icon: '✅' },
  { key: 'dopamine' as Tab, label: 'Dopamine', icon: '🧠' },
  { key: 'journal' as Tab, label: 'Journal', icon: '📔' },
  { key: 'milestones' as Tab, label: 'Milestones', icon: '🏆' },
  { key: 'bodylang' as Tab, label: 'Body Lang', icon: '🧍' },
  { key: 'knowledge' as Tab, label: 'Knowledge', icon: '📚' },
  { key: 'commitment' as Tab, label: 'Commitment', icon: '📜' },
];

// ─── Habits Tracker ────────────────────────────────────────────────────────────

function HabitsScreen() {
  const colors = useColors();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const todayStr = new Date().toISOString().split('T')[0];
  const isWeekend = [0, 6].includes(new Date().getDay());

  useEffect(() => {
    AsyncStorage.getItem('habits_' + todayStr).then(s => { if (s) setDone(JSON.parse(s)); });
  }, []);

  const toggle = async (id: string) => {
    const n = { ...done, [id]: !done[id] };
    setDone(n);
    await AsyncStorage.setItem('habits_' + todayStr, JSON.stringify(n));
  };

  const categories = ['sleep', 'dopamine', 'nutrition', 'training', 'appearance'] as const;
  const categoryNames = { sleep: 'Sleep & Wake', dopamine: 'Dopamine & Mind', nutrition: 'Nutrition & Diet', training: 'Training & Posture', appearance: 'Appearance & Grooming' };
  const categoryColors = { sleep: '#A78BFA', dopamine: '#F87171', nutrition: '#34D399', training: '#60A5FA', appearance: '#F472B6' };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.primary, marginBottom: 8 }}>32 Core Habits</Text>
        <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
          Your entire transformation is built on these 32 daily actions. Perfection isn't required, but consistency is. Complete 80%+ daily to guarantee success.
        </Text>
      </View>

      {categories.map(cat => {
        const catHabits = HABITS.filter(h => h.category === cat && (!isWeekend || !h.weekdayOnly));
        if (catHabits.length === 0) return null;
        
        const completed = catHabits.filter(h => done[h.id]).length;
        const total = catHabits.length;
        
        return (
          <View key={cat} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: categoryColors[cat] }}>{categoryNames[cat]}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700' }}>{completed}/{total}</Text>
            </View>
            
            {catHabits.map((habit, i) => (
              <Pressable key={habit.id} onPress={() => toggle(habit.id)} style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                borderBottomWidth: i < catHabits.length - 1 ? 1 : 0, borderBottomColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              })}>
                <View style={{
                  width: 22, height: 22, borderRadius: 11,
                  backgroundColor: done[habit.id] ? categoryColors[cat] : 'transparent',
                  borderWidth: 2, borderColor: done[habit.id] ? categoryColors[cat] : colors.border,
                  marginRight: 12, alignItems: 'center', justifyContent: 'center',
                }}>
                  {done[habit.id] && <Text style={{ fontSize: 11, color: '#000', fontWeight: '800' }}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: done[habit.id] ? colors.muted : colors.foreground, fontSize: 13, textDecorationLine: done[habit.id] ? 'line-through' : 'none' }}>
                    {isWeekend && habit.weekendVariant ? habit.weekendVariant : habit.name}
                  </Text>
                  {habit.description && <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{habit.description}</Text>}
                </View>
              </Pressable>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── Dopamine Reset ────────────────────────────────────────────────────────────

function DopamineResetScreen() {
  const colors = useColors();
  const [pornStreak, setPornStreak] = useState(0);
  const [socialStreak, setSocialStreak] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('streak_porn').then(s => { if (s) setPornStreak(parseInt(s)); });
    AsyncStorage.getItem('streak_social').then(s => { if (s) setSocialStreak(parseInt(s)); });
  }, []);

  const resetStreak = (type: 'porn' | 'social') => {
    Alert.alert('Reset Streak', `Are you sure you want to reset your ${type} streak?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset (I Relapsed)', style: 'destructive', onPress: async () => {
        if (type === 'porn') { setPornStreak(0); await AsyncStorage.setItem('streak_porn', '0'); }
        else { setSocialStreak(0); await AsyncStorage.setItem('streak_social', '0'); }
      }}
    ]);
  };

  const addDay = async (type: 'porn' | 'social') => {
    if (type === 'porn') {
      const n = pornStreak + 1;
      setPornStreak(n);
      await AsyncStorage.setItem('streak_porn', n.toString());
    } else {
      const n = socialStreak + 1;
      setSocialStreak(n);
      await AsyncStorage.setItem('streak_social', n.toString());
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
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    AsyncStorage.getItem('journal_' + today).then(s => { if (s) { setEntry(s); setSaved(true); } });
  }, []);

  const saveEntry = async () => {
    if (!entry.trim()) return;
    await AsyncStorage.setItem('journal_' + today, entry);
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
        <Text style={{ color: '#000', fontWeight: '800', fontSize: 16 }}>{saved ? '✓ Saved' : 'Save Entry'}</Text>
      </Pressable>
    </ScrollView>
  );
}

// ─── Milestones ────────────────────────────────────────────────────────────────

function MilestonesScreen() {
  const colors = useColors();
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES.map(m => ({ ...m, completed: false })));

  useEffect(() => {
    AsyncStorage.getItem('forge_milestones').then(s => {
      if (s) setMilestones(JSON.parse(s));
    });
  }, []);

  const toggle = async (id: string) => {
    const ms = milestones.map(m => m.id === id ? { ...m, completed: !m.completed } : m);
    setMilestones(ms);
    await AsyncStorage.setItem('forge_milestones', JSON.stringify(ms));
  };

  const phases = [
    { title: 'Phase 1: 30-Day Foundation', days: 30, color: colors.primary },
    { title: 'Phase 2: 90-Day Build', days: 90, color: colors.warning },
    { title: 'Phase 3: 365-Day Maximize', days: 365, color: colors.success },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {phases.map(phase => {
        const phaseMs = milestones.filter(m => m.days === phase.days);
        const done = phaseMs.filter(m => m.completed).length;
        const total = phaseMs.length;
        const pct = Math.round((done / total) * 100) || 0;
        
        return (
          <View key={phase.days} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: phase.color }}>{phase.title}</Text>
              <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700' }}>{pct}%</Text>
            </View>
            
            <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
              <View style={{ height: 8, backgroundColor: phase.color, borderRadius: 4, width: `${pct}%` }} />
            </View>

            {phaseMs.map((m, i) => (
              <Pressable key={m.id} onPress={() => toggle(m.id)} style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                borderBottomWidth: i < phaseMs.length - 1 ? 1 : 0, borderBottomColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              })}>
                <View style={{
                  width: 22, height: 22, borderRadius: 6,
                  backgroundColor: m.completed ? phase.color : 'transparent',
                  borderWidth: 2, borderColor: m.completed ? phase.color : colors.border,
                  marginRight: 12, alignItems: 'center', justifyContent: 'center',
                }}>
                  {m.completed && <Text style={{ fontSize: 11, color: '#000', fontWeight: '800' }}>✓</Text>}
                </View>
                <Text style={{ color: m.completed ? colors.muted : colors.foreground, fontSize: 13, flex: 1, textDecorationLine: m.completed ? 'line-through' : 'none' }}>
                  {m.title}
                </Text>
              </Pressable>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── Body Language ─────────────────────────────────────────────────────────────

function BodyLanguageScreen() {
  const colors = useColors();
  
  const sections = [
    {
      title: 'Walk & Posture',
      points: [
        'Slow down. Rushing signals anxiety and low status.',
        'Chest up, shoulders pulled back and down.',
        'Take up space when sitting (man-spread slightly, arm on adjacent chair).',
        'Keep hands out of pockets. Thumbs out if in pockets.',
      ]
    },
    {
      title: 'Eye Contact',
      points: [
        'Maintain 70% eye contact during conversations.',
        'When looking away, look horizontally, not down (looking down signals submissiveness).',
        'Hold eye contact 1 second longer than comfortable.',
        'Blink less frequently when making a serious point.',
      ]
    },
    {
      title: 'Voice & Speech',
      points: [
        'Speak 10% slower than you think you should.',
        'Speak from the chest (diaphragm), not the throat.',
        'Pause before answering questions. Silence is power.',
        'Eliminate filler words (um, ah, like). Replace them with silence.',
      ]
    }
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: 8 }}>The Science of Presence</Text>
        <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>
          Your body language dictates how others perceive you before you speak, and dictates how you perceive yourself (embodied cognition).
        </Text>
      </View>

      {sections.map((section, i) => (
        <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.foreground, marginBottom: 12 }}>{section.title}</Text>
          {section.points.map((p, j) => (
            <View key={j} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
              <Text style={{ color: colors.primary, marginRight: 8, fontSize: 14 }}>•</Text>
              <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18, flex: 1 }}>{p}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
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

// ─── Commitment Letter ─────────────────────────────────────────────────────────

function CommitmentScreen() {
  const colors = useColors();
  
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <View style={{ backgroundColor: '#1C1917', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#444' }}>
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 24, textAlign: 'center' }}>DECLARATION</Text>
        
        <Text style={{ color: '#D4D4D8', fontSize: 14, lineHeight: 24, marginBottom: 16 }}>
          I accept that I am currently not the man I want to be. My choices, my laziness, and my excuses have built the body and life I have today.
        </Text>
        
        <Text style={{ color: '#D4D4D8', fontSize: 14, lineHeight: 24, marginBottom: 16 }}>
          Starting now, I take absolute responsibility. No one is coming to save me. No one cares if I fail. If I want respect, I must build a respectable vessel.
        </Text>
        
        <Text style={{ color: '#D4D4D8', fontSize: 14, lineHeight: 24, marginBottom: 16 }}>
          I commit to this 365-day protocol. I will eat when I am not hungry. I will train when I am tired. I will apply minoxidil when I am exhausted. I will sleep when I want to scroll.
        </Text>
        
        <Text style={{ color: '#D4D4D8', fontSize: 14, lineHeight: 24, marginBottom: 24 }}>
          I will not negotiate with weakness. I will forge myself in the fire of discipline.
        </Text>
        
        <View style={{ height: 1, backgroundColor: '#444', marginBottom: 24 }} />
        
        <Text style={{ color: colors.primary, fontSize: 12, textAlign: 'center', fontStyle: 'italic' }}>Read this out loud whenever you feel like giving up.</Text>
      </View>
    </ScrollView>
  );
}

// ─── Main Discipline Screen ───────────────────────────────────────────────────

export default function DisciplineScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>('habits');

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: colors.foreground }}>Discipline 🧠</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Habits · Mindset · Knowledge</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingVertical: 10, maxHeight: 56 }}>
          {TABS.map(tab => (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: activeTab === tab.key ? colors.primary : colors.surface,
                borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 6,
                borderWidth: 1, borderColor: activeTab === tab.key ? colors.primary : colors.border,
              }}>
              <Text style={{ fontSize: 12 }}>{tab.icon}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: activeTab === tab.key ? '#000' : colors.foreground }}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ flex: 1 }}>
          {activeTab === 'habits' && <HabitsScreen />}
          {activeTab === 'dopamine' && <DopamineResetScreen />}
          {activeTab === 'journal' && <JournalScreen />}
          {activeTab === 'milestones' && <MilestonesScreen />}
          {activeTab === 'bodylang' && <BodyLanguageScreen />}
          {activeTab === 'knowledge' && <KnowledgeScreen />}
          {activeTab === 'commitment' && <CommitmentScreen />}
        </View>
      </View>
    </ScreenContainer>
  );
}
