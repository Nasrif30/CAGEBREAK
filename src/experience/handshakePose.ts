import { Euler, Quaternion } from 'three';
import { smoothRange } from './state';
export type HandshakePhase = 'OPEN' | 'REACH' | 'PRE_CONTACT' | 'PALM_CONTACT' | 'FINGER_WRAP' | 'HANDSHAKE_LOCK' | 'SUBTLE_SHAKE' | 'RELEASE';
export const handshakePose = {
  // Both are right hands: +Y points toward the partner and -X (thumb) points up.
  ai: { wristRotation: [0, 0, -Math.PI/2 + .10] as const, palmZ: -.205 },
  human: { wristRotation: [Math.PI, 0, Math.PI/2 + .10] as const, palmZ: .205 },
  fingers: [[.80,1.15,.50],[.80,1.15,.90],[.84,1.05,.86],[.95,.90,.50]] as const,
  thumb: [.50, .30, .12] as const,
};
export function handshakeAt(p: number, reducedMotion = false) {
  const align = smoothRange(p,.19,.268) * (1-smoothRange(p,.535,.65));
  const contact = smoothRange(p,.283,.307);
  const wrap = smoothRange(p,.310,.348) * (1-smoothRange(p,.470,.504));
  // Unroll tips before knuckles so they lift off the hand back instead of cutting through it.
  const fingerWrap = [
    smoothRange(p,.310,.348)*(1-smoothRange(p,.497,.522)),
    smoothRange(p,.310,.348)*(1-smoothRange(p,.482,.507)),
    smoothRange(p,.310,.348)*(1-smoothRange(p,.470,.490)),
  ];
  const thumb = smoothRange(p,.325,.356) * (1-smoothRange(p,.447,.470));
  const separate = smoothRange(p,.475,.515);
  const phase: HandshakePhase = p<.19?'OPEN':p<.264?'REACH':p<.283?'PRE_CONTACT':p<.310?'PALM_CONTACT':p<.348?'FINGER_WRAP':p<.368?'HANDSHAKE_LOCK':p<.409?'SUBTLE_SHAKE':p<.447?'HANDSHAKE_LOCK':'RELEASE';
  const shake = reducedMotion || p<.368 || p>.409 ? 0 : Math.sin((p-.368)/.041*Math.PI*2)*Math.sin((p-.368)/.041*Math.PI)*.035;
  return {phase,align,contact,wrap,fingerWrap,thumb,separate,shake};
}
export function handshakePlacement(p: number, ai: boolean, basePosition: [number,number,number], baseRotation: [number,number,number], reducedMotion = false) {
  const state=handshakeAt(p,reducedMotion);
  const side=ai?-1:1;
  const config=ai?handshakePose.ai:handshakePose.human;
  const distance=.04 + (1-state.contact)*.53 + state.separate*.95;
  const target: [number,number,number] = [side*distance,state.shake,config.palmZ+side*((1-state.contact)*.065+state.separate*.10)];
  const position=basePosition.map((value,i)=>value+(target[i]-value)*state.align) as [number,number,number];
  const quaternion=new Quaternion().setFromEuler(new Euler(...baseRotation));
  quaternion.slerp(new Quaternion().setFromEuler(new Euler(...config.wristRotation)),state.align);
  return {position,quaternion};
}

