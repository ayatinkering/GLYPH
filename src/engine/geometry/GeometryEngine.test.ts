import { describe, it, expect } from "vitest";
import { GeometryEngine } from "./GeometryEngine";

describe("GeometryEngine", () => {
  it("should return the correct Fibonacci symmetry arms based on step counts", () => {
    const geom = new GeometryEngine();

    expect(geom.getSymmetryArms(10)).toBe(3);
    expect(geom.getSymmetryArms(89)).toBe(3);
    
    expect(geom.getSymmetryArms(90)).toBe(5);
    expect(geom.getSymmetryArms(233)).toBe(5);
    
    expect(geom.getSymmetryArms(234)).toBe(8);
    expect(geom.getSymmetryArms(610)).toBe(8);
    
    expect(geom.getSymmetryArms(611)).toBe(13);
    expect(geom.getSymmetryArms(1597)).toBe(13);
    
    expect(geom.getSymmetryArms(1598)).toBe(21);
    expect(geom.getSymmetryArms(4181)).toBe(21);
    
    expect(geom.getSymmetryArms(4182)).toBe(34);
    expect(geom.getSymmetryArms(10000)).toBe(34);
  });

  it("should generate deterministic coordinates given the same seed and inputs", () => {
    const geom1 = new GeometryEngine();
    const geom2 = new GeometryEngine();

    const seed = "walk_gps_40.7128_-74.0060_1782390123";
    geom1.setSeed(seed);
    geom2.setSeed(seed);

    // Simulate 3 steps on both engines
    const steps = [
      { n: 1, bpm: 105, accel: 1.2, smooth: 0.85, entropy: 0.1 },
      { n: 2, bpm: 108, accel: 1.4, smooth: 0.88, entropy: 0.1 },
      { n: 3, bpm: 106, accel: 1.1, smooth: 0.90, entropy: 0.15 },
    ];

    for (const step of steps) {
      geom1.addFootfallPoint(step.n, step.bpm, step.accel, step.smooth, step.entropy);
      geom2.addFootfallPoint(step.n, step.bpm, step.accel, step.smooth, step.entropy);
    }

    const state1 = geom1.getGeometryState(3, 0.45);
    const state2 = geom2.getGeometryState(3, 0.45);

    expect(state1.arms).toBe(state2.arms);
    expect(state1.rotation).toBe(state2.rotation);
    expect(state1.points.length).toBe(3);
    expect(state1.points.length).toBe(state2.points.length);

    // Check that every single coordinate is coordinate-for-coordinate identical
    for (let i = 0; i < 3; i++) {
      expect(state1.points[i].x).toBe(state2.points[i].x);
      expect(state1.points[i].y).toBe(state2.points[i].y);
      expect(state1.points[i].radius).toBe(state2.points[i].radius);
      expect(state1.points[i].angle).toBe(state2.points[i].angle);
      expect(state1.points[i].weight).toBe(state2.points[i].weight);
      expect(state1.points[i].noiseOffset).toBe(state2.points[i].noiseOffset);
    }
  });

  it("should generate different coordinates given different seeds", () => {
    const geom1 = new GeometryEngine();
    const geom2 = new GeometryEngine();

    geom1.setSeed("seed_nyc");
    geom2.setSeed("seed_london");

    // Add identical step inputs
    geom1.addFootfallPoint(1, 110, 1.3, 0.8, 0.2);
    geom2.addFootfallPoint(1, 110, 1.3, 0.8, 0.2);

    const pt1 = geom1.getGeometryState(1, 0).points[0];
    const pt2 = geom2.getGeometryState(1, 0).points[0];

    // Due to differing seeds, the noise offsets and resulting coordinates must differ
    expect(pt1.noiseOffset).not.toBe(pt2.noiseOffset);
    expect(pt1.x).not.toBe(pt2.x);
    expect(pt1.y).not.toBe(pt2.y);
  });
});
