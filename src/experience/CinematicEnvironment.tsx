import { useEffect, useLayoutEffect, useMemo } from 'react';
import { BufferGeometry, Color, Float32BufferAttribute, ShaderMaterial } from 'three';
import { colorStory } from './cinematography';
import { environmentAt, atmospherePoints } from './environmentStory';
import { smoothRange } from './state';
const vertex=`varying vec2 uvField; void main(){uvField=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const backdropFragment=`
 varying vec2 uvField;
 uniform vec3 lightColor,darkColor;
 uniform float warm,danger,life,contact,distortion,progress,settle;
 float field(vec2 p,vec2 center,vec2 radius){vec2 d=(p-center)/radius;return exp(-dot(d,d)*2.);}
 void main(){
   vec2 p=uvField;
   p.x+=sin(p.y*13.+progress*9.)*distortion*.16;
   float key=field(p,vec2(.39,.59),vec2(.21,.32));
   float side=field(p,vec2(.68,.48),vec2(.15,.25));
   float beam=field(p,vec2(.43+p.y*.10,.5),vec2(.035,.38));
   float halo=field(p,vec2(.50,.50),vec2(.085,.14));
   vec3 base=mix(darkColor,lightColor,.18+key*.72);
   base*=1.-danger*.62;
   base+=vec3(.17,.25,.29)*beam*(1.-warm)*life*.38;
   base+=mix(vec3(.35,.21,.09),vec3(.19,.014,.035),danger)*side*warm*life;
   base+=vec3(.16,.17,.16)*halo*contact;
   float vignette=smoothstep(.14,.68,length((p-.5)*vec2(1.,.85)));
   base*=1.-vignette*.28*life;
   gl_FragColor=vec4(base,1.-settle);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
 }`;
const softFragment=`varying vec2 uvField; uniform vec3 tint; uniform float opacity;
 void main(){vec2 p=(uvField-.5)*2.;float a=exp(-dot(p,p)*4.)*(1.-smoothstep(.55,1.,length(p)));gl_FragColor=vec4(tint,a*opacity);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`;
/** Layered world-space fields: no raymarching, framebuffer reflection, or time-based animation. */
export function CinematicEnvironment({progress:p,mobile=false,reducedMotion}:{progress:number;mobile?:boolean;reducedMotion:boolean}) {
 const story=useMemo(()=>environmentAt(p,reducedMotion),[p,reducedMotion]),palette=colorStory(p);
 const backdrop=useMemo(()=>new ShaderMaterial({vertexShader:vertex,fragmentShader:backdropFragment,transparent:true,depthWrite:false,uniforms:{lightColor:{value:new Color()},darkColor:{value:new Color()},warm:{value:0},danger:{value:0},life:{value:1},contact:{value:0},distortion:{value:0},progress:{value:0},settle:{value:0}}}),[]);
 const floor=useMemo(()=>new ShaderMaterial({vertexShader:vertex,fragmentShader:softFragment,transparent:true,depthWrite:false,uniforms:{tint:{value:new Color('#b8cbd1')},opacity:{value:0}}}),[]);
 const points=useMemo(()=>atmospherePoints(mobile),[mobile]);
 const dust=useMemo(()=>{const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(points.flat(),3));return g;},[points]);
 useLayoutEffect(()=>{
   backdrop.uniforms.lightColor.value.set(palette.light);backdrop.uniforms.darkColor.value.set(palette.dark);
   for(const name of ['warm','danger','life','contact','distortion','settle'] as const) backdrop.uniforms[name].value=story[name];
   backdrop.uniforms.progress.value=p;
   floor.uniforms.opacity.value=story.reflection;
   const attr=dust.getAttribute('position');
   const burst=reducedMotion?0:smoothRange(p,.874,.905)*.45;
   points.forEach(([x,y,z],i)=>{const drift=reducedMotion?0:Math.sin(p*(3+i%4)+i)*.06*(1+story.warm);attr.setXYZ(i,x+drift+x*burst,y+drift+y*burst,z+burst);});
   attr.needsUpdate=true;
 },[p,reducedMotion,story,palette.light,palette.dark,backdrop,floor,dust,points]);
 useEffect(()=>()=>{backdrop.dispose();floor.dispose();},[backdrop,floor]);
 useEffect(()=>()=>dust.dispose(),[dust]);
 return <>
   <mesh position={[0,0,-12]} material={backdrop} renderOrder={-10}><planeGeometry args={[44,32]} /></mesh>
   {!mobile&&<mesh position={[0,-2.3,-.8]} rotation={[-Math.PI/2,0,0]} material={floor}><planeGeometry args={[10,8]} /></mesh>}
   <points geometry={dust}><pointsMaterial color={story.warm>.5?'#d6b19a':'#ccdde5'} size={mobile?.022:.018} sizeAttenuation transparent opacity={story.particles} depthWrite={false} /></points>
 </>;
}
