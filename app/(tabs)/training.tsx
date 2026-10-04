import * as Haptics from "expo-haptics";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check } from 'lucide-react-native';
import {
  ScrollView, View, Text, Pressable, TextInput, Alert, Modal,
  RefreshControl, FlatList, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';
import { SubTabBar } from '@/components/sub-tab-bar';
import { useColors } from '@/hooks/use-colors';
import { AppRepo, WorkoutRepo, DailyLogRepo, TrainingRepo, type WorkoutLog } from '@/lib/db/database';
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
    startRestTimer(restSecs);
    setWorkoutStarted(true);
  };

  const undoLastSet = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSets(prev => {
      const ex = prev[exerciseId] || { done: 0, weights: [] };
      if (ex.done <= 0) return prev;
      const newSets = { ...prev, [exerciseId]: { ...ex, done: ex.done - 1 } };
      persistSets(newSets);
      return newSets;
    });
    // Cancel rest timer if undoing
    if (timerInterval) clearInterval(timerInterval);
    setRestTimer(null);
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
          <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 24 }}>{restTimer}s</Text>
          <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '600' }}>Rest — next set in {restTimer}s</Text>
          <Pressable onPress={() => { if (timerInterval) clearInterval(timerInterval); setRestTimer(null); }} style={{ marginTop: 8 }}>
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' }}>Skip rest</Text>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {/* Undo button — shown when at least 1 set completed */}
                {exSets.done > 0 && !allDone && (
                  <Pressable
                    onPress={() => undoLastSet(ex.exerciseId)}
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
                  <Text style={{ color: si < exSets.done ? colors.background : si === exSets.done ? colors.foreground : colors.muted, fontWeight: '700', fontSize: 12 }}>
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
          <Text style={{ color: colors.background, fontWeight: '800', fontSize: 16 }}>✓ Complete Workout</Text>
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
          <View
            key={day}
            style={{
              backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10,
              borderWidth: 1, borderColor: isRestDay ? colors.border : colors.primary + '40',
              borderLeftWidth: 4, borderLeftColor: isRestDay ? colors.border : colors.primary,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700', marginBottom: 4 }}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: isRestDay ? colors.muted : colors.foreground }}>{w.type}</Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{w.description}</Text>
              </View>
            </View>

            {/* Always show full details of all exercises */}
            {!isRestDay && (
              <View style={{ marginTop: 10, gap: 4 }}>
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

// ─── Animated Exercise Visual ─────────────────────────────────────────────────

import { Image } from 'react-native';

const EXERCISE_IMAGE_MAPPING: Record<string, string> = {
  'wall-pushup': 'Wall_Push_Up',
  'incline-pushup': 'Incline_Push-Up',
  'standard-pushup': 'Pushups',
  'wide-pushup': 'Wide-Grip_Push-Up',
  'diamond-pushup': 'Diamond_Push-Up',
  'decline-pushup': 'Decline_Push-Up',
  'weighted-pushup': 'Pushups',
  'archer-pushup': 'Archer_Push_Up',
  'one-arm-pushup': 'One-Arm_Push-Up',
  'pike-pushup': 'Pike_Push_Up',
  'handstand-pushup': 'Handstand_Push-Up',
  'overhead-press-bag': 'Standing_Military_Press',
  'lateral-raise': 'Side_Lateral_Raise',
  'front-raise': 'Front_Dumbbell_Raise',
  'shoulder-taps': 'Plank',
  'tricep-dips': 'Bench_Dips',
  'tricep-dips-elevated': 'Bench_Dips',
  'tricep-extension-bag': 'Standing_Dumbbell_Triceps_Extension',
  'plank-to-pushup': 'Plank',
  'dead-hangs': 'Pullups',
  'negative-pullup': 'Pullups',
  'assisted-pullup': 'Pullups',
  'standard-pullup': 'Pullups',
  'chin-up': 'Chin-Up',
  'wide-grip-pullup': 'Wide-Grip_Pull-Up',
  'archer-pullup': 'Pullups',
  'muscle-up': 'Muscle_Up',
  'bent-over-row': 'Bent_Over_Barbell_Row',
  'inverted-row': 'Inverted_Row',
  'bicep-curls-bag': 'Dumbbell_Bicep_Curl',
  'hammer-curls': 'Hammer_Curls',
  'reverse-curls': 'Reverse_Barbell_Curl',
  'face-pulls': 'Face_Pull',
  'band-pull-aparts': 'Band_Pull_Apart',
  'shrugs': 'Dumbbell_Shrug',
  'rear-delt-flyes': 'Reverse_Flyes',
  'bw-squats': 'Bodyweight_Squat',
  'bulgarian-split-squat': 'Bulgarian_Split_Squat',
  'weighted-bulgarian': 'Bulgarian_Split_Squat',
  'reverse-lunge': 'Reverse_Lunge',
  'walking-lunge': 'Walking_Lunge',
  'pistol-squat': 'Pistol_Squat',
  'jump-squats': 'Jump_Squat',
  'glute-bridges': 'Glute_Bridge',
  'single-leg-bridge': 'Glute_Bridge',
  'hip-thrusts': 'Barbell_Hip_Thrust',
  'calf-raises': 'Standing_Calf_Raises',
  'single-calf-raise': 'Calf_Raise_On_A_Dumbbell',
  'wall-sit': 'Wall_Sit',
  'step-ups': 'Step-up',
  'plank': 'Plank',
  'side-plank': 'Side_Plank',
  'dead-bugs': 'Dead_Bug',
  'hollow-body': 'Hollow_Body_Hold',
  'superman': 'Superman',
  'leg-raises': 'Flat_Bench_Lying_Leg_Raise',
  'hanging-leg-raises': 'Hanging_Leg_Raise',
  'russian-twists': 'Russian_Twist',
  'mountain-climbers': 'Mountain_Climbers',
  'bicycle-crunches': 'Bicycle_Crunch',
  'flutter-kicks': 'Flutter_Kicks',
  'bird-dogs': 'Bird_Dog',
  'ab-roller': 'Ab_Roller',
  'l-sit': 'L-Sit',
  'doorway-stretch': 'Doorway_Stretch',
  'wall-angels': 'Wall_Angel',
  'chin-tucks': 'Neck_Curl',
  'cat-cow': 'Cat_Cow',
  'thoracic-rotation': 'Thoracic_Rotation',
  'scapular-pushup': 'Scapular_Push-Up',
  'wall-slides': 'Wall_Slide',
  'ytw-raises': 'YTW',
  'thoracic-foam-roll': 'Foam_Roll',
  'spinal-decompression': 'Dead_Hang',
  'towel-pull-aparts': 'Band_Pull_Apart',
  'prone-cobra': 'Prone_Cobra',
  'priority-lateral-raise': 'Side_Lateral_Raise',
  'neck-curls': 'Neck_Curl',
  'neck-extensions': 'Neck_Extension',
  'neck-side-flexion': 'Neck_Side_Flexion',
  'priority-shrugs': 'Dumbbell_Shrug',
};

function ExerciseVisual({ exercise }: { exercise: Exercise }) {
  const colors = useColors();
  const [frame, setFrame] = useState(0);
  const [imgError, setImgError] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  // Toggle between 0 and 1 every 1 second to create a GIF-like effect using two images
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev === 0 ? 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mappedId = EXERCISE_IMAGE_MAPPING[exercise.id] || exercise.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('_');
  const imageUrl = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${mappedId}/${frame}.jpg`;

  // Fallback text cues if image fails to load
  const getFallbackCues = (): string[] => {
    const cat = exercise.category;
    if (cat === 'push') return ['Stand ready', 'Lower down', 'Full depth', 'Push up!', 'Full extension'];
    if (cat === 'pull') return ['Grip bar', 'Initiate pull', 'Elbows down', 'Chin over bar', 'Lower slowly'];
    if (cat === 'legs') return ['Stand tall', 'Bend knees', 'Lower hips', 'Drive up!', 'Stand straight'];
    if (cat === 'core') return ['Start position', 'Brace core', 'Engage abs', 'Hold tension', 'Release slowly'];
    if (cat === 'posture') return ['Stand/sit tall', 'Find neutral', 'Hold position', 'Feel the stretch', 'Return slowly'];
    if (cat === 'priority') return ['Start position', 'Initiate lift', 'Control peak', 'Slow return', 'Repeat!'];
    return ['Start', 'Move', 'Mid-point', 'Control', 'Complete'];
  };

  const fallbacks = getFallbackCues();

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 14, padding: 16, marginBottom: 16,
      borderWidth: 1, borderColor: colors.border,
      alignItems: 'center', overflow: 'hidden'
    }}>
      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>EXERCISE VISUAL</Text>

      {!imgError ? (
        <View style={{ width: '100%', alignItems: 'center' }}>
          <View style={{ width: 240, height: 240, backgroundColor: colors.background, borderRadius: 12, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
            <Image 
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
              onError={() => setImgError(true)}
            />
          </View>
          <Text style={{ color: colors.muted, fontSize: 10, marginTop: 12 }}>
            {frame === 0 ? 'Step 1: Start position' : 'Step 2: End position'}
          </Text>
        </View>
      ) : (
        <View style={{ width: '100%', alignItems: 'center', paddingVertical: 20 }}>
          <Text style={{ fontSize: 32, marginBottom: 12, color: colors.primary }}>⚡</Text>
          <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 4 }}>
            Visualize the movement
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center' }}>
            {exercise.description}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16, justifyContent: 'center' }}>
            {fallbacks.map((f, i) => (
              <View key={i} style={{
                backgroundColor: colors.background,
                borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
                borderWidth: 1, borderColor: colors.border,
              }}>
                <Text style={{ color: colors.foreground, fontSize: 10, fontWeight: '500' }}>
                  {f}
                </Text>
              </View>
            ))}
          </View>
        </View>
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
              <Text style={{ color: filterCategory === cat ? colors.background : colors.foreground, fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
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
            {done[ex.id] && <Check size={14} color={colors.background} />}
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
              {done[ex.id] && <Check size={14} color={colors.background} />}
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
            <Text style={{ color: colors.background, fontWeight: '700', fontSize: 12 }}>Update</Text>
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
