import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  BarChart2, 
  History, 
  Settings, 
  Flame, 
  BrainCircuit,
  Target,
  Pin,
  PinOff,
  ChevronRight,
  X
} from 'lucide-react';
import { StoredAppDataV1 } from '../../types/storage';
import { getTodayDateString } from '../../lib/dates/streak';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  data: StoredAppDataV1;
  isOpen: boolean; // Mobile drawer open state
  onClose: () => void; // Mobile drawer close handler
  isPinned: boolean;
  onTogglePin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  data,
  isOpen,
  onClose,
  isPinned,
  onTogglePin
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const leaveTimerRef = useRef<number | null>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Training Library', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'history', label: 'Session History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const todayStr = getTodayDateString();
  const todaySessions = data.sessions.filter(s => s.dateString === todayStr).length;
  const targetSessions = data.preferences.dailyTargetSessions || 3;

  // Desktop expansion state: expanded if pinned OR hovered
  const isExpandedOnDesktop = isPinned || isHovered;

  // Handle mouse enter on sidebar area
  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsHovered(true);
  };

  // Handle mouse leave with small debounce to prevent accidental flicker
  const handleMouseLeave = () => {
    if (isPinned) return;
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = window.setTimeout(() => {
      setIsHovered(false);
    }, 180);
  };

  // Global cursor detector for screen left edge (x <= 14px)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only on desktop (screen width >= 768px)
      if (window.innerWidth < 768) return;

      if (e.clientX <= 14) {
        handleMouseEnter();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (leaveTimerRef.current) {
        window.clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Desktop Left-Edge Hover Detection Zone */}
      <div 
        onMouseEnter={handleMouseEnter}
        className="hidden md:block fixed top-0 bottom-0 left-0 w-3 z-30 pointer-events-auto cursor-e-resize"
        aria-hidden="true"
      />

      {/* 
        Sidebar Container
        - Mobile: Slide-in drawer (0 to w-72), controlled by isOpen
        - Desktop: Auto-hiding rail. 
          When collapsed: w-16, clean icon column.
          When hovered or pinned: w-64, full interactive panel with shadow-2xl.
      */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          // Mobile classes
          isOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${
          // Desktop classes
          isExpandedOnDesktop 
            ? 'md:w-64 md:shadow-2xl md:dark:shadow-neutral-950/80' 
            : 'md:w-16 md:shadow-xs'
        }`}
      >
        {/* Top: Brand Header & Navigation */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-4 border-b border-neutral-200 dark:border-neutral-800 h-16 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div 
                className="w-9 h-9 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs shrink-0 cursor-pointer"
                onClick={() => onTabChange('dashboard')}
                title="Cognitive Memory Lab"
              >
                <BrainCircuit className="w-5 h-5" />
              </div>
              
              {/* Full Brand name: visible when expanded on desktop or on mobile drawer */}
              <div className={`transition-opacity duration-200 overflow-hidden whitespace-nowrap ${
                isExpandedOnDesktop ? 'opacity-100' : 'opacity-0 md:hidden'
              }`}>
                <span className="font-bold text-sm tracking-tight text-black dark:text-white block font-sans">
                  Memory Lab
                </span>
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 block -mt-0.5">
                  Cognitive System
                </span>
              </div>
            </div>

            {/* Desktop Pin / Unpin button or Mobile Close button */}
            <div className="flex items-center gap-1">
              {/* Desktop Pin toggle */}
              <button
                onClick={onTogglePin}
                className={`hidden md:flex p-1.5 rounded-md text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors ${
                  isExpandedOnDesktop ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                title={isPinned ? 'Unpin navbar (enable auto-hide)' : 'Pin navbar open'}
                aria-label={isPinned ? 'Unpin navbar' : 'Pin navbar'}
              >
                {isPinned ? (
                  <Pin className="w-4 h-4 fill-current text-black dark:text-white" />
                ) : (
                  <PinOff className="w-4 h-4" />
                )}
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Autohide Mode Hint Banner (only when expanded on desktop and unpinned) */}
          {isExpandedOnDesktop && !isPinned && (
            <div className="hidden md:flex items-center justify-between px-4 py-1.5 bg-neutral-100/70 dark:bg-neutral-900/60 border-b border-neutral-200/60 dark:border-neutral-800/60 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Auto-hide active</span>
              </span>
              <span className="text-[9px] opacity-75">Cursor exit closes</span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-2 md:p-2.5 space-y-1.5 overflow-y-auto overflow-x-hidden flex-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  title={item.label}
                  className={`w-full flex items-center rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                    isExpandedOnDesktop ? 'px-3 py-2.5 gap-3' : 'justify-center p-2.5'
                  } ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  
                  {/* Label - visible when expanded */}
                  <span className={`truncate text-left transition-opacity duration-200 ${
                    isExpandedOnDesktop ? 'opacity-100' : 'opacity-0 md:hidden'
                  }`}>
                    {item.label}
                  </span>

                  {/* Active Indicator on collapsed view */}
                  {!isExpandedOnDesktop && isActive && (
                    <span className="hidden md:block absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                  )}

                  {/* Floating Tooltip when in collapsed icon mode */}
                  {!isExpandedOnDesktop && (
                    <span className="hidden md:group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black text-[11px] font-sans font-medium rounded-md shadow-lg z-50 whitespace-nowrap pointer-events-none items-center gap-1">
                      {item.label}
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Widgets: Streak & Daily Target */}
        <div className={`p-2.5 md:p-3 border-t border-neutral-200 dark:border-neutral-800 shrink-0 transition-all ${
          isExpandedOnDesktop ? 'space-y-2.5' : 'space-y-2'
        }`}>
          {/* Expanded View of Streak & Target */}
          {isExpandedOnDesktop ? (
            <>
              {/* Quick Streak Widget */}
              <div className="p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span className="text-neutral-600 dark:text-neutral-400">Streak:</span>
                </div>
                <span className="font-bold text-black dark:text-white tabular-nums">
                  {data.streak.currentStreak} {data.streak.currentStreak === 1 ? 'day' : 'days'}
                </span>
              </div>

              {/* Daily Goal Status */}
              <div className="p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-mono">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                    <span>Today's Target</span>
                  </span>
                  <span className="font-semibold text-black dark:text-white tabular-nums">
                    {todaySessions}/{targetSessions}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-black dark:bg-white h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (todaySessions / targetSessions) * 100)}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Collapsed View (Desktop): Compact icon indicators with tooltips */
            <div className="hidden md:flex flex-col items-center gap-2 py-1">
              {/* Streak icon */}
              <div 
                className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center cursor-pointer group relative"
                title={`Streak: ${data.streak.currentStreak} days`}
              >
                <Flame className="w-4 h-4 text-black dark:text-white" />
                <span className="absolute -top-1 -right-1 bg-black text-white dark:bg-white dark:text-black text-[9px] font-mono px-1 rounded-full font-bold">
                  {data.streak.currentStreak}
                </span>

                {/* Tooltip on hover */}
                <span className="hidden group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black text-[11px] font-mono rounded-md shadow-lg z-50 whitespace-nowrap pointer-events-none">
                  Streak: {data.streak.currentStreak}d
                </span>
              </div>

              {/* Daily Goal ring/icon */}
              <div 
                className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center cursor-pointer group relative"
                title={`Daily Target: ${todaySessions}/${targetSessions}`}
              >
                <Target className="w-4 h-4 text-black dark:text-white" />
                <span className="absolute -top-1 -right-1 bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black text-[9px] font-mono px-1 rounded-full font-bold">
                  {todaySessions}
                </span>

                {/* Tooltip on hover */}
                <span className="hidden group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black text-[11px] font-mono rounded-md shadow-lg z-50 whitespace-nowrap pointer-events-none">
                  Target: {todaySessions}/{targetSessions}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
