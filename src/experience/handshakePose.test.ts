import { expect, it } from 'vitest';
import { Vector3 } from 'three';
import { handshakeAt, handshakePlacement } from './handshakePose';

it('aligns two right hands with opposite vertical palm planes and outward wrists', () => {
  const ai=handshakePlacement(.36,true,[0,0,0],[0,0,0]);
  const human=handshakePlacement(.36,false,[0,0,0],[0,0,0]);
  const aiNormal=new Vector3(0,0,1).applyQuaternion(ai.quaternion);
  const humanNormal=new Vector3(0,0,1).applyQuaternion(human.quaternion);
  expect(aiNormal.dot(humanNormal)).toBeCloseTo(-1);
  expect(aiNormal.y).toBeCloseTo(0);
  for (const hand of [ai,human]) {
    expect(new Vector3(-1,0,0).applyQuaternion(hand.quaternion).y).toBeGreaterThan(.98);
    expect(new Vector3(0,-1,0).applyQuaternion(hand.quaternion).y).toBeLessThan(0);
  }
  expect(new Vector3(0,-1,0).applyQuaternion(ai.quaternion).x).toBeLessThan(-.98);
  expect(new Vector3(0,-1,0).applyQuaternion(human.quaternion).x).toBeGreaterThan(.98);
  expect(human.position[2]-ai.position[2]).toBeCloseTo(.41);
});

it('contacts palms before wrapping, then releases thumbs before fingers and palms', () => {
  expect(handshakeAt(.275).phase).toBe('PRE_CONTACT');
  expect(handshakeAt(.275).wrap).toBe(0);
  expect(handshakeAt(.307).contact).toBe(1);
  expect(handshakeAt(.307).wrap).toBe(0);
  expect(handshakeAt(.36).thumb).toBe(1);
  expect(handshakeAt(.46).thumb).toBeLessThan(1);
  expect(handshakeAt(.46).wrap).toBe(1);
  expect(handshakeAt(.49).wrap).toBeLessThan(1);
  expect(handshakeAt(.475).separate).toBe(0);
  expect(handshakeAt(.49).separate).toBeGreaterThan(0);
  expect(handshakeAt(.54).wrap).toBe(0);
  expect(handshakeAt(.54).separate).toBe(1);
});

it('has a single bounded shake, disables it for reduced motion, and reverses exactly', () => {
  const original=handshakeAt(.38);
  handshakeAt(.8);
  expect(handshakeAt(.38)).toEqual(original);
  expect(Math.abs(original.shake)).toBeLessThan(.036);
  expect(handshakeAt(.38,true).shake).toBe(0);
  expect(handshakeAt(.44).shake).toBe(0);
});
