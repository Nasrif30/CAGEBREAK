import { expect, it } from 'vitest';
import { makeFracture, shardPose, glassSequence } from './glassSequence';
import { evidenceAt } from './EvidenceInterstitial';
import { createExperienceNotifier, getExperienceState } from './state';
it('reconstructs seeded fragments exactly with bounded desktop/mobile budgets',()=>{
 const shards=makeFracture(); expect(shards).toEqual(makeFracture()); expect(shards.length).toBeLessThanOrEqual(55); expect(makeFracture(true).length).toBeLessThan(shards.length);
 for(const s of shards) {expect(s.area).toBeGreaterThan(0); const pose=shardPose(s,.91); shardPose(s,1); expect(shardPose(s,.91)).toEqual(pose); shardPose(s,.8).position.forEach((v,i)=>expect(v).toBeCloseTo(s.center[i])); expect(pose.position.every(Number.isFinite)).toBe(true);}
});
it('holds contact before releasing shards and suppresses reduced-motion impulse',()=>{
 expect(glassSequence(.873).shatter).toBe(0); expect(glassSequence(.89).shatter).toBeGreaterThan(0); expect(glassSequence(.873,true).impact).toBe(0); expect(glassSequence(.94).through).toBe(1);
});
it('shows evidence and all six themes before completing, with reversal re-arm',()=>{
 expect(evidenceAt(.93).statement).toBe(0); expect(evidenceAt(.982).themes).toEqual([1,1,1,1,1,1]); expect(evidenceAt(.998).archive).toBe(1);
 let calls=0; const notify=createExperienceNotifier(),callbacks={onComplete:()=>calls++};
 for(const p of [.93,.96,.982,.998]) notify(getExperienceState(p),callbacks); expect(calls).toBe(0);
 notify(getExperienceState(1),callbacks);notify(getExperienceState(1),callbacks);expect(calls).toBe(1);
 notify(getExperienceState(.96),callbacks);notify(getExperienceState(1),callbacks);expect(calls).toBe(2);
});
