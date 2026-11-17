"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Variant = "primary" | "ghost";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: Variant;
  download?: boolean;
  external?: boolean;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

const styles: Record<Variant, string> = {
  primary: "bg-accent-strong text-white shadow-[0_8px_40px_-8px_var(--glow)] hover:shadow-[0_8px_50px_-4px_var(--glow)]",
  ghost: "border border-line text-fg hover:border-accent hover:text-accent-soft",
};

/**
 * Magnetic button: gently follows the pointer while hovered.
 * Renders an <a> when `href` is given, otherwise a <button>.
 */
export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  download,
  external,
  className = "",
  type = "button",
  disabled,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-[box-shadow,border-color,color,opacity] duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`;

  return (
    <motion.span ref={ref} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset} className="inline-block">
      {href ? (
        <a
          href={href}
          onClick={onClick}
          className={cls}
          download={download || undefined}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      ) : (
        <button type={type} onClick={onClick} className={cls} disabled={disabled}>
          {children}
        </button>
      )}
    </motion.span>
  );
}
