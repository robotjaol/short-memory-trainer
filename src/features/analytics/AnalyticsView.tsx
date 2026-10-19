import React, { useMemo } from 'react';
import { SessionResult, ExerciseStats } from '../../types/exercise';
import { EXERCISE_CATALOG } from '../../data/exerciseCatalog';
import { formatDateLabel } from '../../lib/dates/streak';
import { SpotlightBox } from '../../components/ui/SpotlightBox';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, Clock } from 'lucide-react';

interface AnalyticsViewProps {
  sessions: SessionResult[];
  exerciseStats: Record<string, ExerciseStats>;
  onNavigateToTab: (tab: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  sessions,
  exerciseStats,
  onNavigateToTab
}) => {
  const chronological = useMemo(() => {
    return [...sessions].reverse();
  }, [sessions]);

  const accuracyTrendData = useMemo(() => {
    return chronological.map((s, idx) => ({
      index: idx + 1,
      date: formatDateLabel(s.timestamp),
      exercise: s.exerciseName,
      accuracy: s.accuracy,
      score: s.rawScore
    }));
  }, [chronological]);

  const exerciseComparisonData = useMemo(() => {
    return EXERCISE_CATALOG.map(ex => {
      const stat = exerciseStats[ex.id];
      return {
        name: ex.name.split(' ')[0],
        fullName: ex.name,
        sessions: stat ? stat.totalSessions : 0,
        bestScore: stat ? stat.bestScore : 0,
        avgAccuracy: stat ? stat.averageAccuracy : 0
      };
    }).filter(d => d.sessions > 0);
  }, [exerciseStats]);

  const rtData = useMemo(() => {
    return chronological
      .filter(s => s.averageReactionTimeMs && s.averageReactionTimeMs > 0)
      .slice(-10)
      .map(s => ({
        exercise: s.exerciseName,
        date: formatDateLabel(s.timestamp),
        rt: s.averageReactionTimeMs
      }));
  }, [chronological]);

  if (sessions.length === 0) {
    return (
      <SpotlightBox className="max-w-2xl mx-auto py-16 p-8 text-center my-8" interactive={false}>
        <div className="p-4 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-black dark:text-white">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-black dark:text-white mb-2">
          Analytics Awaiting Training Data
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
          Complete exercises in the library to generate longitudinal cognitive recall metrics, reaction time trends, and domain performance breakdown.
        </p>
        <button
          onClick={() => onNavigateToTab('library')}
          className="px-5 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Explore Training Library
        </button>
      </SpotlightBox>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Title */}
      <div className="pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
          Performance Analytics
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Quantitative telemetry and recall trajectories derived from your local session trials.
        </p>
      </div>

      {/* Accuracy Trend Chart (Monochrome Luxury) */}
      <SpotlightBox className="p-6 sm:p-8" interactive={false}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-black dark:text-white" />
              <span>Recall Accuracy Progression (%)</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Session-by-session recall accuracy across all completed exercises
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={accuracyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#525252" opacity={0.2} vertical={false} />
              <XAxis 
                dataKey="index" 
                tick={{ fontSize: 11, fill: '#737373' }} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 11, fill: '#737373' }} 
                tickLine={false} 
                axisLine={false} 
                unit="%" 
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-black dark:bg-white text-white dark:text-black border border-neutral-800 dark:border-neutral-200 p-3 rounded-lg text-xs font-mono shadow-2xl">
                        <div className="font-semibold mb-1">{d.exercise}</div>
                        <div>Accuracy: {d.accuracy}%</div>
                        <div className="opacity-80">Score: {d.score} pts</div>
                        <div className="opacity-60 text-[10px] mt-1">{d.date}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="currentColor"
                strokeWidth={2}
                className="text-black dark:text-white"
                dot={{ r: 3, fill: 'currentColor' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SpotlightBox>

      {/* Grid: Accuracy by Exercise & Reaction Time Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Accuracy by Exercise */}
        <SpotlightBox className="p-6" interactive={false}>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-black dark:text-white">
              Mean Accuracy by Cognitive Module
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Benchmark comparison across trained exercises
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exerciseComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#525252" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#737373' }} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 11, fill: '#737373' }} 
                  tickLine={false} 
                  axisLine={false} 
                  unit="%" 
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-black dark:bg-white text-white dark:text-black border border-neutral-800 dark:border-neutral-200 p-3 rounded-lg text-xs font-mono shadow-2xl">
                          <div className="font-semibold mb-1">{d.fullName}</div>
                          <div>Avg Accuracy: {d.avgAccuracy}%</div>
                          <div className="opacity-80">Best Score: {d.bestScore} pts</div>
                          <div className="opacity-80">Sessions: {d.sessions}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgAccuracy" fill="currentColor" className="text-neutral-900 dark:text-neutral-100" radius={[4, 4, 0, 0]}>
                  {exerciseComparisonData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="currentColor" className="text-black dark:text-white" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightBox>

        {/* Reaction Time Trend */}
        <SpotlightBox className="p-6" interactive={false}>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-black dark:text-white">
              Processing & Reaction Speed (ms)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Reaction latencies on timed target detection and working memory tasks
            </p>
          </div>

          {rtData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <Clock className="w-6 h-6 mb-2 opacity-50 text-black dark:text-white" />
              <p className="text-xs text-neutral-500">
                Complete N-Back or Attention & Target Detection to unlock reaction latency metrics.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rtData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#525252" opacity={0.2} vertical={false} />
                  <XAxis 
                    dataKey="exercise" 
                    tick={{ fontSize: 10, fill: '#737373' }} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#737373' }} 
                    tickLine={false} 
                    axisLine={false} 
                    unit="ms" 
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-black dark:bg-white text-white dark:text-black border border-neutral-800 dark:border-neutral-200 p-3 rounded-lg text-xs font-mono shadow-2xl">
                            <div className="font-semibold mb-1">{d.exercise}</div>
                            <div>Reaction Time: {d.rt} ms</div>
                            <div className="opacity-60 text-[10px] mt-1">{d.date}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="rt" fill="currentColor" className="text-black dark:text-white" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SpotlightBox>
      </div>
    </div>
  );
};
