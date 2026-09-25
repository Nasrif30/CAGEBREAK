import { StrictMode, Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { ExperienceState } from '../integration/cagebreakExperienceContract';
import './preview.css';
import '../styles/global.css';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../App';
const shots = [['scroll','Scroll'],['.03','Opening'],['.105','Digital'],['.20','Human'],['.25','Approach'],['.275','Pre-contact'],['.307','Palm contact'],['.329','Finger wrap'],['.36','Grip locked'],['.38','Trust'],['.46','Thumb release'],['.492','Unwrap'],['.528','Separation'],['.50','Persona change'],['.565','Question'],['.63','Instability'],['.69','Release'],['.81','Gesture'],['.847','Stress'],['.873','Impact'],['.895','Shatter'],['.93','Through glass'],['.953','Evidence'],['.982','Themes'],['.998','Archive'],['1','Complete']];
function DevelopmentPreview() {
  const navigate=useNavigate();
  const [CagebreakExperience] = useState(() => lazy(() => import('./Experience').then(module => ({ default: module.CagebreakExperience }))));
  const [state, setState] = useState<ExperienceState>({ phase: 'splash', progress: 0, ready: false, transitionProgress: 0 });
  const [shot,setShot]=useState('scroll');
  const [reduced,setReduced]=useState(false);
  const debug = import.meta.env.DEV && new URL(document.URL).searchParams.has('debug');
  useEffect(()=>{document.title='CAGEBREAK · Development film study';},[]);
  return <div className="cb-preview" style={shot==='scroll'?undefined:{height:'100svh'}}>
    <Suspense fallback={<p>Loading scene…</p>}><CagebreakExperience progress={shot==='scroll'?undefined:Number(shot)} reducedMotion={reduced} onStateChange={setState} onComplete={()=>{window.scrollTo({top:0,behavior:'instant'});navigate('/research');}} /></Suspense>
    {debug && <aside className="cb-dev-tools"><label>Development shot <select aria-label="Development shot" value={shot} onChange={event=>setShot(event.target.value)}>{shots.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label><input type="checkbox" checked={reduced} onChange={event=>setReduced(event.target.checked)} />Reduced motion</label>
      <output>{state.phase} · {Math.round(state.progress*100)}% · {state.ready?'ready':'loading'}</output></aside>}
  </div>;
}
function PreviewRouter() { const location=useLocation(); return location.pathname==='/experience.html'?<DevelopmentPreview />:<AppRoutes />; }
const root = createRoot(document.getElementById('root')!);
root.render(import.meta.env.DEV ? <StrictMode><BrowserRouter><PreviewRouter /></BrowserRouter></StrictMode> : <p>This development sandbox is unavailable in production.</p>);
if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());


