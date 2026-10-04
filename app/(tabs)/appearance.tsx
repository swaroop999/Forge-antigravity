import * as Haptics from "expo-haptics";
import React, { useState, useEffect, useCallback } from 'react';
import { Check, Info, Sparkles, Shield, Sun, Moon } from 'lucide-react-native';
import { ScrollView, View, Text, Pressable, Modal } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '@/components/screen-container';
import { SubTabBar } from '@/components/sub-tab-bar';
import { useColors } from '@/hooks/use-colors';
import { DailyLogRepo, AppearanceRepo, NavRepo } from '@/lib/db/database';
import { SKINCARE_AM, SKINCARE_PM, PM_ACTIVES_ROTATION, type SkincareStep } from '@/lib/db/seeds';

type Tab = 'skincare' | 'tanremoval' | 'hair' | 'bodycare' | 'looksmax';
const TABS = [
  { key: 'skincare' as Tab, label: 'Skincare', icon: '🧴' },
  { key: 'tanremoval' as Tab, label: 'Tan', icon: '☀️' },
  { key: 'hair' as Tab, label: 'Hair', icon: '🌿' },
  { key: 'bodycare' as Tab, label: 'Body', icon: '🧼' },
  { key: 'looksmax' as Tab, label: 'Looksmax', icon: '⭐' },
];

// ─── Skincare Step Detail Modal ────────────────────────────────────────────────

function StepDetailModal({
  step,
  visible,
  onClose,
}: {
  step: SkincareStep | null;
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useColors();
  if (!step) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 22,
            width: '100%',
            maxWidth: 380,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>
                STEP {step.step} INSTRUCTION
              </Text>
              <Text style={{ color: colors.foreground, fontSize: 17, fontWeight: '800', marginTop: 2 }}>
                {step.product}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={{ padding: 4 }}>
              <Text style={{ color: colors.muted, fontSize: 18, fontWeight: '700' }}>✕</Text>
            </Pressable>
          </View>

          {/* Quick Stats Grid */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {step.duration && (
              <View style={{ flex: 1, backgroundColor: colors.background, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '600' }}>⏱ Time Spent</Text>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', marginTop: 2 }}>{step.duration}</Text>
              </View>
            )}
            {step.waitAfter && (
              <View style={{ flex: 1, backgroundColor: colors.background, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.warning, fontSize: 10, fontWeight: '600' }}>⏳ Wait Gap</Text>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', marginTop: 2 }}>{step.waitAfter}</Text>
              </View>
            )}
          </View>

          {/* Rinse Rule */}
          {step.rinseRule && (
            <View style={{
              backgroundColor: step.rinseRule.toLowerCase().includes('rinse') ? '#3B82F620' : colors.primary + '20',
              borderRadius: 10, padding: 10, marginBottom: 14,
              borderWidth: 1, borderColor: step.rinseRule.toLowerCase().includes('rinse') ? '#3B82F650' : colors.primary + '50',
            }}>
              <Text style={{ color: step.rinseRule.toLowerCase().includes('rinse') ? '#60A5FA' : colors.primary, fontWeight: '700', fontSize: 12 }}>
                💧 Rule: {step.rinseRule}
              </Text>
            </View>
          )}

          {/* Target Area */}
          {step.targetArea && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', marginBottom: 2 }}>🎯 TARGET AREA</Text>
              <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '600' }}>{step.targetArea}</Text>
            </View>
          )}

          {/* Detailed Instructions */}
          <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 14, marginBottom: 18 }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>PROCEDURAL DETAILS</Text>
            <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 19 }}>
              {step.procedureDetails || step.action}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Got It</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Skincare Screen ──────────────────────────────────────────────────────────

function SkincareScreen() {
  const colors = useColors();
  const [amDone, setAmDone] = useState<Record<number, boolean>>({});
  const [pmDone, setPmDone] = useState<Record<number, boolean>>({});
  const [selectedStep, setSelectedStep] = useState<SkincareStep | null>(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [showPigmentGuide, setShowPigmentGuide] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const todayActive = PM_ACTIVES_ROTATION[dayName] || 'Cleanse + Nivea Soft Only';

  const [amStreak, setAmStreak] = useState(0);
  const [pmStreak, setPmStreak] = useState(0);

  useEffect(() => {
    AppearanceRepo.getSkincareAM(today).then(setAmDone);
    AppearanceRepo.getSkincarePM(today).then(setPmDone);

    const fetchStreaks = async () => {
      const logs = await DailyLogRepo.getAll();
      const logsMap = new Map(logs.map(log => [log.date, log]));
      
      let amCount = 0;
      let pmCount = 0;
      
      for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const log = logsMap.get(dateStr);
        if (log && log.skincareAM) amCount++; else if (i !== 0) break;
      }
      
      for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const log = logsMap.get(dateStr);
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
    await AppearanceRepo.setSkincareAM(today, n);
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
    await AppearanceRepo.setSkincarePM(today, n);
    const pmComplete = SKINCARE_PM.every((_, i) => n[i]);
    let log = await DailyLogRepo.getForDate(today);
    if (!log) log = await DailyLogRepo.getDefault(today, []);
    log.skincarePM = pmComplete;
    await DailyLogRepo.save(log);
  };

  const openStepInfo = (step: SkincareStep) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStep(step);
    setInfoModalVisible(true);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Step Detail Modal */}
      <StepDetailModal
        step={selectedStep}
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      />

      {/* Safety Alert */}
      <View style={{ backgroundColor: colors.error + '15', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.error + '40' }}>
        <Text style={{ color: colors.error, fontWeight: '700', fontSize: 13, marginBottom: 6 }}>❌ STRICT CONTRAINDICATIONS</Text>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
          • <Text style={{ fontWeight: '700' }}>Humasone (Mometasone):</Text> Potent corticosteroid. Keep completely off face to prevent permanent dermal thinning, telangiectasia, and rebound rosacea.{'\n'}
          • <Text style={{ fontWeight: '700' }}>Benzomycin:</Text> Use clean Q-tip on active pimples ONLY. Do NOT spread on cheeks or dark spots.{'\n'}
          • Never apply Adapalene on damp skin — wait 10-15 minutes after washing.
        </Text>
      </View>

      {/* Pigmentation Protocol Clarification Accordion */}
      <Pressable
        onPress={() => setShowPigmentGuide(!showPigmentGuide)}
        style={({ pressed }) => ({
          backgroundColor: colors.primary + '18',
          borderRadius: 14, padding: 14, marginBottom: 16,
          borderWidth: 1, borderColor: colors.primary + '45',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Sparkles size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>
              Moustache Patch & Full Face Pigmentation Guide
            </Text>
          </View>
          <Text style={{ color: colors.primary, fontSize: 14 }}>{showPigmentGuide ? '▲' : '▼'}</Text>
        </View>
        {showPigmentGuide && (
          <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.primary + '30' }}>
            <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
              <Text style={{ fontWeight: '700', color: colors.primary }}>Does this routine treat only the patch or the entire face?{'\n'}</Text>
              It treats <Text style={{ fontWeight: '700' }}>BOTH</Text> simultaneously! The patch beside your moustache had localized trauma/inflammation causing concentrated melanin, while chin, lips, and cheeks have diffuse post-inflammatory hyperpigmentation (PIH).{'\n\n'}
              • <Text style={{ fontWeight: '700' }}>Alpha Arbutin 2%:</Text> Dabbed specifically on the dark patch beside moustache and mouth perimeter to halt tyrosinase.{'\n'}
              • <Text style={{ fontWeight: '700' }}>10% Niacinamide:</Text> Applied across entire face to stop pigment transfer and balance tone.{'\n'}
              • <Text style={{ fontWeight: '700' }}>Adapalene 0.1%:</Text> Applied thinly across full face at night to force rapid turnover of pigmented cells.{'\n'}
              • <Text style={{ fontWeight: '700' }}>Aqualogica SPF 50+:</Text> Full face protection every morning so UV does not re-darken healing zones.
            </Text>
          </View>
        )}
      </Pressable>

      {/* Tonight's Active */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.primary + '40', borderLeftWidth: 4, borderLeftColor: colors.primary }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Moon size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>Tonight's PM Active ({dayName})</Text>
        </View>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>{todayActive}</Text>
      </View>

      {/* AM Routine */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sun size={18} color={colors.warning} />
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.warning }}>AM Routine</Text>
          </View>
          <View style={{ backgroundColor: colors.success + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>🔥 {amStreak} day streak</Text>
          </View>
        </View>

        {SKINCARE_AM.map((step, i) => (
          <View
            key={i}
            style={{
              paddingVertical: 10,
              borderBottomWidth: i < SKINCARE_AM.length - 1 ? 1 : 0,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Pressable
                onPress={() => toggleAM(i)}
                style={{
                  width: 22, height: 22, borderRadius: 11,
                  backgroundColor: amDone[i] ? colors.success : 'transparent',
                  borderWidth: 2, borderColor: amDone[i] ? colors.success : colors.border,
                  marginRight: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2,
                }}
              >
                {amDone[i] && <Check size={14} color="#FFFFFF" />}
              </Pressable>

              <Pressable onPress={() => toggleAM(i)} style={{ flex: 1 }}>
                <Text style={{
                  fontWeight: '700',
                  color: amDone[i] ? colors.success : colors.foreground,
                  fontSize: 13,
                  textDecorationLine: amDone[i] ? 'line-through' : 'none',
                }}>
                  {step.step}. {step.product}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{step.action}</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                  {step.duration && <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '600' }}>⏱ {step.duration}</Text>}
                  {step.waitAfter && <Text style={{ color: colors.warning, fontSize: 10, fontWeight: '600' }}>⏳ {step.waitAfter}</Text>}
                </View>
              </Pressable>

              {/* Info Button */}
              <Pressable
                onPress={() => openStepInfo(step)}
                hitSlop={8}
                style={({ pressed }) => ({
                  backgroundColor: colors.primary + '18',
                  borderRadius: 16,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  opacity: pressed ? 0.6 : 1,
                  marginLeft: 8,
                })}
              >
                <Info size={11} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>Info</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {/* PM Routine */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Moon size={18} color={colors.primary} />
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary }}>PM Routine</Text>
          </View>
          <View style={{ backgroundColor: colors.success + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>🔥 {pmStreak} day streak</Text>
          </View>
        </View>

        {SKINCARE_PM.map((step, i) => (
          <View
            key={i}
            style={{
              paddingVertical: 10,
              borderBottomWidth: i < SKINCARE_PM.length - 1 ? 1 : 0,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Pressable
                onPress={() => togglePM(i)}
                style={{
                  width: 22, height: 22, borderRadius: 11,
                  backgroundColor: pmDone[i] ? colors.success : 'transparent',
                  borderWidth: 2, borderColor: pmDone[i] ? colors.success : colors.border,
                  marginRight: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2,
                }}
              >
                {pmDone[i] && <Check size={14} color="#FFFFFF" />}
              </Pressable>

              <Pressable onPress={() => togglePM(i)} style={{ flex: 1 }}>
                <Text style={{
                  fontWeight: '700',
                  color: pmDone[i] ? colors.success : colors.foreground,
                  fontSize: 13,
                  textDecorationLine: pmDone[i] ? 'line-through' : 'none',
                }}>
                  {step.step}. {step.product}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{step.action}</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                  {step.duration && <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '600' }}>⏱ {step.duration}</Text>}
                  {step.waitAfter && <Text style={{ color: colors.warning, fontSize: 10, fontWeight: '600' }}>⏳ {step.waitAfter}</Text>}
                </View>
              </Pressable>

              {/* Info Button */}
              <Pressable
                onPress={() => openStepInfo(step)}
                hitSlop={8}
                style={({ pressed }) => ({
                  backgroundColor: colors.primary + '18',
                  borderRadius: 16,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  opacity: pressed ? 0.6 : 1,
                  marginLeft: 8,
                })}
              >
                <Info size={11} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>Info</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {/* Weekly PM Actives Rotation */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>PM Actives Rotation</Text>
        {Object.entries(PM_ACTIVES_ROTATION).map(([day, active]) => (
          <View key={day} style={{
            flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8,
            borderBottomWidth: 1, borderBottomColor: colors.border,
            backgroundColor: day === dayName ? colors.primary + '15' : 'transparent',
            borderRadius: day === dayName ? 8 : 0,
            paddingHorizontal: day === dayName ? 8 : 0,
          }}>
            <Text style={{ width: 80, color: day === dayName ? colors.primary : colors.muted, fontWeight: day === dayName ? '800' : '600', fontSize: 12 }}>{day}</Text>
            <Text style={{ color: day === dayName ? colors.foreground : colors.muted, fontSize: 11, flex: 1 }}>{active}</Text>
          </View>
        ))}
      </View>

      {/* Sunday Deep Treatment Protocol */}
      <View style={{ backgroundColor: colors.primary + '15', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.primary + '40' }}>
        <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 14, marginBottom: 6 }}>
          ✨ Sunday Deep Skin Reset: Multani Mitti + Rose Water
        </Text>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
          • <Text style={{ fontWeight: '700' }}>Mix:</Text> 1 tbsp Multani Mitti + pure Rose water into a smooth paste.{'\n'}
          • <Text style={{ fontWeight: '700' }}>Apply:</Text> Spread evenly across face and neck (avoiding eye area).{'\n'}
          • <Text style={{ fontWeight: '700' }}>Time:</Text> 15-20 minutes until almost dry (do NOT let it crack painfully).{'\n'}
          • <Text style={{ fontWeight: '700' }}>Rinse:</Text> Splash with lukewarm water until dissolved. Follow immediately with Nivea Soft moisturizer to prevent moisture loss.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Tan Removal Screen (Cleaned per Feedback 02) ─────────────────────────────

function TanRemovalScreen() {
  const colors = useColors();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Overview Banner */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Shield size={20} color={colors.primary} />
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.foreground }}>Bangalore Commute UV Shield</Text>
        </View>
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
          Riding a two-wheeler in Bangalore without protection undoes weeks of skincare progress in 15 minutes. Follow these three non-negotiable protocols to reverse existing tan and prevent new pigmentation.
        </Text>
      </View>

      {/* Pillar 1: Commute Armor */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.warning, marginBottom: 10 }}>
          🛡️ Pillar 1: Commute Armor (Daily Non-Negotiable)
        </Text>
        {[
          { icon: '🪖', title: 'Helmet Visor CLOSED', desc: 'UV penetrates through open visors. Keep your full-face helmet visor down at all times when riding.' },
          { icon: '☀️', title: 'Aqualogica SPF 50+ (Face & Neck)', desc: '2 full finger-lengths applied 15 min before stepping out into the sun.' },
          { icon: '🧥', title: 'Sleeves / Body SPF', desc: 'Wear full-sleeve UV jackets or apply body sunscreen to exposed arms and hands.' },
        ].map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '700' }}>{item.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Pillar 2: Active Melanin Reversal */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.primary, marginBottom: 10 }}>
          ⚡ Pillar 2: Melanin Reversal (Daily Actives)
        </Text>
        {[
          { title: 'Alpha Arbutin 2% (AM & PM)', desc: 'Blocks tyrosinase enzymes from synthesizing new melanin in tanned cells.' },
          { title: '10% Niacinamide Serum (AM)', desc: 'Stops transfer of pigment into surface skin cells and restores barrier.' },
          { title: 'Adapalene 0.1% (Mon/Wed/Fri PM)', desc: 'Forces rapid epidermal exfoliation, shedding dark, sun-damaged layers.' },
        ].map((item, i) => (
          <View key={i} style={{ marginBottom: 10, paddingLeft: 8, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700' }}>{item.title}</Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>{item.desc}</Text>
          </View>
        ))}
      </View>

      {/* Pillar 3: Weekly Deep Exfoliation */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.success, marginBottom: 10 }}>
          🛁 Pillar 3: Weekly Tan Lifting
        </Text>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 13 }}>☕ mCaffeine Coffee Body Scrub (Saturday in Shower)</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>
            Massage damp arms, elbows, knees, and neck in gentle circular motions for 2-3 minutes. Coffee grounds physically slough off oxidized tan, while caffeine boosts micro-circulation.
          </Text>
        </View>
        <View>
          <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 13 }}>🌸 Multani Mitti & Rose Water (Sunday Face Reset)</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>
            Draws out deep environmental impurities, calms inflammation from Bangalore sun exposure, and clarifies complexion.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Hair Care Screen (100% Gentle & Natural — NO MINOXIDIL) ──────────────────

function HairCareScreen() {
  const colors = useColors();
  const [massageDone, setMassageDone] = useState(false);
  const [oilDone, setOilDone] = useState(false);
  const [dermastampDone, setDermastampDone] = useState(false);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Header Banner */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: colors.foreground, marginBottom: 4 }}>
          Natural Hairline & Scalp Health 🌿
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
          Zero chemicals, zero Minoxidil. A clinical-grade natural protocol to halt hairline recession, nourish follicle root vascularity, and trigger natural hair density.
        </Text>
      </View>

      {/* Today's Natural Hairline Action Tracker */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>Today's Hairline Actions</Text>
        
        {/* Daily 4-Min Scalp Massage */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setMassageDone(!massageDone); }}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 10,
            backgroundColor: massageDone ? colors.success + '15' : colors.background,
            borderWidth: 1, borderColor: massageDone ? colors.success : colors.border,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View style={{
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: massageDone ? colors.success : 'transparent',
            borderWidth: 2, borderColor: massageDone ? colors.success : colors.border,
            alignItems: 'center', justifyContent: 'center', marginRight: 12,
          }}>
            {massageDone && <Check size={14} color="#FFFFFF" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: massageDone ? colors.success : colors.foreground, fontWeight: '700', fontSize: 13 }}>
              Daily 4-Minute Scalp Massage
            </Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>
              Gentle circular pressure on receding temples and hairline to maximize dermal papilla blood flow.
            </Text>
          </View>
        </Pressable>

        {/* Rosemary Oil */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setOilDone(!oilDone); }}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 10,
            backgroundColor: oilDone ? colors.success + '15' : colors.background,
            borderWidth: 1, borderColor: oilDone ? colors.success : colors.border,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View style={{
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: oilDone ? colors.success : 'transparent',
            borderWidth: 2, borderColor: oilDone ? colors.success : colors.border,
            alignItems: 'center', justifyContent: 'center', marginRight: 12,
          }}>
            {oilDone && <Check size={14} color="#FFFFFF" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: oilDone ? colors.success : colors.foreground, fontWeight: '700', fontSize: 13 }}>
              Rosemary Oil Scalp Application (2-3x/week)
            </Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>
              5 drops Rosemary oil diluted in 1 tsp Coconut/Jojoba oil. Clinically proven to match 2% Minoxidil efficacy naturally.
            </Text>
          </View>
        </Pressable>

        {/* 0.5mm Weekly Dermastamping */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setDermastampDone(!dermastampDone); }}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12,
            backgroundColor: dermastampDone ? colors.success + '15' : colors.background,
            borderWidth: 1, borderColor: dermastampDone ? colors.success : colors.border,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View style={{
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: dermastampDone ? colors.success : 'transparent',
            borderWidth: 2, borderColor: dermastampDone ? colors.success : colors.border,
            alignItems: 'center', justifyContent: 'center', marginRight: 12,
          }}>
            {dermastampDone && <Check size={14} color="#FFFFFF" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: dermastampDone ? colors.success : colors.foreground, fontWeight: '700', fontSize: 13 }}>
              0.5 mm Dermastamping (Weekly on Sunday)
            </Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>
              Gentle vertical stamp on hairline & temples. Triggers growth factors and activates dormant follicle stem cells.
            </Text>
          </View>
        </Pressable>
      </View>

      {/* The 4 Natural Hairline Pillars */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: 12 }}>
          Clinical Natural Hairline Pillars
        </Text>

        {[
          {
            icon: '📌',
            title: '1. 0.5 mm Dermastamping (Weekly)',
            desc: 'Use a 0.5mm dermastamp (NOT a roller, which pulls hair at an angle). Disinfect with alcohol before use. Stamp gently 4-5 times over receding hairline corners. Triggers local Wnt/β-catenin hair-regeneration signaling.',
          },
          {
            icon: '🌿',
            title: '2. Rosemary Essential Oil',
            desc: 'A landmark comparative study (Panahi et al.) proved Rosemary oil matches 2% minoxidil in hair count increase at 6 months, without scalp itching or drug side effects. Always dilute in carrier oil.',
          },
          {
            icon: '🎃',
            title: '3. Raw Pumpkin Seeds (Nutritional DHT Blocker)',
            desc: 'Consume 1-2 tbsp (30g) raw pumpkin seeds daily. They contain Delta-7 Sterols which naturally inhibit the 5-alpha reductase enzyme that converts testosterone to DHT in hair follicles.',
          },
          {
            icon: '💆',
            title: '4. Daily Mechanical Scalp Massage (4 min)',
            desc: 'A Japanese clinical study demonstrated that 4 minutes of standardized daily scalp massage increases hair thickness by mechanically stretching dermal papilla cells and opening blood vessels.',
          },
        ].map((pillar, i) => (
          <View key={i} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <Text style={{ fontSize: 16 }}>{pillar.icon}</Text>
              <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 13 }}>{pillar.title}</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, paddingLeft: 22 }}>
              {pillar.desc}
            </Text>
          </View>
        ))}
      </View>

      {/* Hair Wash Protocol */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>Weekly Wash Protocol</Text>
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
          • <Text style={{ fontWeight: '700', color: colors.primary }}>Monday & Thursday:</Text> Nizoral 2% Ketoconazole Shampoo (leave on scalp for 3-5 min before rinsing). Keeps scalp fungal-free and acts as a mild topical androgen blocker.{'\n'}
          • <Text style={{ fontWeight: '700', color: colors.primary }}>Sunday:</Text> Mild herbal/sulfate-free shampoo after morning oil session.
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
          title: 'Daily Body Protocol', items: [
            'Lukewarm shower (avoid steaming hot water which dries the barrier)',
            'Nivea Soft or moisturizing lotion applied within 3 minutes of shower on damp skin',
            'Full sunscreen coverage on exposed arms before two-wheeler commute',
            'Deodorant applied to clean, dry underarms',
          ]
        },
        {
          title: 'Weekly Exfoliation & Treatment', items: [
            'mCaffeine Coffee Body Scrub — Saturday in shower on arms, neck, elbows, knees',
            'Gentle circular massage for 2-3 minutes before rinsing',
            'Ubtan / Multani pack on elbows and knees for stubborn dark pigmentation',
            'Pumice stone on rough heel edges',
          ]
        },
        {
          title: 'Dark Joints (Elbows & Knees)', items: [
            'Avoid resting elbows directly on hard desk surfaces (friction triggers melanin)',
            'Scrub gently 1-2x/week with coffee scrub',
            'Apply thick layer of Nivea Soft before sleeping',
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

// ─── Looksmax & Face Asymmetry Correction Screen ──────────────────────────────

function LooksmaxScreen() {
  const colors = useColors();
  const [expanded, setExpanded] = useState<string | null>('asymmetry');

  const strategies = [
    {
      id: 'asymmetry',
      tier: 'CRITICAL HIGH IMPACT',
      name: 'Face Asymmetry Correction (Jaw, Eyes & Cheeks)',
      impact: '10/10',
      status: 'HIGH PRIORITY',
      color: colors.primary,
      desc: 'Fixing facial asymmetry requires reversing the unconscious daily habits that deform bone and muscle balance over years:\n\n' +
        '1. Bilateral Chewing (50/50 Chewing Balance):\n' +
        'Chewing food predominantly on one side of your mouth causes massive hypertrophy of that side’s masseter muscle, while the other side remains underdeveloped. This pulls the jawline and mouth off-center. ACTION: Consciously chew on your weaker/smaller side for 70% of bites during meals until both sides match.\n\n' +
        '2. Back Sleeping (Zero Compression):\n' +
        'Side-sleeping puts 5-8 kg of compressive force on one cheek and eye orbit for 8 hours every night. Over years, this shifts eye socket height and creates asymmetrical nasolabial folds. ACTION: Train yourself to sleep flat on your back with a supportive cervical pillow.\n\n' +
        '3. Lateral Neck Tilt & SCM Balancing:\n' +
        'Uneven tightness in the Sternocleidomastoid (SCM) and upper trapezius tilts your head slightly, causing your eye line to look slanted. ACTION: Perform daily neck curls and gentle side neck stretches to level your horizontal eye plane.\n\n' +
        '4. Proper Mewing & Nasal Breathing:\n' +
        'Rest entire tongue against the roof of the mouth (including posterior third). Breathe through nose 24/7 with lips sealed.\n\n' +
        '5. Strategic Beard Grooming:\n' +
        'While facial bones and muscles remodel, maintain a neat 3-5mm stubble with a sharp, squared neckline to visually frame and balance your jawline contour.',
    },
    {
      id: 'body',
      tier: 'TIER 1 HIGHEST IMPACT',
      name: 'Body Composition Hypertrophy (45 kg → 62 kg)',
      impact: '10/10',
      status: 'IN PROGRESS',
      color: colors.primary,
      desc: 'At 45 kg (BMI 16.1), extreme underweight causes facial fat pad depletion, hollow eye sockets, and an angular, tired look. Putting on 12-17 kg of lean muscle fills facial fat pads, builds a commanding jaw-to-neck ratio, and transforms visual presence.',
    },
    {
      id: 'shoulders',
      tier: 'TIER 1 HIGHEST IMPACT',
      name: 'Shoulder & Neck Hypertrophy (V-Taper Illusion)',
      impact: '9/10',
      status: 'IN PROGRESS',
      color: colors.primary,
      desc: 'Lateral raises (side delts), neck curls, and shrugs daily. Building the side delts and neck by even 1 inch creates the optical illusion of a narrower waist and a masculine, capable frame.',
    },
    {
      id: 'skincare',
      tier: 'TIER 1 HIGHEST IMPACT',
      name: 'Eradicate Moustache Patch & Even Complexion',
      impact: '9/10',
      status: 'IN PROGRESS',
      color: colors.primary,
      desc: 'Clear, unified skin tone is one of the highest-rated universal beauty markers. Alpha Arbutin 2% + 10% Niacinamide + Adapalene 0.1% + Daily SPF 50+ systematically fades localized patches and evens overall skin tone.',
    },
    {
      id: 'hairline',
      tier: 'TIER 1 HIGHEST IMPACT',
      name: 'Receding Hairline Halting & Density',
      impact: '9/10',
      status: 'ACTION NEEDED',
      color: colors.warning,
      desc: 'Protect your hairline naturally: 0.5mm dermastamping weekly + Rosemary oil 3x/week + 4-minute daily scalp massage + 30g raw pumpkin seeds (DHT inhibitor). Preserving hair now is 10x easier than regrowing it later.',
    },
    {
      id: 'posture',
      tier: 'TIER 1 HIGHEST IMPACT',
      name: 'Posture Alignment (+1.5 Inches Visual Height)',
      impact: '8/10',
      status: 'IN PROGRESS',
      color: colors.primary,
      desc: 'Correcting forward head posture, rounded shoulders, and knee hyperextension unlocks 1-1.5 inches of compressed height and makes clothes hang properly.',
    },
    {
      id: 'sleep',
      tier: 'TIER 2 MODERATE IMPACT',
      name: 'Sleep Quality (11:30 PM - 7:30 AM)',
      impact: '8/10',
      status: 'NEEDS WORK',
      color: colors.warning,
      desc: 'Deep sleep releases 80% of daily human growth hormone (HGH). Reduces dark under-eye circles, optimizes testosterone, and repairs skin overnight.',
    },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {strategies.map((s) => (
        <Pressable
          key={s.id}
          onPress={() => setExpanded(expanded === s.id ? null : s.id)}
          style={({ pressed }) => ({
            backgroundColor: colors.surface,
            borderRadius: 14,
            padding: 14,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colors.border,
            borderLeftWidth: 4,
            borderLeftColor: s.color,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: s.color, fontWeight: '800', letterSpacing: 1, marginBottom: 4 }}>
                {s.tier}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: colors.foreground }}>
                {s.name}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
              <View style={{
                backgroundColor: s.status === 'HIGH PRIORITY' ? colors.primary + '25' : s.status === 'IN PROGRESS' ? colors.success + '20' : colors.warning + '20',
                borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4,
              }}>
                <Text style={{
                  color: s.status === 'HIGH PRIORITY' ? colors.primary : s.status === 'IN PROGRESS' ? colors.success : colors.warning,
                  fontSize: 9, fontWeight: '800',
                }}>
                  {s.status}
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.muted }}>{expanded === s.id ? '▲' : '▼'}</Text>
            </View>
          </View>
          {expanded === s.id && (
            <Text style={{ color: colors.foreground, fontSize: 12, marginTop: 10, lineHeight: 18 }}>
              {s.desc}
            </Text>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Main Appearance Screen ────────────────────────────────────────────────────

export default function AppearanceScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>('skincare');

  useFocusEffect(useCallback(() => {
    NavRepo.consumePendingSubTab('/(tabs)/appearance').then(sub => {
      if (sub && ['skincare', 'tanremoval', 'hair', 'bodycare', 'looksmax'].includes(sub)) {
        setActiveTab(sub as Tab);
      }
    });
  }, []));

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: colors.foreground }}>Appearance ✨</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Skincare · Tan · Hair · Body · Looksmax</Text>
        </View>

        <SubTabBar tabs={TABS} activeTab={activeTab as string} onTabChange={(k) => setActiveTab(k as Tab)} />

        <View style={{ flex: 1 }}>
          {activeTab === 'skincare' && <SkincareScreen />}
          {activeTab === 'tanremoval' && <TanRemovalScreen />}
          {activeTab === 'hair' && <HairCareScreen />}
          {activeTab === 'bodycare' && <BodyCareScreen />}
          {activeTab === 'looksmax' && <LooksmaxScreen />}
        </View>
      </View>
    </ScreenContainer>
  );
}
