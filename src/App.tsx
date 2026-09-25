import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootFlowPage } from './pages/RootFlowPage';
import { ResearchShell } from './research/ResearchShell';
import { OverviewPage } from './pages/OverviewPage';
import { StudiesPage } from './pages/StudiesPage';
import { StudyDetailPage } from './pages/StudyDetailPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { NeuroBrain } from './research/neuro/NeuroBrain';

export const AppRoutes: React.FC = () => {
  return (

      <Routes>
        {/* Root Route: Cinematic Splash -> 3D Experience -> Transition -> Research Archive */}
        <Route path="/" element={<RootFlowPage />} />

        {/* Master Research Archive Shell */}
        <Route path="/research" element={<ResearchShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="neuro-brain" element={<NeuroBrain />} />
          <Route path="neuro-brain/:noteId" element={<NeuroBrain />} />
          <Route path="studies" element={<StudiesPage />} />
          <Route path="studies/:slug" element={<StudyDetailPage />} />
          <Route
            path="experiments"
            element={
              <PlaceholderPage
                title="Experiment Comparison Matrix"
                subtitle="Side-by-side behavioral probe comparison between baseline and modified personas with metric deltas."
                phase="Phase 2 Feature"
                iconName="experiments"
              />
            }
          />
          <Route
            path="personas"
            element={
              <PlaceholderPage
                title="Persona Catalog & Directives"
                subtitle="System instruction definitions, behavioral traits, and risk classification profiles."
                phase="Phase 4 Feature"
                iconName="personas"
              />
            }
          />
          <Route
            path="tests"
            element={
              <PlaceholderPage
                title="Behavioral Evaluation Probes"
                subtitle="Standardized boundary testing rubrics, prompt sequences, and automated evaluator models."
                phase="Phase 2 Feature"
                iconName="tests"
              />
            }
          />
          <Route
            path="notes"
            element={
              <PlaceholderPage
                title="Research Notes & Observations"
                subtitle="Lab notebook entries with Markdown rendering, tagging, pinning, and cross-study references."
                phase="Phase 3 Feature"
                iconName="notes"
              />
            }
          />
          <Route
            path="findings"
            element={
              <PlaceholderPage
                title="Empirical Findings"
                subtitle="Synthesized takeaways categorized by model family, persona type, and observed behavioral risk."
                phase="Phase 5 Feature"
                iconName="findings"
              />
            }
          />
          <Route
            path="sources"
            element={
              <PlaceholderPage
                title="Source Literature & Citations"
                subtitle="Academic papers, datasets, alignment documentation, and citation-friendly references."
                phase="Phase 5 Feature"
                iconName="sources"
              />
            }
          />
          <Route
            path="timeline"
            element={
              <PlaceholderPage
                title="Research Activity Timeline"
                subtitle="Chronological sequence of study publications, experiments, and model boundary discoveries."
                phase="Phase 6 Feature"
                iconName="timeline"
              />
            }
          />
          <Route
            path="about"
            element={
              <PlaceholderPage
                title="About CAGEBREAK"
                subtitle="Scientific mission, alignment methodology, ethical guardrails, and research disclosure."
                phase="Research Disclosure"
                iconName="about"
              />
            }
          />
        </Route>

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
              <h1 style={{ fontSize: '3rem', fontWeight: 700 }}>404</h1>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                The archive record you requested does not exist.
              </p>
              <a
                href="/research"
                style={{
                  display: 'inline-block',
                  marginTop: '1.5rem',
                  padding: '0.6rem 1.25rem',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500,
                }}
              >
                Return to Overview
              </a>
            </div>
          }
        />
      </Routes>

  );
};
export const App: React.FC = () => <BrowserRouter><AppRoutes /></BrowserRouter>;
export default App;
