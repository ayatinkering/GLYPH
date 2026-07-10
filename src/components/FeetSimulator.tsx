"use client";

import { useEffect, useRef, useState } from "react";
import { GeometryEngine, GeometryState } from "@/engine/geometry/GeometryEngine";
import { SkyEngine, SkyState } from "@/engine/sky/SkyEngine";
import { Footprints, Activity, Sparkles } from "lucide-react";

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

  useEffect(() => {
    if (typeof window === "undefined") return;

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
        const width = containerRef.current?.clientWidth ?? 600;
        const height = 400;
        p.createCanvas(width, height);
        p.angleMode(p.RADIANS);
        p.frameRate(60);
      };

      p.draw = () => {
        // Redraw backing grid paper color
        p.background(palette.background);

        const cx = p.width / 2;
        const cy = p.height / 2;
        const R = Math.min(p.width, p.height) * 0.40;

        if (steps === 0) {
          // Draw a small starting seed dot
          p.fill(palette.accent);
          p.noStroke();
          p.circle(cx, cy, 6);
          
          p.fill(120);
          p.textAlign(p.CENTER, p.CENTER);
          p.textFont("Courier New");
          p.textSize(10);
          p.text("CLICK INSIDE CANVAS TO SIMULATE STEPS", cx, cy + 24);
          return;
        }

        // Apply a very slow rotation angle to show life
        rotationAngle += 0.002;

        // Apply native canvas shadows to simulate a premium glowing aura
        const ctx = p.drawingContext;
        ctx.shadowBlur = 10;
        ctx.shadowColor = palette.accent;

        p.push();
        p.translate(cx, cy);
        p.rotate(rotationAngle);

        // ── 1. Radial guide lines (24 guidelines) ────────────────────────────
        p.noFill();
        p.stroke(palette.secondary + "1A");
        p.strokeWeight(0.5);
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2;
          p.line(0, 0, R * 1.16 * Math.cos(a), R * 1.16 * Math.sin(a));
        }

        // ── 2. Outer boundary circle ───────────────────────────────────────
        p.stroke(palette.secondary + "22");
        p.strokeWeight(0.6);
        p.circle(0, 0, R * 2.18);

        // ── 3. Instrument tick marks (72 ticks) ─────────────────────────────
        for (let i = 0; i < 72; i++) {
          const a = (i / 72) * Math.PI * 2;
          const major = i % 6 === 0;
          const semi = i % 3 === 0;
          const r1 = R * (major ? 1.0 : semi ? 1.035 : 1.065);
          
          p.stroke(palette.secondary + (major ? "77" : semi ? "33" : "15"));
          p.strokeWeight(major ? 0.95 : semi ? 0.6 : 0.35);
          p.line(r1 * Math.cos(a), r1 * Math.sin(a), R * 1.1 * Math.cos(a), R * 1.1 * Math.sin(a));
        }

        // ── 4. Golden-ratio concentric circles (8 circles) ──────────────────
        const concentricReveal = p.constrain(steps / 10, 2, 8);
        for (let i = 0; i <= concentricReveal; i++) {
          const r = R * Math.pow(1 / PHI, i);
          p.stroke(palette.accent + "33");
          p.strokeWeight(0.42);
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
        const scaleFactor = p.constrain(steps / 80, 0.25, 1.0);
        
        if (steps >= 2) {
          drawRose(R * 0.17 * scaleFactor, 2, 1, 300, palette.accent + "D5", 0.7);
        }
        if (steps >= 8) {
          drawRose(R * 0.30 * scaleFactor, 3, 1, 500, palette.accent + "BB", 0.62);
        }
        if (steps >= 16) {
          drawRose(R * 0.465 * scaleFactor, 5, 1, 600, palette.accent + "99", 0.55);
        }
        if (steps >= 24) {
          drawRose(R * 0.62 * scaleFactor, 3/2, 2, 1000, palette.secondary + "80", 0.5);
        }
        if (steps >= 40) {
          drawRose(R * 0.755 * scaleFactor, 5/3, 3, 1200, palette.secondary + "55", 0.48);
        }
        if (steps >= 60) {
          drawRose(R * 0.875 * scaleFactor, 7/4, 4, 1500, palette.accent + "44", 0.45);
        }
        if (steps >= 80) {
          drawRose(R * scaleFactor, 13/6, 6, 2000, palette.accent + "33", 0.42);
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

        if (steps >= 35) {
          drawEpitrochoid(
            R * 0.68, R * 0.68 / 6, R * 0.68 / 6 * 1.12,
            1200, palette.accent + "26", 0.4
          );
        }

        // ── 7. Fibonacci phyllotaxis constellation (Grows step-by-step) ─────
        const dotsCount = p.constrain(steps * 2, 0, 233);
        const dotR = R * 0.35;
        p.noStroke();
        for (let i = 0; i < dotsCount; i++) {
          const r = dotR * Math.sqrt(i / 233);
          const theta = i * GOLDEN_ANGLE;
          const x = r * Math.cos(theta);
          const y = r * Math.sin(theta);
          const t = i / 233;
          
          p.fill(palette.accent + (i === dotsCount - 1 ? "EE" : "55"));
          p.circle(x, y, 0.8 + t * 1.2);
        }

        // ── 8. Centre ornamental rings ─────────────────────────────────────
        p.noFill();
        p.stroke(palette.accent + "77");
        p.strokeWeight(0.5);
        p.circle(0, 0, 24);
        p.circle(0, 0, 16);
        p.circle(0, 0, 10);
        
        p.fill(palette.secondary);
        p.noStroke();
        p.circle(0, 0, 5);

        p.pop();
        ctx.shadowBlur = 0;
      };

      p.windowResized = () => {
        const width = containerRef.current?.clientWidth ?? 600;
        p.resizeCanvas(width, 400);
      };
    };

    p5Instance = new P5(sketch, canvasRef.current);

    return () => {
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
      
      // Setup FM Synth for organic wooden plink sound
      const fmSynth = new Tone.FMSynth({
        harmonicity: 3,
        modulationIndex: 10,
        detune: 0,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
        modulation: { type: "square" },
        modulationEnvelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.1 },
      });

      // Add soft echo/feedback delay to create outdoor ambience
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
      // Map step index to a pentatonic scale note for harmony
      const pentatonic = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5"];
      const note = pentatonic[(newStepIndex - 1) % pentatonic.length];
      synthRef.current.triggerAttackRelease(note, "16n");
    }

    // Add point to geometry engine (simulate variables)
    // Cadence: calculatedBpm, Accel: 1.2, Smooth: 0.9, Entropy: 0.1
    const newPoint = geom.addFootfallPoint(newStepIndex, calculatedBpm, 1.2, 0.9, 0.1);

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

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center bg-white border border-border-subtle rounded-3xl overflow-hidden shadow-sm"
    >
      {/* Simulation Info Header */}
      <div className="w-full px-6 py-4 border-b border-border-subtle flex flex-wrap justify-between items-center bg-canvas gap-4">
        <div className="flex items-center gap-3 font-mono text-xs text-neutral-500">
          <div className="flex items-center gap-1.5 text-nature-forest">
            <Footprints className="w-3.5 h-3.5" />
            <span className="font-bold text-neutral-800">{steps} STEPS</span>
          </div>
          <span className="text-neutral-300">|</span>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-bold text-neutral-800">{cadence} BPM</span>
          </div>
          <span className="text-neutral-300">|</span>
          <div className="flex items-center gap-1.5 text-nature-lavender">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-bold text-neutral-800">{symmetry} ARMS</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-neutral-400 uppercase">Atmosphere: <strong className="text-nature-forest">{period}</strong></span>
          <button
            onClick={handleReset}
            className="px-3 py-1 rounded-full border border-border-subtle bg-white text-neutral-600 hover:text-neutral-900 active:scale-95 transition-all text-xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* p5 canvas anchor node */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full cursor-pointer relative bg-neutral-50 hover:bg-neutral-100/50 transition-colors"
        style={{ minHeight: "400px" }}
      >
        {!audioStarted && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-neutral-950/80 text-white font-mono text-[10px] pointer-events-none animate-pulse">
            🔊 CLICK TO ENABLE PERCUSSION SYNTH
          </div>
        )}
      </div>
    </div>
  );
}
