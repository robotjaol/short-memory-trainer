import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DifficultyLevel } from '../../../types/exercise';
import { scorePatternRecall } from '../../../lib/scoring/scoringEngines';
import { soundManager } from '../../../lib/sound';
import { Check, X, ArrowRight } from 'lucide-react';

interface PatternRecallExerciseProps {
  difficulty: DifficultyLevel;
  soundEnabled: boolean;
  soundVolume: number;
  onFinish: (result: {
    rawScore: number;
    accuracy: number;
    correctCount: number;
    incorrectCount: number;
    totalTrials: number;
    durationSeconds: number;
    averageReactionTimeMs?: number;
    exerciseMetrics: Record<string, any>;
    trials: any[];
  }) => void;
}

export const PatternRecallExercise: React.FC<PatternRecallExerciseProps> = ({
  difficulty,
  soundEnabled,
  soundVolume,
  onFinish
}) => {
  const totalTrials = 4;
  const [currentTrial, setCurrentTrial] = useState(1);

  const gridSize = difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 4 : 5;
  const cellCount = gridSize * gridSize;
  const displayTimeMs = difficulty === 'beginner' ? 2500 : difficulty === 'intermediate' ? 2000 : 1800;

  const [targetGrid, setTargetGrid] = useState<boolean[]>([]);
  const [userGrid, setUserGrid] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<'study' | 'reconstruct' | 'feedback'>('study');
  const [feedback, setFeedback] = useState<any>(null);

  const startTimeRef = useRef<number>(Date.now());
  const trialStartTimeRef = useRef<number>(Date.now());
  const trialsHistoryRef = useRef<any[]>([]);

  const startTrial = useCallback(() => {
    // Generate balanced random pattern (~40% active)
    const grid: boolean[] = [];
    for (let i = 0; i < cellCount; i++) {
      grid.push(Math.random() < 0.42);
    }
    setTargetGrid(grid);
    setUserGrid(new Array(cellCount).fill(false));
    setFeedback(null);
    setPhase('study');

    if (soundEnabled) soundManager.playTone(480, 0.12, 'sine', soundVolume * 0.4);

    const timer = setTimeout(() => {
      setPhase('reconstruct');
      trialStartTimeRef.current = Date.now();
      if (soundEnabled) soundManager.playTick(soundVolume * 0.4);
    }, displayTimeMs);

    return () => clearTimeout(timer);
  }, [cellCount, displayTimeMs, soundEnabled, soundVolume]);

  useEffect(() => {
    startTrial();
  }, []);

  const toggleCell = (index: number) => {
    if (phase !== 'reconstruct') return;
    if (soundEnabled) soundManager.playClick(soundVolume * 0.3);

    setUserGrid(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleSubmitPattern = () => {
    if (phase !== 'reconstruct') return;

    const rt = Date.now() - trialStartTimeRef.current;
    const scored = scorePatternRecall(targetGrid, userGrid);

    if (scored.isExact) {
      if (soundEnabled) soundManager.playCorrect(soundVolume);
    } else {
      if (soundEnabled) soundManager.playIncorrect(soundVolume);
    }

    const trialRecord = {
      trialNumber: currentTrial,
      stimulus: targetGrid,
      userResponse: userGrid,
      correctResponse: targetGrid,
      isCorrect: scored.isExact,
      reactionTimeMs: rt,
      details: scored
    };
    trialsHistoryRef.current.push(trialRecord);

    setFeedback(scored);
    setPhase('feedback');
  };

  const handleNextTrial = () => {
    if (currentTrial >= totalTrials) {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const exactCount = trialsHistoryRef.current.filter(t => t.isCorrect).length;
      const avgAccuracy = Math.round(
        trialsHistoryRef.current.reduce((acc, cur) => acc + cur.details.accuracy, 0) / totalTrials
      );

      onFinish({
        rawScore: avgAccuracy * 10 + exactCount * 50,
        accuracy: avgAccuracy,
        correctCount: exactCount,
        incorrectCount: totalTrials - exactCount,
        totalTrials,
        durationSeconds,
        exerciseMetrics: {
          difficulty,
          gridSize: `${gridSize}x${gridSize}`,
          averageFidelity: `${avgAccuracy}%`,
          exactMatches: exactCount
        },
        trials: trialsHistoryRef.current
      });
      return;
    }

    setCurrentTrial(prev => prev + 1);
    startTrial();
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg w-full p-4 animate-in fade-in duration-300">
      <div className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-mono">
        <span>Trial {currentTrial} of {totalTrials}</span>
        <span>Pattern Grid: {gridSize}x{gridSize}</span>
      </div>

      <div className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center shadow-sm">
        <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-6">
          {phase === 'study' ? 'Memorize Pattern Layout' : phase === 'reconstruct' ? 'Reconstruct the Pattern' : 'Pattern Comparison'}
        </span>

        {/* Grid display */}
        <div
          className="grid gap-2 mb-6"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            width: `${Math.min(300, gridSize * 60)}px`,
            height: `${Math.min(300, gridSize * 60)}px`
          }}
        >
          {Array.from({ length: cellCount }).map((_, idx) => {
            let active = false;
            let feedbackClass = '';

            if (phase === 'study') {
              active = targetGrid[idx];
            } else if (phase === 'reconstruct') {
              active = userGrid[idx];
            } else if (phase === 'feedback') {
              const userActive = userGrid[idx];
              const targetActive = targetGrid[idx];
              if (userActive && targetActive) {
                feedbackClass = 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white';
              } else if (userActive && !targetActive) {
                feedbackClass = 'bg-neutral-300 dark:bg-neutral-800 border-neutral-400';
              } else if (!userActive && targetActive) {
                feedbackClass = 'bg-transparent border-2 border-dashed border-black dark:border-white';
              }
            }

            return (
              <button
                key={idx}
                disabled={phase !== 'reconstruct'}
                onClick={() => toggleCell(idx)}
                className={`w-full h-full rounded-md border transition-all duration-150 ${
                  phase === 'feedback'
                    ? feedbackClass || 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                    : active
                    ? 'bg-black dark:bg-white border-black dark:border-white'
                    : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700'
                }`}
                aria-label={`Cell ${idx + 1}`}
              />
            );
          })}
        </div>

        {phase === 'reconstruct' && (
          <button
            onClick={handleSubmitPattern}
            className="px-6 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <span>Submit Pattern</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {phase === 'feedback' && feedback && (
          <div className="w-full flex flex-col items-center text-center">
            <div className="flex gap-4 text-xs font-mono text-neutral-800 dark:text-neutral-200 mb-4 bg-neutral-100 dark:bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <span>Fidelity: {feedback.accuracy}%</span>
              <span>·</span>
              <span>Matched: {feedback.matchedCells}/{feedback.totalCells}</span>
            </div>

            <button
              onClick={handleNextTrial}
              className="px-6 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold rounded-lg transition-colors"
            >
              {currentTrial >= totalTrials ? 'View Session Summary' : 'Proceed to Next Trial'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
