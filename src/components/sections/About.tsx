"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { education, experience, isPlaceholder, portraitTags, profile, projects, skillGroups, whatIDo } from "@/data/portfolio";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import { BriefcaseIcon, ChartIcon, CodeIcon, GradCapIcon, MapPinIcon, SparkIcon } from "@/components/ui/Icons";

/** Counts derived from the data file — they stay correct as you add content. */
const stats = [
  { value: projects.length, label: "Projects built" },
  { value: skillGroups.reduce((n, g) => n + g.skills.length, 0), label: "Technologies & tools" },
  { value: experience.length, label: "Industry internship" },
  { value: 2, label: "Majors — CS & Statistics" },
];

const icons = { code: CodeIcon, ai: SparkIcon, chart: ChartIcon };

/* ─────────────────────────────────────────────
   3D portrait: tilts with the pointer; the glow ring, card and
   floating chips sit on different Z layers, so they separate in depth.
   ───────────────────────────────────────────── */
function Portrait3D() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 140, damping: 16 };
  const rotateY = useSpring(useTransform(mx, [0, 1], [-14, 14]), spring);
  const rotateX = useSpring(useTransform(my, [0, 1], [12, -12]), spring);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const hasPhoto = !isPlaceholder(profile.photo);
  const job = experience[0];
  const chipPos = ["-left-6 top-10", "-right-8 top-1/2", "-left-4 bottom-24"];

  return (
    <div className="relative w-full max-w-sm [perspective:1100px]">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        // Swings in from the side the first time it's on screen.
        initial={{ opacity: 0, rotateY: -35, x: -40 }}
        whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative aspect-[4/5] w-full"
      >
        {/* Layer -60: spinning conic glow ring */}
        <div aria-hidden="true" className="absolute -inset-6 rounded-[2.5rem]" style={{ transform: "translateZ(-60px)" }}>
          <div className="absolute inset-0 animate-[spin_14s_linear_infinite] rounded-[2.5rem] bg-[conic-gradient(from_0deg,var(--accent),transparent_30%,var(--accent-2),transparent_70%,var(--accent))] opacity-60 blur-2xl" />
        </div>

        {/* Layer 0: the card */}
        <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-line bg-surface shadow-2xl shadow-black/30">
          {/* Gradient + grid backdrop (sits behind the transparent cut-out photo) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--accent)_0%,transparent_55%),radial-gradient(circle_at_80%_90%,var(--accent-2)_0%,transparent_50%)] opacity-80"
          />
          <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-30" />

          {hasPhoto ? (
            <Image
              src={profile.photo}
              alt={`Portrait of ${profile.name}`}
              fill
              sizes="(max-width: 768px) 90vw, 384px"
              className="object-contain object-bottom pt-6 drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
            />
          ) : (
            // Placeholder — set `profile.photo` in src/data/portfolio.ts
            <div
              role="img"
              aria-label={`Photo placeholder for ${profile.name}`}
              className="relative flex size-full flex-col items-center justify-center gap-4"
            >
              <span className="font-display text-8xl font-bold text-white/90 drop-shadow-lg">{profile.initials}</span>
              <span className="rounded-full bg-black/40 px-3 py-1 font-mono text-xs text-white/80">[ADD PHOTO]</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10" />
        </div>

        {/* Layer +50: status bar (current/latest role) */}
        <div className="absolute inset-x-4 bottom-4" style={{ transform: "translateZ(50px)" }}>
          <div className="glass flex items-center gap-3 rounded-2xl p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-strong text-white">
              <BriefcaseIcon className="size-5" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-semibold text-fg">{job.role}</span>
              <span className="block font-mono text-[11px] leading-snug text-muted">
                {job.company} · {job.period}
              </span>
            </span>
          </div>
        </div>

        {/* Layer +90: floating chips */}
        {portraitTags.map((tag, i) => (
          <div key={tag} aria-hidden="true" className={`absolute ${chipPos[i % chipPos.length]}`} style={{ transform: "translateZ(90px)" }}>
            <span
              className="glass block rounded-full px-4 py-2 font-mono text-xs font-medium text-fg shadow-lg shadow-black/20"
              style={{ animation: `float ${5 + i}s ease-in-out ${i * 0.8}s infinite` }}
            >
              {tag}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* Bio paragraph whose words light up one by one as you scroll. */
function ScrollLitText({ text }: { text: string }) {
  return (
    <p data-lit className="font-display text-2xl font-medium leading-snug tracking-tight md:text-[2rem] md:leading-[1.3]">
      {text.split(" ").map((w, i) => (
        <span key={i} data-word className="inline-block opacity-[0.18] motion-reduce:opacity-100">
          {w}&nbsp;
        </span>
      ))}
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
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (el.textContent = String(Math.round(v)).padStart(2, "0")),
    });
    return () => controls.stop();
  }, [inView, value, reduced]);

  return <span ref={ref}>{String(value).padStart(2, "0")}</span>;
}

export default function About() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const ed = education[0];

  useGSAP(
    () => {
      if (reduced) return;
      const st = { trigger: section.current, start: "top bottom", end: "bottom top", scrub: true };

      // Background outline text slides sideways; portrait column + glow drift (parallax).
      gsap.fromTo("[data-marquee]", { xPercent: 0 }, { xPercent: -35, ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-parallax='photo']", { yPercent: 8 }, { yPercent: -8, ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-parallax='glow']", { yPercent: -30 }, { yPercent: 30, ease: "none", scrollTrigger: st });

      // Word-by-word light-up of the lead paragraph.
      gsap.to("[data-word]", {
        opacity: 1,
        stagger: 0.08,
        ease: "none",
        scrollTrigger: { trigger: "[data-lit]", start: "top 80%", end: "bottom 45%", scrub: true },
      });
    },
    { scope: section, dependencies: [reduced] },
  );

  return (
    <section ref={section} id="about" aria-labelledby="about-title" className="relative scroll-mt-24 overflow-hidden py-28 md:py-40">
      {/* Decorative background */}
      <div data-parallax="glow" aria-hidden="true" className="absolute left-[-10%] top-1/4 size-96 rounded-full bg-accent/20 blur-[120px]" />
      <div
        data-marquee
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-16 select-none whitespace-nowrap font-display text-[clamp(5rem,14vw,12rem)] font-bold leading-none text-transparent opacity-60 [-webkit-text-stroke:1px_var(--border)]"
      >
        About me — Full-Stack — AI Automation — Data Analysis — About me
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading index="01" eyebrow="About" id="about-title" />

        {/* Portrait + bio */}
        <div className="grid items-center gap-16 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-20">
          <div data-parallax="photo" className="flex justify-center px-6 md:justify-start md:px-0">
            <Portrait3D />
          </div>

          <div>
            <ScrollLitText text={profile.bio[0]} />
            {profile.bio.slice(1).map((p) => (
              <Reveal key={p} delay={0.1}>
                <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">{p}</p>
              </Reveal>
            ))}

            {/* Quick facts */}
            <Reveal delay={0.2}>
              <ul className="mt-8 flex flex-wrap gap-2">
                <li className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-sm text-muted">
                  <GradCapIcon className="size-4 text-accent-soft" /> {ed.degree} · {ed.institution}
                </li>
                <li className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-sm text-muted">
                  <MapPinIcon className="size-4 text-accent-soft" /> {profile.location}
                </li>
              </ul>
            </Reveal>
          </div>
        </div>

        {/* What I do — cards flip up in 3D */}
        <div className="mt-28 md:mt-36">
          <Reveal>
            <h3 className="mb-8 font-mono text-xs uppercase tracking-[0.25em] text-muted">What I do</h3>
          </Reveal>
          <ul className="grid gap-5 md:grid-cols-3 [perspective:1200px]">
            {whatIDo.map((item, i) => {
              const Icon = icons[item.icon];
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, rotateX: -55, y: 60 }}
                  whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "50% 100%" }}
                >
                  <TiltCard className="h-full rounded-3xl">
                    <article className="group relative h-full overflow-hidden rounded-3xl border border-line bg-surface/70 p-7 transition-colors duration-500 hover:border-accent/50">
                      {/* Hover glow */}
                      <div
                        aria-hidden="true"
                        className="absolute -right-16 -top-16 size-48 rounded-full bg-accent/0 blur-3xl transition-colors duration-500 group-hover:bg-accent/25"
                      />
                      <div className="relative" style={{ transform: "translateZ(40px)" }}>
                        <div className="flex items-center justify-between">
                          <span className="grid size-12 place-items-center rounded-2xl bg-accent-strong text-white shadow-[0_10px_40px_-10px_var(--glow)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                            <Icon className="size-6" />
                          </span>
                          <span className="font-mono text-xs text-muted">0{i + 1}</span>
                        </div>
                        <h4 className="mt-6 font-display text-xl font-bold">{item.title}</h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                        <ul className="mt-5 flex flex-wrap gap-1.5">
                          {item.tools.map((t) => (
                            <li key={t} className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted">
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  </TiltCard>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Stats */}
        <Reveal delay={0.1}>
          <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse bg-bg p-6 md:p-8">
                <dt className="mt-2 text-xs text-muted md:text-sm">{s.label}</dt>
                <dd className="font-display text-4xl font-bold text-accent-soft md:text-5xl">
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
