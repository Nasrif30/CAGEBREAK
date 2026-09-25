import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/navigation/Sidebar';
import { TopBar } from '../components/navigation/TopBar';
import { MobileNavigation } from '../components/navigation/MobileNavigation';
import { CommandPalette } from '../components/search/CommandPalette';
import { ResearchTransitionOverlay } from '../components/experience/ResearchTransitionOverlay';

interface ResearchShellProps {
  children?: React.ReactNode;
}

export const ResearchShell: React.FC<ResearchShellProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cagebreak-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('cagebreak-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('cagebreak-theme', 'light');
    }
  }, [isDark]);

  // Global keyboard shortcut for Spotlight (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* 3D Experience Reveal Transition (Dev Simulation) */}
      {isRevealing && (
        <ResearchTransitionOverlay
          onTransitionComplete={() => setIsRevealing(false)}
        />
      )}

      {/* Desktop Sidebar (Hidden on mobile screens) */}
      <div className="desktop-sidebar-wrapper">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        <TopBar
          onOpenSearch={() => setSearchOpen(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          onTriggerExperienceReveal={() => setIsRevealing(true)}
        />

        <main
          style={{
            flex: 1,
            padding: '2rem 1.5rem',
            paddingBottom: 'calc(var(--mobile-nav-height) + 2rem + env(safe-area-inset-bottom, 0px))',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible on mobile/tablet) */}
      <div className="mobile-nav-wrapper">
        <MobileNavigation />
      </div>

      {/* Spotlight Command Search Modal */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Responsive layout styles */}
      <style>{`
        @media (max-width: 1024px) {
          .desktop-sidebar-wrapper {
            display: none !important;
          }
        }
        @media (min-width: 1025px) {
          .mobile-nav-wrapper {
            display: none !important;
          }
          main {
            padding-bottom: 3rem !important;
          }
        }
        @media (max-width: 640px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
