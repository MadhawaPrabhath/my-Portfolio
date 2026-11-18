"use client";

import { profile, socials } from "@/data/portfolio";
import { scrollToSection } from "@/lib/scroll";
import {
  ArrowUpIcon,
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  InstagramIcon,
  FacebookIcon,
  WhatsappIcon,
  PhoneIcon,
  MapPinIcon,
} from "@/components/ui/Icons";

const links = [
  { href: socials.github, label: "GitHub", icon: GithubIcon, external: true },
  { href: socials.linkedin, label: "LinkedIn", icon: LinkedinIcon, external: true },
  { href: socials.email, label: "Email", icon: MailIcon, external: false },
  { href: socials.instagram, label: "Instagram", icon: InstagramIcon, external: true },
  { href: socials.facebook, label: "Facebook", icon: FacebookIcon, external: true },
  { href: socials.whatsapp, label: "WhatsApp", icon: WhatsappIcon, external: true },
];

const contact = [
  { href: socials.email, label: profile.email, icon: MailIcon },
  { href: `tel:${profile.phone.replace(/\s/g, "")}`, label: profile.phone, icon: PhoneIcon },
  { href: undefined, label: profile.location, icon: MapPinIcon },
];

const linkClass = "inline-flex items-start gap-3 text-sm text-muted transition-colors hover:text-accent-soft";

/** Column title, e.g. "CONNECT". */
const ColTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-soft">{children}</h2>
);

/** Footer: brand, navigation, socials and contact columns + copyright bar. */
export default function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="w-full px-6 pt-14 md:px-24 xl:px-52">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          {/* Decorative watermark — drawn via CSS content so it isn't treated as body text. */}
          <div
            aria-hidden="true"
            data-text={profile.firstName}
            className="select-none font-display text-[clamp(3rem,13vw,10rem)] font-bold leading-none tracking-[-0.05em] text-fg/[0.06] before:content-[attr(data-text)] lg:text-[clamp(5rem,11vw,10rem)]"
          />

          <div className="grid shrink-0 gap-10 sm:grid-cols-2 sm:gap-16">
            {/* Connect */}
            <div>
              <ColTitle>Connect</ColTitle>
              <ul className="flex flex-wrap gap-2">
                {links.map(({ href, label, icon: Icon, external }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      title={label}
                      className="grid size-11 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent-soft"
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <Icon className="size-5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
  
            {/* Contact */}
            <div>
              <ColTitle>Contact</ColTitle>
              <ul className="space-y-3">
                {contact.map(({ href, label, icon: Icon }) => (
                  <li key={label}>
                    {href ? (
                      <a href={href} className={linkClass}>
                        <Icon className="mt-0.5 size-4 shrink-0" /> {label}
                      </a>
                    ) : (
                      <span className="inline-flex items-start gap-3 text-sm text-muted">
                        <Icon className="mt-0.5 size-4 shrink-0" /> {label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-line py-6 sm:flex-row sm:items-center">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} {profile.name}. Built with Next.js, Three.js & GSAP.
          </p>
          <button
            type="button"
            onClick={() => scrollToSection("top")}
            className="group inline-flex items-center gap-2 rounded-full bg-accent-strong px-4 py-2 text-sm font-medium text-white"
          >
            Back to top
            <ArrowUpIcon className="size-4 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
