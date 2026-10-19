import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DifficultyLevel } from '../../../types/exercise';
import { scoreVisualMatrix } from '../../../lib/scoring/scoringEngines';
import { soundManager } from '../../../lib/sound';
import { Check, X, ArrowRight } from 'lucide-react';

interface VisualMatrixExerciseProps {
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

export const VisualMatrixExercise: React.FC<VisualMatrixExerciseProps> = ({
  difficulty,
  soundEnabled,
  soundVolume,
  onFinish
}) => {
  const totalTrials = 5;
  const [currentTrial, setCurrentTrial] = useState(1);

  // Grid dimensions
  const getGridConfig = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'beginner': return { size: 3, targets: 3, displayMs: 1800 };
      case 'intermediate': return { size: 4, targets: 5, displayMs: 1600 };
      case 'advanced': return { size: 5, targets: 7, displayMs: 1500 };
      case 'adaptive': return { size: 3, targets: 3, displayMs: 1800 };
    }
  };

  const [config, setConfig] = useState(getGridConfig(difficulty));
  const [targetCells, setTargetCells] = useState<number[]>([]);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'feedback'>('memorize');
  const [lastScored, setLastScored] = useState<any>(null);

  const startTimeRef = useRef<number>(Date.now());
  const trialStartTimeRef = useRef<number>(Date.now());
  const trialsHistoryRef = useRef<any[]>([]);

  const startTrial = useCallback((cfg: typeof config) => {
    const totalCells = cfg.size * cfg.size;
    const indices: number[] = [];
    while (indices.length < cfg.targets) {
      const idx = Math.floor(Math.random() * totalCells);
      if (!indices.includes(idx)) indices.push(idx);
    }

    setTargetCells(indices);
    setSelectedCells([]);
    setLastScored(null);
    setPhase('memorize');

    if (soundEnabled) soundManager.playTone(520, 0.1, 'sine', soundVolume * 0.4);

    const timer = setTimeout(() => {
      setPhase('recall');
      trialStartTimeRef.current = Date.now();
      if (soundEnabled) soundManager.playTick(soundVolume * 0.5);
    }, cfg.displayMs);

    return () => clearTimeout(timer);
  }, [soundEnabled, soundVolume]);

  useEffect(() => {
    startTrial(config);
  }, []);

  const handleCellClick = (idx: number) => {
    if (phase !== 'recall') return;
    if (soundEnabled) soundManager.playClick(soundVolume * 0.4);

    setSelectedCells(prev => 
      prev.includes(idx) ? prev.filter(c => c !== idx) : [...prev, idx]
    );
  };

  const handleSubmit = () => {
    if (phase !== 'recall') return;

    const rt = Date.now() - trialStartTimeRef.current;
    const scored = scoreVisualMatrix(targetCells, selectedCells);

    if (scored.isExactMatch) {
      if (soundEnabled) soundManager.playCorrect(soundVolume);
    } else {
      if (soundEnabled) soundManager.playIncorrect(soundVolume);
    }

    const trialRecord = {
      trialNumber: currentTrial,
      stimulus: targetCells,
      userResponse: selectedCells,
      correctResponse: targetCells,
      isCorrect: scored.isExactMatch,
      reactionTimeMs: rt,
      details: scored
    };
    trialsHistoryRef.current.push(trialRecord);

    setLastScored(scored);
    setPhase('feedback');
  };

  const handleNextTrial = () => {
    if (currentTrial >= totalTrials) {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const exactCount = trialsHistoryRef.current.filter(t => t.isCorrect).length;
      const avgScore = Math.round(
        trialsHistoryRef.current.reduce((acc, cur) => acc + cur.details.score, 0) / totalTrials
      );
      const avgRecall = Math.round(
        trialsHistoryRef.current.reduce((acc, cur) => acc + cur.details.recall, 0) / totalTrials
      );
      const avgPrecision = Math.round(
        trialsHistoryRef.current.reduce((acc, cur) => acc + cur.details.precision, 0) / totalTrials
      );

      onFinish({
        rawScore: avgScore * 10 + exactCount * 50,
        accuracy: avgScore,
        correctCount: exactCount,
        incorrectCount: totalTrials - exactCount,
        totalTrials,
        durationSeconds,
        exerciseMetrics: {
          difficulty,
          gridSize: `${config.size}x${config.size}`,
          averageRecall: `${avgRecall}%`,
          averagePrecision: `${avgPrecision}%`,
          exactMatches: exactCount
        },
        trials: trialsHistoryRef.current
      });
      return;
    }

    // Adaptive adjustment if enabled
    let nextCfg = { ...config };
    if (difficulty === 'adaptive') {
      const last = trialsHistoryRef.current[trialsHistoryRef.current.length - 1];
      if (last.isCorrect && nextCfg.targets < 8) {
        if (nextCfg.targets >= 4 && nextCfg.size === 3) nextCfg.size = 4;
        if (nextCfg.targets >= 6 && nextCfg.size === 4) nextCfg.size = 5;
        nextCfg.targets += 1;
      }
    }

    setConfig(nextCfg);
    setCurrentTrial(prev => prev + 1);
    startTrial(nextCfg);
  };

  const totalCells = config.size * config.size;

  return (
    <div className="flex flex-col items-center justify-center max-w-lg w-full p-4 animate-in fade-in duration-300">
      <div className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-mono">
        <span>Trial {currentTrial} of {totalTrials}</span>
        <span>Grid: {config.size}x{config.size} ({config.targets} targets)</span>
      </div>

      <div className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 flex flex-col items-center shadow-sm">
        <span className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mb-6">
          {phase === 'memorize' ? 'Memorize Target Cells' : phase === 'recall' ? 'Select Remembered Cells' : 'Evaluation'}
        </span>

        {/* Dynamic Grid */}
        <div 
          className="grid gap-2.5 mb-6"
          style={{
            gridTemplateColumns: `repeat(${config.size}, minmax(0, 1fr))`,
            width: `${Math.min(320, config.size * 64)}px`,
            height: `${Math.min(320, config.size * 64)}px`
          }}
        >
          {Array.from({ length: totalCells }).map((_, idx) => {
            const isTarget = targetCells.includes(idx);
            const isSelected = selectedCells.includes(idx);

            let cellClass = 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700';

            if (phase === 'memorize') {
              if (isTarget) {
                cellClass = 'bg-black dark:bg-white border-black dark:border-white shadow-md';
              }
            } else if (phase === 'recall') {
              if (isSelected) {
                cellClass = 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white';
              }
            } else if (phase === 'feedback') {
              if (isTarget && isSelected) {
                cellClass = 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white';
              } else if (!isTarget && isSelected) {
                cellClass = 'bg-neutral-300 dark:bg-neutral-800 border-neutral-400 text-black dark:text-white line-through';
              } else if (isTarget && !isSelected) {
                cellClass = 'bg-transparent border-2 border-dashed border-black dark:border-white';
              }
            }

            return (
              <button
                key={idx}
                disabled={phase !== 'recall'}
                onClick={() => handleCellClick(idx)}
                className={`w-full h-full rounded-lg border transition-all duration-150 flex items-center justify-center font-mono text-sm ${cellClass}`}
                aria-label={`Cell ${idx + 1}`}
              >
                {phase === 'feedback' && isTarget && isSelected && <Check className="w-4 h-4" />}
                {phase === 'feedback' && !isTarget && isSelected && <X className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        {/* Recall Controls */}
        {phase === 'recall' && (
          <div className="w-full flex items-center justify-between max-w-xs gap-3">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              Selected: {selectedCells.length} / {config.targets}
            </span>
            <button
              onClick={handleSubmit}
              disabled={selectedCells.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 disabled:opacity-40 text-white dark:text-black text-xs font-semibold rounded-lg transition-colors"
            >
              <span>Submit Grid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Feedback Details */}
        {phase === 'feedback' && lastScored && (
          <div className="w-full flex flex-col items-center text-center">
            <div className="flex gap-4 text-xs font-mono text-neutral-800 dark:text-neutral-200 mb-4 bg-neutral-100 dark:bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <span>Precision: {lastScored.precision}%</span>
              <span>·</span>
              <span>Recall: {lastScored.recall}%</span>
              <span>·</span>
              <span className="font-semibold text-black dark:text-white">
                {lastScored.isExactMatch ? 'Exact Match' : 'Partial Match'}
              </span>
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
