import { describe, it, expect } from "vitest";
import { ExportEngine } from "./ExportEngine";
import { GeometryEngine } from "../geometry/GeometryEngine";

describe("ExportEngine", () => {
  const mockPalette = {
    name: "Diurnal Specimen",
    accent: "#0A3323",
    secondary: "#839958",
    background: "#f8f6e9",
    ambientGlow: "rgba(10,51,35,0.06)",
  };

  it("should generate step-bounded SVG for low stepsCount (e.g. 5 steps)", () => {
    const geom = new GeometryEngine();
    geom.setSeed("test_seed");
    
    // Add 5 steps
    for (let i = 1; i <= 5; i++) {
      geom.addFootfallPoint(i, 100, 1.0, 0.8, 0.2);
    }
    const geomState = geom.getGeometryState(5, 0.1);

    const svg = ExportEngine.generateSVG(geomState, mockPalette, {
      footfalls: 5,
    });

    // 1. Concentric circles: concentricReveal = Math.min(8, Math.max(2, Math.floor(5/10))) = 2.
    // So 3 concentric circles (index 0, 1, 2) + 1 outer boundary circle + 3 center rings = 7 circle elements in total
    // Let's count the occurrences of <circle
    const circleCount = (svg.match(/<circle/g) || []).length;
    // (Wait, there are also dot grid pattern, top header glyph circle, and phyllotaxis dots)
    // Phyllotaxis dots for 5 steps = Math.min(233, 5 * 2) = 10 dots.
    // Total expected circles: 1 (dot grid) + 1 (top header glyph circle) + 3 (concentric) + 1 (outer boundary) + 1 (center) + 10 (phyllotaxis) = 17 circles.
    // Let's verify that the total number of circles is small (definitely not drawing the full 233 phyllotaxis dots).
    expect(circleCount).toBeLessThan(40);

    // 2. Polar roses: only stepsCount >= 2 is drawn (so 1 path).
    // Let's count paths. (Wait, spirographs are 0 since 5 < 35).
    // So we should have exactly 1 rose path.
    // Let's count the occurrences of <path
    const pathCount = (svg.match(/<path/g) || []).length;
    expect(pathCount).toBe(1);
  });

  it("should generate fully unlocked SVG for high stepsCount (e.g. 100 steps)", () => {
    const geom = new GeometryEngine();
    geom.setSeed("test_seed");
    
    // Add 100 steps
    for (let i = 1; i <= 100; i++) {
      geom.addFootfallPoint(i, 100, 1.0, 0.8, 0.2);
    }
    const geomState = geom.getGeometryState(100, 0.1);

    const svg = ExportEngine.generateSVG(geomState, mockPalette, {
      footfalls: 100,
    });

    // 1. Concentric circles: concentricReveal = 8 (full reveal).
    // 2. Polar roses: all 7 layers drawn.
    // 3. Spirographs: both Epitrochoid and Hypocycloid drawn.
    // So paths should be 7 (roses) + 2 (spirographs) = 9 paths.
    const pathCount = (svg.match(/<path/g) || []).length;
    expect(pathCount).toBe(9);
  });
});
