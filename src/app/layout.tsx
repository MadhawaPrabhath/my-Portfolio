import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { profile, site, socials } from "@/data/portfolio";
import Navbar from "@/components/layout/Navbar";
import Loader from "@/components/layout/Loader";
import SmoothScroll from "@/components/layout/SmoothScroll";
import MotionProvider from "@/components/layout/MotionProvider";

/* Fonts are self-hosted at build time by next/font (no layout shift). */
const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${profile.name}` },
  description: site.description,
  applicationName: `${profile.name} Portfolio`,
  authors: [{ name: profile.name, url: socials.github }],
  creator: profile.name,
  keywords: [
    profile.name,
    "Software Engineer",
    "Full-Stack Developer",
    "Next.js",
    "React",
    "FastAPI",
    "n8n",
    "Data Analysis",
    "Power BI",
    "Sri Lanka",
    "University of Peradeniya",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: profile.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08080c" },
    { media: "(prefers-color-scheme: light)", color: "#f6f6fb" },
  ],
  colorScheme: "dark light",
};

/** Runs before paint so a saved light theme never flashes dark. Dark is the default. */
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.dataset.theme='light'}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${display.variable} ${inter.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh overflow-x-clip">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>
          <Loader />
          <SmoothScroll />
          <Navbar />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
