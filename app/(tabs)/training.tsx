import * as Haptics from "expo-haptics";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check } from 'lucide-react-native';
import {
  ScrollView, View, Text, Pressable, TextInput, Alert, Modal,
  RefreshControl, FlatList,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { SubTabBar } from '@/components/sub-tab-bar';
import { useColors } from '@/hooks/use-colors';
import { AppRepo, WorkoutRepo, DailyLogRepo, type WorkoutLog } from '@/lib/db/database';
import { EXERCISES, WORKOUT_PROGRAMS, type Exercise, type WorkoutDay } from '@/lib/db/seeds';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Tab = 'workout' | 'program' | 'library' | 'progress' | 'posture' | 'priority';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'workout', label: "Today", icon: '💪' },
  { key: 'program', label: 'Program', icon: '📋' },
  { key: 'library', label: 'Library', icon: '📚' },
  { key: 'progress', label: 'Progress', icon: '📈' },
  { key: 'posture', label: 'Posture', icon: '🧘' },
  { key: 'priority', label: 'Priority', icon: '⭐' },
];

// ─── Today's Workout ──────────────────────────────────────────────────────────

function TodaysWorkout({ phase, dayOfWeek }: { phase: number; dayOfWeek: string }) {
  const colors = useColors();
  const [workout, setWorkout] = useState<WorkoutDay | null>(null);
  const [sets, setSets] = useState<Record<string, { done: number; weights: string[] }>>({});
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);

  useEffect(() => {
    const w = WORKOUT_PROGRAMS.find(p => p.phase === phase && p.dayOfWeek === dayOfWeek);
    setWorkout(w || null);
    if (w) {
      const s: Record<string, { done: number; weights: string[] }> = {};
      w.exercises.forEach(e => { s[e.exerciseId] = { done: 0, weights: Array(e.sets).fill('') }; });
      setSets(s);
    }
  }, [phase, dayOfWeek]);

  useEffect(() => {
    return () => { if (timerInterval) clearInterval(timerInterval); };
  }, [timerInterval]);

  const startRestTimer = (seconds: number) => {
    if (timerInterval) clearInterval(timerInterval);
    setRestTimer(seconds);
    const iv = setInterval(() => {
      setRestTimer(prev => {
        if (prev === null || prev <= 1) { clearInterval(iv); return null; }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(iv as any);
  };

  const completeSet = (exerciseId: string, restSecs: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSets(prev => {
      const ex = prev[exerciseId] || { done: 0, weights: [] };
      return { ...prev, [exerciseId]: { ...ex, done: ex.done + 1 } };
    });
    startRestTimer(restSecs);
  };

  const saveWorkout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const today = new Date().toISOString().split('T')[0];
    const log: WorkoutLog = {
      id: today, date: today, phase,
      dayType: workout?.type || '', warmupDone: true,
      exercisesJson: JSON.stringify(sets),
      totalDuration: 35, totalVolume: 0, rating: 4, completed: true,
    };
    await WorkoutRepo.save(log);
    let dl = await DailyLogRepo.getForDate(today);
    if (dl) { dl.workoutCompleted = true; await DailyLogRepo.save(dl); }
    setWorkoutComplete(true);
    Alert.alert('💪 Workout Complete!', 'Well done! Your workout has been logged. Recovery starts now.');
  };

  if (!workout) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 32, marginBottom: 12 }}>🛌</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>Rest Day</Text>
          <Text style={{ color: colors.muted, textAlign: 'center', lineHeight: 20 }}>
            Today is your rest day. Do your posture routine, priority movements (lateral raises, neck, shrugs), and a 20-min walk.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* Workout Header */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.foreground }}>{workout.type}</Text>
        <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>{workout.description}</Text>
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 12 }}>
          <View style={{ backgroundColor: colors.primary + '22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>{workout.exercises.length} exercises</Text>
          </View>
          <View style={{ backgroundColor: colors.warning + '22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ color: colors.warning, fontWeight: '700', fontSize: 12 }}>~35 min</Text>
          </View>
        </View>
      </View>

      {/* Warmup Reminder */}
      {!workoutStarted && (
        <View style={{ backgroundColor: colors.warning + '20', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.warning + '40' }}>
          <Text style={{ color: colors.warning, fontWeight: '700', marginBottom: 4 }}>⚠️ WARMUP FIRST (5 min)</Text>
          <Text style={{ color: colors.foreground, fontSize: 12 }}>Arm circles × 30, Leg swings × 20, Hip circles × 10, Jumping jacks × 20</Text>
        </View>
      )}

      {/* Rest Timer */}
      {restTimer !== null && (
        <View style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 14, marginBottom: 16, alignItems: 'center' }}>
          <Text style={{ color: '#000', fontWeight: '800', fontSize: 24 }}>{restTimer}s</Text>
          <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>Rest — next set in {restTimer}s</Text>
          <Pressable onPress={() => { if (timerInterval) clearInterval(timerInterval); setRestTimer(null); }} style={{ marginTop: 8 }}>
            <Text style={{ color: '#000', fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' }}>Skip rest</Text>
          </Pressable>
        </View>
      )}

      {/* Exercise Cards */}
      {workout.exercises.map((ex, idx) => {
        const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
        const exSets = sets[ex.exerciseId] || { done: 0, weights: [] };
        const allDone = exSets.done >= ex.sets;

        return (
          <View key={idx} style={{
            backgroundColor: allDone ? 'rgba(0,217,163,0.08)' : colors.surface,
            borderRadius: 16, padding: 16, marginBottom: 12,
            borderWidth: 1, borderColor: allDone ? 'rgba(0,217,163,0.4)' : colors.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: allDone ? colors.success : colors.foreground }}>
                  {allDone ? '✓ ' : ''}{exercise?.name || ex.exerciseId}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                  {ex.sets} sets × {ex.reps} reps · {ex.restSeconds}s rest
                </Text>
                {ex.notes && <Text style={{ color: colors.primary, fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>{ex.notes}</Text>}
              </View>
              <View style={{ backgroundColor: allDone ? colors.success + '30' : colors.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: allDone ? colors.success : colors.muted, fontWeight: '700', fontSize: 11 }}>
                  {exSets.done}/{ex.sets}
                </Text>
              </View>
            </View>

            {/* Form Cues */}
            {exercise?.formCues && (
              <View style={{ backgroundColor: colors.background, borderRadius: 8, padding: 10, marginBottom: 10 }}>
                {exercise.formCues.slice(0, 2).map((cue, ci) => (
                  <Text key={ci} style={{ color: colors.muted, fontSize: 11, marginBottom: 2 }}>• {cue}</Text>
                ))}
              </View>
            )}

            {/* Set Buttons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {Array.from({ length: ex.sets }).map((_, si) => (
                <Pressable
                  key={si}
                  onPress={() => si === exSets.done ? completeSet(ex.exerciseId, ex.restSeconds) : undefined}
                  disabled={si !== exSets.done || allDone}
                  style={({ pressed }) => ({
                    flex: 1, height: 40, borderRadius: 10,
                    backgroundColor: si < exSets.done ? colors.success : si === exSets.done ? colors.primary : colors.border,
                    alignItems: 'center', justifyContent: 'center',
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ color: si < exSets.done ? '#000' : si === exSets.done ? '#000' : colors.muted, fontWeight: '700', fontSize: 12 }}>
                    {si < exSets.done ? '✓' : `S${si + 1}`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}

      {/* Complete Workout Button */}
      {!workoutComplete && (
        <Pressable
          onPress={() => { setWorkoutStarted(true); saveWorkout(); }}
          style={({ pressed }) => ({
            backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 18,
            alignItems: 'center', marginTop: 8, opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: '#000', fontWeight: '800', fontSize: 16 }}>✓ Complete Workout</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

// ─── Program Overview ─────────────────────────────────────────────────────────

function ProgramOverview({ phase }: { phase: number }) {
  const colors = useColors();
  const phaseWorkouts = WORKOUT_PROGRAMS.filter(w => w.phase === phase);
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.foreground, marginBottom: 4 }}>Phase {phase} Program</Text>
      <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 20 }}>
        {phase === 1 ? 'Days 1-30: 4-day split, 30 min max' : phase === 2 ? 'Days 31-90: 5-day PPL split, 45 min' : 'Days 91-365: 6-day advanced split, 60 min'}
      </Text>

      {days.map(day => {
        const w = phaseWorkouts.find(p => p.dayOfWeek === day);
        if (!w) return null;
        const isRestDay = w.type.includes('REST') || w.type.includes('Rest');
        return (
          <View key={day} style={{
            backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10,
            borderWidth: 1, borderColor: isRestDay ? colors.border : colors.primary + '40',
            borderLeftWidth: 4, borderLeftColor: isRestDay ? colors.border : colors.primary,
          }}>
            <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700', marginBottom: 4 }}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: isRestDay ? colors.muted : colors.foreground }}>{w.type}</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{w.description}</Text>
            {!isRestDay && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 }}>
                {w.exercises.slice(0, 4).map((e, i) => {
                  const ex = EXERCISES.find(ex => ex.id === e.exerciseId);
                  return (
                    <View key={i} style={{ backgroundColor: colors.background, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ color: colors.foreground, fontSize: 10 }}>{ex?.name || e.exerciseId}</Text>
                    </View>
                  );
                })}
                {w.exercises.length > 4 && (
                  <View style={{ backgroundColor: colors.background, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ color: colors.muted, fontSize: 10 }}>+{w.exercises.length - 4} more</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}

      {/* Progressive Overload Note */}
      <View style={{ backgroundColor: colors.primary + '15', borderRadius: 14, padding: 16, marginTop: 8, borderWidth: 1, borderColor: colors.primary + '40' }}>
        <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 6 }}>Progressive Overload Rule</Text>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
          Every week, add 1-2 reps OR increase weight by 0.5-1 kg on at least 1 exercise per session. Track ALL your sets. Numbers don't lie.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Exercise Library ─────────────────────────────────────────────────────────

function ExerciseLibrary() {
  const colors = useColors();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<Exercise | null>(null);

  const categories = ['push', 'pull', 'legs', 'core', 'posture', 'priority', 'mobility'];
  const filtered = EXERCISES.filter(e => {
    const matchSearch = search.length === 0 || e.name.toLowerCase().includes(search.toLowerCase()) || e.muscles.some(m => m.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCategory === null || e.category === filterCategory;
    return matchSearch && matchCat;
  });

  if (selected) {
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Pressable onPress={() => setSelected(null)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>←</Text>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Back to Library</Text>
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground, marginBottom: 6 }}>{selected.name}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <View style={{ backgroundColor: colors.primary + '22', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>{selected.category}</Text>
          </View>
          <View style={{ backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.muted, fontSize: 11 }}>{selected.difficulty}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>MUSCLES</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {selected.muscles.map((m, i) => (
              <View key={i} style={{ backgroundColor: colors.border, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: colors.foreground, fontSize: 12 }}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 8 }}>How to do it</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>{selected.description}</Text>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.success, fontWeight: '700', marginBottom: 8 }}>✓ Form Cues</Text>
          {selected.formCues.map((c, i) => <Text key={i} style={{ color: colors.foreground, fontSize: 13, marginBottom: 4 }}>• {c}</Text>)}
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.error, fontWeight: '700', marginBottom: 8 }}>✗ Common Mistakes</Text>
          {selected.mistakes.map((m, i) => <Text key={i} style={{ color: colors.foreground, fontSize: 13, marginBottom: 4 }}>• {m}</Text>)}
        </View>

        {selected.progression && (
          <View style={{ backgroundColor: colors.warning + '20', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.warning + '40' }}>
            <Text style={{ color: colors.warning, fontWeight: '700', marginBottom: 4 }}>Progression Path</Text>
            <Text style={{ color: colors.foreground, fontSize: 13 }}>{selected.progression}</Text>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <TextInput
          placeholder="Search exercises or muscles..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: colors.foreground, fontSize: 14 }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {[null, ...categories].map(cat => (
            <Pressable key={cat ?? 'all'} onPress={() => setFilterCategory(cat)}
              style={{ backgroundColor: filterCategory === cat ? colors.primary : colors.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: filterCategory === cat ? colors.primary : colors.border }}>
              <Text style={{ color: filterCategory === cat ? '#000' : colors.foreground, fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                {cat ?? 'All'} {cat === null ? `(${EXERCISES.length})` : `(${EXERCISES.filter(e => e.category === cat).length})`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={e => e.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelected(item)} style={({ pressed }) => ({
            backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 8,
            borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>{item.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{item.muscles.join(' · ')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ backgroundColor: colors.primary + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700', textTransform: 'capitalize' }}>{item.category}</Text>
              </View>
              <Text style={{ color: colors.muted }}>›</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

// ─── Posture Screen ────────────────────────────────────────────────────────────

function PostureScreen() {
  const colors = useColors();
  const postureExercises = EXERCISES.filter(e => e.category === 'posture');
  const [done, setDone] = useState<Record<string, boolean>>({});

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.primary, marginBottom: 4 }}>Goal: 1–1.5 inches visual height</Text>
        <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
          Forward head posture, rounded shoulders, and anterior pelvic tilt are your 3 postural issues. Daily work for 8-12 weeks creates permanent change.
        </Text>
      </View>

      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>Daily Posture Routine (10 min)</Text>
      {postureExercises.map((ex, i) => (
        <Pressable key={ex.id} onPress={() => setDone(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
          style={({ pressed }) => ({
            backgroundColor: done[ex.id] ? 'rgba(0,217,163,0.08)' : colors.surface,
            borderRadius: 12, padding: 14, marginBottom: 8,
            borderWidth: 1, borderColor: done[ex.id] ? colors.success + '60' : colors.border,
            flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.8 : 1,
          })}>
          <View style={{
            width: 24, height: 24, borderRadius: 12,
            backgroundColor: done[ex.id] ? colors.success : 'transparent',
            borderWidth: 2, borderColor: done[ex.id] ? colors.success : colors.border,
            marginRight: 12, alignItems: 'center', justifyContent: 'center',
          }}>
            {done[ex.id] && <Check size={14} color="#000" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: done[ex.id] ? colors.muted : colors.foreground, textDecorationLine: done[ex.id] ? 'line-through' : 'none' }}>{ex.name}</Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{ex.description.slice(0, 80)}...</Text>
          </View>
        </Pressable>
      ))}

      <View style={{ backgroundColor: colors.warning + '20', borderRadius: 14, padding: 16, marginTop: 8, borderWidth: 1, borderColor: colors.warning + '40' }}>
        <Text style={{ color: colors.warning, fontWeight: '700', marginBottom: 6 }}>⚠️ Height Perception Tips</Text>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
          • Monochromatic outfits (black head-to-toe){'\n'}
          • Chelsea boots / boots with heel{'\n'}
          • Fitted clothing — baggy = shorter{'\n'}
          • High-waisted pants = longer legs{'\n'}
          • Short jacket length (bomber style)
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Priority Movements ────────────────────────────────────────────────────────

function PriorityMovements() {
  const colors = useColors();
  const priority = EXERCISES.filter(e => e.category === 'priority');
  const [done, setDone] = useState<Record<string, boolean>>({});

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <View style={{ backgroundColor: colors.primary + '20', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.primary + '50' }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.primary, marginBottom: 4 }}>Do these DAILY</Text>
        <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>
          These movements target your specific visual weaknesses. Narrow shoulders, absent traps, and thin neck are your #1, #2, #3 issues. Fix them every single day.
        </Text>
      </View>

      {priority.map((ex) => (
        <Pressable key={ex.id} onPress={() => setDone(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
          style={({ pressed }) => ({
            backgroundColor: done[ex.id] ? 'rgba(0,217,163,0.08)' : colors.surface,
            borderRadius: 14, padding: 16, marginBottom: 10,
            borderWidth: 1, borderColor: done[ex.id] ? colors.success + '60' : colors.primary + '30',
            opacity: pressed ? 0.8 : 1,
          })}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: done[ex.id] ? colors.success : colors.primary + '30',
              borderWidth: 2, borderColor: done[ex.id] ? colors.success : colors.primary,
              marginRight: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2,
            }}>
              {done[ex.id] && <Check size={14} color="#000" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', fontSize: 15, color: done[ex.id] ? colors.success : colors.foreground }}>
                {ex.name}
              </Text>
              <Text style={{ color: colors.primary, fontSize: 11, marginTop: 4, fontWeight: '600' }}>
                {ex.muscles[0]}
              </Text>
              <Text style={{ color: colors.foreground, fontSize: 12, marginTop: 6, lineHeight: 18 }}>
                {ex.description}
              </Text>
              <View style={{ backgroundColor: colors.background, borderRadius: 8, padding: 8, marginTop: 8 }}>
                {ex.formCues.map((c, i) => (
                  <Text key={i} style={{ color: colors.success, fontSize: 11, marginBottom: 2 }}>✓ {c}</Text>
                ))}
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Training Progress ─────────────────────────────────────────────────────────

function TrainingProgress() {
  const colors = useColors();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [measurements, setMeasurements] = useState<any>({});
  const [showMeasure, setShowMeasure] = useState(false);

  useEffect(() => {
    WorkoutRepo.getLast(30).then(setWorkouts);
    AsyncStorage.getItem('forge_measurements').then(s => { if (s) setMeasurements(JSON.parse(s)); });
  }, []);

  const weeklyCount = workouts.filter(w => {
    const wDate = new Date(w.date);
    const now = new Date();
    return (now.getTime() - wDate.getTime()) < 7 * 24 * 60 * 60 * 1000 && w.completed;
  }).length;

  const measureFields = ['chest', 'shoulder', 'waist', 'hips', 'thigh', 'calf', 'neck', 'bicep'];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Weekly Stats */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'This Week', value: weeklyCount, unit: 'workouts', color: colors.primary },
          { label: 'Total', value: workouts.filter(w => w.completed).length, unit: 'completed', color: colors.success },
          { label: 'Streak', value: '—', unit: 'days', color: colors.warning },
        ].map((s, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: s.color }}>{s.value}</Text>
            <Text style={{ fontSize: 10, color: colors.muted }}>{s.unit}</Text>
            <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Measurements */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}>Body Measurements (cm)</Text>
          <Pressable onPress={() => setShowMeasure(!showMeasure)} style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ color: '#000', fontWeight: '700', fontSize: 12 }}>Update</Text>
          </Pressable>
        </View>
        {measureFields.map(field => (
          <View key={field} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.muted, fontSize: 13, textTransform: 'capitalize' }}>{field}</Text>
            {showMeasure ? (
              <TextInput
                value={measurements[field] || ''}
                onChangeText={(v) => {
                  const newM = { ...measurements, [field]: v };
                  setMeasurements(newM);
                  AsyncStorage.setItem('forge_measurements', JSON.stringify(newM));
                }}
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={colors.muted}
                style={{ color: colors.foreground, fontSize: 13, fontWeight: '700', width: 80, textAlign: 'right', borderBottomWidth: 1, borderBottomColor: colors.primary }}
              />
            ) : (
              <Text style={{ color: measurements[field] ? colors.foreground : colors.muted, fontWeight: '700', fontSize: 13 }}>
                {measurements[field] || '—'} {measurements[field] ? 'cm' : ''}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Strength Benchmarks */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>Phase 1 Strength Goals</Text>
        {[
          { exercise: 'Push-ups', current: '—', target: '30 reps', unit: '' },
          { exercise: 'Pull-ups', current: '—', target: '5 clean reps', unit: '' },
          { exercise: 'Squats', current: '—', target: '40 reps', unit: '' },
          { exercise: 'Lateral Raise', current: '—', target: '10 kg', unit: '' },
        ].map((b, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontSize: 13 }}>{b.exercise}</Text>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{b.current} now</Text>
              <View style={{ backgroundColor: colors.primary + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>Goal: {b.target}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Main Training Screen ──────────────────────────────────────────────────────

export default function TrainingScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>('workout');
  const [phase, setPhase] = useState<number>(1);
  const [dayOfWeek, setDayOfWeek] = useState('monday');

  useEffect(() => {
    AppRepo.getStartDate().then(sd => {
      const today = new Date().toISOString().split('T')[0];
      const { phase: p } = AppRepo.calcPhaseAndDay(sd || today);
      setPhase(p);
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      setDayOfWeek(days[new Date().getDay()]);
    });
  }, []);

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: colors.foreground }}>Training 💪</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Phase {phase} · {dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}</Text>
        </View>

        {/* Sub-tabs */}
        <SubTabBar tabs={TABS} activeTab={activeTab as string} onTabChange={(k) => setActiveTab(k as Tab)} />

        {/* Content */}
        <View style={{ flex: 1 }}>
          {activeTab === 'workout' && <TodaysWorkout phase={phase} dayOfWeek={dayOfWeek} />}
          {activeTab === 'program' && <ProgramOverview phase={phase} />}
          {activeTab === 'library' && <ExerciseLibrary />}
          {activeTab === 'progress' && <TrainingProgress />}
          {activeTab === 'posture' && <PostureScreen />}
          {activeTab === 'priority' && <PriorityMovements />}
        </View>
      </View>
    </ScreenContainer>
  );
}
