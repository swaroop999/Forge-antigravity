import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, Alert , RefreshControl} from "react-native";
import { ScreenContainer } from '@/components/screen-container';
import { SubTabBar } from '@/components/sub-tab-bar';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyLogRepo } from '@/lib/db/database';
import { SKINCARE_AM, SKINCARE_PM, PM_ACTIVES_ROTATION } from '@/lib/db/seeds';

type Tab = 'skincare' | 'tanremoval' | 'hair' | 'grooming' | 'bodycare' | 'style' | 'looksmax' | 'facelog';
const TABS = [
  { key: 'skincare' as Tab, label: 'Skincare', icon: '🧴' },
  { key: 'tanremoval' as Tab, label: 'Tan', icon: '☀️' },
  { key: 'hair' as Tab, label: 'Hair', icon: '💈' },
  { key: 'grooming' as Tab, label: 'Grooming', icon: '✂️' },
  { key: 'bodycare' as Tab, label: 'Body', icon: '🧼' },
  { key: 'style' as Tab, label: 'Style', icon: '👔' },
  { key: 'looksmax' as Tab, label: 'Looksmax', icon: '⭐' },
  { key: 'facelog' as Tab, label: 'Face Log', icon: '📸' },
];

// ─── Skincare ─────────────────────────────────────────────────────────────────

function SkincareScreen() {
  const colors = useColors();
  const [amDone, setAmDone] = useState<Record<number, boolean>>({});
  const [pmDone, setPmDone] = useState<Record<number, boolean>>({});
  const today = new Date().toISOString().split('T')[0];
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const todayActive = PM_ACTIVES_ROTATION[dayName] || 'Cleanser + Moisturizer Only';

  const [amStreak, setAmStreak] = useState(0);
  const [pmStreak, setPmStreak] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('skincare_am_' + today).then(s => { if (s) setAmDone(JSON.parse(s)); });
    AsyncStorage.getItem('skincare_pm_' + today).then(s => { if (s) setPmDone(JSON.parse(s)); });

    const fetchStreaks = async () => {
      let amCount = 0;
      let pmCount = 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const log = await DailyLogRepo.getForDate(dateStr);
        if (log && log.skincareAM) amCount++; else if (i !== 0) break;
      }
      for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const log = await DailyLogRepo.getForDate(dateStr);
        if (log && log.skincarePM) pmCount++; else if (i !== 0) break;
      }
      setAmStreak(amCount);
      setPmStreak(pmCount);
    };
    fetchStreaks();
  }, []);

  const toggleAM = async (step: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const n = { ...amDone, [step]: !amDone[step] };
    setAmDone(n);
    await AsyncStorage.setItem('skincare_am_' + today, JSON.stringify(n));
    // Update daily log
    const amComplete = SKINCARE_AM.every((_, i) => n[i]);
    let log = await DailyLogRepo.getForDate(today);
    if (!log) log = await DailyLogRepo.getDefault(today, []);
    log.skincareAM = amComplete;
    await DailyLogRepo.save(log);
  };

  const togglePM = async (step: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const n = { ...pmDone, [step]: !pmDone[step] };
    setPmDone(n);
    await AsyncStorage.setItem('skincare_pm_' + today, JSON.stringify(n));
    const pmComplete = SKINCARE_PM.every((_, i) => n[i]);
    let log = await DailyLogRepo.getForDate(today);
    if (!log) log = await DailyLogRepo.getDefault(today, []);
    log.skincarePM = pmComplete;
    await DailyLogRepo.save(log);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Warnings */}
      <View style={{ backgroundColor: colors.error + '15', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.error + '40' }}>
        <Text style={{ color: colors.error, fontWeight: '700', marginBottom: 6 }}>❌ STOP Immediately</Text>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
          • Mometasone (Humasone) — steroid, thins face skin permanently{'\n'}
          • Touching face with hands{'\n'}
          • Picking pimples — scars that take months to heal{'\n'}
          • Phone screen on right cheek — clean phone daily{'\n'}
          • Helmet visor touching face without cleaning
        </Text>
      </View>

      {/* Today's Active */}
      <View style={{ backgroundColor: colors.primary + '20', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.primary + '50' }}>
        <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 4 }}>🌙 Tonight's Active ({dayName})</Text>
        <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 18 }}>{todayActive}</Text>
      </View>

      {/* AM Routine */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFB800' }}>☀️ AM Routine</Text>
          <View style={{ backgroundColor: colors.success + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>🔥 {amStreak} day streak</Text>
          </View>
        </View>
        {SKINCARE_AM.map((step, i) => (
          <Pressable key={i} onPress={() => toggleAM(i)}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10,
              borderBottomWidth: i < SKINCARE_AM.length - 1 ? 1 : 0, borderBottomColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            })}>
            <View style={{
              width: 22, height: 22, borderRadius: 11,
              backgroundColor: amDone[i] ? colors.success : 'transparent',
              borderWidth: 2, borderColor: amDone[i] ? colors.success : colors.border,
              marginRight: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2,
            }}>
              {amDone[i] && <Check size={14} color="#000" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: amDone[i] ? colors.success : colors.foreground, fontSize: 13, textDecorationLine: amDone[i] ? 'line-through' : 'none' }}>
                {step.step}. {step.product}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{step.action}</Text>
              {step.waitAfter && <Text style={{ color: colors.warning, fontSize: 11, marginTop: 2 }}>⏱ {step.waitAfter}</Text>}
            </View>
          </Pressable>
        ))}
      </View>

      {/* PM Routine */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#A78BFA' }}>🌙 PM Routine</Text>
          <View style={{ backgroundColor: colors.success + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>🔥 {pmStreak} day streak</Text>
          </View>
        </View>
        {SKINCARE_PM.map((step, i) => (
          <Pressable key={i} onPress={() => togglePM(i)}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10,
              borderBottomWidth: i < SKINCARE_PM.length - 1 ? 1 : 0, borderBottomColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            })}>
            <View style={{
              width: 22, height: 22, borderRadius: 11,
              backgroundColor: pmDone[i] ? colors.success : 'transparent',
              borderWidth: 2, borderColor: pmDone[i] ? colors.success : colors.border,
              marginRight: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2,
            }}>
              {pmDone[i] && <Check size={14} color="#000" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: pmDone[i] ? colors.success : (step.product === 'WAIT' ? colors.warning : colors.foreground), fontSize: 13, textDecorationLine: pmDone[i] ? 'line-through' : 'none' }}>
                {step.step}. {step.product}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{step.action}</Text>
              {step.waitAfter && <Text style={{ color: colors.warning, fontSize: 11, marginTop: 2 }}>⏱ {step.waitAfter}</Text>}
            </View>
          </Pressable>
        ))}
      </View>

      {/* Weekly Rotation */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>PM Actives Rotation</Text>
        {Object.entries(PM_ACTIVES_ROTATION).map(([day, active]) => (
          <View key={day} style={{
            flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8,
            borderBottomWidth: 1, borderBottomColor: colors.border,
            backgroundColor: day === dayName ? colors.primary + '10' : 'transparent',
            borderRadius: day === dayName ? 8 : 0,
            paddingHorizontal: day === dayName ? 8 : 0,
          }}>
            <Text style={{ width: 80, color: day === dayName ? colors.primary : colors.muted, fontWeight: day === dayName ? '800' : '600', fontSize: 12 }}>{day}</Text>
            <Text style={{ color: day === dayName ? colors.foreground : colors.muted, fontSize: 11, flex: 1 }}>{active}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Tan Removal ─────────────────────────────────────────────────────────────

function TanRemovalScreen() {
  const colors = useColors();
  const [assessment, setAssessment] = useState<Record<string, number>>({});
  const [showAssess, setShowAssess] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('tan_assessment').then(s => { if (s) setAssessment(JSON.parse(s)); });
  }, []);

  const bodyParts = ['Face', 'Neck', 'Arms', 'Hands', 'Legs', 'Feet'];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Assessment */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}>Tan Level Assessment</Text>
          <Pressable onPress={() => setShowAssess(!showAssess)} style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ color: '#000', fontWeight: '700', fontSize: 12 }}>Update</Text>
          </Pressable>
        </View>
        {bodyParts.map(part => {
          const score = assessment[part] || 0;
          const progress = score * 10;
          return (
            <View key={part} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: colors.foreground, fontSize: 13 }}>{part}</Text>
                <Text style={{ color: score >= 7 ? colors.success : score >= 4 ? colors.warning : colors.error, fontWeight: '700', fontSize: 12 }}>
                  {score || '—'}/10
                </Text>
              </View>
              <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{
                  height: 6, borderRadius: 3, width: `${progress}%`,
                  backgroundColor: score >= 7 ? colors.success : score >= 4 ? colors.warning : colors.error,
                }} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Daily Protocol */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>Daily Protocol</Text>
        {[
          { time: 'Morning', steps: ['Apply SPF 50+ on all exposed skin (face, neck, arms)', 'Helmet visor CLOSED when riding'], urgent: true },
          { time: 'Before Commute', steps: ['Dab Alpha Arbutin on dark patches', 'Body SPF on arms/legs if exposed'], urgent: false },
          { time: 'At Night', steps: ['Body oil massage (coconut + lemon drops) on tan areas', 'Ubtan paste on elbows/knees (weekly)', 'Body lotion with niacinamide'], urgent: false },
          { time: 'Weekly (Saturday)', steps: ['Coffee body scrub all over', 'Ubtan face + body pack (leave 20 min)', 'Coconut + rosemary hair oil massage'], urgent: false },
        ].map((p, i) => (
          <View key={i} style={{ marginBottom: 14 }}>
            <Text style={{ color: p.urgent ? colors.error : colors.primary, fontWeight: '700', fontSize: 12, marginBottom: 6 }}>
              {p.urgent ? '❗' : '▸'} {p.time}
            </Text>
            {p.steps.map((step, si) => (
              <Text key={si} style={{ color: colors.muted, fontSize: 12, marginBottom: 3, marginLeft: 12 }}>• {step}</Text>
            ))}
          </View>
        ))}
      </View>

      {/* Products */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>Products to Get</Text>
        {[
          { name: 'Aqualogica SPF 50+ (Face)', purpose: 'Daily sunscreen', priority: 'HIGH' },
          { name: 'Nivea Sun SPF 50 (Body)', purpose: 'Arms/legs daily protection', priority: 'HIGH' },
          { name: 'Mcaffeine Coffee Scrub', purpose: 'Weekly tan removal scrub', priority: 'HIGH' },
          { name: 'Alpha Arbutin 2% (Minimalist)', purpose: 'Tan lightening active', priority: 'HIGH' },
          { name: 'Derma Co Niacinamide Body Lotion', purpose: 'Daily brightening lotion', priority: 'MEDIUM' },
          { name: 'Aloe Vera Gel (Patanjali)', purpose: 'Soothing + brightening base', priority: 'MEDIUM' },
          { name: 'Kojic Acid Soap', purpose: 'Elbows/knees evening', priority: 'LOW' },
        ].map((p, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: i < 6 ? 1 : 0, borderBottomColor: colors.border }}>
            <View style={{
              backgroundColor: p.priority === 'HIGH' ? colors.error + '30' : p.priority === 'MEDIUM' ? colors.warning + '30' : colors.border,
              borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 10, marginTop: 2,
            }}>
              <Text style={{ color: p.priority === 'HIGH' ? colors.error : p.priority === 'MEDIUM' ? colors.warning : colors.muted, fontSize: 9, fontWeight: '700' }}>
                {p.priority}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600' }}>{p.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{p.purpose}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Hair Care ────────────────────────────────────────────────────────────────

function HairCareScreen() {
  const colors = useColors();
  const [minoxDone, setMinoxDone] = useState<{ am: boolean; pm: boolean }>({ am: false, pm: false });
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    AsyncStorage.getItem('minox_' + today).then(s => { if (s) setMinoxDone(JSON.parse(s)); });
  }, []);

  const toggleMinox = async (slot: 'am' | 'pm') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const n = { ...minoxDone, [slot]: !minoxDone[slot] };
    setMinoxDone(n);
    await AsyncStorage.setItem('minox_' + today, JSON.stringify(n));
  };

  const hairWashSchedule = ['Mon', 'Wed', 'Sat'];
  const oilMassageSchedule = ['Sun', 'Wed'];
  const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Minoxidil Tracker */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>Minoxidil 5% Daily Tracker</Text>
        <Text style={{ color: colors.error, fontSize: 11, marginBottom: 12 }}>⚠️ Missing even one day SLOWS regrowth. This is a lifetime commitment.</Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {(['am', 'pm'] as const).map(slot => (
            <Pressable key={slot} onPress={() => toggleMinox(slot)} style={({ pressed }) => ({
              flex: 1, backgroundColor: minoxDone[slot] ? colors.success + '20' : colors.surface,
              borderRadius: 12, padding: 16, alignItems: 'center',
              borderWidth: 2, borderColor: minoxDone[slot] ? colors.success : colors.border,
              opacity: pressed ? 0.8 : 1,
            })}>
              <Text style={{ fontSize: 24 }}>{slot === 'am' ? '☀️' : '🌙'}</Text>
              <Text style={{ color: minoxDone[slot] ? colors.success : colors.foreground, fontWeight: '700', fontSize: 14, marginTop: 8 }}>
                {slot.toUpperCase()} Dose
              </Text>
              <Text style={{ color: minoxDone[slot] ? colors.success : colors.muted, fontSize: 12 }}>
                {minoxDone[slot] ? '✓ Applied' : 'Tap to mark'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 14, padding: 12, backgroundColor: colors.background, borderRadius: 8 }}>
          <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>
            Apply with dropper to scalp (not hair). 1ml per application. Wait 2-4 hours before washing hair. Apply to dry scalp.{'\n\n'}
            Week 1-3: Adjustment period{'\n'}
            Week 4-12: Possible shedding (KEEP GOING — this is good!){'\n'}
            Month 3-6: New growth begins{'\n'}
            Month 6+: Full results visible
          </Text>
        </View>
      </View>

      {/* Wash Schedule */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>Weekly Schedule</Text>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
          const isToday = day === dayAbbr;
          const isWash = hairWashSchedule.includes(day);
          const isOil = oilMassageSchedule.includes(day);
          return (
            <View key={day} style={{
              flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
              borderBottomWidth: 1, borderBottomColor: colors.border,
              backgroundColor: isToday ? colors.primary + '10' : 'transparent',
              borderRadius: isToday ? 8 : 0, paddingHorizontal: isToday ? 8 : 0,
            }}>
              <Text style={{ width: 36, color: isToday ? colors.primary : colors.muted, fontWeight: isToday ? '800' : '600', fontSize: 12 }}>{day}</Text>
              <View style={{ flex: 1, flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {isWash && (
                  <View style={{ backgroundColor: '#60A5FA30', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: '#60A5FA', fontSize: 10, fontWeight: '700' }}>Hair Wash (Nizoral or mild shampoo)</Text>
                  </View>
                )}
                {isOil && (
                  <View style={{ backgroundColor: '#F59E0B30', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: '#F59E0B', fontSize: 10, fontWeight: '700' }}>Oil Massage (coconut + rosemary)</Text>
                  </View>
                )}
                {!isWash && !isOil && (
                  <Text style={{ color: colors.muted, fontSize: 11 }}>Minoxidil only</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Protocol */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>Minoxidil Phase Guide</Text>
        {[
          { phase: 'Weeks 1-3', title: 'Adjustment', desc: 'May feel dry or itchy. Normal. Use as directed.', color: colors.primary },
          { phase: 'Weeks 4-12', title: 'The Dread Shed ⚠️', desc: 'SHEDDING IS EXPECTED. Old weak hairs fall to make way for new. DO NOT STOP.', color: colors.error },
          { phase: 'Months 3-6', title: 'New Growth', desc: 'Thin vellus hairs appear. Looking patchy is normal. Keep going.', color: colors.warning },
          { phase: 'Month 6-12', title: 'Results', desc: 'New hairs thicken and darken. Compare photos.', color: colors.success },
          { phase: 'Month 12+', title: 'Maintenance', desc: 'Continue forever. Stopping = all gains lost within 3-6 months.', color: colors.success },
        ].map((phase, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 10 }}>
            <View style={{ width: 80 }}>
              <Text style={{ color: phase.color, fontWeight: '700', fontSize: 10 }}>{phase.phase}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 12 }}>{phase.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{phase.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Grooming ─────────────────────────────────────────────────────────────────

function GroomingScreen() {
  const colors = useColors();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    AsyncStorage.getItem('grooming_' + today).then(s => { if (s) setDone(JSON.parse(s)); });
  }, []);

  const toggle = async (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const n = { ...done, [key]: !done[key] };
    setDone(n);
    await AsyncStorage.setItem('grooming_' + today, JSON.stringify(n));
  };

  const daily = ['Brush teeth (2 min, AM + PM)', 'Floss (PM)', 'Apply lip balm', 'Wash face (PM cleanser)', 'Hair styled with paste/clay (if going out)', 'Deodorant applied', 'Clean nails check'];
  const weekly = ['Haircut (every 2-3 weeks — textured crop fade)', 'Beard: Clean shave or trim (edge up)', 'Eyebrow cleanup (tweezer — unibrow, upper arch)', 'Ear/nose hair check', 'Exfoliate lips', 'Clean up around hairline'];
  const monthly = ['Full body grooming session', 'Body hair management', 'Get haircut photos for comparison'];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {['Daily', 'Weekly', 'Monthly'].map((freq, fi) => {
        const items = freq === 'Daily' ? daily : freq === 'Weekly' ? weekly : monthly;
        return (
          <View key={freq} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>{freq} Grooming</Text>
            {items.map((item) => {
              const key = freq + item;
              return (
                <Pressable key={item} onPress={() => toggle(key)}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                    borderBottomWidth: 1, borderBottomColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  })}>
                  <View style={{
                    width: 22, height: 22, borderRadius: freq === 'Daily' ? 11 : 4,
                    backgroundColor: done[key] ? colors.success : 'transparent',
                    borderWidth: 2, borderColor: done[key] ? colors.success : colors.border,
                    marginRight: 12, alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done[key] && <Check size={14} color="#000" />}
                  </View>
                  <Text style={{ color: done[key] ? colors.muted : colors.foreground, fontSize: 13, flex: 1, textDecorationLine: done[key] ? 'line-through' : 'none' }}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}

      {/* Hairstyle Guide */}
      <View style={{ backgroundColor: colors.primary + '15', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.primary + '40' }}>
        <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 8 }}>Recommended: Textured Crop with Fade</Text>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
          • Short on sides/back (fade or taper){'\n'}
          • Textured/choppy on top (not flat){'\n'}
          • Product: Matte clay or paste (Beardo, Set Wet){'\n'}
          • Style: Tousled, slightly forward — adds perceived height{'\n\n'}
          Tell barber: "Textured crop with skin fade or low fade. Keep top at 2-3 inches."
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Body Care ─────────────────────────────────────────────────────────────────

function BodyCareScreen() {
  const colors = useColors();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {[
        {
          title: 'Daily Body Care', items: [
            'Shower (lukewarm, not hot — hot dries skin)', 'Body lotion within 3 min of shower (damp skin)',
            'Apply SPF body lotion on exposed areas before going out', 'Deodorant — antiperspirant under arms',
          ]
        },
        {
          title: 'Weekly', items: [
            'Coffee body scrub (Mcaffeine) — Saturday in shower', 'Ubtan pack on elbows and knees (10 min)',
            'Coconut oil massage before Saturday shower', 'Pumice stone on feet/heels if rough',
          ]
        },
        {
          title: 'Elbows & Knees Protocol (Dark Patches)', items: [
            'Kojic acid soap on dark areas daily', 'Scrub vigorously with body scrub once/week',
            'Apply lemon juice + sugar paste, leave 10 min, rinse', 'Moisturize immediately after',
          ]
        },
        {
          title: 'Sun Exposure (Strategic)', items: [
            'Get 15 min morning sun on arms/back BEFORE 10 AM (Vitamin D)', 'Full SPF coverage AFTER 10 AM',
            'Never allow cumulative tanning — the treatment undoes daily progress',
          ]
        },
      ].map((section, si) => (
        <View key={si} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 10 }}>{section.title}</Text>
          {section.items.map((item, i) => (
            <Text key={i} style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>• {item}</Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Style & Wardrobe ─────────────────────────────────────────────────────────

function StyleScreen() {
  const colors = useColors();
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    AsyncStorage.getItem('wardrobe_checklist').then(s => { if (s) setChecklist(JSON.parse(s)); });
  }, []);

  const toggle = async (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const n = { ...checklist, [key]: !checklist[key] };
    setChecklist(n);
    await AsyncStorage.setItem('wardrobe_checklist', JSON.stringify(n));
  };

  const essentials = [
    '2-3 plain white T-shirts (fitted)', '2-3 black T-shirts (fitted)', '1-2 olive/grey T-shirts',
    '2 slim/straight jeans (dark blue, black)', '1 pair chinos (khaki or olive)', '1 pair joggers (black)',
    'White sneakers (clean sole)', 'Black sneakers or Chelsea boots', 'Brown leather or chelsea boots',
    'White button-up shirt', '1 clean hoodie (black or grey)', '1 minimal jacket (bomber or windbreaker)',
    '1 plain belt (black leather)', 'White crew-cut socks', 'Fragrance (1 good one — Dior Sauvage dupe or actual)',
  ];

  const rules = [
    'Fitted > baggy — always',
    'Monochromatic outfits = instant height + style',
    'Less is more — avoid logos, graphics, loud patterns',
    'One statement piece per outfit max',
    'Chelsea boots add 1 inch height invisibly',
    'Short jacket = longer legs = taller appearance',
    'High-waisted pants raise waistline = taller',
    'Colors: Black, White, Navy, Olive, Beige',
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Style Rules */}
      <View style={{ backgroundColor: colors.primary + '15', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.primary + '40' }}>
        <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 10 }}>Style Rules for Your Frame</Text>
        {rules.map((rule, i) => (
          <Text key={i} style={{ color: colors.foreground, fontSize: 12, marginBottom: 5 }}>• {rule}</Text>
        ))}
      </View>

      {/* Wardrobe Checklist */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>Wardrobe Essentials</Text>
        {essentials.map(item => (
          <Pressable key={item} onPress={() => toggle(item)} style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
            borderBottomWidth: 1, borderBottomColor: colors.border, opacity: pressed ? 0.8 : 1,
          })}>
            <View style={{
              width: 22, height: 22, borderRadius: 4,
              backgroundColor: checklist[item] ? colors.success : 'transparent',
              borderWidth: 2, borderColor: checklist[item] ? colors.success : colors.border,
              marginRight: 12, alignItems: 'center', justifyContent: 'center',
            }}>
              {checklist[item] && <Check size={14} color="#000" />}
            </View>
            <Text style={{ color: checklist[item] ? colors.muted : colors.foreground, fontSize: 13, flex: 1, textDecorationLine: checklist[item] ? 'line-through' : 'none' }}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Looksmax ─────────────────────────────────────────────────────────────────

function LooksmaxScreen() {
  const colors = useColors();
  const [expanded, setExpanded] = useState<string | null>(null);

  const strategies = [
    {
      id: 'body', tier: 'TIER 1 HIGHEST IMPACT', name: 'Body Composition (45→62 kg)',
      impact: '10/10', status: 'IN PROGRESS', color: colors.primary,
      desc: 'Your #1 lever. Weight gain at low-moderate fat fills face, builds physique, makes you look present rather than sickly. Every kg gained is visible progress.',
    },
    {
      id: 'shoulders', tier: 'TIER 1 HIGHEST IMPACT', name: 'Shoulder Width (Lateral Raises Daily)',
      impact: '9/10', status: 'IN PROGRESS', color: colors.primary,
      desc: 'Narrow shoulders are your #1 visual weakness. Lateral raises 5-6x/week with progressive overload creates visible width within 3-6 months.',
    },
    {
      id: 'skincare', tier: 'TIER 1 HIGHEST IMPACT', name: 'Skin Health & Tan Removal',
      impact: '9/10', status: 'IN PROGRESS', color: colors.primary,
      desc: 'Clear, even-toned skin is scientifically proven to correlate with perceived attractiveness. Adapalene + SPF + consistency = transformative in 6 months.',
    },
    {
      id: 'sleep', tier: 'TIER 1 HIGHEST IMPACT', name: 'Sleep Optimization (11PM-7:30AM)',
      impact: '8/10', status: 'NEEDS WORK', color: colors.warning,
      desc: '8+ hours is detectable on a face. Studies show well-slept faces are rated significantly more attractive. Also maximizes testosterone and muscle growth.',
    },
    {
      id: 'posture', tier: 'TIER 1 HIGHEST IMPACT', name: 'Posture Correction (+1.5 inches)',
      impact: '8/10', status: 'IN PROGRESS', color: colors.primary,
      desc: '1-1.5 inches of real visual height through daily posture work over 8-12 weeks. Chin tucks, band pull-aparts, dead hangs, face pulls.',
    },
    {
      id: 'grooming', tier: 'TIER 2 MODERATE IMPACT', name: 'Haircut + Grooming',
      impact: '7/10', status: 'ACTION NEEDED', color: colors.warning,
      desc: 'Textured crop fade + styled properly = immediate improvement. Clean shave or shaped stubble. Groomed brows. These are low-hanging fruit.',
    },
    {
      id: 'hair-preservation', tier: 'TIER 2 MODERATE IMPACT', name: 'Hair Preservation (Minoxidil)',
      impact: '7/10', status: 'IN PROGRESS', color: colors.primary,
      desc: 'At 22 with family history, hair preservation is critical. Minoxidil now is worth 10x what it would be at 30.',
    },
    {
      id: 'style', tier: 'TIER 2 MODERATE IMPACT', name: 'Style Upgrade',
      impact: '6/10', status: 'PENDING', color: colors.muted,
      desc: 'Fitted, minimal clothing immediately adds perceived height and attractiveness. Cost effective — a few fitted basics outperform a wardrobe of wrong-fit clothes.',
    },
    {
      id: 'fragrance', tier: 'TIER 2 MODERATE IMPACT', name: 'Fragrance',
      impact: '6/10', status: 'PENDING', color: colors.muted,
      desc: 'Scent creates a persistent positive impression. One quality fragrance (Sauvage, Eros, Bleu de Chanel dupe is fine) is worth it.',
    },
    {
      id: 'mewing', tier: 'TIER 3 LONG TERM', name: 'Mewing (24/7 Oral Posture)',
      impact: '4/10 (12-24 months)', status: 'PRACTICE DAILY', color: colors.muted,
      desc: 'Real but slow. Tongue on roof of mouth 24/7. Improved jaw definition and wider palate over 12-24 months with genuine consistency.',
    },
    {
      id: 'steroids', tier: 'AVOID', name: '❌ Anabolic Steroids',
      impact: 'AVOID', status: 'NEVER', color: colors.error,
      desc: 'At 22 with natural testosterone at peak, steroids: permanently shut down natural T production, accelerate hair loss, damage liver, cause cardiac issues. Destroys long-term health.',
    },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {strategies.map((s) => (
        <Pressable key={s.id} onPress={() => setExpanded(expanded === s.id ? null : s.id)}
          style={({ pressed }) => ({
            backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8,
            borderWidth: 1, borderColor: colors.border,
            borderLeftWidth: 4, borderLeftColor: s.color,
            opacity: pressed ? 0.8 : 1,
          })}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: s.color, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>{s.tier}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.foreground }}>{s.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
              <View style={{
                backgroundColor: s.status === 'IN PROGRESS' ? colors.success + '20' : s.status === 'NEVER' ? colors.error + '20' : colors.warning + '20',
                borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4,
              }}>
                <Text style={{ color: s.status === 'IN PROGRESS' ? colors.success : s.status === 'NEVER' ? colors.error : colors.warning, fontSize: 9, fontWeight: '700' }}>
                  {s.status}
                </Text>
              </View>
              <Text style={{ fontSize: 13 }}>{expanded === s.id ? '▲' : '▼'}</Text>
            </View>
          </View>
          {expanded === s.id && (
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 10, lineHeight: 18 }}>{s.desc}</Text>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Face Log ─────────────────────────────────────────────────────────────────

function FaceLogScreen() {
  const colors = useColors();
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    AsyncStorage.getItem('face_ratings').then(s => { if (s) setRatings(JSON.parse(s)); });
  }, []);

  const metrics = [
    { id: 'skin_clarity', name: 'Skin Clarity', desc: '1=severe acne, 10=completely clear' },
    { id: 'jaw_def', name: 'Jaw Definition', desc: '1=none, 10=sharp defined jaw' },
    { id: 'cheek_full', name: 'Cheek Fullness', desc: '1=hollow/sunken, 10=full' },
    { id: 'eye_area', name: 'Under-Eye Area', desc: '1=severe dark circles, 10=fresh' },
    { id: 'overall_tone', name: 'Skin Tone Evenness', desc: '1=patchy/tanned, 10=even' },
    { id: 'hair_quality', name: 'Hair Health', desc: '1=dandruff/fall, 10=thick/healthy' },
  ];

  const setRating = async (id: string, val: number) => {
    const n = { ...ratings, [id]: val };
    setRatings(n);
    await AsyncStorage.setItem('face_ratings', JSON.stringify(n));
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 16 }}>Rate each metric monthly. Track progression over time. Take photos on the 1st of each month.</Text>

      {metrics.map(metric => {
        const val = ratings[metric.id] || 0;
        return (
          <View key={metric.id} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>{metric.name}</Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 10 }}>{metric.desc}</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <Pressable key={n} onPress={() => setRating(metric.id, n)}
                  style={{
                    flex: 1, height: 30, borderRadius: 6,
                    backgroundColor: n <= val ? (val >= 7 ? colors.success : val >= 4 ? colors.warning : colors.error) : colors.border,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                  <Text style={{ color: n <= val ? '#000' : colors.muted, fontSize: 9, fontWeight: '700' }}>{n}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 8, textAlign: 'right' }}>
              Current: {val}/10
            </Text>
          </View>
        );
      })}

      {/* Photo Protocol */}
      <View style={{ backgroundColor: colors.primary + '15', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.primary + '40' }}>
        <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 8 }}>Monthly Photo Protocol (1st of Each Month)</Text>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
          📸 Take photos on 1st of every month:{'\n'}
          • Front face (neutral, no smile){'\n'}
          • Left profile (90°){'\n'}
          • Right profile (90°){'\n'}
          • Body front (shirt off — weight progress){'\n'}
          • Body side{'\n\n'}
          Same lighting, same time, same location every month.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Main Appearance Screen ────────────────────────────────────────────────────

export default function AppearanceScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>('skincare');

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: colors.foreground }}>Appearance ✨</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Skincare · Hair · Grooming · Style · Looksmax</Text>
        </View>

        <SubTabBar tabs={TABS} activeTab={activeTab as string} onTabChange={(k) => setActiveTab(k as Tab)} />

        <View style={{ flex: 1 }}>
          {activeTab === 'skincare' && <SkincareScreen />}
          {activeTab === 'tanremoval' && <TanRemovalScreen />}
          {activeTab === 'hair' && <HairCareScreen />}
          {activeTab === 'grooming' && <GroomingScreen />}
          {activeTab === 'bodycare' && <BodyCareScreen />}
          {activeTab === 'style' && <StyleScreen />}
          {activeTab === 'looksmax' && <LooksmaxScreen />}
          {activeTab === 'facelog' && <FaceLogScreen />}
        </View>
      </View>
    </ScreenContainer>
  );
}
