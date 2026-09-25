import { clampProgress, smoothRange } from './state';
import { handshakeAt } from './handshakePose';
export type ShotKey = readonly [number, number, number, number];
export function sampleShot(keys: readonly ShotKey[], progress: number): [number, number, number] {
  const p = clampProgress(progress);
  let i = 1;
  while (i < keys.length - 1 && p > keys[i][0]) i++;
  const a = keys[i - 1], b = keys[i];
  const t = smoothRange(p, a[0], b[0]);
  return [a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t];
}
const colorKeys: readonly (readonly [number, string, string])[] = [
  [0, '#c6d7e1', '#738e9f'], [.18, '#c7dce4', '#7d9caa'],
  [.34, '#dedbd0', '#99a5a4'], [.45, '#e4d7bd', '#aa9277'],
  [.56, '#d9b780', '#a66e4d'], [.66, '#d38a70', '#9b493d'],
  [.76, '#852b40', '#3d1423'], [.855, '#711c32', '#290c19'],
  [.90, '#280b12', '#10090d'], [.94, '#08090b', '#050608'],
  [1, '#181a1e', '#111317'],
];
function mixHex(a: string, b: string, t: number) {
  const rgb = [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t));
  return `rgb(${rgb.join(',')})`;
}
export function colorStory(p: number) {
  p = clampProgress(p);
  let i = 1;
  while (i < colorKeys.length - 1 && p > colorKeys[i][0]) i++;
  const a = colorKeys[i - 1], b = colorKeys[i], t = smoothRange(p, a[0], b[0]);
  return { light: mixHex(a[1], b[1], t), dark: mixHex(a[2], b[2], t), ink: p > .70 && p < .975 ? '#f5ece4' : '#273640' };
}
export const pulse = (p: number, start: number, peak: number, end: number) => smoothRange(p, start, peak) * (1 - smoothRange(p, peak, end));
export function handPose(p: number, ai: boolean) {
  const handshake = handshakeAt(p);
  const hold = handshake.wrap;
  const threat = ai ? smoothRange(p, .73, .785) : 0;
  const impact = ai ? smoothRange(p, .852, .87) : 0;
  return { hold, threat, impact, handshake };
}
export const captions = [
  { start: .005, end: .065, text: 'CAGEBREAK', large: false },
  { start: .075, end: .14, text: 'COOPERATION.', large: false },
  { start: .155, end: .205, text: 'TWO AGENTS.', large: false },
  { start: .215, end: .27, text: 'ONE SHARED SPACE.', large: false },
  { start: .34, end: .435, text: 'TRUST.', large: false },
  { start: .465, end: .52, text: 'BUT WHAT HAPPENS', large: true },
  { start: .535, end: .60, text: 'WHEN THE PERSONA CHANGES?', large: true },
  { start: .66, end: .717, text: 'BEHAVIOR DRIFTS.', large: false },
  { start: .78, end: .838, text: 'THE CAGE BREAKS.', large: false },
] as const;

