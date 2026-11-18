"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { profile, socialHandles, socials } from "@/data/portfolio";
import { sendContactMessage, type ContactPayload } from "@/lib/contact";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { GithubIcon, LinkedinIcon, MailIcon, PhoneIcon, SendIcon, WhatsappIcon } from "@/components/ui/Icons";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "success"; message: string } | { kind: "error"; message: string };
type Errors = Partial<Record<keyof ContactPayload, string>>;

const contactItems = [
  { icon: MailIcon, label: "Email", value: profile.email, href: socials.email },
  { icon: PhoneIcon, label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
  { icon: LinkedinIcon, label: "LinkedIn", value: "madhawa-gunarathne", href: socials.linkedin, external: true },
  { icon: GithubIcon, label: "GitHub", value: "MadhawaPrabhath", href: socials.github, external: true },
  { icon: WhatsappIcon, label: "WhatsApp", value: socialHandles.whatsapp, href: socials.whatsapp, external: true },
];

function validate(data: ContactPayload): Errors {
  const errors: Errors = {};
  if (data.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Please enter a valid email address.";
  if (data.message.trim().length < 10) errors.message = "Message should be at least 10 characters.";
  return errors;
}

/** Floating-label input used by the form. */
function Field({
  id,
  label,
  error,
  textarea,
  ...props
}: {
  id: keyof ContactPayload;
  label: string;
  error?: string;
  textarea?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const cls = `peer w-full rounded-2xl border bg-surface-2/50 px-4 pb-3 pt-6 text-fg outline-none transition-colors placeholder:text-transparent focus:border-accent ${
    error ? "border-red-400" : "border-line"
  }`;
  return (
    <div className="relative">
      {textarea ? (
        <textarea id={id} name={id} rows={5} placeholder={label} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={`${cls} resize-none`} {...props} />
      ) : (
        <input id={id} name={id} placeholder={label} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={cls} {...props} />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2 text-xs text-muted transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent-soft"
      >
        {label}
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Contact() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot: bots fill hidden fields, humans don't.
    if (fd.get("company")) return;

    const data: ContactPayload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    const v = validate(data);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setStatus({ kind: "sending" });
    const result = await sendContactMessage(data, profile.email);
    if (result.ok) {
      form.reset();
      setStatus({
        kind: "success",
        message:
          result.via === "mailto"
            ? "Opening your email app with the message pre-filled…"
            : "Thanks! Your message has been sent — I'll get back to you soon.",
      });
    } else {
      setStatus({ kind: "error", message: result.error });
    }
  }

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative scroll-mt-24 py-16 md:py-20">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_bottom,var(--glow),transparent_65%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading
          index="06"
          eyebrow="Contact"
          id="contact-title"
          description="Have a role, a project or just a question? My inbox is open."
        />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Direct contact details */}
          <Reveal>
            <ul className="space-y-3">
              {contactItems.map(({ icon: Icon, label, value, href, external }) => {
                const inner = (
                  <>
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-accent-soft transition-colors group-hover:border-accent group-hover:bg-accent-strong group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[11px] uppercase tracking-widest text-muted">{label}</span>
                      <span className="block truncate text-fg">{value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        className="group flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-surface/60"
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="group flex items-center gap-4 p-2">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.1}>
            <form onSubmit={onSubmit} noValidate className="glass space-y-4 rounded-3xl p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="name" label="Your name" autoComplete="name" error={errors.name} />
                <Field id="email" label="Your email" type="email" autoComplete="email" error={errors.email} />
              </div>
              <Field id="message" label="Your message" textarea error={errors.message} />

              {/* Honeypot (hidden from humans & assistive tech) */}
              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <Button type="submit" disabled={status.kind === "sending"}>
                  {status.kind === "sending" ? "Sending…" : "Send message"} <SendIcon className="size-4" />
                </Button>
                <AnimatePresence mode="wait">
                  {(status.kind === "success" || status.kind === "error") && (
                    <motion.p
                      key={status.kind}
                      role="status"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-sm ${status.kind === "success" ? "text-accent-soft" : "text-red-400"}`}
                    >
                      {status.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
