import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExperienceProps } from '../integration/cagebreakExperienceContract';
import { ExperienceCanvas } from './ExperienceCanvas';
import { clampProgress, createExperienceNotifier, getExperienceState } from './state';
import { useExperienceScroll, useMedia } from './useExperience';
import './experience.css';
import { CinematicText } from './CinematicText';
import { colorStory } from './cinematography';
import { glassSequence } from './glassSequence';
import { EvidenceInterstitial } from './EvidenceInterstitial';

export function CagebreakExperience(props: ExperienceProps) {
  const { progress: controlledProgress, aiAsset, humanAsset, className = '' } = props;
  const section = useRef<HTMLElement>(null);
  const callbacks = useRef(props);
  const notifier = useRef(createExperienceNotifier());
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const enterArchive=useCallback(()=>{notifier.current(getExperienceState(1,true),callbacks.current);},[]);
  useEffect(() => { callbacks.current = props; });
  const scroll = useExperienceScroll(section);
  const prefersReducedMotion = useMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = prefersReducedMotion || props.reducedMotion === true;
  const mobile = useMedia('(max-width: 760px), (pointer: coarse)');
  const progress = clampProgress(controlledProgress ?? scroll.progress);

  const palette = colorStory(progress);
  useEffect(() => { notifier.current(getExperienceState(progress, ready), callbacks.current); }, [progress, ready]);
  return <section ref={section} className={`cb-experience ${controlledProgress !== undefined ? 'cb-controlled' : ''} ${className}`} aria-label="AI and human cooperation visualization" aria-busy={!ready}>
    <div className="cb-stage" style={{ background: `radial-gradient(ellipse at 38% 28%, ${palette.light}, ${palette.dark})` }}>
      <div className="cb-canvas">
        <ExperienceCanvas progress={progress} reducedMotion={reducedMotion} mobile={mobile} active={scroll.active && (!ready || progress < 1)} aiAsset={aiAsset} humanAsset={humanAsset} onReady={markReady} />
      </div>
      {ready && <CinematicText progress={progress} />}
      {ready && <EvidenceInterstitial progress={progress} reducedMotion={reducedMotion} onEnter={enterArchive} />}
      <div className="cb-impact-flash" aria-hidden="true" style={{ opacity: glassSequence(progress,reducedMotion).impact * .32 }} />
      {!ready && <p className="cb-loading" role="status">Preparing the scene…</p>}
    </div>
  </section>;
}

