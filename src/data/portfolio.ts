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
  /** Cover image in /public (screenshot, mock-up or AI image). Optional — falls back to a gradient. */
  image?: string;
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
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://madhawa-gunarathne.vercel.app",
  title: "Madhawa Gunarathne — Software Engineer",
  description:
    "Portfolio of Madhawa Gunarathne, a Software Engineer and B.Sc. (Hons) Computer Science & Statistics graduate from the University of Peradeniya, focused on full-stack development, AI-driven automation and data analysis.",
  /** CV file in /public */
  cvUrl: "/Madhawa_Gunarathne_CV.pdf",
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
  photo: "/dp1.webp", // optimised copy of /public/dp1.png (transparent cut-out)
  bio: [
    "Recent B.Sc. (Hons) graduate in Applied Sciences (Computer Science and Statistics) from the University of Peradeniya, with a proven ability to design scalable web architectures and build full-stack applications.",
    "I automate complex workflows using n8n and AI, and transform complex datasets into interactive visual insights. I'm passionate about leveraging data analysis and modern full-stack engineering to deliver robust, real-world software products.",
  ],
};

/** Hero (left column) copy. */
export const hero = {
  status: "Open to work",
  greeting: `Hi, I'm ${profile.name} 👋`,
  headline: ["Full-Stack Developer", "building smart web apps"] as const,
  rotatingPrefix: "with",
  /** Cycles every 2.5s */
  rotatingWords: ["AI Automation", "Data Analytics", "Modern Web Apps"],
  description: "I build web apps end to end and make them smarter with AI automation and data-driven insights.",
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

/** About section — "Journey" mini-timeline (facts from the CV). */
export const journey = [
  { year: "2021", title: "Started B.Sc. (Hons)", text: "Applied Science — Computer Science & Statistics, University of Peradeniya." },
  { year: "2025", title: "Graduated", text: "Completed the degree (Feb 2021 — Dec 2025)." },
  {
    year: "2026",
    title: "Software Engineer Intern",
    text: "FocalId Technologies — microservices HRM system with FastAPI, React/Next.js & PostgreSQL.",
  },
];

/** About section — "What I do" cards (wording taken from the CV summary & skills). */
export const whatIDo: { id: string; icon: "code" | "ai" | "chart"; title: string; text: string; tools: string[] }[] = [
  {
    id: "fullstack",
    icon: "code",
    title: "Full-Stack Development",
    text: "Designing scalable web architectures and building full-stack applications end to end.",
    tools: ["React", "Next.js", "Node.js", "FastAPI"],
  },
  {
    id: "automation",
    icon: "ai",
    title: "AI & Automation",
    text: "Automating complex workflows using n8n and AI.",
    tools: ["n8n", "Docker", "Node.js"],
  },
  {
    id: "data",
    icon: "chart",
    title: "Data Analysis",
    text: "Transforming complex datasets into interactive visual insights and KPI dashboards.",
    tools: ["Power BI", "Pandas", "SQL"],
  },
];

export const socials = {
  github: "https://github.com/MadhawaPrabhath",
  linkedin: "https://www.linkedin.com/in/madhawa-gunarathne-859287135/",
  email: `mailto:${profile.email}`,
  instagram: "https://www.instagram.com/___madhawa/",
  facebook: "https://www.facebook.com/madhawa.prabhath.9",
  /** WhatsApp click-to-chat link (number without "+" or spaces) */
  whatsapp: "https://wa.me/94774148826",
};

/** Display handles for the contact list. */
export const socialHandles = {
  instagram: "@___madhawa",
  facebook: "madhawa.prabhath.9",
  whatsapp: "+94 77 414 8826",
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

/** Experience section — stat shown under the role list. */
export const experienceStat = { value: "2+", label: "years of Full-Stack development experience" };

export const experience: Experience[] = [
  {
    role: "Full-Stack Developer",
    company: "Freelancing / Personal Projects",
    period: "2024 — Present",
    summary:
      "Building full-stack web applications end to end since my third year of university — from responsive React/Next.js frontends to Node.js/Express APIs and SQL/NoSQL databases.",
    highlights: [
      "ClassMaster — online class management platform (React, Node.js, Tailwind CSS, MySQL).",
      "SK Electricals Selling Platform — selling platform for an electrical store (Next.js, Node.js, Express.js, MongoDB).",
      "HR Chatbot — AI/NLP web application with n8n automation (React, Node.js, n8n, Docker).",
    ],
    stack: ["React", "Next.js", "Node.js", "Express.js", "MySQL", "MongoDB", "Tailwind CSS"],
  },
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
    image: "/projects/hr-chatbot.svg", // placeholder illustration — replace with a real screenshot / AI image
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
    image: "/projects/classmaster.svg", // placeholder illustration — replace with a real screenshot / AI image
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
    image: "/projects/sk-electricals.svg", // placeholder illustration — replace with a real screenshot / AI image
    title: "SK Electricals Selling Platform",
    category: "Full-Stack",
    short: "Full-stack web application for an electrical store.",
    description: "Full-stack selling platform (web application) for an electrical store. [ADD DESCRIPTION]",
    stack: ["Next.js", "Node.js", "Express.js", "MongoDB"],
    status: "Ongoing",
    github: "[ADD LINK]",
    live: "[ADD LINK]",
  },
  {
    slug: "betel-leaf-disease-detector",
    image: "/projects/betel-leaf-disease-detector.svg", // placeholder illustration — replace with a real screenshot / AI image
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
    image: "/projects/covid-19-dashboard.svg", // placeholder illustration — replace with a real screenshot / AI image
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
    image: "/projects/transport-dashboard.svg", // placeholder illustration — replace with a real screenshot / AI image
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
  { id: "services", label: "What I Do" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;
