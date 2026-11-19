"use client";

import { motion } from "framer-motion";

type Props = {
  /** Section number — no longer displayed (kept so existing call sites still compile). */
  index?: string;
  eyebrow: string;
  /** id of the heading element (used by aria-labelledby on the section) */
  id: string;
  description?: string;
  /** Overrides the default bottom margin wrapper classes. */
  className?: string;
};

/**
 * Section label: "—— About" (+ optional description).
 * The label itself is the section's <h2>, so the page keeps a proper heading outline.
 */
export default function SectionHeading({ eyebrow, id, description, className = "mb-14 md:mb-20" }: Props) {
  return (
    <div className={className}>
      <motion.h2
        id={id}
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-accent-soft"
      >
        <span className="h-px w-10 bg-accent" aria-hidden="true" />
        <span>{eyebrow}</span>
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
