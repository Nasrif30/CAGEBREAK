import { expect, it } from 'vitest';
import { createHandGeometry } from './handGeometry';
it('produces finite bounded geometry within the mobile triangle budget', () => {
  const geometry = createHandGeometry(48);
  const positions = geometry.getAttribute('position');
  expect(positions.count).toBeGreaterThan(1000);
  expect(positions.count / 3).toBeLessThan(15000);
  expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
  expect(Array.from(geometry.getAttribute('normal').array).every(Number.isFinite)).toBe(true);
  geometry.computeBoundingBox();
  expect(geometry.boundingBox!.max.y).toBeGreaterThan(1.5);
  expect(geometry.boundingBox!.min.y).toBeLessThan(-10);
  geometry.dispose();
});
