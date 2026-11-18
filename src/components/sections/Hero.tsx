"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { motion, type Variants } from "framer-motion";
import { profile, site } from "@/data/portfolio";
import { useIntroDone } from "@/lib/store";
import { useIsMobile, useReducedMotion } from "@/hooks/useMediaQuery";
import { scrollToSection } from "@/lib/scroll";
import { gsap, useGSAP } from "@/lib/gsap";
import Button from "@/components/ui/Button";
import CodeEditor from "./CodeEditor";
import { ArrowRightIcon, DownloadIcon, MailIcon } from "@/components/ui/Icons";

/* Three.js is ~600 KB — load it only in the browser, after the intro. */
const CodeScene = dynamic(() => import("@/components/three/CodeScene"), { ssr: false });

/** WebGL availability check (cached, client-only). */
let webglCache: boolean | null = null;
const hasWebGL = () => {
  if (webglCache === null) {
    try {
      const c = document.createElement("canvas");
      webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
};
const useWebGL = () => useSyncExternalStore(() => () => {}, hasWebGL, () => false);

const letters: Variants = {
  hidden: { y: "110%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 0.9, delay: 0.1 + i * 0.035, ease: [0.22, 1, 0.36, 1] } }),
};

const fade: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] } }),
};

/** Transform-only variant: text is visible from the first paint (keeps LCP fast), it just glides into place. */
const rise: Variants = {
  hidden: { y: 16 },
  show: (d: number) => ({ y: 0, transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] } }),
};

/**
 * Decides when to mount the 3D scene so it never competes with first paint:
 *  - desktop: when the browser is idle after the intro
 *  - mobile: on the first touch/scroll, or after a few seconds of idle
 */
function useDeferred3D(enabled: boolean, isMobile: boolean) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!enabled || armed) return;
    const arm = () => setArmed(true);
    // requestIdleCallback isn't available in Safari → fall back to a timeout.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = (cb: () => void, timeout: number): number =>
      hasIdle ? window.requestIdleCallback(cb, { timeout }) : window.setTimeout(cb, timeout / 4);
    const cancelIdle = (id: number) => (hasIdle ? window.cancelIdleCallback(id) : window.clearTimeout(id));

    if (!isMobile) {
      const id = idle(arm, 1500);
      return () => cancelIdle(id);
    }

    const events = ["touchstart", "pointerdown", "scroll", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, arm, { once: true, passive: true }));
    const timer = window.setTimeout(() => idle(arm, 2000), 5000);
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, arm));
    };
  }, [enabled, isMobile, armed]);

  return armed;
}

/** Splits a word into individually animated letters (screen readers get the h1 aria-label). */
function AnimatedWord({ word, offset, gradient }: { word: string; offset: number; gradient?: boolean }) {
  const chars = word.split("");
  return (
    <span className="block overflow-hidden pb-[0.08em]" aria-hidden="true">
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          custom={offset + i}
          variants={letters}
          className={`inline-block will-change-transform ${gradient ? "text-gradient" : ""}`}
          // Transformed letters can't share one background-clip, so each letter shows its own
          // slice of a word-wide gradient → reads as one continuous gradient.
          style={
            gradient
              ? { backgroundSize: `${chars.length * 100}% 100%`, backgroundPosition: `${(i / Math.max(chars.length - 1, 1)) * 100}% 0` }
              : undefined
          }
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const introDone = useIntroDone();
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const webgl = useWebGL();
  const armed = useDeferred3D(introDone && webgl && !reduced, isMobile);
  const show3D = armed && webgl && !reduced;

  // Hero copy drifts up and fades as you scroll away.
  useGSAP(
    () => {
      if (reduced || !content.current) return;
      gsap.to(content.current, {
        yPercent: -18,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: section, dependencies: [reduced] },
  );

  const state = introDone ? "show" : "hidden";

  return (
    <section
      ref={section}
      id="home"
      aria-label="Introduction"
      className="relative flex min-h-dvh items-center overflow-hidden"
    >
      {/* Static fallback / backdrop — always rendered, the 3D canvas fades in over it. */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="absolute right-[5%] top-1/2 size-[55vmin] -translate-y-1/2 rounded-full bg-accent/25 blur-[120px] max-lg:right-1/2 max-lg:translate-x-1/2" />
      </div>

      {show3D && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6 }} className="absolute inset-0">
          <CodeScene lite={isMobile} eventSource={section} />
        </motion.div>
      )}

      {/* Bottom fade into the next section */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-bg to-transparent" />

      <motion.div
        ref={content}
        initial="hidden"
        animate={state}
        className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-16 pt-28 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
      >
        <div>


        <h1
          aria-label={`${profile.name}, ${profile.title}`}
          className="font-display text-[clamp(3rem,11vw,6.25rem)] font-bold leading-[0.92] tracking-[-0.04em]"
        >
          <AnimatedWord word={profile.firstName} offset={0} />
          <AnimatedWord word={profile.lastName} offset={profile.firstName.length} gradient />
        </h1>

        <motion.p variants={rise} custom={0.7} className="mt-6 font-display text-xl font-medium text-fg md:text-3xl">
          {profile.title}
        </motion.p>
        <motion.p variants={rise} custom={0.8} className="mt-3 max-w-xl text-base text-muted md:text-lg">
          {profile.tagline}
        </motion.p>

        <motion.div variants={fade} custom={0.95} className="mt-10 flex flex-wrap gap-3">
          <Button
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("projects");
            }}
          >
            View Projects <ArrowRightIcon className="size-4" />
          </Button>
          <Button href={site.cvUrl} download variant="ghost">
            <DownloadIcon className="size-4" /> Download CV
          </Button>
          <Button
            href="#contact"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("contact");
            }}
          >
            <MailIcon className="size-4" /> Contact
          </Button>
        </motion.div>
        </div>

        {/* Code editor (desktop/tablet-landscape only — keeps the mobile hero short) */}
        <motion.div variants={fade} custom={0.6} className="hidden lg:block">
          <CodeEditor start={introDone} instant={reduced} />
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate={state}
        custom={1.3}
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollhint_1.8s_ease-in-out_infinite] bg-accent" />
        </span>
      </motion.div>
    </section>
  );
}
