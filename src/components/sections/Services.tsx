"use client";

import { motion } from "framer-motion";
import { whatIDo } from "@/data/portfolio";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";
import { ChartIcon, CodeIcon, SparkIcon } from "@/components/ui/Icons";

const icons = { code: CodeIcon, ai: SparkIcon, chart: ChartIcon };
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * "What I do" — standalone section (was part of About).
 * Full page width: giant outlined "WHAT I DO" on the left, three service cards on the right.
 */
export default function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="relative scroll-mt-24 overflow-x-clip py-16 md:py-20">
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading index="03" eyebrow="What I Do" id="services-title" className="mb-12 md:mb-16" />
      </div>

      <div className="relative w-full px-6 md:px-10 xl:px-16">
        <div className="grid items-stretch gap-10 xl:grid-cols-[auto_minmax(0,1fr)] xl:gap-14">
          {/* Big two-line label sized to the cards' height */}
          <p aria-hidden="true" className="flex flex-row flex-wrap items-baseline gap-x-5 font-display text-[clamp(3.5rem,13vw,6rem)] font-bold uppercase leading-[0.85] tracking-[-0.02em] text-transparent [-webkit-text-stroke:1.5px_color-mix(in_oklab,var(--text)_55%,transparent)] xl:flex-col xl:flex-nowrap xl:items-start xl:justify-between xl:text-[8rem]">
            <motion.span
              className="block"
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease }}
            >
              What
            </motion.span>
            <motion.span
              className="block pb-[0.08em] [-webkit-text-stroke:1.5px_var(--accent-soft)]"
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.12, ease }}
            >
              I&nbsp;do
            </motion.span>
          </p>

          {/* Cards — equal height, flip up in 3D */}
          <ul className="grid gap-5 md:grid-cols-3 [perspective:1200px]">
            {whatIDo.map((item, i) => {
              const Icon = icons[item.icon];
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, rotateX: -55, y: 60 }}
                  whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.12, ease }}
                  style={{ transformOrigin: "50% 100%" }}
                >
                  <TiltCard className="h-full rounded-3xl">
                    <article className="group relative flex h-full min-h-[17rem] flex-col overflow-hidden rounded-3xl border border-line bg-surface/70 p-7 transition-colors duration-500 hover:border-accent/50">
                      <div
                        aria-hidden="true"
                        className="absolute -right-16 -top-16 size-48 rounded-full bg-accent/0 blur-3xl transition-colors duration-500 group-hover:bg-accent/25"
                      />
                      <div className="relative flex flex-1 flex-col" style={{ transform: "translateZ(40px)" }}>
                        <div className="flex items-center justify-between">
                          <span className="grid size-12 place-items-center rounded-2xl bg-accent-strong text-white shadow-[0_10px_40px_-10px_var(--glow)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                            <Icon className="size-6" />
                          </span>
                          <span className="font-mono text-xs text-muted">0{i + 1}</span>
                        </div>
                        <h3 className="mt-6 font-display text-xl font-bold">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                        {/* Tools pinned to the bottom so all three cards line up */}
                        <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
                          {item.tools.map((t) => (
                            <li key={t} className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted">
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  </TiltCard>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
