"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { lockScroll } from "@/lib/scroll";
import { CloseIcon } from "./Icons";

type Props = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
};

/**
 * Accessible modal dialog:
 *  - Escape / backdrop click closes
 *  - focus moves into the dialog, is trapped while open, and is restored on close
 *  - page scroll (Lenis) is paused while open
 */
export default function Modal({ open, onClose, labelledBy, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    lockScroll(true);
    panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel.current) return;
      const focusables = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            data-lenis-prevent
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 shadow-2xl sm:rounded-3xl md:p-10"
          >
            <button
              type="button"
              data-autofocus
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-fg"
            >
              <CloseIcon className="size-5" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
