import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, Dimensions, RefreshControl } from 'react-native';
import { Activity, Flame, Droplets, Dumbbell, Sparkles, Ban, Moon, Smartphone } from 'lucide-react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppRepo, DailyLogRepo, ProfileRepo, HabitRepo, WorkoutRepo,
  type DailyLog, type UserProfile,
} from '@/lib/db/database';
import {
  QUOTES, HABITS, WEEKDAY_SCHEDULE, SATURDAY_SCHEDULE, SUNDAY_SCHEDULE,
  DEFAULT_MILESTONES,
} from '@/lib/db/seeds';

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

// ─── Circular Progress Ring ────────────────────────────────────────────────────

function ProgressRing({ percentage, size = 160, strokeWidth = 14, color, label, sublabel }:
  { percentage: number; size?: number; strokeWidth?: number; color: string; label: string; sublabel: string }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: 'rgba(255,255,255,0.06)',
      }} />
      {/* Progress ring (simulated with border arcs) */}
      <View style={{
        position: 'absolute', width: size - strokeWidth * 0.5, height: size - strokeWidth * 0.5,
        borderRadius: (size - strokeWidth * 0.5) / 2,
        borderWidth: strokeWidth,
        borderTopColor: percentage > 0 ? color : 'transparent',
        borderRightColor: percentage > 25 ? color : 'transparent',
        borderBottomColor: percentage > 50 ? color : 'transparent',
        borderLeftColor: percentage > 75 ? color : 'transparent',
        transform: [{ rotate: '-90deg' }],
      }} />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color }}>{Math.round(percentage)}%</Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginTop: 2 }}>{label}</Text>
        <Text style={{ fontSize: 11, color: '#A0A0A0', marginTop: 2 }}>{sublabel}</Text>
      </View>
    </View>
  );
}

// ─── Quick Stat Card ─────────────────────────────────────────────────────────

function StatCard({ IconComponent, label, value, unit, color, onPress }:
  { IconComponent: any; label: string; value: string | number; unit?: string; color: string; onPress?: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.8 : 1,
        minWidth: (width - 56) / 4,
        marginRight: 8,
      })}
    >
      <IconComponent size={22} color={color} style={{ marginBottom: 4 }} />
      <Text style={{ fontSize: 18, fontWeight: '800', color }}>{value}</Text>
      {unit && <Text style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>{unit}</Text>}
      <Text style={{ fontSize: 10, color: colors.muted, textAlign: 'center', marginTop: 4 }}>{label}</Text>
    </Pressable>
  );
}

// ─── Schedule Item ─────────────────────────────────────────────────────────────

function ScheduleItem({ item, completed, onPress }:
  { item: { time: string; task: string; category: string }; completed: boolean; onPress: () => void }) {
  const colors = useColors();
  const categoryColors: Record<string, string> = {
    nutrition: '#00D9A3', training: '#60A5FA', skincare: '#F472B6',
    sleep: '#A78BFA', discipline: '#FFB800', appearance: '#FB923C', work: '#94A3B8',
  };
  const c = categoryColors[item.category] || colors.primary;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({
      flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
      paddingHorizontal: 14, marginBottom: 6,
      backgroundColor: completed ? 'rgba(0,217,163,0.06)' : colors.surface,
      borderRadius: 12, borderWidth: 1,
      borderColor: completed ? 'rgba(0,217,163,0.3)' : colors.border,
      opacity: pressed ? 0.8 : 1,
    })}>
      <View style={{
        width: 3, height: 36, borderRadius: 2, backgroundColor: c, marginRight: 12,
      }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: completed ? colors.success : c, fontWeight: '600', marginBottom: 2 }}>{item.time}</Text>
        <Text style={{ fontSize: 13, color: completed ? colors.muted : colors.foreground, textDecorationLine: completed ? 'line-through' : 'none' }}>
          {item.task}
        </Text>
      </View>
      <View style={{
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: completed ? colors.success : 'transparent',
        borderWidth: 2, borderColor: completed ? colors.success : colors.border,
        alignItems: 'center', justifyContent: 'center',
      }}>
        {completed && <Text style={{ color: '#000', fontSize: 12, fontWeight: '700' }}>✓</Text>}
      </View>
    </Pressable>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [log, setLog] = useState<DailyLog | null>(null);
  const [quote, setQuote] = useState('');
  const [dayNumber, setDayNumber] = useState(1);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [milestones, setMilestones] = useState<typeof DEFAULT_MILESTONES>([]);

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

    // Random quote
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    // Weekly data
    const logs7 = await DailyLogRepo.getLast7Days();
    const pcts = logs7.map(l2 => l2.totalTasksCount > 0 ? Math.round((l2.completedTasksCount / l2.totalTasksCount) * 100) : 0);
    setWeeklyData(pcts.reverse());

    // Milestones
    const storedMs = await AsyncStorage.getItem('forge_milestones');
    if (storedMs) setMilestones(JSON.parse(storedMs));
    else {
      const ms = DEFAULT_MILESTONES.map(m => ({ ...m, completed: false }));
      setMilestones(ms);
      await AsyncStorage.setItem('forge_milestones', JSON.stringify(ms));
    }
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

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

  const dayName = getDayOfWeek().charAt(0).toUpperCase() + getDayOfWeek().slice(1);
  const phaseLabels = { 1: 'Foundation', 2: 'Build', 3: 'Maximize' };

  const stats = [
    { icon: Activity, label: 'Weight', value: profile?.currentWeight || 45, unit: 'kg', color: colors.primary },
    { icon: Flame, label: 'Streak', value: dayNumber, unit: `days`, color: colors.warning },
    { icon: Moon, label: 'Sleep', value: log?.sleepHours || '-', unit: 'h', color: '#818CF8' },
    { icon: Droplets, label: 'Water', value: log?.waterGlasses || 0, unit: 'gl', color: '#60A5FA' },
    { icon: Dumbbell, label: 'Workout', value: log?.workoutCompleted ? 'Done' : 'Wait', color: log?.workoutCompleted ? colors.success : colors.muted },
    { icon: Sparkles, label: 'Skincare', value: (log?.skincareAM && log?.skincarePM) ? 'Done' : log?.skincareAM ? 'AM ✓' : 'Wait', color: '#F472B6' },
    { icon: Smartphone, label: 'Screen', value: log?.screenTimeHours || '-', unit: 'h', color: colors.muted },
    { icon: Ban, label: 'No Porn', value: '—', unit: 'd', color: colors.success },
    { icon: Ban, label: 'No Junk', value: '—', unit: 'd', color: colors.success },
  ];

  const phaseMs = DEFAULT_MILESTONES.filter(m => m.days === (phase === 1 ? 30 : phase === 2 ? 90 : 365));
  const doneMs = milestones.filter(m => (m as any).completed && m.days === (phase === 1 ? 30 : phase === 2 ? 90 : 365)).length;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────── */}
        <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 13, color: colors.muted, fontWeight: '500' }}>{getGreeting()},</Text>
              <Text style={{ fontSize: 28, fontWeight: '900', color: colors.foreground, marginTop: 2 }}>
                {profile?.name || 'FORGE'} 🔥
              </Text>
            </View>
            <View style={{ backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
              <Text style={{ color: '#000', fontWeight: '800', fontSize: 12 }}>Phase {phase}</Text>
              <Text style={{ color: '#000', fontSize: 10, fontWeight: '600', opacity: 0.7 }}>{phaseLabels[phase]}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              Day {dayNumber} of 365
            </Text>
            <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2 }}>
              <View style={{ height: 4, backgroundColor: colors.primary, borderRadius: 2, width: `${Math.min((dayNumber / 365) * 100, 100)}%` }} />
            </View>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{Math.round((dayNumber / 365) * 100)}%</Text>
          </View>
        </View>

        {/* ── Today's Completion Ring ─────────────── */}
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <ProgressRing
            percentage={completionPct}
            size={200}
            strokeWidth={16}
            color={colors.primary}
            label="Today's Progress"
            sublabel={`${completedCount} / ${totalTasks} tasks`}
          />
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 12 }}>
            {dayName} — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* ── Quick Stats ─────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12, paddingHorizontal: 6 }}>Today's Stats</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 6 }}>
            {stats.map((s, i) => (
              <StatCard key={i} IconComponent={s.icon} label={s.label} value={s.value} unit={s.unit} color={s.color} />
            ))}
          </ScrollView>
        </View>

        {/* ── Milestone Progress ─────────────────── */}
        <View style={{ paddingHorizontal: 22, marginBottom: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            {phase === 1 ? '30' : phase === 2 ? '90' : '365'}-Day Milestones
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ color: colors.foreground, fontWeight: '700' }}>{doneMs} of {phaseMs.length} completed</Text>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>
                {phaseMs.length > 0 ? Math.round((doneMs / phaseMs.length) * 100) : 0}%
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ height: 8, backgroundColor: colors.primary, borderRadius: 4, width: `${phaseMs.length > 0 ? (doneMs / phaseMs.length) * 100 : 0}%` }} />
            </View>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 8 }}>
              {phaseMs.slice(0, 3).map(m => `• ${m.title}`).join('\n')}
            </Text>
          </View>
        </View>

        {/* ── Daily Quote ─────────────────────────── */}
        <View style={{ paddingHorizontal: 22, marginBottom: 20 }}>
          <View style={{
            backgroundColor: colors.surface, borderRadius: 16, padding: 20,
            borderWidth: 1, borderColor: colors.border,
            borderLeftWidth: 4, borderLeftColor: colors.primary,
          }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary, letterSpacing: 1.5, marginBottom: 8 }}>DAILY WISDOM</Text>
            <Text style={{ color: colors.foreground, fontSize: 14, fontStyle: 'italic', lineHeight: 22 }}>
              "{quote}"
            </Text>
          </View>
        </View>

        {/* ── Schedule Timeline ─────────────────── */}
        <View style={{ paddingHorizontal: 22, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}>Today's Schedule</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>{dayName}</Text>
          </View>
          {scheduleItems.slice(0, 8).map((item, i) => (
            <ScheduleItem
              key={i}
              item={item}
              completed={completedItems[item.time + item.task] || false}
              onPress={() => toggleScheduleItem(item)}
            />
          ))}
          {scheduleItems.length > 8 && (
            <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center', paddingVertical: 8 }}>
              +{scheduleItems.length - 8} more items
            </Text>
          )}
        </View>

        {/* ── Weekly Summary ─────────────────────── */}
        <View style={{ paddingHorizontal: 22, marginBottom: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>This Week</Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 80 }}>
              {(weeklyData.length > 0 ? weeklyData : [40, 65, 85, 70, 90, 80, completionPct]).map((pct, i) => {
                const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                const isToday = i === 6;
                return (
                  <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{
                      height: Math.max(10, (pct / 100) * 60),
                      width: 20, borderRadius: 4,
                      backgroundColor: isToday ? colors.primary : pct > 70 ? 'rgba(0,217,163,0.5)' : pct > 40 ? 'rgba(255,184,0,0.5)' : colors.border,
                    }} />
                    <Text style={{ fontSize: 9, color: colors.muted, marginTop: 4 }}>{days[i]}</Text>
                    <Text style={{ fontSize: 9, color: isToday ? colors.primary : colors.muted, fontWeight: isToday ? '700' : '400' }}>
                      {pct}%
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={{ color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 8 }}>Daily task completion rate</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
