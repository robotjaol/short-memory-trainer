/**
 * Typed LocalStorage data repository with versioned schema,
 * defensive error handling, validation, streak calculation, and JSON backup/restore.
 */

import { SessionResult, ExerciseStats } from '../../types/exercise';
import { ExportDataEnvelope, StoredAppDataV1, UserPreferences } from '../../types/storage';
import { calculateStreak, getTodayDateString } from '../dates/streak';

const STORAGE_KEY = 'cog_memory_lab_data_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  soundEnabled: true,
  soundVolume: 0.2,
  reducedMotion: false,
  defaultDifficulty: 'beginner',
  preferredSessionDurationMinutes: 3,
  dailyTargetSessions: 3,
  adaptiveDifficultyEnabled: true
};

export const INITIAL_STORAGE_STATE: StoredAppDataV1 = {
  version: 1,
  preferences: DEFAULT_PREFERENCES,
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    activeDates: []
  },
  sessions: [],
  exerciseStats: {},
  updatedAt: Date.now()
};

export class StorageService {
  /**
   * Retrieves stored data, performing migrations or graceful initial fallback if corrupt.
   */
  static loadData(): StoredAppDataV1 {
    if (typeof window === 'undefined') return INITIAL_STORAGE_STATE;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveData(INITIAL_STORAGE_STATE);
        return INITIAL_STORAGE_STATE;
      }

      const parsed = JSON.parse(raw);

      // Check version and validate shape
      if (!parsed || typeof parsed !== 'object') {
        console.warn('Invalid storage content, resetting to initial state.');
        return INITIAL_STORAGE_STATE;
      }

      // Safe fallback merge with defaults
      const merged: StoredAppDataV1 = {
        version: 1,
        preferences: {
          ...DEFAULT_PREFERENCES,
          ...(parsed.preferences || {})
        },
        streak: {
          currentStreak: Number(parsed.streak?.currentStreak) || 0,
          longestStreak: Number(parsed.streak?.longestStreak) || 0,
          lastActiveDate: String(parsed.streak?.lastActiveDate || ''),
          activeDates: Array.isArray(parsed.streak?.activeDates) ? parsed.streak.activeDates : []
        },
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        exerciseStats: typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null ? parsed.exerciseStats : {},
        updatedAt: Number(parsed.updatedAt) || Date.now()
      };

      return merged;
    } catch (err) {
      console.error('Error reading localStorage, using initial state:', err);
      return INITIAL_STORAGE_STATE;
    }
  }

  /**
   * Persists data to localStorage
   */
  static saveData(data: StoredAppDataV1): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const payload: StoredAppDataV1 = {
        ...data,
        updatedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (err) {
      console.error('Error saving to localStorage:', err);
      return false;
    }
  }

  /**
   * Adds a completed session, recalculates stats & streaks, returns updated state.
   */
  static recordSession(session: SessionResult): StoredAppDataV1 {
    const data = this.loadData();

    // Prevent duplicate entries by session ID
    if (data.sessions.some(s => s.id === session.id)) {
      return data;
    }

    const updatedSessions = [session, ...data.sessions];

    // Update active dates & streak
    const dateStr = session.dateString || getTodayDateString();
    const activeDatesSet = new Set(data.streak.activeDates);
    activeDatesSet.add(dateStr);
    const activeDates = Array.from(activeDatesSet);

    const { currentStreak, longestStreak } = calculateStreak(activeDates);

    // Update exercise stats
    const stats: Record<string, ExerciseStats> = { ...data.exerciseStats };
    const exId = session.exerciseId;
    const currentExSessions = updatedSessions.filter(s => s.exerciseId === exId);

    const bestScore = Math.max(...currentExSessions.map(s => s.rawScore), 0);
    const bestAccuracy = Math.max(...currentExSessions.map(s => s.accuracy), 0);
    const avgAccuracy = Math.round(
      currentExSessions.reduce((acc, cur) => acc + cur.accuracy, 0) / currentExSessions.length
    );

    stats[exId] = {
      exerciseId: exId,
      totalSessions: currentExSessions.length,
      bestScore,
      bestAccuracy,
      averageAccuracy: avgAccuracy,
      lastPlayedTimestamp: session.timestamp,
      lastDifficulty: session.difficulty
    };

    const nextState: StoredAppDataV1 = {
      ...data,
      sessions: updatedSessions,
      exerciseStats: stats,
      streak: {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        lastActiveDate: dateStr,
        activeDates
      },
      updatedAt: Date.now()
    };

    this.saveData(nextState);
    return nextState;
  }

  /**
   * Deletes a specific session by ID and recalculates aggregates
   */
  static deleteSession(sessionId: string): StoredAppDataV1 {
    const data = this.loadData();
    const filteredSessions = data.sessions.filter(s => s.id !== sessionId);

    // Recompute active dates from remaining sessions
    const activeDatesSet = new Set(filteredSessions.map(s => s.dateString));
    const activeDates = Array.from(activeDatesSet);
    const { currentStreak, longestStreak } = calculateStreak(activeDates);

    // Recompute exercise stats
    const stats: Record<string, ExerciseStats> = {};
    const exerciseIds = Array.from(new Set(filteredSessions.map(s => s.exerciseId)));

    for (const exId of exerciseIds) {
      const exSessions = filteredSessions.filter(s => s.exerciseId === exId);
      const bestScore = Math.max(...exSessions.map(s => s.rawScore), 0);
      const bestAccuracy = Math.max(...exSessions.map(s => s.accuracy), 0);
      const avgAccuracy = Math.round(
        exSessions.reduce((acc, cur) => acc + cur.accuracy, 0) / exSessions.length
      );

      stats[exId] = {
        exerciseId: exId,
        totalSessions: exSessions.length,
        bestScore,
        bestAccuracy,
        averageAccuracy: avgAccuracy,
        lastPlayedTimestamp: Math.max(...exSessions.map(s => s.timestamp), 0),
        lastDifficulty: exSessions[0].difficulty
      };
    }

    const nextState: StoredAppDataV1 = {
      ...data,
      sessions: filteredSessions,
      exerciseStats: stats,
      streak: {
        currentStreak,
        longestStreak,
        lastActiveDate: activeDates.length > 0 ? activeDates[activeDates.length - 1] : '',
        activeDates
      },
      updatedAt: Date.now()
    };

    this.saveData(nextState);
    return nextState;
  }

  /**
   * Updates user preferences
   */
  static updatePreferences(prefs: Partial<UserPreferences>): StoredAppDataV1 {
    const data = this.loadData();
    const nextState: StoredAppDataV1 = {
      ...data,
      preferences: {
        ...data.preferences,
        ...prefs
      },
      updatedAt: Date.now()
    };
    this.saveData(nextState);
    return nextState;
  }

  /**
   * Resets all stored application data
   */
  static resetAllData(): StoredAppDataV1 {
    this.saveData(INITIAL_STORAGE_STATE);
    return INITIAL_STORAGE_STATE;
  }

  /**
   * Validates and imports JSON backup
   */
  static importFromJson(jsonString: string): { success: boolean; message: string; data?: StoredAppDataV1 } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Invalid JSON file content.' };
      }

      // Check envelope or raw object
      const incoming: StoredAppDataV1 = parsed.data && parsed.exportVersion ? parsed.data : parsed;

      if (!incoming.preferences || !Array.isArray(incoming.sessions)) {
        return { success: false, message: 'JSON structure does not match Cognitive Memory Lab format.' };
      }

      // Validate each session structure
      const validSessions: SessionResult[] = incoming.sessions.filter(s => (
        s && typeof s.id === 'string' && typeof s.exerciseId === 'string' && typeof s.accuracy === 'number'
      ));

      // Calculate active dates
      const activeDates = Array.from(new Set(validSessions.map(s => s.dateString || getTodayDateString())));
      const { currentStreak, longestStreak } = calculateStreak(activeDates);

      // Reconstruct clean safe state
      const cleaned: StoredAppDataV1 = {
        version: 1,
        preferences: {
          ...DEFAULT_PREFERENCES,
          ...(incoming.preferences || {})
        },
        streak: {
          currentStreak,
          longestStreak: Math.max(longestStreak, incoming.streak?.longestStreak || 0),
          lastActiveDate: activeDates[activeDates.length - 1] || '',
          activeDates
        },
        sessions: validSessions,
        exerciseStats: incoming.exerciseStats || {},
        updatedAt: Date.now()
      };

      this.saveData(cleaned);
      return { success: true, message: `Successfully restored ${validSessions.length} training sessions!`, data: cleaned };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown parsing error';
      return { success: false, message: `Failed to import JSON: ${errorMessage}` };
    }
  }

  /**
   * Generates a downloadable JSON export file
   */
  static exportToJson(): void {
    const data = this.loadData();
    const envelope: ExportDataEnvelope = {
      exportVersion: 1,
      exportDate: new Date().toISOString(),
      app: 'Cognitive Memory Lab',
      data
    };

    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognitive-memory-lab-backup-${getTodayDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
