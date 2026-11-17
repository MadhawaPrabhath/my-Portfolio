import type { NextConfig } from "next";

/**
 * Static export: `next build` writes a fully static site to /out.
 * Vercel serves it as-is; no server runtime is needed.
 */
const nextConfig: NextConfig = {
  output: "export",
  // next/image's default optimizer needs a server; serve images as-is instead.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
