import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  FlaskConical,
  Users,
  MoreHorizontal,
  ShieldAlert,
  FileText,
  Lightbulb,
  Bookmark,
  Clock,
  Info,
  X,
  Network,
} from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const primaryItems = [
    { to: '/research', label: 'Overview', icon: <Compass size={22} />, end: true },
    { to: '/research/neuro-brain', label: 'Neuro Brain', icon: <Network size={22} /> },
    { to: '/research/studies', label: 'Studies', icon: <BookOpen size={22} /> },
    { to: '/research/experiments', label: 'Experiments', icon: <FlaskConical size={22} /> },
  ];

  const secondaryItems = [
    { to: '/research/personas', label: 'Personas', icon: <Users size={20} /> },
    { to: '/research/tests', label: 'Behavioral Tests', icon: <ShieldAlert size={20} /> },
    { to: '/research/notes', label: 'Research Notes', icon: <FileText size={20} /> },
    { to: '/research/findings', label: 'Findings', icon: <Lightbulb size={20} /> },
    { to: '/research/sources', label: 'Sources', icon: <Bookmark size={20} /> },
    { to: '/research/timeline', label: 'Timeline', icon: <Clock size={20} /> },
    { to: '/research/about', label: 'About Research', icon: <Info size={20} /> },
  ];

  return (
    <>
      {/* iOS-inspired Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(var(--mobile-nav-height) + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          backgroundColor: 'var(--surface-translucent)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 50,
        }}
      >
        {primaryItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }: { isActive: boolean }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '44px',
              textDecoration: 'none',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              transition: 'color var(--transition-fast)',
            })}
          >
            <span>{item.icon}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 500, marginTop: '2px' }}>{item.label}</span>
          </NavLink>
        ))}

        {/* More Sheet Trigger */}
        <button
          onClick={() => setSheetOpen(true)}
          aria-label="More navigation items"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '44px',
            color: sheetOpen ? 'var(--accent-primary)' : 'var(--text-tertiary)',
            cursor: 'pointer',
          }}
        >
          <MoreHorizontal size={22} />
          <span style={{ fontSize: '0.65rem', fontWeight: 500, marginTop: '2px' }}>More</span>
        </button>
      </nav>

      {/* iOS Modal Sheet for Secondary Items */}
      {sheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Additional research sections"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
          onClick={() => setSheetOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderTopLeftRadius: 'var(--radius-xl)',
              borderTopRightRadius: 'var(--radius-xl)',
              padding: '1.25rem 1.5rem',
              paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
              borderTop: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            {/* Sheet Handle */}
            <div
              style={{
                width: '36px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: 'var(--border-medium)',
                margin: '0 auto 1.25rem',
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Research Modules
              </h3>
              <button
                onClick={() => setSheetOpen(false)}
                aria-label="Close sheet"
                style={{
                  padding: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {secondaryItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSheetOpen(false)}
                  style={({ isActive }: { isActive: boolean }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--accent-subtle)' : 'var(--surface-secondary)',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  })}
                >
                  <span style={{ color: 'var(--accent-primary)' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

