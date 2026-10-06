/**
 * FORGE App - SQLite Database Layer
 * All data stored locally, zero backend required
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalSupabaseService } from '../supabase';

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
    try {
      const days = await DisciplineRepo.getAllJournalDays();
      const photos: ProgressPhoto[] = [];
      for (const day of days) {
        day.photoUrls.forEach((uri, idx) => {
          photos.push({
            id: `p_${day.date}_${idx}`,
            date: day.date,
            category: 'Progress Photo',
            angle: `Photo ${idx + 1}`,
            uri,
            notes: day.content,
          });
        });
      }
      return photos;
    } catch {
      return [];
    }
  },
  async add(photo: ProgressPhoto): Promise<void> {
    const day = await DisciplineRepo.getJournalDay(photo.date);
    if (!day.photoUrls.includes(photo.uri)) {
      await DisciplineRepo.setJournalDay(photo.date, day.content, [photo.uri, ...day.photoUrls]);
    }
  },
  async getByCategory(category: string): Promise<ProgressPhoto[]> {
    return this.getAll();
  },
  async delete(id: string): Promise<void> {
    // Delete photo by id pattern: p_YYYY-MM-DD_idx or uri match
    const all = await this.getAll();
    const target = all.find(p => p.id === id);
    if (target) {
      await DisciplineRepo.deleteJournalPhoto(target.date, target.uri);
    }
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
    if (val) {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    // Fallback to Supabase if not in local storage
    try {
      const remote = await JournalSupabaseService.fetchAllJournals();
      const match = remote.find(r => r.date === date);
      if (match?.reflection) {
        await AsyncStorage.setItem(`journal_${date}`, JSON.stringify(match.reflection));
        return match.reflection;
      }
    } catch {}
    return '';
  },
  async getJournalPhotos(date: string): Promise<string[]> {
    const photosRaw = await AsyncStorage.getItem(`journal_photos_${date}`);
    if (photosRaw) {
      try {
        const parsed = JSON.parse(photosRaw);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {}
    }
    // Legacy single photo fallback
    const single = await AsyncStorage.getItem(`journal_photo_${date}`);
    if (single && single.trim()) {
      return [single];
    }
    // Remote fallback
    try {
      const remote = await JournalSupabaseService.fetchAllJournals();
      const match = remote.find(r => r.date === date);
      if (match?.photo_url) {
        try {
          const parsed = JSON.parse(match.photo_url);
          if (Array.isArray(parsed)) {
            await AsyncStorage.setItem(`journal_photos_${date}`, JSON.stringify(parsed));
            return parsed;
          }
        } catch {}
        await AsyncStorage.setItem(`journal_photos_${date}`, JSON.stringify([match.photo_url]));
        return [match.photo_url];
      }
    } catch {}
    return [];
  },
  async getJournalDay(date: string): Promise<{ date: string; content: string; photoUrls: string[] }> {
    const content = await this.getJournalReflection(date);
    const photoUrls = await this.getJournalPhotos(date);
    return { date, content, photoUrls };
  },
  async setJournalDay(date: string, content: string, photoUrls: string[]): Promise<void> {
    if (content.trim()) {
      await AsyncStorage.setItem(`journal_${date}`, JSON.stringify(content));
    } else {
      await AsyncStorage.removeItem(`journal_${date}`);
    }
    if (photoUrls && photoUrls.length > 0) {
      await AsyncStorage.setItem(`journal_photos_${date}`, JSON.stringify(photoUrls));
      await AsyncStorage.setItem(`journal_photo_${date}`, photoUrls[0]);
    } else {
      await AsyncStorage.removeItem(`journal_photos_${date}`);
      await AsyncStorage.removeItem(`journal_photo_${date}`);
    }
    // Upsert to cloud in background
    const cloudPhotoPayload = photoUrls.length > 0 ? JSON.stringify(photoUrls) : null;
    JournalSupabaseService.upsertJournal(date, content, cloudPhotoPayload).catch(() => {});
  },
  async deleteJournalDay(date: string): Promise<void> {
    await AsyncStorage.removeItem(`journal_${date}`);
    await AsyncStorage.removeItem(`journal_photos_${date}`);
    await AsyncStorage.removeItem(`journal_photo_${date}`);
    await AsyncStorage.removeItem(`journal_photo_cat_${date}`);
    JournalSupabaseService.deleteJournal(date).catch(() => {});
  },
  async deleteJournalPhoto(date: string, photoUrlToDelete: string): Promise<string[]> {
    const current = await this.getJournalPhotos(date);
    const remaining = current.filter(p => p !== photoUrlToDelete);
    const content = await this.getJournalReflection(date);
    await this.setJournalDay(date, content, remaining);
    return remaining;
  },
  async deleteJournalReflectionOnly(date: string): Promise<void> {
    const photos = await this.getJournalPhotos(date);
    await this.setJournalDay(date, '', photos);
  },
  async getJournalPhoto(date: string): Promise<{ photoUrl: string | null; category: string }> {
    const photos = await this.getJournalPhotos(date);
    return { photoUrl: photos[0] || null, category: 'Journal' };
  },
  async setJournalReflection(date: string, value: string, photoUrl?: string | null, photoCategory?: string): Promise<void> {
    const existingPhotos = await this.getJournalPhotos(date);
    let newPhotos = existingPhotos;
    if (photoUrl !== undefined) {
      if (photoUrl && !existingPhotos.includes(photoUrl)) {
        newPhotos = [photoUrl, ...existingPhotos];
      } else if (!photoUrl) {
        newPhotos = [];
      }
    }
    await this.setJournalDay(date, value, newPhotos);
  },
  async getAllJournalDays(): Promise<{ date: string; content: string; photoUrls: string[] }[]> {
    const localMap: Record<string, { date: string; content: string; photoUrls: string[] }> = {};
    try {
      const keys = await AsyncStorage.getAllKeys();
      const journalKeys = keys.filter(k => k.startsWith('journal_') && !k.startsWith('journal_photo_') && !k.startsWith('journal_photos_'));
      for (const k of journalKeys) {
        const date = k.replace('journal_', '');
        const val = await AsyncStorage.getItem(k);
        let content = '';
        if (val) {
          try { content = JSON.parse(val); } catch { content = val; }
        }
        if (!localMap[date]) localMap[date] = { date, content, photoUrls: [] };
        else localMap[date].content = content;
      }

      // Check multi-photo keys
      const multiPhotoKeys = keys.filter(k => k.startsWith('journal_photos_'));
      for (const k of multiPhotoKeys) {
        const date = k.replace('journal_photos_', '');
        const val = await AsyncStorage.getItem(k);
        if (val) {
          try {
            const arr = JSON.parse(val);
            if (Array.isArray(arr) && arr.length > 0) {
              if (!localMap[date]) localMap[date] = { date, content: '', photoUrls: arr };
              else localMap[date].photoUrls = arr;
            }
          } catch {}
        }
      }

      // Legacy single photo keys fallback
      const singlePhotoKeys = keys.filter(k => k.startsWith('journal_photo_') && !k.startsWith('journal_photos_') && !k.startsWith('journal_photo_cat_'));
      for (const k of singlePhotoKeys) {
        const date = k.replace('journal_photo_', '');
        const val = await AsyncStorage.getItem(k);
        if (val && (!localMap[date] || localMap[date].photoUrls.length === 0)) {
          if (!localMap[date]) localMap[date] = { date, content: '', photoUrls: [val] };
          else if (!localMap[date].photoUrls.includes(val)) localMap[date].photoUrls.push(val);
        }
      }
    } catch {}

    // Merge remote entries
    try {
      const remote = await JournalSupabaseService.fetchAllJournals();
      remote.forEach(r => {
        let remotePhotos: string[] = [];
        if (r.photo_url) {
          try {
            const parsed = JSON.parse(r.photo_url);
            if (Array.isArray(parsed)) remotePhotos = parsed;
            else remotePhotos = [r.photo_url];
          } catch {
            remotePhotos = [r.photo_url];
          }
        }
        if (!localMap[r.date]) {
          localMap[r.date] = { date: r.date, content: r.reflection || '', photoUrls: remotePhotos };
        } else {
          if (!localMap[r.date].content && r.reflection) localMap[r.date].content = r.reflection;
          if (localMap[r.date].photoUrls.length === 0 && remotePhotos.length > 0) {
            localMap[r.date].photoUrls = remotePhotos;
          }
        }
      });
    } catch {}

    return Object.values(localMap)
      .filter(item => (item.content && item.content.trim().length > 0) || item.photoUrls.length > 0)
      .sort((a, b) => b.date.localeCompare(a.date));
  },
  async getEntryDatesMap(): Promise<Record<string, { hasReflection: boolean; hasPhotos: boolean; photoCount: number }>> {
    const all = await this.getAllJournalDays();
    const map: Record<string, { hasReflection: boolean; hasPhotos: boolean; photoCount: number }> = {};
    for (const item of all) {
      map[item.date] = {
        hasReflection: !!(item.content && item.content.trim().length > 0),
        hasPhotos: item.photoUrls.length > 0,
        photoCount: item.photoUrls.length,
      };
    }
    return map;
  },
  async getAllJournalReflections(): Promise<{ date: string; content: string; photoUrl?: string | null; category?: string }[]> {
    const days = await this.getAllJournalDays();
    return days.map(d => ({
      date: d.date,
      content: d.content,
      photoUrl: d.photoUrls[0] || null,
      category: 'Journal',
    }));
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
