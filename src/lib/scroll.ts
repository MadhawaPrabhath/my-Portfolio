import type Lenis from "lenis";

/**
 * Holds the single Lenis instance (set by <SmoothScroll />) so any component
 * can trigger a smooth scroll without prop-drilling.
 */
let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
};

/** Pause / resume page scrolling (e.g. while a modal is open). */
export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/** Scroll the page to an absolute Y position (used to bring pinned/horizontal content into view). */
export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 0.8 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

/** Smoothly scroll to a section id, or to the top when id is "top". */
export function scrollToSection(id: string) {
  const target = id === "top" ? 0 : document.getElementById(id);
  if (target === null) return;

  // Skip the section's own top padding so its heading lands right under the fixed navbar.
  let y = 0;
  if (target !== 0) {
    const navBottom = document.querySelector("header")?.offsetHeight ?? 72;
    const padTop = parseFloat(getComputedStyle(target).paddingTop) || 0;
    y = target.getBoundingClientRect().top + window.scrollY + padTop - navBottom - 24;
  }

  if (lenis) lenis.scrollTo(Math.max(0, y), { duration: 1.4 });
  else window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });

  // Move keyboard focus to the section for screen-reader / keyboard users.
  if (target !== 0) {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
}
