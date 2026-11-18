"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { isPlaceholder, projects, socials, type Project, type ProjectCategory } from "@/data/portfolio";
import { gsap, useGSAP, type ScrollTrigger } from "@/lib/gsap";
import { scrollToY } from "@/lib/scroll";
import SectionHeading from "@/components/ui/SectionHeading";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { ArrowUpRightIcon, GithubIcon } from "@/components/ui/Icons";

const categories: ("All" | ProjectCategory)[] = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

/** Each category gets a distinct abstract "cover" so cards look intentional without screenshots. */
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

/*
 * Horizontal mode only runs on large screens with motion allowed:
 * every `motion-safe:lg:*` class below belongs to that mode.
 */

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

type CardProps = {
  project: Project;
  index: number;
  onOpen: () => void;
  onFocus: (e: React.FocusEvent<HTMLElement>) => void;
};

/** Large project card. The big number inside the cover parallaxes while the row scrolls. */
function ProjectCard({ project, index, onOpen, onFocus }: CardProps) {
  return (
    <article
      data-card
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-line bg-surface/70 transition-colors duration-500 hover:border-accent/60"
    >
      {/* Cover */}
      <div className="relative h-44 shrink-0 overflow-hidden lg:h-[42%]" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-70 transition-transform duration-1000 ease-out group-hover:scale-110"
          style={{ background: covers[project.category] }}
        />
        <div className="bg-grid absolute inset-0 opacity-40" />
        <span
          data-num
          className="absolute -bottom-6 right-6 font-display text-[9rem] font-bold leading-none tracking-tighter text-white/15"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-7 md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge accent>{project.category}</Badge>
          {project.status === "Ongoing" && <Badge>Ongoing</Badge>}
        </div>
        <h3 className="font-display text-2xl font-bold leading-tight md:text-3xl">{project.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{project.short}</p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div className="flex flex-wrap gap-1.5">
            {project.stack.slice(0, 4).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
            {project.stack.length > 4 && <Badge>+{project.stack.length - 4}</Badge>}
          </div>

          {/* Stretched button → the whole card is clickable */}
          <button
            type="button"
            onClick={onOpen}
            onFocus={onFocus}
            aria-label={`View details for ${project.title}`}
            className="grid size-12 shrink-0 place-items-center rounded-full border border-line text-fg transition-colors duration-300 after:absolute after:inset-0 after:rounded-[2rem] after:content-[''] group-hover:border-accent group-hover:bg-accent-strong group-hover:text-white"
          >
            <ArrowUpRightIcon className="size-5 transition-transform duration-300 group-hover:rotate-45" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const close = useCallback(() => setSelected(null), []);

  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);

  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );
  const total = visible.length;
  const pad = (n: number) => String(n).padStart(2, "0");

  /*
   * Pinned horizontal scroll (desktop + motion allowed only).
   * Scrolling down moves the track left; rebuilt whenever the filter changes.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const trackEl = track.current;
        const pinEl = pin.current;
        if (!trackEl || !pinEl) return;

        const distance = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);

        const tween = gsap.to(trackEl, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pinEl,
            pin: true,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
              if (counter.current) counter.current.textContent = pad(Math.min(total, Math.floor(self.progress * total) + 1));
            },
          },
        });
        trigger.current = tween.scrollTrigger ?? null;

        // Depth: the big numbers drift against the card movement.
        gsap.utils.toArray<HTMLElement>("[data-num]", trackEl).forEach((el) => {
          gsap.fromTo(
            el,
            { xPercent: 25 },
            {
              xPercent: -25,
              ease: "none",
              scrollTrigger: {
                trigger: el.closest("[data-card]"),
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        return () => {
          trigger.current = null;
        };
      });
    },
    { scope: section, dependencies: [filter], revertOnUpdate: true },
  );

  /** Keyboard users: tabbing to an off-screen card scrolls the page so the card slides into view. */
  const onCardFocus = useCallback((e: React.FocusEvent<HTMLElement>) => {
    const st = trigger.current;
    const card = e.currentTarget.closest<HTMLElement>("[data-card]")?.parentElement;
    const trackEl = track.current;
    if (!st || !card || !trackEl) return;
    const maxX = trackEl.scrollWidth - window.innerWidth;
    if (maxX <= 0) return;
    const target = card.offsetLeft - (window.innerWidth - card.offsetWidth) / 2;
    const ratio = Math.min(Math.max(target / maxX, 0), 1);
    scrollToY(st.start + ratio * (st.end - st.start));
  }, []);

  return (
    <section
      ref={section}
      id="projects"
      aria-labelledby="projects-title"
      className={`relative scroll-mt-24 overflow-x-clip py-28 md:py-40 motion-safe:lg:py-0`}
    >
      <div ref={pin} className="motion-safe:lg:flex motion-safe:lg:h-dvh motion-safe:lg:flex-col motion-safe:lg:justify-center motion-safe:lg:pt-20">
        {/* Header row */}
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              index="04"
              eyebrow="Projects"
              id="projects-title"
              description="Full-stack apps, AI automation, image processing and data dashboards."
              className="mb-0"
            />
            <p aria-hidden="true" className={`hidden font-mono text-sm text-muted motion-safe:lg:block`}>
              <span ref={counter} className="text-fg">
                01
              </span>{" "}
              / {pad(total)}
            </p>
          </div>

          {/* Filters */}
          <div role="group" aria-label="Filter projects by category" className="mt-8 mb-10 flex flex-wrap gap-2 lg:mb-8">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                aria-pressed={filter === c}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                  filter === c ? "text-white" : "border border-line text-muted hover:text-fg"
                }`}
              >
                {filter === c && (
                  <motion.span layoutId="project-filter" className="absolute inset-0 rounded-full bg-accent-strong" />
                )}
                <span className="relative">{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/*
          Track: stacked grid on mobile / reduced motion,
          one long horizontal row (moved by GSAP) on desktop.
        */}
        <ul
          ref={track}
          className={`mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3 motion-safe:lg:mx-0 motion-safe:lg:flex motion-safe:lg:w-max motion-safe:lg:max-w-none motion-safe:lg:gap-8 motion-safe:lg:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] motion-safe:lg:pr-[12vw] motion-safe:lg:will-change-transform`}
        >
          {visible.map((p, i) => (
            <motion.li
              key={`${filter}-${p.slug}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="motion-safe:lg:h-[min(58vh,540px)] motion-safe:lg:w-[min(34rem,40vw)] motion-safe:lg:shrink-0"
            >
              <ProjectCard project={p} index={projects.indexOf(p)} onOpen={() => setSelected(p)} onFocus={onCardFocus} />
            </motion.li>
          ))}

          {/* End card → GitHub */}
          <li className="motion-safe:lg:h-[min(58vh,540px)] motion-safe:lg:w-[min(22rem,26vw)] motion-safe:lg:shrink-0">
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              onFocus={onCardFocus}
              className="group flex h-full min-h-48 flex-col justify-between rounded-[2rem] border border-dashed border-line p-8 transition-colors hover:border-accent"
            >
              <GithubIcon className="size-8 text-accent-soft" />
              <span>
                <span className="block font-display text-2xl font-bold md:text-3xl">More on GitHub</span>
                <span className="mt-2 inline-flex items-center gap-2 text-sm text-muted transition-colors group-hover:text-accent-soft">
                  github.com/MadhawaPrabhath
                  <ArrowUpRightIcon className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </span>
            </a>
          </li>
        </ul>

        {/* Progress bar (horizontal mode only) */}
        <div aria-hidden="true" className={`mx-auto mt-10 hidden w-full max-w-6xl px-6 motion-safe:lg:block`}>
          <div className="h-px w-full bg-line">
            <div ref={bar} className="h-px origin-left scale-x-0 bg-accent" />
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <Modal open={selected !== null} onClose={close} labelledBy="project-dialog-title">
        {selected && (
          <div>
            <div
              aria-hidden="true"
              className="-mx-6 -mt-6 mb-8 h-36 md:-mx-10 md:-mt-10"
              style={{ background: covers[selected.category], opacity: 0.6 }}
            />
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
