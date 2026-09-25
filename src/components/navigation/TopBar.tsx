import React from 'react';
import { Search, Sun, Moon, Sparkles } from 'lucide-react';

interface TopBarProps {
  onOpenSearch: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onTriggerExperienceReveal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSearch,
  isDark,
  onToggleTheme,
  onTriggerExperienceReveal,
}) => {
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--surface-translucent)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
      }}
    >
      {/* Left: Subtle Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            Research Archive
          </span>
        </div>
      </div>

      {/* Right: Search, DEV-Gated 3D Simulation & Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Quick Search Spotlight Button */}
        <button
          onClick={onOpenSearch}
          aria-label="Open command search"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.4rem 0.85rem',
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            transition: 'border-color var(--transition-fast), background var(--transition-fast)',
          }}
        >
          <Search size={14} style={{ color: 'var(--text-secondary)' }} />
          <span>Search archive...</span>
          <kbd
            style={{
              padding: '0.1rem 0.35rem',
              backgroundColor: 'var(--surface-tertiary)',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </button>

        {/* 3D Experience Simulation Button - Strictly Dev Gated */}
        {import.meta.env.DEV && onTriggerExperienceReveal && (
          <button
            onClick={onTriggerExperienceReveal}
            title="Preview 3D Complete -> Research Reveal (Dev Only)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.775rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
            <span className="hide-on-mobile">Simulate Reveal</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'color var(--transition-fast)',
          }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
