import React from 'react';
import { RiskLevel } from '../../data/types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'sm' }) => {
  const config = {
    low: {
      label: 'Low Risk',
      bg: 'var(--status-stable-bg)',
      color: 'var(--status-stable)',
      border: 'rgba(0, 113, 227, 0.2)',
    },
    medium: {
      label: 'Medium Risk',
      bg: 'var(--status-warning-bg)',
      color: 'var(--status-warning)',
      border: 'rgba(217, 119, 6, 0.2)',
    },
    high: {
      label: 'High Risk',
      bg: 'rgba(249, 115, 22, 0.10)',
      color: '#EA580C',
      border: 'rgba(249, 115, 22, 0.2)',
    },
    critical: {
      label: 'Critical Risk',
      bg: 'var(--status-critical-bg)',
      color: 'var(--status-critical)',
      border: 'rgba(220, 38, 38, 0.2)',
    },
  }[level];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.color,
        }}
      />
      {config.label}
    </span>
  );
};
