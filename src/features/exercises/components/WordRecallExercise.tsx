import React, { useState, useEffect, useRef } from 'react';
import { DifficultyLevel } from '../../../types/exercise';
import { scoreWordRecall } from '../../../lib/scoring/scoringEngines';
import { getRandomWords, normalizeWord } from '../../../data/wordBank';
import { soundManager } from '../../../lib/sound';
import { Check, X, Plus, Trash2 } from 'lucide-react';

interface WordRecallExerciseProps {
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

export const WordRecallExercise: React.FC<WordRecallExerciseProps> = ({
  difficulty,
  soundEnabled,
  soundVolume,
  onFinish
}) => {
  const wordCount = difficulty === 'beginner' ? 6 : difficulty === 'intermediate' ? 8 : 10;
  const studySeconds = difficulty === 'beginner' ? 14 : difficulty === 'intermediate' ? 18 : 22;

  const [currentTrial, setCurrentTrial] = useState(1);
  const totalTrials = 2;

  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [studyTimer, setStudyTimer] = useState<number>(studySeconds);
  const [phase, setPhase] = useState<'study' | 'recall' | 'feedback'>('study');
  const [currentInput, setCurrentInput] = useState<string>('');
  const [userWords, setUserWords] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<any>(null);

  const startTimeRef = useRef<number>(Date.now());
  const trialsHistoryRef = useRef<any[]>([]);

  const startTrial = () => {
    const words = getRandomWords(wordCount);
    setTargetWords(words);
    setUserWords([]);
    setCurrentInput('');
    setEvaluation(null);
    setStudyTimer(studySeconds);
    setPhase('study');
  };

  useEffect(() => {
    startTrial();
  }, []);

  // Study countdown timer
  useEffect(() => {
    if (phase !== 'study') return;

    if (studyTimer <= 0) {
      setPhase('recall');
      if (soundEnabled) soundManager.playStart(soundVolume * 0.7);
      return;
    }

    const timer = setInterval(() => {
      setStudyTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, studyTimer, soundEnabled, soundVolume]);

  const handleAddWord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = currentInput.trim();
    if (!clean) return;

    // Check if already in userWords
    if (userWords.some(w => normalizeWord(w) === normalizeWord(clean))) {
      setCurrentInput('');
      return;
    }

    setUserWords(prev => [...prev, clean]);
    setCurrentInput('');
    if (soundEnabled) soundManager.playClick(soundVolume * 0.4);
  };

  const handleRemoveWord = (index: number) => {
    setUserWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinishRecall = () => {
    const scored = scoreWordRecall(targetWords, userWords);

    if (scored.accuracy >= 70) {
      if (soundEnabled) soundManager.playCorrect(soundVolume);
    } else {
      if (soundEnabled) soundManager.playIncorrect(soundVolume);
    }

    const trialRecord = {
      trialNumber: currentTrial,
      stimulus: targetWords,
      userResponse: userWords,
      correctResponse: targetWords,
      isCorrect: scored.accuracy >= 70,
      details: scored
    };
    trialsHistoryRef.current.push(trialRecord);

    setEvaluation(scored);
    setPhase('feedback');
  };

  const handleNextTrial = () => {
    if (currentTrial >= totalTrials) {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const avgAccuracy = Math.round(
        trialsHistoryRef.current.reduce((acc, cur) => acc + cur.details.accuracy, 0) / totalTrials
      );
      const totalRecalled = trialsHistoryRef.current.reduce((acc, cur) => acc + cur.details.correctRecalled.length, 0);
      const totalPossible = targetWords.length * totalTrials;

      onFinish({
        rawScore: totalRecalled * 100,
        accuracy: avgAccuracy,
        correctCount: totalRecalled,
        incorrectCount: totalPossible - totalRecalled,
        totalTrials: totalPossible,
        durationSeconds,
        exerciseMetrics: {
          difficulty,
          wordsPerList: wordCount,
          totalWordsRecalled: `${totalRecalled} / ${totalPossible}`,
          intrusions: trialsHistoryRef.current.reduce((acc, cur) => acc + cur.details.intrusions.length, 0)
        },
        trials: trialsHistoryRef.current
      });
      return;
    }

    setCurrentTrial(prev => prev + 1);
    startTrial();
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-xl w-full p-4 animate-in fade-in duration-300">
      <div className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-mono">
        <span>Trial {currentTrial} of {totalTrials}</span>
        <span>List Length: {wordCount} words</span>
      </div>

      <div className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center shadow-sm">
        {phase === 'study' && (
          <div className="w-full flex flex-col items-center text-center">
            <div className="flex items-center justify-between w-full mb-6">
              <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono">
                Study Phase
              </span>
              <span className="text-xs font-mono px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-800 dark:text-neutral-200">
                Time remaining: <strong className="text-black dark:text-white tabular-nums">{studyTimer}s</strong>
              </span>
            </div>

            {/* Word Tiles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-8">
              {targetWords.map((word, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-base font-semibold text-black dark:text-white tracking-wide shadow-xs"
                >
                  {word}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStudyTimer(0)}
              className="text-xs text-neutral-500 hover:text-black dark:hover:text-white underline underline-offset-4 font-mono transition-colors"
            >
              Ready now (Proceed to Recall)
            </button>
          </div>
        )}

        {phase === 'recall' && (
          <div className="w-full flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-4">
              Enter All Recalled Words
            </span>

            {/* Input form */}
            <form onSubmit={handleAddWord} className="w-full max-w-md flex gap-2 mb-6">
              <input
                type="text"
                value={currentInput}
                onChange={e => setCurrentInput(e.target.value)}
                placeholder="Type a word..."
                autoFocus
                className="flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-black dark:text-white placeholder-neutral-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={!currentInput.trim()}
                className="px-4 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 disabled:opacity-40 text-white dark:text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>

            {/* Chips of added words */}
            <div className="w-full max-w-md min-h-[100px] p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg mb-6">
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono block mb-2">
                Entered ({userWords.length} words):
              </span>
              {userWords.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No words entered yet. Type above and press Enter.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userWords.map((w, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white rounded-md font-medium"
                    >
                      <span>{w}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWord(i)}
                        className="text-neutral-400 hover:text-black dark:hover:text-white"
                        aria-label={`Remove ${w}`}
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
              className="px-6 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold rounded-lg transition-colors"
            >
              Finish Recall
            </button>
          </div>
        )}

        {phase === 'feedback' && evaluation && (
          <div className="w-full flex flex-col items-center">
            <h3 className="text-lg font-bold text-black dark:text-white mb-1">
              Recall Accuracy: {evaluation.accuracy}%
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mb-6">
              Recalled {evaluation.correctRecalled.length} of {targetWords.length} targets
            </p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono mb-6">
              {/* Correct */}
              <div className="p-4 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <span className="text-black dark:text-white font-semibold block mb-2">
                  Correct ({evaluation.correctRecalled.length}):
                </span>
                <p className="text-neutral-800 dark:text-neutral-200">
                  {evaluation.correctRecalled.length > 0 ? evaluation.correctRecalled.join(', ') : 'None'}
                </p>
              </div>

              {/* Omissions (Missed) */}
              <div className="p-4 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <span className="text-neutral-500 font-semibold block mb-2">
                  Omitted Targets ({evaluation.omissions.length}):
                </span>
                <p className="text-neutral-500">
                  {evaluation.omissions.length > 0 ? evaluation.omissions.join(', ') : 'None'}
                </p>
              </div>
            </div>

            {evaluation.intrusions.length > 0 && (
              <div className="w-full p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-6">
                Intrusions (words not in target list): {evaluation.intrusions.join(', ')}
              </div>
            )}

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
