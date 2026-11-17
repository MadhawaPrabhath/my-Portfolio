"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section is currently in the middle of the viewport.
 * Used by the navbar to highlight the active link.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // A thin band across the middle of the screen decides the active section.
      { rootMargin: "-45% 0px -50% 0px" },
    );

    elements.forEach((el) => observer.observe(el));

    // Clear highlight when back at the hero.
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.5) setActive(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids]);

  return active;
}
