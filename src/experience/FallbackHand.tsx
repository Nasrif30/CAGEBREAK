import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { MeshPhysicalMaterial, SkinnedMesh } from 'three';
import { createHandGeometry } from './handGeometry';
import { buildFallbackRig, poseFallbackRig } from './fallbackRig';
import { handPose } from './cinematography';
import { smoothRange } from './state';

export function FallbackHand({ kind, mobile = false, progress = 0, reducedMotion = false }: { kind: 'ai' | 'human'; mobile?: boolean; progress?: number; reducedMotion?: boolean }) {
  const ai = kind === 'ai';
  const { invalidate } = useThree();
  const geometry = useMemo(() => createHandGeometry(mobile ? 56 : 88), [mobile]);
  const material = useMemo(() => new MeshPhysicalMaterial({
    color: ai ? '#c7d5d8' : '#bda38e', metalness: ai ? .2 : 0, roughness: ai ? .24 : .61,
    clearcoat: ai ? .5 : 0, clearcoatRoughness: .3,
    transmission: ai && !mobile ? .12 : 0, thickness: .36, ior: 1.4,
    emissive: ai ? '#668294' : '#000000', emissiveIntensity: .04,
    envMapIntensity: ai ? .58 : .3,
  }), [ai, mobile]);
  const { rig, mesh } = useMemo(() => {
    const rig = buildFallbackRig(geometry);
    const hand = new SkinnedMesh(geometry, material);
    hand.add(rig.root); hand.bind(rig.skeleton); hand.frustumCulled = false;
    return { rig, mesh: hand };
  }, [geometry, material]);
  useLayoutEffect(() => {
    poseFallbackRig(rig, handPose(progress, ai), ai);
    const tension = smoothRange(progress,.47,.67) * (1-smoothRange(progress,.83,.86));
    if (ai) material.emissiveIntensity = .04 + handPose(progress, ai).hold * .05 + (reducedMotion ? 0 : Math.sin(progress*277)*.012*tension);
    mesh.updateMatrixWorld(true); invalidate();
  }, [progress, ai, rig, material, mesh, reducedMotion, invalidate]);
  useEffect(() => () => { geometry.dispose(); rig.skeleton.dispose(); }, [geometry, rig]);
  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={mesh} dispose={null} />;
}

