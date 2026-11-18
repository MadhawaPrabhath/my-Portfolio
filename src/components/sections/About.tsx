"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView } from "framer-motion";
import { education, profile, whatIDo } from "@/data/portfolio";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { GradCapIcon, MapPinIcon, SparkIcon } from "@/components/ui/Icons";

const ease = [0.22, 1, 0.36, 1] as const;

const stats = [
  { value: 6, suffix: "+", label: "Projects" },
  { value: 30, suffix: "+", label: "Technologies & tools" },
  { value: 2, suffix: "+", label: "Years web development experience" },
  { value: 2, suffix: "", label: "Majors — CS & Statistics" },
];

/** Profile facts (all from the CV). */
const ed = education[0];
const facts = [
  { icon: MapPinIcon, label: "Based in", value: profile.location },
  { icon: GradCapIcon, label: "Education", value: `${ed.degree} — ${ed.field}`, sub: `${ed.institution} · ${ed.period}` },
  { icon: SparkIcon, label: "Focus", value: whatIDo.map((w) => w.title).join(" · ") },
];

/* Opening statement — large, static, faint text (no scroll animation). */
function Statement({ text }: { text: string }) {
  return (
    <p className="text-left font-display text-[1.3rem] font-medium leading-[1.3] tracking-tight text-fg/20 [hyphens:none] md:text-justify md:text-[2rem] md:leading-[1.22] xl:text-[2.4rem] 2xl:text-[2.75rem]">
      {/* Keep hyphenated words (e.g. "full-stack") from breaking across lines */}
      {text.split(/(\S*-\S*)/).map((part, i) =>
        part.includes("-") ? (
          <span key={i} className="whitespace-nowrap">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  );
}

/* Number that counts up from 0 when it scrolls into view. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduced) {
      el.textContent = String(value).padStart(2, "0");
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease,
      onUpdate: (v) => (el.textContent = String(Math.round(v)).padStart(2, "0")),
    });
    return () => controls.stop();
  }, [inView, value, reduced]);

  return <span ref={ref}>{String(value).padStart(2, "0")}</span>;
}

export default function About() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const st = { trigger: section.current, start: "top bottom", end: "bottom top", scrub: true };

      // Background outline text slides sideways; glow drifts (parallax).
      gsap.fromTo("[data-marquee]", { xPercent: 0 }, { xPercent: -35, ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-parallax='glow']", { yPercent: -30 }, { yPercent: 30, ease: "none", scrollTrigger: st });


    },
    { scope: section, dependencies: [reduced] },
  );

  return (
    <section ref={section} id="about" aria-labelledby="about-title" className="relative scroll-mt-24 overflow-hidden py-16 md:py-20">
      {/* Decorative background */}
      <div data-parallax="glow" aria-hidden="true" className="absolute right-[-10%] top-1/4 size-[28rem] rounded-full bg-accent/15 blur-[130px]" />
      <div
        data-marquee
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-16 select-none whitespace-nowrap font-display text-[clamp(5rem,14vw,12rem)] font-bold leading-none text-transparent opacity-60 [-webkit-text-stroke:1px_var(--border)]"
      >
        About me — Full-Stack — AI Automation — Data Analysis — About me
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading index="01" eyebrow="About" id="about-title" />
      </div>

      {/* 1. Opening statement — full page width */}
      <div className="relative w-full px-6 md:px-10 xl:px-16">
        <Statement text={profile.bio[0]} />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">

        {/* 2. Profile facts + stats */}
        <div className="mt-20 grid gap-12 md:mt-28 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {profile.bio.slice(1).map((p) => (
              <Reveal key={p}>
                <p className="text-lg leading-relaxed text-muted md:text-xl">{p}</p>
              </Reveal>
            ))}

            <dl className="mt-10 border-t border-line">
              {facts.map(({ icon: Icon, label, value, sub }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease }}
                  className="group grid grid-cols-[2.5rem_1fr] gap-4 border-b border-line py-5 sm:grid-cols-[2.5rem_8rem_1fr]"
                >
                  <span className="grid size-10 place-items-center rounded-xl border border-line text-accent-soft transition-colors duration-300 group-hover:border-accent group-hover:bg-accent-strong group-hover:text-white">
                    <Icon className="size-[18px]" />
                  </span>
                  <dt className="self-center font-mono text-xs uppercase tracking-widest text-muted max-sm:hidden">{label}</dt>
                  <dd className="self-center">
                    <span className="mb-0.5 block font-mono text-[11px] uppercase tracking-widest text-muted sm:hidden">{label}</span>
                    <span className="block text-fg">{value}</span>
                    {sub && <span className="mt-0.5 block text-sm text-muted">{sub}</span>}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>

          {/* Stat tiles */}
          <dl className="grid grid-cols-2 gap-4 self-start lg:col-span-5">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease }}
                className="group relative flex aspect-square flex-col-reverse justify-between overflow-hidden rounded-3xl border border-line bg-surface/60 p-6 transition-colors duration-500 hover:border-accent/50"
              >
                <div
                  aria-hidden="true"
                  className="absolute -bottom-12 -right-12 size-40 rounded-full bg-accent/0 blur-3xl transition-colors duration-500 group-hover:bg-accent/30"
                />
                <dt className="relative text-sm text-muted">{s.label}</dt>
                <dd className="relative font-display text-5xl font-bold text-accent-soft md:text-6xl">
                  <CountUp value={s.value} />
                  {s.suffix}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
