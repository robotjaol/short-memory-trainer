import React, { useState, useRef } from 'react';
import { UserPreferences, StoredAppDataV1 } from '../../types/storage';
import { StorageService } from '../../lib/storage/localStorage';
import { soundManager } from '../../lib/sound';
import { SpotlightBox } from '../../components/ui/SpotlightBox';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle,
  Play,
  Sparkles
} from 'lucide-react';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onDataImported: (data: StoredAppDataV1) => void;
  onDataReset: () => void;
  onReplayLoadingScreen?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  onDataImported,
  onDataReset,
  onReplayLoadingScreen
}) => {
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    onUpdatePreferences({ theme });
  };

  const handleTestSound = () => {
    soundManager.playCorrect(preferences.soundVolume);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = StorageService.importFromJson(content);
      if (result.success && result.data) {
        setImportMessage({ type: 'success', text: result.message });
        onDataImported(result.data);
      } else {
        setImportMessage({ type: 'error', text: result.message });
      }
    };
    reader.onerror = () => {
      setImportMessage({ type: 'error', text: 'Failed to read backup file.' });
    };
    reader.readAsText(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Title */}
      <div className="pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
          Preferences & Calibration
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Customize your sensory environment, autohide layout, and local data persistence.
        </p>
      </div>

      {/* Import message alert */}
      {importMessage && (
        <div className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between border ${
          importMessage.type === 'success' 
            ? 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-black dark:text-white' 
            : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-black dark:text-white'
        }`}>
          <span>{importMessage.text}</span>
          <button onClick={() => setImportMessage(null)} className="underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Theme & Display (Pure White & Black) */}
      <SpotlightBox className="p-6 space-y-4" interactive={false}>
        <div>
          <h2 className="text-sm font-semibold text-black dark:text-white">
            Monochrome Theme
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Switch between stark black, pure white, or automatic system appearance.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
              preferences.theme === 'light'
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                : 'bg-white dark:bg-black text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
              preferences.theme === 'dark'
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                : 'bg-white dark:bg-black text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => handleThemeChange('system')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
              preferences.theme === 'system'
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                : 'bg-white dark:bg-black text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>System</span>
          </button>
        </div>
      </SpotlightBox>

      {/* Animation & Loading Screen Replay */}
      <SpotlightBox className="p-6 space-y-4" interactive={false}>
        <div>
          <h2 className="text-sm font-semibold text-black dark:text-white">
            Animation & Interface FX
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            End-to-end fluid cursor physics, autohide navbar, and box illumination.
          </p>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-850">
          <div>
            <span className="text-xs font-medium text-black dark:text-white block">Reduced Motion</span>
            <span className="text-[11px] text-neutral-500">Disable cursor trailing physics and animations</span>
          </div>
          <button
            onClick={() => onUpdatePreferences({ reducedMotion: !preferences.reducedMotion })}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              preferences.reducedMotion
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800'
            }`}
          >
            {preferences.reducedMotion ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {onReplayLoadingScreen && (
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs font-medium text-black dark:text-white block">Loading Screen Calibration</span>
              <span className="text-[11px] text-neutral-500">Replay the full-screen cognitive startup sequence</span>
            </div>
            <button
              onClick={onReplayLoadingScreen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-black dark:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-800"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preview Screen</span>
            </button>
          </div>
        )}
      </SpotlightBox>

      {/* Audio Cues */}
      <SpotlightBox className="p-6 space-y-4" interactive={false}>
        <div>
          <h2 className="text-sm font-semibold text-black dark:text-white">
            Audio Synthesizer Cues
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Web Audio API harmonic feedback tones.
          </p>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-850">
          <div>
            <span className="text-xs font-medium text-black dark:text-white block">Sound Effects</span>
            <span className="text-[11px] text-neutral-500">Enable or disable all acoustic signals</span>
          </div>
          <button
            onClick={() => onUpdatePreferences({ soundEnabled: !preferences.soundEnabled })}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
              preferences.soundEnabled
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
            }`}
          >
            {preferences.soundEnabled ? (
              <span className="flex items-center gap-1.5"><Volume2 className="w-4 h-4" /> Enabled</span>
            ) : (
              <span className="flex items-center gap-1.5"><VolumeX className="w-4 h-4" /> Muted</span>
            )}
          </button>
        </div>

        {preferences.soundEnabled && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Test Tone Generation</span>
            <button
              onClick={handleTestSound}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black dark:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Play Sample Chime</span>
            </button>
          </div>
        )}
      </SpotlightBox>

      {/* Training Defaults & Targets */}
      <SpotlightBox className="p-6 space-y-4" interactive={false}>
        <div>
          <h2 className="text-sm font-semibold text-black dark:text-white">
            Training Parameters
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Default difficulty level and daily session targets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-black dark:text-white block mb-1.5">
              Default Difficulty
            </label>
            <select
              value={preferences.defaultDifficulty}
              onChange={e => onUpdatePreferences({ defaultDifficulty: e.target.value as any })}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs text-black dark:text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="adaptive">Adaptive Progression</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-black dark:text-white block mb-1.5">
              Daily Training Target (Sessions / Day)
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={preferences.dailyTargetSessions}
              onChange={e => onUpdatePreferences({ dailyTargetSessions: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-black dark:text-white"
            />
          </div>
        </div>
      </SpotlightBox>

      {/* Local Storage & Backup */}
      <SpotlightBox className="p-6 space-y-4" interactive={false}>
        <div>
          <h2 className="text-sm font-semibold text-black dark:text-white">
            Data Portability & Backup
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Export your entire training history as JSON or restore from a previous backup file.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => StorageService.exportToJson()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-black dark:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Data (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-black dark:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import Data (JSON)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Training Data</span>
          </button>
        </div>
      </SpotlightBox>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="max-w-sm w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl shadow-2xl text-center">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 border border-neutral-200 dark:border-neutral-800">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-black dark:text-white mb-2">
              Reset All Training Data?
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              This will permanently delete all session logs, streaks, and personal records stored locally in your browser. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onDataReset();
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-black dark:bg-white dark:text-black rounded-lg transition-colors"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
