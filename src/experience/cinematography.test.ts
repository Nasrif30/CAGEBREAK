import { expect, it } from 'vitest';
import { colorStory, handPose, pulse, sampleShot } from './cinematography';
import { buildFallbackRig, poseFallbackRig } from './fallbackRig';
import { createHandGeometry } from './handGeometry';

it('replays the same color and shot when scrolling backward', () => {
  const keys = [[0, -1, 0, 4], [.4, 0, 0, 5], [1, 0, 1, 1]] as const;
  const before = { color: colorStory(.38), shot: sampleShot(keys, .38) };
  colorStory(.9); sampleShot(keys, .9);
  expect({ color: colorStory(.38), shot: sampleShot(keys, .38) }).toEqual(before);
  expect(colorStory(0).light).not.toBe(colorStory(.8).light);
  expect(pulse(.80, .868, .871, .878)).toBe(0);
  expect(pulse(.90, .868, .871, .878)).toBe(0);
});

it('weights every vertex and restores the articulated gesture on reverse', () => {
  const geometry = createHandGeometry(48);
  const rig = buildFallbackRig(geometry);
  const weights = geometry.getAttribute('skinWeight');
  for (let i=0; i<weights.count; i++) {
    expect(weights.getX(i)+weights.getY(i)+weights.getZ(i)+weights.getW(i)).toBeCloseTo(1,5);
  }
  poseFallbackRig(rig, handPose(.81,true),true);
  expect(rig.chains[1][0].rotation.x).toBeLessThan(.1);
  expect(rig.chains[0][0].rotation.x).toBeGreaterThan(1);
  const gesture = rig.skeleton.bones.map(bone=>bone.quaternion.toArray());
  poseFallbackRig(rig, handPose(.89,true),true);
  expect(rig.forearm.position.z).toBeLessThan(-.4);
  poseFallbackRig(rig, handPose(.81,true),true);
  expect(rig.skeleton.bones.map(bone=>bone.quaternion.toArray())).toEqual(gesture);
  poseFallbackRig(rig, handPose(.1,true),true);
  expect(rig.forearm.position.z).toBeCloseTo(0);
  expect(rig.chains[0][0].rotation.x).toBeLessThan(.1);
  geometry.dispose(); rig.skeleton.dispose();
});
