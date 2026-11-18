"use client";

/**
 * Tiny global stores (no library) for UI state shared across components:
 *  - theme: "dark" | "light"  (persisted to localStorage, mirrored on <html data-theme>)
 *  - introDone: whether the loading screen has finished
 */
import { useSyncExternalStore } from "react";

function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: T) => {
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

/* ── Theme ─────────────────────────────────── */
export type Theme = "dark" | "light";

const themeStore = createStore<Theme>("dark");

if (typeof document !== "undefined") {
  // The site is dark-only now (layout.tsx sets data-theme="dark"); the light branch is kept dormant.
  themeStore.set(document.documentElement.dataset.theme === "light" ? "light" : "dark");
}

export const useTheme = () => useSyncExternalStore(themeStore.subscribe, themeStore.get, () => "dark" as Theme);

/* ── Intro / loader ────────────────────────── */
const introStore = createStore(false);

export const finishIntro = () => introStore.set(true);
export const isIntroDone = () => introStore.get();
export const useIntroDone = () => useSyncExternalStore(introStore.subscribe, introStore.get, () => false);
