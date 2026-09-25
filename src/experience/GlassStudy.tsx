import { useEffect, useLayoutEffect, useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute, DoubleSide } from 'three';
import { smoothRange } from './state';
import { BARRIER_POSITION, glassSequence, makeFracture, shardPose } from './glassSequence';
import { GlassSheen } from './GlassSheen';
function geometry(points:number[]) {const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(points,3));g.computeVertexNormals();return g;}
/** Cached pre-fractured sheet; transforms depend only on scroll progress. */
export function GlassStudy({progress:p,mobile,reducedMotion}:{progress:number;mobile?:boolean;reducedMotion:boolean}) {
  const shards=useMemo(()=>makeFracture(mobile).map(s=>({...s,geometry:geometry(s.points.flatMap(v=>v.map((x,i)=>x-s.center[i])))})),[mobile]);
  const cracks=useMemo(()=>geometry(shards.flatMap(s=>s.points.flatMap((v,i)=>[...v,...s.points[(i+1)%3]]))),[shards]);
  const hairline=useMemo(()=>geometry([0,0,.012,-.22,.16,.012,-.22,.16,.012,-.48,.23,.012,-.48,.23,.012,-.57,.61,.012,-.57,.61,.012,-.94,.84,.012]),[]);
  useEffect(()=>()=>{shards.forEach(s=>s.geometry.dispose());cracks.dispose();},[shards,cracks]);
  useEffect(()=>()=>hairline.dispose(),[hairline]);
  const state=glassSequence(p,reducedMotion),fade=1-smoothRange(p,.944,.975);
  useLayoutEffect(()=>{cracks.setDrawRange(0,Math.floor((state.branches*.55+state.spike*.45)*cracks.getAttribute('position').count/2)*2);},[cracks,state.branches,state.spike]);
  return <group position={[...BARRIER_POSITION]}>
    <GlassSheen progress={p} mobile={mobile} reducedMotion={reducedMotion} />
    <mesh visible={state.shatter===0}><planeGeometry args={[12,10]} /><meshPhysicalMaterial color="#c3d5df" transparent opacity={.018+state.stress*.025} roughness={.16} metalness={.18} clearcoat={mobile?0:1} depthWrite={false} side={DoubleSide} /></mesh>
    <lineSegments geometry={hairline} visible={state.shatter===0}><lineBasicMaterial color="#e2cbd0" transparent opacity={state.hairline*.42} depthWrite={false} /></lineSegments>
    <lineSegments geometry={cracks} visible={state.shatter<.12}><lineBasicMaterial color="#f5e1df" transparent opacity={(state.branches*.24+state.spike*.5)*(1-smoothRange(state.shatter,0,.12))} depthWrite={false} /></lineSegments>
    {shards.map(s=><mesh key={s.index} geometry={s.geometry} {...shardPose(s,p,reducedMotion)} visible={state.spike>0}><meshStandardMaterial color={s.index%3===0?'#adc3d1':'#e0d8d6'} metalness={.42} roughness={mobile?.4:.22} side={DoubleSide} transparent opacity={(.035+state.spike*.085)*fade} depthWrite={false} /><lineLoop geometry={s.geometry}><lineBasicMaterial color="#c8dbe6" transparent opacity={.28*fade} depthWrite={false} /></lineLoop></mesh>)}
  </group>;
}
