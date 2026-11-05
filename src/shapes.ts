import type { Theme } from "./gift.ts";

export interface ShapeData {
  positions: Float32Array;
  colors: Float32Array;
}

export function createShape(theme: Theme, count: number): ShapeData {
  if (!Number.isInteger(count) || count < 100 || count > 40000)
    throw new Error("Invalid particle count.");
  let seed = 18731;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const put = (
    i: number,
    x: number,
    y: number,
    z: number,
    r: number,
    g: number,
    b: number,
  ) => {
    positions.set([x, y, z], i * 3);
    colors.set([r, g, b], i * 3);
  };
  for (let i = 0; i < count; i++) {
    const part = i / count;
    const light = 0.65 + random() * 0.35;
    if (theme === "rose") {
      if (part < 0.77) {
        const layer = Math.floor(random() * 7);
        const petals = 5 + layer;
        const petal = Math.floor(random() * petals);
        const t = Math.sqrt(random());
        const u = (random() - 0.5) * 2;
        const angle =
          (petal / petals) * Math.PI * 2 +
          layer * 1.93 +
          u *
            (Math.PI / petals) *
            1.45 *
            (0.22 + 0.78 * Math.sin(t * Math.PI * 0.78));
        const outer = 0.27 + layer * 0.155;
        const radius =
          (0.07 + outer * Math.sin(t * Math.PI * 0.53)) * (1 - 0.13 * u * u);
        const curl = 0.22 * Math.pow(Math.abs(u), 3) * t;
        const z =
          0.72 -
          layer * 0.075 +
          0.35 * Math.sin(t * Math.PI) -
          0.45 * t * t +
          curl;
        put(
          i,
          radius * Math.cos(angle),
          0.95 + radius * Math.sin(angle) * 0.87,
          z,
          light * (0.79 + t * 0.18),
          light * (0.18 + t * 0.24 + curl),
          light * (0.32 + t * 0.22),
        );
      } else if (part < 0.86) {
        const t = random();
        const angle = random() * Math.PI * 2;
        put(
          i,
          0.075 * Math.sin(t * 5) + 0.027 * Math.cos(angle),
          0.7 - t * 2.85,
          -0.12 + 0.027 * Math.sin(angle),
          0.24 * light,
          0.49 * light,
          0.34 * light,
        );
      } else {
        const side = i % 2 ? 1 : -1;
        const t = random(),
          u = (random() - 0.5) * 2;
        const width = Math.sin(Math.PI * t) * 0.22;
        const x = side * (0.02 + t * 0.83);
        const y = (side === 1 ? -0.75 : -1.25) + t * 0.55 + u * width;
        put(
          i,
          x,
          y,
          -0.13 + Math.sin(t * Math.PI) * 0.15 + Math.abs(u) * 0.1,
          0.24 * light,
          0.55 * light,
          0.36 * light,
        );
      }
    } else if (part < 0.66) {
      const angle = random() * Math.PI * 2;
      const tube = random() * Math.PI * 2;
      const radius = 0.98 + Math.cos(tube) * 0.09;
      put(
        i,
        Math.cos(angle) * radius,
        -0.3 + Math.sin(angle) * radius,
        Math.sin(tube) * 0.09,
        0.78 * light,
        0.84 * light,
        0.95 * light,
      );
    } else if (part < 0.94) {
      const facet = Math.floor(random() * 8);
      const top = random() > 0.58;
      const a = (facet / 8) * Math.PI * 2,
        b = ((facet + 1) / 8) * Math.PI * 2;
      const t = Math.sqrt(random()),
        u = random();
      const ringX = (Math.cos(a) * (1 - u) + Math.cos(b) * u) * 0.5;
      const ringZ = (Math.sin(a) * (1 - u) + Math.sin(b) * u) * 0.5;
      const radius = top ? 0.58 + 0.42 * t : t;
      put(
        i,
        ringX * radius,
        top ? 1.83 - 0.34 * t : 0.92 + 0.57 * t,
        ringZ * radius,
        0.7 * light,
        0.85 * light,
        light,
      );
    } else {
      const side = i % 4;
      const angle = (side / 4) * Math.PI * 2 + Math.PI / 4;
      const t = random();
      put(
        i,
        Math.cos(angle) * (0.2 + 0.2 * t),
        0.55 + t * 0.91,
        Math.sin(angle) * (0.2 + 0.2 * t),
        0.85 * light,
        0.8 * light,
        0.69 * light,
      );
    }
  }
  return { positions, colors };
}
