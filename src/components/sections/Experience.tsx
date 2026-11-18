"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { experience, experienceStat, isPlaceholder } from "@/data/portfolio";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToY } from "@/lib/scroll";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import SectionHeading from "@/components/ui/SectionHeading";

const ease = [0.22, 1, 0.36, 1] as const;
const isCurrent = (period: string) => /present/i.test(period);

/** Eye-catching stat card: spinning gradient border, glow, and a count-up number. */
function StatCard({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [, num = "", suffix = ""] = experienceStat.value.match(/^(\d+)(.*)$/) ?? [];
  const target = Number(num);
  const count = useMotionValue(0);
  const shown = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (!inView || !num) return;
    if (reduced) return count.set(target);
    const controls = animate(count, target, { duration: 1.4, ease, delay: 0.2 });
    return () => controls.stop();
  }, [inView, reduced, num, target, count]);

  return (
    <div ref={ref} className="relative order-last md:order-0 md:mt-10">
      {/* Soft glow behind the card */}
      <div aria-hidden="true" className="absolute -inset-3 rounded-3xl bg-accent/25 blur-2xl" />

      {/* 1px gradient border that slowly spins */}
      <div className="relative overflow-hidden rounded-2xl p-px">
        <motion.span
          aria-hidden="true"
          className="absolute inset-[-60%] bg-[conic-gradient(from_0deg,transparent_0deg,var(--accent)_80deg,var(--accent-2)_160deg,transparent_240deg)]"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 5, ease: "linear", repeat: Infinity }}
        />

        <div className="relative rounded-[15px] bg-bg/95 px-5 py-5">
          <p className="flex items-start font-display font-bold leading-none">
            <span className="text-gradient text-6xl md:text-7xl">{num ? <motion.span>{shown}</motion.span> : experienceStat.value}</span>
            <span className="ml-1 text-4xl text-(--accent-2) md:text-5xl">{suffix}</span>
          </p>
          <p className="mt-3 text-sm font-medium uppercase leading-snug tracking-wider text-fg">{experienceStat.label}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Experience — simple tabs:
 *   role list on the left (horizontal on mobile) + the selected role's details on the right.
 */
export default function Experience() {
  const section = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const pin = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const job = experience[active];
  const last = experience.length - 1;

  useGSAP(
    () => {
      if (reduced) return;
      // Giant outline word drifts sideways while scrolling past.
      gsap.fromTo(
        "[data-exp-word]",
        { xPercent: 6 },
        { xPercent: -6, ease: "none", scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: true } },
      );

      // Desktop: pin the whole section (heading + roles) and switch the active role as you scroll.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (min-height: 700px)", () => {
        if (last < 1) return;
        pin.current = ScrollTrigger.create({
          trigger: section.current,
          start: "top top",
          end: () => `+=${last * window.innerHeight * 0.6}`,
          pin: true,
          onUpdate: (self) => setActive(Math.round(self.progress * last)),
        });
        return () => {
          pin.current = null;
        };
      });
    },
    { scope: section, dependencies: [reduced, last] },
  );

  /** Select a role — when pinned, scroll to that role's position so scroll and tabs stay in sync. */
  const select = (i: number) => {
    setActive(i);
    const st = pin.current;
    if (st) scrollToY(st.start + (i / last) * (st.end - st.start));
  };

  /** Arrow-key navigation between tabs. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (active + keys[e.key] + experience.length) % experience.length;
    select(next);
    tabs.current[next]?.focus();
  };

  return (
    <section ref={section} id="experience" aria-labelledby="experience-title" className="relative overflow-x-clip pb-12 pt-24 md:pb-16">
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading index="05" eyebrow="Experience" id="experience-title" className="mb-6" />
      </div>

      {/* Giant outlined heading (decorative — the label above is the real heading) */}
      <div
        data-exp-word
        aria-hidden="true"
        className="pointer-events-none select-none whitespace-nowrap px-6 font-display text-[clamp(2.6rem,10.5vw,10.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.03em] text-transparent [-webkit-text-stroke:1.5px_color-mix(in_oklab,var(--text)_40%,transparent)] md:px-10 xl:px-16"
      >
        My Experience
      </div>

      <div className="relative mx-auto mt-10 grid max-w-5xl gap-8 px-6 md:mt-12 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12">
        {/* On phones this wrapper "dissolves" (contents) so the stat card can move below the role details. */}
        <div className="contents md:block md:min-w-0 md:self-start">
          {/* Role list */}
          <div
            role="tablist"
            aria-label="Roles"
            onKeyDown={onKeyDown}
            className="flex flex-col border-l border-line"
          >
            {experience.map((j, i) => {
              const selected = i === active;
              return (
                <button
                  key={`${j.company}-${j.period}`}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  id={`exp-tab-${i}`}
                  role="tab"
                  aria-selected={selected}
                  aria-controls="exp-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  className={`relative -ml-px border-l-2 px-4 py-3 text-left text-sm transition-colors duration-300 md:px-5 ${
                    selected ? "border-accent bg-accent/5 text-accent-soft" : "border-transparent text-muted hover:bg-surface/40 hover:text-fg"
                  }`}
                >
                  {j.company}
                </button>
              );
            })}
          </div>
  
          {/* Years-of-experience stat */}
          <StatCard reduced={reduced} />
        </div>

        {/* Selected role */}
        <div id="exp-panel" role="tabpanel" aria-labelledby={`exp-tab-${active}`} className="min-w-0 md:min-h-96">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: reduced ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -8 }}
              transition={{ duration: 0.3, ease }}
            >
              <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                {job.role}{" "}
                <span className={isPlaceholder(job.company) ? "italic text-muted/70" : "text-accent-soft"}>@ {job.company}</span>
              </h3>

              <p className="mt-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
                {job.period}
                {isCurrent(job.period) && <span className="size-1.5 rounded-full bg-emerald-400" aria-label="Current role" />}
              </p>

              <p className="mt-6 leading-relaxed text-muted">{job.summary}</p>

              <ul className="mt-6 space-y-3">
                {job.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-[15px] leading-relaxed text-fg/90">
                    <span aria-hidden="true" className="mt-0.5 text-accent-soft">▹</span>
                    {h}
                  </li>
                ))}
              </ul>

              <p className="mt-8 font-mono text-xs text-muted">{job.stack.join(" · ")}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
