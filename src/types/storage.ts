import { DifficultyLevel, ExerciseStats, SessionResult } from './exercise';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserPreferences {
  theme: ThemePreference;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  reducedMotion: boolean;
  defaultDifficulty: DifficultyLevel;
  preferredSessionDurationMinutes: number;
  dailyTargetSessions: number;
  adaptiveDifficultyEnabled: boolean;
}

export interface TrainingStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeDates: string[]; // List of YYYY-MM-DD dates with at least 1 session
}

export interface StoredAppDataV1 {
  version: 1;
  preferences: UserPreferences;
  streak: TrainingStreak;
  sessions: SessionResult[];
  exerciseStats: Record<string, ExerciseStats>;
  updatedAt: number;
}

export interface ExportDataEnvelope {
  exportVersion: 1;
  exportDate: string;
  app: 'Cognitive Memory Lab';
  data: StoredAppDataV1;
}
