import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DifficultyLevel } from '../../../types/exercise';
import { scoreSequenceMemory } from '../../../lib/scoring/scoringEngines';
import { soundManager } from '../../../lib/sound';

interface SequenceMemoryExerciseProps {
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

export const SequenceMemoryExercise: React.FC<SequenceMemoryExerciseProps> = ({
  difficulty,
  soundEnabled,
  soundVolume,
  onFinish
}) => {
  const initialLength = difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 4 : 5;
  const [level, setLevel] = useState<number>(initialLength);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userClicks, setUserClicks] = useState<number[]>([]);
  const [phase, setPhase] = useState<'showing' | 'input' | 'level-success' | 'failed'>('showing');
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [lives, setLives] = useState<number>(3);

  const startTimeRef = useRef<number>(Date.now());
  const trialsHistoryRef = useRef<any[]>([]);

  // 3x3 Grid = 9 tiles
  const totalTiles = 9;

  const playTileTone = (tileIndex: number) => {
    if (!soundEnabled) return;
    const notes = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33];
    soundManager.playTone(notes[tileIndex] || 440, 0.18, 'sine', soundVolume * 0.7);
  };

  const startNextSequence = useCallback((targetLen: number) => {
    const nextSeq: number[] = [];
    for (let i = 0; i < targetLen; i++) {
      let nextTile: number;
      do {
        nextTile = Math.floor(Math.random() * totalTiles);
      } while (i > 0 && nextTile === nextSeq[i - 1]);
      nextSeq.push(nextTile);
    }

    setSequence(nextSeq);
    setUserClicks([]);
    setPhase('showing');
  }, [totalTiles]);

  useEffect(() => {
    startNextSequence(level);
  }, []);

  // Show sequence with animation
  useEffect(() => {
    if (phase !== 'showing' || sequence.length === 0) return;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < sequence.length) {
        const tile = sequence[idx];
        setActiveTile(tile);
        playTileTone(tile);

        setTimeout(() => {
          setActiveTile(null);
        }, 400);

        idx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setPhase('input');
        }, 300);
      }
    }, 650);

    return () => clearInterval(interval);
  }, [phase, sequence]);

  const handleTileClick = (tileIndex: number) => {
    if (phase !== 'input') return;

    playTileTone(tileIndex);
    const nextClicks = [...userClicks, tileIndex];
    setUserClicks(nextClicks);

    const stepIndex = nextClicks.length - 1;
    if (tileIndex !== sequence[stepIndex]) {
      // Incorrect tile clicked!
      if (soundEnabled) soundManager.playIncorrect(soundVolume);

      const trialRecord = {
        trialNumber: trialsHistoryRef.current.length + 1,
        stimulus: sequence,
        userResponse: nextClicks,
        correctResponse: sequence,
        isCorrect: false,
        details: { level }
      };
      trialsHistoryRef.current.push(trialRecord);

      const remainingLives = lives - 1;
      setLives(remainingLives);

      if (remainingLives <= 0) {
        setPhase('failed');
      } else {
        // Retry current level
        setPhase('failed');
        setTimeout(() => {
          startNextSequence(level);
        }, 1200);
      }
      return;
    }

    // Correct click so far
    if (nextClicks.length === sequence.length) {
      // Completed full sequence!
      if (soundEnabled) soundManager.playCorrect(soundVolume);

      const trialRecord = {
        trialNumber: trialsHistoryRef.current.length + 1,
        stimulus: sequence,
        userResponse: nextClicks,
        correctResponse: sequence,
        isCorrect: true,
        details: { level }
      };
      trialsHistoryRef.current.push(trialRecord);

      setPhase('level-success');
      setTimeout(() => {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        startNextSequence(nextLevel);
      }, 1000);
    }
  };

  const handleCompleteSession = () => {
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const correctCount = trialsHistoryRef.current.filter(t => t.isCorrect).length;
    const totalTrials = trialsHistoryRef.current.length;
    const incorrectCount = totalTrials - correctCount;
    const accuracy = totalTrials > 0 ? Math.round((correctCount / totalTrials) * 100) : 0;
    const maxLevel = Math.max(...trialsHistoryRef.current.filter(t => t.isCorrect).map(t => t.details?.level || 0), level - 1);
    const rawScore = maxLevel * 150 + correctCount * 50;

    onFinish({
      rawScore,
      accuracy,
      correctCount,
      incorrectCount,
      totalTrials: Math.max(1, totalTrials),
      durationSeconds,
      exerciseMetrics: {
        difficulty,
        maxSpanReached: Math.max(initialLength, maxLevel),
        livesRemaining: lives
      },
      trials: trialsHistoryRef.current
    });
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-md w-full p-4 animate-in fade-in duration-300">
      {/* HUD Bar */}
      <div className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-mono">
        <span>Level: <strong className="text-black dark:text-white font-semibold">{level}</strong> tiles</span>
        <div className="flex items-center gap-1">
          <span>Lives:</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${i < lives ? 'bg-black dark:bg-white' : 'border border-neutral-300 dark:border-neutral-800'}`}
            />
          ))}
        </div>
      </div>

      {/* Grid container */}
      <div className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center shadow-sm">
        <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-6">
          {phase === 'showing' ? 'Observe the Pattern' : phase === 'input' ? `Reproduce (${userClicks.length}/${sequence.length})` : phase === 'level-success' ? 'Pattern Matched!' : 'Missed Step'}
        </span>

        {/* 3x3 Tile Grid */}
        <div className="grid grid-cols-3 gap-3 w-64 h-64 sm:w-72 sm:h-72">
          {Array.from({ length: 9 }).map((_, idx) => {
            const isFlashing = activeTile === idx;
            return (
              <button
                key={idx}
                disabled={phase !== 'input'}
                onClick={() => handleTileClick(idx)}
                className={`w-full h-full rounded-xl border transition-all duration-150 transform active:scale-95 ${
                  isFlashing
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xl scale-102'
                    : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700'
                }`}
                aria-label={`Tile ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Action button if failed / game over */}
        {phase === 'failed' && lives <= 0 && (
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">All lives exhausted. Final sequence span recorded.</p>
            <button
              onClick={handleCompleteSession}
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold rounded-lg transition-colors"
            >
              Complete Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
