import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DifficultyLevel } from '../../../types/exercise';
import { scoreAttentionDetection, AttentionTrial } from '../../../lib/scoring/scoringEngines';
import { soundManager } from '../../../lib/sound';

interface AttentionDetectionExerciseProps {
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

export const AttentionDetectionExercise: React.FC<AttentionDetectionExerciseProps> = ({
  difficulty,
  soundEnabled,
  soundVolume,
  onFinish
}) => {
  const totalStimuli = 25;
  const speedMs = difficulty === 'beginner' ? 1200 : difficulty === 'intermediate' ? 950 : 750;

  const targetSymbol = '★';
  const distractors = ['●', '▲', '■', '◆', '✚', '✦'];

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [stream, setStream] = useState<string[]>([]);
  const [userResponded, setUserResponded] = useState<boolean>(false);
  const [phase, setPhase] = useState<'running' | 'completed'>('running');

  const trialsRef = useRef<AttentionTrial[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const onsetTimeRef = useRef<number>(0);
  const hasRespondedRef = useRef<boolean>(false);

  // Pre-generate stream (~25-30% targets)
  useEffect(() => {
    const list: string[] = [];
    for (let i = 0; i < totalStimuli; i++) {
      if (Math.random() < 0.28) {
        list.push(targetSymbol);
      } else {
        list.push(distractors[Math.floor(Math.random() * distractors.length)]);
      }
    }
    setStream(list);
    setCurrentIndex(0);
    onsetTimeRef.current = Date.now();
  }, [totalStimuli]);

  // Main pacing timer
  useEffect(() => {
    if (phase !== 'running' || stream.length === 0 || currentIndex < 0) return;

    if (currentIndex >= stream.length) {
      setPhase('completed');
      return;
    }

    onsetTimeRef.current = Date.now();
    hasRespondedRef.current = false;
    setUserResponded(false);
    if (soundEnabled) soundManager.playTick(soundVolume * 0.25);

    const timer = setTimeout(() => {
      // Record trial data
      const isTarget = stream[currentIndex] === targetSymbol;
      trialsRef.current.push({
        isTarget,
        userResponded: hasRespondedRef.current,
        reactionTimeMs: undefined
      });

      setCurrentIndex(prev => prev + 1);
    }, speedMs);

    return () => clearTimeout(timer);
  }, [currentIndex, stream, phase, speedMs, soundEnabled, soundVolume]);

  const handleTrigger = useCallback(() => {
    if (hasRespondedRef.current || phase !== 'running' || currentIndex >= stream.length) return;

    const rt = Date.now() - onsetTimeRef.current;
    hasRespondedRef.current = true;
    setUserResponded(true);

    const isTarget = stream[currentIndex] === targetSymbol;
    if (isTarget) {
      if (soundEnabled) soundManager.playCorrect(soundVolume * 0.6);
    } else {
      if (soundEnabled) soundManager.playIncorrect(soundVolume * 0.4);
    }

    // Attach reaction time to current trial
    const idx = trialsRef.current.length;
    trialsRef.current[idx] = {
      isTarget,
      userResponded: true,
      reactionTimeMs: rt
    };
  }, [currentIndex, phase, stream, soundEnabled, soundVolume]);

  // Spacebar hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTrigger();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTrigger]);

  // Wrap up
  useEffect(() => {
    if (phase === 'completed') {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const scored = scoreAttentionDetection(trialsRef.current);

      const rawScore = scored.hits * 100 + scored.correctRejections * 30 - scored.falseAlarms * 60;

      onFinish({
        rawScore: Math.max(0, rawScore),
        accuracy: scored.accuracy,
        correctCount: scored.hits + scored.correctRejections,
        incorrectCount: scored.misses + scored.falseAlarms,
        totalTrials: scored.totalTrials,
        durationSeconds,
        averageReactionTimeMs: scored.averageReactionTimeMs,
        exerciseMetrics: {
          difficulty,
          vigilanceRate: `${scored.hits} hits / ${trialsRef.current.filter(t => t.isTarget).length} targets`,
          falseAlarms: scored.falseAlarms,
          averageReactionTime: `${scored.averageReactionTimeMs}ms`
        },
        trials: trialsRef.current
      });
    }
  }, [phase, onFinish, difficulty]);

  const currentSym = stream[currentIndex] || '';

  return (
    <div className="flex flex-col items-center justify-center max-w-md w-full p-4 animate-in fade-in duration-300">
      <div className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-mono">
        <span>Target: <strong className="text-black dark:text-white text-sm font-bold">{targetSymbol}</strong></span>
        <span>Item {Math.min(currentIndex + 1, totalStimuli)} / {totalStimuli}</span>
      </div>

      <div className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center shadow-sm">
        <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-6 text-center">
          Press Spacebar Immediately on Target ({targetSymbol})
        </span>

        {/* Central Display */}
        <div className="w-40 h-40 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-8 shadow-inner">
          <span className={`text-7xl font-bold transition-transform scale-100 ${currentSym === targetSymbol ? 'text-black dark:text-white' : 'text-neutral-400 dark:text-neutral-600'}`}>
            {currentSym}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleTrigger}
          disabled={userResponded || phase !== 'running'}
          className={`w-full max-w-xs py-4 px-6 rounded-xl font-semibold text-sm transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
            userResponded
              ? 'bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white shadow-xs'
              : 'bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-md'
          }`}
        >
          <span>{userResponded ? 'Trigger Recorded' : 'Target Detected!'}</span>
          <span className="text-[10px] opacity-70 font-mono">Or press Spacebar</span>
        </button>

        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono mt-4 text-center">
          Inhibit response for non-target geometric symbols.
        </p>
      </div>
    </div>
  );
};
