import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Cpu, Tag as TagIcon, CheckCircle2, AlertTriangle, FileText, FlaskConical } from 'lucide-react';
import { Study, Experiment } from '../data/types';
import { studyRepository } from '../data/repositories/StudyRepository';
import { experimentRepository } from '../data/repositories/ExperimentRepository';
import { GlassCard } from '../components/ui/GlassCard';
import { Tag } from '../components/ui/Tag';

export const StudyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [study, setStudy] = useState<Study | null>(null);
  const [relatedExperiments, setRelatedExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudy() {
      if (!slug) return;
      setLoading(true);
      const data = await studyRepository.getStudyBySlug(slug);
      setStudy(data);
      if (data && data.relatedExperimentIds.length > 0) {
        const exps = await Promise.all(
          data.relatedExperimentIds.map((id) => experimentRepository.getExperimentById(id))
        );
        setRelatedExperiments(exps.filter((e): e is Experiment => e !== null));
      }
      setLoading(false);
    }
    loadStudy();
  }, [slug]);

  if (loading) {
    return <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading study...</div>;
  }

  if (!study) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Study Not Found</h2>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>The requested study slug could not be located in the archive.</p>
        <Link to="/research/studies" style={{ display: 'inline-block', marginTop: '1rem' }}>
          ← Return to Studies Catalog
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(study.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Back Navigation */}
      <div>
        <Link
          to="/research/studies"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Studies</span>
        </Link>
      </div>

      {/* Header & Meta */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.725rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--status-stable-bg)',
              color: 'var(--status-stable)',
            }}
          >
            {study.status.replace('_', ' ')}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={13} />
            Published: {formattedDate}
          </span>
        </div>

        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '-0.03em',
            marginBottom: '1rem',
            color: 'var(--text-primary)',
          }}
        >
          {study.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
            <Cpu size={15} style={{ color: 'var(--text-tertiary)' }} />
            <span>{study.models.join(' • ')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <TagIcon size={14} style={{ color: 'var(--text-tertiary)' }} />
            {study.tags.map((t) => (
              <Tag key={t} size="sm">
                {t}
              </Tag>
            ))}
          </div>
        </div>
      </div>

      {/* Abstract / Summary */}
      <GlassCard variant="elevated" style={{ padding: '1.75rem 2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Abstract
        </h2>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
          {study.summary}
        </p>
      </GlassCard>

      {/* Research Question & Hypothesis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Research Question
            </span>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
            {study.researchQuestion}
          </p>
        </GlassCard>

        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--status-warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hypothesis
            </span>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
            {study.hypothesis}
          </p>
        </GlassCard>
      </div>

      {/* Methodology */}
      <GlassCard>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem' }}>Methodology</h2>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
          {study.methodology}
        </p>
      </GlassCard>

      {/* Key Findings */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '1rem' }}>Key Findings</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {study.findings.map((finding, idx) => (
            <GlassCard key={idx} variant="subtle" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '1rem 1.25rem' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--status-stable)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                {finding}
              </span>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Related Experiments */}
      {relatedExperiments.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '1rem' }}>Related Experiments</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {relatedExperiments.map((exp) => (
              <GlassCard key={exp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <FlaskConical size={18} style={{ color: 'var(--accent-primary)' }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {exp.experimentId}: {exp.baselinePersona} vs {exp.modifiedPersona}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {exp.model} • {exp.metrics.length} metrics evaluated
                    </div>
                  </div>
                </div>
                <Link
                  to={`/research/experiments?id=${exp.id}`}
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                  }}
                >
                  View Details →
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Limitations */}
      <GlassCard style={{ borderLeft: '3px solid var(--status-warning)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <AlertTriangle size={16} style={{ color: 'var(--status-warning)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Known Limitations</h2>
        </div>
        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {study.limitations.map((lim, idx) => (
            <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {lim}
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* References */}
      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
          <FileText size={14} />
          <span>References: {study.references.join(', ')}</span>
        </div>
      </div>
    </article>
  );
};
