import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle';
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  style,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    background:
      variant === 'elevated'
        ? 'var(--surface-elevated)'
        : variant === 'subtle'
        ? 'var(--surface-secondary)'
        : 'var(--surface-translucent)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: variant === 'elevated' ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
    padding: '1.5rem',
    transition: 'transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal), background var(--transition-normal)',
    cursor: interactive ? 'pointer' : 'default',
    ...style,
  };

  return (
    <div
      className={`glass-card ${interactive ? 'glass-card-interactive' : ''} ${className}`}
      style={baseStyles}
      {...props}
    >
      {children}
    </div>
  );
};
