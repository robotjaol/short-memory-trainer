import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  BarChart2, 
  History, 
  Settings 
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'library', label: 'Train', icon: Layers },
    { id: 'analytics', label: 'Stats', icon: BarChart2 },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Config', icon: Settings },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 md:hidden px-2 py-1.5 transition-colors duration-200"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 touch-manipulation min-h-[46px] ${
                isActive 
                  ? 'text-black dark:text-white font-semibold' 
                  : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-lg transition-transform ${
                isActive ? 'bg-neutral-100 dark:bg-neutral-900 scale-105' : ''
              }`}>
                <Icon className="w-4 h-4 shrink-0" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-full">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-black dark:bg-white mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
