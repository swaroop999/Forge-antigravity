import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Dimensions, RefreshControl } from 'react-native';
import {
  Activity, Flame, Dumbbell, Settings, Check, ChevronRight,
  Sparkles, Bot, ArrowUpRight, RotateCw,
} from "lucide-react-native";
import { NavRepo } from '@/lib/db/database';
import { router } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import {
  AppRepo, DailyLogRepo, ProfileRepo,
  type DailyLog, type UserProfile,
} from '@/lib/db/database';
import {
  QUOTES, NAVAL_QUOTES, WEEKDAY_SCHEDULE, SATURDAY_SCHEDULE, SUNDAY_SCHEDULE,
  PM_ACTIVES_ROTATION, WORKOUT_PROGRAMS,
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

// ─── 🏃 Compact Circular Progress Ring ─────────────────────────────────────────

function ProgressRing({
  percentage,
  size = 90,
  strokeWidth = 8.5,
  color,
  label,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label?: string;
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
          opacity={0.7}
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
        <Text style={{ fontSize: 19, fontWeight: '800', color: colors.foreground, letterSpacing: -0.6 }}>
          {Math.round(percentage)}%
        </Text>
        {label ? (
          <Text style={{ fontSize: 8.5, fontWeight: '800', color: colors.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 1 }}>
            {label}
          </Text>
        ) : null}
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
        width: (width - 36 - 10) / 2,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 13,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'space-between',
        minHeight: 102,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{
          width: 30, height: 30, borderRadius: 9,
          backgroundColor: accentColor + '16',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color={accentColor} strokeWidth={2.2} />
        </View>
        {extraAction ? extraAction : (
          <View style={{
            width: 20, height: 20, borderRadius: 7,
            backgroundColor: colors.background,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: colors.border,
          }}>
            <ArrowUpRight size={11} color={colors.muted} />
          </View>
        )}
      </View>

      <View style={{ marginTop: 9 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
          <Text
            numberOfLines={1}
            style={{ fontSize: 16, fontWeight: '800', color: colors.foreground, letterSpacing: -0.4, flexShrink: 1 }}
          >
            {value}
          </Text>
          {unit ? (
            <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.muted }}>
              {unit}
            </Text>
          ) : null}
        </View>
        <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.foreground, marginTop: 2 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 9.5, color: colors.muted, marginTop: 1 }} numberOfLines={1}>
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
    nutrition: '#10B981',
    training: '#38BDF8',
    skincare: '#F472B6',
    sleep: '#A78BFA',
    discipline: '#F59E0B',
    appearance: '#FB923C',
    work: '#94A3B8',
  };
  const c = categoryColors[item.category] || colors.primary;

  return (
    <Tap
      onPress={onPress}
      scaleTo={0.985}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 14,
        marginBottom: 7,
        backgroundColor: completed ? colors.success + '0C' : colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: completed ? colors.success + '35' : colors.border,
      }}
    >
      {/* Category color bar indicator */}
      <View style={{
        width: 3, height: 32, borderRadius: 2,
        backgroundColor: completed ? colors.success : c,
        marginRight: 12,
      }} />

      <View style={{ flex: 1, paddingRight: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Text style={{
            fontSize: 10.5,
            color: completed ? colors.success : c,
            fontWeight: '800',
            letterSpacing: 0.2,
          }}>
            {item.time}
          </Text>
          <View style={{
            backgroundColor: (completed ? colors.success : c) + '16',
            borderRadius: 5,
            paddingHorizontal: 5,
            paddingVertical: 1.5,
          }}>
            <Text style={{
              fontSize: 8.5,
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: 0.3,
              color: completed ? colors.success : c,
            }}>
              {item.category}
            </Text>
          </View>
        </View>

        <Text style={{
          fontSize: 13,
          fontWeight: completed ? '500' : '700',
          color: completed ? colors.muted : colors.foreground,
          textDecorationLine: completed ? 'line-through' : 'none',
          lineHeight: 17,
        }}>
          {item.task}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {onViewDetails && (
          <Tap
            onPress={onViewDetails}
            scaleTo={0.93}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              backgroundColor: c + '14',
              borderRadius: 8,
              paddingHorizontal: 7,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: c + '28',
            }}
          >
            <Text style={{ color: c, fontSize: 9.5, fontWeight: '800' }}>Open</Text>
            <ChevronRight size={10} color={c} />
          </Tap>
        )}

        {/* Circular Checkbox */}
        <View style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          backgroundColor: completed ? colors.success : 'transparent',
          borderWidth: 1.8,
          borderColor: completed ? colors.success : colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {completed && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
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

  const totalTasks = scheduleItems.length;
  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const completionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const dayKey = getDayOfWeek();
  const dayName = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
  const phaseLabels = { 1: 'Foundation', 2: 'Build', 3: 'Maximize' };

  // Dynamic workout lookup from WORKOUT_PROGRAMS (Mon–Sat active, Sunday Rest Day)
  const todayWorkout = WORKOUT_PROGRAMS.find(w => w.phase === phase && w.dayOfWeek === dayKey);
  const isRestDay = !todayWorkout || todayWorkout.exercises.length === 0 || todayWorkout.type.toUpperCase().includes('REST');
  const todayWorkoutLabel = isRestDay ? 'Rest & Recovery' : (todayWorkout?.type || dayName);
  const todayWorkoutSub = isRestDay
    ? 'Sunday active recovery'
    : `${todayWorkout?.exercises.length || 0} exercises · ${dayName}`;

  const getShortActiveName = (day: string) => {
    const full = PM_ACTIVES_ROTATION[day] || '';
    if (full.includes('Adapalene')) return 'Adapalene';
    if (full.includes('Alpha Arbutin')) return 'Alpha Arbutin';
    if (full.includes('REST')) return 'Barrier Rest';
    return 'Skincare PM';
  };

  /** Map a schedule task to { tabPath, subTab } so "Open" lands on the right section. */
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

  // Compute dynamic weekday letters for the last 7 days ending today
  const getLast7DayLabels = () => {
    const shortLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const todayIdx = new Date().getDay();
    return Array.from({ length: 7 }, (_, i) => shortLetters[(todayIdx - 6 + i + 7) % 7]);
  };
  const weekLabels = getLast7DayLabels();

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        overScrollMode="always"
        bounces={true}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        {/* ── 🌟 Compact Header ─────────────────────────────── */}
        <View style={{ paddingHorizontal: 18, paddingTop: 6, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 11.5, color: colors.muted, fontWeight: '700', letterSpacing: 0.2 }}>
                {getGreeting()} · {dayName}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground, marginTop: 1, letterSpacing: -0.5 }}>
                {profile?.name || 'FORGE'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                backgroundColor: colors.primary + '16',
                borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
                borderWidth: 1, borderColor: colors.primary + '30',
              }}>
                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 10.5 }}>
                  Phase {phase} · {phaseLabels[phase]}
                </Text>
              </View>

              <Tap
                onPress={() => router.push('/settings')}
                scaleTo={0.92}
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  backgroundColor: colors.surface,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: colors.border,
                }}
              >
                <Settings size={16} color={colors.foreground} />
              </Tap>
            </View>
          </View>

          {/* Micro Progress Bar for 365 Days */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 }}>
            <Text style={{ color: colors.muted, fontSize: 10.5, fontWeight: '700' }}>
              Day {dayNumber}/365
            </Text>
            <View style={{ flex: 1, height: 4, backgroundColor: colors.surface, borderRadius: 2, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
              <View style={{ height: '100%', backgroundColor: colors.primary, borderRadius: 2, width: `${Math.min((dayNumber / 365) * 100, 100)}%` }} />
            </View>
            <Text style={{ color: colors.primary, fontSize: 10.5, fontWeight: '800' }}>
              {Math.round((dayNumber / 365) * 100)}%
            </Text>
          </View>
        </View>

        {/* ── 🎯 Compact Horizontal Hero Progress Card ─────────────── */}
        <View style={{ paddingHorizontal: 18, marginBottom: 14 }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          }}>
            {/* Left: Compact 90px Progress Ring */}
            <ProgressRing
              percentage={completionPct}
              size={90}
              strokeWidth={8.5}
              color={colors.primary}
              label="Score"
            />

            {/* Right: Protocol Summary & 3 Inline Pillars */}
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, paddingRight: 6 }}>
                  <Text style={{ fontSize: 9.5, fontWeight: '800', color: colors.muted, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                    {dayName} Protocol
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: colors.foreground, marginTop: 1 }} numberOfLines={1}>
                    {todayWorkoutLabel}
                  </Text>
                </View>

                <View style={{
                  backgroundColor: completionPct >= 80 ? colors.success + '1C' : colors.primary + '16',
                  borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2.5,
                  borderWidth: 1, borderColor: completionPct >= 80 ? colors.success + '38' : colors.primary + '30',
                }}>
                  <Text style={{
                    color: completionPct >= 80 ? colors.success : colors.primary,
                    fontSize: 8.5, fontWeight: '800', letterSpacing: 0.4,
                  }}>
                    {completionPct >= 100 ? 'DONE' : completionPct >= 60 ? 'ON TRACK' : 'ACTIVE'}
                  </Text>
                </View>
              </View>

              {/* Inline 3 Stat Pillars */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 10,
                paddingTop: 9,
                borderTopWidth: 1,
                borderColor: colors.border,
              }}>
                <View>
                  <Text style={{ fontSize: 9.5, color: colors.muted, fontWeight: '600' }}>Tasks</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.foreground, marginTop: 1 }}>
                    {completedCount}/{totalTasks}
                  </Text>
                </View>
                <View style={{ width: 1, height: 18, backgroundColor: colors.border }} />
                <View>
                  <Text style={{ fontSize: 9.5, color: colors.muted, fontWeight: '600' }}>Split</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary, marginTop: 1 }}>
                    {isRestDay ? 'Rest' : 'Mon–Sat'}
                  </Text>
                </View>
                <View style={{ width: 1, height: 18, backgroundColor: colors.border }} />
                <View>
                  <Text style={{ fontSize: 9.5, color: colors.muted, fontWeight: '600' }}>Streak</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 }}>
                    <Flame size={12} color={colors.warning} />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.warning }}>
                      {dayNumber}d
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── 📊 Modular 2x2 Vitals Grid ─────────────────────── */}
        <View style={{ paddingHorizontal: 18, marginBottom: 14 }}>
          <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.foreground, marginBottom: 9, letterSpacing: -0.2 }}>
            Daily Vitals
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
            <MetricCard
              icon={Flame}
              title="Daily Streak"
              value={dayNumber}
              unit="days"
              subtitle="Unbroken discipline"
              accentColor={colors.warning}
              onPress={() => router.navigate('/(tabs)/discipline')}
            />

            <MetricCard
              icon={Sparkles}
              title="Tonight's Active"
              value={getShortActiveName(dayName)}
              subtitle="Tap for PM skincare"
              accentColor="#F472B6"
              onPress={async () => {
                await NavRepo.setPendingSubTab('/(tabs)/appearance', 'skincare');
                router.navigate('/(tabs)/appearance');
              }}
            />

            <MetricCard
              icon={Dumbbell}
              title="Training Session"
              value={todayWorkoutLabel}
              subtitle={todayWorkoutSub}
              accentColor="#38BDF8"
              onPress={() => router.navigate('/(tabs)/training')}
            />

            {/* Daily Quote Card (Forge | Naval) */}
            <View
              style={{
                width: (width - 36 - 10) / 2,
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: 'space-between',
                minHeight: 102,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{
                  flexDirection: 'row',
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  padding: 2,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}>
                  <Tap
                    onPress={() => setWisdomSource('forge')}
                    scaleTo={0.93}
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                      backgroundColor: wisdomSource === 'forge' ? colors.primary : 'transparent',
                    }}
                  >
                    <Text style={{
                      fontSize: 9,
                      fontWeight: '800',
                      color: wisdomSource === 'forge' ? '#FFFFFF' : colors.muted,
                    }}>
                      Forge
                    </Text>
                  </Tap>
                  <Tap
                    onPress={() => setWisdomSource('naval')}
                    scaleTo={0.93}
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                      backgroundColor: wisdomSource === 'naval' ? colors.primary : 'transparent',
                    }}
                  >
                    <Text style={{
                      fontSize: 9,
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
                    borderRadius: 7,
                    paddingHorizontal: 6,
                    paddingVertical: 2.5,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <RotateCw size={9} color={colors.primary} />
                  <Text style={{ fontSize: 9, fontWeight: '800', color: colors.primary }}>Next</Text>
                </Tap>
              </View>

              <Tap onPress={nextQuote} scaleTo={0.98} style={{ marginTop: 6 }}>
                <Text
                  numberOfLines={3}
                  style={{
                    fontSize: 10,
                    fontStyle: 'italic',
                    color: colors.foreground,
                    lineHeight: 13.5,
                    fontWeight: '500',
                  }}
                >
                  "{currentQuote}"
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '800',
                    color: colors.primary,
                    marginTop: 3,
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
        <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
          <Tap
            onPress={() => router.navigate('/(tabs)/ai-coach')}
            scaleTo={0.985}
            style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14,
              borderWidth: 1, borderColor: colors.primary + '38',
            }}
          >
            <View style={{
              width: 36, height: 36, borderRadius: 11,
              backgroundColor: colors.primary + '16',
              alignItems: 'center', justifyContent: 'center', marginRight: 12,
            }}>
              <Bot size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.foreground }}>
                Ask FORGE AI Coach
              </Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>
                Form checks, macros, skincare & protocol adjustments
              </Text>
            </View>
            <ChevronRight size={16} color={colors.muted} />
          </Tap>
        </View>

        {/* ── 📋 Today's Schedule & Protocol ─────────────────── */}
        <View style={{ paddingHorizontal: 18, marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.foreground, letterSpacing: -0.2 }}>
              Today's Protocol
            </Text>
            <View style={{
              backgroundColor: colors.surface, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 3,
              borderWidth: 1, borderColor: colors.border,
            }}>
              <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.muted }}>
                {completedCount}/{totalTasks} Done
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
        <View style={{ paddingHorizontal: 18, marginBottom: 20 }}>
          <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.foreground, marginBottom: 10, letterSpacing: -0.2 }}>
            Weekly Consistency
          </Text>

          <View style={{
            backgroundColor: colors.surface, borderRadius: 16, padding: 14,
            borderWidth: 1, borderColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 78 }}>
              {weeklyData.length > 0 ? (
                weeklyData.map((pct, i) => {
                  const isToday = i === weeklyData.length - 1;
                  return (
                    <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                      <View style={{
                        height: Math.max(10, (pct / 100) * 52),
                        width: isToday ? 22 : 16, borderRadius: 5,
                        backgroundColor: isToday ? colors.primary : pct > 70 ? colors.success + '85' : pct > 40 ? colors.warning + '85' : colors.border,
                      }} />
                      <Text style={{ fontSize: 9.5, color: isToday ? colors.foreground : colors.muted, fontWeight: isToday ? '800' : '600', marginTop: 5 }}>
                        {weekLabels[i] || 'D'}
                      </Text>
                      <Text style={{
                        fontSize: 9, color: isToday ? colors.primary : colors.muted,
                        fontWeight: isToday ? '800' : '600', marginTop: 1,
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
            <Text style={{ color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 8, fontWeight: '500' }}>
              7-day rolling protocol completion · Sunday is active recovery
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
