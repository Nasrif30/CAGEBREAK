import { smoothRange } from './state';
import { glassSequence } from './glassSequence';
export function environmentAt(p:number,reduced=false) {
  const warm=smoothRange(p,.43,.68), danger=smoothRange(p,.66,.79);
  const collapse=smoothRange(p,.875,.934), settle=smoothRange(p,.938,.96);
  const contact=smoothRange(p,.30,.355)*(1-smoothRange(p,.39,.455));
  return {warm,danger,collapse,settle,contact,life:1-collapse,
    distortion:reduced?0:warm*(1-collapse)*.045,
    flash:glassSequence(p,reduced).impact,
    particles:(.12+.32*smoothRange(p,.1,.24)+.18*warm)*(1-collapse),
    key:(1.25-danger*.65)*(1-collapse),fill:(.3-danger*.24)*(1-collapse),rim:(1.1+danger*.75)*(1-collapse),
    reflection:(.045+contact*.025)*(1-collapse)};
}
export function atmospherePoints(mobile:boolean) {
  let seed=9317;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  return Array.from({length:mobile?8:26},()=>[random()*5-3.6,random()*4-1.5,-1-random()*4] as const);
}
