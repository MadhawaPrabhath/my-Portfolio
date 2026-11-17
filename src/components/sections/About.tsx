"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { education, experience, isPlaceholder, profile, projects } from "@/data/portfolio";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { MapPinIcon } from "@/components/ui/Icons";

/** Counts derived from the data file — they stay correct as you add content. */
const stats = [
  { value: projects.length, label: "Projects" },
  { value: experience.length, label: "Internship" },
  { value: 2, label: "Majors — CS & Statistics" },
];

/** Photo card that tilts toward the pointer (3D) and drifts on scroll (parallax). */
function PhotoCard() {
  const card = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 150, damping: 15 });
  const rotateX = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 150, damping: 15 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !card.current) return;
    const r = card.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const hasPhoto = !isPlaceholder(profile.photo);

  return (
    <div className="w-full max-w-sm [perspective:1000px]">
      <motion.div
        ref={card}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] border border-line bg-surface"
      >
        {hasPhoto ? (
          <Image
            src={profile.photo}
            alt={`Portrait of ${profile.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 384px"
            className="object-cover"
          />
        ) : (
          // Placeholder — set `profile.photo` in src/data/portfolio.ts
          <div
            role="img"
            aria-label={`Photo placeholder for ${profile.name}`}
            className="flex size-full flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_30%_20%,var(--accent)_0%,transparent_55%),radial-gradient(circle_at_80%_90%,var(--accent-2)_0%,transparent_50%)]"
          >
            <span className="font-display text-8xl font-bold text-white/90 drop-shadow-lg" style={{ transform: "translateZ(60px)" }}>
              {profile.initials}
            </span>
            <span className="rounded-full bg-black/40 px-3 py-1 font-mono text-xs text-white/80">[ADD PHOTO]</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10" />
      </motion.div>
    </div>
  );
}

export default function About() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Parallax: the photo column and the backdrop glow move at different speeds.
  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        "[data-parallax='photo']",
        { yPercent: 12 },
        { yPercent: -12, ease: "none", scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.fromTo(
        "[data-parallax='glow']",
        { yPercent: -30 },
        { yPercent: 30, ease: "none", scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    { scope: section, dependencies: [reduced] },
  );

  return (
    <section ref={section} id="about" aria-labelledby="about-title" className="relative scroll-mt-24 py-28 md:py-40">
      <div
        data-parallax="glow"
        aria-hidden="true"
        className="absolute left-[-10%] top-1/4 size-96 rounded-full bg-accent/20 blur-[120px]"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading index="01" eyebrow="About" title="A little about me" id="about-title" />

        <div className="grid items-center gap-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-20">
          <div data-parallax="photo" className="flex justify-center md:justify-start">
            <PhotoCard />
          </div>

          <div>
            {profile.bio.map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <p className={`mb-6 leading-relaxed ${i === 0 ? "text-xl text-fg md:text-2xl" : "text-base text-muted md:text-lg"}`}>
                  {p}
                </p>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <p className="mb-10 inline-flex items-center gap-2 text-sm text-muted">
                <MapPinIcon className="size-4 text-accent-soft" /> {profile.location}
              </p>
            </Reveal>

            <Reveal delay={0.25}>
              <dl className="grid grid-cols-3 gap-4 border-t border-line pt-8">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse">
                    <dt className="mt-1 text-xs text-muted md:text-sm">{s.label}</dt>
                    <dd className="font-display text-4xl font-bold text-accent-soft md:text-5xl">
                      {String(s.value).padStart(2, "0")}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 font-mono text-xs text-muted">
                {education[0].degree} · {education[0].institution}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
