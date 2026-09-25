import { useEffect, useLayoutEffect, useMemo } from 'react';
import { ShaderMaterial } from 'three';
import { glassSequence } from './glassSequence';
/** A grazing studio reflection, not an emissive crack or full-screen effect. */
export function GlassSheen({progress:p,mobile,reducedMotion}:{progress:number;mobile?:boolean;reducedMotion:boolean}) {
 const material=useMemo(()=>new ShaderMaterial({transparent:true,depthWrite:false,uniforms:{sweep:{value:0},amount:{value:0},grain:{value:mobile?0:1}},vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 v;uniform float sweep,amount,grain;void main(){float line=exp(-pow((v.x+v.y*.12-sweep)*35.,2.));float edge=pow(abs(v.x-.5)*2.,14.);float noise=fract(sin(dot(v,vec2(127.1,311.7)))*43758.5453);float mask=smoothstep(0.,.15,v.y)*(1.-smoothstep(.85,1.,v.y));gl_FragColor=vec4(.71,.80,.85,amount*mask*(line*.55+edge*.15+noise*.018*grain));}`}),[mobile]);
 const glass=glassSequence(p,reducedMotion);
 useLayoutEffect(()=>{material.uniforms.sweep.value=reducedMotion?.72:.28+p*.58;material.uniforms.amount.value=(.032+glass.stress*.025)*(1-glass.shatter);},[p,reducedMotion,glass.stress,glass.shatter,material]);
 useEffect(()=>()=>material.dispose(),[material]);
 return <mesh position={[0,0,.008]} material={material} visible={glass.shatter===0}><planeGeometry args={[12,10]} /></mesh>;
}
