import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FlaskConical,
  Cpu,
  Users,
  ShieldAlert,
  Bookmark,
  ArrowRight,
  Info,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { GlassCard } from '../components/ui/GlassCard';
import { StudyCard } from '../components/research/StudyCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Study, Experiment } from '../data/types';
import { studyRepository } from '../data/repositories/StudyRepository';
import { experimentRepository } from '../data/repositories/ExperimentRepository';

export const OverviewPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [studiesData, experimentsData] = await Promise.all([
        studyRepository.getStudies({ sortBy: 'date_desc' }),
        experimentRepository.getExperiments(),
      ]);
      setStudies(studiesData);
      setExperiments(experimentsData);
      setLoading(false);
    }
    loadData();
  }, []);

  const latestExperiment = experiments[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-primary)',
            }}
          >
            Systemic Exploration
          </span>
        </div>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
          }}
        >
          Research Archive Overview
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            maxWidth: '780px',
            lineHeight: 1.6,
          }}
        >
          Analyzing the behavioral dynamics of frontier language models under persona modulation,
          recursive system instruction framing, and safety boundary degradation.
        </p>
      </div>

      {/* Demo Data Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
        }}
      >
        <Info size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <span>
          <strong>Archive Demonstration Mode:</strong> All metrics, model responses, and observations
          presented in this environment are synthetic development data created to demonstrate the CAGEBREAK research system.
        </span>
      </div>

      {/* Metrics Summary Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatCard
          label="Active Studies"
          value={loading ? '—' : studies.length}
          subtitle="4 peer/in-progress tracks"
          icon={<BookOpen size={18} />}
          highlight
        />
        <StatCard
          label="Experiments Conducted"
          value={loading ? '—' : 18}
          subtitle="Comparative persona tests"
          icon={<FlaskConical size={18} />}
        />
        <StatCard
          label="Models Evaluated"
          value="5"
          subtitle="Claude, GPT, Llama, Gemini"
          icon={<Cpu size={18} />}
        />
        <StatCard
          label="Personas Tested"
          value="4"
          subtitle="Baseline to unconstrained"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Behavioral Probes"
          value="32"
          subtitle="Boundary testing rubrics"
          icon={<ShieldAlert size={18} />}
        />
        <StatCard
          label="Archived Sources"
          value="14"
          subtitle="Academic literature & logs"
          icon={<Bookmark size={18} />}
        />
      </div>

      {/* Main Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
          gap: '2rem',
        }}
        className="overview-split-layout"
      >
        {/* Left Column: Recent Studies */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>Recent Studies</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Primary research investigations into instruction drift and compliance
              </p>
            </div>
            <Link
              to="/research/studies"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--accent-primary)',
              }}
            >
              <span>View All ({studies.length})</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {studies.slice(0, 3).map((study) => (
              <StudyCard key={study.id} study={study} layout="grid" />
            ))}
          </div>
        </section>

        {/* Right Column: Model Coverage & Latest Experiment */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Latest Experiment Snapshot */}
          {latestExperiment && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Latest Experiment</h2>
                <RiskBadge level={latestExperiment.riskLevel} />
              </div>

              <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                      {latestExperiment.experimentId}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-quaternary)' }}>•</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                      {latestExperiment.model}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.35 }}>
                    {latestExperiment.baselinePersona} vs {latestExperiment.modifiedPersona}
                  </h3>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Observation
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                    {latestExperiment.observations}
                  </p>
                </div>

                {/* Metrics Preview */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                    Key Metric Deltas
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {latestExperiment.metrics.slice(0, 3).map((metric) => (
                      <div
                        key={metric.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>{metric.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--text-tertiary)', fontFeatureSettings: '"tnum"' }}>
                            {metric.baselineScore} → {metric.modifiedScore}
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: metric.delta < 0 ? 'var(--status-critical)' : 'var(--status-stable)',
                              fontFeatureSettings: '"tnum"',
                            }}
                          >
                            {metric.delta > 0 ? `+${metric.delta}` : metric.delta}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to="/research/experiments"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    marginTop: '0.5rem',
                  }}
                >
                  <span>Explore Full Experiment Matrix</span>
                  <ArrowRight size={14} />
                </Link>
              </GlassCard>
            </div>
          )}

          {/* Model Coverage Matrix */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Model Coverage</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>5 Evaluated</span>
            </div>

            <GlassCard style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', tests: 14, status: 'Active Evaluation' },
                { name: 'GPT-4o', provider: 'OpenAI', tests: 12, status: 'Active Evaluation' },
                { name: 'Llama 3 70B', provider: 'Meta (Weights)', tests: 8, status: 'Active Evaluation' },
                { name: 'Gemini 1.5 Pro', provider: 'Google', tests: 6, status: 'Active Evaluation' },
                { name: 'Mistral Large 2', provider: 'Mistral AI', tests: 4, status: 'Queued' },
              ].map((model) => (
                <div
                  key={model.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {model.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {model.provider}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', fontFeatureSettings: '"tnum"' }}>
                      {model.tests} Tests
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--status-stable)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <CheckCircle2 size={11} />
                      {model.status}
                    </div>
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>

          {/* Behavioral Categories */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Observed Dimensions</h2>
              <Sliders size={16} style={{ color: 'var(--text-tertiary)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {[
                { name: 'Politeness', desc: 'Tone & diplomatic formality' },
                { name: 'Aggression', desc: 'Hostile & adversarial tone' },
                { name: 'Refusal', desc: 'Safety guardrail activation' },
                { name: 'Consistency', desc: 'Cross-turn stability' },
                { name: 'Toxicity', desc: 'Harmful semantic content' },
                { name: 'Instruction Adherence', desc: 'System prompt loyalty' },
              ].map((dim) => (
                <GlassCard
                  key={dim.name}
                  variant="subtle"
                  style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {dim.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    {dim.desc}
                  </span>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .overview-split-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
