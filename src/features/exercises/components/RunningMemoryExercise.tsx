import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DifficultyLevel } from '../../../types/exercise';
import { scoreRunningMemory } from '../../../lib/scoring/scoringEngines';
import { soundManager } from '../../../lib/sound';
import { ArrowRight, Delete } from 'lucide-react';

interface RunningMemoryExerciseProps {
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

export const RunningMemoryExercise: React.FC<RunningMemoryExerciseProps> = ({
  difficulty,
  soundEnabled,
  soundVolume,
  onFinish
}) => {
  const windowN = difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 4 : 5;
  const totalTrials = 4;
  const [currentTrial, setCurrentTrial] = useState(1);

  const [stream, setStream] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [phase, setPhase] = useState<'streaming' | 'recall' | 'feedback'>('streaming');
  const [userInputs, setUserInputs] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<any>(null);

  const startTimeRef = useRef<number>(Date.now());
  const trialStartTimeRef = useRef<number>(Date.now());
  const trialsHistoryRef = useRef<any[]>([]);

  // Generate randomized stream with length between 7 and 13 items
  const startTrial = useCallback(() => {
    const streamLength = Math.floor(Math.random() * 6) + 8; // 8 to 13
    const generated: number[] = [];
    for (let i = 0; i < streamLength; i++) {
      generated.push(Math.floor(Math.random() * 9) + 1); // 1-9
    }

    setStream(generated);
    setUserInputs([]);
    setFeedback(null);
    setCurrentIndex(0);
    setPhase('streaming');
  }, []);

  useEffect(() => {
    startTrial();
  }, []);

  // Stream pacing
  useEffect(() => {
    if (phase !== 'streaming' || stream.length === 0) return;

    if (currentIndex >= 0 && currentIndex < stream.length) {
      if (soundEnabled) soundManager.playTick(soundVolume * 0.4);

      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 900);
      return () => clearTimeout(timer);
    } else if (currentIndex >= stream.length) {
      // Stream concluded unexpectedly
      const pause = setTimeout(() => {
        setPhase('recall');
        trialStartTimeRef.current = Date.now();
        if (soundEnabled) soundManager.playTone(660, 0.1, 'sine', soundVolume * 0.5);
      }, 300);
      return () => clearTimeout(pause);
    }
  }, [phase, currentIndex, stream, soundEnabled, soundVolume]);

  const addInput = (num: number) => {
    if (phase !== 'recall' || userInputs.length >= windowN) return;
    setUserInputs(prev => [...prev, num]);
    if (soundEnabled) soundManager.playClick(soundVolume * 0.4);
  };

  const removeInput = () => {
    if (phase !== 'recall') return;
    setUserInputs(prev => prev.slice(0, -1));
    if (soundEnabled) soundManager.playClick(soundVolume * 0.4);
  };

  const handleSubmit = useCallback(() => {
    if (phase !== 'recall') return;

    const rt = Date.now() - trialStartTimeRef.current;
    const scored = scoreRunningMemory(stream, windowN, userInputs);

    if (scored.isExact) {
      if (soundEnabled) soundManager.playCorrect(soundVolume);
    } else {
      if (soundEnabled) soundManager.playIncorrect(soundVolume);
    }

    const trialRecord = {
      trialNumber: currentTrial,
      stimulus: stream,
      userResponse: userInputs,
      correctResponse: scored.targetWindow,
      isCorrect: scored.isExact,
      reactionTimeMs: rt,
      details: scored
    };
    trialsHistoryRef.current.push(trialRecord);

    setFeedback(scored);
    setPhase('feedback');
  }, [phase, stream, windowN, userInputs, currentTrial, soundEnabled, soundVolume]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'recall') return;
      if (e.key >= '0' && e.key <= '9') {
        const val = parseInt(e.key, 10);
        if (val !== 0) addInput(val);
      } else if (e.key === 'Backspace') {
        removeInput();
      } else if (e.key === 'Enter') {
        if (userInputs.length === windowN) handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, userInputs, windowN, handleSubmit]);

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
          windowLength: `Last ${windowN} items`,
          averageAccuracy: `${avgAccuracy}%`,
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
    <div className="flex flex-col items-center justify-center max-w-md w-full p-4 animate-in fade-in duration-300">
      <div className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-mono">
        <span>Trial {currentTrial} of {totalTrials}</span>
        <span>Goal: Retain <strong>Last {windowN}</strong> Items</span>
      </div>

      <div className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center shadow-sm">
        {phase === 'streaming' && (
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-6">
              Stream Running (Length Unknown)
            </span>
            <div className="w-36 h-36 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-6 shadow-inner">
              <span className="text-7xl font-mono font-bold text-black dark:text-white">
                {currentIndex < stream.length ? stream[currentIndex] : ''}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Keep updating your mental buffer of the last {windowN} digits</p>
          </div>
        )}

        {phase === 'recall' && (
          <div className="w-full flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-2">
              Enter the LAST {windowN} digits in order
            </span>

            {/* Input boxes */}
            <div className="flex justify-center gap-2 mb-6">
              {Array.from({ length: windowN }).map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-14 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg flex items-center justify-center text-2xl font-mono font-bold text-black dark:text-white shadow-inner"
                >
                  {userInputs[i] !== undefined ? userInputs[i] : ''}
                </div>
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => addInput(num)}
                  disabled={userInputs.length >= windowN}
                  className="h-11 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 disabled:opacity-40 border border-neutral-200 dark:border-neutral-800 text-lg font-mono font-medium text-black dark:text-white rounded-lg transition-colors active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={removeInput}
                disabled={userInputs.length === 0}
                className="h-11 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 disabled:opacity-40 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 rounded-lg transition-colors"
                aria-label="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
              <div />
              <button
                onClick={handleSubmit}
                disabled={userInputs.length !== windowN}
                className="h-11 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 disabled:opacity-40 text-white dark:text-black font-semibold rounded-lg transition-colors flex items-center justify-center"
                aria-label="Submit"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {phase === 'feedback' && feedback && (
          <div className="w-full flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-black dark:text-white mb-2">
              {feedback.isExact ? 'Perfect Window Recall' : 'Window Recall Result'}
            </h3>

            <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-lg w-full max-w-xs mb-6 text-xs font-mono space-y-2 border border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between">
                <span className="text-neutral-500">Target last {windowN}:</span>
                <span className="text-black dark:text-white font-semibold">{feedback.targetWindow.join(' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Your response:</span>
                <span className="font-semibold text-black dark:text-white">
                  {userInputs.join(' ')}
                </span>
              </div>
            </div>

            <button
              onClick={handleNextTrial}
              className="px-6 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold rounded-lg transition-colors"
            >
              {currentTrial >= totalTrials ? 'View Session Summary' : 'Next Trial'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
