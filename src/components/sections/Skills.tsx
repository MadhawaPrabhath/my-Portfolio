"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { skillGroups } from "@/data/portfolio";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import SectionHeading from "@/components/ui/SectionHeading";
import TagSphere from "./TagSphere";

/**
 * Skills: interactive 3D tag sphere + grouped cards.
 * Hovering / focusing a group card highlights its skills inside the sphere.
 */
export default function Skills() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          index="02"
          eyebrow="Skills"
          title="Tools of the trade"
          id="skills-title"
          description="Spin the sphere, or hover a group to see where it lives."
        />

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <TagSphere groups={skillGroups} activeGroup={active} reduced={reduced} />
          </motion.div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {skillGroups.map((group, i) => (
              <motion.li
                key={group.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className={group.skills.length > 8 ? "sm:col-span-2" : ""}
              >
                <div
                  tabIndex={0}
                  onPointerEnter={() => setActive(group.id)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(group.id)}
                  onBlur={() => setActive(null)}
                  className={`h-full rounded-2xl border p-5 transition-colors duration-300 ${
                    active === group.id ? "border-accent bg-accent/5" : "border-line bg-surface/60"
                  }`}
                >
                  <h3 className="mb-3 flex items-center justify-between font-display text-lg font-semibold">
                    {group.label}
                    <span className="font-mono text-xs text-muted">{String(group.skills.length).padStart(2, "0")}</span>
                  </h3>
                  <ul className="flex flex-wrap gap-1.5" aria-label={`${group.label} skills`}>
                    {group.skills.map((s) => (
                      <li key={s} className="rounded-md bg-surface-2 px-2 py-1 text-xs text-muted">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
