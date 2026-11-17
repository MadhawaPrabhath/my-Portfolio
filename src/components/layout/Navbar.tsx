"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navItems, profile } from "@/data/portfolio";
import { useActiveSection } from "@/hooks/useActiveSection";
import { scrollToSection } from "@/lib/scroll";
import { useIntroDone } from "@/lib/store";
import ThemeToggle from "./ThemeToggle";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";

const ids = navItems.map((n) => n.id);

/**
 * Sticky navbar: glass background after scrolling, active-section pill,
 * and a full-screen menu on mobile.
 */
export default function Navbar() {
  const active = useActiveSection(ids);
  const introDone = useIntroDone();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={introDone ? { y: 0, opacity: 1 } : undefined}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6"
    >
      <nav
        aria-label="Primary"
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 md:px-6 ${
          scrolled ? "glass shadow-lg shadow-black/10" : "border border-transparent"
        }`}
      >
        <a href="#top" onClick={go("top")} className="group flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-xl bg-accent-strong font-display text-sm font-bold text-white transition-transform group-hover:rotate-6"
          >
            {profile.initials}
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-tight sm:block">{profile.firstName}</span>
          <span className="sr-only">{profile.name} — back to top</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id} className="relative">
                <a
                  href={`#${item.id}`}
                  onClick={go(item.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative z-10 block rounded-full px-4 py-2 text-sm transition-colors ${
                    isActive ? "text-white" : "text-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </a>
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-accent-strong"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-line md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="glass mx-auto mt-3 max-w-6xl rounded-3xl p-3 md:hidden"
          >
            <ul className="flex flex-col">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={go(item.id)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 font-display text-lg ${
                      active === item.id ? "bg-accent-strong text-white" : "text-fg"
                    }`}
                  >
                    {item.label}
                    <span className="font-mono text-xs opacity-60">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
