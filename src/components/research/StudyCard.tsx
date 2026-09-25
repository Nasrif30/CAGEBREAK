import React from 'react';
import { Link } from 'react-router-dom';
import { Study, StudyStatus } from '../../data/types';
import { GlassCard } from '../ui/GlassCard';
import { Tag } from '../ui/Tag';
import { Calendar, Cpu, ArrowUpRight } from 'lucide-react';

interface StudyCardProps {
  study: Study;
  layout?: 'grid' | 'list';
}

const statusConfig: Record<StudyStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'var(--text-tertiary)', bg: 'var(--surface-secondary)' },
  in_progress: { label: 'In Progress', color: 'var(--status-warning)', bg: 'var(--status-warning-bg)' },
  completed: { label: 'Completed', color: 'var(--status-stable)', bg: 'var(--status-stable-bg)' },
  peer_reviewed: { label: 'Peer Reviewed', color: '#10B981', bg: 'rgba(16, 185, 129, 0.10)' },
  archived: { label: 'Archived', color: 'var(--text-quaternary)', bg: 'var(--surface-tertiary)' },
};

export const StudyCard: React.FC<StudyCardProps> = ({ study, layout = 'grid' }) => {
  const status = statusConfig[study.status] || statusConfig.draft;

  const formattedDate = new Date(study.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (layout === 'list') {
    return (
      <Link to={`/research/studies/${study.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <GlassCard
          interactive
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 2fr) minmax(200px, 3fr) minmax(140px, 1.2fr) minmax(100px, auto)',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: status.bg,
                  color: status.color,
                }}
              >
                {status.label}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={13} />
                {formattedDate}
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {study.title}
            </h3>
          </div>

          <div>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {study.summary}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              <Cpu size={13} />
              <span>{study.models.slice(0, 2).join(', ')}{study.models.length > 2 ? ` +${study.models.length - 2}` : ''}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {study.tags.slice(0, 2).map((t) => (
                <Tag key={t} size="sm">
                  {t}
                </Tag>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-secondary)',
              }}
            >
              <ArrowUpRight size={16} />
            </div>
          </div>
        </GlassCard>
      </Link>
    );
  }

  // Grid layout (Editorial feel)
  return (
    <Link to={`/research/studies/${study.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
      <GlassCard
        interactive
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          padding: '1.75rem',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: status.bg,
                color: status.color,
              }}
            >
              {status.label}
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem',
                color: 'var(--text-tertiary)',
              }}
            >
              <Calendar size={13} />
              <span>{formattedDate}</span>
            </div>
          </div>

          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              marginBottom: '0.75rem',
            }}
          >
            {study.title}
          </h3>

          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              marginBottom: '1.25rem',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {study.summary}
          </p>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: 'var(--text-tertiary)',
              marginBottom: '0.85rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <Cpu size={14} />
            <span style={{ fontWeight: 500 }}>
              {study.models.join(' • ')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {study.tags.slice(0, 3).map((tag) => (
                <Tag key={tag} size="sm">
                  {tag}
                </Tag>
              ))}
              {study.tags.length > 3 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', alignSelf: 'center' }}>
                  +{study.tags.length - 3}
                </span>
              )}
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-secondary)',
                flexShrink: 0,
                marginLeft: '0.5rem',
              }}
            >
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
};
