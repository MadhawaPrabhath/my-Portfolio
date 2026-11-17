import { ImageResponse } from "next/og";
import { profile } from "@/data/portfolio";

/** Social share card (1200×630), rendered to a static PNG at build time. */
export const dynamic = "force-static";
export const alt = `${profile.name} — ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "radial-gradient(circle at 85% 30%, #7c5cff 0%, #3a2a8a 25%, #08080c 60%)",
          color: "#ededf3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#a895ff", letterSpacing: 6, textTransform: "uppercase" }}>Portfolio</div>
        <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1, marginTop: 24, letterSpacing: -3 }}>{profile.name}</div>
        <div style={{ fontSize: 44, marginTop: 28 }}>{profile.title}</div>
        <div style={{ fontSize: 28, marginTop: 16, color: "#9a9ab0", maxWidth: 900 }}>{profile.tagline}</div>
      </div>
    ),
    size,
  );
}
