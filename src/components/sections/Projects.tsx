"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { isPlaceholder, projects, type Project, type ProjectCategory } from "@/data/portfolio";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";
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

function ProjectCard({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  return (
    <TiltCard className="h-full rounded-3xl">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface/70 transition-colors hover:border-accent/50">
        {/* Cover */}
        <div className="relative h-40 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-70 transition-transform duration-700 group-hover:scale-110"
            style={{ background: covers[project.category] }}
          />
          <div className="bg-grid absolute inset-0 opacity-40" />
          <span className="absolute bottom-3 right-4 font-display text-6xl font-bold text-white/15">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6" style={{ transform: "translateZ(30px)" }}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge accent>{project.category}</Badge>
            {project.status === "Ongoing" && <Badge>Ongoing</Badge>}
          </div>
          <h3 className="font-display text-xl font-bold">{project.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{project.short}</p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.stack.slice(0, 4).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
            {project.stack.length > 4 && <Badge>+{project.stack.length - 4}</Badge>}
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold text-accent-soft after:absolute after:inset-0 after:content-['']"
            aria-label={`View details for ${project.title}`}
          >
            View details
            <ArrowUpRightIcon className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </article>
    </TiltCard>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const close = useCallback(() => setSelected(null), []);

  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          index="04"
          eyebrow="Projects"
          title="Selected work"
          id="projects-title"
          description="Full-stack apps, AI automation, image processing and data dashboards."
        />

        {/* Filters */}
        <div role="group" aria-label="Filter projects by category" className="mb-10 flex flex-wrap gap-2">
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

        <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProjectCard project={p} index={projects.indexOf(p)} onOpen={() => setSelected(p)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
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
