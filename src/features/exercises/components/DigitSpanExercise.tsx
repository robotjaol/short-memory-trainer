import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DifficultyLevel } from '../../../types/exercise';
import { scoreDigitSpan } from '../../../lib/scoring/scoringEngines';
import { soundManager } from '../../../lib/sound';
import { Check, X, Delete, ArrowRight } from 'lucide-react';

interface DigitSpanExerciseProps {
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

export const DigitSpanExercise: React.FC<DigitSpanExerciseProps> = ({
  difficulty,
  soundEnabled,
  soundVolume,
  onFinish
}) => {
  const [mode, setMode] = useState<'forward' | 'backward'>('forward');
  const [currentTrial, setCurrentTrial] = useState(1);
  const totalTrials = 5;

  // Determine span length based on difficulty
  const baseSpan = difficulty === 'beginner' ? 4 : difficulty === 'intermediate' ? 6 : difficulty === 'advanced' ? 8 : 4;
  const [currentSpanLength, setCurrentSpanLength] = useState(baseSpan);

  const [phase, setPhase] = useState<'presenting' | 'recall' | 'feedback'>('presenting');
  const [currentDigitIndex, setCurrentDigitIndex] = useState<number>(-1);
  const [activeDigits, setActiveDigits] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [trialFeedback, setTrialFeedback] = useState<{ isCorrect: boolean; target: number[]; user: number[] } | null>(null);

  const trialsHistoryRef = useRef<any[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const trialStartTimeRef = useRef<number>(Date.now());

  // Generate sequence
  const generateSequence = useCallback((len: number): number[] => {
    const seq: number[] = [];
    for (let i = 0; i < len; i++) {
      let digit: number;
      do {
        digit = Math.floor(Math.random() * 9) + 1; // 1-9
      } while (i > 0 && digit === seq[i - 1]); // avoid direct consecutive duplicates
      seq.push(digit);
    }
    return seq;
  }, []);

  // Start trial
  const startTrial = useCallback((spanLen: number) => {
    const seq = generateSequence(spanLen);
    setActiveDigits(seq);
    setUserInput([]);
    setTrialFeedback(null);
    setCurrentDigitIndex(0);
    setPhase('presenting');
  }, [generateSequence]);

  useEffect(() => {
    startTrial(currentSpanLength);
  }, []);

  // Handle sequence presentation timing
  useEffect(() => {
    if (phase !== 'presenting') return;

    if (currentDigitIndex >= 0 && currentDigitIndex < activeDigits.length) {
      if (soundEnabled) soundManager.playTick(soundVolume * 0.8);

      const timer = setTimeout(() => {
        setCurrentDigitIndex(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentDigitIndex >= activeDigits.length) {
      // Completed presentation, transition to recall
      const pause = setTimeout(() => {
        setPhase('recall');
        trialStartTimeRef.current = Date.now();
      }, 400);
      return () => clearTimeout(pause);
    }
  }, [phase, currentDigitIndex, activeDigits, soundEnabled, soundVolume]);

  // Handle user submit
  const handleSubmitRecall = useCallback(() => {
    if (phase !== 'recall') return;

    const rt = Date.now() - trialStartTimeRef.current;
    const scoreResult = scoreDigitSpan(activeDigits, userInput, mode);

    if (scoreResult.isCorrect) {
      if (soundEnabled) soundManager.playCorrect(soundVolume);
    } else {
      if (soundEnabled) soundManager.playIncorrect(soundVolume);
    }

    const trialRecord = {
      trialNumber: currentTrial,
      stimulus: activeDigits,
      userResponse: userInput,
      correctResponse: mode === 'backward' ? [...activeDigits].reverse() : activeDigits,
      isCorrect: scoreResult.isCorrect,
      reactionTimeMs: rt,
      details: { spanLength: currentSpanLength, mode }
    };
    trialsHistoryRef.current.push(trialRecord);

    setTrialFeedback({
      isCorrect: scoreResult.isCorrect,
      target: mode === 'backward' ? [...activeDigits].reverse() : activeDigits,
      user: userInput
    });
    setPhase('feedback');
  }, [phase, activeDigits, userInput, mode, currentTrial, currentSpanLength, soundEnabled, soundVolume]);

  // Proceed to next trial or finish
  const handleNextTrial = () => {
    if (currentTrial >= totalTrials) {
      // Session finished
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const correctCount = trialsHistoryRef.current.filter(t => t.isCorrect).length;
      const incorrectCount = totalTrials - correctCount;
      const accuracy = Math.round((correctCount / totalTrials) * 100);
      const rawScore = correctCount * 100 + currentSpanLength * 20;

      const rts = trialsHistoryRef.current.map(t => t.reactionTimeMs).filter(Boolean);
      const avgRt = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : undefined;

      onFinish({
        rawScore,
        accuracy,
        correctCount,
        incorrectCount,
        totalTrials,
        durationSeconds,
        averageReactionTimeMs: avgRt,
        exerciseMetrics: {
          difficulty,
          mode,
          finalSpanLength: currentSpanLength,
          correctRate: `${correctCount}/${totalTrials}`
        },
        trials: trialsHistoryRef.current
      });
      return;
    }

    // Adaptive span length or standard progression
    let nextSpan = currentSpanLength;
    const lastTrial = trialsHistoryRef.current[trialsHistoryRef.current.length - 1];
    if (difficulty === 'adaptive') {
      if (lastTrial?.isCorrect) {
        nextSpan = Math.min(12, currentSpanLength + 1);
      } else {
        nextSpan = Math.max(3, currentSpanLength - 1);
      }
    }

    setCurrentSpanLength(nextSpan);
    setCurrentTrial(prev => prev + 1);
    startTrial(nextSpan);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'recall') return;

      if (e.key >= '0' && e.key <= '9') {
        const val = parseInt(e.key, 10);
        setUserInput(prev => [...prev, val]);
        if (soundEnabled) soundManager.playClick(soundVolume * 0.5);
      } else if (e.key === 'Backspace') {
        setUserInput(prev => prev.slice(0, -1));
        if (soundEnabled) soundManager.playClick(soundVolume * 0.5);
      } else if (e.key === 'Enter') {
        handleSubmitRecall();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleSubmitRecall, soundEnabled, soundVolume]);

  const addDigit = (d: number) => {
    if (phase !== 'recall') return;
    setUserInput(prev => [...prev, d]);
    if (soundEnabled) soundManager.playClick(soundVolume * 0.5);
  };

  const removeDigit = () => {
    if (phase !== 'recall') return;
    setUserInput(prev => prev.slice(0, -1));
    if (soundEnabled) soundManager.playClick(soundVolume * 0.5);
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-xl w-full p-4 animate-in fade-in duration-300">
      {/* Sub-header status */}
      <div className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-mono">
        <span>Trial {currentTrial} of {totalTrials}</span>
        <div className="flex items-center gap-2">
          <span>Span: {currentSpanLength} digits</span>
          <span>·</span>
          <span className="capitalize">{mode} Recall</span>
        </div>
      </div>

      {/* Main interactive area */}
      <div className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center min-h-[320px] justify-center relative shadow-sm">
        {phase === 'presenting' && (
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono block mb-6">
              Remember the Digits
            </span>
            <div className="h-32 flex items-center justify-center">
              <span className="text-7xl font-mono font-bold text-black dark:text-white transition-all transform scale-100">
                {currentDigitIndex < activeDigits.length ? activeDigits[currentDigitIndex] : ''}
              </span>
            </div>
            <div className="flex justify-center gap-1.5 mt-4">
              {activeDigits.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentDigitIndex ? 'bg-black dark:bg-white scale-125' : i < currentDigitIndex ? 'bg-neutral-400 dark:bg-neutral-700' : 'bg-neutral-200 dark:bg-neutral-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {phase === 'recall' && (
          <div className="w-full flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono mb-2">
              {mode === 'backward' ? 'Enter Digits in REVERSE Order' : 'Enter Digits in FORWARD Order'}
            </span>

            {/* Display user input box */}
            <div className="w-full max-w-xs h-14 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg flex items-center justify-center tracking-widest text-2xl font-mono font-semibold text-black dark:text-white px-4 mb-6">
              {userInput.length === 0 ? (
                <span className="text-xs font-normal text-neutral-400 tracking-normal">Type or use keypad</span>
              ) : (
                userInput.join(' ')
              )}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => addDigit(num)}
                  className="h-12 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-lg font-mono font-medium text-black dark:text-white rounded-lg transition-colors active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={removeDigit}
                disabled={userInput.length === 0}
                className="h-12 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 disabled:opacity-40 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 rounded-lg transition-colors"
                aria-label="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
              <button
                onClick={() => addDigit(0)}
                className="h-12 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-lg font-mono font-medium text-black dark:text-white rounded-lg transition-colors active:scale-95"
              >
                0
              </button>
              <button
                onClick={handleSubmitRecall}
                disabled={userInput.length === 0}
                className="h-12 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 disabled:opacity-40 text-white dark:text-black font-semibold rounded-lg transition-colors flex items-center justify-center"
                aria-label="Submit"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">Press Enter on keyboard to submit</p>
          </div>
        )}

        {phase === 'feedback' && trialFeedback && (
          <div className="w-full flex flex-col items-center text-center">
            <div className="p-3 rounded-full mb-3 bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border border-neutral-200 dark:border-neutral-800">
              {trialFeedback.isCorrect ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-2">
              {trialFeedback.isCorrect ? 'Correct Recall' : 'Incorrect Sequence'}
            </h3>

            <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-lg w-full max-w-sm mb-6 text-xs font-mono space-y-1.5 border border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between">
                <span className="text-neutral-500">Target sequence:</span>
                <span className="text-black dark:text-white font-semibold">{trialFeedback.target.join(' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Your response:</span>
                <span className="font-semibold text-black dark:text-white">
                  {trialFeedback.user.length > 0 ? trialFeedback.user.join(' ') : '(empty)'}
                </span>
              </div>
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

      {/* Mode toggle selector at bottom before starting */}
      {phase === 'presenting' && currentTrial === 1 && (
        <div className="mt-4 flex items-center gap-2 p-1 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs">
          <button
            onClick={() => { setMode('forward'); startTrial(currentSpanLength); }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${mode === 'forward' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'}`}
          >
            Forward Recall
          </button>
          <button
            onClick={() => { setMode('backward'); startTrial(currentSpanLength); }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${mode === 'backward' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'}`}
          >
            Reverse (Backward)
          </button>
        </div>
      )}
    </div>
  );
};
