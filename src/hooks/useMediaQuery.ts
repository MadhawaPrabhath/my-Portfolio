"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query. Returns `false` during SSR / static
 * prerender, then the real value after hydration.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True when the user asked the OS to minimise motion. */
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** True on touch-first devices (phones/tablets). */
export const useIsTouch = () => useMediaQuery("(hover: none), (pointer: coarse)");

/** True below Tailwind's `md` breakpoint. */
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
