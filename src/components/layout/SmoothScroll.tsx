"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";
import { isIntroDone } from "@/lib/store";
import { useReducedMotion } from "@/hooks/useMediaQuery";

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger animations
 * stay perfectly in sync. Disabled when the user prefers reduced motion.
 */
export default function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    setLenis(lenis);
    // The loader locks scrolling until the intro finishes (it calls lockScroll(false) when done).
    if (!isIntroDone()) lenis.stop();

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return null;
}
