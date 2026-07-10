"use client";

import { useEffect, useRef, useState } from "react";
import { GeometryEngine, GeometryState } from "@/engine/geometry/GeometryEngine";
import { SkyEngine, SkyState } from "@/engine/sky/SkyEngine";

const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = 2 * Math.PI * (2 - PHI);

export function FeetSimulator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // State for metadata display
  const [steps, setSteps] = useState(0);
  const [cadence, setCadence] = useState(0);
  const [symmetry, setSymmetry] = useState(3);
  const [period, setPeriod] = useState<string>("Day");
  const [audioStarted, setAudioStarted] = useState(false);

  // Core engines
  const geometryEngineRef = useRef<GeometryEngine | null>(null);
  const skyEngineRef = useRef<SkyEngine | null>(null);
  
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

    const sky = new SkyEngine();
    const skyState = sky.getSkyState(new Date());
    skyEngineRef.current = sky;
    setPeriod(skyState.solarPeriod);
    setSymmetry(geom.getSymmetryArms(0));

    // 2. Initialize dynamic p5.js instance
    const p5Lib = require("p5");
    const P5 = p5Lib.default || p5Lib;
    let p5Instance: any = null;

    const sketch = (p: any) => {
      let palette = skyState.palette;
      let rotationAngle = 0;

      p.setup = () => {
        const width = canvasRef.current?.clientWidth ?? 335;
        p.createCanvas(width, width); // Keep it square matching the artwork viewport
        p.angleMode(p.RADIANS);
        p.frameRate(60);
      };

      p.draw = () => {
        // Clear background for offscreen rendering inside the card
        p.clear();

        const cx = p.width / 2;
        const cy = p.height / 2;
        const R = p.width * 0.43;

        if (geom["points"].length === 0) {
          // Draw a pulsing green starting seed dot
          p.fill("#5FAD41");
          p.noStroke();
          const pulse = 6 + Math.sin(p.frameCount * 0.08) * 1.5;
          p.circle(cx, cy, pulse);
          
          p.fill("rgba(240,232,213,0.32)");
          p.textAlign(p.CENTER, p.CENTER);
          p.textFont("monospace");
          p.textSize(8.5);
          p.text("CLICK CANVAS TO START WALK", cx, cy + 24);
          return;
        }

        // Apply a slow rotation angle to show life
        rotationAngle += 0.002;

        const ctx = p.drawingContext;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(212,168,69,0.4)";

        p.push();
        p.translate(cx, cy);
        p.rotate(rotationAngle);

        // ── 1. Radial guide lines (24 guidelines) ────────────────────────────
        p.noFill();
        p.stroke("rgba(240,228,200,0.06)");
        p.strokeWeight(0.6);
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2;
          p.line(0, 0, R * 1.16 * Math.cos(a), R * 1.16 * Math.sin(a));
        }

        // ── 2. Outer boundary circle ───────────────────────────────────────
        p.stroke("rgba(240,228,200,0.18)");
        p.strokeWeight(0.95);
        p.circle(0, 0, R * 2.18);

        // ── 3. Instrument tick marks (72 ticks) ─────────────────────────────
        for (let i = 0; i < 72; i++) {
          const a = (i / 72) * Math.PI * 2;
          const major = i % 6 === 0;
          const semi = i % 3 === 0;
          const r1 = R * (major ? 1.0 : semi ? 1.035 : 1.065);
          
          p.stroke(`rgba(240,228,200,${major ? 0.55 : semi ? 0.3 : 0.12})`);
          p.strokeWeight(major ? 1.25 : semi ? 0.8 : 0.5);
          p.line(r1 * Math.cos(a), r1 * Math.sin(a), R * 1.1 * Math.cos(a), R * 1.1 * Math.sin(a));
        }

        // ── 4. Golden-ratio concentric circles (8 circles) ──────────────────
        const stepsCount = geom["points"].length;
        const concentricReveal = p.constrain(stepsCount / 10, 2, 8);
        for (let i = 0; i <= concentricReveal; i++) {
          const r = R * Math.pow(1 / PHI, i);
          p.stroke(`rgba(212,168,69,${0.06 + (8 - i) * 0.035})`);
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
          drawRose(R * 0.17 * scaleFactor, 2, 1, 300, "rgba(240,226,192,0.92)", 1.5);
        }
        if (stepsCount >= 8) {
          drawRose(R * 0.30 * scaleFactor, 3, 1, 500, "rgba(244,214,164,0.85)", 1.35);
        }
        if (stepsCount >= 16) {
          drawRose(R * 0.465 * scaleFactor, 5, 1, 600, "rgba(190,238,222,0.76)", 1.25);
        }
        if (stepsCount >= 24) {
          drawRose(R * 0.62 * scaleFactor, 3/2, 2, 1000, "rgba(244,204,164,0.64)", 1.15);
        }
        if (stepsCount >= 40) {
          drawRose(R * 0.755 * scaleFactor, 5/3, 3, 1200, "rgba(140,210,194,0.52)", 1.0);
        }
        if (stepsCount >= 60) {
          drawRose(R * 0.875 * scaleFactor, 7/4, 4, 1500, "rgba(168,212,240,0.40)", 0.9);
        }
        if (stepsCount >= 80) {
          drawRose(R * scaleFactor, 13/6, 6, 2000, "rgba(240,222,190,0.32)", 0.9);
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
            1200, "rgba(88,198,186,0.30)", 0.85
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
          
          p.fill(`rgba(240,228,200,${0.12 + t * 0.48})`);
          p.circle(x, y, 0.45 + t * 0.95);
        }

        // ── 8. Centre ornamental rings ─────────────────────────────────────
        p.noFill();
        p.stroke("rgba(240,228,200,0.35)");
        p.strokeWeight(0.8);
        p.circle(0, 0, 24);
        p.circle(0, 0, 16);
        
        p.fill("rgba(212,168,69,0.94)");
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

    // 1. Initialize Tone.js synthesizer upon first click (Autoplay policy friendly)
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

    // Calculate simulated cadence (BPM)
    clickTimestampsRef.current.push(now);
    if (clickTimestampsRef.current.length > 5) {
      clickTimestampsRef.current.shift();
    }
    
    let calculatedBpm = 100; // default baseline
    if (clickTimestampsRef.current.length > 1) {
      const sum = [];
      for (let i = 1; i < clickTimestampsRef.current.length; i++) {
        sum.push(clickTimestampsRef.current[i] - clickTimestampsRef.current[i - 1]);
      }
      const avgInterval = sum.reduce((a, b) => a + b, 0) / sum.length;
      calculatedBpm = Math.round(60000 / avgInterval);
    }

    // Trigger synthetic audio woodblock plucked note (notes mapped dynamically to step indices)
    if (synthRef.current) {
      const pentatonic = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5"];
      const note = pentatonic[(newStepIndex - 1) % pentatonic.length];
      synthRef.current.triggerAttackRelease(note, "16n");
    }

    // Add point to geometry engine (simulate variables)
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

  // Format Walk Title from Solar period (e.g. goldenHour -> Golden Hour Walk)
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

  const DARK = "#0E1520";
  const CREAM = "#F0E8D5";
  const CREAM_DIM = "rgba(240,232,213,0.38)";
  const CREAM_FAINT = "rgba(240,232,213,0.09)";
  const GOLD = "rgba(212,168,69,0.88)";
  const GREEN = "#5FAD41";
  const TEAL = "rgba(140,210,194,0.82)";

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
      className="mx-auto select-none relative"
    >
      {/* Reset simulator button overlay (discreet and aesthetic) */}
      {steps > 0 && (
        <button
          onClick={handleReset}
          style={{
            position: "absolute",
            top: 22,
            right: 120,
            fontFamily: "monospace",
            fontSize: 9,
            color: CREAM_DIM,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "2px 8px",
            borderRadius: 20,
            cursor: "pointer",
            zIndex: 30,
          }}
          className="hover:text-white transition-colors"
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
          MC — 0047
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
            fontFamily: "Lastik, Lastic, system-ui, sans-serif",
            color: CREAM,
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
            fontFamily: "Geist, system-ui, sans-serif",
            color: CREAM_DIM,
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
          { value: steps.toLocaleString(), label: "footfalls" },
          { value: estimatedDuration, label: "duration" },
          { value: estimatedDistance, label: "distance" },
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
          {`${symmetry} arms`}
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
          {`${Math.min(987, steps * 8 + 34)} points`}
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
          sha: GLYPH_SANDBOX
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
