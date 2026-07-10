export interface MandalaPoint {
  index: number;
  x: number;
  y: number;
  angle: number;
  radius: number;
  weight: number;
  noiseOffset: number;
  smoothnessOffset: number;
}

export interface GeometryState {
  points: MandalaPoint[];
  arms: number;
  rotation: number;
  radius: number;
  generator: "Phyllotaxis";
}

export class GeometryEngine {
  private points: MandalaPoint[] = [];
  private seedValue = 0.5; // Default seeded value

  // Constant math details
  private GOLDEN_ANGLE_RAD = (137.507764 * Math.PI) / 180;

  constructor() {}

  /**
   * Generates a 32-bit integer hash from a string seed (SHA256 alternative)
   */
  public setSeed(seedString: string): void {
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      const char = seedString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    // Normalize to [0, 1]
    this.seedValue = Math.abs(hash) / 2147483647;
  }

  /**
   * Determines the Fibonacci symmetry arms based on step counts
   */
  public getSymmetryArms(footfalls: number): number {
    if (footfalls <= 89) return 3;
    if (footfalls <= 233) return 5;
    if (footfalls <= 610) return 8;
    if (footfalls <= 1597) return 13;
    if (footfalls <= 4181) return 21;
    return 34;
  }

  /**
   * Deterministic 2D noise generator based on fractional sine
   * Returns a value between [-1, 1]
   */
  private noise2D(x: number, y: number): number {
    const dot = x * 12.9898 + y * 78.233 + this.seedValue * 148.24;
    const sine = Math.sin(dot) * 43758.5453123;
    return (sine - Math.floor(sine)) * 2 - 1;
  }

  /**
   * Appends a new point calculated from a detected footfall event
   */
  public addFootfallPoint(
    n: number,
    cadenceBpm: number,
    acceleration: number,
    smoothness: number,
    entropy: number
  ): MandalaPoint {
    // 1. Spacing constant c maps from cadence. Faster cadence expands spacing.
    const baseSpacing = 12;
    const c = baseSpacing + Math.min(15, cadenceBpm / 12);

    // 2. Polar calculations: Phyllotaxis equations
    const angle = n * this.GOLDEN_ANGLE_RAD;
    const radius = c * Math.sqrt(n);

    // 3. Acceleration maps to point stroke weight
    const weight = 1.5 + Math.min(6, acceleration * 0.8);

    // 4. Entropy maps to organic coordinate noise distortion
    const noiseVal = this.noise2D(n * 0.15, radius * 0.05);
    const noiseOffset = noiseVal * entropy * 14; // Entropy controls deviation scale

    // 5. Smoothness maps to curve offsets
    const smoothnessOffset = (1.0 - smoothness) * 10;

    // 6. Cartesian coordinates (centered at origin, noise-adjusted)
    const adjustedRadius = radius + noiseOffset;
    const x = adjustedRadius * Math.cos(angle);
    const y = adjustedRadius * Math.sin(angle);

    const newPoint: MandalaPoint = {
      index: n,
      x,
      y,
      angle,
      radius,
      weight,
      noiseOffset,
      smoothnessOffset,
    };

    this.points.push(newPoint);
    return newPoint;
  }

  /**
   * Compiles the complete points array, applying global dynamics
   */
  public getGeometryState(
    footfalls: number,
    turningRotation: number
  ): GeometryState {
    const arms = this.getSymmetryArms(footfalls);
    
    // Calculate global bounding radius based on the furthest point
    const maxRadius = this.points.length > 0 
      ? this.points[this.points.length - 1].radius 
      : 0;

    return {
      points: [...this.points],
      arms,
      rotation: turningRotation,
      radius: maxRadius,
      generator: "Phyllotaxis",
    };
  }

  /**
   * Recreates the geometry step-by-step from a saved list of footfalls
   * (Used for offline reload, rendering, and playbacks)
   */
  public rebuildFromHistory(
    stepCount: number,
    cadenceHistory: number[],
    accelHistory: number[],
    smoothnessHistory: number[],
    entropyHistory: number[]
  ): void {
    this.reset();
    for (let i = 1; i <= stepCount; i++) {
      const idx = i - 1;
      this.addFootfallPoint(
        i,
        cadenceHistory[idx] || 100,
        accelHistory[idx] || 1.0,
        smoothnessHistory[idx] || 0.8,
        entropyHistory[idx] || 0.2
      );
    }
  }

  /**
   * Clears the active geometry points cache
   */
  public reset(): void {
    this.points = [];
  }
}
