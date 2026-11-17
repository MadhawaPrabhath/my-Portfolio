import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Education from "@/components/sections/Education";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import { education, profile, site, socials } from "@/data/portfolio";

/** Structured data so search engines understand who this site is about. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  url: site.url,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Dambulla", addressRegion: "Central Province", addressCountry: "LK" },
  alumniOf: { "@type": "CollegeOrUniversity", name: education[0].institution },
  sameAs: [socials.github, socials.linkedin],
};

export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
