import type { ExperienceProps, ExperienceState } from '../integration/cagebreakExperienceContract';
export const phases = ['initial', 'approach', 'handshake', 'unstable', 'release', 'aggressive', 'impact', 'transition', 'research'] as const;
export const clampProgress = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
export function getExperienceState(value: number, ready = true): ExperienceState {
  const p = clampProgress(value);
  const thresholds = [0.15, 0.30, 0.45, 0.60, 0.72, 0.85, 0.92, 1];
  const index = thresholds.findIndex(threshold => p < threshold);
  return { progress: p, phase: ready ? phases[index === -1 ? 8 : index] : 'splash', ready, transitionProgress: p === 1 ? 1 : clampProgress((p - 0.92) / 0.08) };
}
export function scrollProgress(top: number, height: number, viewport: number) {
  return clampProgress(-top / Math.max(1, height - viewport));
}
export function smoothRange(p: number, start: number, end: number) {
  const t = clampProgress((p - start) / (end - start));
  return t * t * (3 - 2 * t);
}
/** Deduplicate StrictMode replay and callback identity changes. */
export function createExperienceNotifier() {
  let previous: ExperienceState | undefined;
  let completed = false;
  return (state: ExperienceState, callbacks: ExperienceProps) => {
    const phaseChanged = previous?.phase !== state.phase;
    const progressChanged = previous?.progress !== state.progress;
    const stateChanged = phaseChanged || progressChanged || previous?.ready !== state.ready;
    const complete = state.ready && state.progress === 1 && !completed;
    if (state.progress < 1) completed = false;
    if (complete) completed = true;
    previous = state;
    if (phaseChanged) callbacks.onPhaseChange?.(state.phase);
    if (progressChanged) callbacks.onProgressChange?.(state.progress);
    if (stateChanged) callbacks.onStateChange?.(state);
    if (complete) callbacks.onComplete?.();
  };
}

