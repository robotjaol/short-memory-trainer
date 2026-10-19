import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService, DEFAULT_PREFERENCES, INITIAL_STORAGE_STATE } from './localStorage';

describe('StorageService and JSON Import Validation', () => {
// In-memory mock for localStorage in Node test runner
const memoryStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => memoryStore[key] || null,
  setItem: (key: string, value: string) => { memoryStore[key] = value; },
  removeItem: (key: string) => { delete memoryStore[key]; },
  clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); }
};

beforeEach(() => {
  (globalThis as any).window = globalThis;
  (globalThis as any).localStorage = mockLocalStorage;
  mockLocalStorage.clear();
});

  it('initializes with default safe state when storage is empty', () => {
    const data = StorageService.loadData();
    expect(data.version).toBe(1);
    expect(data.sessions).toEqual([]);
    expect(data.preferences.theme).toBe('system');
    expect(data.streak.currentStreak).toBe(0);
  });

  it('rejects invalid JSON string during import', () => {
    const result = StorageService.importFromJson('NOT_VALID_JSON{]');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Failed to import JSON');
  });

  it('rejects JSON missing required schema properties', () => {
    const result = StorageService.importFromJson(JSON.stringify({ randomKey: 'value' }));
    expect(result.success).toBe(false);
    expect(result.message).toContain('JSON structure does not match');
  });

  it('successfully imports valid JSON backup envelope', () => {
    const validPayload = {
      exportVersion: 1,
      exportDate: '2026-10-19T00:00:00.000Z',
      app: 'Cognitive Memory Lab',
      data: {
        version: 1,
        preferences: DEFAULT_PREFERENCES,
        streak: {
          currentStreak: 2,
          longestStreak: 5,
          lastActiveDate: '2026-10-19',
          activeDates: ['2026-10-18', '2026-10-19']
        },
        sessions: [
          {
            id: 'sess_1',
            exerciseId: 'digit-span',
            exerciseName: 'Digit Span',
            category: 'digit',
            timestamp: 1729320000000,
            dateString: '2026-10-19',
            difficulty: 'beginner',
            durationSeconds: 120,
            rawScore: 500,
            accuracy: 90,
            correctCount: 4,
            incorrectCount: 1,
            totalTrials: 5,
            exerciseMetrics: {},
            trials: []
          }
        ],
        exerciseStats: {},
        updatedAt: 1729320000000
      }
    };

    const result = StorageService.importFromJson(JSON.stringify(validPayload));
    expect(result.success).toBe(true);
    expect(result.data?.sessions.length).toBe(1);
    expect(result.data?.sessions[0].exerciseId).toBe('digit-span');
  });
});
