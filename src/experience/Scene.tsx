import { CameraController } from './CameraController';
import { AIHand, HumanHand } from './hands';
import type { HandAsset } from './HandModel';
import { StudioEnvironment } from './StudioEnvironment';
import { GlassStudy } from './GlassStudy';
import { CinematicEnvironment } from './CinematicEnvironment';
import { environmentAt } from './environmentStory';
import { colorStory } from './cinematography';
export interface SceneProps { progress: number; reducedMotion: boolean; mobile?: boolean; aiAsset?: HandAsset; humanAsset?: HandAsset; }
export function Scene({ progress, reducedMotion, aiAsset, humanAsset, mobile }: SceneProps) {
  const light = environmentAt(progress,reducedMotion);
  return <>
    <CameraController progress={progress} reducedMotion={reducedMotion} />
    <StudioEnvironment progress={progress} />
    <CinematicEnvironment progress={progress} reducedMotion={reducedMotion} mobile={mobile} />
    <fog attach="fog" args={[colorStory(progress).dark, 12, 36]} />
    <hemisphereLight args={['#c2d5df', '#51454b', light.fill]} />
    <directionalLight position={[-3, 5, 5]} intensity={light.key+light.flash*.4} color="#dae7ed" />
    <directionalLight position={[3, 2, -3]} intensity={light.rim} color={light.danger>.5?'#af647d':'#b9cedd'} />
    <directionalLight position={[4, -1, 2]} intensity={light.warm*.65*light.life} color="#d4a278" />
    <pointLight position={[0,1,1.4]} intensity={light.contact*.55} distance={4} color="#ebe4d1" />
    <AIHand progress={progress} asset={aiAsset} mobile={mobile} reducedMotion={reducedMotion} /><HumanHand progress={progress} asset={humanAsset} mobile={mobile} reducedMotion={reducedMotion} />
    <GlassStudy progress={progress} mobile={mobile} reducedMotion={reducedMotion} />
  </>;
}
