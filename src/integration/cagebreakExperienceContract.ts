/** Sole application/3D boundary. No renderer or research dependencies. */
export type ExperiencePhase = 'splash' | 'initial' | 'approach' | 'handshake' | 'unstable' | 'release' | 'aggressive' | 'impact' | 'transition' | 'research';
export interface ExperienceState {
  phase: ExperiencePhase;
  progress: number;
  /** Scene or accessible fallback is usable; does not require successful GLB loading. */
  ready: boolean;
  transitionProgress: number;
}
export interface ExperienceModelSource {
  url?: string;
  rotation?: [number, number, number];
  scale?: number;
  dracoDecoderPath?: string;
}
export interface ExperienceProps {
  /** Omit for section scroll control. Supply 0–1 to fill a sized parent. */
  progress?: number;
  className?: string;
  reducedMotion?: boolean;
  aiAsset?: ExperienceModelSource;
  humanAsset?: ExperienceModelSource;
  onPhaseChange?: (phase: ExperiencePhase) => void;
  onProgressChange?: (progress: number) => void;
  onStateChange?: (state: ExperienceState) => void;
  /** Once per forward completion, after ready; reversal below 1 rearms. */
  onComplete?: () => void;
}

export { CagebreakExperience } from '../experience';
