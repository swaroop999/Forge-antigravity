/**
 * FORGE App - SQLite Database Layer
 * All data stored locally, zero backend required
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  age: number;
  height: string;
  startingWeight: number;
  currentWeight: number;
  targetWeight: number;
  startDate: string; // YYYY-MM-DD
  phase: 1 | 2 | 3;
  dayNumber: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  weight?: number;
  sleepHours?: number;
  sleepQuality?: number; // 1-10
  waterGlasses: number;
  screenTimeHours?: number;
  workoutCompleted: boolean;
  workoutType?: string;
  priorityMovementsDone: boolean;
  skincareAM: boolean;
  skincarePM: boolean;
  adapaleneUsed: boolean;
  minoxidilAM: boolean;
  minoxidilPM: boolean;
  bodySpfApplied: boolean;
  postureAM: boolean;
  posturePM: boolean;
  pornUsed: boolean;
  masturbated: boolean;
  junkFoodEaten: boolean;
  sunExposure: boolean;
  mewingPracticed: boolean;
  supplementsJson: string; // JSON
  mealsJson: string; // JSON
  scheduleJson: string; // JSON of completed items
  journalJson?: string; // JSON
  totalTasksCount: number;
  completedTasksCount: number;
}

export interface WorkoutLog {
  id: string;
  date: string;
  phase: number;
  dayType: string;
  warmupDone: boolean;
  exercisesJson: string; // JSON
  totalDuration: number;
  totalVolume: number;
  rating: number;
  completed: boolean;
}

export interface HabitHistory {
  date: string;
  habitId: string;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  wins: string; // JSON array of 3 strings
  improvement: string;
  energyLevel: number;
  mood: number;
  confidenceLevel: number;
  followedPlan: string;
  notes: string;
  createdAt: number;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  biggestWin: string;
  whatFailed: string;
  nextWeekChange: string;
  weekRating: number;
  gratitude: string;
  disciplineScore: number;
  measurementsJson: string;
  createdAt: number;
}

export interface Milestone {
  id: string;
  phase: number;
  days: number;
  title: string;
  completed: boolean;
  completedDate?: string;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  category: string;
  angle: string;
  uri: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  timestamp: number;
  role: string;
  content: string;
  context: string;
}

export interface UrgeLog {
  id: string;
  timestamp: number;
  trigger?: string;
  copingUsed: string;
  outcome: string;
}

export interface TanAssessment {
  id: string;
  date: string;
  face: number;
  neck: number;
  arms: number;
  hands: number;
  legs: number;
  feet: number;
}

export interface Purchase {
  id: string;
  name: string;
  cost: number;
  category: string;
  purchased: boolean;
  purchasedDate?: string;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

export const KEYS = {
  USER_PROFILE: 'forge_user_profile',
  DAILY_LOG_PREFIX: 'forge_daily_',
  WORKOUT_LOGS: 'forge_workout_logs',
  HABIT_HISTORY: 'forge_habit_history',
  JOURNAL_ENTRIES: 'forge_journal_entries',
  WEEKLY_REVIEWS: 'forge_weekly_reviews',
  MILESTONES: 'forge_milestones',
  PROGRESS_PHOTOS: 'forge_progress_photos',
  CHAT_MESSAGES: 'forge_chat_messages',
  URGE_LOGS: 'forge_urge_logs',
  TAN_ASSESSMENTS: 'forge_tan_assessments',
  PURCHASES: 'forge_purchases',
  STREAK_DATA: 'forge_streak_data',
  ONBOARDING_DONE: 'forge_onboarding_done',
  START_DATE: 'forge_start_date',
  COMMITMENT_LETTER: 'forge_commitment_letter',
};

// ─── Generic helpers ───────────────────────────────────────────────────────────

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export const ProfileRepo = {
  async get(): Promise<UserProfile | null> {
    return getItem<UserProfile>(KEYS.USER_PROFILE);
  },
  async save(profile: UserProfile): Promise<void> {
    await setItem(KEYS.USER_PROFILE, profile);
  },
  async getDefault(): Promise<UserProfile> {
    const today = new Date().toISOString().split('T')[0];
    return {
      name: 'User',
      age: 22,
      height: "5'6\"",
      startingWeight: 45,
      currentWeight: 45,
      targetWeight: 62,
      startDate: today,
      phase: 1,
      dayNumber: 1,
    };
  },
};

// ─── Daily Log ────────────────────────────────────────────────────────────────

export const DailyLogRepo = {
  async getForDate(date: string): Promise<DailyLog | null> {
    return getItem<DailyLog>(`${KEYS.DAILY_LOG_PREFIX}${date}`);
  },
  async save(log: DailyLog): Promise<void> {
    await setItem(`${KEYS.DAILY_LOG_PREFIX}${log.date}`, log);
  },
  async getDefault(date: string, scheduleItems: { time: string; task: string }[]): Promise<DailyLog> {
    return {
      date,
      waterGlasses: 0,
      workoutCompleted: false,
      priorityMovementsDone: false,
      skincareAM: false,
      skincarePM: false,
      adapaleneUsed: false,
      minoxidilAM: false,
      minoxidilPM: false,
      bodySpfApplied: false,
      postureAM: false,
      posturePM: false,
      pornUsed: false,
      masturbated: false,
      junkFoodEaten: false,
      sunExposure: false,
      mewingPracticed: false,
      supplementsJson: JSON.stringify({}),
      mealsJson: JSON.stringify({}),
      scheduleJson: JSON.stringify(scheduleItems.map(s => ({ ...s, completed: false }))),
      totalTasksCount: scheduleItems.length,
      completedTasksCount: 0,
    };
  },
  async getLast7Days(): Promise<DailyLog[]> {
    const logs: DailyLog[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().split('T')[0];
      const log = await getItem<DailyLog>(`${KEYS.DAILY_LOG_PREFIX}${date}`);
      if (log) logs.push(log);
    }
    return logs;
  },
  async getAll(): Promise<DailyLog[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const dailyKeys = keys.filter(k => k.startsWith(KEYS.DAILY_LOG_PREFIX));
      const stores = await AsyncStorage.multiGet(dailyKeys);
      return stores.map(([k, v]) => v ? JSON.parse(v) : null).filter(Boolean);
    } catch {
      return [];
    }
  }
};

// ─── Workout Logs ─────────────────────────────────────────────────────────────

export const WorkoutRepo = {
  async getAll(): Promise<WorkoutLog[]> {
    return (await getItem<WorkoutLog[]>(KEYS.WORKOUT_LOGS)) ?? [];
  },
  async save(log: WorkoutLog): Promise<void> {
    const all = await this.getAll();
    const idx = all.findIndex(w => w.id === log.id);
    if (idx >= 0) all[idx] = log; else all.unshift(log);
    await setItem(KEYS.WORKOUT_LOGS, all);
  },
  async getLast(n: number): Promise<WorkoutLog[]> {
    const all = await this.getAll();
    return all.slice(0, n);
  },
};

// ─── Habit History ────────────────────────────────────────────────────────────

export const HabitRepo = {
  async getHistory(): Promise<HabitHistory[]> {
    return (await getItem<HabitHistory[]>(KEYS.HABIT_HISTORY)) ?? [];
  },
  async toggle(date: string, habitId: string, completed: boolean): Promise<void> {
    const all = await this.getHistory();
    const idx = all.findIndex(h => h.date === date && h.habitId === habitId);
    if (idx >= 0) all[idx].completed = completed;
    else all.push({ date, habitId, completed });
    await setItem(KEYS.HABIT_HISTORY, all);
  },
  async getForDate(date: string): Promise<HabitHistory[]> {
    const all = await this.getHistory();
    return all.filter(h => h.date === date);
  },
  async getLast90Days(): Promise<HabitHistory[]> {
    const all = await this.getHistory();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return all.filter(h => h.date >= cutoffStr);
  },
  async getStreak(habitId: string): Promise<{ current: number; longest: number; total: number }> {
    const all = await this.getHistory();
    const entries = all.filter(h => h.habitId === habitId && h.completed).map(h => h.date).sort().reverse();
    if (entries.length === 0) return { current: 0, longest: 0, total: 0 };
    let current = 0;
    let longest = 0;
    let streak = 0;
    let prev: string | null = null;
    for (const d of entries) {
      if (prev === null) {
        streak = 1;
      } else {
        const prevDate = new Date(prev);
        const curDate = new Date(d);
        const diff = Math.round((prevDate.getTime() - curDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) streak++;
        else streak = 1;
      }
      if (streak > longest) longest = streak;
      prev = d;
    }
    // Current streak = streak from today backwards
    const today = new Date().toISOString().split('T')[0];
    current = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (all.find(h => h.habitId === habitId && h.date === ds && h.completed)) current++;
      else break;
    }
    return { current, longest, total: entries.length };
  },
};

// ─── Journal ──────────────────────────────────────────────────────────────────

export const JournalRepo = {
  async getAll(): Promise<JournalEntry[]> {
    return (await getItem<JournalEntry[]>(KEYS.JOURNAL_ENTRIES)) ?? [];
  },
  async save(entry: JournalEntry): Promise<void> {
    const all = await this.getAll();
    const idx = all.findIndex(e => e.id === entry.id);
    if (idx >= 0) all[idx] = entry; else all.unshift(entry);
    await setItem(KEYS.JOURNAL_ENTRIES, all);
  },
  async getForDate(date: string): Promise<JournalEntry | null> {
    const all = await this.getAll();
    return all.find(e => e.date === date) ?? null;
  },
};

// ─── Milestones ───────────────────────────────────────────────────────────────

export const MilestoneRepo = {
  async getAll(): Promise<Milestone[]> {
    return (await getItem<Milestone[]>(KEYS.MILESTONES)) ?? [];
  },
  async save(milestones: Milestone[]): Promise<void> {
    await setItem(KEYS.MILESTONES, milestones);
  },
  async toggle(id: string): Promise<void> {
    const all = await this.getAll();
    const idx = all.findIndex(m => m.id === id);
    if (idx >= 0) {
      all[idx].completed = !all[idx].completed;
      all[idx].completedDate = all[idx].completed ? new Date().toISOString().split('T')[0] : undefined;
      await setItem(KEYS.MILESTONES, all);
    }
  },
};

// ─── Progress Photos ──────────────────────────────────────────────────────────

export const PhotoRepo = {
  async getAll(): Promise<ProgressPhoto[]> {
    return (await getItem<ProgressPhoto[]>(KEYS.PROGRESS_PHOTOS)) ?? [];
  },
  async add(photo: ProgressPhoto): Promise<void> {
    const all = await this.getAll();
    all.unshift(photo);
    await setItem(KEYS.PROGRESS_PHOTOS, all);
  },
  async getByCategory(category: string): Promise<ProgressPhoto[]> {
    const all = await this.getAll();
    return all.filter(p => p.category === category);
  },
};

// ─── Chat Messages ────────────────────────────────────────────────────────────

export const ChatRepo = {
  async getAll(): Promise<ChatMessage[]> {
    return (await getItem<ChatMessage[]>(KEYS.CHAT_MESSAGES)) ?? [];
  },
  async add(msg: ChatMessage): Promise<void> {
    const all = await this.getAll();
    all.push(msg);
    await setItem(KEYS.CHAT_MESSAGES, all);
  },
  async clear(): Promise<void> {
    await setItem(KEYS.CHAT_MESSAGES, []);
  },
};

// ─── Urge Logs ────────────────────────────────────────────────────────────────

export const UrgeRepo = {
  async getAll(): Promise<UrgeLog[]> {
    return (await getItem<UrgeLog[]>(KEYS.URGE_LOGS)) ?? [];
  },
  async add(log: UrgeLog): Promise<void> {
    const all = await this.getAll();
    all.unshift(log);
    await setItem(KEYS.URGE_LOGS, all);
  },
};

// ─── Tan Assessments ──────────────────────────────────────────────────────────

export const TanRepo = {
  async getAll(): Promise<TanAssessment[]> {
    return (await getItem<TanAssessment[]>(KEYS.TAN_ASSESSMENTS)) ?? [];
  },
  async add(assessment: TanAssessment): Promise<void> {
    const all = await this.getAll();
    all.unshift(assessment);
    await setItem(KEYS.TAN_ASSESSMENTS, all);
  },
};

// ─── Purchases ────────────────────────────────────────────────────────────────

export const PurchaseRepo = {
  async getAll(): Promise<Purchase[]> {
    return (await getItem<Purchase[]>(KEYS.PURCHASES)) ?? [];
  },
  async toggle(id: string): Promise<void> {
    const all = await this.getAll();
    const idx = all.findIndex(p => p.id === id);
    if (idx >= 0) {
      all[idx].purchased = !all[idx].purchased;
      all[idx].purchasedDate = all[idx].purchased ? new Date().toISOString().split('T')[0] : undefined;
      await setItem(KEYS.PURCHASES, all);
    }
  },
  async save(purchases: Purchase[]): Promise<void> {
    await setItem(KEYS.PURCHASES, purchases);
  },
};

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const AppRepo = {
  async isOnboardingDone(): Promise<boolean> {
    const v = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
    return v === 'true';
  },
  async setOnboardingDone(): Promise<void> {
    await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, 'true');
  },
  async getStartDate(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.START_DATE);
  },
  async setStartDate(date: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.START_DATE, date);
  },
  async getCommitmentLetter(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.COMMITMENT_LETTER);
  },
  async setCommitmentLetter(letter: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.COMMITMENT_LETTER, letter);
  },
  calcPhaseAndDay(startDate: string): { phase: 1 | 2 | 3; dayNumber: number } {
    const start = new Date(startDate);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const dayNumber = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);
    const phase: 1 | 2 | 3 = dayNumber <= 30 ? 1 : dayNumber <= 90 ? 2 : 3;
    return { phase, dayNumber };
  },
};

// ─── Centralized Wrappers for Tab Components ────────────────────────────────────

export const AppearanceRepo = {
  async getSkincareAM(date: string): Promise<Record<number, boolean>> {
    return (await getItem<Record<number, boolean>>(`skincare_am_${date}`)) ?? {};
  },
  async setSkincareAM(date: string, value: Record<number, boolean>): Promise<void> {
    await setItem(`skincare_am_${date}`, value);
  },
  async getSkincarePM(date: string): Promise<Record<number, boolean>> {
    return (await getItem<Record<number, boolean>>(`skincare_pm_${date}`)) ?? {};
  },
  async setSkincarePM(date: string, value: Record<number, boolean>): Promise<void> {
    await setItem(`skincare_pm_${date}`, value);
  },
  async getTanAssessment(): Promise<Record<string, number>> {
    return (await getItem<Record<string, number>>('tan_assessment')) ?? {};
  },
  async setTanAssessment(value: Record<string, number>): Promise<void> {
    await setItem('tan_assessment', value);
  },
  async getMinox(date: string): Promise<{ am: boolean; pm: boolean }> {
    return (await getItem<{ am: boolean; pm: boolean }>(`minox_${date}`)) ?? { am: false, pm: false };
  },
  async setMinox(date: string, value: { am: boolean; pm: boolean }): Promise<void> {
    await setItem(`minox_${date}`, value);
  },
  async getGrooming(date: string): Promise<Record<string, boolean>> {
    return (await getItem<Record<string, boolean>>(`grooming_${date}`)) ?? {};
  },
  async setGrooming(date: string, value: Record<string, boolean>): Promise<void> {
    await setItem(`grooming_${date}`, value);
  },
  async getWardrobeChecklist(): Promise<Record<string, boolean>> {
    return (await getItem<Record<string, boolean>>('wardrobe_checklist')) ?? {};
  },
  async setWardrobeChecklist(value: Record<string, boolean>): Promise<void> {
    await setItem('wardrobe_checklist', value);
  },
  async getFaceRatings(): Promise<Record<string, number>> {
    return (await getItem<Record<string, number>>('face_ratings')) ?? {};
  },
  async setFaceRatings(value: Record<string, number>): Promise<void> {
    await setItem('face_ratings', value);
  },
};

export const DisciplineRepo = {
  async getHabits(date: string): Promise<Record<string, boolean>> {
    return (await getItem<Record<string, boolean>>(`habits_${date}`)) ?? {};
  },
  async setHabits(date: string, value: Record<string, boolean>): Promise<void> {
    await setItem(`habits_${date}`, value);
  },
  async getStreakPorn(): Promise<number> {
    return (await getItem<number>('streak_porn')) ?? 0;
  },
  async setStreakPorn(value: number): Promise<void> {
    await setItem('streak_porn', value);
  },
  async getStreakSocial(): Promise<number> {
    return (await getItem<number>('streak_social')) ?? 0;
  },
  async setStreakSocial(value: number): Promise<void> {
    await setItem('streak_social', value);
  },
  async getJournalReflection(date: string): Promise<string> {
    const val = await AsyncStorage.getItem(`journal_${date}`);
    if (!val) return '';
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  },
  async setJournalReflection(date: string, value: string): Promise<void> {
    await AsyncStorage.setItem(`journal_${date}`, JSON.stringify(value));
  },
  async getAllJournalReflections(): Promise<{ date: string; content: string }[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const journalKeys = keys.filter(k => k.startsWith('journal_'));
      const stores = await AsyncStorage.multiGet(journalKeys);
      return stores.map(([key, val]) => {
        let content = '';
        if (val) {
          try { content = JSON.parse(val); } catch { content = val; }
        }
        return {
          date: key.replace('journal_', ''),
          content
        };
      });
    } catch {
      return [];
    }
  },
};

export const NutritionRepo = {
  async getJunkCount(date: string): Promise<number> {
    return (await getItem<number>(`junk_count_${date}`)) ?? 0;
  },
  async setJunkCount(date: string, value: number): Promise<void> {
    await setItem(`junk_count_${date}`, value);
  },
  async getSupplements(date: string): Promise<Record<string, boolean>> {
    return (await getItem<Record<string, boolean>>(`supplements_${date}`)) ?? {};
  },
  async setSupplements(date: string, value: Record<string, boolean>): Promise<void> {
    await setItem(`supplements_${date}`, value);
  },
};


export const GroceriesRepo = {
  async getGroceries(): Promise<Record<string, boolean>> {
    return (await getItem<Record<string, boolean>>('groceries_checked')) ?? {};
  },
  async setGroceries(value: Record<string, boolean>): Promise<void> {
    await setItem('groceries_checked', value);
  },
};

export const TrainingRepo = {
  async getMeasurements(): Promise<Record<string, number>> {
    return (await getItem<Record<string, number>>('forge_measurements')) ?? {};
  },
  async setMeasurements(value: Record<string, number>): Promise<void> {
    await setItem('forge_measurements', value);
  },
};

// ─── Cross-tab navigation helper (for "View" buttons on dashboard schedule) ─────

export const NavRepo = {
  async setPendingSubTab(tabPath: string, subTab: string): Promise<void> {
    try { await AsyncStorage.setItem('forge_pending_subtab', JSON.stringify({ tabPath, subTab })); } catch {}
  },
  async consumePendingSubTab(currentTabPath: string): Promise<string | null> {
    try {
      const raw = await AsyncStorage.getItem('forge_pending_subtab');
      if (!raw) return null;
      const { tabPath, subTab } = JSON.parse(raw);
      if (tabPath === currentTabPath) {
        await AsyncStorage.removeItem('forge_pending_subtab');
        return subTab;
      }
    } catch {}
    return null;
  },
};
