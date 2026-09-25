import { expect,it } from 'vitest';
import { environmentAt,atmospherePoints } from './environmentStory';
it('warms asymmetrically before danger and collapses illumination after impact',()=>{
 expect(environmentAt(.38).contact).toBeGreaterThan(.8);
 expect(environmentAt(.55).warm).toBeGreaterThan(0);
 expect(environmentAt(.55).danger).toBe(0);
 expect(environmentAt(.81).fill).toBeLessThan(environmentAt(.2).fill);
 expect(environmentAt(.94).life).toBe(0);
 expect(environmentAt(.97).particles).toBe(0);
});
it('reverses exactly, suppresses motion effects and bounds particle tiers',()=>{
 const frame=environmentAt(.68);environmentAt(.99);expect(environmentAt(.68)).toEqual(frame);
 expect(environmentAt(.872,true).flash).toBe(0);expect(environmentAt(.68,true).distortion).toBe(0);
 expect(atmospherePoints(false)).toEqual(atmospherePoints(false));expect(atmospherePoints(false)).toHaveLength(26);expect(atmospherePoints(true)).toHaveLength(8);
});
