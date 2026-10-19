/**
 * Calendar date and streak utilities.
 * Accurately tracks consecutive active calendar days based on local user timezone.
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates current streak and longest streak from an array of unique active date strings (YYYY-MM-DD).
 */
export function calculateStreak(activeDates: string[]): { currentStreak: number; longestStreak: number } {
  if (!activeDates || activeDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort dates chronologically ascending
  const sorted = Array.from(new Set(activeDates)).sort();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  // Find longest streak overall
  let longestStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sorted) {
    const curDate = new Date(dateStr + 'T00:00:00');
    if (!prevDate) {
      running = 1;
    } else {
      const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running += 1;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    if (running > longestStreak) longestStreak = running;
    prevDate = curDate;
  }

  // Calculate current streak
  // If user trained today or yesterday, streak is alive.
  const hasTrainedToday = sorted.includes(today);
  const hasTrainedYesterday = sorted.includes(yesterday);

  if (!hasTrainedToday && !hasTrainedYesterday) {
    return { currentStreak: 0, longestStreak };
  }

  let currentStreak = 0;
  let checkDate = hasTrainedToday ? new Date(today + 'T00:00:00') : new Date(yesterday + 'T00:00:00');

  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${d}`;

    if (sorted.includes(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak)
  };
}

export function formatDateLabel(timestampOrStr: number | string): string {
  const d = typeof timestampOrStr === 'number' ? new Date(timestampOrStr) : new Date(timestampOrStr);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTimeLabel(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
}
