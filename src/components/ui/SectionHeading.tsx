"use client";

import { motion } from "framer-motion";

type Props = {
  index: string;
  eyebrow: string;
  title: string;
  /** id of the heading element (used by aria-labelledby on the section) */
  id: string;
  description?: string;
};

/** "01 / About" eyebrow + large display heading with a masked line reveal. */
export default function SectionHeading({ index, eyebrow, title, id, description }: Props) {
  return (
    <div className="mb-14 md:mb-20">
      <motion.p
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-accent-soft"
      >
        <span>{index}</span>
        <span className="h-px w-10 bg-accent" aria-hidden="true" />
        <span>{eyebrow}</span>
      </motion.p>
      {/* The in-view trigger sits on the h2 (the inner span starts clipped, so it can't be observed itself). */}
      <motion.h2
        id={id}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="overflow-hidden pb-1 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
      >
        <motion.span
          className="block"
          variants={{ hidden: { y: "105%" }, show: { y: 0 } }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {title}
        </motion.span>
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-5 max-w-2xl text-base text-muted md:text-lg"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
