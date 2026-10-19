import React, { useState, useEffect } from 'react';
import { BrainCircuit } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  minDuration = 1400
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Cognitive Environment');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDuration) * 100));
      setProgress(pct);

      if (pct < 30) {
        setStatusText('Mounting Local Storage Vault');
      } else if (pct < 65) {
        setStatusText('Calibrating Audio & Visual Timing Engine');
      } else if (pct < 90) {
        setStatusText('Pre-compiling Cognitive Assessment Modules');
      } else {
        setStatusText('Cognitive Lab Ready');
      }

      if (elapsed >= minDuration) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-99999 flex flex-col items-center justify-center bg-white dark:bg-black text-neutral-900 dark:text-white transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-102' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle background ambient dot grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative flex flex-col items-center max-w-sm w-full px-8 text-center z-10">
        {/* Animated Brand Emblem */}
        <div className="relative mb-8">
          {/* Concentering ripple circles */}
          <div className="absolute -inset-4 rounded-full border border-neutral-300 dark:border-neutral-800 animate-ping opacity-25" />
          <div className="absolute -inset-8 rounded-full border border-neutral-200 dark:border-neutral-900 opacity-40 animate-pulse" />

          <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xl transform transition-transform">
            <BrainCircuit className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-lg font-bold tracking-tight mb-1 text-black dark:text-white font-sans">
          Cognitive Memory Lab
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-8">
          Short-Term Memory System
        </p>

        {/* Linear Progress Bar */}
        <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-1 rounded-full overflow-hidden mb-4 border border-neutral-200 dark:border-neutral-800">
          <div
            className="h-full bg-black dark:bg-white rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic Telemetry Status */}
        <div className="flex items-center justify-between w-full text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          <span className="truncate pr-2">{statusText}</span>
          <span className="tabular-nums font-semibold shrink-0">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
