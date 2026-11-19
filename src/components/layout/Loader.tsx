"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { finishIntro } from "@/lib/store";
import { lockScroll } from "@/lib/scroll";

/** Minimum time the logo animation plays before the site is revealed. */
const MIN_MS = 2000;
/** Safety net: never keep the site hidden longer than this. */
const MAX_MS = 4000;

const LOGO = "/logo-purple.webp";
const EASE = [0.22, 1, 0.36, 1] as const;

/*
 * The logo image is one file; each part is shown by clipping it (percentages of the image box):
 *  - dash "-" sits in the left ~30%  → clip away the right 70%
 *  - "m"     sits in the right ~52%  → clip away the left 47%
 */
const DASH_HIDDEN = "inset(0% 100% 0% 0%)";
const DASH_SHOWN = "inset(0% 70% 0% 0%)";
const M_HIDDEN = "inset(100% 0% 0% 47%)";
const M_SHOWN = "inset(0% 0% 0% 47%)";

/**
 * Intro loading screen: the "-m" logo draws itself (dash wipes in, "m" rises),
 * the dash then blinks like a terminal cursor while a progress line fills,
 * and finally the logo zooms out and the curtain fades to reveal the site.
 * Closes once the page has loaded and MIN_MS has passed (MAX_MS at most).
 * Reduced-motion users see the static logo briefly.
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
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the media query once on mount (client only)
    setReduced(isReduced);

    // Close when BOTH the minimum animation time has passed and the page has loaded.
    let timeUp = false;
    let loaded = document.readyState === "complete";
    const tryClose = () => timeUp && loaded && close();
    const onLoad = () => {
      loaded = true;
      tryClose();
    };
    const min = setTimeout(() => {
      timeUp = true;
      tryClose();
    }, isReduced ? 500 : MIN_MS);
    const safety = setTimeout(close, MAX_MS);
    window.addEventListener("load", onLoad);
    return () => {
      clearTimeout(min);
      clearTimeout(safety);
      window.removeEventListener("load", onLoad);
    };
  }, [close]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-90 flex items-center justify-center bg-bg px-4"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] } }}
          role="status"
          aria-label="Loading portfolio"
        >
          {/* Soft glow behind the logo (gently breathing) */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute size-96 rounded-full bg-accent/20 blur-[110px]"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={reduced ? { opacity: 1, scale: 1 } : { opacity: [0, 1, 0.6, 1], scale: [0.6, 1, 0.9, 1] }}
            transition={reduced ? { duration: 0 } : { duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
          />

          {reduced !== null && (
            <motion.div
              className="relative flex flex-col items-center gap-8"
              exit={{ opacity: 0, scale: 1.25, filter: "blur(12px)", transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
            >
              {/* Logo: two clipped copies of the same image */}
              <div aria-hidden="true" className="relative aspect-[4000/2082] w-36 sm:w-44">
                {/* "m" rises from the bottom */}
                <motion.img
                  src={LOGO}
                  alt=""
                  width={384}
                  height={200}
                  className="absolute inset-0 size-full"
                  initial={{ clipPath: reduced ? M_SHOWN : M_HIDDEN }}
                  animate={{ clipPath: M_SHOWN }}
                  transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
                />
                {/* dash wipes in from the left, then blinks like a cursor */}
                <motion.img
                  src={LOGO}
                  alt=""
                  width={384}
                  height={200}
                  className="absolute inset-0 size-full"
                  initial={{ clipPath: reduced ? DASH_SHOWN : DASH_HIDDEN, opacity: 1 }}
                  animate={reduced ? { clipPath: DASH_SHOWN } : { clipPath: DASH_SHOWN, opacity: [1, 1, 0, 1] }}
                  transition={{
                    clipPath: { duration: 0.5, delay: 0.15, ease: EASE },
                    opacity: { duration: 1, delay: 1.3, times: [0, 0.45, 0.5, 0.95], repeat: Infinity, ease: "linear" },
                  }}
                />
              </div>

              {/* Progress line */}
              <div aria-hidden="true" className="h-0.5 w-28 overflow-hidden rounded-full bg-fg/10 sm:w-36">
                <motion.div
                  className="h-full origin-left rounded-full bg-accent"
                  initial={{ scaleX: reduced ? 1 : 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: MIN_MS / 1000 - 0.2, delay: 0.2, ease: [0.65, 0, 0.35, 1] }}
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
