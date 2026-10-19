import React, { useState, useMemo } from 'react';
import { SessionResult } from '../../types/exercise';
import { formatDateLabel, formatTimeLabel } from '../../lib/dates/streak';
import { SessionDetailModal } from './SessionDetailModal';
import { SpotlightBox } from '../../components/ui/SpotlightBox';
import { Search, Filter, Trash2, ChevronRight } from 'lucide-react';

interface HistoryViewProps {
  sessions: SessionResult[];
  onDeleteSession: (sessionId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onDeleteSession,
  onNavigateToTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExerciseFilter, setSelectedExerciseFilter] = useState<string>('all');
  const [activeModalSession, setActiveModalSession] = useState<SessionResult | null>(null);

  const uniqueExerciseNames = useMemo(() => {
    return Array.from(new Set(sessions.map(s => s.exerciseName))).sort();
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchFilter = selectedExerciseFilter === 'all' || s.exerciseName === selectedExerciseFilter;
      const matchSearch =
        s.exerciseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.difficulty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.dateString.includes(searchTerm);
      return matchFilter && matchSearch;
    });
  }, [sessions, searchTerm, selectedExerciseFilter]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
            Training History
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Complete archive of all recorded cognitive tests, scores, and trial results.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
          Total Logged: <strong className="text-black dark:text-white tabular-nums">{sessions.length}</strong> sessions
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by exercise or date..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-black dark:text-white placeholder-neutral-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
          <select
            value={selectedExerciseFilter}
            onChange={e => setSelectedExerciseFilter(e.target.value)}
            aria-label="Filter by exercise"
            className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs text-black dark:text-white focus:outline-hidden"
          >
            <option value="all">All Exercises</option>
            {uniqueExerciseNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Table */}
      {sessions.length === 0 ? (
        <SpotlightBox className="text-center py-16 p-8" interactive={false}>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            No training sessions recorded yet.
          </p>
          <button
            onClick={() => onNavigateToTab('library')}
            className="px-4 py-2 text-xs font-semibold text-white bg-black dark:bg-white dark:text-black rounded-lg"
          >
            Start Your First Exercise
          </button>
        </SpotlightBox>
      ) : filteredSessions.length === 0 ? (
        <SpotlightBox className="text-center py-12 p-6" interactive={false}>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            No sessions match the selected filter or search term.
          </p>
        </SpotlightBox>
      ) : (
        <SpotlightBox className="overflow-hidden p-0" interactive={false}>
          {/* Mobile Card List View (sm:hidden) */}
          <div className="sm:hidden divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredSessions.map(session => (
              <div
                key={session.id}
                onClick={() => setActiveModalSession(session)}
                className="p-4 hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60 active:bg-neutral-200/50 dark:active:bg-neutral-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-sans font-semibold text-sm text-black dark:text-white">
                      {session.exerciseName}
                    </h4>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                      {session.category} • {session.difficulty}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-black text-white dark:bg-white dark:text-black">
                      {session.accuracy}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                  <div className="flex items-center gap-3">
                    <span>Score: <strong className="text-black dark:text-white">{session.rawScore}</strong></span>
                    <span>•</span>
                    <span>{session.durationSeconds}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400">{formatDateLabel(session.timestamp)}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table View (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Exercise</th>
                  <th className="py-3.5 px-4 font-medium">Difficulty</th>
                  <th className="py-3.5 px-4 font-medium text-right">Accuracy</th>
                  <th className="py-3.5 px-4 font-medium text-right">Score</th>
                  <th className="py-3.5 px-4 font-medium text-right">Duration</th>
                  <th className="py-3.5 px-4 font-medium text-right">Date & Time</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900 font-mono">
                {filteredSessions.map(session => (
                  <tr
                    key={session.id}
                    onClick={() => setActiveModalSession(session)}
                    className="hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-sans font-semibold text-black dark:text-white">
                      <div>{session.exerciseName}</div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                        {session.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-neutral-600 dark:text-neutral-400">
                      {session.difficulty}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums">
                      <span className="font-semibold text-black dark:text-white">
                        {session.accuracy}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-black dark:text-white tabular-nums">
                      {session.rawScore}
                    </td>
                    <td className="py-3.5 px-4 text-right text-neutral-500 tabular-nums">
                      {session.durationSeconds}s
                    </td>
                    <td className="py-3.5 px-4 text-right text-neutral-500 tabular-nums">
                      <div>{formatDateLabel(session.timestamp)}</div>
                      <div className="text-[10px] text-neutral-400">{formatTimeLabel(session.timestamp)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setActiveModalSession(session)}
                          className="p-1 text-neutral-400 hover:text-black dark:hover:text-white rounded"
                          title="View Details"
                          aria-label="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this session record?')) {
                              onDeleteSession(session.id);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-black dark:hover:text-white rounded transition-colors"
                          title="Delete Session"
                          aria-label="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SpotlightBox>
      )}

      {/* Drilldown detail modal */}
      <SessionDetailModal
        session={activeModalSession}
        onClose={() => setActiveModalSession(null)}
        onDeleteSession={onDeleteSession}
      />
    </div>
  );
};
