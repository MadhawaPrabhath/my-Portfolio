import type { ReactNode } from "react";

/** Small pill used for tech stacks and tags. */
export default function Badge({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide ${
        accent ? "border-accent/40 bg-accent/10 text-accent-soft" : "border-line bg-surface-2/60 text-muted"
      }`}
    >
      {children}
    </span>
  );
}
