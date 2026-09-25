import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';
import { sampleShot, pulse } from './cinematography';
import { smoothRange } from './state';
import { handshakeAt } from './handshakePose';
import { BARRIER_POSITION, glassSequence } from './glassSequence';
export function CameraController({ progress: p, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera) || size.width <= 0 || size.height <= 0) return;
    const portrait = size.width / size.height < .85;
    const shot = sampleShot([[0,-.9,.5,4.4],[.10,-1.15,.15,5.0],[.24,.05,.12,6.7],[.33,0,.12,5.35],[.445,0,.12,5.35],[.59,.1,.2,5.75],[.68,0,.1,7.1],[.73,0,.1,7.1],[.79,-.3,.3,5.35],[.853,-.3,.3,5.35],[.885,-.18,.08,4.8],[.90,-.18,.08,4.8],[.945,0,.2,1.25],[1,0,.2,.35]],p);
    if (portrait) shot[2] *= 1.35 + .65 * smoothRange(p,.16,.3) * (1-smoothRange(p,.7,.79));
    if (reducedMotion) { shot[0] = 0; shot[1] = .15; shot[2] = portrait ? 10 : 7; }
    const glass = glassSequence(p,reducedMotion);
    if (!reducedMotion && p>=.9) {
      shot[0]=BARRIER_POSITION[0]; shot[1]=BARRIER_POSITION[1];
      shot[2]=(portrait?6.48:4.8)*(1-glass.through)-.8*glass.through;
    }
    camera.fov=38+glass.impact*.7;
    const shake = reducedMotion ? 0 : pulse(p,.865,.871,.888) * .06;
    const contactView = reducedMotion ? 0 : handshakeAt(p).align;
    const cameraX = shot[0]*(1-contactView) + (portrait?.9:1.2)*contactView;
    const cameraY = shot[1]*(1-contactView) + .8*contactView;
    camera.position.set(cameraX + Math.sin(p*1600)*shake, cameraY + Math.cos(p*1200)*shake*.5, shot[2]);
    camera.lookAt(shot[0]*(1-contactView), (shot[1]-.03)*(1-contactView), (shot[2]-10)*(1-contactView));
    camera.updateProjectionMatrix(); invalidate();
  }, [camera, size.width, size.height, p, reducedMotion, invalidate]);
  return null;
}

