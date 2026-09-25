import { useEffect, useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { environmentAt } from './environmentStory';
/** Local studio reflection map, baked once; no remote textures or per-frame effects. */
export function StudioEnvironment({ progress=0 }: { progress?:number }) {
  const { gl, scene, invalidate } = useThree();
  useLayoutEffect(()=>{
    const light=environmentAt(progress);
    scene.environmentIntensity=(1-light.danger*.6)*light.life;
    invalidate();
    return ()=>{scene.environmentIntensity=1;};
  },[progress,scene,invalidate]);
  useEffect(() => {
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(gl);
    const target = generator.fromScene(room, .06, .1, 100, { size: 128 });
    const previous = scene.environment;
    scene.environment = target.texture;
    room.dispose(); generator.dispose(); invalidate();
    return () => { scene.environment = previous; target.dispose(); };
  }, [gl, scene, invalidate]);
  return null;
}
