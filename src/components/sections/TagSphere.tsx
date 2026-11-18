"use client";

import { useEffect, useMemo, useRef } from "react";
import type { SkillGroup } from "@/data/portfolio";

type Props = {
  groups: SkillGroup[];
  /** Highlighted group id (others dim) — null highlights everything. */
  activeGroup: string | null;
  reduced: boolean;
};

/**
 * Interactive 3D tag sphere rendered with plain DOM + CSS transforms
 * (crisp text, zero WebGL cost). Tags are distributed on a Fibonacci sphere;
 * drag / pointer movement spins it, and it auto-rotates when idle.
 * Purely decorative for assistive tech — the grouped list next to it is the accessible version.
 */
export default function TagSphere({ groups, activeGroup, reduced }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const tags = useMemo(
    () => groups.flatMap((g) => g.skills.map((skill) => ({ skill, group: g.id }))),
    [groups],
  );

  // Base positions on a unit sphere (Fibonacci lattice → even spacing).
  const points = useMemo(() => {
    const n = tags.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    return tags.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
    });
  }, [tags]);

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    let rotX = 0.3;
    let rotY = 0;
    let velX = reduced ? 0 : 0.0015;
    let velY = reduced ? 0 : 0.004;
    let dragging = false;
    let last = { x: 0, y: 0 };
    let frame = 0;
    let visible = true;

    const render = () => {
      const radius = el.clientWidth * 0.4;
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      points.forEach((p, i) => {
        const node = tagRefs.current[i];
        if (!node) return;
        // Rotate around Y, then X.
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        const depth = (z2 + 1) / 2; // 0 (back) → 1 (front)
        const scale = 0.6 + depth * 0.6;
        node.style.transform = `translate(-50%, -50%) translate3d(${x1 * radius}px, ${y2 * radius}px, 0) scale(${scale})`;
        node.style.zIndex = String(Math.round(depth * 100));
        node.style.setProperty("--depth", depth.toFixed(3));
      });
    };

    const loop = () => {
      if (visible) {
        if (!dragging) {
          rotX += velX;
          rotY += velY;
          // Ease back to the idle spin after a drag fling.
          velX += ((reduced ? 0 : 0.0015) - velX) * 0.02;
          velY += ((reduced ? 0 : 0.004) - velY) * 0.02;
        }
        render();
      }
      frame = requestAnimationFrame(loop);
    };

    const down = (e: PointerEvent) => {
      dragging = true;
      last = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      velY = dx * 0.005;
      velX = -dy * 0.005;
      rotY += velY;
      rotX += velX;
    };
    const up = () => (dragging = false);

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(el);

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    render();
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [points, reduced]);

  return (
    <div
      ref={container}
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-[640px] touch-pan-y select-none [perspective:1200px] active:cursor-grabbing"
    >
      {/* Core glow */}
      <div className="absolute inset-[18%] rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-soft shadow-[0_0_30px_8px_var(--glow)]" />

      {/* Orbit rings (tilted ellipses with a travelling dot) */}
      {[
        { inset: "2%", tilt: "rotateX(74deg) rotateZ(-18deg)", dur: "22s", dir: "normal", color: "var(--accent)" },
        { inset: "9%", tilt: "rotateX(68deg) rotateY(28deg)", dur: "30s", dir: "reverse", color: "var(--accent-2)" },
      ].map((r, i) => (
        <div key={i} className="pointer-events-none absolute" style={{ inset: r.inset, transform: r.tilt, transformStyle: "preserve-3d" }}>
          <div
            className="absolute inset-0 rounded-full border border-dashed opacity-40"
            style={{ borderColor: r.color, animation: reduced ? undefined : `spin ${r.dur} linear infinite ${r.dir}` }}
          >
            <span
              className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full"
              style={{ background: r.color, boxShadow: `0 0 14px 3px ${r.color}` }}
            />
          </div>
        </div>
      ))}
      <div className="absolute left-1/2 top-1/2">
        {tags.map((t, i) => {
          const dim = activeGroup !== null && activeGroup !== t.group;
          const hot = activeGroup !== null && activeGroup === t.group;
          return (
            <span
              key={`${t.group}-${t.skill}`}
              ref={(n) => {
                tagRefs.current[i] = n;
              }}
              className={`absolute left-0 top-0 whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-xs font-medium transition-[color,background-color,filter] duration-300 md:text-sm ${
                hot ? "bg-accent-strong text-white" : "text-fg"
              }`}
              style={{
                opacity: dim ? "calc(var(--depth, 1) * 0.25 + 0.05)" : "calc(var(--depth, 1) * 0.8 + 0.2)",
                filter: "blur(calc((1 - var(--depth, 1)) * 1.2px))",
              }}
            >
              {t.skill}
            </span>
          );
        })}
      </div>
    </div>
  );
}
