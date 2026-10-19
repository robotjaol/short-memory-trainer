import React from 'react';
import { StoredAppDataV1 } from '../../types/storage';
import { EXERCISE_CATALOG } from '../../data/exerciseCatalog';
import { getTodayDateString, formatDateLabel, formatTimeLabel } from '../../lib/dates/streak';
import { SpotlightBox } from '../../components/ui/SpotlightBox';
import { 
  Flame, 
  Target, 
  Clock, 
  Activity, 
  Play, 
  ArrowRight, 
  Calendar,
  Sparkles,
  BarChart2
} from 'lucide-react';

interface DashboardViewProps {
  data: StoredAppDataV1;
  onLaunchExercise: (exerciseId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onLaunchExercise,
  onNavigateToTab
}) => {
  const todayStr = getTodayDateString();
  const todaySessions = data.sessions.filter(s => s.dateString === todayStr);
  const targetSessions = data.preferences.dailyTargetSessions || 3;
  const progressPercent = Math.min(100, Math.round((todaySessions.length / targetSessions) * 100));

  const totalSessions = data.sessions.length;
  const totalMinutes = Math.round(data.sessions.reduce((acc, cur) => acc + cur.durationSeconds, 0) / 60);

  const overallAccuracy = totalSessions > 0
    ? Math.round(data.sessions.reduce((acc, cur) => acc + cur.accuracy, 0) / totalSessions)
    : 0;

  // Determine recommendation
  const unplayed = EXERCISE_CATALOG.filter(ex => !data.exerciseStats[ex.id]);
  let recommended = unplayed.length > 0 ? unplayed[0] : EXERCISE_CATALOG[0];

  if (unplayed.length === 0 && totalSessions > 0) {
    const lowest = Object.values(data.exerciseStats).sort((a, b) => a.averageAccuracy - b.averageAccuracy)[0];
    if (lowest) {
      const match = EXERCISE_CATALOG.find(e => e.id === lowest.exerciseId);
      if (match) recommended = match;
    }
  }

  const currentDateFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentDateFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
            Cognitive Training Dashboard
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Precision working memory, attention, and immediate recall conditioning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onLaunchExercise(recommended.id)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Training: {recommended.name}</span>
          </button>
        </div>
      </div>

      {/* Luxury KPI Stat Boxes with Spotlight cursor illumination */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Target */}
        <SpotlightBox className="p-5">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-3 font-mono">
            <span>Daily Goal</span>
            <Target className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-black dark:text-white">
              {todaySessions.length} / {targetSessions}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">sessions</span>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-1.5 rounded-full mt-3 overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50">
            <div
              className="bg-black dark:bg-white h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </SpotlightBox>

        {/* Training Streak */}
        <SpotlightBox className="p-5">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-3 font-mono">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-black dark:text-white">
              {data.streak.currentStreak}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">days</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-mono">
            Longest record: {data.streak.longestStreak} days
          </p>
        </SpotlightBox>

        {/* Total Training Time */}
        <SpotlightBox className="p-5">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-3 font-mono">
            <span>Total Time</span>
            <Clock className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-black dark:text-white">
              {totalMinutes}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">min</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-mono">
            Across {totalSessions} total sessions
          </p>
        </SpotlightBox>

        {/* Overall Accuracy */}
        <SpotlightBox className="p-5">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-3 font-mono">
            <span>Mean Accuracy</span>
            <Activity className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-black dark:text-white">
              {totalSessions > 0 ? `${overallAccuracy}%` : '—'}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">accuracy</span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-mono">
            {totalSessions > 0 ? 'Aggregated local recall' : 'Awaiting first test'}
          </p>
        </SpotlightBox>
      </div>

      {/* Recommended Next Training Module Banner */}
      <SpotlightBox className="p-6 sm:p-8 bg-neutral-900 text-white dark:bg-neutral-950 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span>Recommended Next Module</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mb-1.5 font-sans">
              {recommended.name}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {recommended.description} Calibrates {recommended.cognitiveSkill.toLowerCase()}.
            </p>
          </div>

          <button
            onClick={() => onLaunchExercise(recommended.id)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-black bg-white hover:bg-neutral-200 shadow-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            <span>Launch Exercise</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </SpotlightBox>

      {/* Exercise Performance Matrix + Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Matrix (2 cols) */}
        <SpotlightBox className="lg:col-span-2 p-6" interactive={false}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-850">
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white">
                Exercise Performance Matrix
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Personal records and status across core cognitive domains
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('library')}
              className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Explore 735 Levels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {EXERCISE_CATALOG.slice(0, 6).map(ex => {
              const stat = data.exerciseStats[ex.id];
              return (
                <div key={ex.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-black dark:text-white truncate">
                        {ex.name}
                      </h4>
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
                        · {ex.categoryLabel}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {ex.cognitiveSkill}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right font-mono">
                    {stat ? (
                      <div>
                        <div className="text-xs font-semibold text-black dark:text-white tabular-nums">
                          Best: {stat.bestScore} pts
                        </div>
                        <div className="text-[11px] text-neutral-500 tabular-nums">
                          {stat.averageAccuracy}% accuracy ({stat.totalSessions} sessions)
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 dark:text-neutral-600">Not trained yet</span>
                    )}

                    <button
                      onClick={() => onLaunchExercise(ex.id)}
                      className="p-1.5 text-black dark:text-white bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
                      title={`Train ${ex.name}`}
                      aria-label={`Train ${ex.name}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </SpotlightBox>

        {/* Recent Session Activity List (1 col) */}
        <SpotlightBox className="p-6 flex flex-col justify-between" interactive={false}>
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-850">
              <div>
                <h3 className="text-sm font-semibold text-black dark:text-white">
                  Recent Sessions
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Latest training telemetry
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('history')}
                className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                History
              </button>
            </div>

            {data.sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="p-3 bg-neutral-100 dark:bg-neutral-900 text-neutral-400 rounded-full mb-3">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  No Sessions Logged
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mb-4">
                  Complete your first cognitive trial to build your memory profile.
                </p>
                <button
                  onClick={() => onLaunchExercise(EXERCISE_CATALOG[0].id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-black dark:bg-white dark:text-black rounded-lg"
                >
                  Start First Session
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
                {data.sessions.slice(0, 5).map(s => (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-black dark:text-white">
                        {s.exerciseName}
                      </span>
                      <span className="font-mono text-black dark:text-white font-semibold">
                        {s.accuracy}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                      <span>{formatDateLabel(s.timestamp)} · {formatTimeLabel(s.timestamp)}</span>
                      <span>{s.durationSeconds}s</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SpotlightBox>
      </div>
    </div>
  );
};
