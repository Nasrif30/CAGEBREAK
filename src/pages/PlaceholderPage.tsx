import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Compass, FlaskConical, Users, ShieldAlert, FileText, Lightbulb, Bookmark, Clock, Info } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  phase: string;
  iconName?: string;
}

const icons: Record<string, React.ReactNode> = {
  experiments: <FlaskConical size={32} />,
  personas: <Users size={32} />,
  tests: <ShieldAlert size={32} />,
  notes: <FileText size={32} />,
  findings: <Lightbulb size={32} />,
  sources: <Bookmark size={32} />,
  timeline: <Clock size={32} />,
  about: <Info size={32} />,
};

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle,
  phase,
  iconName = 'experiments',
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '2rem auto' }}>
      <GlassCard
        variant="elevated"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-secondary)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {icons[iconName] || <Compass size={32} />}
        </div>

        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-primary)',
            }}
          >
            {phase}
          </span>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              marginTop: '0.25rem',
              marginBottom: '0.5rem',
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.6 }}>
            {subtitle}
          </p>
        </div>

        <div
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.2rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--text-tertiary)',
          }}
        >
          Scheduled for upcoming engineering milestone
        </div>
      </GlassCard>
    </div>
  );
};
