import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { StoredAppDataV1 } from '../../types/storage';
import { useAutohideNav } from '../../hooks/useAutohideNav';

interface AppLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  data: StoredAppDataV1;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onStartTrainingClick: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onTabChange,
  data,
  onToggleTheme,
  onToggleSound,
  onStartTrainingClick,
  children
}) => {
  // Mobile drawer open state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Desktop sidebar pinned state (false = auto-hide on hover, true = permanently expanded)
  const [isPinned, setIsPinned] = useState(false);

  // Top header autohide hook
  const { isHidden } = useAutohideNav(50);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black flex flex-col md:flex-row text-neutral-900 dark:text-neutral-100 antialiased font-sans transition-colors duration-200">
      {/* Auto-Hide Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        data={data}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isPinned={isPinned}
        onTogglePin={() => setIsPinned(prev => !prev)}
      />

      {/* Main Viewport Container */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isPinned ? 'md:pl-64' : 'md:pl-0'
        }`}
      >
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          preferences={data.preferences}
          isHidden={isHidden}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onToggleTheme={onToggleTheme}
          onToggleSound={onToggleSound}
          onStartTrainingClick={onStartTrainingClick}
          isSidebarPinned={isPinned}
          onTogglePinSidebar={() => setIsPinned(prev => !prev)}
        />

        {/* Page Content: Responsive padding for desktop & extra bottom pad for mobile nav */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible on mobile/tablet < 768px) */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </div>
  );
};
