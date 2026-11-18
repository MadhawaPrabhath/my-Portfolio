"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useInView, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { isPlaceholder, projects, socials, type Project, type ProjectCategory } from "@/data/portfolio";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import SectionHeading from "@/components/ui/SectionHeading";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { ArrowRightIcon, ArrowUpRightIcon, GithubIcon } from "@/components/ui/Icons";

const categories: ("All" | ProjectCategory)[] = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
const ease = [0.22, 1, 0.36, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");
const AUTO_MS = 4000; // auto-rotate interval

/** Fallback "cover" per category (used when a project has no image). */
const covers: Record<ProjectCategory, string> = {
  "Full-Stack":
    "radial-gradient(circle at 20% 20%, var(--accent) 0%, transparent 55%), radial-gradient(circle at 90% 80%, var(--accent-2) 0%, transparent 45%)",
  "AI & Automation":
    "radial-gradient(circle at 80% 10%, var(--accent-2) 0%, transparent 50%), radial-gradient(circle at 10% 90%, var(--accent) 0%, transparent 55%)",
  "Image Processing":
    "conic-gradient(from 210deg at 70% 40%, var(--accent), var(--accent-2), transparent 60%, var(--accent))",
  "Data Analytics":
    "linear-gradient(135deg, var(--accent) 0%, transparent 60%), radial-gradient(circle at 85% 85%, var(--accent-2) 0%, transparent 45%)",
};

/** Link button that renders as a disabled "[ADD LINK]" pill when the URL isn't set yet. */
function ProjectLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  if (isPlaceholder(href)) {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-line px-4 py-2 font-mono text-xs text-muted"
        title={`${label} link not added yet`}
      >
        {icon} {label}: [ADD LINK]
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-accent-strong px-4 py-2 text-sm font-semibold text-white"
    >
      {icon} {label}
    </a>
  );
}

/* ─────────────────────────── Card ─────────────────────────── */

type CardProps = {
  project: Project;
  index: number;
  front: boolean;
  /** Narrow cards (phones) show fewer tech badges so nothing gets clipped. */
  compact?: boolean;
  /** Front card → open details; side card → rotate it to the front. */
  onActivate: () => void;
};

function ProjectCard({ project, index, front, compact = false, onActivate }: CardProps) {
  const maxTags = compact ? 2 : 3;
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-surface transition-colors duration-500 ${
        front ? "border-accent/50 shadow-[0_30px_80px_-30px_var(--glow)]" : "border-line"
      }`}
    >
      {/* Cover */}
      <div className="relative h-[45%] shrink-0 overflow-hidden" aria-hidden="true">
        {project.image ? (
          <Image
            src={project.image}
            alt=""
            fill
            sizes="22rem"
            draggable={false}
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          />
        ) : (
          <>
            <div className="absolute inset-0 opacity-70" style={{ background: covers[project.category] }} />
            <div className="bg-grid absolute inset-0 opacity-40" />
          </>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        <span className="glass absolute right-4 top-4 rounded-full px-3 py-1 font-mono text-xs text-fg">{pad(index + 1)}</span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge accent>{project.category}</Badge>
          {project.status === "Ongoing" && <Badge>Ongoing</Badge>}
        </div>
        <h3 className="font-display text-xl font-bold leading-tight">{project.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{project.short}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="flex flex-wrap gap-1.5">
            {project.stack.slice(0, maxTags).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
            {project.stack.length > maxTags && <Badge>+{project.stack.length - maxTags}</Badge>}
          </div>

          {/* Stretched button → the whole card is clickable */}
          <button
            type="button"
            onClick={onActivate}
            tabIndex={front ? 0 : -1}
            aria-label={front ? `View details for ${project.title}` : `Show ${project.title}`}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-fg transition-colors duration-300 after:absolute after:inset-0 after:rounded-[1.75rem] after:content-[''] group-hover:border-accent group-hover:bg-accent-strong group-hover:text-white"
          >
            <ArrowUpRightIcon className="size-5 transition-transform duration-300 group-hover:rotate-45" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────── Carousel item ─────────────────────── */

/** One card on the ring. Opacity / brightness follow how far it is from the front. */
function RingItem({
  angle,
  radius,
  rotation,
  children,
}: {
  angle: number;
  radius: number;
  rotation: MotionValue<number>;
  children: React.ReactNode;
}) {
  // Angle relative to the viewer, normalised to [-180, 180].
  const rel = useTransform(rotation, (r) => ((((angle + r + 180) % 360) + 360) % 360) - 180);
  const facing = useTransform(rel, (a) => Math.cos((a * Math.PI) / 180)); // 1 = front, -1 = back
  const opacity = useTransform(facing, (c) => (c > 0 ? 0.35 + 0.65 * c : 0.12 + 0.23 * (1 + c)));
  const filter = useTransform(facing, (c) => `brightness(${0.45 + 0.55 * Math.max(c, 0)})`);

  return (
    <motion.li
      className="absolute inset-0"
      style={{ transform: `rotateY(${angle}deg) translateZ(${radius}px)`, opacity, filter }}
    >
      {children}
    </motion.li>
  );
}

/* ─────────────────────────── Section ─────────────────────────── */

export default function Projects() {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const close = useCallback(() => setSelected(null), []);

  const visible = useMemo(() => (filter === "All" ? projects : projects.filter((p) => p.category === filter)), [filter]);
  const total = visible.length;
  const step = 360 / Math.max(total, 1);

  /* Ring geometry — card width follows the container; radius keeps cards from overlapping. */
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { margin: "-20% 0px" });
  const [cardW, setCardW] = useState(340);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCardW(Math.round(Math.min(360, Math.max(250, entry.contentRect.width * 0.72)))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const radius = total >= 3 ? Math.round((cardW / 2 / Math.tan(Math.PI / total)) * 1.18) : total === 2 ? Math.round(cardW * 0.75) : 0;

  /* Rotation state */
  const rotation = useMotionValue(0);
  const anim = useRef<ReturnType<typeof animate> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      const i = ((index % total) + total) % total;
      // Pick the equivalent target angle closest to the current rotation (shortest spin).
      const current = rotation.get();
      let target = -i * step;
      target += Math.round((current - target) / 360) * 360;
      anim.current?.stop();
      anim.current = animate(rotation, target, { duration: reduced ? 0 : 0.9, ease });
      setActive(i);
    },
    [rotation, step, total, reduced],
  );

  // Reset when the filter changes.
  const changeFilter = (c: (typeof categories)[number]) => {
    anim.current?.stop();
    rotation.set(0);
    setActive(0);
    setFilter(c);
  };

  // Auto-rotate (paused on hover/drag/focus, while the modal is open, off-screen, or reduced motion).
  useEffect(() => {
    if (reduced || paused || selected || !inView || total < 2) return;
    const id = window.setInterval(() => goTo(active + 1), AUTO_MS);
    return () => window.clearInterval(id);
  }, [reduced, paused, selected, inView, total, active, goTo]);

  /* Drag / swipe */
  const drag = useRef({ x: 0, rot: 0, moved: false, down: false });
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    anim.current?.stop();
    drag.current = { x: e.clientX, rot: rotation.get(), moved: false, down: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6) d.moved = true;
    rotation.set(d.rot + dx * (step / (cardW * 0.9)));
  };
  const onPointerUp = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    if (d.moved) goTo(Math.round(-rotation.get() / step));
  };
  // Swallow the click that ends a drag so it doesn't open a card.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    }
  };

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative scroll-mt-24 overflow-x-clip py-16 md:py-20">
      {/* Header */}
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            index="04"
            eyebrow="Projects"
            id="projects-title"
            description="Full-stack apps, AI automation, image processing and data dashboards."
            className="mb-0"
          />
          <p aria-hidden="true" className="font-mono text-sm text-muted">
            <span className="text-fg">{pad(total ? active + 1 : 0)}</span> / {pad(total)}
          </p>
        </div>

        {/* Filters */}
        <div role="group" aria-label="Filter projects by category" className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => changeFilter(c)}
              aria-pressed={filter === c}
              className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                filter === c ? "text-white" : "border border-line text-muted hover:text-fg"
              }`}
            >
              {filter === c && <motion.span layoutId="project-filter" className="absolute inset-0 rounded-full bg-accent-strong" />}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3D ring carousel */}
      <div
        ref={stage}
        role="region"
        aria-roledescription="carousel"
        aria-label="Projects"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => {
          setPaused(false);
          onPointerUp();
        }}
        // Pause only for keyboard focus (mouse clicks / focus restored by the modal shouldn't freeze it).
        onFocus={(e) => (e.target as HTMLElement).matches(":focus-visible") && setPaused(true)}
        onBlur={() => setPaused(false)}
        className="relative mx-auto mt-14 max-w-6xl touch-pan-y select-none px-6 outline-none [perspective:1700px] focus-visible:ring-2 focus-visible:ring-accent/50 md:mt-16"
      >
        {/* Floor glow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[15%] bottom-0 h-24 rounded-[50%] bg-accent/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease }}
          className="relative mx-auto h-[26rem] cursor-grab active:cursor-grabbing md:h-[28rem]"
          style={{ width: cardW, transformStyle: "preserve-3d" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={onClickCapture}
        >
          {/* Push the ring back so the front card sits at normal size */}
          <div className="absolute inset-0" style={{ transform: `translateZ(${-radius}px)`, transformStyle: "preserve-3d" }}>
            <motion.ul key={filter} className="absolute inset-0" style={{ rotateY: rotation, transformStyle: "preserve-3d" }}>
              {visible.map((p, i) => (
                <RingItem key={p.slug} angle={i * step} radius={radius} rotation={rotation}>
                  <ProjectCard
                    project={p}
                    index={projects.indexOf(p)}
                    front={i === active}
                    compact={cardW < 320}
                    onActivate={() => (i === active ? setSelected(p) : goTo(i))}
                  />
                </RingItem>
              ))}
            </motion.ul>
          </div>
        </motion.div>

        {/* Live status for screen readers */}
        <p aria-live="polite" className="sr-only">
          {total ? `Project ${active + 1} of ${total}: ${visible[active]?.title}` : "No projects"}
        </p>
      </div>

      {/* Controls */}
      <div className="mx-auto mt-10 flex max-w-6xl items-center justify-center gap-5 px-6">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          aria-label="Previous project"
          className="grid size-12 place-items-center rounded-full border border-line text-fg transition-colors hover:border-accent hover:bg-accent-strong hover:text-white"
        >
          <ArrowRightIcon className="size-5 rotate-180" />
        </button>

        <div className="flex items-center gap-2" role="group" aria-label="Choose project">
          {visible.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to ${p.title}`}
              aria-current={i === active ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-accent" : "w-2 bg-line hover:bg-muted"}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(active + 1)}
          aria-label="Next project"
          className="grid size-12 place-items-center rounded-full border border-line text-fg transition-colors hover:border-accent hover:bg-accent-strong hover:text-white"
        >
          <ArrowRightIcon className="size-5" />
        </button>
      </div>

      <p className="mx-auto mt-6 max-w-6xl px-6 text-center text-sm text-muted">
        Drag to spin · click the front card for details ·{" "}
        <a href={socials.github} target="_blank" rel="noopener noreferrer" className="text-accent-soft underline-offset-4 hover:underline">
          more on GitHub
        </a>
      </p>

      {/* Detail modal */}
      <Modal open={selected !== null} onClose={close} labelledBy="project-dialog-title">
        {selected && (
          <div>
            {selected.image ? (
              <div className="relative -mx-6 -mt-6 mb-8 aspect-video overflow-hidden md:-mx-10 md:-mt-10">
                <Image src={selected.image} alt={`${selected.title} cover`} fill sizes="42rem" className="object-cover" />
              </div>
            ) : (
              <div
                aria-hidden="true"
                className="-mx-6 -mt-6 mb-8 h-36 md:-mx-10 md:-mt-10"
                style={{ background: covers[selected.category], opacity: 0.6 }}
              />
            )}
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge accent>{selected.category}</Badge>
              {selected.status && <Badge>{selected.status}</Badge>}
            </div>
            <h3 id="project-dialog-title" className="font-display text-3xl font-bold md:text-4xl">
              {selected.title}
            </h3>
            <p className="mt-5 leading-relaxed text-muted">{selected.description}</p>

            <h4 className="mt-8 font-mono text-xs uppercase tracking-widest text-accent-soft">Tech stack</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {selected.stack.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <ProjectLink href={selected.github} label="GitHub" icon={<GithubIcon className="size-4" />} />
              <ProjectLink href={selected.live} label="Live" icon={<ArrowUpRightIcon className="size-4" />} />
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
