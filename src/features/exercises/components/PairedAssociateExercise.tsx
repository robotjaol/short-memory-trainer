import React, { useState, useEffect, useRef } from 'react';
import { DifficultyLevel } from '../../../types/exercise';
import { scorePairedAssociates } from '../../../lib/scoring/scoringEngines';
import { getRandomWords } from '../../../data/wordBank';
import { soundManager } from '../../../lib/sound';
import { ArrowRight, Check, X } from 'lucide-react';

interface PairedAssociateExerciseProps {
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

export const PairedAssociateExercise: React.FC<PairedAssociateExerciseProps> = ({
  difficulty,
  soundEnabled,
  soundVolume,
  onFinish
}) => {
  const pairCount = difficulty === 'beginner' ? 4 : difficulty === 'intermediate' ? 6 : 8;

  const [pairs, setPairs] = useState<{ cue: string; target: string }[]>([]);
  const [phase, setPhase] = useState<'study' | 'test' | 'summary'>('study');
  const [testIndex, setTestIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState<string>('');
  const [trialDetails, setTrialDetails] = useState<any[]>([]);

  const startTimeRef = useRef<number>(Date.now());
  const cueTimeRef = useRef<number>(Date.now());
  const rtsRef = useRef<number[]>([]);

  useEffect(() => {
    // Generate pairs: Word -> 2-digit number (or word->word)
    const words = getRandomWords(pairCount * 2);
    const generated: { cue: string; target: string }[] = [];
    for (let i = 0; i < pairCount; i++) {
      // mix word-number and word-word
      const targetVal = i % 2 === 0 
        ? String(Math.floor(Math.random() * 89) + 10) 
        : words[pairCount + i];
      generated.push({
        cue: words[i],
        target: targetVal
      });
    }
    // Randomize study order
    setPairs(generated);
  }, [pairCount]);

  const handleStartTesting = () => {
    setPhase('test');
    setTestIndex(0);
    setCurrentInput('');
    cueTimeRef.current = Date.now();
  };

  const handleAnswerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentPair = pairs[testIndex];
    if (!currentPair) return;

    const rt = Date.now() - cueTimeRef.current;
    rtsRef.current.push(rt);

    const isMatch = currentInput.trim().toLowerCase() === currentPair.target.trim().toLowerCase();
    if (isMatch) {
      if (soundEnabled) soundManager.playCorrect(soundVolume);
    } else {
      if (soundEnabled) soundManager.playIncorrect(soundVolume);
    }

    const updatedAnswers = {
      ...userAnswers,
      [currentPair.cue]: currentInput.trim()
    };
    setUserAnswers(updatedAnswers);

    if (testIndex + 1 < pairs.length) {
      setTestIndex(prev => prev + 1);
      setCurrentInput('');
      cueTimeRef.current = Date.now();
    } else {
      // Finished all pairs
      wrapUpSession(updatedAnswers);
    }
  };

  const wrapUpSession = (finalAnswers: Record<string, string>) => {
    const scored = scorePairedAssociates(pairs, finalAnswers);
    setTrialDetails(scored.details);
    setPhase('summary');

    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const avgRt = rtsRef.current.length > 0 
      ? Math.round(rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length) 
      : undefined;

    onFinish({
      rawScore: scored.correctCount * 120,
      accuracy: scored.accuracy,
      correctCount: scored.correctCount,
      incorrectCount: scored.totalCount - scored.correctCount,
      totalTrials: scored.totalCount,
      durationSeconds,
      averageReactionTimeMs: avgRt,
      exerciseMetrics: {
        difficulty,
        totalPairsLearned: pairCount,
        accuracy: `${scored.accuracy}%`
      },
      trials: scored.details.map((d, i) => ({
        trialNumber: i + 1,
        stimulus: d.cue,
        userResponse: d.userAns,
        correctResponse: d.target,
        isCorrect: d.isCorrect
      }))
    });
  };

  const currentPair = pairs[testIndex];

  return (
    <div className="flex flex-col items-center justify-center max-w-lg w-full p-4 animate-in fade-in duration-300">
      <div className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-mono">
        <span>{phase === 'study' ? 'Encoding Phase' : phase === 'test' ? `Test Pair ${testIndex + 1} of ${pairs.length}` : 'Completed'}</span>
        <span>Count: {pairCount} pairs</span>
      </div>

      <div className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center shadow-sm">
        {phase === 'study' && (
          <div className="w-full flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-6 text-center">
              Study the Pair Associations
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-8">
              {pairs.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-mono"
                >
                  <span className="text-black dark:text-white font-semibold">{p.cue}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-neutral-900 dark:text-neutral-100 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded font-bold">{p.target}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartTesting}
              className="px-6 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Begin Association Recall</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {phase === 'test' && currentPair && (
          <div className="w-full flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-4">
              Recall Associated Target
            </span>

            <div className="w-full max-w-xs p-6 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-center gap-4 text-xl font-mono mb-6 shadow-sm">
              <span className="text-black dark:text-white font-bold">{currentPair.cue}</span>
              <ArrowRight className="w-5 h-5 text-neutral-400" />
              <span className="text-neutral-400 font-bold">?</span>
            </div>

            <form onSubmit={handleAnswerSubmit} className="w-full max-w-xs flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={e => setCurrentInput(e.target.value)}
                placeholder="Enter association..."
                autoFocus
                className="flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-black dark:text-white placeholder-neutral-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors font-mono"
              />
              <button
                type="submit"
                disabled={!currentInput.trim()}
                className="px-4 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 disabled:opacity-40 text-white dark:text-black rounded-lg text-xs font-semibold transition-colors flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {phase === 'summary' && trialDetails.length > 0 && (
          <div className="w-full flex flex-col items-center">
            <h3 className="text-base font-bold text-black dark:text-white mb-4">
              Pair Recall Review
            </h3>
            <div className="w-full space-y-2 mb-6 max-h-60 overflow-y-auto">
              {trialDetails.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                >
                  <div className="flex items-center gap-2">
                    {item.isCorrect ? <Check className="w-3.5 h-3.5 text-black dark:text-white" /> : <X className="w-3.5 h-3.5 text-neutral-400" />}
                    <span className="font-semibold text-black dark:text-white">{item.cue} → {item.target}</span>
                  </div>
                  <span className="text-neutral-500">Your answer: {item.userAns || '(empty)'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
