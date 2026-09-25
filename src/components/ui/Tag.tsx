import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'secondary';
  size?: 'sm' | 'md';
  onClick?: () => void;
  active?: boolean;
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  onClick,
  active = false,
}) => {
  const isClickable = !!onClick;

  const getBackground = () => {
    if (active) return 'var(--accent-primary)';
    if (variant === 'accent') return 'var(--accent-subtle)';
    if (variant === 'secondary') return 'var(--surface-tertiary)';
    return 'var(--surface-secondary)';
  };

  const getColor = () => {
    if (active) return '#FFFFFF';
    if (variant === 'accent') return 'var(--accent-primary)';
    return 'var(--text-secondary)';
  };

  const getBorder = () => {
    if (active) return '1px solid var(--accent-primary)';
    if (variant === 'accent') return '1px solid var(--accent-border)';
    return '1px solid var(--border-subtle)';
  };

  return (
    <span
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '0.2rem 0.6rem' : '0.35rem 0.8rem',
        borderRadius: 'var(--radius-full)',
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
        fontWeight: 500,
        backgroundColor: getBackground(),
        color: getColor(),
        border: getBorder(),
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
};
