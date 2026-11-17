# Madhawa Gunarathne — Portfolio

A personal portfolio built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **React Three Fiber**, **Framer Motion**, **GSAP + ScrollTrigger** and **Lenis**. It's exported as a fully static site, ready for Vercel.

## Features

- An interactive 3D hero: a noise-morphing shader blob, orbit rings and a particle field that react to the mouse.
- An animated name reveal and a short loading intro.
- A draggable 3D skill tag sphere (DOM-based, so the text stays crisp), linked to the grouped skill cards.
- An experience timeline that draws itself on scroll.
- Project cards with 3D tilt and glare, category filters, and an accessible detail modal.
- Dark theme by default with a light-mode toggle (saved per visitor).
- A custom cursor on mouse devices, and smooth scrolling with Lenis.
- Responsive layout. Phones get a lighter 3D scene (fewer polygons and particles, lower pixel ratio).
- `prefers-reduced-motion` support: no 3D canvas, no smooth scroll, no parallax and no cursor effects.
- SEO: metadata, Open Graph and Twitter cards, a generated OG image, favicon, `sitemap.xml`, `robots.txt` and JSON-LD.

## Run locally

Requirements: Node.js 20.9+ (tested on Node 22).

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export → ./out
npx serve out        # preview the production build
npm run lint
```

## Edit your content

**All content lives in [`src/data/portfolio.ts`](src/data/portfolio.ts).** That covers your name, tagline, bio, contact details, skills, experience, projects, education and nav items. You never need to touch the components to update text.

Some values are **placeholders** written like `[ADD LINK]`. Any value that starts with `[` is treated as "not set". The UI shows it as a dashed, clearly marked pill instead of a broken link. Here's what still needs filling in:

| What | Where |
|---|---|
| Project GitHub / live links | `projects[].github`, `projects[].live` |
| Fuller project descriptions | `projects[].description` (remove `[ADD DESCRIPTION]`) |
| Your photo | Put it in `public/images/profile.jpg`, then set `profile.photo = "/images/profile.jpg"` |
| Your CV | Copy the PDF to **`public/cv.pdf`** (the "Download CV" button links there) |
| Site URL | `NEXT_PUBLIC_SITE_URL` env var, or `site.url` |

### Theme colours

The colour tokens are CSS variables at the top of [`src/app/globals.css`](src/app/globals.css), with one block for dark and one for light. The 3D scene colours are in `PALETTE` in [`src/components/three/HeroScene.tsx`](src/components/three/HeroScene.tsx).

## Contact form

The form is frontend-only. It calls `sendContactMessage()` in [`src/lib/contact.ts`](src/lib/contact.ts), and you choose the provider with environment variables. See [`.env.example`](.env.example).

- **Formspree:** create a form, then set `NEXT_PUBLIC_FORMSPREE_ID`.
- **EmailJS:** set `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` and `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`. The template receives `from_name`, `reply_to` and `message`.
- **Neither set:** the form opens the visitor's email app with the message pre-filled (`mailto:`).

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On [vercel.com](https://vercel.com), choose **Add New → Project** and import the repo. Vercel detects Next.js automatically, so no settings are needed.
3. Under **Settings → Environment Variables**, add `NEXT_PUBLIC_SITE_URL` (your final URL) and, optionally, the contact-form variables.
4. Deploy. Every push to `main` redeploys.

Because `output: "export"` is set in `next.config.ts`, you can also host the `out/` folder on any static host (Netlify, GitHub Pages, Cloudflare Pages).

## Project structure

```
src/
  app/
    layout.tsx            fonts, metadata/OG, theme script, global UI (loader, cursor, navbar)
    page.tsx              assembles the sections + JSON-LD
    globals.css           theme tokens (dark/light), utilities
    icon.svg, opengraph-image.tsx, sitemap.ts, robots.ts
  components/
    layout/   Navbar, Footer, Loader, Cursor, ThemeToggle, SmoothScroll, MotionProvider
    sections/ Hero, About, Skills (+TagSphere), Experience, Projects, Education, Contact
    three/    HeroScene (lazy-loaded), shaders
    ui/       Button (magnetic), TiltCard, Modal, Badge, Reveal, SectionHeading, Icons
  data/portfolio.ts       ← all content
  hooks/                  useMediaQuery (reduced motion / touch / mobile), useActiveSection
  lib/                    gsap setup, Lenis scroll helpers, contact adapter, tiny UI stores
```

## Performance notes

- Three.js is loaded with `next/dynamic` (`ssr: false`) only after the intro finishes. It isn't part of the initial bundle.
- The canvas stops rendering (`frameloop="never"`) when the hero is off-screen.
- Polygon budget: about 33k triangles for the blob on desktop and about 7k on mobile. There are 1,200 particles on desktop and 350 on mobile.
- Devices without WebGL, and visitors who prefer reduced motion, get a static CSS gradient instead.
