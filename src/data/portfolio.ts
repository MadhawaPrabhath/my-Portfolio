/**
 * ─────────────────────────────────────────────────────────────
 *  ALL SITE CONTENT LIVES HERE.
 *  Edit this file to update the portfolio — no component changes needed.
 *
 *  Values written like "[ADD LINK]" are placeholders. Anything starting
 *  with "[" is treated as "not set yet" and rendered as a disabled /
 *  clearly-marked placeholder in the UI.
 * ─────────────────────────────────────────────────────────────
 */

export type SkillGroup = {
  id: string;
  label: string;
  skills: string[];
};

export type Experience = {
  role: string;
  company: string;
  period: string;
  location?: string;
  summary: string;
  highlights: string[];
  stack: string[];
};

export type ProjectCategory = "Full-Stack" | "AI & Automation" | "Image Processing" | "Data Analytics";

export type Project = {
  slug: string;
  title: string;
  category: ProjectCategory;
  /** One-liner shown on the card */
  short: string;
  /** Longer text shown in the detail modal */
  description: string;
  stack: string[];
  status?: "Ongoing" | "Completed";
  github: string;
  live: string;
};

export type Education = {
  degree: string;
  field: string;
  institution: string;
  period: string;
  coursework: string[];
};

/** Returns true for "[ADD …]"-style placeholder values. */
export const isPlaceholder = (value?: string) => !value || value.trim().startsWith("[");

export const site = {
  /** Your deployed URL — used for SEO, sitemap and Open Graph. Or set NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-portfolio.vercel.app", // [ADD LINK]
  title: "Madhawa Gunarathne — Software Engineer",
  description:
    "Portfolio of Madhawa Gunarathne, a Software Engineer and B.Sc. (Hons) Computer Science & Statistics graduate from the University of Peradeniya, focused on full-stack development, AI-driven automation and data analysis.",
  /** Put your CV at /public/cv.pdf */
  cvUrl: "/cv.pdf",
};

export const profile = {
  name: "Madhawa Gunarathne",
  firstName: "Madhawa",
  lastName: "Gunarathne",
  initials: "MG",
  title: "Software Engineer",
  tagline: "Full-stack Development, AI-driven automation and data that tells a story.",
  location: "Dambulla, Central Province, Sri Lanka",
  email: "madhawa.0516@gmail.com",
  phone: "+94 77 4148826",
  /** Path to your photo in /public (e.g. "/images/profile.jpg"). Leave as placeholder to show the styled fallback. */
  photo: "[ADD PHOTO]",
  bio: [
    "Recent B.Sc. (Hons) graduate in Applied Sciences (Computer Science and Statistics) from the University of Peradeniya, with a proven ability to design scalable web architectures and build full-stack applications.",
    "I automate complex workflows using n8n and AI, and transform complex datasets into interactive visual insights. I'm passionate about leveraging data analysis and modern full-stack engineering to deliver robust, real-world software products.",
  ],
};

/**
 * The code snippet "typed" in the hero editor window.
 * Values can be a string or a list of strings.
 */
export const heroCode = {
  fileName: "developer.ts",
  variable: "developer",
  fields: {
    name: profile.name,
    role: profile.title,
    location: "Dambulla, Sri Lanka",
    degree: "B.Sc. (Hons) CS & Statistics",
    stack: ["Next.js", "FastAPI", "PostgreSQL"],
    focus: ["Full-Stack", "AI Automation", "Data Analysis"],
  } as Record<string, string | string[]>,
  terminal: { command: "npm run build", output: "✓ Compiled successfully" },
};

export const socials = {
  github: "https://github.com/MadhawaPrabhath",
  linkedin: "https://www.linkedin.com/in/madhawa-gunarathne-859287135/",
  email: `mailto:${profile.email}`,
};

export const skillGroups: SkillGroup[] = [
  {
    id: "languages",
    label: "Languages",
    skills: ["Python", "Java", "C", "Golang", "JavaScript", "TypeScript"],
  },
  {
    id: "frontend",
    label: "Frontend",
    skills: ["React", "Next.js", "React Query", "React Testing Library", "HTML5", "CSS3", "Tailwind CSS"],
  },
  {
    id: "backend",
    label: "Backend",
    skills: ["Node.js", "Express.js", "FastAPI", "RESTful APIs"],
  },
  {
    id: "databases",
    label: "Databases",
    skills: ["MySQL", "PostgreSQL", "MongoDB"],
  },
  {
    id: "data",
    label: "Data / Statistics",
    skills: [
      "Power BI",
      "Excel",
      "SQL",
      "NumPy",
      "Pandas",
      "Data Analysis",
      "Data Cleaning",
      "Data Visualization",
      "Statistical Analysis",
      "KPI Analysis",
      "Dashboard Development",
    ],
  },
  {
    id: "tools",
    label: "Tools",
    skills: ["Git", "GitHub", "GitHub Actions", "Docker", "n8n", "GCP", "Figma", "OpenCV", "OpenGL"],
  },
];

export const experience: Experience[] = [
  {
    role: "Software Engineer — Intern",
    company: "FocalId Technologies",
    period: "Jan 2026 — Jul 2026",
    summary:
      "Developed a microservices-based Human Resource Management (HRM) system using FastAPI, React/Next.js, and PostgreSQL within a collaborative Agile environment.",
    highlights: [
      "Wrote unit tests to ensure code reliability.",
      "Contributed to employee management and document workflows.",
      "Worked on role-based access control and API security.",
      "Provided deployment support using GCP.",
    ],
    stack: ["FastAPI", "React", "Next.js", "PostgreSQL", "GCP"],
  },
];

export const projects: Project[] = [
  {
    slug: "hr-chatbot",
    title: "HR Chatbot",
    category: "AI & Automation",
    short: "\"HR Chatbot\" web application — an AI/NLP project.",
    description: "\"HR Chatbot\" web application (AI/NLP project). [ADD DESCRIPTION]",
    stack: ["React", "JavaScript", "HTML", "CSS", "Node.js", "n8n", "Docker"],
    github: "[ADD LINK]",
    live: "[ADD LINK]",
  },
  {
    slug: "classmaster",
    title: "ClassMaster",
    category: "Full-Stack",
    short: "Online Class Management Platform — full-stack project.",
    description: "Full-stack project for online class management. [ADD DESCRIPTION]",
    stack: ["React", "Node.js", "Tailwind CSS", "MySQL"],
    github: "[ADD LINK]",
    live: "[ADD LINK]",
  },
  {
    slug: "sk-electricals",
    title: "SK Electricals Selling Platform",
    category: "Full-Stack",
    short: "Full-stack web application for an electrical store.",
    description: "Full-stack selling platform (web application) for an electrical store. This project is ongoing. [ADD DESCRIPTION]",
    stack: ["Next.js", "Node.js", "Express.js", "MongoDB"],
    status: "Ongoing",
    github: "[ADD LINK]",
    live: "[ADD LINK]",
  },
  {
    slug: "betel-leaf-disease-detector",
    title: "Betel Leaf Disease Detector",
    category: "Image Processing",
    short: "Digital image processing project for detecting betel leaf disease.",
    description: "Digital image processing project built in Python using OpenCV, NumPy and Matplotlib. [ADD DESCRIPTION]",
    stack: ["Python", "OpenCV", "NumPy", "Matplotlib"],
    github: "[ADD LINK]",
    live: "[ADD LINK]",
  },
  {
    slug: "covid-19-dashboard",
    title: "COVID-19 Data Analysis Dashboard",
    category: "Data Analytics",
    short: "Interactive Power BI dashboard analysing COVID-19 trends.",
    description:
      "Created an interactive Power BI dashboard to analyse COVID-19 trends, including cases, deaths, and recovery patterns. Used visualizations and KPIs to present insights across countries and time periods.",
    stack: ["Power BI", "Data Visualization", "KPI Analysis"],
    github: "[ADD LINK]",
    live: "[ADD LINK]",
  },
  {
    slug: "transport-dashboard",
    title: "Transport Data Analysis Dashboard",
    category: "Data Analytics",
    short: "Power BI dashboards and KPIs for transport-related data.",
    description:
      "Analyse transport-related data such as passenger counts, ticket sales, or trip performance using dashboards and KPIs.",
    stack: ["Power BI", "Dashboard Development", "KPI Analysis"],
    github: "[ADD LINK]",
    live: "[ADD LINK]",
  },
];

export const education: Education[] = [
  {
    degree: "B.Sc. (Hons) in Applied Science",
    field: "Computer Science, Statistics",
    institution: "University of Peradeniya",
    period: "Feb 2021 — Dec 2025",
    coursework: [
      "Computer Architecture",
      "Server-side Web Programming",
      "Digital Image Processing",
      "Software Engineering",
      "Design and Analysis of Algorithms",
      "Object-Oriented Programming",
      "Operating Systems",
      "Artificial Intelligence",
      "Database Management",
    ],
  },
];

/** Navbar + section ids (order matters). */
export const navItems = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;
