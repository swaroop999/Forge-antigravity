/**
 * Forge App - Global State Management
 * Using React Context + useReducer for state management
 * Data persisted to AsyncStorage
 */

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserProfile,
  DailyTask,
  WorkoutSession,
  MealEntry,
  SkincareRoutine,
  HabitEntry,
  JournalEntry,
  DopamineEntry,
  AppState,
} from '@/lib/db/schema';

export interface ForgeState {
  // App metadata
  appState: AppState;
  userProfile: UserProfile | null;

  // Daily data
  dailyTasks: DailyTask[];
  mealEntries: MealEntry[];
  skincareRoutines: SkincareRoutine[];
  habitEntries: HabitEntry[];
  dopamineEntries: DopamineEntry[];

  // Session data
  currentWorkout: WorkoutSession | null;
  currentJournal: JournalEntry | null;

  // UI state
  loading: boolean;
  error: string | null;
}

export type ForgeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'INIT_STATE'; payload: ForgeState }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'ADD_DAILY_TASK'; payload: DailyTask }
  | { type: 'TOGGLE_DAILY_TASK'; payload: string } // task id
  | { type: 'ADD_MEAL_ENTRY'; payload: MealEntry }
  | { type: 'TOGGLE_MEAL_ENTRY'; payload: string } // meal id
  | { type: 'ADD_SKINCARE_ROUTINE'; payload: SkincareRoutine }
  | { type: 'TOGGLE_SKINCARE_STEP'; payload: { routineId: string; stepNumber: number } }
  | { type: 'ADD_HABIT_ENTRY'; payload: HabitEntry }
  | { type: 'TOGGLE_HABIT_ENTRY'; payload: string } // habit id
  | { type: 'ADD_DOPAMINE_ENTRY'; payload: DopamineEntry }
  | { type: 'SET_CURRENT_WORKOUT'; payload: WorkoutSession | null }
  | { type: 'UPDATE_CURRENT_WORKOUT'; payload: Partial<WorkoutSession> }
  | { type: 'SET_CURRENT_JOURNAL'; payload: JournalEntry | null }
  | { type: 'INCREMENT_DAY' };

const initialState: ForgeState = {
  appState: {
    currentPhase: 1,
    dayNumber: 1,
    startDate: new Date().toISOString().split('T')[0],
    lastSyncDate: new Date().toISOString().split('T')[0],
  },
  userProfile: null,
  dailyTasks: [],
  mealEntries: [],
  skincareRoutines: [],
  habitEntries: [],
  dopamineEntries: [],
  currentWorkout: null,
  currentJournal: null,
  loading: false,
  error: null,
};

function forgeReducer(state: ForgeState, action: ForgeAction): ForgeState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'INIT_STATE':
      return action.payload;

    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        userProfile: state.userProfile
          ? { ...state.userProfile, ...action.payload, updatedAt: Date.now() }
          : null,
      };

    case 'ADD_DAILY_TASK':
      return {
        ...state,
        dailyTasks: [...state.dailyTasks, action.payload],
      };

    case 'TOGGLE_DAILY_TASK':
      return {
        ...state,
        dailyTasks: state.dailyTasks.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, completedAt: !task.completed ? Date.now() : undefined }
            : task
        ),
      };

    case 'ADD_MEAL_ENTRY':
      return {
        ...state,
        mealEntries: [...state.mealEntries, action.payload],
      };

    case 'TOGGLE_MEAL_ENTRY':
      return {
        ...state,
        mealEntries: state.mealEntries.map((meal) =>
          meal.id === action.payload
            ? { ...meal, completed: !meal.completed, completedAt: !meal.completed ? Date.now() : undefined }
            : meal
        ),
      };

    case 'ADD_SKINCARE_ROUTINE':
      return {
        ...state,
        skincareRoutines: [...state.skincareRoutines, action.payload],
      };

    case 'TOGGLE_SKINCARE_STEP':
      return {
        ...state,
        skincareRoutines: state.skincareRoutines.map((routine) =>
          routine.id === action.payload.routineId
            ? {
                ...routine,
                steps: routine.steps.map((step) =>
                  step.stepNumber === action.payload.stepNumber
                    ? { ...step, completed: !step.completed }
                    : step
                ),
                completed: routine.steps.every((s) => s.completed),
                completedAt: routine.steps.every((s) => s.completed) ? Date.now() : undefined,
              }
            : routine
        ),
      };

    case 'ADD_HABIT_ENTRY':
      return {
        ...state,
        habitEntries: [...state.habitEntries, action.payload],
      };

    case 'TOGGLE_HABIT_ENTRY':
      return {
        ...state,
        habitEntries: state.habitEntries.map((habit) =>
          habit.id === action.payload
            ? { ...habit, completed: !habit.completed, completedAt: !habit.completed ? Date.now() : undefined }
            : habit
        ),
      };

    case 'ADD_DOPAMINE_ENTRY':
      return {
        ...state,
        dopamineEntries: [...state.dopamineEntries, action.payload],
      };

    case 'SET_CURRENT_WORKOUT':
      return {
        ...state,
        currentWorkout: action.payload,
      };

    case 'UPDATE_CURRENT_WORKOUT':
      return {
        ...state,
        currentWorkout: state.currentWorkout
          ? { ...state.currentWorkout, ...action.payload }
          : null,
      };

    case 'SET_CURRENT_JOURNAL':
      return {
        ...state,
        currentJournal: action.payload,
      };

    case 'INCREMENT_DAY': {
      const newDayNumber = state.appState.dayNumber + 1;
      const newPhase = newDayNumber <= 30 ? 1 : newDayNumber <= 90 ? 2 : 3;
      return {
        ...state,
        appState: {
          ...state.appState,
          dayNumber: newDayNumber,
          currentPhase: newPhase,
        },
      };
    }

    default:
      return state;
  }
}

export const ForgeContext = createContext<{
  state: ForgeState;
  dispatch: React.Dispatch<ForgeAction>;
} | null>(null);

export function useForgeStore() {
  const context = useContext(ForgeContext);
  if (!context) {
    throw new Error('useForgeStore must be used within ForgeProvider');
  }
  return context;
}

export function useForgeState() {
  const { state } = useForgeStore();
  return state;
}

export function useForgeDispatch() {
  const { dispatch } = useForgeStore();
  return dispatch;
}

/**
 * Hook to persist state to AsyncStorage
 */
export function usePersistState(state: ForgeState) {
  useEffect(() => {
    const persist = async () => {
      try {
        await AsyncStorage.setItem('forge_app_state', JSON.stringify(state));
      } catch (error) {
        console.error('Failed to persist state:', error);
      }
    };
    persist();
  }, [state]);
}

/**
 * Hook to load state from AsyncStorage
 */
export async function loadPersistedState(): Promise<ForgeState> {
  try {
    const stored = await AsyncStorage.getItem('forge_app_state');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error);
  }
  return initialState;
}
