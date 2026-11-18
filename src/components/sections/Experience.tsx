"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { experience, isPlaceholder, type Experience as Job } from "@/data/portfolio";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import SectionHeading from "@/components/ui/SectionHeading";

const ease = [0.22, 1, 0.36, 1] as const;
const isCurrent = (period: string) => /present/i.test(period);

/** Splits "Jan 2026 — Jul 2026" / "2024 — Present" into a big start label + the rest. */
function splitPeriod(period: string) {
  const [start, end] = period.split(/\s*[—–-]\s*/);
  return { start: start ?? period, end: end ?? "" };
}

/** Small check icon used as a bullet. */
const Check = () => (
  <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
    <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Role card with a soft spotlight that follows the cursor. */
function RoleCard({ job }: { job: Job }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className="group relative overflow-hidden rounded-3xl border border-line bg-surface/50 p-6 transition-colors duration-500 hover:border-accent/40 md:p-8"
    >
      {/* Cursor spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), var(--glow), transparent 60%)" }}
      />

      <div className="relative">
        <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{job.role}</h3>
        <p className="mt-4 leading-relaxed text-muted">{job.summary}</p>

        <ul className="mt-6 space-y-3">
          {job.highlights.map((h, i) => (
            <motion.li
              key={h}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease }}
              className="flex gap-3 text-[15px] leading-relaxed text-fg/90"
            >
              <span className="mt-[3px] grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-soft ring-1 ring-accent/30">
                <Check />
              </span>
              {h}
            </motion.li>
          ))}
        </ul>

        <ul className="mt-7 flex flex-wrap gap-2 border-t border-line pt-6" aria-label={`${job.role} tech stack`}>
          {job.stack.map((t) => (
            <li
              key={t}
              className="rounded-full border border-line bg-bg/40 px-3 py-1 font-mono text-[11px] text-muted transition-colors duration-300 hover:border-accent/60 hover:text-accent-soft"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Experience — timeline list:
 *   giant outlined "MY EXPERIENCE" heading,
 *   each role = [ dates · company ]  ●  [ role card ]
 *   A rail fills with colour as you scroll; the current role's node pulses.
 */
export default function Experience() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      // Giant outline word drifts sideways while scrolling past.
      gsap.fromTo(
        "[data-exp-word]",
        { xPercent: 6 },
        { xPercent: -6, ease: "none", scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
      // Timeline rail fills as the list scrolls through the viewport.
      gsap.fromTo(
        "[data-rail-fill]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-rail]", start: "top 70%", end: "bottom 60%", scrub: true } },
      );
    },
    { scope: section, dependencies: [reduced] },
  );

  return (
    <section ref={section} id="experience" aria-labelledby="experience-title" className="relative scroll-mt-24 overflow-x-clip py-16 md:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-1/2 size-[32rem] rounded-full bg-accent/10 blur-[150px]" />

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

      <div className="relative mx-auto mt-14 max-w-6xl px-6 md:mt-20">
        <ol data-rail className="relative">
          {/* Rail (sits between the meta column and the cards on desktop, at the left edge on mobile) */}
          <span aria-hidden="true" className="absolute bottom-0 left-[7px] top-2 w-px bg-line md:left-[calc(13rem+1.5rem+7px)]" />
          <span
            data-rail-fill
            aria-hidden="true"
            className="absolute bottom-0 left-[7px] top-2 w-px origin-top bg-linear-to-b from-accent via-accent-soft to-[var(--accent-2)] md:left-[calc(13rem+1.5rem+7px)]"
          />

          {experience.map((job) => {
            const current = isCurrent(job.period);
            const placeholder = isPlaceholder(job.company);
            const { start, end } = splitPeriod(job.period);

            return (
              <motion.li
                key={`${job.company}-${job.period}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, ease }}
                className="relative grid gap-5 pb-12 pl-9 last:pb-0 md:grid-cols-[13rem_1rem_minmax(0,1fr)] md:gap-6 md:pb-16 md:pl-0"
              >
                {/* Meta: dates + company */}
                <div className="md:pt-6 md:text-right">
                  <p className="text-gradient font-display text-3xl font-bold leading-none md:text-4xl">{start}</p>
                  <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted">→ {end}</p>

                  <div className="mt-5 flex items-center gap-3 md:justify-end">
                    <span className={`text-sm leading-snug ${placeholder ? "italic text-muted/70" : "text-fg"}`}>{job.company}</span>
                  </div>

                  {current && (
                    <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-400">
                      <span className="relative flex size-1.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
                      </span>
                      Current
                    </span>
                  )}
                </div>

                {/* Node on the rail */}
                <span aria-hidden="true" className="absolute left-0 top-2 md:relative md:left-auto md:top-0 md:mt-7 md:justify-self-center">
                  <span
                    className={`relative block size-[15px] rounded-full border-2 bg-bg ${
                      current ? "border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.6)]" : "border-accent shadow-[0_0_18px_var(--glow)]"
                    }`}
                  >
                    {current && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/50" />}
                  </span>
                </span>

                {/* Card */}
                <RoleCard job={job} />
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
