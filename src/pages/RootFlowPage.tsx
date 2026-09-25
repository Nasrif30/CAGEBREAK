import { useCallback, useLayoutEffect, useState } from 'react';
import { CinematicSplash } from '../components/splash/CinematicSplash';
import { CagebreakExperience } from '../integration/cagebreakExperienceContract';
import type { ExperienceState } from '../integration/cagebreakExperienceContract';
import { ResearchShell } from '../research/ResearchShell';
import { OverviewPage } from './OverviewPage';
export type RootFlowPhase='splash'|'experience'|'transition'|'archiveGate'|'research';
export function RootFlowPage() {
 const [phase,setPhase]=useState<RootFlowPhase>('splash');
 const begin=useCallback(()=>{window.scrollTo({top:0,behavior:'instant'});setPhase('experience');},[]);
 const complete=useCallback(()=>setPhase('research'),[]);
 const update=useCallback((state:ExperienceState)=>{if(state.ready)setPhase(previous=>previous==='research'?'research':state.progress>=.997?'archiveGate':state.progress>=.989?'transition':'experience');},[]);
 useLayoutEffect(()=>{if(phase==='research')window.scrollTo({top:0,behavior:'instant'});},[phase]);
 if(phase==='research')return <ResearchShell><OverviewPage /></ResearchShell>;
 if(phase==='splash')return <CinematicSplash onBegin={begin} onSkipToResearch={complete} />;
 return <div data-root-phase={phase}><CagebreakExperience onStateChange={update} onComplete={complete} /></div>;
}
