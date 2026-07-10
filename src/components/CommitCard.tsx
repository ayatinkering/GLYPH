"use client";

import { useEffect, useRef, useState } from "react";
import { ColorPalette } from "@/engine/sky/SkyEngine";

// ── Math constants ─────────────────────────────────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = 2 * Math.PI * (2 - PHI);

// Palette values matching the user's exact requirements:
const DARK_GREEN = "#0A3323";
const MOSS_GREEN = "#839958";
const BEIGE = "#F7F4D5";
const ROSY_BROWN = "#D3968C";
const MIDNIGHT_GREEN = "#105666";

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  let r = 10, g = 51, b = 35; // Default dark green
  const h = hex.replace("#", "");
  if (h.length === 6) {
    r = parseInt(h.substring(0, 2), 16);
    g = parseInt(h.substring(2, 4), 16);
    b = parseInt(h.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ── Draw all mandala layers using only the 5 specified colors ──────────────────
function renderMandalaToCtx(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number
) {
  ctx.save();
  ctx.translate(cx, cy);

  // ── 1. Radial guide lines (24 guidelines) ──────────────────────────────────
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(R * 1.16 * Math.cos(a), R * 1.16 * Math.sin(a));
    ctx.strokeStyle = hexToRgba(MOSS_GREEN, 0.12);
    ctx.stroke();
  }

  // ── 2. Outer boundary circle ───────────────────────────────────────────────
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.09, 0, Math.PI * 2);
  ctx.strokeStyle = hexToRgba(MOSS_GREEN, 0.28);
  ctx.lineWidth = 0.95;
  ctx.stroke();

  // ── 3. Instrument tick marks (72 ticks) ────────────────────────────────────
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const major = i % 6 === 0;
    const semi = i % 3 === 0;
    const r1 = R * (major ? 1.0 : semi ? 1.035 : 1.065);
    ctx.beginPath();
    ctx.moveTo(r1 * Math.cos(a), r1 * Math.sin(a));
    ctx.lineTo(R * 1.1 * Math.cos(a), R * 1.1 * Math.sin(a));
    ctx.strokeStyle = hexToRgba(DARK_GREEN, major ? 0.7 : semi ? 0.4 : 0.18);
    ctx.lineWidth = major ? 1.25 : semi ? 0.8 : 0.5;
    ctx.stroke();
  }

  // ── 4. Golden-ratio concentric circles (8 circles) ─────────────────────────
  for (let i = 0; i <= 8; i++) {
    const r = R * Math.pow(1 / PHI, i);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(MIDNIGHT_GREEN, 0.08 + (8 - i) * 0.038);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // ── Helper: polar rose r = cos(k·θ) ────────────────────────────────────────
  const drawRose = (
    maxR: number,
    k: number,
    rotations: number,
    steps: number,
    color: string,
    lw: number
  ) => {
    const total = Math.PI * 2 * rotations;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * total;
      const r = maxR * Math.cos(k * t);
      const x = r * Math.cos(t);
      const y = r * Math.sin(t);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.stroke();
  };

  // ── 5. Polar rose layers (Alternating only the 5 required colors) ──────────
  drawRose(R,          13/6,  6, 12000, hexToRgba(MIDNIGHT_GREEN, 0.35), 0.9);
  drawRose(R *  0.875,  7/4,  4,  8000, hexToRgba(MOSS_GREEN, 0.45), 0.9);
  drawRose(R *  0.755,  5/3,  3,  6000, hexToRgba(ROSY_BROWN, 0.55), 1.0);
  drawRose(R *  0.62,   3/2,  2,  4000, hexToRgba(MIDNIGHT_GREEN, 0.65), 1.15);
  drawRose(R *  0.465,  5,    1,  2000, hexToRgba(MOSS_GREEN, 0.75), 1.25);
  drawRose(R *  0.30,   3,    1,  1500, hexToRgba(ROSY_BROWN, 0.85), 1.35);
  drawRose(R *  0.17,   2,    1,   800, hexToRgba(DARK_GREEN, 0.92), 1.5);

  // ── 6. Spirographs (Epitrochoid & Hypocycloid) ─────────────────────────────
  const drawEpitrochoid = (
    Rr: number,
    rr: number,
    d: number,
    steps: number,
    color: string,
    lw: number
  ) => {
    const revs = Math.round(Rr / rr);
    const total = Math.PI * 2 * revs;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * total;
      const x = (Rr + rr) * Math.cos(t) - d * Math.cos(((Rr + rr) / rr) * t);
      const y = (Rr + rr) * Math.sin(t) - d * Math.sin(((Rr + rr) / rr) * t);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.stroke();
  };

  const drawHypocycloid = (
    Rr: number,
    rr: number,
    d: number,
    steps: number,
    color: string,
    lw: number
  ) => {
    const revs = Math.round(Rr / rr);
    const total = Math.PI * 2 * revs;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * total;
      const x = (Rr - rr) * Math.cos(t) + d * Math.cos(((Rr - rr) / rr) * t);
      const y = (Rr - rr) * Math.sin(t) - d * Math.sin(((Rr - rr) / rr) * t);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.stroke();
  };

  drawEpitrochoid(
    R * 0.68, R * 0.68 / 6, R * 0.68 / 6 * 1.12,
    5000, hexToRgba(ROSY_BROWN, 0.32), 0.85
  );
  drawHypocycloid(
    R * 0.52, R * 0.52 / 7, R * 0.52 / 7 * 0.85,
    5600, hexToRgba(MIDNIGHT_GREEN, 0.28), 0.8
  );

  // ── 7. Fibonacci phyllotaxis inner constellation ───────────────────────────
  const dotR = R * 0.35;
  for (let i = 0; i < 233; i++) {
    const r = dotR * Math.sqrt(i / 233);
    const theta = i * GOLDEN_ANGLE;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const t = i / 233;
    ctx.beginPath();
    ctx.arc(x, y, 0.45 + t * 0.95, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(DARK_GREEN, 0.15 + t * 0.48);
    ctx.fill();
  }

  // ── 8. Centre ornamental rings ─────────────────────────────────────────────
  for (const [r, a] of [
    [12, 0.25],
    [8,  0.40],
    [5,  0.55],
    [2.8, 0.0],
  ] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    if (r > 3) {
      ctx.strokeStyle = hexToRgba(DARK_GREEN, a);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    } else {
      ctx.fillStyle = hexToRgba(ROSY_BROWN, 0.94);
      ctx.fill();
    }
  }

  ctx.restore();
}

// ── Mandala Art Component ────────────────────────────────────────────────────
function MandalaArt({ size }: { size: number; palette: ColorPalette }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const R = size * 0.43;
    const cx = size / 2;
    const cy = size / 2;

    const off = document.createElement("canvas");
    off.width = size * dpr;
    off.height = size * dpr;
    const offCtx = off.getContext("2d")!;
    offCtx.scale(dpr, dpr);
    renderMandalaToCtx(offCtx, cx, cy, R);

    let rot = 0;
    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.drawImage(off, -cx, -cy, size, size);
      ctx.restore();
      rot += 0.00048;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return <canvas ref={ref} style={{ width: size, height: size }} />;
}

// ── Share Card Props ──────────────────────────────────────────────────────────
interface CommitCardProps {
  commitNumber: number;
  seed: string;
  footfalls: number;
  cadence: number;
  smoothness: number;
  entropy: number;
  rotation: number;
  solarPeriod: string;
  moonPhase: number;
  date: string;
  palette: ColorPalette;
  history: {
    cadence: number[];
    acceleration: number[];
    smoothness: number[];
    entropy: number[];
    rotation: number[];
  };
  duration?: number;
}

export function CommitCard({
  commitNumber,
  seed,
  footfalls,
  cadence,
  smoothness,
  entropy,
  rotation,
  solarPeriod,
  moonPhase,
  date,
  palette,
  history,
  duration = 0,
}: CommitCardProps) {
  const [cardW, setCardW] = useState(375);

  useEffect(() => {
    const update = () =>
      setCardW(Math.min(375, Math.max(280, window.innerWidth - 32)));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const mandalaSize = cardW - 40; // 20px padding each side
  
  // Dynamic color bindings matching the required nature scheme
  const CARD_BG = BEIGE;
  const TEXT_PRIMARY = DARK_GREEN;
  const TEXT_SECONDARY = MIDNIGHT_GREEN;
  const BORDER_COLOR = "rgba(10, 51, 35, 0.12)";
  const TEXT_DIM = "rgba(16, 86, 102, 0.65)";
  const DOT_GRID_COLOR = "rgba(10, 51, 35, 0.04)";

  const formatWalkTitle = (period: string) => {
    switch (period.toLowerCase()) {
      case "goldenhour":
        return "Golden Hour Walk";
      case "bluehour":
        return "Blue Hour Walk";
      case "night":
        return "Night Walk";
      case "day":
      default:
        return "Morning Walk";
    }
  };

  const formattedDuration = `${Math.max(1, Math.round(duration / 60))} min`;
  const formattedDistance = `${(footfalls * 0.00075).toFixed(1)} km`;

  return (
    <div
      style={{
        width: cardW,
        background: CARD_BG,
        borderRadius: 26,
        overflow: "hidden",
        boxShadow:
          "0 24px 64px rgba(10,51,35,0.06), 0 8px 24px rgba(10,51,35,0.03), inset 0 1px 0 rgba(255,255,255,0.8)",
        backgroundImage: `
          radial-gradient(${DOT_GRID_COLOR} 1px, transparent 1px)
        `,
        backgroundSize: "22px 22px",
        border: `1px solid ${BORDER_COLOR}`,
      }}
    >
      {/* ─ Top header ────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "22px 24px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: MOSS_GREEN,
              display: "block",
              flexShrink: 0,
              boxShadow: `0 0 6px ${hexToRgba(MOSS_GREEN, 0.5)}`,
            }}
          />
          <span
            style={{
              fontFamily: "Lastik, Lastic, serif",
              color: TEXT_PRIMARY,
              fontSize: 15,
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            glyph
          </span>
        </div>
        {/* Commit ID */}
        <div
          style={{
            fontFamily: "Lastik, Lastic, serif",
            color: TEXT_DIM,
            fontSize: 9.5,
            letterSpacing: "0.22em",
          }}
        >
          {`MC — ${commitNumber.toString().padStart(4, "0")}`}
        </div>
      </div>

      {/* ─ Mandala artwork ───────────────────────────────────────────────── */}
      <div
        style={{
          padding: "14px 20px 6px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <MandalaArt size={mandalaSize} palette={palette} />
      </div>

      {/* ─ Walk title ────────────────────────────────────────────────────── */}
      <div style={{ padding: "6px 24px 0" }}>
        <h2
          style={{
            fontFamily: "Lastik, Lastic, serif",
            color: TEXT_PRIMARY,
            fontSize: "clamp(26px, 7.5vw, 36px)",
            fontWeight: 400,
            lineHeight: 1.0,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          {formatWalkTitle(solarPeriod)}
        </h2>
        <p
          style={{
            fontFamily: "Lastik, Lastic, serif",
            color: TEXT_SECONDARY,
            fontSize: 11,
            margin: "5px 0 0",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {date}
        </p>
      </div>

      {/* ─ Hairline divider ──────────────────────────────────────────────── */}
      <div
        style={{
          margin: "15px 24px 14px",
          height: 1,
          background: BORDER_COLOR,
        }}
      />

      {/* ─ Stats row ─────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        {[
          { value: footfalls.toLocaleString(), label: "footfalls" },
          { value: formattedDuration, label: "duration" },
          { value: formattedDistance, label: "distance" },
        ].map(({ value, label }) => (
          <div key={label}>
            <div
              style={{
                fontFamily: "Lastik, Lastic, serif",
                color: TEXT_PRIMARY,
                fontSize: "clamp(16px, 5vw, 20px)",
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}
            >
              {value}
            </div>
            <div
              style={{
                fontFamily: "Lastik, Lastic, serif",
                color: TEXT_DIM,
                fontSize: 9,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ─ Mathematical signature bar ────────────────────────────────────── */}
      <div
        style={{
          margin: "14px 24px",
          padding: "11px 14px",
          background: "rgba(10, 51, 35, 0.02)",
          borderRadius: 10,
          border: `1px solid ${BORDER_COLOR}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Lastik, Lastic, serif",
            color: MOSS_GREEN,
            fontSize: 10.5,
            letterSpacing: "0.04em",
          }}
        >
          φ = 1.618
        </span>
        <div
          style={{ width: 1, height: 14, background: BORDER_COLOR }}
        />
        <span
          style={{
            fontFamily: "Lastik, Lastic, serif",
            color: TEXT_SECONDARY,
            fontSize: 10.5,
          }}
        >
          13 Fibonacci arms
        </span>
        <div
          style={{ width: 1, height: 14, background: BORDER_COLOR }}
        />
        <span
          style={{
            fontFamily: "Lastik, Lastic, serif",
            color: ROSY_BROWN,
            fontSize: 10.5,
          }}
        >
          {`${Math.min(987, footfalls * 8 + 34)} points`}
        </span>
      </div>

      {/* ─ SHA hash strip ────────────────────────────────────────────────── */}
      <div
        style={{
          margin: "0 24px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 1,
            background: BORDER_COLOR,
          }}
        />
        <span
          style={{
            fontFamily: "Lastik, Lastic, serif",
            color: TEXT_DIM,
            fontSize: 9,
            letterSpacing: "0.12em",
          }}
        >
          {`sha: ${seed.substring(0, 12)}`}
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background: BORDER_COLOR,
          }}
        />
      </div>

      {/* ─ Footer ────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "0 24px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Lastik, Lastic, serif",
            color: DARK_GREEN,
            fontSize: 10.5,
            letterSpacing: "0.04em",
          }}
        >
          Commit to touching grass.
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 5.5,
              height: 5.5,
              borderRadius: "50%",
              background: MOSS_GREEN,
              display: "block",
            }}
          />
          <span
            style={{
              fontFamily: "Lastik, Lastic, serif",
              color: TEXT_DIM,
              fontSize: 10,
              fontWeight: 400,
            }}
          >
            glyph
          </span>
        </div>
      </div>
    </div>
  );
}
