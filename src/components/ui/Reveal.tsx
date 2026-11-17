"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  /** Distance (px) the element travels upward while fading in. */
  y?: number;
};

/**
 * Fades + lifts its children into view the first time they scroll on screen.
 * Framer Motion automatically skips the transform when the user prefers reduced motion
 * (via <MotionConfig reducedMotion="user"> in the page wrapper).
 */
export default function Reveal({ delay = 0, y = 32, children, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
