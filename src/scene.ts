import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import type { Theme } from "./gift";
import { createShape } from "./shapes";

export type SceneState = "display" | "waiting" | "opened";
export interface Sculpture {
  setState: (state: SceneState) => void;
  setPaused: (paused: boolean) => void;
  dispose: () => void;
}

const vertexShader = `
  attribute vec3 color;
  attribute vec3 scatter;
  attribute float seed;
  uniform float progress;
  uniform float time;
  uniform float pixelRatio;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float p = smoothstep(seed * .18, .78 + seed * .22, progress);
    vec3 point = mix(scatter, position, p);
    point.x += sin(time * .45 + seed * 40.) * .02 * p;
    vec4 mv = modelViewMatrix * vec4(point, 1.);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((1.4 + seed * 1.7) * pixelRatio * (4.8 / -mv.z), 1., 5.);
    vColor = color * (1.05 + .25 * sin(seed * 80. + time));
    vAlpha = .5 + p * .4;
  }
`;
const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - .5) * 2.;
    if(d > 1.) discard;
    float core = 1. - smoothstep(.1, 1., d);
    gl_FragColor = vec4(vColor, core * vAlpha);
  }
`;

export function createSculpture(
  host: HTMLElement,
  theme: Theme,
  initial: SceneState,
): Sculpture {
  let destroyed = false,
    failed = false,
    paused = false,
    inView = true,
    frame = 0;
  let state = initial,
    progress = initial === "waiting" ? 0.01 : 1;
  let previous = 0,
    elapsed = 0,
    lastDraw = 0;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  host.dataset.theme = theme;
  host.dataset.motion = motion.matches ? "reduced" : "full";
  const inert: Sculpture = {
    setState: () => {},
    setPaused: () => {},
    dispose: () => {},
  };
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  let renderer: WebGLRenderer;
  try {
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!context) {
      host.dataset.renderer = "fallback";
      return inert;
    }
    renderer = new WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: false,
    });
  } catch {
    host.dataset.renderer = "fallback";
    return inert;
  }
  renderer.setClearColor(new Color("#140e18"), 0);
  const pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(pixelRatio);
  const scene = new Scene();
  const camera = new PerspectiveCamera(37, 1, 0.1, 40);
  camera.position.set(0, 0.04, 7.5);
  const group = new Group();
  scene.add(group);
  const count = host.clientWidth < 600 ? 15000 : 25000;
  const data = createShape(theme, count);
  const scatter = new Float32Array(count * 3),
    seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const s = (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;
    const seed = Math.abs(s);
    seeds[i] = seed;
    const a = i * 2.399963;
    const radius = 1.4 + seed * 2;
    scatter.set(
      [Math.cos(a) * radius, Math.sin(a) * radius * 0.65, (seed - 0.5) * 3],
      i * 3,
    );
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(data.positions, 3));
  geometry.setAttribute("color", new BufferAttribute(data.colors, 3));
  geometry.setAttribute("scatter", new BufferAttribute(scatter, 3));
  geometry.setAttribute("seed", new BufferAttribute(seeds, 1));
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      progress: { value: progress },
      time: { value: 0 },
      pixelRatio: { value: pixelRatio },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const points = new Points(geometry, material);
  group.add(points);
  host.append(canvas);
  host.dataset.renderer = "webgl";

  const draw = () => {
    if (destroyed || failed) return;
    material.uniforms.progress.value = motion.matches ? 1 : progress;
    material.uniforms.time.value = motion.matches ? 0 : elapsed;
    group.rotation.y = motion.matches
      ? -0.12
      : Math.sin(elapsed * 0.13) * (theme === "ring" ? 0.55 : 0.22) - 0.12;
    group.rotation.z = theme === "rose" ? -0.12 : -0.035;
    renderer.render(scene, camera);
    host.dataset.progress = progress.toFixed(2);
  };
  const tick = (now: number) => {
    frame = 0;
    if (
      destroyed ||
      failed ||
      document.hidden ||
      !inView ||
      motion.matches ||
      paused
    )
      return;
    const dt = previous ? (now - previous) / 1000 : 0;
    previous = now;
    elapsed += dt;
    const target = state === "waiting" ? 0.01 : 1;
    progress = Math.min(target, progress + dt / 2.6);
    if (now - lastDraw > 1000 / 30) {
      draw();
      lastDraw = now;
    }
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (motion.matches || paused)
      progress = state === "waiting" && !motion.matches ? 0.01 : 1;
    host.dataset.motion = motion.matches
      ? "reduced"
      : paused
        ? "paused"
        : "full";
    draw();
    if (
      !document.hidden &&
      inView &&
      !motion.matches &&
      !paused &&
      !failed &&
      !destroyed
    )
      frame = requestAnimationFrame(tick);
  };
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height || destroyed || failed) return;
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 0.75 ? 9 : 7.5;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    draw();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  });
  intersection.observe(host);
  const visibility = () => sync();
  const lost = (event: Event) => {
    event.preventDefault();
    failed = true;
    cancelAnimationFrame(frame);
    host.dataset.renderer = "fallback";
    canvas.hidden = true;
  };
  canvas.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", visibility);
  motion.addEventListener("change", sync);
  resize();
  sync();
  return {
    setState(next) {
      state = next;
      if (next === "waiting") progress = 0.01;
      sync();
    },
    setPaused(value) {
      paused = value;
      sync();
    },
    dispose() {
      destroyed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", sync);
      canvas.removeEventListener("webglcontextlost", lost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
