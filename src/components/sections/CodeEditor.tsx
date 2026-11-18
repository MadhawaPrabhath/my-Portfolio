"use client";

import { useEffect, useMemo, useState } from "react";
import { heroCode } from "@/data/portfolio";
import TiltCard from "@/components/ui/TiltCard";

/* Token kinds → colours (CSS variables, so they follow the theme). */
type Kind = "kw" | "var" | "prop" | "str" | "punc" | "plain";
type Token = [text: string, kind: Kind];

const colorFor: Record<Kind, string> = {
  kw: "text-accent-soft",
  var: "text-[var(--accent-2)]",
  prop: "text-fg",
  str: "text-[var(--syn-str)]",
  punc: "text-muted",
  plain: "text-fg",
};

/** Turns the `heroCode` data into syntax-highlighted lines. */
function buildLines(): Token[][] {
  const lines: Token[][] = [
    [["const ", "kw"], [heroCode.variable, "var"], [" = {", "punc"]],
  ];
  for (const [key, value] of Object.entries(heroCode.fields)) {
    const line: Token[] = [["  ", "plain"], [key, "prop"], [": ", "punc"]];
    if (Array.isArray(value)) {
      line.push(["[", "punc"]);
      value.forEach((v, i) => {
        line.push([`"${v}"`, "str"]);
        if (i < value.length - 1) line.push([", ", "punc"]);
      });
      line.push(["],", "punc"]);
    } else {
      line.push([`"${value}"`, "str"], [",", "punc"]);
    }
    lines.push(line);
  }
  lines.push([["};", "punc"]], [], [["export default ", "kw"], [heroCode.variable, "var"], [";", "punc"]]);
  return lines;
}

/** Renders only the first `shown` characters of the code, with a caret on the line being typed. */
function renderTyped(lines: Token[][], shown: number, done: boolean) {
  let budget = shown;
  return lines.map((line, li) => {
    const lineLength = line.reduce((n, [t]) => n + t.length, 0);
    // The caret sits on the line currently being typed.
    const isCaretLine = !done && budget >= 0 && budget <= lineLength;
    const parts: React.ReactNode[] = [];
    for (const [ti, [text, kind]] of line.entries()) {
      if (budget <= 0) break;
      const slice = text.slice(0, budget);
      budget -= slice.length;
      parts.push(
        <span key={ti} className={colorFor[kind]}>
          {slice}
        </span>,
      );
    }
    budget -= 1; // newline
    return (
      <div key={li} className="flex">
        <span className="w-8 shrink-0 select-none pr-4 text-right text-muted/50">{li + 1}</span>
        <span className="min-w-0 whitespace-pre-wrap break-words">
          {parts}
          {isCaretLine && <span className="ml-px inline-block h-[1.1em] w-0.5 translate-y-0.5 animate-pulse bg-accent-soft" />}
        </span>
      </div>
    );
  });
}

/**
 * Faux code editor that types out a `developer.ts` object.
 * Decorative (aria-hidden) — the same facts are in the hero text and About section.
 */
export default function CodeEditor({ start, instant }: { start: boolean; instant: boolean }) {
  const lines = useMemo(() => buildLines(), []);
  const total = useMemo(() => lines.reduce((n, l) => n + l.reduce((m, [t]) => m + t.length, 0) + 1, 0), [lines]);
  const [typed, setTyped] = useState(0);
  const shown = instant ? total : typed;
  const done = shown >= total;

  // Typing loop: a few characters per frame, written via rAF.
  useEffect(() => {
    if (!start || instant) return;
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last > 16) {
        last = now;
        setTyped((t) => Math.min(t + 2, total));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, instant, total]);

  const rendered = renderTyped(lines, shown, done);

  return (
    <div aria-hidden="true" className="animate-[float_7s_ease-in-out_infinite]">
      <TiltCard className="rounded-2xl">
        <div className="glass overflow-hidden rounded-2xl shadow-[0_30px_120px_-30px_var(--glow)]">
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 rounded-md bg-surface-2/80 px-3 py-1 font-mono text-xs text-muted">{heroCode.fileName}</span>
          </div>

          {/* Code */}
          <div className="min-h-[300px] px-3 py-5 font-mono text-[13px] leading-6 xl:text-sm">{rendered}</div>

          {/* Terminal strip */}
          <div className="border-t border-line bg-bg/40 px-5 py-3 font-mono text-xs">
            <p className="text-muted">
              <span className="text-accent-soft">$</span> {heroCode.terminal.command}
            </p>
            <p className={`mt-1 text-[var(--syn-str)] transition-opacity duration-500 ${done ? "opacity-100" : "opacity-0"}`}>
              {heroCode.terminal.output}
            </p>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
