"use client";

import { profile, socials } from "@/data/portfolio";
import { scrollToSection } from "@/lib/scroll";
import { ArrowUpIcon, GithubIcon, LinkedinIcon, MailIcon, InstagramIcon, FacebookIcon, WhatsappIcon } from "@/components/ui/Icons";

const links = [
  { href: socials.github, label: "GitHub", icon: GithubIcon, external: true },
  { href: socials.linkedin, label: "LinkedIn", icon: LinkedinIcon, external: true },
  { href: socials.email, label: "Email", icon: MailIcon, external: false },
  { href: socials.instagram, label: "Instagram", icon: InstagramIcon, external: true },
  { href: socials.facebook, label: "Facebook", icon: FacebookIcon, external: true },
  { href: socials.whatsapp, label: "WhatsApp", icon: WhatsappIcon, external: true },
];

/** Footer: oversized name, social links and back-to-top. */
export default function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* Decorative watermark — drawn via CSS content so it isn't treated as body text. */}
        <div
          aria-hidden="true"
          data-text={profile.firstName}
          className="select-none font-display text-[clamp(3rem,13vw,10rem)] font-bold leading-none tracking-[-0.05em] text-fg/[0.06] before:content-[attr(data-text)]"
        />

        <div className="mt-8 flex flex-col-reverse items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} {profile.name}. Built with Next.js, Three.js & GSAP.
          </p>

          <div className="flex items-center gap-3">
            <ul className="flex gap-2">
              {links.map(({ href, label, icon: Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent-soft"
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => scrollToSection("top")}
              aria-label="Back to top"
              className="group grid size-11 place-items-center rounded-full bg-accent-strong text-white"
            >
              <ArrowUpIcon className="size-5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
