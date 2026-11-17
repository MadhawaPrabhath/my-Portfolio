"use client";

/**
 * Hero 3D scene (loaded lazily via next/dynamic — never part of the initial bundle).
 *  - A noise-displaced "data blob" with a fresnel glow (custom shader)
 *  - Two thin orbit rings
 *  - A sparse particle field with mouse parallax
 * `lite` lowers polygon count, particle count and pixel ratio for phones/tablets.
 */
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { blobFragment, blobVertex } from "./shaders";
import { useTheme } from "@/lib/store";

const PALETTE = {
  dark: { a: "#7c5cff", b: "#3dd6f5", particles: "#a895ff", ring: "#7c5cff" },
  light: { a: "#7c5cff", b: "#22d3ee", particles: "#5b3fe6", ring: "#5b3fe6" },
};

type Colors = (typeof PALETTE)["dark"];

/** Small seeded PRNG so particle layout is deterministic. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Blob({ lite, colors, light }: { lite: boolean; colors: Colors; light: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const lastPointer = useRef(new THREE.Vector2());
  const energy = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0.28 },
      uMouse: { value: new THREE.Vector2() },
      uColorA: { value: new THREE.Color(colors.a) },
      uColorB: { value: new THREE.Color(colors.b) },
      uLight: { value: light ? 1 : 0 },
    }),
    // Uniform objects are created once; colours are updated below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const m = material.current;
    if (!m) return;
    (m.uniforms.uColorA.value as THREE.Color).set(colors.a);
    (m.uniforms.uColorB.value as THREE.Color).set(colors.b);
    m.uniforms.uLight.value = light ? 1 : 0;
  }, [colors, light]);

  useFrame((state, delta) => {
    const m = material.current;
    if (!m || !mesh.current) return;
    const { pointer } = state;

    // Pointer speed adds "energy" → the surface ripples harder, then calms down.
    const speed = pointer.distanceTo(lastPointer.current) / Math.max(delta, 1e-3);
    lastPointer.current.copy(pointer);
    energy.current = THREE.MathUtils.lerp(energy.current, Math.min(speed * 0.04, 0.25), 0.05);

    m.uniforms.uTime.value += delta;
    m.uniforms.uIntensity.value = 0.26 + energy.current;
    (m.uniforms.uMouse.value as THREE.Vector2).lerp(pointer, 0.05);

    // Ease toward the cursor + slow idle spin.
    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, pointer.x * 0.6 + state.clock.elapsedTime * 0.08, 0.04);
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, -pointer.y * 0.4, 0.04);
  });

  return (
    <mesh ref={mesh}>
      {/* detail 40 ≈ 33k triangles on desktop; 18 ≈ 7k on mobile */}
      <icosahedronGeometry args={[1.45, lite ? 18 : 40]} />
      <shaderMaterial ref={material} vertexShader={blobVertex} fragmentShader={blobFragment} uniforms={uniforms} />
    </mesh>
  );
}

function Rings({ color }: { color: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.z += delta * 0.1;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 1.2 + state.pointer.y * 0.2, 0.03);
  });
  return (
    <group ref={group} rotation={[1.2, 0.3, 0]}>
      <mesh>
        <torusGeometry args={[2.35, 0.006, 6, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[0.4, 0.5, 0]}>
        <torusGeometry args={[2.75, 0.004, 6, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function Particles({ count, color }: { count: number; color: string }) {
  const points = useRef<THREE.Points>(null);

  // Pseudo-random points in a spherical shell (radius 3–9). Seeded → pure & stable across renders.
  const positions = useMemo(() => {
    const rand = mulberry32(1337);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + rand() * 6;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * 0.02;
    points.current.position.x = THREE.MathUtils.lerp(points.current.position.x, state.pointer.x * 0.35, 0.03);
    points.current.position.y = THREE.MathUtils.lerp(points.current.position.y, state.pointer.y * 0.35, 0.03);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={color} transparent opacity={0.75} sizeAttenuation depthWrite={false} />
    </points>
  );
}

type SceneProps = {
  lite?: boolean;
  /** Element whose pointer events drive the scene (the whole hero, so text overlays don't block it). */
  eventSource: RefObject<HTMLElement | null>;
};

export default function HeroScene({ lite = false, eventSource }: SceneProps) {
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
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
        eventSource={eventSource as RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <group position={lite ? [0, 1.25, 0] : [1.9, 0, 0]} scale={lite ? 0.5 : 0.92}>
          <Blob lite={lite} colors={colors} light={theme === "light"} />
          <Rings color={colors.ring} />
        </group>
        <Particles count={lite ? 350 : 1200} color={colors.particles} />
      </Canvas>
    </div>
  );
}
