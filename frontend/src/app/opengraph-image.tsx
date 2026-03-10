// src/app/opengraph-image.tsx
// Auto-generates the 1200x630 OG image for social sharing
// Next.js serves this automatically at /opengraph-image

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PropInvest AI — AI-powered Indian Real Estate Analyzer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "#16a34a",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: "900",
              color: "white",
            }}
          >
            P
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "28px", fontWeight: "700", color: "white" }}>
              PropInvest{" "}
              <span style={{ color: "#4ade80" }}>AI</span>
            </span>
            <span style={{ fontSize: "14px", color: "#64748b", marginTop: "2px" }}>
              V3.9
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "900",
            color: "white",
            lineHeight: "1.1",
            margin: "0 0 24px 0",
            maxWidth: "800px",
          }}
        >
          Analyze Indian Real Estate{" "}
          <span style={{ color: "#4ade80" }}>Like an Institution</span>
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            margin: "0 0 48px 0",
            maxWidth: "700px",
            lineHeight: "1.4",
          }}
        >
          IRR · DSCR · NPV · Monte Carlo · Tax Analysis · AI Investment Memo
        </p>

        {/* Metric pills */}
        <div style={{ display: "flex", gap: "12px" }}>
          {["337 Projects", "24 Cities", "18+ Metrics", "Free"].map((tag) => (
            <div
              key={tag}
              style={{
                background: "rgba(22, 163, 74, 0.15)",
                border: "1px solid rgba(74, 222, 128, 0.3)",
                borderRadius: "999px",
                padding: "8px 20px",
                fontSize: "16px",
                color: "#4ade80",
                fontWeight: "600",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* URL watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "80px",
            fontSize: "18px",
            color: "#475569",
          }}
        >
          propinvest-ai-smoky.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
