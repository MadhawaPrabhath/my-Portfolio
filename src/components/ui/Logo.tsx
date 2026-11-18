"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@/lib/store";

/** false during SSR/hydration, true afterwards. */
const useHydrated = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

/**
 * Theme-aware logo (used by the navbar and the loading screen).
 * logo-dark = white "M" (dark theme), logo-light = dark "M" (light theme).
 * Before hydration the CSS rules in globals.css pick the right one (no flash);
 * after hydration React also hides the other one inline, so it works even if that CSS is missing.
 * Size it with a `size-*` class on `className` (defaults to 40px).
 */
export default function Logo({ className = "size-10" }: { className?: string }) {
  const theme = useTheme();
  const hydrated = useHydrated();
  const show = (forTheme: "dark" | "light") => (hydrated ? { display: theme === forTheme ? "block" : "none" } : undefined);

  return (
    <span aria-hidden="true" className={`relative block shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-dark.webp" alt="" width={256} height={256} className="logo-for-dark absolute inset-0 size-full" style={show("dark")} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-light.webp" alt="" width={256} height={256} className="logo-for-light absolute inset-0 size-full" style={show("light")} />
    </span>
  );
}
