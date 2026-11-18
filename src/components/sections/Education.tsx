"use client";

import { motion } from "framer-motion";
import { education } from "@/data/portfolio";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";
import { GradCapIcon } from "@/components/ui/Icons";

/** Education — degree card with animated coursework chips. */
export default function Education() {
  return (
    <section id="education" aria-labelledby="education-title" className="relative scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading index="05" eyebrow="Education" id="education-title" />

        {education.map((ed) => (
          <motion.div
            key={ed.institution}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard className="rounded-[2rem]">
              <article className="relative overflow-hidden rounded-[2rem] border border-line bg-surface/70 p-8 md:p-12">
                <div
                  aria-hidden="true"
                  className="absolute -right-24 -top-24 size-72 rounded-full bg-accent/20 blur-3xl"
                />
                <div className="relative grid gap-10 md:grid-cols-[auto_1fr] md:gap-14">
                  <div className="grid size-20 place-items-center rounded-3xl bg-accent-strong text-white shadow-[0_10px_50px_-10px_var(--glow)]">
                    <GradCapIcon className="size-9" />
                  </div>

                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-accent-soft">{ed.period}</p>
                    <h3 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">{ed.degree}</h3>
                    <p className="mt-2 text-lg text-fg/90">{ed.field}</p>
                    <p className="mt-1 text-muted">{ed.institution}</p>

                    <h4 className="mt-10 font-mono text-xs uppercase tracking-widest text-muted">Coursework</h4>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {ed.coursework.map((c, i) => (
                        <motion.li
                          key={c}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 260, damping: 20 }}
                          className="rounded-full border border-line bg-surface-2/70 px-3.5 py-1.5 text-sm text-fg/90"
                        >
                          {c}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
