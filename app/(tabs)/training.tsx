import React, { useState, useEffect, useCallback } from 'react';
import {
  Check, Dumbbell, Calendar, BookOpen, TrendingUp, Activity, Star,
  Info, RotateCcw, X, ChevronDown, ChevronUp, ChevronRight, ArrowLeft,
  AlertTriangle, Moon, Footprints, Sparkles, Clock,
} from 'lucide-react-native';
import {
  ScrollView, View, Text, TextInput, Alert, Modal,
  FlatList, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '@/components/screen-container';
import { SubTabBar, type SubTabItem } from '@/components/sub-tab-bar';
import { useColors } from '@/hooks/use-colors';
import { AppRepo, WorkoutRepo, DailyLogRepo, TrainingRepo, NavRepo, type WorkoutLog } from '@/lib/db/database';
import { EXERCISES, WORKOUT_PROGRAMS, type Exercise, type WorkoutDay } from '@/lib/db/seeds';
import { Tap } from '@/lib/motion';

type Tab = 'workout' | 'program' | 'library' | 'progress' | 'posture' | 'priority';

const TABS: SubTabItem[] = [
  { key: 'workout', label: "Today", icon: Dumbbell },
  { key: 'program', label: 'Program', icon: Calendar },
  { key: 'library', label: 'Library', icon: BookOpen },
  { key: 'progress', label: 'Progress', icon: TrendingUp },
  { key: 'posture', label: 'Posture', icon: Activity },
  { key: 'priority', label: 'Priority', icon: Star },
];

// ─── Animated Exercise Visual ─────────────────────────────────────────────────

function ExerciseVisual({ exercise }: { exercise: Exercise }) {
  const colors = useColors();
  const [gifLoaded, setGifLoaded] = useState(false);
  const [gifFailed, setGifFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setGifLoaded(false);
    setGifFailed(false);
    setRetryCount(0);
  }, [exercise.id, exercise.gifUrl]);

  const hasGif = !!exercise.gifUrl && !gifFailed;

  const imageUri = exercise.gifUrl
    ? (retryCount > 0 ? `${exercise.gifUrl}${exercise.gifUrl.includes('?') ? '&' : '?'}r=${retryCount}` : exercise.gifUrl)
    : null;

  return (
    <View style={{
      backgroundColor: colors.primary + '0E',
      borderRadius: 14, padding: 14, marginBottom: 14,
      borderWidth: 1, borderColor: colors.primary + '28',
      alignItems: 'center',
    }}>
      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.9, marginBottom: 10 }}>
        FORM DEMONSTRATION
      </Text>

      {hasGif ? (
        <View style={{
          width: '100%', aspectRatio: 1.0, maxHeight: 280,
          borderRadius: 12, overflow: 'hidden',
          backgroundColor: colors.background,
          borderWidth: 1, borderColor: colors.primary + '35',
          marginBottom: 8, alignItems: 'center', justifyContent: 'center',
        }}>
          {!gifLoaded && (
            <Text style={{ color: colors.muted, fontSize: 12 }}>Loading demonstration…</Text>
          )}
          <Image
            key={`${exercise.id}-${retryCount}`}
            source={{ uri: imageUri!, cache: 'reload' }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
            onLoad={() => setGifLoaded(true)}
            onError={() => {
              if (retryCount < 1) {
                setTimeout(() => setRetryCount(c => c + 1), 400);
              } else {
                setGifFailed(true);
              }
            }}
          />
        </View>
      ) : (
        <View style={{
          width: '100%', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 12,
          backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
          marginBottom: 8, alignItems: 'center',
        }}>
          <Text style={{ color: colors.muted, fontSize: 10.5, fontWeight: '700', marginBottom: 10 }}>
            Movement Execution Phases
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {['Setup', 'Peak Contraction', 'Controlled Return'].map((phaseLabel, i) => (
              <View key={i} style={{
                flex: 1, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 10,
                backgroundColor: i === 1 ? colors.primary + '1E' : colors.background,
                borderWidth: 1,
                borderColor: i === 1 ? colors.primary : colors.border,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: i === 1 ? colors.primary : colors.muted }}>
                  0{i + 1}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.foreground, marginTop: 3, textAlign: 'center' }}>
                  {phaseLabel}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {exercise.formCues?.[0] && (
        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4, textAlign: 'center', fontStyle: 'italic' }}>
          Cue: {exercise.formCues[0]}
        </Text>
      )}
    </View>
  );
}

// ─── Direct Form Demonstration & Library Cues Modal ───────────────────────────

function ExerciseDetailModal({ exercise, visible, onClose }: { exercise: Exercise | null; visible: boolean; onClose: () => void }) {
  const colors = useColors();
  if (!exercise) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 18, paddingTop: 48, paddingBottom: 14,
          borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
        }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: colors.foreground, letterSpacing: -0.3 }}>{exercise.name}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              <View style={{ backgroundColor: colors.primary + '1C', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ color: colors.primary, fontSize: 9.5, fontWeight: '800', textTransform: 'uppercase' }}>{exercise.category}</Text>
              </View>
              <View style={{ backgroundColor: colors.background, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.muted, fontSize: 9.5, fontWeight: '600' }}>{exercise.difficulty}</Text>
              </View>
            </View>
          </View>
          <Tap
            onPress={onClose}
            scaleTo={0.93}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 5,
              backgroundColor: colors.primary,
              borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
            }}
          >
            <X size={13} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>Close</Text>
          </Tap>
        </View>

        <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          <ExerciseVisual exercise={exercise} />

          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: colors.muted, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8 }}>TARGET MUSCLES</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {exercise.muscles.map((m, i) => (
                <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 7, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.foreground, fontSize: 11.5, fontWeight: '600' }}>{m}</Text>
                </View>
              ))}
            </View>
          </View>

          {(exercise.duration || exercise.gap || exercise.whenToPerform) && (
            <View style={{ backgroundColor: colors.primary + '12', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.primary + '32', gap: 6 }}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12.5, marginBottom: 2 }}>Timing & Cadence Protocol</Text>
              {exercise.duration && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Clock size={12.5} color={colors.primary} />
                  <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', flex: 1 }}>Duration: <Text style={{ fontWeight: '500' }}>{exercise.duration}</Text></Text>
                </View>
              )}
              {exercise.gap && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <RotateCcw size={12.5} color={colors.warning} />
                  <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', flex: 1 }}>Rest / Gap: <Text style={{ fontWeight: '500' }}>{exercise.gap}</Text></Text>
                </View>
              )}
              {exercise.whenToPerform && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Calendar size={12.5} color={colors.success} />
                  <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', flex: 1 }}>When: <Text style={{ fontWeight: '500' }}>{exercise.whenToPerform}</Text></Text>
                </View>
              )}
            </View>
          )}

          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12.5, marginBottom: 6 }}>Execution</Text>
            <Text style={{ color: colors.foreground, fontSize: 12.5, lineHeight: 19 }}>{exercise.description}</Text>
          </View>

          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.success, fontWeight: '800', fontSize: 12.5, marginBottom: 6 }}>Form Cues</Text>
            {exercise.formCues.map((c, i) => (
              <Text key={i} style={{ color: colors.foreground, fontSize: 12.5, marginBottom: 4, lineHeight: 18 }}>• {c}</Text>
            ))}
          </View>

          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.error, fontWeight: '800', fontSize: 12.5, marginBottom: 6 }}>Common Mistakes</Text>
            {exercise.mistakes.map((m, i) => (
              <Text key={i} style={{ color: colors.foreground, fontSize: 12.5, marginBottom: 4, lineHeight: 18 }}>• {m}</Text>
            ))}
          </View>

          {exercise.progression && (
            <View style={{ backgroundColor: colors.warning + '18', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.warning + '38' }}>
              <Text style={{ color: colors.warning, fontWeight: '800', fontSize: 12.5, marginBottom: 4 }}>Progression Path</Text>
              <Text style={{ color: colors.foreground, fontSize: 12.5, lineHeight: 18 }}>{exercise.progression}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Today's Workout ──────────────────────────────────────────────────────────

function TodaysWorkout({ phase, dayOfWeek, onNavigateTab }: { phase: number; dayOfWeek: string; onNavigateTab: (t: Tab) => void }) {
  const colors = useColors();
  const [workout, setWorkout] = useState<WorkoutDay | null>(null);
  const [sets, setSets] = useState<Record<string, { done: number; weights: string[] }>>({});
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [lastCompletedExercise, setLastCompletedExercise] = useState<string | null>(null);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);
  const [recoveryDone, setRecoveryDone] = useState<Record<string, boolean>>({});
  const today = new Date().toISOString().split('T')[0];
  const STORAGE_KEY = `workout_progress_${today}`;

  useEffect(() => {
    const w = WORKOUT_PROGRAMS.find(p => p.phase === phase && p.dayOfWeek === dayOfWeek);
    setWorkout(w || null);
    if (w && w.exercises.length > 0) {
      const defaultSets: Record<string, { done: number; weights: string[] }> = {};
      w.exercises.forEach(e => { defaultSets[e.exerciseId] = { done: 0, weights: Array(e.sets).fill('') }; });
      AsyncStorage.getItem(STORAGE_KEY).then(stored => {
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const merged = { ...defaultSets, ...parsed };
            setSets(merged);
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
    const log: WorkoutLog = {
      id: today, date: today, phase,
      dayType: workout?.type || '', warmupDone: true,
      exercisesJson: JSON.stringify(sets),
      totalDuration: 35, totalVolume: 0, rating: 4, completed: true,
    };
    await WorkoutRepo.save(log);
    let dl = await DailyLogRepo.getForDate(today);
    if (dl) { dl.workoutCompleted = true; await DailyLogRepo.save(dl); }
    try { await AsyncStorage.removeItem(STORAGE_KEY); } catch {}
    setWorkoutComplete(true);
    Alert.alert('Workout Complete', 'Session logged. Prioritise protein and sleep for recovery.');
  };

  // Sunday Rest & Active Recovery View
  if (!workout || workout.exercises.length === 0) {
    const recoveryItems = [
      { id: 'walk', title: '20–30 min Active Recovery Walk', sub: 'Low-intensity outdoor walk for blood flow and recovery', icon: Footprints },
      { id: 'posture', title: '10 min Daily Posture Routine', sub: 'Chin tucks, wall angels, and hip flexor stretch', icon: Activity },
      { id: 'priority', title: 'Light Priority Touch-Up', sub: 'High-rep band/light lateral raises & neck posture check', icon: Star },
      { id: 'reset', title: 'Sunday Weekly Reset & Plan', sub: 'Vitamin D3 60K with breakfast, grooming reset & plan Mon–Sat', icon: Sparkles },
    ];

    return (
      <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 14,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <View style={{
              width: 42, height: 42, borderRadius: 12,
              backgroundColor: colors.primary + '16',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: colors.primary + '30',
            }}>
              <Moon size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                Sunday Protocol
              </Text>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.foreground, marginTop: 1 }}>
                Rest & Active Recovery Day
              </Text>
            </View>
          </View>
          <Text style={{ color: colors.muted, fontSize: 12.5, lineHeight: 19 }}>
            Monday through Saturday are your 6 active training days. Sunday is dedicated to muscular recovery, postural alignment, and preparing for the week ahead.
          </Text>
        </View>

        <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.foreground, marginBottom: 10, letterSpacing: -0.2 }}>
          Sunday Recovery Checklist
        </Text>

        {recoveryItems.map(item => {
          const IconComp = item.icon;
          const isChecked = !!recoveryDone[item.id];
          return (
            <Tap
              key={item.id}
              onPress={() => setRecoveryDone(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
              scaleTo={0.985}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isChecked ? colors.success + '12' : colors.surface,
                borderRadius: 14,
                padding: 14,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: isChecked ? colors.success + '45' : colors.border,
              }}
            >
              <View style={{
                width: 34, height: 34, borderRadius: 10,
                backgroundColor: isChecked ? colors.success + '20' : colors.primary + '14',
                alignItems: 'center', justifyContent: 'center', marginRight: 12,
              }}>
                <IconComp size={16} color={isChecked ? colors.success : colors.primary} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={{
                  fontSize: 13.5, fontWeight: '700',
                  color: isChecked ? colors.muted : colors.foreground,
                  textDecorationLine: isChecked ? 'line-through' : 'none',
                }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>
                  {item.sub}
                </Text>
              </View>
              <View style={{
                width: 22, height: 22, borderRadius: 7,
                backgroundColor: isChecked ? colors.success : 'transparent',
                borderWidth: 1.8, borderColor: isChecked ? colors.success : colors.border,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {isChecked && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </Tap>
          );
        })}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <Tap
            onPress={() => onNavigateTab('posture')}
            scaleTo={0.97}
            style={{
              flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14,
              borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.foreground }}>Posture Routine</Text>
            <ChevronRight size={15} color={colors.muted} />
          </Tap>
          <Tap
            onPress={() => onNavigateTab('program')}
            scaleTo={0.97}
            style={{
              flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14,
              borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.foreground }}>Full 7-Day Split</Text>
            <ChevronRight size={15} color={colors.muted} />
          </Tap>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* Workout Header */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 0.7, textTransform: 'uppercase' }}>
              {dayOfWeek} Session
            </Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: colors.foreground, marginTop: 2, letterSpacing: -0.3 }}>
              {workout.type}
            </Text>
          </View>
          {workoutStarted && !workoutComplete && (
            <View style={{ backgroundColor: colors.success + '1C', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: colors.success + '38' }}>
              <Text style={{ color: colors.success, fontWeight: '800', fontSize: 10 }}>IN PROGRESS</Text>
            </View>
          )}
        </View>

        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4, lineHeight: 17 }}>{workout.description}</Text>

        <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
          <View style={{ backgroundColor: colors.primary + '18', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 11 }}>{workout.exercises.length} exercises</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.warning + '18', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Clock size={11} color={colors.warning} />
            <Text style={{ color: colors.warning, fontWeight: '800', fontSize: 11 }}>~35 min</Text>
          </View>
        </View>
      </View>

      {/* Warmup Reminder */}
      {!workoutStarted && (
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          backgroundColor: colors.warning + '14', borderRadius: 12, padding: 12, marginBottom: 12,
          borderWidth: 1, borderColor: colors.warning + '35',
        }}>
          <AlertTriangle size={16} color={colors.warning} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.warning, fontWeight: '800', fontSize: 11.5 }}>5-Minute Dynamic Warmup</Text>
            <Text style={{ color: colors.foreground, fontSize: 11.5, marginTop: 1 }}>
              Arm circles × 30 · Leg swings × 20 · Hip circles × 10 · Jumping jacks × 20
            </Text>
          </View>
        </View>
      )}

      {/* Rest Timer */}
      {restTimer !== null && (
        <View style={{ backgroundColor: colors.primary, borderRadius: 14, padding: 14, marginBottom: 12, alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 22, letterSpacing: -0.5 }}>{restTimer}s</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '600', opacity: 0.92 }}>Rest interval — next set in {restTimer}s</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
            <Tap
              onPress={() => { if (timerInterval) clearInterval(timerInterval); setRestTimer(null); }}
              scaleTo={0.95}
              style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' }}>Skip Rest</Text>
            </Tap>
            {lastCompletedExercise && (
              <Tap
                onPress={undoLastSet}
                scaleTo={0.95}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 }}
              >
                <RotateCcw size={11} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' }}>Undo Set</Text>
              </Tap>
            )}
          </View>
        </View>
      )}

      {/* Global Undo when no rest timer */}
      {restTimer === null && lastCompletedExercise && !workoutComplete && (
        <Tap
          onPress={undoLastSet}
          scaleTo={0.96}
          style={{
            alignSelf: 'center', marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 5,
            backgroundColor: colors.error + '18', borderRadius: 9,
            paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.error + '35',
          }}
        >
          <RotateCcw size={12} color={colors.error} />
          <Text style={{ color: colors.error, fontWeight: '800', fontSize: 11.5 }}>Undo last completed set</Text>
        </Tap>
      )}

      {/* Exercise Cards */}
      {workout.exercises.map((ex, idx) => {
        const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
        const exSets = sets[ex.exerciseId] || { done: 0, weights: [] };
        const allDone = exSets.done >= ex.sets;

        return (
          <View key={idx} style={{
            backgroundColor: allDone ? colors.success + '12' : colors.surface,
            borderRadius: 14, padding: 14, marginBottom: 10,
            borderWidth: 1, borderColor: allDone ? colors.success + '50' : colors.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Tap
                onPress={() => exercise && setSelectedExerciseForModal(exercise)}
                scaleTo={0.98}
                style={{ flex: 1, paddingRight: 8 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={{ fontSize: 14.5, fontWeight: '800', color: allDone ? colors.success : colors.foreground }}>
                    {exercise?.name || ex.exerciseId}
                  </Text>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 3,
                    backgroundColor: colors.primary + '1C', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
                  }}>
                    <Info size={10} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: 9.5, fontWeight: '800' }}>DEMO</Text>
                  </View>
                </View>
                <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 2, fontWeight: '600' }}>
                  {ex.sets} sets × {ex.reps} reps · {ex.restSeconds}s rest
                </Text>
                {ex.notes && <Text style={{ color: colors.primary, fontSize: 11, marginTop: 3, fontStyle: 'italic' }}>{ex.notes}</Text>}
              </Tap>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {exSets.done > 0 && (
                  <Tap
                    onPress={() => undoSetForExercise(ex.exerciseId)}
                    scaleTo={0.92}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 3,
                      backgroundColor: colors.error + '18',
                      borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4,
                    }}
                  >
                    <RotateCcw size={10} color={colors.error} />
                    <Text style={{ color: colors.error, fontWeight: '800', fontSize: 10.5 }}>Undo</Text>
                  </Tap>
                )}
                <View style={{ backgroundColor: allDone ? colors.success + '28' : colors.background, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3.5, borderWidth: 1, borderColor: allDone ? colors.success + '50' : colors.border }}>
                  <Text style={{ color: allDone ? colors.success : colors.muted, fontWeight: '800', fontSize: 10.5 }}>
                    {exSets.done}/{ex.sets}
                  </Text>
                </View>
              </View>
            </View>

            {/* Form Cues Preview */}
            {exercise?.formCues && (
              <Tap
                onPress={() => exercise && setSelectedExerciseForModal(exercise)}
                scaleTo={0.99}
                style={{
                  backgroundColor: colors.background, borderRadius: 9, padding: 9, marginBottom: 10,
                  borderWidth: 1, borderColor: colors.border,
                }}
              >
                {exercise.formCues.slice(0, 2).map((cue, ci) => (
                  <Text key={ci} style={{ color: colors.muted, fontSize: 11, marginBottom: 2 }}>• {cue}</Text>
                ))}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 }}>
                  <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>
                    View animated form demo & cues
                  </Text>
                  <ChevronRight size={11} color={colors.primary} />
                </View>
              </Tap>
            )}

            {/* Set Buttons */}
            <View style={{ flexDirection: 'row', gap: 7 }}>
              {Array.from({ length: ex.sets }).map((_, si) => {
                const isCompletedSet = si < exSets.done;
                const isCurrentSet = si === exSets.done && !allDone;
                return (
                  <Tap
                    key={si}
                    onPress={() => isCurrentSet ? completeSet(ex.exerciseId, ex.restSeconds) : undefined}
                    disabled={!isCurrentSet}
                    scaleTo={0.94}
                    style={{
                      flex: 1, height: 36, borderRadius: 9,
                      backgroundColor: isCompletedSet ? colors.success : isCurrentSet ? colors.primary : colors.background,
                      borderWidth: 1,
                      borderColor: isCompletedSet ? colors.success : isCurrentSet ? colors.primary : colors.border,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {isCompletedSet ? (
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    ) : (
                      <Text style={{ color: isCurrentSet ? '#FFFFFF' : colors.muted, fontWeight: '800', fontSize: 11.5 }}>
                        S{si + 1}
                      </Text>
                    )}
                  </Tap>
                );
              })}
            </View>
          </View>
        );
      })}

      {/* Complete Workout Button */}
      {!workoutComplete && (
        <Tap
          onPress={() => { setWorkoutStarted(true); saveWorkout(); }}
          scaleTo={0.97}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15,
            marginTop: 6,
          }}
        >
          <Check size={18} color="#FFFFFF" strokeWidth={2.8} />
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>Complete Workout</Text>
        </Tap>
      )}

      <ExerciseDetailModal
        exercise={selectedExerciseForModal}
        visible={!!selectedExerciseForModal}
        onClose={() => setSelectedExerciseForModal(null)}
      />
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
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 17, fontWeight: '800', color: colors.foreground, marginBottom: 3, letterSpacing: -0.3 }}>
        Phase {phase} Weekly Split
      </Text>
      <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 16 }}>
        {phase === 1
          ? 'Days 1–30: 6-day foundation split (Mon–Sat) · Sunday Rest'
          : phase === 2
          ? 'Days 31–90: 6-day PPL hypertrophy split (Mon–Sat) · Sunday Rest'
          : 'Days 91–365: 6-day advanced specialization (Mon–Sat) · Sunday Rest'}
      </Text>

      {days.map(day => {
        const w = phaseWorkouts.find(p => p.dayOfWeek === day);
        if (!w) return null;
        const isRestDay = w.exercises.length === 0 || w.type.toUpperCase().includes('REST');
        const isExpanded = expandedDay === day;
        return (
          <Tap
            key={day}
            onPress={() => !isRestDay && setExpandedDay(isExpanded ? null : day)}
            scaleTo={isRestDay ? 1 : 0.985}
            style={{
              backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 9,
              borderWidth: 1, borderColor: isRestDay ? colors.border : colors.primary + '38',
              borderLeftWidth: 3.5, borderLeftColor: isRestDay ? colors.muted : colors.primary,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10.5, color: isRestDay ? colors.muted : colors.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                  {day}
                </Text>
                <Text style={{ fontSize: 14.5, fontWeight: '800', color: isRestDay ? colors.muted : colors.foreground }}>
                  {w.type}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 11.5, marginTop: 2 }}>{w.description}</Text>
              </View>
              {!isRestDay && (
                <View style={{ marginLeft: 8 }}>
                  {isExpanded ? <ChevronUp size={16} color={colors.muted} /> : <ChevronDown size={16} color={colors.muted} />}
                </View>
              )}
            </View>

            {!isRestDay && (
              <View style={{ marginTop: 10, gap: 4 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                  {w.exercises.map((e, i) => {
                    const ex = EXERCISES.find(ex => ex.id === e.exerciseId);
                    return (
                      <View key={i} style={{ backgroundColor: colors.background, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3.5, borderWidth: 1, borderColor: colors.border }}>
                        <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: '600' }}>
                          {ex?.name || e.exerciseId}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {isExpanded && (
                  <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
                    {w.exercises.map((e, i) => {
                      const ex = EXERCISES.find(ex => ex.id === e.exerciseId);
                      return (
                        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: i < w.exercises.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700' }}>{ex?.name || e.exerciseId}</Text>
                            {e.notes && <Text style={{ color: colors.primary, fontSize: 10, marginTop: 2 }}>{e.notes}</Text>}
                          </View>
                          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '600', marginLeft: 8 }}>
                            {e.sets}×{e.reps} · {e.restSeconds}s
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
                {!isExpanded && (
                  <Text style={{ color: colors.primary, fontSize: 10.5, marginTop: 3, fontWeight: '700' }}>
                    Tap to inspect {w.exercises.length} exercises
                  </Text>
                )}
              </View>
            )}
          </Tap>
        );
      })}

      {/* Progressive Overload Note */}
      <View style={{ backgroundColor: colors.primary + '12', borderRadius: 14, padding: 14, marginTop: 6, borderWidth: 1, borderColor: colors.primary + '35' }}>
        <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12.5, marginBottom: 4 }}>Progressive Overload Rule</Text>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
          Every week, add 1–2 reps OR increase weight by 0.5–1 kg on at least 1 compound or priority movement per session. Track all sets consistently.
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
      <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Tap
          onPress={() => setSelected(null)}
          scaleTo={0.96}
          style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 14, gap: 6, backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, borderWidth: 1, borderColor: colors.border }}
        >
          <ArrowLeft size={14} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>Back to Library</Text>
        </Tap>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.foreground, marginBottom: 6, letterSpacing: -0.3 }}>{selected.name}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
          <View style={{ backgroundColor: colors.primary + '1C', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>{selected.category}</Text>
          </View>
          <View style={{ backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '600' }}>{selected.difficulty}</Text>
          </View>
        </View>

        <ExerciseVisual exercise={selected} />

        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: colors.muted, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8 }}>MUSCLES</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {selected.muscles.map((m, i) => (
              <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground, fontSize: 11.5, fontWeight: '600' }}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12.5, marginBottom: 6 }}>How to do it</Text>
          <Text style={{ color: colors.foreground, fontSize: 12.5, lineHeight: 19 }}>{selected.description}</Text>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.success, fontWeight: '800', fontSize: 12.5, marginBottom: 6 }}>Form Cues</Text>
          {selected.formCues.map((c, i) => <Text key={i} style={{ color: colors.foreground, fontSize: 12.5, marginBottom: 4 }}>• {c}</Text>)}
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.error, fontWeight: '800', fontSize: 12.5, marginBottom: 6 }}>Common Mistakes</Text>
          {selected.mistakes.map((m, i) => <Text key={i} style={{ color: colors.foreground, fontSize: 12.5, marginBottom: 4 }}>• {m}</Text>)}
        </View>

        {selected.progression && (
          <View style={{ backgroundColor: colors.warning + '18', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.warning + '38' }}>
            <Text style={{ color: colors.warning, fontWeight: '800', fontSize: 12.5, marginBottom: 4 }}>Progression Path</Text>
            <Text style={{ color: colors.foreground, fontSize: 12.5 }}>{selected.progression}</Text>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 10 }}>
        <TextInput
          placeholder="Search exercises or target muscles..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: colors.foreground, fontSize: 13 }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {[null, ...categories].map(cat => (
            <Tap
              key={cat ?? 'all'}
              onPress={() => setFilterCategory(cat)}
              scaleTo={0.95}
              style={{
                backgroundColor: filterCategory === cat ? colors.primary : colors.surface,
                borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6,
                borderWidth: 1, borderColor: filterCategory === cat ? colors.primary : colors.border,
              }}
            >
              <Text style={{ color: filterCategory === cat ? '#FFFFFF' : colors.foreground, fontWeight: '700', fontSize: 11.5, textTransform: 'capitalize' }}>
                {cat ?? 'All'} {cat === null ? `(${EXERCISES.length})` : `(${EXERCISES.filter(e => e.category === cat).length})`}
              </Text>
            </Tap>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={e => e.id}
        overScrollMode="always"
        bounces={true}
        decelerationRate="normal"
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Tap
            onPress={() => setSelected(item)}
            scaleTo={0.985}
            style={{
              backgroundColor: colors.surface, borderRadius: 12, padding: 13, marginBottom: 7,
              borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.foreground }}>{item.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{item.muscles.join(' · ')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ backgroundColor: colors.primary + '1C', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2.5 }}>
                <Text style={{ color: colors.primary, fontSize: 9.5, fontWeight: '800', textTransform: 'uppercase' }}>{item.category}</Text>
              </View>
              <ChevronRight size={14} color={colors.muted} />
            </View>
          </Tap>
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
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);

  return (
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 15, marginBottom: 14, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: 6 }}>
          Posture Cadence & Timing (+1 to 1.5" Visual Height)
        </Text>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Clock size={13} color={colors.primary} />
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', flex: 1 }}>
              Duration: <Text style={{ color: colors.muted, fontWeight: '500' }}>10 min/day total (5 min Morning + 5 min Evening)</Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <RotateCcw size={13} color={colors.warning} />
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', flex: 1 }}>
              Rest Gaps: <Text style={{ color: colors.muted, fontWeight: '500' }}>15–30 sec between sets · 3–4 hr gap for desk resets</Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Calendar size={13} color={colors.success} />
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', flex: 1 }}>
              When: <Text style={{ color: colors.muted, fontWeight: '500' }}>7:00 AM upon waking & 9:00 PM post-desk decompression</Text>
            </Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.foreground, marginBottom: 10, letterSpacing: -0.2 }}>
        Daily Posture Routine (Tap any card for execution & GIF demo)
      </Text>
      {postureExercises.map((ex) => {
        const isDone = !!done[ex.id];
        return (
          <View
            key={ex.id}
            style={{
              backgroundColor: isDone ? colors.success + '12' : colors.surface,
              borderRadius: 14, padding: 14, marginBottom: 10,
              borderWidth: 1, borderColor: isDone ? colors.success + '50' : colors.border,
            }}
          >
            {/* Header Row: Tap title/DEMO to open animated demo modal, or tap checkbox to mark done */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Tap
                onPress={() => setSelectedExerciseForModal(ex)}
                scaleTo={0.98}
                style={{ flex: 1, paddingRight: 10 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={{ fontWeight: '800', fontSize: 14.5, color: isDone ? colors.success : colors.foreground, textDecorationLine: isDone ? 'line-through' : 'none' }}>
                    {ex.name}
                  </Text>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 3,
                    backgroundColor: colors.primary + '1C', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
                  }}>
                    <Info size={10} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: 9.5, fontWeight: '800' }}>DEMO</Text>
                  </View>
                </View>
                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                  {ex.muscles.join(' · ')}
                </Text>

                {/* Duration, Rest Gap & When to Perform (replaces outer description) */}
                <View style={{ marginTop: 7, gap: 4 }}>
                  {ex.duration && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Clock size={11.5} color={colors.primary} />
                      <Text style={{ color: colors.foreground, fontSize: 11.5, fontWeight: '700', flex: 1 }}>
                        {ex.duration}
                      </Text>
                    </View>
                  )}
                  {ex.gap && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <RotateCcw size={11.5} color={colors.warning} />
                      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '600', flex: 1 }}>
                        Gap: {ex.gap}
                      </Text>
                    </View>
                  )}
                  {ex.whenToPerform && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Calendar size={11.5} color={colors.success} />
                      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '600', flex: 1 }}>
                        When: {ex.whenToPerform}
                      </Text>
                    </View>
                  )}
                </View>
              </Tap>

              <Tap
                onPress={() => setDone(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                scaleTo={0.92}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  backgroundColor: isDone ? colors.success : colors.background,
                  borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6,
                  borderWidth: 1.5, borderColor: isDone ? colors.success : colors.border,
                }}
              >
                <View style={{
                  width: 16, height: 16, borderRadius: 5,
                  backgroundColor: isDone ? '#FFFFFF' : 'transparent',
                  borderWidth: isDone ? 0 : 1.5, borderColor: colors.muted,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {isDone && <Check size={11} color={colors.success} strokeWidth={3} />}
                </View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: isDone ? '#FFFFFF' : colors.foreground }}>
                  {isDone ? 'Done' : 'Check'}
                </Text>
              </Tap>
            </View>

            {/* Form Cues Preview Box (tapping opens animated demonstration & full cues) */}
            {ex.formCues && ex.formCues.length > 0 && (
              <Tap
                onPress={() => setSelectedExerciseForModal(ex)}
                scaleTo={0.99}
                style={{
                  backgroundColor: colors.background, borderRadius: 9, padding: 9,
                  borderWidth: 1, borderColor: colors.border,
                }}
              >
                {ex.formCues.slice(0, 2).map((cue, ci) => (
                  <Text key={ci} style={{ color: colors.muted, fontSize: 11, marginBottom: 2 }}>• {cue}</Text>
                ))}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 }}>
                  <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>
                    Tap for full description, animated demo & cues
                  </Text>
                  <ChevronRight size={11} color={colors.primary} />
                </View>
              </Tap>
            )}
          </View>
        );
      })}

      <View style={{ backgroundColor: colors.warning + '14', borderRadius: 14, padding: 14, marginTop: 6, borderWidth: 1, borderColor: colors.warning + '35' }}>
        <Text style={{ color: colors.warning, fontWeight: '800', fontSize: 12.5, marginBottom: 6 }}>Visual Proportion Guidelines</Text>
        <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
          • Monochromatic dark outfits create an unbroken vertical line{'\n'}
          • Structured footwear (Chelsea boots or firm soles){'\n'}
          • Tailored fit through the waist and shoulders{'\n'}
          • Mid-to-high rise trousers to elongate leg line{'\n'}
          • Cropped outer layers ending at the hip bone
        </Text>
      </View>

      <ExerciseDetailModal
        exercise={selectedExerciseForModal}
        visible={!!selectedExerciseForModal}
        onClose={() => setSelectedExerciseForModal(null)}
      />
    </ScrollView>
  );
}

// ─── Priority Movements ────────────────────────────────────────────────────────

function PriorityMovements() {
  const colors = useColors();
  const priority = EXERCISES.filter(e => e.category === 'priority');
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);

  return (
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: colors.primary + '14', borderRadius: 14, padding: 15, marginBottom: 16, borderWidth: 1, borderColor: colors.primary + '38' }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: 6 }}>
          Priority Schedule, Durations & Recovery Gaps
        </Text>
        <View style={{ gap: 7 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7 }}>
            <Clock size={13} color={colors.primary} style={{ marginTop: 2 }} />
            <Text style={{ color: colors.foreground, fontSize: 11.5, lineHeight: 17, flex: 1 }}>
              <Text style={{ fontWeight: '800', color: colors.primary }}>Daily Micro-Work (3–5 min · Every Day): </Text>
              Band Pull-Aparts, Face Pulls & Dead Hangs · 30–60s rest · Do at 7:00 AM or desk breaks.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7 }}>
            <RotateCcw size={13} color={colors.warning} style={{ marginTop: 2 }} />
            <Text style={{ color: colors.foreground, fontSize: 11.5, lineHeight: 17, flex: 1 }}>
              <Text style={{ fontWeight: '800', color: colors.warning }}>Delts & Traps Finisher (6–8 min · 4–6x/wk): </Text>
              Lateral Raises, Rear Delt Flyes & Shrugs · 45–60s rest · Last 5 min of workouts (5:45 PM) + Saturday.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7 }}>
            <Calendar size={13} color={colors.success} style={{ marginTop: 2 }} />
            <Text style={{ color: colors.foreground, fontSize: 11.5, lineHeight: 17, flex: 1 }}>
              <Text style={{ fontWeight: '800', color: colors.success }}>Neck Hypertrophy Block (8 min · Tue, Thu, Sat): </Text>
              Neck Curls → Extensions → Side Flexion · 45s rest · 48h recovery gap between sessions.
            </Text>
          </View>
        </View>
      </View>

      {priority.map((ex) => {
        const isDone = !!done[ex.id];
        return (
          <View
            key={ex.id}
            style={{
              backgroundColor: isDone ? colors.success + '12' : colors.surface,
              borderRadius: 14, padding: 14, marginBottom: 9,
              borderWidth: 1, borderColor: isDone ? colors.success + '45' : colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Tap
                onPress={() => setSelectedExerciseForModal(ex)}
                scaleTo={0.98}
                style={{ flex: 1, paddingRight: 10 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={{ fontWeight: '800', fontSize: 14.5, color: isDone ? colors.success : colors.foreground }}>
                    {ex.name}
                  </Text>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 3,
                    backgroundColor: colors.primary + '1C', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
                  }}>
                    <Info size={10} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: 9.5, fontWeight: '800' }}>DEMO</Text>
                  </View>
                </View>
                <Text style={{ color: colors.primary, fontSize: 11, marginTop: 2, fontWeight: '700' }}>
                  {ex.muscles.join(' · ')}
                </Text>

                {/* Duration, Rest Gap & When to Perform (replaces outer description) */}
                <View style={{ marginTop: 7, gap: 4 }}>
                  {ex.duration && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Clock size={11.5} color={colors.primary} />
                      <Text style={{ color: colors.foreground, fontSize: 11.5, fontWeight: '700', flex: 1 }}>
                        {ex.duration}
                      </Text>
                    </View>
                  )}
                  {ex.gap && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <RotateCcw size={11.5} color={colors.warning} />
                      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '600', flex: 1 }}>
                        Gap: {ex.gap}
                      </Text>
                    </View>
                  )}
                  {ex.whenToPerform && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Calendar size={11.5} color={colors.success} />
                      <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: '700', flex: 1 }}>
                        When: <Text style={{ color: colors.muted, fontWeight: '600' }}>{ex.whenToPerform}</Text>
                      </Text>
                    </View>
                  )}
                </View>
              </Tap>

              <Tap
                onPress={() => setDone(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                scaleTo={0.92}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  backgroundColor: isDone ? colors.success : colors.background,
                  borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6,
                  borderWidth: 1.5, borderColor: isDone ? colors.success : colors.border,
                }}
              >
                <View style={{
                  width: 16, height: 16, borderRadius: 5,
                  backgroundColor: isDone ? '#FFFFFF' : 'transparent',
                  borderWidth: isDone ? 0 : 1.5, borderColor: colors.muted,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {isDone && <Check size={11} color={colors.success} strokeWidth={3} />}
                </View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: isDone ? '#FFFFFF' : colors.foreground }}>
                  {isDone ? 'Done' : 'Check'}
                </Text>
              </Tap>
            </View>

            <Tap
              onPress={() => setSelectedExerciseForModal(ex)}
              scaleTo={0.99}
              style={{ backgroundColor: colors.background, borderRadius: 8, padding: 9, borderWidth: 1, borderColor: colors.border }}
            >
              {ex.formCues.map((c, i) => (
                <Text key={i} style={{ color: colors.success, fontSize: 11, marginBottom: 2 }}>• {c}</Text>
              ))}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 }}>
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>
                  Tap for full description, animated demo & cues
                </Text>
                <ChevronRight size={11} color={colors.primary} />
              </View>
            </Tap>
          </View>
        );
      })}

      <ExerciseDetailModal
        exercise={selectedExerciseForModal}
        visible={!!selectedExerciseForModal}
        onClose={() => setSelectedExerciseForModal(null)}
      />
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
    <ScrollView style={{ flex: 1 }} overScrollMode="always" bounces={true} decelerationRate="normal" scrollEventThrottle={16} contentContainerStyle={{ padding: 18, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* Weekly Stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'This Week', value: `${weeklyCount}/6`, unit: 'sessions', color: colors.primary },
          { label: 'Completed', value: workouts.filter(w => w.completed).length, unit: 'workouts', color: colors.success },
          { label: 'Split', value: 'Mon–Sat', unit: 'Sun rest', color: colors.warning },
        ].map((s, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: s.color, letterSpacing: -0.3 }}>{s.value}</Text>
            <Text style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>{s.unit}</Text>
            <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.foreground, marginTop: 3 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Measurements */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 15, marginBottom: 14, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.foreground }}>Body Measurements (cm)</Text>
          <Tap
            onPress={() => setShowMeasure(!showMeasure)}
            scaleTo={0.94}
            style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 5 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 11 }}>{showMeasure ? 'Done' : 'Update'}</Text>
          </Tap>
        </View>
        {measureFields.map((field, idx) => (
          <View key={field} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: idx < measureFields.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.muted, fontSize: 12.5, fontWeight: '600', textTransform: 'capitalize' }}>{field}</Text>
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
                style={{ color: colors.foreground, fontSize: 12.5, fontWeight: '700', width: 75, textAlign: 'right', borderBottomWidth: 1, borderBottomColor: colors.primary, paddingVertical: 2 }}
              />
            ) : (
              <Text style={{ color: measurements[field] ? colors.foreground : colors.muted, fontWeight: '700', fontSize: 12.5 }}>
                {measurements[field] || '—'} {measurements[field] ? 'cm' : ''}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Strength Benchmarks */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 15, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.foreground, marginBottom: 10 }}>Phase 1 Strength Benchmarks</Text>
        {[
          { exercise: 'Push-ups', target: '30 clean reps' },
          { exercise: 'Pull-ups', target: '5 dead-hang reps' },
          { exercise: 'Bodyweight Squats', target: '40 reps' },
          { exercise: 'Dumbbell Lateral Raise', target: '10 kg × 15' },
        ].map((b, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontSize: 12.5, fontWeight: '600' }}>{b.exercise}</Text>
            <View style={{ backgroundColor: colors.primary + '1C', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>Target: {b.target}</Text>
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
        {/* Compact Header */}
        <View style={{ paddingHorizontal: 18, paddingTop: 6, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground, letterSpacing: -0.5 }}>Training</Text>
          <Text style={{ color: colors.muted, fontSize: 11.5, fontWeight: '700' }}>
            Phase {phase} · {dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}
          </Text>
        </View>

        <SubTabBar tabs={TABS} activeTab={activeTab as string} onTabChange={(k) => setActiveTab(k as Tab)} />

        <View style={{ flex: 1 }}>
          {activeTab === 'workout' && <TodaysWorkout phase={phase} dayOfWeek={dayOfWeek} onNavigateTab={setActiveTab} />}
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
