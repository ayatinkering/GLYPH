"use client";

import { useEffect, useRef, useState } from "react";
import { GeometryEngine } from "@/engine/geometry/GeometryEngine";
import { ExportEngine } from "@/engine/export/ExportEngine";

const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = 2 * Math.PI * (2 - PHI);

// Palette values matching the user's exact requirements:
const DARK_GREEN = "#0A3323";
const MOSS_GREEN = "#839958";
const BEIGE = "#F7F4D5";
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

export function FeetSimulator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // State for metadata display
  const [steps, setSteps] = useState(0);
  const [cadence, setCadence] = useState(0);
  const [symmetry, setSymmetry] = useState(3);
  const [period, setPeriod] = useState<string>("Day");
  const [audioStarted, setAudioStarted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<"share" | "github" | null>(null);

  // Core engines
  const geometryEngineRef = useRef<GeometryEngine | null>(null);
  
  // Click/Step tracking
  const clickTimestampsRef = useRef<number[]>([]);
  const synthRef = useRef<any>(null);

  // Width layout tracking
  const [cardW, setCardW] = useState(375);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateWidth = () => {
      setCardW(Math.min(375, Math.max(280, window.innerWidth - 32)));
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);

    // 1. Initialize Engines
    const geom = new GeometryEngine();
    geom.setSeed("GLYPH_SANDBOX_" + Date.now());
    geometryEngineRef.current = geom;

    setSymmetry(geom.getSymmetryArms(0));

    // 2. Initialize dynamic p5.js instance
    const p5Lib = require("p5");
    const P5 = p5Lib.default || p5Lib;
    let p5Instance: any = null;

    const sketch = (p: any) => {
      let rotationAngle = 0;

      p.setup = () => {
        const width = canvasRef.current?.clientWidth ?? 335;
        p.createCanvas(width, width);
        p.angleMode(p.RADIANS);
        p.frameRate(60);
      };

      p.draw = () => {
        // Clear background for transparent overlay within the beige card
        p.clear();

        const cx = p.width / 2;
        const cy = p.height / 2;
        const R = p.width * 0.43;

        if (geom["points"].length === 0) {
          // Pulse green start seed dot
          p.fill(DARK_GREEN);
          p.noStroke();
          const pulse = 6 + Math.sin(p.frameCount * 0.08) * 1.5;
          p.circle(cx, cy, pulse);
          
          p.fill(hexToRgba(MIDNIGHT_GREEN, 0.48));
          p.textAlign(p.CENTER, p.CENTER);
          p.textFont("serif");
          p.textSize(9.5);
          p.text("CLICK CANVAS TO START WALK", cx, cy + 24);
          return;
        }

        // Apply a slow rotation angle to show life
        rotationAngle += 0.002;

        const ctx = p.drawingContext;
        ctx.shadowBlur = 8;
        ctx.shadowColor = hexToRgba(DARK_GREEN, 0.2);

        p.push();
        p.translate(cx, cy);
        p.rotate(rotationAngle);

        // ── 1. Radial guide lines (24 guidelines) ────────────────────────────
        p.noFill();
        p.stroke(hexToRgba(MOSS_GREEN, 0.12));
        p.strokeWeight(0.6);
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2;
          p.line(0, 0, R * 1.16 * Math.cos(a), R * 1.16 * Math.sin(a));
        }

        // ── 2. Outer boundary circle ───────────────────────────────────────
        p.stroke(hexToRgba(MOSS_GREEN, 0.28));
        p.strokeWeight(0.95);
        p.circle(0, 0, R * 2.18);

        // ── 3. Instrument tick marks (72 ticks) ─────────────────────────────
        for (let i = 0; i < 72; i++) {
          const a = (i / 72) * Math.PI * 2;
          const major = i % 6 === 0;
          const semi = i % 3 === 0;
          const r1 = R * (major ? 1.0 : semi ? 1.035 : 1.065);
          
          p.stroke(hexToRgba(DARK_GREEN, major ? 0.7 : semi ? 0.4 : 0.18));
          p.strokeWeight(major ? 1.25 : semi ? 0.8 : 0.5);
          p.line(r1 * Math.cos(a), r1 * Math.sin(a), R * 1.1 * Math.cos(a), R * 1.1 * Math.sin(a));
        }

        // ── 4. Golden-ratio concentric circles (8 circles) ──────────────────
        const stepsCount = geom["points"].length;
        const concentricReveal = p.constrain(stepsCount / 10, 2, 8);
        for (let i = 0; i <= concentricReveal; i++) {
          const r = R * Math.pow(1 / PHI, i);
          p.stroke(hexToRgba(MIDNIGHT_GREEN, 0.08 + (8 - i) * 0.038));
          p.strokeWeight(0.8);
          p.circle(0, 0, r * 2);
        }

        // ── Helper: polar rose r = cos(k·θ) ──────────────────────────────────
        const drawRose = (
          maxR: number,
          k: number,
          rotations: number,
          stepsVal: number,
          color: string,
          lw: number
        ) => {
          const total = Math.PI * 2 * rotations;
          p.noFill();
          p.stroke(color);
          p.strokeWeight(lw);
          p.beginShape();
          for (let i = 0; i <= stepsVal; i++) {
            const t = (i / stepsVal) * total;
            const r = maxR * Math.cos(k * t);
            const x = r * Math.cos(t);
            const y = r * Math.sin(t);
            p.vertex(x, y);
          }
          p.endShape();
        };

        // ── 5. Polar rose layers (Revealed as step count increases) ──────────
        const scaleFactor = p.constrain(stepsCount / 80, 0.25, 1.0);
        
        if (stepsCount >= 2) {
          drawRose(R * 0.17 * scaleFactor, 2, 1, 300, hexToRgba(DARK_GREEN, 0.92), 1.5);
        }
        if (stepsCount >= 8) {
          drawRose(R * 0.30 * scaleFactor, 3, 1, 500, hexToRgba(ROSY_BROWN, 0.85), 1.35);
        }
        if (stepsCount >= 16) {
          drawRose(R * 0.465 * scaleFactor, 5, 1, 600, hexToRgba(MOSS_GREEN, 0.76), 1.25);
        }
        if (stepsCount >= 24) {
          drawRose(R * 0.62 * scaleFactor, 3/2, 2, 1000, hexToRgba(MIDNIGHT_GREEN, 0.64), 1.15);
        }
        if (stepsCount >= 40) {
          drawRose(R * 0.755 * scaleFactor, 5/3, 3, 1200, hexToRgba(ROSY_BROWN, 0.52), 1.0);
        }
        if (stepsCount >= 60) {
          drawRose(R * 0.875 * scaleFactor, 7/4, 4, 1500, hexToRgba(MOSS_GREEN, 0.40), 0.9);
        }
        if (stepsCount >= 80) {
          drawRose(R * scaleFactor, 13/6, 6, 2000, hexToRgba(MIDNIGHT_GREEN, 0.32), 0.9);
        }

        // ── 6. Spirographs (Epitrochoid & Hypocycloid) ──────────────────────
        const drawEpitrochoid = (
          Rr: number,
          rr: number,
          d: number,
          stepsVal: number,
          color: string,
          lw: number
        ) => {
          const revs = Math.round(Rr / rr);
          const total = Math.PI * 2 * revs;
          p.noFill();
          p.stroke(color);
          p.strokeWeight(lw);
          p.beginShape();
          for (let i = 0; i <= stepsVal; i++) {
            const t = (i / stepsVal) * total;
            const x = (Rr + rr) * Math.cos(t) - d * Math.cos(((Rr + rr) / rr) * t);
            const y = (Rr + rr) * Math.sin(t) - d * Math.sin(((Rr + rr) / rr) * t);
            p.vertex(x, y);
          }
          p.endShape();
        };

        if (stepsCount >= 35) {
          drawEpitrochoid(
            R * 0.68, R * 0.68 / 6, R * 0.68 / 6 * 1.12,
            1200, hexToRgba(ROSY_BROWN, 0.30), 0.85
          );
        }

        // ── 7. Fibonacci phyllotaxis constellation (Grows step-by-step) ─────
        const dotsCount = p.constrain(stepsCount * 2, 0, 233);
        const dotR = R * 0.35;
        p.noStroke();
        for (let i = 0; i < dotsCount; i++) {
          const r = dotR * Math.sqrt(i / 233);
          const theta = i * GOLDEN_ANGLE;
          const x = r * Math.cos(theta);
          const y = r * Math.sin(theta);
          const t = i / 233;
          
          p.fill(hexToRgba(DARK_GREEN, 0.12 + t * 0.48));
          p.circle(x, y, 0.45 + t * 0.95);
        }

        // ── 8. Centre ornamental rings ─────────────────────────────────────
        p.noFill();
        p.stroke(hexToRgba(DARK_GREEN, 0.35));
        p.strokeWeight(0.8);
        p.circle(0, 0, 24);
        p.circle(0, 0, 16);
        
        p.fill(hexToRgba(ROSY_BROWN, 0.94));
        p.noStroke();
        p.circle(0, 0, 5);

        p.pop();
        ctx.shadowBlur = 0;
      };

      p.windowResized = () => {
        const width = canvasRef.current?.clientWidth ?? 335;
        p.resizeCanvas(width, width);
      };
    };

    p5Instance = new P5(sketch, canvasRef.current);

    return () => {
      window.removeEventListener("resize", updateWidth);
      if (p5Instance) p5Instance.remove();
    };
  }, []);

  // Handle virtual walk triggers on click
  const handleCanvasClick = async () => {
    if (typeof window === "undefined") return;

    if (!audioStarted) {
      const Tone = require("tone");
      await Tone.start();
      
      const fmSynth = new Tone.FMSynth({
        harmonicity: 3,
        modulationIndex: 10,
        detune: 0,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
        modulation: { type: "square" },
        modulationEnvelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.1 },
      });

      const delay = new Tone.FeedbackDelay("8n", 0.4).toDestination();
      fmSynth.connect(delay);
      
      synthRef.current = fmSynth;
      setAudioStarted(true);
    }

    const geom = geometryEngineRef.current;
    if (!geom) return;

    const now = Date.now();
    const newStepIndex = geom["points"].length + 1;

    clickTimestampsRef.current.push(now);
    if (clickTimestampsRef.current.length > 5) {
      clickTimestampsRef.current.shift();
    }
    
    let calculatedBpm = 100;
    if (clickTimestampsRef.current.length > 1) {
      const sum = [];
      for (let i = 1; i < clickTimestampsRef.current.length; i++) {
        sum.push(clickTimestampsRef.current[i] - clickTimestampsRef.current[i - 1]);
      }
      const avgInterval = sum.reduce((a, b) => a + b, 0) / sum.length;
      calculatedBpm = Math.round(60000 / avgInterval);
    }

    if (synthRef.current) {
      const pentatonic = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5"];
      const note = pentatonic[(newStepIndex - 1) % pentatonic.length];
      synthRef.current.triggerAttackRelease(note, "16n");
    }

    geom.addFootfallPoint(newStepIndex, calculatedBpm, 1.2, 0.9, 0.1);

    setSteps(newStepIndex);
    setCadence(calculatedBpm);
    setSymmetry(geom.getSymmetryArms(newStepIndex));
  };

  const handleReset = () => {
    if (geometryEngineRef.current) {
      geometryEngineRef.current.reset();
      setSteps(0);
      setCadence(0);
      setSymmetry(3);
    }
    clickTimestampsRef.current = [];
  };

  const formatWalkTitle = (solarPeriod: string) => {
    switch (solarPeriod.toLowerCase()) {
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

  // Convert simulated steps to estimated duration
  const estimatedDuration = steps > 0 ? `${Math.max(1, Math.round(steps / 90))} min` : "0 min";

  // Calculate estimated distance (0.75m per step)
  const estimatedDistance = `${(steps * 0.00075).toFixed(1)} km`;

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/commit?seed=GLYPH_SANDBOX_${Date.now()}&steps=${steps}&cadence=${cadence}&smoothness=1.0&entropy=0.0&solarPeriod=${period.toLowerCase()}&duration=${steps * 0.6}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    const geom = geometryEngineRef.current;
    if (!geom) return;
    
    const stepsCount = geom["points"].length;
    const geomState = geom.getGeometryState(stepsCount, 0);
    const svgString = ExportEngine.generateSVG(geomState, {
      name: "Diurnal Specimen",
      accent: DARK_GREEN,
      secondary: MOSS_GREEN,
      background: BEIGE,
      ambientGlow: "rgba(10,51,35,0.06)"
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.drawImage(img, 0, 0, 600, 600);
      }
      ExportEngine.downloadPNGFile(canvas, `simulated_mandala_${steps}`);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleDownloadSVG = () => {
    const geom = geometryEngineRef.current;
    if (!geom) return;
    const stepsCount = geom["points"].length;
    const geomState = geom.getGeometryState(stepsCount, 0);
    ExportEngine.downloadSVGFile(geomState, {
      name: "Diurnal Specimen",
      accent: DARK_GREEN,
      secondary: MOSS_GREEN,
      background: BEIGE,
      ambientGlow: "rgba(10,51,35,0.06)"
    }, `simulated_mandala_${steps}`);
  };

  const handleDownloadJSON = () => {
    const walkDNAData = {
      commitNumber: 47,
      seed: "GLYPH_SANDBOX",
      date: new Date().toLocaleDateString(),
      footfalls: steps,
      cadenceBpm: cadence,
      smoothness: 1.0,
      entropy: 0.0,
      sky: {
        solarPeriod: period,
        moonPhase: 0.5,
        palette: {
          name: "Diurnal Specimen",
          accent: DARK_GREEN,
          secondary: MOSS_GREEN,
          background: BEIGE,
          ambientGlow: "rgba(10,51,35,0.06)"
        }
      },
      duration: steps * 0.6,
      version: "v1.0"
    };
    ExportEngine.downloadJSONFile(walkDNAData, `simulated_dna_${steps}`);
  };

  // Color mappings matching the nature palette
  const CARD_BG = BEIGE;
  const TEXT_PRIMARY = DARK_GREEN;
  const TEXT_SECONDARY = MIDNIGHT_GREEN;
  const BORDER_COLOR = "rgba(10, 51, 35, 0.12)";
  const TEXT_DIM = "rgba(16, 86, 102, 0.65)";
  const DOT_GRID_COLOR = "rgba(10, 51, 35, 0.04)";

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
      className="mx-auto select-none relative"
    >
      {/* Reset simulator button overlay */}
      {steps > 0 && (
        <button
          onClick={handleReset}
          style={{
            position: "absolute",
            top: 22,
            right: 80,
            fontFamily: "var(--font-lastik), Lastik, Lastic, serif",
            fontSize: 9,
            color: TEXT_SECONDARY,
            background: "rgba(10, 51, 35, 0.05)",
            border: `1px solid ${BORDER_COLOR}`,
            padding: "2px 8px",
            borderRadius: 20,
            cursor: "pointer",
            zIndex: 30,
          }}
          className="hover:text-neutral-900 transition-colors"
        >
          RESET
        </button>
      )}

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

      {/* ─ Mandala artwork / click target ───────────────────────────────── */}
      <div
        style={{
          padding: "14px 20px 6px",
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {!audioStarted && (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-neutral-950/80 text-white font-mono text-[9px] pointer-events-none animate-pulse z-20">
            🔊 CLICK TO ENABLE SOUND
          </div>
        )}
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full cursor-pointer overflow-hidden rounded-[20px]"
          style={{ maxWidth: "335px" }}
        />
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
          {formatWalkTitle(period)}
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
          SIMULATOR ACTIVE · CLICK GRID ABOVE
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
          { value: steps.toLocaleString(), label: "footfalls" },
          { value: estimatedDuration, label: "duration" },
          { value: estimatedDistance, label: "distance" },
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
          {`${symmetry} arms`}
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
          {`${Math.min(987, steps * 8 + 34)} points`}
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
              background: "#F7F4D5",
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
              background: "#F7F4D5",
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
