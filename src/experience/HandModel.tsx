import { useEffect, useState } from 'react';
import { Bone, Box3, Mesh, Texture, Vector3, type Object3D, type Material } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { FallbackHand } from './FallbackHand';
import type { ExperienceModelSource } from '../integration/cagebreakExperienceContract';

export type Finger = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
export type FingerBones = Record<Finger, Bone[]>;
export function discoverFingerBones(root: Object3D): FingerBones {
  const fingers: FingerBones = { thumb: [], index: [], middle: [], ring: [], pinky: [] };
  root.traverse(node => {
    if (!(node instanceof Bone)) return;
    for (const finger of Object.keys(fingers) as Finger[]) {
      if ((finger === 'pinky' ? /pinky|little/i : new RegExp(finger, 'i')).test(node.name)) fingers[finger].push(node);
    }
  });
  return fingers;
}
function disposeModel(root: Object3D) {
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  root.traverse(node => {
    if (!(node instanceof Mesh)) return;
    node.geometry.dispose();
    if ('skeleton' in node) (node as import('three').SkinnedMesh).skeleton.dispose();
    (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => materials.add(material));
  });
  materials.forEach(material => {
    Object.values(material).forEach(value => { if (value instanceof Texture) textures.add(value); });
    material.dispose();
  });
  textures.forEach(texture => { texture.dispose(); if (typeof ImageBitmap !== 'undefined' && texture.image instanceof ImageBitmap) texture.image.close(); });
}
export interface HandAsset extends ExperienceModelSource {
  onRigReady?: (root: Object3D, fingers: FingerBones) => void;
}
export function HandModel({ kind, mobile, progress = 0, reducedMotion, url, dracoDecoderPath, rotation = [0, 0, 0], scale = 1, onRigReady }: HandAsset & { kind: 'ai' | 'human'; mobile?: boolean; progress?: number; reducedMotion?: boolean }) {
  const [model, setModel] = useState<{ root: Object3D; center: Vector3; scale: number; url: string } | null>(null);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let owned: Object3D | undefined;
    const abort = new AbortController();
    const draco = dracoDecoderPath ? new DRACOLoader().setDecoderPath(dracoDecoderPath) : null;
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    if (draco) loader.setDRACOLoader(draco);
    void (async () => {
      try {
        const response = await fetch(url, { signal: abort.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (response.headers.get('content-type')?.includes('text/html')) throw new Error('Asset path returned HTML instead of a GLB/GLTF file');
        const bytes = await response.arrayBuffer();
        if (cancelled) return;
        const asset = await loader.parseAsync(bytes, new URL('.', new URL(url, document.baseURI)).href);
        if (cancelled) { disposeModel(asset.scene); return; }
        owned = asset.scene;
        const bounds = new Box3().setFromObject(owned);
        const size = bounds.getSize(new Vector3());
        const extent = Math.max(size.x, size.y, size.z);
        if (!Number.isFinite(extent) || extent <= 0) throw new Error('Model has no visible geometry');
        setModel({ root: owned, center: bounds.getCenter(new Vector3()).negate(), scale: 2.8 / extent, url });
      } catch (error) {
        if (!cancelled && import.meta.env.DEV) console.warn(`[CAGEBREAK] Could not load ${url}; using procedural ${kind} hand. Add a browser-ready GLB at this path.`, error);
      }
    })();
    return () => { cancelled = true; abort.abort(); draco?.dispose(); if (owned) disposeModel(owned); };
  }, [url, kind, dracoDecoderPath]);
  useEffect(() => { if (model && model.url === url) onRigReady?.(model.root, discoverFingerBones(model.root)); }, [model, url, onRigReady]);
  if (!model || model.url !== url) return <FallbackHand kind={kind} mobile={mobile} progress={progress} reducedMotion={reducedMotion} />;
  return <group rotation={rotation} scale={scale * model.scale}><group position={model.center}><primitive object={model.root} dispose={null} /></group></group>;
}
