import React, { useState } from 'react';
import { ExerciseDefinition, SessionResult } from '../../types/exercise';
import { soundManager } from '../../lib/sound';
import { SpotlightBox } from '../../components/ui/SpotlightBox';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

interface ExerciseContainerProps {
  exercise: ExerciseDefinition;
  soundEnabled: boolean;
  soundVolume: number;
  onSoundToggle: () => void;
  onExit: () => void;
  onSessionComplete: (result: SessionResult) => void;
  children: (props: {
    phase: 'instruction' | 'countdown' | 'active' | 'summary';
    startCountdown: () => void;
    handleExerciseFinished: (data: {
      rawScore: number;
      maxPossibleScore?: number;
      accuracy: number;
      correctCount: number;
      incorrectCount: number;
      totalTrials: number;
      durationSeconds: number;
      averageReactionTimeMs?: number;
      exerciseMetrics: Record<string, number | string | boolean>;
      trials: any[];
    }) => void;
    soundEnabled: boolean;
    soundVolume: number;
  }) => React.ReactNode;
}

export const ExerciseContainer: React.FC<ExerciseContainerProps> = ({
  exercise,
  soundEnabled,
  soundVolume,
  onSoundToggle,
  onExit,
  onSessionComplete,
  children
}) => {
  const [phase, setPhase] = useState<'instruction' | 'countdown' | 'active' | 'summary'>('instruction');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<SessionResult | null>(null);

  const startCountdown = () => {
    setPhase('countdown');
    setCountdownNum(3);
    if (soundEnabled) soundManager.playTick(soundVolume);

    const interval = setInterval(() => {
      setCountdownNum(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('active');
          if (soundEnabled) soundManager.playStart(soundVolume);
          return 0;
        }
        if (soundEnabled) soundManager.playTick(soundVolume);
        return prev - 1;
      });
    }, 900);
  };

  const handleExerciseFinished = (data: {
    rawScore: number;
    maxPossibleScore?: number;
    accuracy: number;
    correctCount: number;
    incorrectCount: number;
    totalTrials: number;
    durationSeconds: number;
    averageReactionTimeMs?: number;
    exerciseMetrics: Record<string, number | string | boolean>;
    trials: any[];
  }) => {
    const now = Date.now();
    const d = new Date(now);
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const session: SessionResult = {
      id: `session_${now}_${Math.random().toString(36).substring(2, 7)}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      timestamp: now,
      dateString,
      difficulty: 'beginner',
      ...data
    };

    if (data.exerciseMetrics?.difficulty) {
      session.difficulty = String(data.exerciseMetrics.difficulty) as any;
    }

    setFinalResult(session);
    setPhase('summary');
    if (soundEnabled) soundManager.playComplete(soundVolume);
    onSessionComplete(session);
  };

  const restartExercise = () => {
    setFinalResult(null);
    startCountdown();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-50 dark:bg-black text-black dark:text-white overflow-hidden select-none animate-in fade-in duration-300">
      {/* Top Header bar */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-black/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
            {exercise.categoryLabel}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <h1 className="text-sm font-semibold text-black dark:text-white">
            {exercise.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSoundToggle}
            className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded transition-colors"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
          </button>

          <button
            onClick={() => {
              if (phase === 'active') {
                setShowExitConfirm(true);
              } else {
                onExit();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 relative flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* Phase 1: Instruction Card with SpotlightBox */}
        {phase === 'instruction' && (
          <SpotlightBox className="max-w-xl w-full p-6 sm:p-8 shadow-2xl" interactive={false}>
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white mb-2 font-sans">
                {exercise.name}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {exercise.description}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
                  Instructions
                </h3>
                <ul className="space-y-2 text-sm text-neutral-800 dark:text-neutral-200">
                  {exercise.instructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500 mt-0.5">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {exercise.tips && exercise.tips.length > 0 && (
                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                  <h4 className="text-xs font-semibold text-black dark:text-white mb-1">Cognitive Strategy Tip:</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{exercise.tips[0]}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-850">
              <button
                onClick={onExit}
                className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Back to Library
              </button>
              <button
                onClick={startCountdown}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg shadow-sm transition-all transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Begin Module</span>
              </button>
            </div>
          </SpotlightBox>
        )}

        {/* Phase 2: Countdown Screen */}
        {phase === 'countdown' && (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-9xl font-mono font-bold tracking-tight text-black dark:text-white animate-pulse">
              {countdownNum}
            </div>
            <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono">
              Calibrate Focus
            </p>
          </div>
        )}

        {/* Phase 3: Active Exercise Trial View */}
        {phase === 'active' && children({
          phase,
          startCountdown,
          handleExerciseFinished,
          soundEnabled,
          soundVolume
        })}

        {/* Phase 4: Session Summary Screen */}
        {phase === 'summary' && finalResult && (
          <SpotlightBox className="max-w-lg w-full p-6 sm:p-8 shadow-2xl" interactive={false}>
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white rounded-full mb-3 border border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white font-sans">
                Session Complete
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Data saved to local memory vault
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Accuracy</span>
                <div className="text-2xl font-bold text-black dark:text-white tabular-nums mt-0.5">
                  {finalResult.accuracy}%
                </div>
              </div>
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Score</span>
                <div className="text-2xl font-bold text-black dark:text-white tabular-nums mt-0.5">
                  {finalResult.rawScore}
                </div>
              </div>
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Correct / Total</span>
                <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums mt-1.5">
                  {finalResult.correctCount} / {finalResult.totalTrials}
                </div>
              </div>
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Duration</span>
                <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums mt-1.5">
                  {finalResult.durationSeconds}s
                </div>
              </div>
            </div>

            {finalResult.averageReactionTimeMs ? (
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg mb-6 flex justify-between items-center text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Avg Reaction Latency</span>
                <span className="font-mono text-black dark:text-white tabular-nums font-semibold">{finalResult.averageReactionTimeMs} ms</span>
              </div>
            ) : null}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={restartExercise}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repeat Module</span>
              </button>
              <button
                onClick={onExit}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </SpotlightBox>
        )}
      </main>

      {/* Confirmation Exit Dialog Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl shadow-2xl text-center">
            <h3 className="text-base font-bold text-black dark:text-white mb-2">
              Exit Active Session?
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6">
              In-progress trial records will not be preserved in your training vault.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors"
              >
                Resume
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit();
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-black dark:bg-white dark:text-black rounded-lg transition-colors"
              >
                Quit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
