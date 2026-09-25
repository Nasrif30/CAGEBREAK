import { smoothRange } from './state';
export const IMPACT_POINT = [0, 0, 0] as const;
export const BARRIER_POSITION = [-.18, .08, 2.15] as const;
export function glassSequence(p: number, reduced = false) {
  const stress=smoothRange(p,.56,.72), hairline=smoothRange(p,.62,.75), branches=smoothRange(p,.79,.86);
  const spike=smoothRange(p,.87,.878), shatter=smoothRange(p,.879,.931), through=smoothRange(p,.9,.94);
  const impact=reduced?0:smoothRange(p,.868,.872)*(1-smoothRange(p,.872,.879));
  const phase=p<.56?'CLEAN':p<.62?'STRESS':p<.79?'HAIRLINE CRACK':p<.868?'BRANCHING FRACTURE':p<.879?'IMPACT':p<.9?'SHATTER':p<.94?'CAMERA THROUGH OPENING':p<1?'EVIDENCE INTERSTITIAL':'RESEARCH HANDOFF';
  return {stress,hairline,branches,spike,shatter,through,impact,phase};
}
export function makeFracture(mobile=false) {
  let seed=71403;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const n=mobile?7:11;
  const rings=[.52,1.8,6].map((radius,r)=>Array.from({length:n},(_,i)=>{
    const angle=(i+.2*(random()-.5))/n*Math.PI*2,scale=radius*(r===2?1:.78+random()*.44);
    return [Math.cos(angle)*scale,Math.sin(angle)*scale*.8,0] as [number,number,number];
  }));
  const triangles: [number,number,number][][]=[];
  for(let i=0;i<n;i++) {
    const j=(i+1)%n;
    triangles.push([[...IMPACT_POINT],rings[0][i],rings[0][j]]);
    for(let r=0;r<2;r++) {triangles.push([rings[r][i],rings[r+1][i],rings[r+1][j]]);triangles.push([rings[r][i],rings[r+1][j],rings[r][j]]);}
  }
  return triangles.map((points,index)=>{
    const center=points[0].map((_,axis)=>points.reduce((sum,v)=>sum+v[axis],0)/3) as [number,number,number];
    const [a,b,c]=points,area=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2;
    return {points,center,area,index,spin:[random()-.5,random()-.5,random()-.5],depth:index%5===0?-.8:.35+random()*1.2,delay:random()*.12};
  });
}
export type Fragment=ReturnType<typeof makeFracture>[number];
export function shardPose(s:Fragment,p:number,reduced=false) {
  const t=smoothRange(glassSequence(p).shatter,s.delay,1),speed=1/Math.sqrt(.25+s.area),motion=(t+smoothRange(p,.931,.975)*.025)*(reduced?.25:1),length=Math.hypot(s.center[0],s.center[1])||1;
  return {position:[s.center[0]+s.center[0]/length*motion*(1.3+speed),s.center[1]+s.center[1]/length*motion*(1.1+speed)-motion*motion*.35,motion*s.depth*speed] as [number,number,number],rotation:s.spin.map(v=>v*motion*(.6+speed)) as [number,number,number]};
}
