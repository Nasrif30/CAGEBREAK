import { BufferAttribute, BufferGeometry, MeshBasicMaterial } from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
const blend = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
function ellipsoid(x: number, y: number, z: number, rx: number, ry: number, rz: number) {
  return (Math.hypot(x / rx, y / ry, z / rz) - 1) * Math.min(rx, ry, rz);
}
const digits = [
  [-.34, .40, 0, -.42, 1.34, .12, .115, .074],
  [-.10, .47, 0, -.10, 1.51, .15, .122, .078],
  [.15, .42, 0, .20, 1.37, .17, .112, .072],
  [.36, .25, 0, .48, 1.04, .19, .096, .062],
  [-.35, -.22, .05, -.71, .13, .19, .17, .12],
  [-.71, .13, .19, -.88, .50, .25, .12, .086],
];
// CPU-only templates, bounded to the two supported quality tiers. GPU instances are owned/disposed by each hand.
const templates = new Map<number, BufferGeometry>();
/** Elliptical wrist becoming a gently asymmetric forearm, continuing off-screen. */
export function forearmProfile(y: number) {
  const t=Math.max(0,-y-.65);
  return {x:.025-.07*Math.pow(Math.max(0,-y-1.9),1.6),z:-.02,
    rx:.225+.24*(1-Math.exp(-t*.30)),rz:.15+.19*(1-Math.exp(-t*.27))};
}
/** Static smooth unions join tapered digits, thumb pad, palm and wrist. */
export function createHandGeometry(resolution = 64) {
  const cached = templates.get(resolution);
  if (cached) return cached.clone();
  const temporaryMaterial = new MeshBasicMaterial();
  const field = new MarchingCubes(resolution, temporaryMaterial, false, false, 40000);
  field.isolation = 0;
  for (let z = 0; z < resolution; z++) for (let y = 0; y < resolution; y++) for (let x = 0; x < resolution; x++) {
    const px = (x / resolution * 2 - 1) * 1.9;
    const py = (y / resolution * 2 - 1) * 1.9;
    const pz = (z / resolution * 2 - 1) * .7;
    let distance = ellipsoid(px, py, pz, .47, .62, .185);
    distance = blend(distance, ellipsoid(px + .19, py + .24, pz - .035, .29, .38, .19), .13);
    const arm=forearmProfile(py);
    const wrist=Math.max((Math.hypot((px-arm.x)/arm.rx,(pz-arm.z)/arm.rz)-1)*arm.rz,py+.48);
    distance = blend(distance, wrist, .15);
    for (const [ax, ay, az, bx, by, bz, ra, rb] of digits) {
      const dx = bx - ax, dy = by - ay, dz = bz - az;
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy + (pz - az) * dz) / (dx * dx + dy * dy + dz * dz)));
      const radius = ra + (rb - ra) * t;
      const knuckle = .008 * Math.exp(-Math.pow((t - .35) / .09, 2)) + .005 * Math.exp(-Math.pow((t - .70) / .07, 2));
      const digit = Math.hypot(px - ax - dx * t, py - ay - dy * t, (pz - az - dz * t) * 1.08) - radius - knuckle;
      distance = blend(distance, digit, .075);
    }
    field.field[x + resolution * (y + resolution * z)] = -distance;
  }
  field.update();
  const geometry = new BufferGeometry();
  for (const name of ['position', 'normal']) {
    const attribute = field.geometry.getAttribute(name);
    geometry.setAttribute(name, new BufferAttribute(new Float32Array(attribute.array.slice(0, field.count * 3)), 3));
  }
  geometry.scale(1.9, 1.9, .7);
  // Continue the same wrist cross-section beyond the marching field. Shared material,
  // open distal end and overlap at the field boundary avoid a detached wrist cap.
  const positions=Array.from(geometry.getAttribute('position').array);
  const normals=Array.from(geometry.getAttribute('normal').array);
  const segments=resolution<=56?16:24, rows=18;
  const point=(row:number,j:number)=>{
    const y=-1.78-row/rows*8.5,arm=forearmProfile(y),angle=j/segments*Math.PI*2;
    const anatomy=1+.025*Math.sin(angle*3)*Math.min(1,row/4);
    return [arm.x+Math.cos(angle)*arm.rx*anatomy,y,arm.z+Math.sin(angle)*arm.rz*anatomy];
  };
  for(let row=0;row<rows;row++) for(let j=0;j<segments;j++) {
    const a=point(row,j),b=point(row,j+1),c=point(row+1,j),d=point(row+1,j+1);
    positions.push(...a,...b,...c,...b,...d,...c);
    for(const v of [a,b,c,b,d,c]) {
      const arm=forearmProfile(v[1]),next=forearmProfile(v[1]-.01);
      const nx=(v[0]-arm.x)/(arm.rx*arm.rx),nz=(v[2]-arm.z)/(arm.rz*arm.rz);
      const ny=nx*(next.x-arm.x)/.01+(next.rx-arm.rx)/(.01*arm.rx)+(next.rz-arm.rz)/(.01*arm.rz);
      const length=Math.hypot(nx,ny,nz);normals.push(nx/length,ny/length,nz/length);
    }
  }
  geometry.setAttribute('position',new BufferAttribute(new Float32Array(positions),3));
  geometry.setAttribute('normal',new BufferAttribute(new Float32Array(normals),3));
  geometry.computeBoundingSphere();
  field.geometry.dispose(); temporaryMaterial.dispose();
  if (resolution === 56 || resolution === 88) templates.set(resolution, geometry.clone());
  return geometry;
}

