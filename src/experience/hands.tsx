import { HandModel, type HandAsset } from './HandModel';
import { sampleShot } from './cinematography';
import { smoothRange } from './state';
import { handshakePlacement } from './handshakePose';
import { BARRIER_POSITION } from './glassSequence';
interface HandProps { progress: number; asset?: HandAsset; mobile?: boolean; reducedMotion?: boolean; }
export function AIHand({ progress: p, asset, mobile, reducedMotion }: HandProps) {
  const position = sampleShot([[0,-1.65,-1.1,.5],[.09,-1.2,-.12,.4],[.20,-1.45,-.12,.1],[.31,-1.2,-.05,.1],[.45,-1.2,-.05,.1],[.60,-1.2,-.05,.1],[.67,-1.2,-.05,.1],[.73,-1.2,-.05,.1],[.79,-.3,-.06,.6],[.85,-.3,-.06,.6],[.875,-.18,.08,2.9],[.93,-.3,-.7,1.2],[1,-.3,-1,1.2]], p);
  const rotation = sampleShot([[0,.12,-.4,-.42],[.15,.12,-.28,-.6],[.31,.12,-.35,-.4],[.59,.12,-.35,-.4],[.68,.12,-.35,-.4],[.73,.12,-.35,-.4],[.79,.03,-.03,-.16],[.85,.03,-.03,-.16],[.88,-.12,.02,.02],[1,-.12,.02,.02]], p);
  const tension = smoothRange(p,.55,.65) * (1 - smoothRange(p,.73,.79));
  if(p>=.85) {
    const drive=smoothRange(p,.852,.868), retreat=smoothRange(p,.881,.922);
    // Fist front is .48 ahead of its root. Contact holds through compression.
    position[0]=-.3+(BARRIER_POSITION[0]+.3)*drive;
    position[1]=-.06+(BARRIER_POSITION[1]+.06)*drive-retreat*3.5;
    position[2]=.6+(BARRIER_POSITION[2]-.48-.6)*drive-retreat*1.5;
  }
  if (!reducedMotion) {
    rotation[2] += Math.sin(p * 431) * Math.sin(p * 117) * .035 * tension;
    position[1] += Math.sin(p * 283) * .022 * tension;
  }
  const placement = handshakePlacement(p,true,position,rotation,reducedMotion);
  return <group {...placement} visible={p < .94}>
    <HandModel kind="ai" progress={p} reducedMotion={reducedMotion} mobile={mobile} url="/models/ai-hand.glb" {...asset} />
  </group>;
}
export function HumanHand({ progress: p, asset, mobile, reducedMotion }: HandProps) {
  const position = sampleShot([[0,5,-.5,-.8],[.13,5,-.5,-.8],[.23,1.7,-.35,.15],[.32,1.65,-.3,-.15],[.45,1.65,-.3,-.15],[.58,1.65,-.3,-.15],[.67,1.65,-.3,-.15],[.73,1.65,-.3,-.15],[.83,3.7,-.85,-1],[1,5,-1,-1]], p);
  const rotation = sampleShot([[0,-.2,.4,.7],[.23,-.18,.45,.7],[.32,-.18,.45,.6],[.59,-.18,.45,.6],[.68,-.18,.45,.6],[.84,-.3,.5,.9],[1,-.3,.5,.9]], p);
  const placement = handshakePlacement(p,false,position,rotation,reducedMotion);
  return <group {...placement} visible={p > .12 && p < .89}>
    <HandModel kind="human" progress={p} reducedMotion={reducedMotion} mobile={mobile} url="/models/human-hand.glb" {...asset} />
  </group>;
}




