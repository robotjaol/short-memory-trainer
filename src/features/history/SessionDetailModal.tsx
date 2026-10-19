import React from 'react';
import { SessionResult } from '../../types/exercise';
import { formatDateLabel, formatTimeLabel } from '../../lib/dates/streak';
import { X, Trash2 } from 'lucide-react';

interface SessionDetailModalProps {
  session: SessionResult | null;
  onClose: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  onClose,
  onDeleteSession
}) => {
  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              {session.category} · {session.difficulty}
            </span>
            <h2 className="text-lg font-bold text-black dark:text-white">
              {session.exerciseName}
            </h2>
            <span className="text-xs text-neutral-500 font-mono">
              {formatDateLabel(session.timestamp)} at {formatTimeLabel(session.timestamp)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center font-mono">
              <span className="text-[11px] text-neutral-500 block">Accuracy</span>
              <span className="text-xl font-bold text-black dark:text-white tabular-nums">
                {session.accuracy}%
              </span>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center font-mono">
              <span className="text-[11px] text-neutral-500 block">Score</span>
              <span className="text-xl font-bold text-black dark:text-white tabular-nums">
                {session.rawScore}
              </span>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center font-mono">
              <span className="text-[11px] text-neutral-500 block">Duration</span>
              <span className="text-xl font-bold text-black dark:text-white tabular-nums">
                {session.durationSeconds}s
              </span>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center font-mono">
              <span className="text-[11px] text-neutral-500 block">Trials</span>
              <span className="text-xl font-bold text-black dark:text-white tabular-nums">
                {session.correctCount} / {session.totalTrials}
              </span>
            </div>
          </div>

          {/* Exercise-specific metrics */}
          {session.exerciseMetrics && Object.keys(session.exerciseMetrics).length > 0 && (
            <div>
              <h3 className="text-xs font-mono uppercase text-neutral-500 mb-2">
                Trial Diagnostics & Telemetry
              </h3>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {Object.entries(session.exerciseMetrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-neutral-200 dark:border-neutral-850 py-1">
                    <span className="text-neutral-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="text-black dark:text-white font-semibold">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual trial logs */}
          {session.trials && session.trials.length > 0 && (
            <div>
              <h3 className="text-xs font-mono uppercase text-neutral-500 mb-2">
                Recorded Trials ({session.trials.length})
              </h3>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {session.trials.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${t.isCorrect ? 'bg-black dark:bg-white' : 'border border-neutral-400 bg-transparent'}`} />
                      <span className="text-neutral-600 dark:text-neutral-400">Trial #{t.trialNumber || idx + 1}</span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      {t.reactionTimeMs ? (
                        <span className="text-neutral-400">{t.reactionTimeMs} ms</span>
                      ) : null}
                      <span className="font-semibold text-black dark:text-white">
                        {t.isCorrect ? 'Correct' : 'Miss'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <button
            onClick={() => {
              if (window.confirm('Delete this session record from local history?')) {
                onDeleteSession(session.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Entry</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-black dark:bg-white dark:text-black rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
