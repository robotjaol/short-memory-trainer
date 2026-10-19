import React from 'react';
import { Menu, Sun, Moon, Volume2, VolumeX, Play, PanelLeft, PanelLeftClose } from 'lucide-react';
import { UserPreferences } from '../../types/storage';

interface HeaderProps {
  activeTab: string;
  preferences: UserPreferences;
  isHidden?: boolean;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onStartTrainingClick: () => void;
  isSidebarPinned?: boolean;
  onTogglePinSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  preferences,
  isHidden = false,
  onToggleSidebar,
  onToggleTheme,
  onToggleSound,
  onStartTrainingClick,
  isSidebarPinned = false,
  onTogglePinSidebar
}) => {
  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    library: 'Training Library',
    analytics: 'Performance Analytics',
    history: 'Session History',
    settings: 'Settings'
  };

  const isDark = preferences.theme === 'dark' || (
    preferences.theme === 'system' && 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  return (
    <>
      {/* Top Peek Hover Zone when hidden */}
      {isHidden && (
        <div 
          className="fixed top-0 left-0 right-0 h-4 z-40 cursor-pointer pointer-events-auto"
          aria-hidden="true"
        />
      )}

      <header
        className={`sticky top-0 z-30 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-3.5 sm:px-6 flex items-center justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isHidden ? '-translate-y-full opacity-0 shadow-none pointer-events-none' : 'translate-y-0 opacity-100 shadow-2xs pointer-events-auto'
        }`}
      >
        {/* Left: Mobile hamburger & breadcrumb / Desktop pin toggle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-1 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded-lg md:hidden transition-colors touch-manipulation"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop quick pin/collapse trigger */}
          {onTogglePinSidebar && (
            <button
              onClick={onTogglePinSidebar}
              className="hidden md:flex p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              title={isSidebarPinned ? 'Enable auto-hide left sidebar' : 'Pin left sidebar expanded'}
              aria-label={isSidebarPinned ? 'Enable auto-hide left sidebar' : 'Pin left sidebar'}
            >
              {isSidebarPinned ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeft className="w-4 h-4" />
              )}
            </button>
          )}

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 dark:text-neutral-500 truncate">
            <span className="hidden sm:inline">Cognitive</span>
            <span className="hidden sm:inline">/</span>
            <span className="font-sans font-semibold text-sm text-black dark:text-white truncate">
              {pageTitles[activeTab] || 'Lab'}
            </span>
          </div>
        </div>

        {/* Right: Quick actions (Pure Monochrome White & Black) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Desktop Autohide status pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isSidebarPinned ? 'Sidebar Pinned' : 'Left Nav Auto-Hide'}</span>
          </div>

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 touch-manipulation"
            title={preferences.soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            aria-label={preferences.soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {preferences.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 touch-manipulation"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Direct Start CTA */}
          {activeTab !== 'library' && (
            <button
              onClick={onStartTrainingClick}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-2xs transition-all active:scale-95 touch-manipulation"
            >
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              <span>Train</span>
            </button>
          )}
        </div>
      </header>
    </>
  );
};
