"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { hero, profile, site, socials } from "@/data/portfolio";
import { useIntroDone } from "@/lib/store";
import { useIsMobile, useReducedMotion } from "@/hooks/useMediaQuery";
import { scrollToSection } from "@/lib/scroll";
import { gsap, useGSAP } from "@/lib/gsap";
import Button from "@/components/ui/Button";
import Image from "next/image";

/** Hero portrait — optimised copy of /public/dp2.png (transparent cut-out). */
const heroPhoto = "/dp2.webp";
import { ArrowRightIcon, DownloadIcon, GithubIcon, LinkedinIcon, MailIcon, MapPinIcon, InstagramIcon, FacebookIcon, WhatsappIcon } from "@/components/ui/Icons";

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

const fade: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: (d: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, delay: d, ease: [0.22, 1, 0.36, 1] } }),
};

/** Transform-only variant: text is visible from the first paint (keeps LCP fast), it just glides into place. */
const rise: Variants = {
  hidden: { y: 28, filter: "blur(8px)" },
  show: (d: number) => ({ y: 0, filter: "blur(0px)", transition: { duration: 1, delay: d, ease: [0.22, 1, 0.36, 1] } }),
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

/**
 * Cycles through words every 2.5s with a fade + slide-up.
 * Decorative for screen readers (an sr-only sentence lists all the words instead).
 */
function RotatingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), 2500);
    return () => window.clearInterval(id);
  }, [words.length]);

  return (
    <span aria-hidden="true" className="relative inline-flex overflow-hidden pb-[0.1em] align-bottom">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-gradient inline-block font-semibold"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const socialLinks = [
  { href: socials.github, label: "GitHub", icon: GithubIcon, external: true },
  { href: socials.linkedin, label: "LinkedIn", icon: LinkedinIcon, external: true },
  { href: socials.email, label: "Email", icon: MailIcon, external: false },
  { href: socials.instagram, label: "Instagram", icon: InstagramIcon, external: true },
  { href: socials.facebook, label: "Facebook", icon: FacebookIcon, external: true },
  { href: socials.whatsapp, label: "WhatsApp", icon: WhatsappIcon, external: true },
];

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
          {/* 1. Status badge */}
          <motion.p
            variants={fade}
            custom={0.1}
            className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/60 px-4 py-1.5 text-sm text-fg/90 backdrop-blur"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            {hero.status}
          </motion.p>

          {/* 2. Greeting */}
          <motion.p variants={rise} custom={0.25} className="mt-8 text-lg text-muted">
            {hero.greeting}
          </motion.p>

          {/* 3. Headline — the role, not the name, is the hero */}
          <h1 className="mt-3 font-display text-[clamp(2.25rem,10vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl md:text-6xl lg:text-[2.85rem] xl:text-[3.3rem]">
            <motion.span variants={rise} custom={0.35} className="text-gradient block pb-1 lg:whitespace-nowrap">
              {hero.headline[0]}
            </motion.span>
            <motion.span variants={rise} custom={0.45} className="block text-fg lg:whitespace-nowrap">
              {hero.headline[1]}
            </motion.span>
          </h1>

          {/* 4. Rotating line */}
          <motion.p variants={rise} custom={0.6} className="mt-5 text-xl text-fg/90 md:text-2xl">
            {hero.rotatingPrefix} <RotatingWord words={hero.rotatingWords} />
            <span className="sr-only">{hero.rotatingWords.join(", ")}</span>
          </motion.p>

          {/* Portrait — phones & tablets: compact crop (cap → chest) between the headline and the description */}
          <motion.div
            variants={fade}
            custom={0.65}
            className="relative mx-auto mt-6 h-[clamp(15rem,38vh,21rem)] w-full max-w-sm lg:hidden"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(closest-side_at_55%_55%,var(--glow)_0%,transparent_100%)]"
            />
            <Image
              src={heroPhoto}
              alt={profile.name}
              fill
              priority
              sizes="(min-width: 1024px) 0px, 384px"
              className="object-cover object-top [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
            />
          </motion.div>

          {/* 5. Description */}
          <motion.p variants={rise} custom={0.7} className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            {hero.description}
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

          {/* 7. Social icons (links live in src/data/portfolio.ts → socials) */}
          <motion.ul variants={fade} custom={1.05} className="mt-8 flex items-center gap-2" aria-label="Social links">
            {socialLinks.map(({ href, label, icon: Icon, external }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:bg-accent-strong hover:text-white"
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <Icon className="size-[18px]" />
                </a>
              </li>
            ))}
          </motion.ul>

          {/* 8. Info row */}
          <motion.p variants={fade} custom={1.15} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="size-4 text-accent-soft" /> {profile.location}
            </span>
          </motion.p>
        </div>

        {/* Portrait (desktop/tablet-landscape only — keeps the mobile hero short) */}
        <motion.div variants={fade} custom={0.6} className="relative hidden h-[min(72vh,640px)] translate-x-10 lg:block xl:translate-x-30 translate-y-10">
          {/* Glow so the dark jacket separates from the dark background */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(closest-side_at_62%_55%,var(--glow)_0%,transparent_100%)]"
          />
          {/* Photo; its bottom edge fades out via a mask (no overlay box) */}
          <Image
            src={heroPhoto}
            alt={profile.name}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 0px"
            className="object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_78%,transparent)]"
          />
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
