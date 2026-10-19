import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DifficultyLevel } from '../../../types/exercise';
import { scoreNBack, NBackTrial } from '../../../lib/scoring/scoringEngines';
import { soundManager } from '../../../lib/sound';

interface NBackExerciseProps {
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

export const NBackExercise: React.FC<NBackExerciseProps> = ({
  difficulty,
  soundEnabled,
  soundVolume,
  onFinish
}) => {
  // N determines back-step: beginner = 1-back, intermediate = 2-back, advanced = 3-back
  const n = difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3;

  const totalStimuliCount = 20 + n; // e.g. 20 evaluable trials
  const stimuliSet = ['A', 'B', 'C', 'D', 'E', 'H', 'K', 'M', 'R', 'T', 'X'];

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [stream, setStream] = useState<string[]>([]);
  const [userRespondedThisTrial, setUserRespondedThisTrial] = useState<boolean>(false);
  const [phase, setPhase] = useState<'running' | 'completed'>('running');

  const trialsRef = useRef<NBackTrial[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const stimulusOnsetRef = useRef<number>(0);
  const hasRespondedRef = useRef<boolean>(false);

  // Pre-generate stream with ~30% match rate
  useEffect(() => {
    const generated: string[] = [];
    for (let i = 0; i < totalStimuliCount; i++) {
      if (i >= n && Math.random() < 0.35) {
        // Force match
        generated.push(generated[i - n]);
      } else {
        // Random symbol (ensure non-match if forced)
        let s: string;
        do {
          s = stimuliSet[Math.floor(Math.random() * stimuliSet.length)];
        } while (i >= n && s === generated[i - n]);
        generated.push(s);
      }
    }
    setStream(generated);
    setCurrentIndex(0);
    stimulusOnsetRef.current = Date.now();
  }, [n, totalStimuliCount]);

  // Main stimulus pacing loop
  useEffect(() => {
    if (phase !== 'running' || stream.length === 0 || currentIndex < 0) return;

    if (currentIndex >= stream.length) {
      // Finished all stimuli
      setPhase('completed');
      return;
    }

    stimulusOnsetRef.current = Date.now();
    hasRespondedRef.current = false;
    setUserRespondedThisTrial(false);
    if (soundEnabled) soundManager.playTick(soundVolume * 0.4);

    const timer = setTimeout(() => {
      // Record trial outcome if index >= n
      if (currentIndex >= n) {
        const isMatch = stream[currentIndex] === stream[currentIndex - n];
        trialsRef.current.push({
          stimulus: stream[currentIndex],
          isMatch,
          userRespondedMatch: hasRespondedRef.current,
          reactionTimeMs: undefined // will be populated if responded
        });
      }

      setCurrentIndex(prev => prev + 1);
    }, 2000); // 2.0s per stimulus window

    return () => clearTimeout(timer);
  }, [currentIndex, stream, phase, n, soundEnabled, soundVolume]);

  const handleMatchResponse = useCallback(() => {
    if (hasRespondedRef.current || currentIndex < n || phase !== 'running') return;

    const rt = Date.now() - stimulusOnsetRef.current;
    hasRespondedRef.current = true;
    setUserRespondedThisTrial(true);

    const isMatch = stream[currentIndex] === stream[currentIndex - n];
    if (isMatch) {
      if (soundEnabled) soundManager.playCorrect(soundVolume);
    } else {
      if (soundEnabled) soundManager.playIncorrect(soundVolume);
    }

    // Update trial record
    const existingIndex = trialsRef.current.length;
    trialsRef.current[existingIndex] = {
      stimulus: stream[currentIndex],
      isMatch,
      userRespondedMatch: true,
      reactionTimeMs: rt
    };
  }, [currentIndex, n, phase, stream, soundEnabled, soundVolume]);

  // Keyboard shortcut listener (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleMatchResponse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMatchResponse]);

  // When completed, wrap up results
  useEffect(() => {
    if (phase === 'completed') {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const scored = scoreNBack(trialsRef.current, 0); // already sliced

      const correctCount = scored.hits + scored.correctRejections;
      const incorrectCount = scored.misses + scored.falseAlarms;
      const rawScore = Math.max(0, scored.hits * 100 + scored.correctRejections * 40 - scored.falseAlarms * 50);

      onFinish({
        rawScore,
        accuracy: scored.accuracy,
        correctCount,
        incorrectCount,
        totalTrials: scored.totalValidTrials,
        durationSeconds,
        averageReactionTimeMs: scored.averageReactionTimeMs,
        exerciseMetrics: {
          nBackLevel: `${n}-Back`,
          hits: scored.hits,
          misses: scored.misses,
          falseAlarms: scored.falseAlarms,
          correctRejections: scored.correctRejections,
          dPrimeSensitivity: scored.dPrime
        },
        trials: trialsRef.current
      });
    }
  }, [phase, n, onFinish]);

  const currentSymbol = stream[currentIndex] || '';
  const isPastWarmup = currentIndex >= n;

  return (
    <div className="flex flex-col items-center justify-center max-w-md w-full p-4 animate-in fade-in duration-300">
      {/* HUD status */}
      <div className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-mono">
        <span>Mode: <strong className="text-black dark:text-white font-semibold">{n}-Back</strong></span>
        <span>
          {currentIndex < n 
            ? `Initializing (Item ${currentIndex + 1}/${n})` 
            : `Trial ${currentIndex - n + 1} / ${totalStimuliCount - n}`}
        </span>
      </div>

      <div className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center shadow-sm">
        <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-6 text-center">
          {currentIndex < n ? `Memorize initial items (No match possible yet)` : `Does this match ${n} items ago?`}
        </span>

        {/* Big visual stimulus letter */}
        <div className="w-40 h-40 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-8 shadow-inner">
          <span className="text-7xl font-mono font-bold text-black dark:text-white transition-transform scale-100">
            {currentSymbol}
          </span>
        </div>

        {/* Action Match Button */}
        <button
          onClick={handleMatchResponse}
          disabled={!isPastWarmup || userRespondedThisTrial}
          className={`w-full max-w-xs py-4 px-6 rounded-xl font-semibold text-sm transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
            userRespondedThisTrial
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
              : !isPastWarmup
              ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600 border border-neutral-200 dark:border-neutral-800 cursor-not-allowed'
              : 'bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-md'
          }`}
        >
          <span>{userRespondedThisTrial ? 'Match Confirmed' : 'Match Detected'}</span>
          <span className="text-[10px] opacity-70 font-mono">Or press Spacebar</span>
        </button>

        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono mt-4 text-center">
          Withhold response when the symbol does not match.
        </p>
      </div>
    </div>
  );
};
