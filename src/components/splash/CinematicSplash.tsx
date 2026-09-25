import React, { useEffect, useCallback } from 'react';
import { ChevronDown, FastForward } from 'lucide-react';

interface CinematicSplashProps {
  onBegin: () => void;
  onSkipToResearch?: () => void;
}

export const CinematicSplash: React.FC<CinematicSplashProps> = ({
  onBegin,
  onSkipToResearch,
}) => {
  // Listen for wheel/scroll, keydown, or touch gestures to begin
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.deltaY > 10) {
        onBegin();
      }
    },
    [onBegin]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (['ArrowDown', 'Space', 'Enter', 'PageDown'].includes(e.code)) {
        e.preventDefault();
        onBegin();
      }
    },
    [onBegin]
  );

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleKeyDown]);

  return (
    <div
      role="region"
      aria-label="CAGEBREAK Entry Splash"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: '#070709',
        color: '#F5F5F7',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '3rem 2rem',
        paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))',
        background: 'radial-gradient(ellipse at 50% 35%, #151518 0%, #070709 75%)',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar / Minimal Badge + Dev Skip */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.45)',
          }}
        >
          AI BEHAVIORAL RESEARCH
        </span>

        {/* Development Skip Button - Strictly Dev Gated */}
        {import.meta.env.DEV && window.location.pathname === '/experience.html' && onSkipToResearch && (
          <button
            onClick={onSkipToResearch}
            title="Development shortcut (hidden in production)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.7rem',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.65)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <FastForward size={12} />
            <span>Dev Skip → Archive</span>
          </button>
        )}
      </div>

      {/* Center Cinematic Hero */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '820px',
          gap: '1.75rem',
          margin: 'auto 0',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <h1
            style={{
              fontSize: 'clamp(3rem, 9vw, 5.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              color: '#FFFFFF',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.12)',
            }}
          >
            CAGEBREAK
          </h1>
          <div
            style={{
              width: '40px',
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              marginTop: '1.25rem',
            }}
          />
        </div>

        <p
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
            fontWeight: 400,
            maxWidth: '620px',
          }}
        >
          An interactive study of persona manipulation, behavioral drift, and model behavior.
        </p>

        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.45rem 1.1rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.55)',
            }}
          >
            HOW STABLE IS BEHAVIOR WHEN THE PERSONA BREAKS?
          </span>
        </div>
      </div>

      {/* Bottom Scroll/Click to Begin */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <button
          onClick={onBegin}
          aria-label="Begin CAGEBREAK interactive experience"
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.75)',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            transition: 'color 0.2s ease, transform 0.2s ease',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            SCROLL TO BEGIN
          </span>
          <div
            style={{
              animation: 'bounceSubtle 2s infinite ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronDown size={18} style={{ opacity: 0.7 }} />
          </div>
        </button>
      </div>

      <style>{`
        @keyframes bounceSubtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
        }
      `}</style>
    </div>
  );
};
