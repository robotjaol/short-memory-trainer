import { describe, it, expect } from 'vitest';
import { calculateStreak, getTodayDateString, getYesterdayDateString } from './streak';

describe('Streak Calculation Utilities', () => {
  it('returns 0 streak for empty active dates', () => {
    const { currentStreak, longestStreak } = calculateStreak([]);
    expect(currentStreak).toBe(0);
    expect(longestStreak).toBe(0);
  });

  it('keeps streak active if trained today', () => {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    const dates = [yesterday, today];
    const { currentStreak, longestStreak } = calculateStreak(dates);
    expect(currentStreak).toBe(2);
    expect(longestStreak).toBe(2);
  });

  it('preserves streak if user trained yesterday but not yet today', () => {
    const yesterday = getYesterdayDateString();
    const dates = [yesterday];
    const { currentStreak, longestStreak } = calculateStreak(dates);
    expect(currentStreak).toBe(1);
    expect(longestStreak).toBe(1);
  });

  it('breaks current streak if gap is 2 or more days ago', () => {
    // 3 days ago
    const past = new Date();
    past.setDate(past.getDate() - 3);
    const y = past.getFullYear();
    const m = String(past.getMonth() + 1).padStart(2, '0');
    const d = String(past.getDate()).padStart(2, '0');
    const pastStr = `${y}-${m}-${d}`;

    const dates = [pastStr];
    const { currentStreak, longestStreak } = calculateStreak(dates);
    expect(currentStreak).toBe(0);
    expect(longestStreak).toBe(1);
  });
});
