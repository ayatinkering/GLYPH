"use client";

import { useEffect, useRef } from "react";
import { GeometryEngine } from "@/engine/geometry/GeometryEngine";
import { ColorPalette } from "@/engine/sky/SkyEngine";

interface WalkCanvasProps {
  geometryEngine: GeometryEngine;
  palette: ColorPalette;
  footfalls: number;
  rotation: number;
}

export function WalkCanvas({
  geometryEngine,
  palette,
  footfalls,
  rotation,
}: WalkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const p5Lib = require("p5");
    const P5 = p5Lib.default || p5Lib;
    let p5Instance: any = null;

    const PHI = (1 + Math.sqrt(5)) / 2;
    const GOLDEN_ANGLE = 2 * Math.PI * (2 - PHI);

    const sketch = (p: any) => {
      let currentRotation = rotation;

      p.setup = () => {
        const width = containerRef.current?.clientWidth ?? 600;
        const height = containerRef.current?.clientHeight ?? 400;
        p.createCanvas(width, height);
        p.angleMode(p.RADIANS);
        p.frameRate(60);
      };

      p.draw = () => {
        // Clear background with soft astronomical paper background
        p.background(palette.background);

        const cx = p.width / 2;
        const cy = p.height / 2;
        // Palette values matching the user's exact requirements:
        const DARK_GREEN = "#0A3323";
        const MOSS_GREEN = "#839958";
        const ROSY_BROWN = "#D3968C";
        const MIDNIGHT_GREEN = "#105666";

        // Helper to convert hex to rgba
        const hexToRgba = (hex: string, alpha: number) => {
          let r = 10, g = 51, b = 35;
          const h = hex.replace("#", "");
          if (h.length === 6) {
            r = parseInt(h.substring(0, 2), 16);
            g = parseInt(h.substring(2, 4), 16);
            b = parseInt(h.substring(4, 6), 16);
          }
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const R = Math.min(p.width, p.height) * 0.40;

        // Smoothly interpolate rotation to prevent sudden jerking
        currentRotation = p.lerp(currentRotation, rotation, 0.05);

        // Apply native canvas shadows to simulate a premium glowing aura
        const ctx = p.drawingContext;
        ctx.shadowBlur = 10;
        ctx.shadowColor = hexToRgba(DARK_GREEN, 0.25);

        p.push();
        p.translate(cx, cy);
        p.rotate(currentRotation);

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
        // Only render concentric rings matching step progression
        const concentricReveal = p.constrain(footfalls / 10, 2, 8);
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
          steps: number,
          color: string,
          lw: number
        ) => {
          const total = Math.PI * 2 * rotations;
          p.noFill();
          p.stroke(color);
          p.strokeWeight(lw);
          p.beginShape();
          for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * total;
            const r = maxR * Math.cos(k * t);
            const x = r * Math.cos(t);
            const y = r * Math.sin(t);
            p.vertex(x, y);
          }
          p.endShape();
        };

        // ── 5. Polar rose layers (Revealed as step count increases) ──────────
        // Scale curves slightly based on footfalls to show dynamic growth
        const scaleFactor = p.constrain(footfalls / 80, 0.25, 1.0);
        
        if (footfalls >= 2) {
          drawRose(R * 0.17 * scaleFactor, 2, 1, 300, hexToRgba(DARK_GREEN, 0.92), 1.5);
        }
        if (footfalls >= 8) {
          drawRose(R * 0.30 * scaleFactor, 3, 1, 500, hexToRgba(ROSY_BROWN, 0.85), 1.35);
        }
        if (footfalls >= 16) {
          drawRose(R * 0.465 * scaleFactor, 5, 1, 600, hexToRgba(MOSS_GREEN, 0.76), 1.25);
        }
        if (footfalls >= 24) {
          drawRose(R * 0.62 * scaleFactor, 3/2, 2, 1000, hexToRgba(MIDNIGHT_GREEN, 0.64), 1.15);
        }
        if (footfalls >= 40) {
          drawRose(R * 0.755 * scaleFactor, 5/3, 3, 1200, hexToRgba(ROSY_BROWN, 0.52), 1.0);
        }
        if (footfalls >= 60) {
          drawRose(R * 0.875 * scaleFactor, 7/4, 4, 1500, hexToRgba(MOSS_GREEN, 0.40), 0.9);
        }
        if (footfalls >= 80) {
          drawRose(R * scaleFactor, 13/6, 6, 2000, hexToRgba(MIDNIGHT_GREEN, 0.32), 0.9);
        }

        // ── 6. Spirographs (Epitrochoid & Hypocycloid) ──────────────────────
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
          p.noFill();
          p.stroke(color);
          p.strokeWeight(lw);
          p.beginShape();
          for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * total;
            const x = (Rr + rr) * Math.cos(t) - d * Math.cos(((Rr + rr) / rr) * t);
            const y = (Rr + rr) * Math.sin(t) - d * Math.sin(((Rr + rr) / rr) * t);
            p.vertex(x, y);
          }
          p.endShape();
        };

        if (footfalls >= 35) {
          drawEpitrochoid(
            R * 0.68, R * 0.68 / 6, R * 0.68 / 6 * 1.12,
            1200, hexToRgba(ROSY_BROWN, 0.30), 0.85
          );
        }

        // ── 7. Fibonacci phyllotaxis constellation (Grows step-by-step) ─────
        // Plot dots as they walk
        const dotsCount = p.constrain(footfalls * 2, 0, 233);
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
        p.circle(0, 0, 10);
        
        p.fill(hexToRgba(ROSY_BROWN, 0.94));
        p.noStroke();
        p.circle(0, 0, 5);

        p.pop();
        ctx.shadowBlur = 0; // Reset shadows
      };

      p.windowResized = () => {
        const width = containerRef.current?.clientWidth ?? 600;
        const height = containerRef.current?.clientHeight ?? 400;
        p.resizeCanvas(width, height);
      };
    };

    p5Instance = new P5(sketch, canvasRef.current);

    return () => {
      if (p5Instance) p5Instance.remove();
    };
  }, [palette, footfalls, rotation]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <div ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
