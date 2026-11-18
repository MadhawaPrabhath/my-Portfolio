"use client";

/**
 * Hero 3D scene — "coding" theme (loaded lazily via next/dynamic).
 *  - A field of floating syntax glyphs ({ }, </>, =>, …) rendered as camera-facing sprites
 *  - A neon grid floor that scrolls toward the viewer
 *  - Depth fog so far glyphs fade into the background
 * Everything parallaxes with the mouse. `lite` halves the glyph count and lowers pixel ratio.
 */
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/lib/store";

const GLYPHS = ["{ }", "</>", "( )", "=>", ";", "[ ]", "&&", "//", "++", "!=", "$_", "λ", "0x1F", "async", "fn()", "</>", "{ }", "=>"];

const PALETTE = {
  dark: { bg: "#08080c", glyphs: ["#a895ff", "#7c5cff", "#3dd6f5", "#9a9ab0"], grid: "#7c5cff", gridFaint: "#2a2540" },
  light: { bg: "#f6f6fb", glyphs: ["#5b3fe6", "#7c5cff", "#0891b2", "#55556a"], grid: "#7c5cff", gridFaint: "#d9d4f5" },
};

/** Small seeded PRNG → deterministic, pure layout. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Draws a glyph onto a canvas → texture (uses the site's mono font). */
function makeGlyphTexture(text: string) {
  const font = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim() || "monospace";
  const size = 96;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `600 ${size}px ${font}`;
  const w = Math.ceil(ctx.measureText(text).width) + 24;
  canvas.width = w;
  canvas.height = size + 32;
  ctx.font = `600 ${size}px ${font}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 12, canvas.height / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, aspect: canvas.width / canvas.height };
}

type Glyph = { text: string; pos: [number, number, number]; scale: number; color: number; speed: number; phase: number };

function GlyphField({ count, colors, spread }: { count: number; colors: string[]; spread: number }) {
  const group = useRef<THREE.Group>(null);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);

  // Layout: spread across a wide box, deeper ones further back.
  const glyphs = useMemo<Glyph[]>(() => {
    const rand = mulberry32(42);
    return Array.from({ length: count }, (_, i) => ({
      text: GLYPHS[i % GLYPHS.length],
      // Keep every glyph well behind the text plane (z ≤ -1) so none balloon in front of the copy.
      pos: [(rand() - 0.5) * spread, (rand() - 0.5) * 10, -1 - rand() * 11],
      scale: 0.25 + rand() * 0.3,
      color: Math.floor(rand() * 4),
      speed: 0.2 + rand() * 0.5,
      phase: rand() * Math.PI * 2,
    }));
  }, [count, spread]);

  // One texture per unique glyph, shared by every sprite that uses it.
  const textures = useMemo(() => {
    const map = new Map<string, ReturnType<typeof makeGlyphTexture>>();
    GLYPHS.forEach((g) => !map.has(g) && map.set(g, makeGlyphTexture(g)));
    return map;
  }, []);

  useEffect(() => () => textures.forEach(({ tex }) => tex.dispose()), [textures]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    glyphs.forEach((g, i) => {
      const s = sprites.current[i];
      if (!s) return;
      s.position.y = g.pos[1] + Math.sin(t * g.speed + g.phase) * 0.25;
      s.material.rotation = Math.sin(t * g.speed * 0.5 + g.phase) * 0.08;
    });
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, state.pointer.x * 0.12, 0.04);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -state.pointer.y * 0.08, 0.04);
    }
  });

  return (
    <group ref={group}>
      {glyphs.map((g, i) => {
        const { tex, aspect } = textures.get(g.text)!;
        return (
          <sprite
            key={i}
            ref={(s) => {
              sprites.current[i] = s;
            }}
            position={g.pos}
            scale={[g.scale * aspect, g.scale, 1]}
          >
            <spriteMaterial map={tex} color={colors[g.color]} transparent opacity={0.6} depthWrite={false} fog />
          </sprite>
        );
      })}
    </group>
  );
}

/** Grid floor that scrolls toward the camera (one cell per loop → seamless). */
function GridFloor({ color, faint }: { color: string; faint: string }) {
  const grid = useRef<THREE.GridHelper>(null);
  const helper = useMemo(() => {
    const g = new THREE.GridHelper(60, 60, color, faint);
    const mat = g.material as THREE.Material;
    mat.transparent = true;
    mat.opacity = 0.35;
    return g;
  }, [color, faint]);

  useEffect(() => () => helper.geometry.dispose(), [helper]);

  useFrame((_, delta) => {
    if (grid.current) grid.current.position.z = (grid.current.position.z + delta * 0.6) % 1;
  });

  return <primitive ref={grid} object={helper} position={[0, -3.2, 0]} />;
}

/** Camera eases toward the pointer for a parallax feel. */
function CameraRig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.6, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.4 + pointer.y * 0.3, 0.03);
    camera.lookAt(0, 0, -3);
  });
  return null;
}

type SceneProps = {
  lite?: boolean;
  /** Element whose pointer events drive the scene (the whole hero, so text overlays don't block it). */
  eventSource: RefObject<HTMLElement | null>;
};

export default function CodeScene({ lite = false, eventSource }: SceneProps) {
  const theme = useTheme();
  const colors = PALETTE[theme];
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Stop rendering entirely when the hero is scrolled out of view.
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={lite ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 0.4, 6], fov: 50 }}
        gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
        eventSource={eventSource as RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <fog attach="fog" args={[colors.bg, 5, 15]} />
        <CameraRig />
        {/* Narrower spread on phones so the glyphs stay on-screen */}
        <GlyphField count={lite ? 18 : 42} spread={lite ? 9 : 22} colors={colors.glyphs} />
        <GridFloor color={colors.grid} faint={colors.gridFaint} />
      </Canvas>
    </div>
  );
}
