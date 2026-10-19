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

  // Global cursor detector for screen left edge (x <= 16px)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only on desktop (screen width >= 768px)
      if (window.innerWidth < 768) return;

      if (e.clientX <= 16) {
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

      {/* Desktop Left-Edge Hover Detection Zone (invisible full height strip) */}
      <div 
        onMouseEnter={handleMouseEnter}
        className="hidden md:block fixed top-0 bottom-0 left-0 w-4 z-30 pointer-events-auto cursor-pointer"
        aria-hidden="true"
      />

      {/* Discreet floating hover tab when sidebar is hidden on desktop */}
      {!isExpandedOnDesktop && (
        <div
          onMouseEnter={handleMouseEnter}
          className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 items-center justify-center w-5 h-14 bg-white/95 dark:bg-black/95 text-neutral-400 hover:text-black dark:hover:text-white border-y border-r border-neutral-200 dark:border-neutral-800 rounded-r-lg shadow-xs cursor-pointer transition-colors duration-150 backdrop-blur-xs"
          title="Hover or move cursor here to expand navigation"
          aria-label="Expand navigation"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      )}

      {/* 
        Sidebar Container
        - Mobile: Slide-in drawer (w-72), controlled by isOpen
        - Desktop: True Auto-Hide slide-in / slide-out.
          When hidden (!isExpandedOnDesktop): slides completely off-screen (-translate-x-full),
          leaving zero overlapping logo or cut-off elements on screen.
          When expanded (isExpandedOnDesktop): slides in to w-64 with full brand, navigation, and controls.
      */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${
          isExpandedOnDesktop 
            ? 'md:translate-x-0 md:shadow-2xl md:dark:shadow-neutral-950/80' 
            : 'md:-translate-x-full md:shadow-none'
        }`}
      >
        {/* Top: Brand Header & Navigation */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header Bar: Pristine brand lockup with shrink-0 logo so it NEVER clips */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-200 dark:border-neutral-800 h-16 shrink-0 w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className="w-9 h-9 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs shrink-0 cursor-pointer"
                onClick={() => onTabChange('dashboard')}
                title="Cognitive Memory Lab"
              >
                <BrainCircuit className="w-5 h-5 shrink-0" />
              </div>
              
              <div className="overflow-hidden whitespace-nowrap min-w-0">
                <span className="font-bold text-sm tracking-tight text-black dark:text-white block font-sans truncate">
                  Memory Lab
                </span>
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 block -mt-0.5 truncate">
                  Cognitive System
                </span>
              </div>
            </div>

            {/* Desktop Pin / Unpin button or Mobile Close button */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Desktop Pin toggle */}
              <button
                onClick={onTogglePin}
                className="hidden md:flex p-1.5 rounded-md text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
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

          {/* Autohide Mode Hint Banner (shown when auto-hide is active and expanded) */}
          {!isPinned && (
            <div className="hidden md:flex items-center justify-between px-4 py-1.5 bg-neutral-100/70 dark:bg-neutral-900/60 border-b border-neutral-200/60 dark:border-neutral-800/60 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Auto-hide active</span>
              </span>
              <span className="text-[9px] opacity-75">Cursor exit closes</span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto overflow-x-hidden flex-1">
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="truncate text-left font-sans">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Widgets: Streak & Daily Target */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 shrink-0 space-y-2.5">
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
        </div>
      </aside>
    </>
  );
};
