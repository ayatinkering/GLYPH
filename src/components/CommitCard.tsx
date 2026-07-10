"use client";

import { useEffect, useRef, useState } from "react";
import { ColorPalette } from "@/engine/sky/SkyEngine";

// ── Math constants ─────────────────────────────────────────────────────────────
const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = 2 * Math.PI * (2 - PHI);

// ── Draw all mandala layers to an offscreen canvas (centered at cx, cy) ──────
function renderMandalaToCtx(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number
) {
  ctx.save();
  ctx.translate(cx, cy);

  // ── 1. Radial guide lines (24, every 15°) ──────────────────────────────────
  ctx.lineWidth = 0.35;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(R * 1.16 * Math.cos(a), R * 1.16 * Math.sin(a));
    ctx.strokeStyle = "rgba(240,228,200,0.04)";
    ctx.stroke();
  }

  // ── 2. Outer boundary circle ───────────────────────────────────────────────
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.09, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(240,228,200,0.11)";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // ── 3. Instrument tick marks (72 ticks = every 5°) ────────────────────────
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const major = i % 6 === 0; // every 30°
    const semi = i % 3 === 0; // every 15°
    const r1 = R * (major ? 1.0 : semi ? 1.035 : 1.065);
    ctx.beginPath();
    ctx.moveTo(r1 * Math.cos(a), r1 * Math.sin(a));
    ctx.lineTo(R * 1.1 * Math.cos(a), R * 1.1 * Math.sin(a));
    ctx.strokeStyle = `rgba(240,228,200,${major ? 0.42 : semi ? 0.2 : 0.08})`;
    ctx.lineWidth = major ? 0.7 : semi ? 0.4 : 0.25;
    ctx.stroke();
  }

  // ── 4. Golden-ratio concentric circles (φ⁻ⁿ · R) ─────────────────────────
  for (let i = 0; i <= 8; i++) {
    const r = R * Math.pow(1 / PHI, i);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(212,168,69,${0.042 + (8 - i) * 0.021})`;
    ctx.lineWidth = 0.38;
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

  // ── 5. Polar rose layers — outermost → innermost ───────────────────────────
  drawRose(R,          13/6,  6, 12000, "rgba(240,222,190,0.21)", 0.48);
  drawRose(R *  0.875,  7/4,  4,  8000, "rgba(168,212,240,0.29)", 0.48);
  drawRose(R *  0.755,  5/3,  3,  6000, "rgba(140,210,194,0.38)", 0.48);
  drawRose(R *  0.62,   3/2,  2,  4000, "rgba(244,204,164,0.48)", 0.52);
  drawRose(R *  0.465,  5,    1,  2000, "rgba(190,238,222,0.60)", 0.56);
  drawRose(R *  0.30,   3,    1,  1500, "rgba(244,214,164,0.73)", 0.62);
  drawRose(R *  0.17,   2,    1,   800, "rgba(240,226,192,0.84)", 0.68);

  // ── 6. Epitrochoid spirographs ─────────────────────────────────────────────
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
    5000, "rgba(88,198,186,0.19)", 0.42
  );
  drawHypocycloid(
    R * 0.52, R * 0.52 / 7, R * 0.52 / 7 * 0.85,
    5600, "rgba(178,146,242,0.14)", 0.38
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
    ctx.arc(x, y, 0.36 + t * 0.66, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240,228,200,${0.09 + t * 0.38})`;
    ctx.fill();
  }

  // ── 8. Centre ornamental rings ─────────────────────────────────────────────
  for (const [r, a] of [
    [12, 0.16],
    [8,  0.26],
    [5,  0.40],
    [2.8, 0.0],
  ] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    if (r > 3) {
      ctx.strokeStyle = `rgba(240,228,200,${a})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(212,168,69,0.94)";
      ctx.fill();
    }
  }

  ctx.restore();
}

// ── Mandala Art Component ────────────────────────────────────────────────────
function MandalaArt({ size }: { size: number }) {
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
  duration?: number; // Optional duration passed from WalkStore
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
  const DARK = "#0E1520";
  const CREAM = "#F0E8D5";
  const CREAM_DIM = "rgba(240,232,213,0.38)";
  const CREAM_FAINT = "rgba(240,232,213,0.09)";
  const GOLD = "rgba(212,168,69,0.88)";
  const GREEN = "#5FAD41";
  const TEAL = "rgba(140,210,194,0.82)";

  // Format Walk Title from Solar period (e.g. goldenHour -> Golden Hour Walk)
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

  // Convert duration seconds to minutes description
  const formattedDuration = `${Math.max(1, Math.round(duration / 60))} min`;
  
  // Calculate distance assuming 0.75m stride length
  const formattedDistance = `${(footfalls * 0.00075).toFixed(1)} km`;

  return (
    <div
      style={{
        width: cardW,
        background: DARK,
        borderRadius: 26,
        overflow: "hidden",
        boxShadow:
          "0 48px 100px rgba(0,0,0,0.55), 0 12px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
        backgroundImage: `
          radial-gradient(${CREAM_FAINT} 1px, transparent 1px)
        `,
        backgroundSize: "22px 22px",
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
              background: GREEN,
              display: "block",
              flexShrink: 0,
              boxShadow: `0 0 8px ${GREEN}`,
            }}
          />
          <span
            style={{
              fontFamily: "Lastik, Lastic, system-ui, sans-serif",
              color: CREAM,
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
            fontFamily: "Geist Mono, monospace",
            color: "rgba(240,232,213,0.28)",
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
        <MandalaArt size={mandalaSize} />
      </div>

      {/* ─ Walk title ────────────────────────────────────────────────────── */}
      <div style={{ padding: "6px 24px 0" }}>
        <h2
          style={{
            fontFamily: "Lastik, Lastic, system-ui, sans-serif",
            color: CREAM,
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
            fontFamily: "Geist, system-ui, sans-serif",
            color: CREAM_DIM,
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
          background: "rgba(240,228,200,0.07)",
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
                fontFamily: "Lastik, Lastic, system-ui, sans-serif",
                color: CREAM,
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
                fontFamily: "Geist, system-ui, sans-serif",
                color: "rgba(240,232,213,0.32)",
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
          background: "rgba(240,228,200,0.038)",
          borderRadius: 10,
          border: "1px solid rgba(240,228,200,0.065)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Geist Mono, monospace",
            color: GOLD,
            fontSize: 10.5,
            letterSpacing: "0.04em",
          }}
        >
          φ = 1.618
        </span>
        <div
          style={{ width: 1, height: 14, background: "rgba(240,228,200,0.07)" }}
        />
        <span
          style={{
            fontFamily: "Geist Mono, monospace",
            color: CREAM_DIM,
            fontSize: 10.5,
          }}
        >
          13 Fibonacci arms
        </span>
        <div
          style={{ width: 1, height: 14, background: "rgba(240,228,200,0.07)" }}
        />
        <span
          style={{
            fontFamily: "Geist Mono, monospace",
            color: TEAL,
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
            background: "rgba(240,228,200,0.06)",
          }}
        />
        <span
          style={{
            fontFamily: "Geist Mono, monospace",
            color: "rgba(240,228,200,0.2)",
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
            background: "rgba(240,228,200,0.06)",
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
            fontFamily: "Geist, system-ui, sans-serif",
            color: GREEN,
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
              background: "rgba(95,173,65,0.4)",
              display: "block",
            }}
          />
          <span
            style={{
              fontFamily: "Lastik, Lastic, system-ui, sans-serif",
              color: "rgba(240,232,213,0.22)",
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
