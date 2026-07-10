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
        // Clear background with soft paper ivory
        p.background(palette.background);

        const cx = p.width / 2;
        const cy = p.height / 2;

        // Faint coordinates guidelines
        p.noFill();
        p.stroke(232, 232, 230);
        p.strokeWeight(1);
        p.line(0, cy, p.width, cy);
        p.line(cx, 0, cx, p.height);

        // Concentric orbits
        p.circle(cx, cy, p.width * 0.2);
        p.circle(cx, cy, p.width * 0.4);
        p.circle(cx, cy, p.width * 0.6);

        // Smoothly interpolate rotation to prevent jerking
        currentRotation = p.lerp(currentRotation, rotation, 0.05);

        // Get geometry parameters
        const geomState = geometryEngine.getGeometryState(footfalls, currentRotation);
        const S = geomState.arms;
        const points = geomState.points;

        if (points.length === 0) {
          // Draw a small starting point
          p.fill(palette.accent);
          p.noStroke();
          p.circle(cx, cy, 6);
          return;
        }

        // Apply native canvas shadows to simulate a premium glowing aura/fog
        const ctx = p.drawingContext;
        ctx.shadowBlur = 12;
        ctx.shadowColor = palette.accent;

        p.push();
        p.translate(cx, cy);
        p.rotate(currentRotation);

        // 1. Draw Symmetry arms
        for (let s = 0; s < S; s++) {
          p.push();
          p.rotate((s * 2 * Math.PI) / S);

          // Draw connecting paths (gait curves)
          p.noFill();
          p.stroke(palette.accent + "22"); // Very faint connection lines
          p.strokeWeight(1.5);
          
          p.beginShape();
          for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            const curveX = pt.x + Math.sin(pt.index) * pt.smoothnessOffset;
            const curveY = pt.y + Math.cos(pt.index) * pt.smoothnessOffset;
            p.vertex(curveX, curveY);
          }
          p.endShape();

          // Draw nodes
          for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            
            // Highlight the most recent nodes with a larger bloom
            const isRecent = i >= points.length - 3;
            const size = isRecent ? pt.weight * 2.2 : pt.weight * 1.5;
            
            p.fill(isRecent ? palette.accent : palette.accent + "DD");
            p.noStroke();
            p.circle(pt.x, pt.y, size);
          }

          p.pop();
        }

        p.pop();

        // Remove shadow state for UI elements overlay if any
        ctx.shadowBlur = 0;
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
