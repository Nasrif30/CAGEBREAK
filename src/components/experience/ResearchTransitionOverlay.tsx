import React, { useEffect, useState } from 'react';

interface ResearchTransitionOverlayProps {
  onTransitionComplete: () => void;
}

export const ResearchTransitionOverlay: React.FC<ResearchTransitionOverlayProps> = ({
  onTransitionComplete,
}) => {
  const [phase, setPhase] = useState<'emerge' | 'resolve' | 'done'>('emerge');

  useEffect(() => {
    // Step 1: Emerge with soft blur
    const t1 = setTimeout(() => {
      setPhase('resolve');
    }, 700);

    // Step 2: Resolve and complete transition
    const t2 = setTimeout(() => {
      setPhase('done');
      onTransitionComplete();
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onTransitionComplete]);

  if (phase === 'done') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Entering CAGEBREAK Research Archive"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: phase === 'resolve' ? 0 : 1,
        filter: phase === 'emerge' ? 'blur(10px)' : 'blur(0px)',
        transform: phase === 'resolve' ? 'translateY(-14px)' : 'translateY(0)',
        transition: 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), filter 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0.6rem',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: 'var(--accent-primary)',
          }}
        >
          Analysis Ready
        </span>

        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            color: 'var(--text-primary)',
          }}
        >
          CAGEBREAK
        </h1>

        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
          }}
        >
          RESEARCH ARCHIVE
        </span>

        <div
          style={{
            marginTop: '1.25rem',
            width: '36px',
            height: '2px',
            backgroundColor: 'var(--accent-primary)',
            borderRadius: '1px',
          }}
        />
      </div>
    </div>
  );
};
