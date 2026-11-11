import React, { useState, useEffect, useCallback } from 'react';
import {
  Check, Info, Sparkles, Shield, Sun, Moon, Scissors, Star,
  X, Clock, Droplets, Target, AlertOctagon, Flame, ChevronDown, ChevronUp,
} from 'lucide-react-native';
import { ScrollView, View, Text, Pressable, Modal } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '@/components/screen-container';
import { SubTabBar, type SubTabItem } from '@/components/sub-tab-bar';
import { useColors } from '@/hooks/use-colors';
import { DailyLogRepo, AppearanceRepo, NavRepo } from '@/lib/db/database';
import { SKINCARE_AM, SKINCARE_PM, PM_ACTIVES_ROTATION, type SkincareStep } from '@/lib/db/seeds';
import { Tap } from '@/lib/motion';

type Tab = 'skincare' | 'tanremoval' | 'hair' | 'bodycare' | 'looksmax';
const TABS: SubTabItem[] = [
  { key: 'skincare', label: 'Skincare', icon: Sparkles },
  { key: 'tanremoval', label: 'Tan', icon: Sun },
  { key: 'hair', label: 'Hair', icon: Scissors },
  { key: 'bodycare', label: 'Body', icon: Shield },
  { key: 'looksmax', label: 'Looksmax', icon: Star },
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
          backgroundColor: 'rgba(0,0,0,0.68)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 18,
            padding: 18,
            width: '100%',
            maxWidth: 380,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>
                STEP {step.step} PROTOCOL
              </Text>
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '800', marginTop: 2 }}>
                {step.product}
              </Text>
            </View>
            <Tap
              onPress={onClose}
              scaleTo={0.9}
              style={{
                width: 30, height: 30, borderRadius: 9,
                backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={15} color={colors.muted} />
            </Tap>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {step.duration && (
              <View style={{ flex: 1, backgroundColor: colors.background, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} color={colors.muted} />
                  <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '700' }}>Duration</Text>
                </View>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', marginTop: 3 }}>{step.duration}</Text>
              </View>
            )}
            {step.waitAfter && (
              <View style={{ flex: 1, backgroundColor: colors.background, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} color={colors.warning} />
                  <Text style={{ color: colors.warning, fontSize: 10, fontWeight: '700' }}>Wait Gap</Text>
                </View>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', marginTop: 3 }}>{step.waitAfter}</Text>
              </View>
            )}
          </View>

          {step.rinseRule && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: step.rinseRule.toLowerCase().includes('rinse') ? '#38BDF818' : colors.primary + '16',
              borderRadius: 10, padding: 10, marginBottom: 12,
              borderWidth: 1, borderColor: step.rinseRule.toLowerCase().includes('rinse') ? '#38BDF840' : colors.primary + '38',
            }}>
              <Droplets size={13} color={step.rinseRule.toLowerCase().includes('rinse') ? '#38BDF8' : colors.primary} />
              <Text style={{ color: step.rinseRule.toLowerCase().includes('rinse') ? '#38BDF8' : colors.primary, fontWeight: '800', fontSize: 11.5, flex: 1 }}>
                Rule: {step.rinseRule}
              </Text>
            </View>
          )}

          {step.targetArea && (
            <View style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <Target size={11} color={colors.muted} />
                <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 }}>TARGET AREA</Text>
              </View>
              <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '600' }}>{step.targetArea}</Text>
            </View>
          )}

          <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, marginBottom: 4 }}>PROCEDURAL DETAILS</Text>
            <Text style={{ color: colors.foreground, fontSize: 12.5, lineHeight: 18 }}>
              {step.procedureDetails || step.action}
            </Text>
          </View>

          <Tap
            onPress={onClose}
            scaleTo={0.97}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 11,
              paddingVertical: 11,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13.5 }}>Understood</Text>
          </Tap>
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
    const n = { ...pmDone, [step]: !pmDone[step] };
    setPmDone(n);
    await AppearanceRepo.setSkincarePM(today, n);
    const pmComplete = SKINCARE_PM.every((_, i) => n[i]);
    let log = await DailyLogRepo.getForDate(today);
    if (!log) log = await DailyLogRepo.getDefault(today, []);
    log.skincarePM = pmComplete;
    await DailyLogRepo.save(log);
  };

  const [patchProtocolArchived, setPatchProtocolArchived] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('patch_protocol_archived').then(val => {
      if (val === 'true') setPatchProtocolArchived(true);
    });
  }, []);

  const toggleArchivePatchProtocol = () => {
    const next = !patchProtocolArchived;
    setPatchProtocolArchived(next);
    AsyncStorage.setItem('patch_protocol_archived', next ? 'true' : 'false').catch(() => {});
  };

  const openStepInfo = (step: SkincareStep) => {
    setSelectedStep(step);
    setInfoModalVisible(true);
  };

  return (
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <StepDetailModal
        step={selectedStep}
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      />

      {/* Safety Contraindications */}
      <View style={{ backgroundColor: colors.error + '12', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.error + '38' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <AlertOctagon size={15} color={colors.error} />
          <Text style={{ color: colors.error, fontWeight: '800', fontSize: 12 }}>STRICT CONTRAINDICATIONS</Text>
        </View>
        <Text style={{ color: colors.foreground, fontSize: 11.5, lineHeight: 17 }}>
          • <Text style={{ fontWeight: '700' }}>Humasone (Mometasone):</Text> Potent topical steroid. Keep completely off facial skin to prevent dermal thinning and rebound rosacea.{'\n'}
          • <Text style={{ fontWeight: '700' }}>Benzomycin:</Text> Apply with a clean Q-tip on active raised pimples ONLY.{'\n'}
          • Never apply Adapalene on damp skin — wait 10–15 minutes after cleansing.
        </Text>
      </View>

      {/* Targeted Spot Treatment Card */}
      {!patchProtocolArchived ? (
        <View style={{
          backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 12,
          borderWidth: 1, borderColor: colors.primary + '38', borderLeftWidth: 3.5, borderLeftColor: colors.primary,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color={colors.primary} />
                <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.foreground }}>
                  Targeted Spot Treatment Protocol
                </Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                Active until moustache hyperpigmentation and localized spots clear.
              </Text>
            </View>
            <Tap
              onPress={toggleArchivePatchProtocol}
              scaleTo={0.94}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: colors.success + '1C',
                borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4,
              }}
            >
              <Check size={11} color={colors.success} strokeWidth={3} />
              <Text style={{ color: colors.success, fontSize: 10.5, fontWeight: '800' }}>Cleared</Text>
            </Tap>
          </View>

          <View style={{ backgroundColor: colors.background, borderRadius: 10, padding: 11, marginTop: 6, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 11.5 }}>
                Target 1: Moustache Patch & Dark Spots
              </Text>
              <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '700' }}>AM & PM</Text>
            </View>
            <Text style={{ color: colors.foreground, fontSize: 11.5, lineHeight: 17 }}>
              Dab 1 drop of Alpha Arbutin 2% directly onto the pigment patch beside the moustache and any dark chin marks before applying full-face serum.
            </Text>
          </View>

          <View style={{ backgroundColor: colors.background, borderRadius: 10, padding: 11, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={{ color: colors.error, fontWeight: '800', fontSize: 11.5 }}>
                Target 2: Active Inflammatory Pimples
              </Text>
              <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '700' }}>PM Spot Dab</Text>
            </View>
            <Text style={{ color: colors.foreground, fontSize: 11.5, lineHeight: 17 }}>
              Use a clean Q-tip to place a pinpoint dot of Benzomycin Gel strictly on active, swollen red pimples overnight.
            </Text>
          </View>
        </View>
      ) : (
        <View style={{
          backgroundColor: colors.success + '12', borderRadius: 12, padding: 12, marginBottom: 12,
          borderWidth: 1, borderColor: colors.success + '38', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <Check size={14} color={colors.success} strokeWidth={3} />
            <Text style={{ color: colors.success, fontWeight: '800', fontSize: 12 }}>
              Spot Treatment Protocol: Cleared & Archived
            </Text>
          </View>
          <Tap onPress={toggleArchivePatchProtocol} scaleTo={0.94}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800', textDecorationLine: 'underline' }}>
              Reactivate
            </Text>
          </Tap>
        </View>
      )}

      {/* Tonight's Active */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 13, marginBottom: 12, borderWidth: 1, borderColor: colors.primary + '38', borderLeftWidth: 3.5, borderLeftColor: colors.primary }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <Moon size={14} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12.5 }}>Tonight's PM Active ({dayName})</Text>
        </View>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 17 }}>{todayActive}</Text>
      </View>

      {/* AM Routine */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sun size={16} color={colors.warning} />
            <Text style={{ fontSize: 14.5, fontWeight: '800', color: colors.warning }}>AM Routine</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success + '1C', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Flame size={11} color={colors.success} />
            <Text style={{ color: colors.success, fontSize: 10.5, fontWeight: '800' }}>{amStreak}d streak</Text>
          </View>
        </View>

        {SKINCARE_AM.map((step, i) => (
          <View
            key={i}
            style={{
              paddingVertical: 9,
              borderBottomWidth: i < SKINCARE_AM.length - 1 ? 1 : 0,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Tap
                onPress={() => toggleAM(i)}
                scaleTo={0.92}
                style={{
                  width: 22, height: 22, borderRadius: 7,
                  backgroundColor: amDone[i] ? colors.success : 'transparent',
                  borderWidth: 1.8, borderColor: amDone[i] ? colors.success : colors.border,
                  marginRight: 11, alignItems: 'center', justifyContent: 'center', marginTop: 2,
                }}
              >
                {amDone[i] && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
              </Tap>

              <Tap onPress={() => toggleAM(i)} scaleTo={0.99} style={{ flex: 1 }}>
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
                  {step.duration && <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>Time: {step.duration}</Text>}
                  {step.waitAfter && <Text style={{ color: colors.warning, fontSize: 10, fontWeight: '700' }}>Wait: {step.waitAfter}</Text>}
                </View>
              </Tap>

              <Tap
                onPress={() => openStepInfo(step)}
                scaleTo={0.92}
                style={{
                  backgroundColor: colors.primary + '16',
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  marginLeft: 8,
                }}
              >
                <Info size={11} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>Info</Text>
              </Tap>
            </View>
          </View>
        ))}
      </View>

      {/* PM Routine */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Moon size={16} color={colors.primary} />
            <Text style={{ fontSize: 14.5, fontWeight: '800', color: colors.primary }}>PM Routine</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success + '1C', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Flame size={11} color={colors.success} />
            <Text style={{ color: colors.success, fontSize: 10.5, fontWeight: '800' }}>{pmStreak}d streak</Text>
          </View>
        </View>

        {SKINCARE_PM.map((step, i) => (
          <View
            key={i}
            style={{
              paddingVertical: 9,
              borderBottomWidth: i < SKINCARE_PM.length - 1 ? 1 : 0,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Tap
                onPress={() => togglePM(i)}
                scaleTo={0.92}
                style={{
                  width: 22, height: 22, borderRadius: 7,
                  backgroundColor: pmDone[i] ? colors.success : 'transparent',
                  borderWidth: 1.8, borderColor: pmDone[i] ? colors.success : colors.border,
                  marginRight: 11, alignItems: 'center', justifyContent: 'center', marginTop: 2,
                }}
              >
                {pmDone[i] && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
              </Tap>

              <Tap onPress={() => togglePM(i)} scaleTo={0.99} style={{ flex: 1 }}>
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
                  {step.duration && <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>Time: {step.duration}</Text>}
                  {step.waitAfter && <Text style={{ color: colors.warning, fontSize: 10, fontWeight: '700' }}>Wait: {step.waitAfter}</Text>}
                </View>
              </Tap>

              <Tap
                onPress={() => openStepInfo(step)}
                scaleTo={0.92}
                style={{
                  backgroundColor: colors.primary + '16',
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  marginLeft: 8,
                }}
              >
                <Info size={11} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>Info</Text>
              </Tap>
            </View>
          </View>
        ))}
      </View>

      {/* Weekly PM Actives Rotation */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.foreground, marginBottom: 10 }}>PM Actives Rotation</Text>
        {Object.entries(PM_ACTIVES_ROTATION).map(([day, active], idx, arr) => (
          <View key={day} style={{
            flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8,
            borderBottomWidth: idx < arr.length - 1 ? 1 : 0, borderBottomColor: colors.border,
            backgroundColor: day === dayName ? colors.primary + '14' : 'transparent',
            borderRadius: day === dayName ? 8 : 0,
            paddingHorizontal: day === dayName ? 8 : 0,
          }}>
            <Text style={{ width: 82, color: day === dayName ? colors.primary : colors.muted, fontWeight: day === dayName ? '800' : '600', fontSize: 11.5 }}>{day}</Text>
            <Text style={{ color: day === dayName ? colors.foreground : colors.muted, fontSize: 11.5, flex: 1 }}>{active}</Text>
          </View>
        ))}
      </View>

      {/* Sunday Deep Treatment Protocol */}
      <View style={{ backgroundColor: colors.primary + '12', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.primary + '38' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <Sparkles size={14} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>
            Sunday Deep Skin Reset: Multani Mitti + Rose Water
          </Text>
        </View>
        <Text style={{ color: colors.foreground, fontSize: 11.5, lineHeight: 17 }}>
          • <Text style={{ fontWeight: '700' }}>Mix:</Text> 1 tbsp Multani Mitti + pure Rose water into a smooth paste.{'\n'}
          • <Text style={{ fontWeight: '700' }}>Apply:</Text> Spread evenly across face and neck (avoiding eye contour).{'\n'}
          • <Text style={{ fontWeight: '700' }}>Time:</Text> 15–20 minutes until semi-dry (do not allow it to crack).{'\n'}
          • <Text style={{ fontWeight: '700' }}>Rinse:</Text> Splash with lukewarm water and lock in Nivea Soft immediately.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Tan Removal Screen ───────────────────────────────────────────────────────

function TanRemovalScreen() {
  const colors = useColors();

  return (
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Shield size={18} color={colors.primary} />
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.foreground }}>Bangalore Commute UV Shield</Text>
        </View>
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
          Two-wheeler UV exposure reverses weeks of depigmentation in 15 minutes. Follow these three protocols daily to prevent new melanin synthesis and shed existing tan.
        </Text>
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.warning, marginBottom: 10 }}>
          Pillar 1: Physical & UV Armor (Daily Non-Negotiable)
        </Text>
        {[
          { title: 'Full-Face Helmet Visor Closed', desc: 'UV penetrates open visors. Keep your visor down at all times while riding.' },
          { title: 'Aqualogica SPF 50+ (Face & Neck)', desc: 'Apply 2 full finger-lengths 15 minutes before stepping outdoors.' },
          { title: 'Full-Sleeve UV Cover / Body SPF', desc: 'Wear full sleeves or apply body SPF to exposed forearms and hands.' },
        ].map((item, i) => (
          <View key={i} style={{ marginBottom: 10, paddingLeft: 10, borderLeftWidth: 2.5, borderLeftColor: colors.warning }}>
            <Text style={{ color: colors.foreground, fontSize: 12.5, fontWeight: '700' }}>{item.title}</Text>
            <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 2 }}>{item.desc}</Text>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.primary, marginBottom: 10 }}>
          Pillar 2: Active Melanin Reversal
        </Text>
        {[
          { title: 'Alpha Arbutin 2% (AM & PM)', desc: 'Inhibits tyrosinase enzymes from synthesizing new melanin in UV-stressed cells.' },
          { title: '10% Niacinamide Serum (AM)', desc: 'Blocks melanosome transfer into surface keratinocytes and strengthens barrier.' },
          { title: 'Adapalene 0.1% (Mon / Wed / Fri PM)', desc: 'Accelerates epidermal turnover to shed pigmented surface layers.' },
        ].map((item, i) => (
          <View key={i} style={{ marginBottom: 10, paddingLeft: 10, borderLeftWidth: 2.5, borderLeftColor: colors.primary }}>
            <Text style={{ color: colors.foreground, fontSize: 12.5, fontWeight: '700' }}>{item.title}</Text>
            <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 2 }}>{item.desc}</Text>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.success, marginBottom: 10 }}>
          Pillar 3: Weekend Exfoliation & Reset
        </Text>
        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 12.5 }}>mCaffeine Coffee Body Scrub (Saturday Shower)</Text>
          <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 2, lineHeight: 17 }}>
            Massage damp arms, elbows, knees, and neck in circular motions for 2–3 minutes to slough off oxidized surface tan.
          </Text>
        </View>
        <View>
          <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 12.5 }}>Multani Mitti & Rose Water (Sunday Recovery Reset)</Text>
          <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 2, lineHeight: 17 }}>
            Draws out deep impurities on your Sunday rest day, calms UV inflammation, and clarifies overall tone.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Hair Care Screen ─────────────────────────────────────────────────────────

function HairCareScreen() {
  const colors = useColors();
  const [massageDone, setMassageDone] = useState(false);
  const [oilDone, setOilDone] = useState(false);
  const [dermastampDone, setDermastampDone] = useState(false);

  return (
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.foreground, marginBottom: 4 }}>
          Natural Hairline & Scalp Protocol
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
          Drug-free, zero-Minoxidil clinical protocol to halt temple recession, improve dermal papilla vascularity, and support natural hair density.
        </Text>
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.foreground, marginBottom: 10 }}>Today's Hairline Actions</Text>

        {[
          {
            done: massageDone,
            toggle: () => setMassageDone(!massageDone),
            title: 'Daily 4-Minute Mechanical Scalp Massage',
            desc: 'Firm circular mobilization on temples and crown to stretch dermal papilla cells and boost blood flow.',
          },
          {
            done: oilDone,
            toggle: () => setOilDone(!oilDone),
            title: 'Rosemary Essential Oil (2–3× / week)',
            desc: '5 drops Rosemary oil diluted in 1 tsp Jojoba/Coconut carrier oil.',
          },
          {
            done: dermastampDone,
            toggle: () => setDermastampDone(!dermastampDone),
            title: '0.5mm Dermastamping (Sunday Recovery Session)',
            desc: 'Sanitize with 70% alcohol. Vertical stamp along hairline corners on Sunday.',
          },
        ].map((item, idx) => (
          <Tap
            key={idx}
            onPress={item.toggle}
            scaleTo={0.985}
            style={{
              flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: idx < 2 ? 8 : 0,
              backgroundColor: item.done ? colors.success + '12' : colors.background,
              borderWidth: 1, borderColor: item.done ? colors.success + '45' : colors.border,
            }}
          >
            <View style={{
              width: 22, height: 22, borderRadius: 7,
              backgroundColor: item.done ? colors.success : 'transparent',
              borderWidth: 1.8, borderColor: item.done ? colors.success : colors.border,
              alignItems: 'center', justifyContent: 'center', marginRight: 12,
            }}>
              {item.done && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: item.done ? colors.success : colors.foreground, fontWeight: '700', fontSize: 12.5 }}>
                {item.title}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                {item.desc}
              </Text>
            </View>
          </Tap>
        ))}
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.primary, marginBottom: 10 }}>
          4 Clinical Pillars
        </Text>

        {[
          {
            title: '01. 0.5mm Dermastamping (Sunday)',
            desc: 'Use a vertical adjustable stamp (never a roller that tangles hair). Triggers Wnt/β-catenin follicular regeneration signaling.',
          },
          {
            title: '02. Diluted Rosemary Essential Oil',
            desc: 'Comparative clinical trials (Panahi et al.) matched 2% minoxidil hair count improvements at 6 months without scalp irritation.',
          },
          {
            title: '03. Raw Pumpkin Seeds (30g Daily)',
            desc: 'Rich in Delta-7 sterols and zinc to naturally downregulate 5-alpha reductase DHT conversion.',
          },
          {
            title: '04. Daily 4-Minute Scalp Mobilization',
            desc: 'Increases hair shaft thickness by releasing galea aponeurotica tension.',
          },
        ].map((pillar, i) => (
          <View key={i} style={{ marginBottom: i < 3 ? 12 : 0, paddingLeft: 10, borderLeftWidth: 2.5, borderLeftColor: colors.primary }}>
            <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 12.5 }}>{pillar.title}</Text>
            <Text style={{ color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 2 }}>
              {pillar.desc}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.foreground, marginBottom: 6 }}>Weekly Wash Schedule</Text>
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
          • <Text style={{ fontWeight: '700', color: colors.primary }}>Monday & Thursday:</Text> Ketoconazole 2% Shampoo (leave on scalp 3–5 min before rinsing).{'\n'}
          • <Text style={{ fontWeight: '700', color: colors.primary }}>Sunday:</Text> Gentle sulfate-free wash following morning oil treatment.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Body Care ─────────────────────────────────────────────────────────────────

function BodyCareScreen() {
  const colors = useColors();
  return (
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {[
        {
          title: 'Daily Body Protocol', items: [
            'Lukewarm shower (avoid scalding water that strips epidermal lipids)',
            'Nivea Soft or body lotion applied within 3 minutes of showering on damp skin',
            'Full UV coverage on forearms and neck before commuting',
            'Anti-perspirant / deodorant applied to clean, dry underarms',
          ]
        },
        {
          title: 'Weekend Exfoliation & Treatment', items: [
            'mCaffeine Coffee Body Scrub — Saturday shower on arms, neck, elbows, and knees',
            'Gentle circular massage for 2–3 minutes before rinsing',
            'Sunday Ubtan / Multani pack on stubborn dark joints',
            'Pumice stone maintenance on heels during Sunday shower',
          ]
        },
        {
          title: 'Joint Hyperpigmentation (Elbows & Knees)', items: [
            'Avoid leaning bare elbows on hard desk surfaces (frictional hyperkeratosis)',
            'Exfoliate 1–2× weekly without harsh scrubbing',
            'Seal with a thick layer of moisturizer before sleep',
          ]
        },
      ].map((section, si) => (
        <View key={si} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.foreground, marginBottom: 8 }}>{section.title}</Text>
          {section.items.map((item, i) => (
            <Text key={i} style={{ color: colors.muted, fontSize: 12, marginBottom: 5, lineHeight: 17 }}>• {item}</Text>
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
  const today = new Date().toISOString().split('T')[0];
  const [actionsDone, setActionsDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    AsyncStorage.getItem(`looksmax_actions_${today}`).then(stored => {
      if (stored) {
        try { setActionsDone(JSON.parse(stored)); } catch {}
      }
    });
  }, [today]);

  const toggleAction = (key: string) => {
    setActionsDone(prev => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(`looksmax_actions_${today}`, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const strategies = [
    {
      id: 'asymmetry',
      tier: 'CRITICAL HIGH IMPACT',
      name: 'Face Asymmetry Correction (Jaw, Eyes & Cheeks)',
      status: 'HIGH PRIORITY',
      color: colors.primary,
      desc:
        '1. Bilateral Chewing Balance: Consciously chew 70% of bites on your less-developed masseter side until bilateral symmetry is restored.\n\n' +
        '2. Supine Back Sleeping: Avoid 8 hours of lateral pillow compression on one cheekbone and orbital rim.\n\n' +
        '3. SCM & Cervical Leveling: Perform daily neck stretches to eliminate subtle head tilt.\n\n' +
        '4. Palatal Tongue Posture (Mewing): Maintain full tongue posture on the palate with nasal breathing.\n\n' +
        '5. Precision Stubble Framing: Keep a crisp 3–5mm stubble line to balance lower-third proportions.',
    },
    {
      id: 'body',
      tier: 'TIER 1 HIGHEST IMPACT',
      name: 'Lean Mass Hypertrophy (45 kg → 62 kg)',
      status: 'IN PROGRESS',
      color: colors.primary,
      desc: 'Adding 12–17 kg of lean muscle over 365 days restores healthy facial soft-tissue volume, widens the clavicle-to-waist ratio, and transforms physical presence.',
    },
    {
      id: 'shoulders',
      tier: 'TIER 1 HIGHEST IMPACT',
      name: 'Lateral Delt & Neck Specialization (V-Taper)',
      status: 'IN PROGRESS',
      color: colors.primary,
      desc: 'High-frequency lateral raises, neck curls, and upper trap work build the strongest visual frame multipliers.',
    },
    {
      id: 'skincare',
      tier: 'TIER 1 HIGHEST IMPACT',
      name: 'Even Skin Tone & Pigmentation Clearance',
      status: 'IN PROGRESS',
      color: colors.primary,
      desc: 'Alpha Arbutin 2% + Niacinamide 10% + Adapalene 0.1% + strict SPF 50+ systematically clears localized patches.',
    },
    {
      id: 'hairline',
      tier: 'TIER 1 HIGHEST IMPACT',
      name: 'Natural Hairline Preservation & Density',
      status: 'ACTIVE',
      color: colors.warning,
      desc: 'Sunday 0.5mm dermastamping + Rosemary oil 3×/week + 4-minute daily scalp massage + 30g pumpkin seeds.',
    },
    {
      id: 'posture',
      tier: 'TIER 1 HIGHEST IMPACT',
      name: 'Postural Decompression (+1.5 Inches Visual Height)',
      status: 'IN PROGRESS',
      color: colors.primary,
      desc: 'Daily chin tucks, wall angels, and thoracic extension eliminate slouch compression.',
    },
  ];

  return (
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.foreground }}>Daily Asymmetry Checklist</Text>
          <View style={{ backgroundColor: colors.primary + '1C', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
            <Text style={{ color: colors.primary, fontSize: 9.5, fontWeight: '800' }}>DAILY HABITS</Text>
          </View>
        </View>
        <Text style={{ color: colors.muted, fontSize: 11.5, marginBottom: 10 }}>
          Correct neuromuscular habits that pull your jaw and eye plane off-center.
        </Text>

        {[
          { key: 'chew', title: 'Bilateral Chewing Balance', desc: 'Chew 70% on weaker jaw side during meals today' },
          { key: 'sleep', title: 'Back-Sleeping Posture', desc: 'Zero lateral cheek compression overnight' },
          { key: 'scm', title: 'SCM & Neck Alignment Stretch', desc: 'Level horizontal eye plane during posture routine' },
          { key: 'mewing', title: 'Palatal Tongue Posture', desc: 'Full tongue on palate + strict nasal breathing' },
        ].map((item, idx) => {
          const isDone = !!actionsDone[item.key];
          return (
            <Tap
              key={item.key}
              onPress={() => toggleAction(item.key)}
              scaleTo={0.985}
              style={{
                flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: idx < 3 ? 7 : 0,
                backgroundColor: isDone ? colors.success + '12' : colors.background,
                borderWidth: 1, borderColor: isDone ? colors.success + '45' : colors.border,
              }}
            >
              <View style={{
                width: 22, height: 22, borderRadius: 7,
                backgroundColor: isDone ? colors.success : 'transparent',
                borderWidth: 1.8, borderColor: isDone ? colors.success : colors.border,
                alignItems: 'center', justifyContent: 'center', marginRight: 12,
              }}>
                {isDone && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: isDone ? colors.success : colors.foreground, fontWeight: '700', fontSize: 12.5 }}>
                  {item.title}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>
                  {item.desc}
                </Text>
              </View>
            </Tap>
          );
        })}
      </View>

      {strategies.map((s) => {
        const isOpen = expanded === s.id;
        return (
          <Tap
            key={s.id}
            onPress={() => setExpanded(isOpen ? null : s.id)}
            scaleTo={0.985}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 14,
              padding: 14,
              marginBottom: 9,
              borderWidth: 1,
              borderColor: colors.border,
              borderLeftWidth: 3.5,
              borderLeftColor: s.color,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={{ fontSize: 9, color: s.color, fontWeight: '800', letterSpacing: 0.8, marginBottom: 3 }}>
                  {s.tier}
                </Text>
                <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.foreground }}>
                  {s.name}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <View style={{
                  backgroundColor: s.status === 'HIGH PRIORITY' ? colors.primary + '20' : s.status === 'IN PROGRESS' ? colors.success + '1C' : colors.warning + '1C',
                  borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2.5,
                }}>
                  <Text style={{
                    color: s.status === 'HIGH PRIORITY' ? colors.primary : s.status === 'IN PROGRESS' ? colors.success : colors.warning,
                    fontSize: 9, fontWeight: '800',
                  }}>
                    {s.status}
                  </Text>
                </View>
                {isOpen ? <ChevronUp size={15} color={colors.muted} /> : <ChevronDown size={15} color={colors.muted} />}
              </View>
            </View>
            {isOpen && (
              <Text style={{ color: colors.foreground, fontSize: 12, marginTop: 10, lineHeight: 18 }}>
                {s.desc}
              </Text>
            )}
          </Tap>
        );
      })}
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
        <View style={{ paddingHorizontal: 18, paddingTop: 6, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground, letterSpacing: -0.5 }}>Appearance</Text>
          <Text style={{ color: colors.muted, fontSize: 11.5, fontWeight: '700' }}>Skin · UV · Hair · Aesthetics</Text>
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
