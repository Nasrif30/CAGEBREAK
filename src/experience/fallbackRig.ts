import { Bone, Float32BufferAttribute, Skeleton, Uint16BufferAttribute, type BufferGeometry } from 'three';
import type { handPose } from './cinematography';
import { handshakePose } from './handshakePose';
const fingers = [
  [-.34,.40,0,-.42,1.34,.12], [-.10,.47,0,-.10,1.51,.15],
  [.15,.42,0,.20,1.37,.17], [.36,.25,0,.48,1.04,.19],
  [-.4,-.16,.07,-.88,.50,.25],
];
export function buildFallbackRig(geometry: BufferGeometry) {
  const root = new Bone(); root.name = 'palm';
  const bones: Bone[] = [root];
  const chains: Bone[][] = [];
  for (let digit = 0; digit < fingers.length; digit++) {
    const [ax,ay,az,bx,by,bz] = fingers[digit];
    const chain: Bone[] = [];
    for (let joint = 0; joint < 3; joint++) {
      const bone = new Bone(); bone.name = `finger_${digit}_${joint}`;
      if (joint === 0) { bone.position.set(ax,ay,az); root.add(bone); }
      else { bone.position.set((bx-ax)*.36,(by-ay)*.36,(bz-az)*.36); chain[joint-1].add(bone); }
      chain.push(bone); bones.push(bone);
    }
    chains.push(chain);
  }
  const forearm=new Bone(); forearm.name='forearm'; forearm.position.y=-1.1;
  root.add(forearm); const forearmIndex=bones.length; bones.push(forearm);
  root.updateMatrixWorld(true);
  const position = geometry.getAttribute('position');
  const indices = new Uint16Array(position.count*4), weights = new Float32Array(position.count*4);
  for (let v=0;v<position.count;v++) {
    const x=position.getX(v), y=position.getY(v), z=position.getZ(v);
    if(y<-.75) {
      const t=Math.max(0,Math.min(1,(-y-.75)/3));
      const weight=t*t*(3-2*t),offset=v*4;
      indices[offset+1]=forearmIndex;weights[offset]=1-weight;weights[offset+1]=weight;
      continue;
    }
    let selected=-1, best=Infinity, coordinate=0;
    for (let d=0;d<fingers.length;d++) {
      const [ax,ay,az,bx,by,bz]=fingers[d];
      const dx=bx-ax,dy=by-ay,dz=bz-az;
      const t=((x-ax)*dx+(y-ay)*dy+(z-az)*dz)/(dx*dx+dy*dy+dz*dz);
      if(t<0 || (d===4 && x>-.44)) continue;
      const distance=Math.hypot(x-ax-dx*t,y-ay-dy*t,(z-az-dz*t)*.7);
      if(distance<best) {best=distance;selected=d;coordinate=t;}
    }
    const offset=v*4;
    if(selected<0 || best>.24) { weights[offset]=1; continue; }
    const base=1+selected*3;
    const palmBlend=Math.min(1,coordinate/.16);
    const jointCoordinate=Math.max(0,Math.min(2,coordinate/.36));
    const lower=Math.floor(jointCoordinate),upper=Math.min(2,lower+1),fraction=jointCoordinate-lower;
    indices[offset]=0; weights[offset]=1-palmBlend;
    indices[offset+1]=base+lower; weights[offset+1]=palmBlend*(1-fraction);
    indices[offset+2]=base+upper; weights[offset+2]=palmBlend*fraction;
  }
  geometry.setAttribute('skinIndex',new Uint16BufferAttribute(indices,4));
  geometry.setAttribute('skinWeight',new Float32BufferAttribute(weights,4));
  return {root,skeleton:new Skeleton(bones),chains,forearm};
}
export function poseFallbackRig(rig: ReturnType<typeof buildFallbackRig>, pose: ReturnType<typeof handPose>, ai: boolean) {
  // Proximal arm lags the fist extension, with a smooth skin-weighted wrist transition.
  rig.forearm.position.z=ai?-.45*pose.impact:0;
  rig.forearm.rotation.x=ai?.025*pose.threat*(1-pose.impact):0;
  rig.chains.forEach((chain,digit) => {
    const middle = digit===1;
    const fist = ai ? pose.threat*(middle ? .015 : 1) : 0;
    const impact = ai ? pose.impact : 0;
    const curl = Math.max(fist, impact);
    chain.forEach((bone,joint) => {
      const grip = digit < 4 ? handshakePose.fingers[digit][joint] * pose.handshake.fingerWrap[joint] : 0;
      bone.rotation.set(Math.max(grip,curl * (joint===0 ? 1.15 : joint===1 ? 1.35 : .85)) + (1-Math.max(pose.hold,curl))*.045,0,0);
      // Bring the natural open spread together during reach, before any grip curl.
      if(digit<4 && joint===0) bone.rotation.z=[-.065,0,.05,.11][digit]*pose.handshake.align;
      if(digit===4) {
        bone.rotation.x=pose.handshake.thumb*handshakePose.thumb[joint]+curl*.45;
        bone.rotation.y=pose.handshake.thumb*(joint===0?.4:joint===1?.15:0);
        bone.rotation.z=-(pose.handshake.thumb*.45 + fist*.7 + impact*.4)/(joint+1);
      }
    });
  });
}

