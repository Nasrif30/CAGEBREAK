import React from 'react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  trend,
  icon,
  highlight = false,
}) => {
  return (
    <GlassCard
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 1.5rem',
        borderLeft: highlight ? '3px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-tertiary)',
          }}
        >
          {label}
        </span>
        {icon && (
          <div
            style={{
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.8,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <span
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            fontFeatureSettings: '"tnum"',
          }}
        >
          {value}
        </span>
        {trend && (
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--status-stable)',
            }}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <span
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </span>
      )}
    </GlassCard>
  );
};
