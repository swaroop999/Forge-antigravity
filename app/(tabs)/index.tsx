import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Dimensions, RefreshControl } from 'react-native';
import {
  Activity, Flame, Droplets, Dumbbell, Settings, Check, ChevronRight,
  Plus, Sparkles, Bot, Calendar, ArrowUpRight, ShieldCheck, Quote, RotateCw
} from "lucide-react-native";
import { NavRepo } from '@/lib/db/database';
import { router } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppRepo, DailyLogRepo, ProfileRepo, HabitRepo, WorkoutRepo,
  type DailyLog, type UserProfile,
} from '@/lib/db/database';
import {
  QUOTES, NAVAL_QUOTES, HABITS, WEEKDAY_SCHEDULE, SATURDAY_SCHEDULE, SUNDAY_SCHEDULE,
  PM_ACTIVES_ROTATION,
} from '@/lib/db/seeds';
import { Tap } from '@/lib/motion';

const { width } = Dimensions.get('window');

function getDayOfWeek(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

function getTodaySchedule() {
  const day = getDayOfWeek();
  if (day === 'saturday') return SATURDAY_SCHEDULE;
  if (day === 'sunday') return SUNDAY_SCHEDULE;
  return WEEKDAY_SCHEDULE;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── 🏃 Circular Hero Progress Ring ───────────────────────────────────────────

function ProgressRing({
  percentage,
  size = 190,
  strokeWidth = 16,
  color,
  label,
  sublabel,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  sublabel: string;
}) {
  const colors = useColors();
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="heroRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor="#38BDF8" />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.65}
        />
        {/* Dynamic Gradient Ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#heroRingGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          originX={size / 2}
          originY={size / 2}
          rotation="-90"
        />
      </Svg>

      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: colors.foreground, letterSpacing: -0.5 }}>
          {Math.round(percentage)}%
        </Text>
        <Text style={{ fontSize: 11.5, fontWeight: '800', color: color, marginTop: 1 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 10, fontWeight: '600', color: colors.muted, marginTop: 1 }}>
          {sublabel}
        </Text>
      </View>
    </View>
  );
}

// ─── 📊 Modular 2x2 Metric Card ────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  title,
  value,
  unit,
  subtitle,
  accentColor,
  onPress,
  extraAction,
}: {
  icon: any;
  title: string;
  value: string | number;
  unit?: string;
  subtitle: string;
  accentColor: string;
  onPress?: () => void;
  extraAction?: React.ReactNode;
}) {
  const colors = useColors();

  return (
    <Tap
      onPress={onPress}
      scaleTo={0.96}
      style={{
        width: (width - 40 - 10) / 2,
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'space-between',
        minHeight: 122,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{
          width: 36, height: 36, borderRadius: 12,
          backgroundColor: accentColor + '18',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={accentColor} />
        </View>
        {extraAction ? extraAction : (
          <View style={{
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: colors.background,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: colors.border,
          }}>
            <ArrowUpRight size={12} color={colors.muted} />
          </View>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
          <Text style={{ fontSize: 20, fontWeight: '900', color: colors.foreground, letterSpacing: -0.5 }}>
            {value}
          </Text>
          {unit ? (
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted }}>
              {unit}
            </Text>
          ) : null}
        </View>
        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.foreground, marginTop: 2 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 10, color: colors.muted, marginTop: 1 }} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Tap>
  );
}

// ─── 🗓️ Schedule Item Card ───────────────────────────────────────────────────

function ScheduleItem({
  item,
  completed,
  onPress,
  onViewDetails,
}: {
  item: { time: string; task: string; category: string; details?: string };
  completed: boolean;
  onPress: () => void;
  onViewDetails?: () => void;
}) {
  const colors = useColors();
  const categoryColors: Record<string, string> = {
    nutrition: '#00D9A3',
    training: '#38BDF8',
    skincare: '#F472B6',
    sleep: '#A78BFA',
    discipline: '#FFB800',
    appearance: '#FB923C',
    work: '#94A3B8',
  };
  const c = categoryColors[item.category] || colors.primary;

  return (
    <Tap
      onPress={onPress}
      scaleTo={0.98}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 8,
        backgroundColor: completed ? colors.success + '0E' : colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: completed ? colors.success + '40' : colors.border,
      }}
    >
      {/* Category color bar indicator */}
      <View style={{
        width: 3.5, height: 38, borderRadius: 2,
        backgroundColor: completed ? colors.success : c,
        marginRight: 14,
      }} />

      <View style={{ flex: 1, paddingRight: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <Text style={{
            fontSize: 11,
            color: completed ? colors.success : c,
            fontWeight: '800',
            letterSpacing: 0.3,
          }}>
            {item.time}
          </Text>
          <View style={{
            backgroundColor: (completed ? colors.success : c) + '18',
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}>
            <Text style={{
              fontSize: 9,
              fontWeight: '800',
              textTransform: 'uppercase',
              color: completed ? colors.success : c,
            }}>
              {item.category}
            </Text>
          </View>
        </View>

        <Text style={{
          fontSize: 13.5,
          fontWeight: completed ? '500' : '700',
          color: completed ? colors.muted : colors.foreground,
          textDecorationLine: completed ? 'line-through' : 'none',
          lineHeight: 18,
        }}>
          {item.task}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {onViewDetails && (
          <Tap
            onPress={onViewDetails}
            scaleTo={0.92}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              backgroundColor: c + '1A',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: c + '30',
            }}
          >
            <Text style={{ color: c, fontSize: 10, fontWeight: '800' }}>Details</Text>
            <ChevronRight size={10} color={c} />
          </Tap>
        )}

        {/* Circular Checkbox */}
        <View style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: completed ? colors.success : 'transparent',
          borderWidth: 2,
          borderColor: completed ? colors.success : colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {completed && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
        </View>
      </View>
    </Tap>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [log, setLog] = useState<DailyLog | null>(null);
  const [wisdomSource, setWisdomSource] = useState<'forge' | 'naval'>('forge');
  const [forgeIndex, setForgeIndex] = useState(0);
  const [navalIndex, setNavalIndex] = useState(0);
  const [dayNumber, setDayNumber] = useState(1);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [weeklyData, setWeeklyData] = useState<number[]>([]);

  const load = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const startDate = await AppRepo.getStartDate() || today;
    const { phase: p, dayNumber: dn } = AppRepo.calcPhaseAndDay(startDate);
    setPhase(p);
    setDayNumber(dn);

    const p_ = await ProfileRepo.get();
    setProfile(p_);

    const sched = getTodaySchedule();
    setScheduleItems(sched);

    let l = await DailyLogRepo.getForDate(today);
    if (!l) {
      l = await DailyLogRepo.getDefault(today, sched);
      await DailyLogRepo.save(l);
    }
    setLog(l);

    // Parse completed schedule items
    try {
      const sc = JSON.parse(l.scheduleJson || '[]') as any[];
      const map: Record<string, boolean> = {};
      sc.forEach((s: any) => { map[s.time + s.task] = s.completed; });
      setCompletedItems(map);
    } catch {}

    // Random quote indices
    setForgeIndex(Math.floor(Math.random() * QUOTES.length));
    setNavalIndex(Math.floor(Math.random() * NAVAL_QUOTES.length));

    // Weekly data
    const logs7 = await DailyLogRepo.getLast7Days();
    const pcts = logs7.map(l2 => l2.totalTasksCount > 0 ? Math.round((l2.completedTasksCount / l2.totalTasksCount) * 100) : 0);
    setWeeklyData(pcts.reverse());
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const nextQuote = () => {
    if (wisdomSource === 'naval') {
      setNavalIndex((prev) => (prev + 1) % NAVAL_QUOTES.length);
    } else {
      setForgeIndex((prev) => (prev + 1) % QUOTES.length);
    }
  };

  const currentQuote = wisdomSource === 'naval' ? NAVAL_QUOTES[navalIndex] : QUOTES[forgeIndex];

  const toggleScheduleItem = useCallback(async (item: any) => {
    const key = item.time + item.task;
    const newCompleted = { ...completedItems, [key]: !completedItems[key] };
    setCompletedItems(newCompleted);

    const today = new Date().toISOString().split('T')[0];
    let l = await DailyLogRepo.getForDate(today);
    if (!l) l = await DailyLogRepo.getDefault(today, scheduleItems);

    const sc = scheduleItems.map(s => ({
      ...s, completed: (newCompleted as any)[String(s.time) + String(s.task)] || false,
    }));
    const completed = sc.filter(s => s.completed).length;
    l.scheduleJson = JSON.stringify(sc);
    l.completedTasksCount = completed;
    l.totalTasksCount = sc.length;
    await DailyLogRepo.save(l);
    setLog({ ...l });
  }, [completedItems, scheduleItems]);

  const incrementWater = async () => {
    const current = log?.waterGlasses || 0;
    const newCount = current + 1;
    const today = new Date().toISOString().split('T')[0];
    let l = await DailyLogRepo.getForDate(today);
    if (!l) l = await DailyLogRepo.getDefault(today, scheduleItems);
    l.waterGlasses = newCount;
    await DailyLogRepo.save(l);
    setLog({ ...l });
  };

  const totalTasks = scheduleItems.length;
  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const completionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const dayName = getDayOfWeek().charAt(0).toUpperCase() + getDayOfWeek().slice(1);
  const phaseLabels = { 1: 'Foundation', 2: 'Build', 3: 'Maximize' };

  const getShortActiveName = (day: string) => {
    const full = PM_ACTIVES_ROTATION[day] || '';
    if (full.includes('Adapalene')) return 'Adapalene';
    if (full.includes('Alpha Arbutin')) return 'Alpha Arbutin';
    if (full.includes('REST')) return 'Barrier Rest';
    return 'Skincare PM';
  };

  /** Map a schedule task to { tabPath, subTab } so "View" lands on the right section. */
  const resolveRouteForTask = (item: { task: string; category: string }): { tabPath: string; subTab: string } | null => {
    const t = item.task.toLowerCase();
    const cat = item.category;

    if (t.includes('journal')) return { tabPath: '/(tabs)/discipline', subTab: 'journal' };
    if (t.includes('reading') || t.includes('review') || t.includes('plan week') || t.includes('personal time') || t.includes('hobby') || t.includes('gf time') || t.includes('read/plan'))
      return { tabPath: '/(tabs)/discipline', subTab: 'knowledge' };

    if (cat === 'training') {
      if (t.includes('posture')) return { tabPath: '/(tabs)/training', subTab: 'posture' };
      if (t.includes('priority')) return { tabPath: '/(tabs)/training', subTab: 'priority' };
      if (t.includes('walk') || t.includes('long walk')) return { tabPath: '/(tabs)/training', subTab: 'posture' };
      return { tabPath: '/(tabs)/training', subTab: 'workout' };
    }

    if (cat === 'skincare' || cat === 'appearance' || t.includes('skincare') || t.includes('hair') || t.includes('scalp') || t.includes('dermastamp') || t.includes('body scrub') || t.includes('face mask') || t.includes('ubtan') || t.includes('mewing') || t.includes('chewing') || t.includes('looksmax') || t.includes('sun exposure')) {
      if (t.includes('hair') || t.includes('scalp') || t.includes('dermastamp'))
        return { tabPath: '/(tabs)/appearance', subTab: 'hair' };
      if (t.includes('spf') || t.includes('helmet') || t.includes('sun') || t.includes('tan') || t.includes('visor'))
        return { tabPath: '/(tabs)/appearance', subTab: 'tanremoval' };
      if (t.includes('body scrub') || t.includes('body pack') || t.includes('body'))
        return { tabPath: '/(tabs)/appearance', subTab: 'bodycare' };
      if (t.includes('mewing') || t.includes('looksmax') || t.includes('chewing') || t.includes('asymmetry'))
        return { tabPath: '/(tabs)/appearance', subTab: 'looksmax' };
      return { tabPath: '/(tabs)/appearance', subTab: 'skincare' };
    }

    if (cat === 'nutrition') {
      if (t.includes('supplement') || t.includes('zinc') || t.includes('b12') || t.includes('omega') || t.includes('magnesium') || t.includes('d3') || t.includes('whey') || t.includes('creatine') || t.includes('turmeric') || t.includes('pumpkin'))
        return { tabPath: '/(tabs)/nutrition', subTab: 'supplements' };
      if (t.includes('water')) return { tabPath: '/(tabs)/nutrition', subTab: 'water' };
      return { tabPath: '/(tabs)/nutrition', subTab: 'meals' };
    }

    if (cat === 'discipline') {
      return { tabPath: '/(tabs)/discipline', subTab: 'dopamine' };
    }

    return null;
  };

  const navigateToDetails = async (item: { task: string; category: string }) => {
    const route = resolveRouteForTask(item);
    if (!route) return;
    await NavRepo.setPendingSubTab(route.tabPath, route.subTab);
    router.push(route.tabPath as any);
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 🌟 Header ─────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 13, color: colors.muted, fontWeight: '700' }}>
                {getGreeting()},
              </Text>
              <Text style={{ fontSize: 26, fontWeight: '900', color: colors.foreground, marginTop: 2, letterSpacing: -0.5 }}>
                {profile?.name || 'FORGE'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Tap
                onPress={() => router.push('/settings')}
                scaleTo={0.9}
                style={{
                  width: 38, height: 38, borderRadius: 12,
                  backgroundColor: colors.surface,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: colors.border,
                }}
              >
                <Settings size={18} color={colors.foreground} />
              </Tap>

              <View style={{
                backgroundColor: colors.primary + '18',
                borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6,
                borderWidth: 1, borderColor: colors.primary + '35',
              }}>
                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 11 }}>
                  Phase {phase}
                </Text>
              </View>
            </View>
          </View>

          {/* Micro Progress Bar for 365 Days */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700' }}>
              Day {dayNumber} of 365
            </Text>
            <View style={{ flex: 1, height: 5, backgroundColor: colors.surface, borderRadius: 3, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
              <View style={{ height: '100%', backgroundColor: colors.primary, borderRadius: 3, width: `${Math.min((dayNumber / 365) * 100, 100)}%` }} />
            </View>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>
              {Math.round((dayNumber / 365) * 100)}%
            </Text>
          </View>
        </View>

        {/* ── 🎯 Today's Hero Progress Card ─────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
          }}>
            {/* Card Header Row */}
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View>
                <Text style={{ fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  Daily Performance
                </Text>
                <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.foreground, marginTop: 1 }}>
                  {dayName} Protocol
                </Text>
              </View>

              <View style={{
                backgroundColor: completionPct >= 80 ? colors.success + '20' : colors.primary + '18',
                borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3,
                borderWidth: 1, borderColor: completionPct >= 80 ? colors.success + '40' : colors.primary + '35',
              }}>
                <Text style={{
                  color: completionPct >= 80 ? colors.success : colors.primary,
                  fontSize: 9.5, fontWeight: '800',
                }}>
                  {completionPct >= 100 ? 'COMPLETED' : completionPct >= 60 ? 'ON TRACK' : 'IN PROGRESS'}
                </Text>
              </View>
            </View>

            {/* Center Glowing Progress Ring (scaled down by 20%) */}
            <ProgressRing
              percentage={completionPct}
              size={148}
              strokeWidth={12}
              color={colors.primary}
              label="Forge Score"
              sublabel={`${completedCount} of ${totalTasks} tasks`}
            />

            {/* Bottom 3 Pillars */}
            <View style={{
              width: '100%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
              marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderColor: colors.border + '60',
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: colors.muted, fontWeight: '600' }}>Tasks</Text>
                <Text style={{ fontSize: 14, fontWeight: '900', color: colors.foreground, marginTop: 1 }}>
                  {completedCount}/{totalTasks}
                </Text>
              </View>
              <View style={{ width: 1, height: 20, backgroundColor: colors.border }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: colors.muted, fontWeight: '600' }}>Program</Text>
                <Text style={{ fontSize: 14, fontWeight: '900', color: colors.primary, marginTop: 1 }}>
                  {phaseLabels[phase]}
                </Text>
              </View>
              <View style={{ width: 1, height: 20, backgroundColor: colors.border }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: colors.muted, fontWeight: '600' }}>Streak</Text>
                <Text style={{ fontSize: 14, fontWeight: '900', color: colors.warning, marginTop: 1 }}>
                  {dayNumber}d 🔥
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 📊 Modular 2x2 Vitals Grid ─────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.foreground, marginBottom: 12 }}>
            Daily Vitals
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
            <MetricCard
              icon={Flame}
              title="Daily Streak"
              value={dayNumber}
              unit="days"
              subtitle="Unbroken focus"
              accentColor={colors.warning}
              onPress={() => router.navigate('/(tabs)/discipline')}
            />

            <MetricCard
              icon={Sparkles}
              title="Tonight's Active"
              value={getShortActiveName(dayName)}
              subtitle="Tap for routine"
              accentColor="#F472B6"
              onPress={async () => {
                await NavRepo.setPendingSubTab('/(tabs)/appearance', 'skincare');
                router.navigate('/(tabs)/appearance');
              }}
            />

            <MetricCard
              icon={Dumbbell}
              title="Training"
              value={dayName}
              subtitle="Tap to view session"
              accentColor="#A78BFA"
              onPress={() => router.navigate('/(tabs)/training')}
            />

            {/* Daily Quote Card replacing Hydration */}
            <View
              style={{
                width: (width - 40 - 10) / 2,
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 13,
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: 'space-between',
                minHeight: 122,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{
                  flexDirection: 'row',
                  backgroundColor: colors.background,
                  borderRadius: 10,
                  padding: 2,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}>
                  <Tap
                    onPress={() => setWisdomSource('forge')}
                    scaleTo={0.92}
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 2.5,
                      borderRadius: 7,
                      backgroundColor: wisdomSource === 'forge' ? colors.primary : 'transparent',
                    }}
                  >
                    <Text style={{
                      fontSize: 9.5,
                      fontWeight: '800',
                      color: wisdomSource === 'forge' ? '#FFFFFF' : colors.muted,
                    }}>
                      Forge
                    </Text>
                  </Tap>
                  <Tap
                    onPress={() => setWisdomSource('naval')}
                    scaleTo={0.92}
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 2.5,
                      borderRadius: 7,
                      backgroundColor: wisdomSource === 'naval' ? colors.primary : 'transparent',
                    }}
                  >
                    <Text style={{
                      fontSize: 9.5,
                      fontWeight: '800',
                      color: wisdomSource === 'naval' ? '#FFFFFF' : colors.muted,
                    }}>
                      Naval
                    </Text>
                  </Tap>
                </View>

                <Tap
                  onPress={nextQuote}
                  scaleTo={0.9}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                    backgroundColor: colors.background,
                    borderRadius: 9,
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <RotateCw size={9} color={colors.primary} />
                  <Text style={{ fontSize: 9.5, fontWeight: '800', color: colors.primary }}>Next</Text>
                </Tap>
              </View>

              <Tap onPress={nextQuote} scaleTo={0.98} style={{ marginTop: 8 }}>
                <Text
                  numberOfLines={3}
                  style={{
                    fontSize: 10.5,
                    fontStyle: 'italic',
                    color: colors.foreground,
                    lineHeight: 14.5,
                    fontWeight: '500',
                  }}
                >
                  "{currentQuote}"
                </Text>
                <Text
                  style={{
                    fontSize: 9.5,
                    fontWeight: '800',
                    color: colors.primary,
                    marginTop: 4,
                  }}
                  numberOfLines={1}
                >
                  {wisdomSource === 'naval' ? '— Naval Ravikant' : '— Forge Protocol'}
                </Text>
              </Tap>
            </View>
          </View>
        </View>

        {/* ── 🤖 Ask FORGE AI Card ──────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Tap
            onPress={() => router.navigate('/(tabs)/ai-coach')}
            scaleTo={0.98}
            style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 20, padding: 16,
              borderWidth: 1, borderColor: colors.primary + '40',
            }}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: colors.primary + '18',
              alignItems: 'center', justifyContent: 'center', marginRight: 14,
            }}>
              <Bot size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.foreground }}>
                Ask FORGE AI Coach
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                24/7 workout form, skincare, diet & mindset
              </Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </Tap>
        </View>

        {/* ── 📋 Today's Schedule & Protocol ─────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.foreground }}>
              Today's Protocol
            </Text>
            <View style={{
              backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4,
              borderWidth: 1, borderColor: colors.border,
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted }}>
                {completedCount} of {totalTasks} Done
              </Text>
            </View>
          </View>

          {scheduleItems.map((item, i) => {
            const detailsRoute = resolveRouteForTask(item);
            return (
              <ScheduleItem
                key={`${item.time}-${item.task}-${i}`}
                item={item}
                completed={completedItems[item.time + item.task] || false}
                onPress={() => toggleScheduleItem(item)}
                onViewDetails={detailsRoute ? () => navigateToDetails(item) : undefined}
              />
            );
          })}
        </View>

        {/* ── 📈 Weekly Completion Bar Chart ─────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.foreground, marginBottom: 12 }}>
            Weekly Consistency
          </Text>

          <View style={{
            backgroundColor: colors.surface, borderRadius: 20, padding: 18,
            borderWidth: 1, borderColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 85 }}>
              {weeklyData.length > 0 ? (
                weeklyData.map((pct, i) => {
                  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                  const isToday = i === 6;
                  return (
                    <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                      <View style={{
                        height: Math.max(12, (pct / 100) * 60),
                        width: isToday ? 24 : 18, borderRadius: 5,
                        backgroundColor: isToday ? colors.primary : pct > 70 ? colors.success + '90' : pct > 40 ? colors.warning + '90' : colors.border,
                        borderWidth: isToday ? 2 : 0, borderColor: isToday ? colors.background : 'transparent',
                      }} />
                      <Text style={{ fontSize: 9.5, color: colors.muted, fontWeight: '600', marginTop: 6 }}>
                        {days[i]}
                      </Text>
                      <Text style={{
                        fontSize: 9.5, color: isToday ? colors.primary : colors.muted,
                        fontWeight: isToday ? '900' : '600', marginTop: 2,
                      }}>
                        {pct}%
                      </Text>
                    </View>
                  );
                })
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>No activity logged this week yet.</Text>
                </View>
              )}
            </View>
            <Text style={{ color: colors.muted, fontSize: 10.5, textAlign: 'center', marginTop: 10, fontWeight: '500' }}>
              Daily task completion rate across the last 7 days
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
