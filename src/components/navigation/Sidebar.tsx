import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  FlaskConical,
  Users,
  ShieldAlert,
  FileText,
  Lightbulb,
  Bookmark,
  Clock,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Network,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  end?: boolean;
}

const primaryNavItems: NavItem[] = [
  { to: '/research/neuro-brain', label: 'Neuro Brain', icon: <Network size={18} /> },
  { to: '/research', label: 'Overview', icon: <Compass size={18} />, end: true },
  { to: '/research/studies', label: 'Studies', icon: <BookOpen size={18} /> },
  { to: '/research/experiments', label: 'Experiments', icon: <FlaskConical size={18} /> },
  { to: '/research/personas', label: 'Personas', icon: <Users size={18} /> },
  { to: '/research/tests', label: 'Behavioral Tests', icon: <ShieldAlert size={18} /> },
];

const secondaryNavItems: NavItem[] = [
  { to: '/research/notes', label: 'Research Notes', icon: <FileText size={18} /> },
  { to: '/research/findings', label: 'Findings', icon: <Lightbulb size={18} /> },
  { to: '/research/sources', label: 'Sources', icon: <Bookmark size={18} /> },
  { to: '/research/timeline', label: 'Timeline', icon: <Clock size={18} /> },
  { to: '/research/about', label: 'About Research', icon: <Info size={18} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const sidebarWidth = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  return (
    <aside
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100vh',
        overflowY: 'auto',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--surface-translucent)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width var(--transition-normal), min-width var(--transition-normal)',
        zIndex: 40,
        userSelect: 'none',
      }}
      aria-label="Research Navigation"
    >
      {/* Header / Brand */}
      <div>
        <div
          style={{
            height: 'var(--topbar-height)',
            padding: collapsed ? '0 1.25rem' : '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {!collapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#FFFFFF',
                  }}
                >
                  <ShieldCheck size={15} />
                </span>
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: 'var(--text-primary)',
                  }}
                >
                  CAGEBREAK
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.02em',
                  marginTop: '0.1rem',
                }}
              >
                RESEARCH ARCHIVE
              </span>
            </div>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-primary)',
                color: '#FFFFFF',
              }}
              title="CAGEBREAK Research Archive"
            >
              <ShieldCheck size={16} />
            </span>
          )}

          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              display: collapsed ? 'none' : 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-tertiary)',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Primary Nav List */}
        <div style={{ padding: '1rem 0.75rem' }}>
          {!collapsed && (
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-tertiary)',
                padding: '0 0.75rem 0.5rem',
              }}
            >
              Archive
            </div>
          )}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={collapsed ? item.label : undefined}
                style={({ isActive }: { isActive: boolean }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.65rem' : '0.6rem 0.75rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                  transition: 'background var(--transition-fast), color var(--transition-fast)',
                  textDecoration: 'none',
                })}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Secondary Nav List */}
          <div style={{ marginTop: '1.25rem' }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-tertiary)',
                  padding: '0 0.75rem 0.5rem',
                }}
              >
                Documentation
              </div>
            )}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {secondaryNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  style={({ isActive }: { isActive: boolean }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: collapsed ? '0.65rem' : '0.6rem 0.75rem',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                    transition: 'background var(--transition-fast), color var(--transition-fast)',
                    textDecoration: 'none',
                  })}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer / Expand button when collapsed */}
      {collapsed && (
        <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--surface-secondary)',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};

