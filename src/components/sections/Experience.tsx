"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { experience } from "@/data/portfolio";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import SectionHeading from "@/components/ui/SectionHeading";
import Badge from "@/components/ui/Badge";
import { BriefcaseIcon } from "@/components/ui/Icons";

/**
 * Vertical timeline. The accent line "draws" itself as you scroll (GSAP scrub),
 * and each entry slides in when it enters the viewport.
 */
export default function Experience() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        "[data-timeline-progress]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-timeline]", start: "top 70%", end: "bottom 60%", scrub: true },
        },
      );
    },
    { scope: section, dependencies: [reduced] },
  );

  return (
    <section ref={section} id="experience" aria-labelledby="experience-title" className="relative scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading index="03" eyebrow="Experience" id="experience-title" />

        <ol data-timeline className="relative ml-4 max-w-4xl md:ml-8">
          {/* Track + animated progress line */}
          <span aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-line" />
          <span
            data-timeline-progress
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-px origin-top bg-linear-to-b from-accent via-accent-soft to-transparent"
          />

          {experience.map((job, i) => (
            <li key={`${job.company}-${job.period}`} className="relative pb-16 pl-10 last:pb-0 md:pl-14">
              {/* Node */}
              <motion.span
                aria-hidden="true"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.2 }}
                className="absolute -left-[18px] top-1 grid size-9 place-items-center rounded-full border border-accent bg-bg text-accent-soft shadow-[0_0_30px_var(--glow)]"
              >
                <BriefcaseIcon className="size-4" />
              </motion.span>

              {/* Date */}
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-3 pt-2 font-mono text-xs uppercase tracking-widest text-accent-soft"
              >
                {job.period}
              </motion.p>

              <motion.article
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group rounded-3xl border border-line bg-surface/60 p-6 transition-colors hover:border-accent/50 md:p-8"
              >
                <h3 className="font-display text-2xl font-bold md:text-3xl">{job.role}</h3>
                <p className="mt-1 text-lg text-accent-soft">{job.company}</p>
                <p className="mt-5 leading-relaxed text-muted">{job.summary}</p>

                <ul className="mt-5 space-y-2">
                  {job.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-sm text-fg/90 md:text-base">
                      <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-2">
                  {job.stack.map((t) => (
                    <Badge key={t} accent>
                      {t}
                    </Badge>
                  ))}
                </div>
              </motion.article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
