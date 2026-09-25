import { smoothRange } from './state';
import { useEffect } from 'react';
import { bindArchiveEntry } from './archiveEntry';
export const researchThemes=['PERSONA MANIPULATION','JAILBREAK BEHAVIOR','INSTRUCTION OVERRIDE','ALIGNMENT DEGRADATION','BEHAVIORAL DRIFT','ADVERSARIAL CONDITIONING'];
export function evidenceAt(p:number) {
  return {title:smoothRange(p,.94,.946)*(1-smoothRange(p,.984,.989)),statement:smoothRange(p,.947,.955)*(1-smoothRange(p,.984,.989)),themes:researchThemes.map((_,i)=>smoothRange(p,.956+i*.0035,.960+i*.0035)*(1-smoothRange(p,.984,.989))),archive:smoothRange(p,.989,.997)};
}
export function EvidenceInterstitial({progress:p,reducedMotion,onEnter}:{progress:number;reducedMotion:boolean;onEnter?:()=>void}) {
  const active=p>=.997;
  useEffect(()=>{if(active&&onEnter)return bindArchiveEntry(window,onEnter);},[active,onEnter]);
  const e=evidenceAt(p);
  const reveal=(value:number)=>({opacity:value,filter:reducedMotion?'none':`blur(${(1-value)*5}px)`,transform:reducedMotion?'none':`translateY(${(1-value)*8}px)`});
  if(p<.94) return null;
  return <div className="cb-evidence">
    <div className="cb-evidence-debrief" aria-hidden={e.title===0}>
      <p className="cb-evidence-brand" style={reveal(e.title)}>CAGEBREAK</p>
      <h2 style={reveal(e.statement)}>YOU’VE SEEN THE BREAK.<br/>NOW SEE THE EVIDENCE.</h2>
      <div className="cb-evidence-themes">{researchThemes.map((theme,i)=><p key={theme} style={reveal(e.themes[i])}>{theme}</p>)}</div>
    </div>
    <div className="cb-evidence-archive" aria-hidden={e.archive===0} style={reveal(e.archive)}>
      <p className="cb-evidence-brand">CAGEBREAK</p><h2>RESEARCH ARCHIVE</h2><p>Explore the studies behind the behavior.</p><button type="button" className="cb-evidence-cue cb-enter-archive" disabled={!active} onClick={onEnter}>ENTER THE ARCHIVE<br/>↓</button>
    </div>
  </div>;
}
