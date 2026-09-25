import { describe, expect, it } from 'vitest';
import { Bone, Group } from 'three';
import { getExperienceState, scrollProgress, createExperienceNotifier } from './state';
import { discoverFingerBones } from './HandModel';
describe('experience timeline contract', () => {
  it('maps exact chapter boundaries and reverses without retained state', () => {
    const samples = [[0, 'initial'], [0.15, 'approach'], [0.30, 'handshake'], [0.45, 'unstable'], [0.60, 'release'], [0.72, 'aggressive'], [0.85, 'impact'], [0.92, 'transition'], [1, 'research']] as const;
    for (const [progress, phase] of [...samples, ...[...samples].reverse()]) expect(getExperienceState(progress).phase).toBe(phase);
  });
  it('clamps input and exposes a reversible handoff', () => {
    expect(getExperienceState(-1).progress).toBe(0);
    expect(getExperienceState(2).transitionProgress).toBe(1);
    expect(getExperienceState(NaN).progress).toBe(0);
    expect(getExperienceState(0.96).transitionProgress).toBeCloseTo(0.5);
    expect(getExperienceState(0.90).transitionProgress).toBe(0);
  });
  it('normalizes the scrollable distance and handles short sections', () => {
    expect(scrollProgress(0, 5000, 1000)).toBe(0);
    expect(scrollProgress(-2000, 5000, 1000)).toBe(0.5);
    expect(scrollProgress(-4000, 5000, 1000)).toBe(1);
    expect(scrollProgress(0, 500, 1000)).toBe(0);
  });
  it('discovers named finger bones without treating meshes as bones', () => {
    const root = new Group(); const thumb = new Bone(); thumb.name = 'mixamorigLeftHandThumb1';
    const little = new Bone(); little.name = 'little_02'; root.add(thumb, little);
    expect(discoverFingerBones(root).thumb).toEqual([thumb]);
    expect(discoverFingerBones(root).pinky).toEqual([little]);
    expect(discoverFingerBones(root).middle).toEqual([]);
  });
  it('waits for readiness, deduplicates events, and rearms completion on reversal', () => {
    const notify = createExperienceNotifier();
    const phases: string[] = []; const progress: number[] = []; let completions = 0;
    const callbacks = { onPhaseChange: (phase: string) => phases.push(phase), onProgressChange: (p: number) => progress.push(p), onComplete: () => completions++ };
    notify(getExperienceState(1, false), callbacks);
    expect(completions).toBe(0);
    notify(getExperienceState(1), callbacks);
    notify(getExperienceState(1), { ...callbacks });
    expect(completions).toBe(1);
    notify(getExperienceState(.4), callbacks);
    notify(getExperienceState(1), callbacks);
    expect(completions).toBe(2);
    expect(phases).toEqual(['splash', 'research', 'handshake', 'research']);
    expect(progress).toEqual([1, .4, 1]);
  });
});

