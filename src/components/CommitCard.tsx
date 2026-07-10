"use client";

import { useEffect, useRef, useState } from "react";
import { ColorPalette } from "@/engine/sky/SkyEngine";
import { ExportEngine } from "@/engine/export/ExportEngine";
import { GeometryEngine } from "@/engine/geometry/GeometryEngine";

// ── Math constants ─────────────────────────────────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = 2 * Math.PI * (2 - PHI);

// Palette values matching the user's exact requirements:
const DARK_GREEN = "#0A3323";
const MOSS_GREEN = "#839958";
const BEIGE = "#f8f6e9";
const ROSY_BROWN = "#D3968C";
const MIDNIGHT_GREEN = "#105666";
const SOFT_PINK = "#E2959D";

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
  R: number,
  stepsCount: number
) {
  ctx.save();
  ctx.translate(cx, cy);

  if (stepsCount === 0) {
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(DARK_GREEN, 0.92);
    ctx.fill();
    ctx.restore();
    return;
  }

  const scaleFactor = Math.min(1.0, Math.max(0.25, stepsCount / 80));

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
  const concentricReveal = Math.min(8, Math.max(2, Math.floor(stepsCount / 10)));
  for (let i = 0; i <= concentricReveal; i++) {
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

  // ── 5. Polar rose layers (Revealed based on stepsCount) ────────────────────
  if (stepsCount >= 80) {
    drawRose(R * scaleFactor,          13/6,  6, 12000, hexToRgba(MIDNIGHT_GREEN, 0.32), 0.9);
  }
  if (stepsCount >= 60) {
    drawRose(R *  0.875 * scaleFactor,  7/4,  4,  8000, hexToRgba(MOSS_GREEN, 0.40), 0.9);
  }
  if (stepsCount >= 40) {
    drawRose(R *  0.755 * scaleFactor,  5/3,  3,  6000, hexToRgba(ROSY_BROWN, 0.52), 1.0);
  }
  if (stepsCount >= 24) {
    drawRose(R *  0.62 * scaleFactor,   3/2,  2,  4000, hexToRgba(MIDNIGHT_GREEN, 0.64), 1.15);
  }
  if (stepsCount >= 16) {
    drawRose(R *  0.465 * scaleFactor,  5,    1,  2000, hexToRgba(MOSS_GREEN, 0.76), 1.25);
  }
  if (stepsCount >= 8) {
    drawRose(R *  0.30 * scaleFactor,   3,    1,  1500, hexToRgba(ROSY_BROWN, 0.85), 1.35);
  }
  if (stepsCount >= 2) {
    drawRose(R *  0.17 * scaleFactor,   2,    1,   800, hexToRgba(DARK_GREEN, 0.92), 1.5);
  }

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

  if (stepsCount >= 35) {
    drawEpitrochoid(
      R * 0.68, R * 0.68 / 6, R * 0.68 / 6 * 1.12,
      5000, hexToRgba(ROSY_BROWN, 0.30), 0.85
    );
  }

  // ── 7. Fibonacci phyllotaxis inner constellation ───────────────────────────
  const dotsCount = Math.min(233, stepsCount * 2);
  const dotR = R * 0.35;
  for (let i = 0; i < dotsCount; i++) {
    const r = dotR * Math.sqrt(i / 233);
    const theta = i * GOLDEN_ANGLE;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const t = i / 233;
    ctx.beginPath();
    ctx.arc(x, y, 0.45 + t * 0.95, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(DARK_GREEN, 0.12 + t * 0.48);
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
function MandalaArt({ size, stepsCount }: { size: number; stepsCount: number }) {
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
    renderMandalaToCtx(offCtx, cx, cy, R, stepsCount);

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
  }, [size, stepsCount]);

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
  const [copied, setCopied] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<"share" | "github" | null>(null);

  useEffect(() => {
    const update = () =>
      setCardW(Math.min(375, Math.max(280, window.innerWidth - 32)));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const mandalaSize = cardW - 40; // 20px padding each side
  
  // Color bindings matching the required nature scheme
  const CARD_BG = BEIGE;
  const TEXT_PRIMARY = DARK_GREEN;
  const TEXT_SECONDARY = MIDNIGHT_GREEN;
  const BORDER_COLOR = "rgba(10, 51, 35, 0.12)";
  const TEXT_DIM = "rgba(16, 86, 102, 0.65)";
  const DOT_GRID_COLOR = "#dfddd0";

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

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/commit?seed=${seed}&steps=${footfalls}&cadence=${cadence}&smoothness=${smoothness}&entropy=${entropy}&solarPeriod=${solarPeriod}&duration=${duration}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    const geom = new GeometryEngine();
    geom.setSeed(seed);
    geom.rebuildFromHistory(footfalls, history.cadence, history.acceleration, history.smoothness, history.entropy);
    const geomState = geom.getGeometryState(footfalls, rotation);
    const pointsCount = Math.min(987, footfalls * 8 + 34);

    const svgString = ExportEngine.generateSVG(geomState, palette, {
      title: formatWalkTitle(solarPeriod),
      date: date,
      footfalls: footfalls,
      duration: formattedDuration,
      distance: formattedDistance,
      arms: geom.getSymmetryArms(footfalls),
      points: pointsCount,
      commitNumber: commitNumber,
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = 750;
      canvas.height = 1200;
      if (ctx) {
        ctx.drawImage(img, 0, 0, 750, 1200);
      }
      ExportEngine.downloadPNGFile(canvas, `mandala_commit_${commitNumber}`);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleDownloadSVG = () => {
    const geom = new GeometryEngine();
    geom.setSeed(seed);
    geom.rebuildFromHistory(footfalls, history.cadence, history.acceleration, history.smoothness, history.entropy);
    const geomState = geom.getGeometryState(footfalls, rotation);
    const pointsCount = Math.min(987, footfalls * 8 + 34);

    ExportEngine.downloadSVGFile(
      geomState,
      palette,
      `mandala_commit_${commitNumber}`,
      {
        title: formatWalkTitle(solarPeriod),
        date: date,
        footfalls: footfalls,
        duration: formattedDuration,
        distance: formattedDistance,
        arms: geom.getSymmetryArms(footfalls),
        points: pointsCount,
        commitNumber: commitNumber,
      }
    );
  };

  const handleDownloadJSON = () => {
    const walkDNAData = {
      commitNumber,
      seed,
      date,
      footfalls,
      cadenceBpm: cadence,
      smoothness,
      entropy,
      sky: {
        solarPeriod,
        moonPhase,
        palette
      },
      duration,
      history,
      version: "v1.0"
    };
    ExportEngine.downloadJSONFile(walkDNAData, `mandala_dna_${commitNumber}`);
  };

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
      className="relative"
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
              fontFamily: "var(--font-lastik), Lastik, Lastic, serif",
              color: TEXT_PRIMARY,
              fontSize: 15,
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            glyph
          </span>
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
        <MandalaArt size={mandalaSize} stepsCount={footfalls} />
      </div>

      {/* ─ Walk title ────────────────────────────────────────────────────── */}
      <div style={{ padding: "6px 24px 0" }}>
        <h2
          style={{
            fontFamily: "var(--font-lastik), Lastik, Lastic, serif",
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
            fontFamily: "var(--font-lastik), Lastik, Lastic, serif",
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
                fontFamily: "var(--font-lastik), Lastik, Lastic, serif",
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
                fontFamily: "var(--font-lastik), Lastik, Lastic, serif",
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
            fontFamily: "var(--font-lastik), Lastik, Lastic, serif",
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
            fontFamily: "var(--font-lastik), Lastik, Lastic, serif",
            color: TEXT_SECONDARY,
            fontSize: 10.5,
          }}
        >
          {`${new GeometryEngine().getSymmetryArms(footfalls)} Fibonacci arms`}
        </span>
        <div
          style={{ width: 1, height: 14, background: BORDER_COLOR }}
        />
        <span
          style={{
            fontFamily: "var(--font-lastik), Lastik, Lastic, serif",
            color: ROSY_BROWN,
            fontSize: 10.5,
          }}
        >
          {`${Math.min(987, footfalls * 8 + 34)} points`}
        </span>
      </div>

      {/* ─ Footer ────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "14px 24px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${BORDER_COLOR}`,
          marginTop: 15,
          position: "relative"
        }}
        onMouseLeave={() => setHoveredAction(null)}
      >
        <span
          style={{
            fontFamily: "var(--font-lastik), Lastik, Lastic, serif",
            color: DARK_GREEN,
            fontSize: 10.5,
            letterSpacing: "0.04em",
          }}
        >
          Commit to touching grass.
        </span>

        {/* ── Action Popover overlays ── */}
        {hoveredAction === "share" && (
          <div
            style={{
              position: "absolute",
              bottom: "48px",
              right: "24px",
              width: "280px",
              background: "#F5F5F3",
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: "18px",
              padding: "12px 14px",
              boxShadow: "0 10px 30px rgba(10, 51, 35, 0.08)",
              zIndex: 100,
              textAlign: "left"
            }}
            onMouseEnter={() => setHoveredAction("share")}
          >
            <h4
              style={{
                fontFamily: "var(--font-lastik), Lastik, Lastic, serif",
                color: TEXT_PRIMARY,
                fontSize: "13px",
                fontWeight: 600,
                margin: "0 0 8px 0"
              }}
            >
              Share & Export
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <button
                onClick={handleCopyLink}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  padding: "5px 8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "left"
                }}
                className="hover:bg-neutral-800/5 transition-colors"
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "5px", background: hexToRgba(DARK_GREEN, 0.08), color: DARK_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 10, height: 10 }}>
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </span>
                  <span style={{ fontFamily: "var(--font-lastik), Lastik, Lastic, serif", fontSize: "11px", color: TEXT_PRIMARY }}>Copy Shareable Link</span>
                </span>
                <span style={{ fontFamily: "var(--font-lastik), Lastik, Lastic, serif", fontSize: "10px", color: MOSS_GREEN }}>{copied ? "Copied!" : "Copy"}</span>
              </button>

              <button
                onClick={handleDownloadPNG}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  padding: "5px 8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "left"
                }}
                className="hover:bg-neutral-800/5 transition-colors"
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "5px", background: hexToRgba(MIDNIGHT_GREEN, 0.08), color: MIDNIGHT_GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 10, height: 10 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </span>
                  <span style={{ fontFamily: "var(--font-lastik), Lastik, Lastic, serif", fontSize: "11px", color: TEXT_PRIMARY }}>Download Specimen (PNG)</span>
                </span>
                <span style={{ fontFamily: "var(--font-lastik), Lastik, Lastic, serif", fontSize: "10px", color: MIDNIGHT_GREEN }}>PNG</span>
              </button>

              <button
                onClick={handleDownloadSVG}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  padding: "5px 8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "left"
                }}
                className="hover:bg-neutral-800/5 transition-colors"
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "5px", background: hexToRgba(ROSY_BROWN, 0.12), color: ROSY_BROWN, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 10, height: 10 }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </span>
                  <span style={{ fontFamily: "var(--font-lastik), Lastik, Lastic, serif", fontSize: "11px", color: TEXT_PRIMARY }}>Download Vector (SVG)</span>
                </span>
                <span style={{ fontFamily: "var(--font-lastik), Lastik, Lastic, serif", fontSize: "10px", color: ROSY_BROWN }}>SVG</span>
              </button>

              <button
                onClick={handleDownloadJSON}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  padding: "5px 8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "left"
                }}
                className="hover:bg-neutral-800/5 transition-colors"
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "5px", background: hexToRgba(SOFT_PINK, 0.12), color: SOFT_PINK, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 10, height: 10 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </span>
                  <span style={{ fontFamily: "var(--font-lastik), Lastik, Lastic, serif", fontSize: "11px", color: TEXT_PRIMARY }}>Download DNA (JSON)</span>
                </span>
                <span style={{ fontFamily: "var(--font-lastik), Lastik, Lastic, serif", fontSize: "10px", color: SOFT_PINK }}>JSON</span>
              </button>
            </div>
          </div>
        )}

        {hoveredAction === "github" && (
          <div
            style={{
              position: "absolute",
              bottom: "48px",
              right: "24px",
              width: "220px",
              background: "#F5F5F3",
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: "14px",
              padding: "10px 12px",
              boxShadow: "0 10px 30px rgba(10, 51, 35, 0.08)",
              zIndex: 100,
              textAlign: "left"
            }}
            onMouseEnter={() => setHoveredAction("github")}
          >
            <p
              style={{
                fontFamily: "var(--font-lastik), Lastik, Lastic, serif",
                color: TEXT_PRIMARY,
                fontSize: "11px",
                lineHeight: "1.4",
                margin: 0
              }}
            >
              GitHub Mandala Commit is only available when you scan the QR code and commit from your mobile device.
            </p>
          </div>
        )}
        
        {/* Actions inside the bottom right corner of the card */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Share button (Lucide Share2 classic network node icon) */}
          <button
            onMouseEnter={() => setHoveredAction("share")}
            onClick={handleCopyLink}
            title="Share Specimen"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: TEXT_SECONDARY,
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>

          {/* GitHub button */}
          <button
            onMouseEnter={() => setHoveredAction("github")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: TEXT_SECONDARY,
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
