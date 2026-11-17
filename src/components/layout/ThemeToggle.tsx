"use client";

import { AnimatePresence, motion } from "framer-motion";
import { setTheme, useTheme } from "@/lib/store";
import { MoonIcon, SunIcon } from "@/components/ui/Icons";

/** Dark / light switch. Dark is the default. */
export default function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      className="relative grid size-10 place-items-center overflow-hidden rounded-full border border-line text-fg transition-colors hover:border-accent hover:text-accent-soft"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 16, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -16, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.25 }}
        >
          {theme === "dark" ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
