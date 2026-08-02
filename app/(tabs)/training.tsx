import * as Haptics from "expo-haptics";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check } from 'lucide-react-native';
import {
  ScrollView, View, Text, Pressable, TextInput, Alert, Modal,
  RefreshControl, FlatList, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '@/components/screen-container';
import { SubTabBar } from '@/components/sub-tab-bar';
import { useColors } from '@/hooks/use-colors';
import { AppRepo, WorkoutRepo, DailyLogRepo, TrainingRepo, NavRepo, type WorkoutLog } from '@/lib/db/database';
import { EXERCISES, WORKOUT_PROGRAMS, type Exercise, type WorkoutDay } from '@/lib/db/seeds';

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
  const [lastCompletedExercise, setLastCompletedExercise] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const STORAGE_KEY = `workout_progress_${today}`;

  // Load persisted progress on mount
  useEffect(() => {
    const w = WORKOUT_PROGRAMS.find(p => p.phase === phase && p.dayOfWeek === dayOfWeek);
    setWorkout(w || null);
    if (w) {
      const defaultSets: Record<string, { done: number; weights: string[] }> = {};
      w.exercises.forEach(e => { defaultSets[e.exerciseId] = { done: 0, weights: Array(e.sets).fill('') }; });
      // Load persisted state
      AsyncStorage.getItem(STORAGE_KEY).then(stored => {
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            // Merge defaults with persisted (so new exercises don't break)
            const merged = { ...defaultSets, ...parsed };
            setSets(merged);
            // Check if any sets were completed
            const hasProgress = Object.values(merged).some((s: any) => s.done > 0);
            if (hasProgress) setWorkoutStarted(true);
          } catch { setSets(defaultSets); }
        } else {
          setSets(defaultSets);
        }
      });
    }
  }, [phase, dayOfWeek]);

  useEffect(() => {
    return () => { if (timerInterval) clearInterval(timerInterval); };
  }, [timerInterval]);

  const persistSets = async (newSets: Record<string, { done: number; weights: string[] }>) => {
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSets)); } catch {}
  };

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
      const newSets = { ...prev, [exerciseId]: { ...ex, done: ex.done + 1 } };
      persistSets(newSets);
      return newSets;
    });
    setLastCompletedExercise(exerciseId);
    startRestTimer(restSecs);
    setWorkoutStarted(true);
  };

  const undoLastSet = () => {
    const targetId = lastCompletedExercise;
    if (!targetId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSets(prev => {
      const ex = prev[targetId];
      if (!ex || ex.done <= 0) return prev;
      const newSets = { ...prev, [targetId]: { ...ex, done: ex.done - 1 } };
      persistSets(newSets);
      return newSets;
    });
    if (timerInterval) clearInterval(timerInterval);
    setRestTimer(null);
    setLastCompletedExercise(null);
  };

  const undoSetForExercise = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSets(prev => {
      const ex = prev[exerciseId];
      if (!ex || ex.done <= 0) return prev;
      const newSets = { ...prev, [exerciseId]: { ...ex, done: ex.done - 1 } };
      persistSets(newSets);
      return newSets;
    });
    if (timerInterval) clearInterval(timerInterval);
    setRestTimer(null);
    if (lastCompletedExercise === exerciseId) setLastCompletedExercise(null);
  };

  const saveWorkout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const log: WorkoutLog = {
      id: today, date: today, phase,
      dayType: workout?.type || '', warmupDone: true,
      exercisesJson: JSON.stringify(sets),
      totalDuration: 35, totalVolume: 0, rating: 4, completed: true,
    };
    await WorkoutRepo.save(log);
    let dl = await DailyLogRepo.getForDate(today);
    if (dl) { dl.workoutCompleted = true; await DailyLogRepo.save(dl); }
    // Clear persisted progress on completion
    try { await AsyncStorage.removeItem(STORAGE_KEY); } catch {}
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
          {workoutStarted && !workoutComplete && (
            <View style={{ backgroundColor: colors.success + '22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: colors.success, fontWeight: '700', fontSize: 12 }}>✓ Progress saved</Text>
            </View>
          )}
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
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 24 }}>{restTimer}s</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>Rest — next set in {restTimer}s</Text>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
            <Pressable onPress={() => { if (timerInterval) clearInterval(timerInterval); setRestTimer(null); }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' }}>Skip rest</Text>
            </Pressable>
            {lastCompletedExercise && (
              <Pressable onPress={undoLastSet}>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' }}>↩ Undo last set</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Global Undo when no rest timer but a recent set was completed */}
      {restTimer === null && lastCompletedExercise && !workoutComplete && (
        <Pressable
          onPress={undoLastSet}
          style={({ pressed }) => ({
            alignSelf: 'center', marginBottom: 12,
            backgroundColor: colors.error + '20', borderRadius: 8,
            paddingHorizontal: 14, paddingVertical: 8, opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: colors.error, fontWeight: '700', fontSize: 12 }}>↩ Undo last completed set</Text>
        </Pressable>
      )}

      {/* Exercise Cards */}
      {workout.exercises.map((ex, idx) => {
        const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
        const exSets = sets[ex.exerciseId] || { done: 0, weights: [] };
        const allDone = exSets.done >= ex.sets;

        return (
          <View key={idx} style={{
            backgroundColor: allDone ? colors.success + '18' : colors.surface,
            borderRadius: 16, padding: 16, marginBottom: 12,
            borderWidth: 1, borderColor: allDone ? colors.success + '66' : colors.border,
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {/* Undo button — shown whenever this exercise has at least 1 completed set */}
                {exSets.done > 0 && (
                  <Pressable
                    onPress={() => undoSetForExercise(ex.exerciseId)}
                    style={({ pressed }) => ({
                      backgroundColor: colors.error + '20',
                      borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <Text style={{ color: colors.error, fontWeight: '700', fontSize: 11 }}>↩ Undo</Text>
                  </Pressable>
                )}
                <View style={{ backgroundColor: allDone ? colors.success + '30' : colors.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ color: allDone ? colors.success : colors.muted, fontWeight: '700', fontSize: 11 }}>
                    {exSets.done}/{ex.sets}
                  </Text>
                </View>
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
                  <Text style={{ color: si < exSets.done ? '#FFFFFF' : si === exSets.done ? '#FFFFFF' : colors.muted, fontWeight: '700', fontSize: 12 }}>
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
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>✓ Complete Workout</Text>
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
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

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
        const isExpanded = expandedDay === day;
        return (
          <Pressable
            key={day}
            onPress={() => !isRestDay && setExpandedDay(isExpanded ? null : day)}
            style={({ pressed }) => ({
              backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10,
              borderWidth: 1, borderColor: isRestDay ? colors.border : colors.primary + '40',
              borderLeftWidth: 4, borderLeftColor: isRestDay ? colors.border : colors.primary,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700', marginBottom: 4 }}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: isRestDay ? colors.muted : colors.foreground }}>{w.type}</Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{w.description}</Text>
              </View>
              {!isRestDay && (
                <Text style={{ color: colors.muted, fontSize: 18, marginLeft: 8 }}>{isExpanded ? '▲' : '▼'}</Text>
              )}
            </View>

            {/* Show all exercises when expanded */}
            {!isRestDay && (
              <View style={{ marginTop: 10, gap: 4 }}>
                {/* Always show first 4 as chips */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {(isExpanded ? w.exercises : w.exercises).map((e, i) => {
                    const ex = EXERCISES.find(ex => ex.id === e.exerciseId);
                    return (
                      <View key={i} style={{ backgroundColor: colors.background, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Text style={{ color: colors.foreground, fontSize: 10 }}>
                          {ex?.name || e.exerciseId}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                {/* Show full details when expanded */}
                {isExpanded && (
                  <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
                    {w.exercises.map((e, i) => {
                      const ex = EXERCISES.find(ex => ex.id === e.exerciseId);
                      return (
                        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: i < w.exercises.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '600' }}>{ex?.name || e.exerciseId}</Text>
                            {e.notes && <Text style={{ color: colors.primary, fontSize: 10, marginTop: 2 }}>{e.notes}</Text>}
                          </View>
                          <Text style={{ color: colors.muted, fontSize: 11, marginLeft: 8 }}>
                            {e.sets}×{e.reps} · {e.restSeconds}s
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
                {!isExpanded && (
                  <Text style={{ color: colors.primary, fontSize: 11, marginTop: 4, fontWeight: '600' }}>Tap to see all {w.exercises.length} exercises with details ›</Text>
                )}
              </View>
            )}
          </Pressable>
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

// ─── Animated Exercise Visual ─────────────────────────────────────────────────

function ExerciseVisual({ exercise }: { exercise: Exercise }) {
  const colors = useColors();
  const [gifLoaded, setGifLoaded] = useState(false);
  const [gifFailed, setGifFailed] = useState(false);

  const PHASE_LABELS = ['Start', 'Mid', 'End'];
  // Per-exercise emoji sequence used as fallback / supplement
  const frames: [string, string, string] = exercise.formEmojiSequence && exercise.formEmojiSequence.length === 3
    ? exercise.formEmojiSequence
    : ['🧍', '💪', '✨'];

  const hasGif = !!exercise.gifUrl && !gifFailed;

  return (
    <View style={{
      backgroundColor: colors.primary + '10',
      borderRadius: 14, padding: 16, marginBottom: 16,
      borderWidth: 1, borderColor: colors.primary + '30',
      alignItems: 'center',
    }}>
      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 }}>
        FORM DEMONSTRATION
      </Text>

      {/* Real looping GIF when available */}
      {hasGif ? (
        <View style={{
          width: '100%', aspectRatio: 1.2, maxHeight: 260,
          borderRadius: 12, overflow: 'hidden',
          backgroundColor: colors.surface,
          borderWidth: 1, borderColor: colors.primary + '40',
          marginBottom: 10, alignItems: 'center', justifyContent: 'center',
        }}>
          {!gifLoaded && (
            <Text style={{ color: colors.muted, fontSize: 12 }}>Loading demo…</Text>
          )}
          <Image
            source={{ uri: exercise.gifUrl! }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
            onLoad={() => setGifLoaded(true)}
            onError={() => setGifFailed(true)}
          />
        </View>
      ) : (
        // Fallback: emoji strip so screen is never blank
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          {frames.map((emoji, i) => (
            <View key={i} style={{
              width: 64, height: 64, borderRadius: 14,
              backgroundColor: i === 1 ? colors.primary + '25' : colors.surface,
              borderWidth: i === 1 ? 2 : 1,
              borderColor: i === 1 ? colors.primary : colors.border,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 32 }}>{emoji}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Start / Mid / End labels */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 6 }}>
        {PHASE_LABELS.map((label, i) => (
          <View key={i} style={{
            backgroundColor: i === 1 ? colors.primary + '30' : 'transparent',
            borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
            borderWidth: 1, borderColor: i === 1 ? colors.primary : colors.border,
          }}>
            <Text style={{
              color: i === 1 ? colors.primary : colors.muted,
              fontSize: 11, fontWeight: i === 1 ? '700' : '500',
            }}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Primary form cue as caption */}
      {exercise.formCues?.[0] && (
        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6, textAlign: 'center', fontStyle: 'italic' }}>
          💡 {exercise.formCues[0]}
        </Text>
      )}
    </View>
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

        {/* Animated Visual Guidance */}
        <ExerciseVisual exercise={selected} />

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
              <Text style={{ color: filterCategory === cat ? '#FFFFFF' : colors.foreground, fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
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
            backgroundColor: done[ex.id] ? colors.success + '18' : colors.surface,
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
            {done[ex.id] && <Check size={14} color="#FFFFFF" />}
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
            backgroundColor: done[ex.id] ? colors.success + '18' : colors.surface,
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
              {done[ex.id] && <Check size={14} color="#FFFFFF" />}
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
    TrainingRepo.getMeasurements().then(setMeasurements);
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
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>Update</Text>
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
                  TrainingRepo.setMeasurements(newM);
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

  // Check for pending sub-tab navigation every time tab is focused
  useFocusEffect(useCallback(() => {
    NavRepo.consumePendingSubTab('/(tabs)/training').then(sub => {
      if (sub && ['workout','program','library','progress','posture','priority'].includes(sub)) {
        setActiveTab(sub as Tab);
      }
    });
  }, []));

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
