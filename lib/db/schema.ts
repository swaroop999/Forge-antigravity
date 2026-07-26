/**
 * Forge App - Local Database Schema
 * All data is stored locally on device using AsyncStorage + SQLite
 */

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  height: string; // e.g., "5'6\""
  startingWeight: number; // kg
  currentWeight: number; // kg
  targetWeight: number; // kg
  bodyType: string;
  frame: string;
  primaryGoals: string[];
  knownIssues: string[];
  createdAt: number;
  updatedAt: number;
}

export interface DailyTask {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  title: string;
  category: 'nutrition' | 'training' | 'skincare' | 'sleep' | 'dopamine' | 'discipline';
  completed: boolean;
  completedAt?: number;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  phase: 1 | 2 | 3;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  exercises: WorkoutExercise[];
  totalVolume: number; // total reps × weight
  totalTime: number; // minutes
  completed: boolean;
  completedAt?: number;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string; // e.g., "8-12"
  restSeconds: number;
  sets: ExerciseSet[];
  notes?: string;
}

export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number; // kg, 0 for bodyweight
  completed: boolean;
  completedAt?: number;
}

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // 8 meals per day
  mealName: string;
  time: string; // HH:MM
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  completed: boolean;
  completedAt?: number;
  isJunkFood: boolean;
  notes?: string;
}

export interface DailyMacros {
  date: string; // YYYY-MM-DD
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  targetWater: number; // liters
  actualCalories: number;
  actualProtein: number;
  actualCarbs: number;
  actualFats: number;
  actualWater: number;
}

export interface SupplementEntry {
  id: string;
  date: string; // YYYY-MM-DD
  supplementName: string;
  dose: string;
  timing: string;
  completed: boolean;
  completedAt?: number;
}

export interface SkincareRoutine {
  id: string;
  date: string; // YYYY-MM-DD
  timeOfDay: 'am' | 'pm';
  steps: SkincareStep[];
  completed: boolean;
  completedAt?: number;
}

export interface SkincareStep {
  stepNumber: number;
  product: string;
  action: string;
  completed: boolean;
}

export interface HairEntry {
  id: string;
  date: string; // YYYY-MM-DD
  minoxidilAM: boolean;
  minoxidilPM: boolean;
  washDay: boolean;
  oilMassageDay: boolean;
  dandruffSeverity?: 'none' | 'mild' | 'moderate' | 'severe';
  hairFallEstimate?: number; // estimated count
  notes?: string;
}

export interface HabitEntry {
  id: string;
  date: string; // YYYY-MM-DD
  habitName: string;
  category: string;
  completed: boolean;
  completedAt?: number;
}

export interface DailyHabitStreak {
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // percentage
  lastCompletedDate: string; // YYYY-MM-DD
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  wins: string[]; // 3 wins
  improvement: string; // 1 thing to improve
  energyLevel: number; // 1-10
  mood: number; // 1-10
  confidenceLevel: number; // 1-10
  followedPlan: 'yes' | 'mostly' | 'partially' | 'no';
  notes: string;
  createdAt: number;
}

export interface WeeklyReflection {
  id: string;
  weekStartDate: string; // YYYY-MM-DD (Sunday)
  biggestWin: string;
  whatFailed: string;
  nextWeekChange: string;
  weekRating: number; // 1-10
  gratitude: string;
  createdAt: number;
}

export interface Milestone {
  id: string;
  phase: 1 | 2 | 3;
  days: 30 | 90 | 365;
  title: string;
  description: string;
  completed: boolean;
  completedDate?: string; // YYYY-MM-DD
}

export interface ProgressPhoto {
  id: string;
  date: string; // YYYY-MM-DD
  category: 'face' | 'body' | 'elbows' | 'hair'; // photo type
  angle: 'front' | 'left' | 'right' | 'top'; // for face: front/left/right; for hair: top
  uri: string; // local file URI
  notes?: string;
}

export interface DopamineEntry {
  id: string;
  date: string; // YYYY-MM-DD
  pornUse: boolean;
  masturbation: boolean;
  instagramOpens: number;
  youtubeOpens: number;
  reelsSessions: number;
  screenTimePhone: number; // hours
  screenTimeLaptop: number; // hours
  urgesResisted: number;
  notes?: string;
}

export interface Achievement {
  id: string;
  badgeId: string; // e.g., "7-day-warrior"
  name: string;
  description: string;
  unlockedDate: string; // YYYY-MM-DD
  icon: string;
}

export interface AppState {
  currentPhase: 1 | 2 | 3;
  dayNumber: number; // 1-365
  startDate: string; // YYYY-MM-DD
  lastSyncDate: string; // YYYY-MM-DD
}
