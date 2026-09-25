import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Scene, type SceneProps } from './Scene';
class CanvasBoundary extends Component<{ children: ReactNode; onReady: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <CanvasFallback onReady={this.props.onReady} /> : this.props.children; }
}
function CanvasFallback({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return <div className="cb-fallback" role="status"><svg viewBox="0 0 400 150" aria-hidden="true"><path d="M30 130 L110 72 Q125 62 145 77 L174 95 M370 130 L290 72 Q275 62 255 77 L226 95" fill="none" stroke="#8babbf" strokeWidth="20" strokeLinecap="round" /></svg><p>The 3D view is unavailable. You can still continue through the experience.</p></div>;
}
function SceneReady({ onReady }: { onReady: () => void }) {
  const called = useRef(false);
  useFrame(() => { if (!called.current) { called.current = true; onReady(); } });
  return null;
}
function PerformanceController({ mobile, active, onContextLost }: { mobile: boolean; active: boolean; onContextLost: () => void }) {
  const { gl, setDpr, invalidate } = useThree();
  const samples = useRef({ slow: 0, last: 0, dpr: 1 });
  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);
    samples.current = { slow: 0, last: 0, dpr }; setDpr(dpr);
  }, [mobile, setDpr]);
  useEffect(() => { if (active) invalidate(); }, [active, invalidate]);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onContextLost(); };
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onContextLost]);
  useFrame(() => {
    const now = performance.now(); const sample = samples.current; const elapsed = now - sample.last;
    sample.last = now;
    // Ignore idle gaps in this demand-rendered scene; lower DPR only during sustained slow interaction.
    if (elapsed > 27 && elapsed < 100) sample.slow++; else sample.slow = Math.max(0, sample.slow - 1);
    if (sample.slow > 18 && sample.dpr > 1) { sample.dpr = 1; setDpr(1); sample.slow = 0; }
  });
  return null;
}
export function ExperienceCanvas({ active, mobile, onReady, ...scene }: SceneProps & { active: boolean; mobile: boolean; onReady: () => void }) {
  const [lost, setLost] = useState(false);
  if (lost) return <CanvasFallback onReady={onReady} />;
  return <CanvasBoundary onReady={onReady}><Canvas camera={{ position: [0, 0.35, 9], fov: 38, near: 0.1, far: 80 }} dpr={1}
    frameloop={active ? 'demand' : 'never'} gl={{ antialias: !mobile, alpha: true, powerPreference: 'low-power' }}>
    <PerformanceController mobile={mobile} active={active} onContextLost={() => setLost(true)} />
    <Scene {...scene} mobile={mobile} />
    <SceneReady onReady={onReady} />
  </Canvas></CanvasBoundary>;
}
