"use client";

import { useEffect, useRef } from "react";
import { useIsTouch, useReducedMotion } from "@/hooks/useMediaQuery";

/**
 * Custom cursor: a dot that tracks the pointer exactly, and a ring that
 * trails behind and grows over interactive elements.
 * Only mounted on fine-pointer (mouse) devices without reduced motion.
 */
export default function Cursor() {
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();
  const enabled = !isTouch && !reduced;

  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-custom-cursor");

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let hovering = false;
    let pressed = false;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = e.target as HTMLElement | null;
      hovering = !!target?.closest("a, button, [role='button'], input, textarea, [data-cursor='hover']");
    };
    const onDown = () => (pressed = true);
    const onUp = () => (pressed = false);
    const onLeave = () => {
      pos.x = pos.y = -100;
    };

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      const scale = (hovering ? 1.8 : 1) * (pressed ? 0.8 : 1);
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        ring.current.style.opacity = hovering ? "0.9" : "0.5";
      }
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <div ref={dot} className="fixed left-0 top-0 size-1.5 rounded-full bg-accent-soft" />
      <div
        ref={ring}
        className="fixed left-0 top-0 size-9 rounded-full border border-accent-soft transition-[opacity] duration-200"
      />
    </div>
  );
}
