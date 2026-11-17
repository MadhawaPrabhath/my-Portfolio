"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Card that tilts in 3D toward the mouse and shows a moving light glare.
 * Mouse-only — touch devices get a flat card.
 */
export default function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(py, [0, 1], [8, -8]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-8, 8]), spring);
  const glareX = useTransform(px, [0, 1], [0, 100]);
  const glareY = useTransform(py, [0, 1], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.12), transparent 50%)`;
  const glareOpacity = useSpring(0, spring);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    glareOpacity.set(1);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  };

  return (
    <div className="[perspective:1200px]">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative ${className}`}
      >
        {children}
        <motion.div
          aria-hidden="true"
          style={{ background: glare, opacity: glareOpacity }}
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
        />
      </motion.div>
    </div>
  );
}
