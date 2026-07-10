"use client";

import { useEffect, useRef, useState } from "react";
import { GeometryEngine, GeometryState } from "@/engine/geometry/GeometryEngine";
import { SkyEngine, SkyState } from "@/engine/sky/SkyEngine";
import { Footprints, Activity, Sparkles } from "lucide-react";

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

        // Draw scientific concentric helper rings
        p.noFill();
        p.stroke(232, 232, 230); // Faint guidelines
        p.strokeWeight(1);
        p.circle(cx, cy, 100);
        p.circle(cx, cy, 200);
        p.circle(cx, cy, 300);

        // Fetch current points and symmetry rules
        const geomState: GeometryState = geom.getGeometryState(
          geom["points"].length,
          rotationAngle
        );

        const S = geomState.arms;
        const points = geomState.points;

        if (points.length === 0) {
          // Draw a small starting seed dot
          p.fill(palette.accent);
          p.noStroke();
          p.circle(cx, cy, 6);
          
          p.fill(160);
          p.textAlign(p.CENTER, p.CENTER);
          p.textFont("Courier New");
          p.textSize(10);
          p.text("CLICK INSIDE CANVAS TO SIMULATE STEPS", cx, cy + 24);
          return;
        }

        // Apply a very slow rotation angle to show life
        rotationAngle += 0.002;

        // Render point sets symmetrically
        p.push();
        p.translate(cx, cy);
        p.rotate(rotationAngle);

        for (let s = 0; s < S; s++) {
          p.push();
          p.rotate((s * 2 * Math.PI) / S);

          // Draw connections (Bezier lines between consecutive nodes in the same sector)
          p.noFill();
          p.stroke(palette.accent + "33"); // Semitransparent stroke
          p.strokeWeight(1.2);
          
          p.beginShape();
          for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            // Apply slight curve offset derived from smoothness
            const curveX = pt.x + Math.sin(pt.index) * pt.smoothnessOffset;
            const curveY = pt.y + Math.cos(pt.index) * pt.smoothnessOffset;
            p.vertex(curveX, curveY);
          }
          p.endShape();

          // Draw the physical points
          for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            p.fill(palette.accent);
            p.noStroke();
            // Point weight modulated by simulated acceleration
            p.circle(pt.x, pt.y, pt.weight * 1.5);
          }

          p.pop();
        }

        p.pop();
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
