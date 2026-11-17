"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { finishIntro } from "@/lib/store";
import { profile } from "@/data/portfolio";

/**
 * Intro loading screen: a counter + monogram, then a curtain wipe.
 * Kept short (~1.3s) so it never hurts perceived performance.
 * Reduced-motion users skip straight to the content.
 */
export default function Loader() {
  const [visible, setVisible] = useState(true);
  const bar = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 0 : 1300;
    const start = performance.now();
    let frame = 0;

    // Progress is written straight to the DOM (no React re-render per frame).
    const step = (now: number) => {
      const p = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      const pct = Math.round(p * 100);
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (counter.current) counter.current.textContent = String(pct).padStart(3, "0");
      if (p < 1) {
        frame = requestAnimationFrame(step);
      } else {
        setVisible(false);
        finishIntro();
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-90 flex flex-col items-center justify-center bg-bg/97"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          role="status"
          aria-label="Loading portfolio"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative grid size-20 place-items-center rounded-2xl border border-line"
          >
            <span className="font-display text-3xl font-bold text-accent-soft">{profile.initials}</span>
            <span className="absolute inset-0 animate-pulse rounded-2xl shadow-[0_0_60px_var(--glow)]" />
          </motion.div>
          <div className="mt-8 h-px w-48 overflow-hidden bg-line">
            <div ref={bar} className="h-full origin-left scale-x-0 bg-accent" />
          </div>
          <p ref={counter} className="mt-4 font-mono text-xs tracking-[0.3em] text-muted tabular-nums">
            000
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
