"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { skillGroups } from "@/data/portfolio";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import SectionHeading from "@/components/ui/SectionHeading";
import TagSphere from "./TagSphere";

const ease = [0.22, 1, 0.36, 1] as const;
const total = skillGroups.reduce((n, g) => n + g.skills.length, 0);
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Skills — sphere-centred layout:
 *   giant outlined "SKILLS" behind a 3D tag sphere with orbit rings,
 *   category chips that filter / highlight the sphere,
 *   and a panel listing the selected group's skills (the accessible version of the sphere).
 */
export default function Skills() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<string | null>(null); // clicked chip (null = All)
  const [hovered, setHovered] = useState<string | null>(null); // hover preview
  const active = hovered ?? selected;



  return (
    <section ref={section} id="skills" aria-labelledby="skills-title" className="relative scroll-mt-24 overflow-hidden py-16 md:py-20">
      {/* Label aligned to the same 6xl column as the other sections */}
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading index="02" eyebrow="Skills" id="skills-title" className="mb-6 md:mb-10" />
      </div>

      {/* Sphere on top, category chips centred underneath */}
      <div className="relative mx-auto grid max-w-6xl justify-items-center gap-8 px-6">
        <div className="relative w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.1, ease }}
            className="relative"
          >
            <TagSphere groups={skillGroups} activeGroup={active} reduced={reduced} />
          </motion.div>
        </div>

        {/* Category chips */}
        <div
          role="group"
          aria-label="Filter skills by category"
          className="flex max-w-4xl flex-wrap justify-center gap-2"
          onPointerLeave={() => setHovered(null)}
        >
          {[{ id: null, label: "All", count: total }, ...skillGroups.map((g) => ({ id: g.id, label: g.label, count: g.skills.length }))].map(
            (c, i) => {
              const isOn = selected === c.id;
              return (
                <motion.button
                  key={c.label}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => setSelected(c.id)}
                  onPointerEnter={() => setHovered(c.id)}
                  onFocus={() => setHovered(c.id)}
                  onBlur={() => setHovered(null)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease }}
                  className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                    isOn ? "text-white" : "border border-line text-muted hover:border-accent/60 hover:text-fg"
                  }`}
                >
                  {isOn && <motion.span layoutId="skill-chip" className="absolute inset-0 rounded-full bg-accent-strong" />}
                  <span className="relative">{c.label}</span>
                  <span className={`relative font-mono text-[11px] ${isOn ? "text-white/70" : "text-muted/70"}`}>{pad(c.count)}</span>
                </motion.button>
              );
            },
          )}
        </div>

        {/* Screen-reader list of every skill (the sphere itself is decorative) */}
        <div className="sr-only">
          {skillGroups.map((g) => (
            <ul key={g.id} aria-label={`${g.label} skills`}>
              {g.skills.map((sk) => (
                <li key={sk}>{sk}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
