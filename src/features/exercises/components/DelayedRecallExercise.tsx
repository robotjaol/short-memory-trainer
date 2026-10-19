import React, { useState, useEffect, useRef } from 'react';
import { DifficultyLevel } from '../../../types/exercise';
import { scoreDelayedRecall } from '../../../lib/scoring/scoringEngines';
import { getRandomWords, normalizeWord } from '../../../data/wordBank';
import { soundManager } from '../../../lib/sound';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface DelayedRecallExerciseProps {
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

export const DelayedRecallExercise: React.FC<DelayedRecallExerciseProps> = ({
  difficulty,
  soundEnabled,
  soundVolume,
  onFinish
}) => {
  const targetCount = difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 7 : 9;
  const distractorDurationSec = difficulty === 'beginner' ? 12 : difficulty === 'intermediate' ? 16 : 20;

  const [phase, setPhase] = useState<'study' | 'distractor' | 'delayed-recall' | 'summary'>('study');
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [studySecondsLeft, setStudySecondsLeft] = useState<number>(12);

  // Distractor Arithmetic State
  const [distractorTimeLeft, setDistractorTimeLeft] = useState<number>(distractorDurationSec);
  const [currentMathProblem, setCurrentMathProblem] = useState<{ num1: number; num2: number; op: string; answer: number }>({ num1: 12, num2: 7, op: '+', answer: 19 });
  const [mathInput, setMathInput] = useState<string>('');
  const [mathStats, setMathStats] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  // Delayed Recall State
  const [wordInput, setWordInput] = useState<string>('');
  const [enteredWords, setEnteredWords] = useState<string[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);

  const startTimeRef = useRef<number>(Date.now());

  // Generate arithmetic question
  const generateMathProblem = () => {
    const isPlus = Math.random() < 0.5;
    if (isPlus) {
      const a = Math.floor(Math.random() * 25) + 5;
      const b = Math.floor(Math.random() * 25) + 5;
      return { num1: a, num2: b, op: '+', answer: a + b };
    } else {
      const a = Math.floor(Math.random() * 30) + 15;
      const b = Math.floor(Math.random() * 14) + 1;
      return { num1: a, num2: b, op: '-', answer: a - b };
    }
  };

  useEffect(() => {
    setTargetWords(getRandomWords(targetCount));
    setCurrentMathProblem(generateMathProblem());
  }, [targetCount]);

  // Phase 1 Study Timer
  useEffect(() => {
    if (phase !== 'study') return;
    if (studySecondsLeft <= 0) {
      setPhase('distractor');
      if (soundEnabled) soundManager.playStart(soundVolume * 0.6);
      return;
    }
    const t = setInterval(() => setStudySecondsLeft(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [phase, studySecondsLeft, soundEnabled, soundVolume]);

  // Phase 2 Distractor Timer
  useEffect(() => {
    if (phase !== 'distractor') return;
    if (distractorTimeLeft <= 0) {
      setPhase('delayed-recall');
      if (soundEnabled) soundManager.playTone(600, 0.15, 'sine', soundVolume * 0.7);
      return;
    }
    const t = setInterval(() => setDistractorTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [phase, distractorTimeLeft, soundEnabled, soundVolume]);

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(mathInput.trim(), 10);
    const isCorrect = parsed === currentMathProblem.answer;

    if (isCorrect) {
      if (soundEnabled) soundManager.playTone(700, 0.05, 'sine', soundVolume * 0.3);
      setMathStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      if (soundEnabled) soundManager.playIncorrect(soundVolume * 0.3);
      setMathStats(prev => ({ correct: prev.correct, total: prev.total + 1 }));
    }

    setMathInput('');
    setCurrentMathProblem(generateMathProblem());
  };

  const handleAddWord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = wordInput.trim();
    if (!clean) return;

    if (enteredWords.some(w => normalizeWord(w) === normalizeWord(clean))) {
      setWordInput('');
      return;
    }

    setEnteredWords(prev => [...prev, clean]);
    setWordInput('');
    if (soundEnabled) soundManager.playClick(soundVolume * 0.4);
  };

  const handleFinishRecall = () => {
    const mathAcc = mathStats.total > 0 ? Math.round((mathStats.correct / mathStats.total) * 100) : 100;
    const scored = scoreDelayedRecall(targetWords, enteredWords, mathAcc, distractorDurationSec);

    setSummaryData(scored);
    setPhase('summary');

    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    onFinish({
      rawScore: scored.recalledCount * 120 + Math.round(mathAcc * 0.5),
      accuracy: scored.recallAccuracy,
      correctCount: scored.recalledCount,
      incorrectCount: scored.totalTargets - scored.recalledCount,
      totalTrials: scored.totalTargets,
      durationSeconds,
      exerciseMetrics: {
        difficulty,
        delayedRecallAccuracy: `${scored.recallAccuracy}%`,
        distractorAccuracy: `${mathAcc}% (${mathStats.correct}/${mathStats.total} solved)`,
        delayInterferenceTime: `${distractorDurationSec} seconds`,
        compositeScore: scored.compositeScore
      },
      trials: targetWords.map((t, idx) => ({
        trialNumber: idx + 1,
        stimulus: t,
        userResponse: enteredWords[idx] || '',
        correctResponse: t,
        isCorrect: enteredWords.some(w => normalizeWord(w) === normalizeWord(t))
      }))
    });
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg w-full p-4 animate-in fade-in duration-300">
      <div className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-mono">
        <span className="capitalize">{phase.replace('-', ' ')} Phase</span>
        <span>Targets: {targetCount} words</span>
      </div>

      <div className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center shadow-sm">
        {phase === 'study' && (
          <div className="w-full flex flex-col items-center text-center">
            <div className="flex items-center justify-between w-full mb-6">
              <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono">
                Study Phase
              </span>
              <span className="text-xs font-mono px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-800 dark:text-neutral-200">
                Delay begins in: <strong className="text-black dark:text-white tabular-nums">{studySecondsLeft}s</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-8">
              {targetWords.map((w, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-semibold text-black dark:text-white tracking-wide"
                >
                  {w}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStudySecondsLeft(0)}
              className="text-xs text-neutral-500 hover:text-black dark:hover:text-white underline underline-offset-4 font-mono transition-colors"
            >
              Skip ahead to Distractor Task
            </button>
          </div>
        )}

        {phase === 'distractor' && (
          <div className="w-full flex flex-col items-center text-center">
            <div className="flex items-center justify-between w-full mb-4">
              <span className="text-xs uppercase tracking-widest text-black dark:text-white font-mono font-semibold">
                Distractor Task (Prevent Rehearsal)
              </span>
              <span className="text-xs font-mono px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-800 dark:text-neutral-200">
                Time: <strong className="text-black dark:text-white tabular-nums">{distractorTimeLeft}s</strong>
              </span>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">Solve rapid arithmetic calculations to clear your active phonological loop.</p>

            <div className="text-4xl font-mono font-bold text-black dark:text-white mb-6 p-6 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-xs shadow-inner">
              {currentMathProblem.num1} {currentMathProblem.op} {currentMathProblem.num2} = ?
            </div>

            <form onSubmit={handleMathSubmit} className="flex gap-2 w-full max-w-xs mb-4">
              <input
                type="number"
                value={mathInput}
                onChange={e => setMathInput(e.target.value)}
                autoFocus
                placeholder="Answer"
                className="flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-2.5 text-center text-xl font-mono text-black dark:text-white focus:outline-hidden focus:border-black dark:focus:border-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-semibold rounded-lg text-xs"
              >
                Enter
              </button>
            </form>
            <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">Solved: {mathStats.correct} / {mathStats.total}</span>
          </div>
        )}

        {phase === 'delayed-recall' && (
          <div className="w-full flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-4 text-center">
              Delayed Retrieval: Recall The Initial Words
            </span>

            <form onSubmit={handleAddWord} className="w-full max-w-md flex gap-2 mb-6">
              <input
                type="text"
                value={wordInput}
                onChange={e => setWordInput(e.target.value)}
                placeholder="Type a remembered word..."
                autoFocus
                className="flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-black dark:text-white placeholder-neutral-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={!wordInput.trim()}
                className="px-4 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 disabled:opacity-40 text-white dark:text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>

            <div className="w-full max-w-md min-h-[90px] p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg mb-6">
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono block mb-2">
                Entered ({enteredWords.length} words):
              </span>
              {enteredWords.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No words entered yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {enteredWords.map((w, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white rounded-md font-medium"
                    >
                      <span>{w}</span>
                      <button
                        type="button"
                        onClick={() => setEnteredWords(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-neutral-400 hover:text-black dark:hover:text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleFinishRecall}
              className="px-6 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Submit Delayed Recall</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {phase === 'summary' && summaryData && (
          <div className="w-full flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-black dark:text-white mb-2">
              Delayed Retention: {summaryData.recallAccuracy}%
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mb-6">
              Distractor task solved: {summaryData.distractorAccuracy}% accuracy across {summaryData.delayDurationSeconds}s delay
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
