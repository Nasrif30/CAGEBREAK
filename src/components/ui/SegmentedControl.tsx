import React from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px',
        backgroundColor: 'var(--surface-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        gap: '2px',
        userSelect: 'none',
      }}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: size === 'sm' ? '0.25rem 0.6rem' : '0.4rem 0.85rem',
              fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
              fontWeight: isSelected ? 600 : 500,
              color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: isSelected ? 'var(--surface-primary)' : 'transparent',
              borderRadius: 'calc(var(--radius-sm) - 2px)',
              boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
