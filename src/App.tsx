/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './lib/storage/localStorage';
import { StoredAppDataV1, UserPreferences } from './types/storage';
import { SessionResult } from './types/exercise';
import { getExerciseById } from './data/exerciseCatalog';
import { getLevelChallengeById } from './data/exerciseLevels';

import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { LibraryView } from './features/library/LibraryView';
import { AnalyticsView } from './features/analytics/AnalyticsView';
import { HistoryView } from './features/history/HistoryView';
import { SettingsView } from './features/settings/SettingsView';

import { LoadingScreen } from './components/ui/LoadingScreen';

import { ExerciseContainer } from './features/exercises/ExerciseContainer';
import { DigitSpanExercise } from './features/exercises/components/DigitSpanExercise';
import { SequenceMemoryExercise } from './features/exercises/components/SequenceMemoryExercise';
import { NBackExercise } from './features/exercises/components/NBackExercise';
import { VisualMatrixExercise } from './features/exercises/components/VisualMatrixExercise';
import { WordRecallExercise } from './features/exercises/components/WordRecallExercise';
import { PairedAssociateExercise } from './features/exercises/components/PairedAssociateExercise';
import { PatternRecallExercise } from './features/exercises/components/PatternRecallExercise';
import { RunningMemoryExercise } from './features/exercises/components/RunningMemoryExercise';
import { DelayedRecallExercise } from './features/exercises/components/DelayedRecallExercise';
import { AttentionDetectionExercise } from './features/exercises/components/AttentionDetectionExercise';

export default function App() {
  const [appData, setAppData] = useState<StoredAppDataV1>(() => StorageService.loadData());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Apply Theme effect: pure white & black
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const theme = appData.preferences.theme;

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
        body.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [appData.preferences.theme]);

  // Preference updates
  const handleUpdatePreferences = (prefs: Partial<UserPreferences>) => {
    const updated = StorageService.updatePreferences(prefs);
    setAppData(updated);
  };

  const handleToggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const next: 'light' | 'dark' = isCurrentlyDark ? 'light' : 'dark';
    handleUpdatePreferences({ theme: next });
  };

  const handleToggleSound = () => {
    handleUpdatePreferences({ soundEnabled: !appData.preferences.soundEnabled });
  };

  // Session completion handler
  const handleSessionComplete = useCallback((session: SessionResult) => {
    const updated = StorageService.recordSession(session);
    setAppData(updated);
  }, []);

  // Delete session handler
  const handleDeleteSession = useCallback((sessionId: string) => {
    const updated = StorageService.deleteSession(sessionId);
    setAppData(updated);
  }, []);

  // Data reset handler
  const handleDataReset = useCallback(() => {
    const updated = StorageService.resetAllData();
    setAppData(updated);
  }, []);

  // Data import handler
  const handleDataImported = useCallback((imported: StoredAppDataV1) => {
    setAppData(imported);
  }, []);

  const activeExerciseDef = activeExerciseId ? getExerciseById(activeExerciseId) : null;

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors duration-200">
      {/* Cognitive Calibration Loading Screen */}
      {isLoading && (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      )}

      {/* Primary Dashboard Layout with Autohide Navbar */}
      <AppLayout
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
        data={appData}
        onToggleTheme={handleToggleTheme}
        onToggleSound={handleToggleSound}
        onStartTrainingClick={() => setActiveTab('library')}
      >
        {activeTab === 'dashboard' && (
          <DashboardView
            data={appData}
            onLaunchExercise={exId => setActiveExerciseId(exId)}
            onNavigateToTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            exerciseStats={appData.exerciseStats}
            onLaunchExercise={exId => setActiveExerciseId(exId)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            sessions={appData.sessions}
            exerciseStats={appData.exerciseStats}
            onNavigateToTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            sessions={appData.sessions}
            onDeleteSession={handleDeleteSession}
            onNavigateToTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            preferences={appData.preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onDataImported={handleDataImported}
            onDataReset={handleDataReset}
            onReplayLoadingScreen={() => setIsLoading(true)}
          />
        )}
      </AppLayout>

      {/* Active Exercise Training Modal / Viewport */}
      {activeExerciseDef && (
        <ExerciseContainer
          exercise={activeExerciseDef}
          soundEnabled={appData.preferences.soundEnabled}
          soundVolume={appData.preferences.soundVolume}
          onSoundToggle={handleToggleSound}
          onExit={() => setActiveExerciseId(null)}
          onSessionComplete={handleSessionComplete}
        >
          {({ handleExerciseFinished, soundEnabled, soundVolume }) => {
            const challenge = activeExerciseDef ? getLevelChallengeById(activeExerciseDef.id) : null;
            const baseId = challenge ? challenge.exerciseId : activeExerciseDef.id;
            const difficulty = challenge ? challenge.difficulty : appData.preferences.defaultDifficulty;

            switch (baseId) {
              case 'digit-span':
                return (
                  <DigitSpanExercise
                    difficulty={difficulty}
                    soundEnabled={soundEnabled}
                    soundVolume={soundVolume}
                    onFinish={handleExerciseFinished}
                  />
                );
              case 'sequence-memory':
                return (
                  <SequenceMemoryExercise
                    difficulty={difficulty}
                    soundEnabled={soundEnabled}
                    soundVolume={soundVolume}
                    onFinish={handleExerciseFinished}
                  />
                );
              case 'n-back':
                return (
                  <NBackExercise
                    difficulty={difficulty}
                    soundEnabled={soundEnabled}
                    soundVolume={soundVolume}
                    onFinish={handleExerciseFinished}
                  />
                );
              case 'visual-matrix':
                return (
                  <VisualMatrixExercise
                    difficulty={difficulty}
                    soundEnabled={soundEnabled}
                    soundVolume={soundVolume}
                    onFinish={handleExerciseFinished}
                  />
                );
              case 'word-recall':
                return (
                  <WordRecallExercise
                    difficulty={difficulty}
                    soundEnabled={soundEnabled}
                    soundVolume={soundVolume}
                    onFinish={handleExerciseFinished}
                  />
                );
              case 'paired-associates':
                return (
                  <PairedAssociateExercise
                    difficulty={difficulty}
                    soundEnabled={soundEnabled}
                    soundVolume={soundVolume}
                    onFinish={handleExerciseFinished}
                  />
                );
              case 'pattern-recall':
                return (
                  <PatternRecallExercise
                    difficulty={difficulty}
                    soundEnabled={soundEnabled}
                    soundVolume={soundVolume}
                    onFinish={handleExerciseFinished}
                  />
                );
              case 'running-memory':
                return (
                  <RunningMemoryExercise
                    difficulty={difficulty}
                    soundEnabled={soundEnabled}
                    soundVolume={soundVolume}
                    onFinish={handleExerciseFinished}
                  />
                );
              case 'delayed-recall':
                return (
                  <DelayedRecallExercise
                    difficulty={difficulty}
                    soundEnabled={soundEnabled}
                    soundVolume={soundVolume}
                    onFinish={handleExerciseFinished}
                  />
                );
              case 'attention-target':
                return (
                  <AttentionDetectionExercise
                    difficulty={difficulty}
                    soundEnabled={soundEnabled}
                    soundVolume={soundVolume}
                    onFinish={handleExerciseFinished}
                  />
                );
              default:
                return (
                  <div className="text-center text-white">
                    <p>Exercise under calibration.</p>
                  </div>
                );
            }
          }}
        </ExerciseContainer>
      )}
    </div>
  );
}
