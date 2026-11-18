"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { finishIntro } from "@/lib/store";
import { lockScroll } from "@/lib/scroll";
import CodeEditor from "@/components/sections/CodeEditor";

/** How long "✓ Compiled successfully" stays on screen before the curtain lifts. */
const HOLD_MS = 650;
/** Safety net: never keep the site hidden longer than this. */
const MAX_MS = 4000;

/**
 * Intro loading screen: a code editor types out `developer.ts`,
 * the terminal reports "Compiled successfully", then a curtain wipe reveals the site.
 * Reduced-motion users see the finished code briefly, with no typing.
 */
export default function Loader() {
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const closed = useRef(false);

  const close = useCallback(() => {
    if (closed.current) return;
    closed.current = true;
    setVisible(false);
    lockScroll(false);
    finishIntro();
  }, []);

  useEffect(() => {
    // No scrolling under the loader; also start every visit at the top.
    lockScroll(true);
    window.scrollTo(0, 0);
    return () => lockScroll(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the media query once on mount (client only)
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const safety = setTimeout(close, MAX_MS);
    return () => clearTimeout(safety);
  }, [close]);

  const onDone = useCallback(() => {
    setTimeout(close, reduced ? 300 : HOLD_MS);
  }, [close, reduced]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-90 flex items-center justify-center bg-bg px-4"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, delay: 0.15, ease: [0.4, 0, 0.2, 1] } }}
          role="status"
          aria-label="Loading portfolio"
        >
          {/* Soft glow behind the editor */}
          <div aria-hidden="true" className="pointer-events-none absolute size-112 rounded-full bg-accent/15 blur-[120px]" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06, filter: "blur(10px)", transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md"
          >
            {reduced !== null && <CodeEditor start instant={reduced} speed={5} onDone={onDone} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
