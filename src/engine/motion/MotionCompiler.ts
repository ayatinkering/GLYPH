export interface MotionState {
  footfalls: number;
  cadence: number;
  acceleration: number;
  entropy: number;
  smoothness: number;
  rotation: number;
  duration: number;
}

export class MotionCompiler {
  private footfalls = 0;
  private stepTimestamps: number[] = [];
  
  // Low-pass filter coefficients
  private gravity = { x: 0, y: 0, z: 0 };
  private alpha = 0.8; // Low-pass filter coefficient for gravity separation
  
  // Acceleration magnitude history for smoothing
  private filteredAccel = 0;
  private beta = 0.15; // Smoothing coefficient for magnitude

  // Thresholds for step detection
  private stepThreshold = 1.6; // m/s^2 above gravity base
  private lastStepTime = 0;
  private debounceMs = 280; // Minimum time between footfalls (max 214 steps/min)

  // Motion state variables
  private recentIntervals: number[] = [];
  private maxIntervalsToTrack = 6;
  
  // Cumulative smoothness tracking
  private smoothVarianceBuffer: number[] = [];
  private maxVarianceSize = 20;

  // Heading rotation tracking
  private currentHeading = 0;

  constructor() {}

  /**
   * Listeners call this to feed raw acceleration values (m/s^2 including gravity)
   * into the filter and return whether a new footfall was detected.
   */
  public processDeviceMotion(
    ax: number,
    ay: number,
    az: number,
    timestamp: number
  ): boolean {
    // 1. Separate gravity using a simple high-pass filter (standard iOS/Android extraction)
    this.gravity.x = this.alpha * this.gravity.x + (1 - this.alpha) * ax;
    this.gravity.y = this.alpha * this.gravity.y + (1 - this.alpha) * ay;
    this.gravity.z = this.alpha * this.gravity.z + (1 - this.alpha) * az;

    // Linear acceleration (gravity removed)
    const lx = ax - this.gravity.x;
    const ly = ay - this.gravity.y;
    const lz = az - this.gravity.z;

    // 2. Compute overall linear acceleration magnitude
    const magnitude = Math.sqrt(lx * lx + ly * ly + lz * lz);

    // Apply low-pass smoothing to magnitude to filter out micro-shocks
    this.filteredAccel = this.beta * magnitude + (1 - this.beta) * this.filteredAccel;

    // Smoothness calculations (variance of filtered magnitude)
    this.smoothVarianceBuffer.push(magnitude);
    if (this.smoothVarianceBuffer.length > this.maxVarianceSize) {
      this.smoothVarianceBuffer.shift();
    }

    // 3. Step detection: look for magnitude peaks crossing stepThreshold
    if (this.filteredAccel > this.stepThreshold) {
      if (timestamp - this.lastStepTime > this.debounceMs) {
        this.registerStep(timestamp);
        return true;
      }
    }
    return false;
  }

  /**
   * Listeners call this to feed raw compass orientation angles (degrees, 0-360)
   */
  public processDeviceOrientation(alphaHeading: number): void {
    // Keep orientation in radians for mathematical ease downstream
    this.currentHeading = (alphaHeading * Math.PI) / 180;
  }

  /**
   * Logs a new step event and updates the interval variables
   */
  private registerStep(timestamp: number): void {
    this.footfalls += 1;
    
    if (this.lastStepTime > 0) {
      const interval = timestamp - this.lastStepTime;
      this.recentIntervals.push(interval);
      if (this.recentIntervals.length > this.maxIntervalsToTrack) {
        this.recentIntervals.shift();
      }
    }
    
    this.lastStepTime = timestamp;
    this.stepTimestamps.push(timestamp);
  }

  /**
   * Compiles the current smoothed parameters into a unified MotionState
   */
  public getMotionState(elapsedSeconds: number): MotionState {
    const cadence = this.calculateCadence();
    const entropy = this.calculateGaitEntropy();
    const smoothness = this.calculateSmoothness();

    return {
      footfalls: this.footfalls,
      cadence,
      acceleration: this.filteredAccel,
      entropy,
      smoothness,
      rotation: this.currentHeading,
      duration: elapsedSeconds,
    };
  }

  /**
   * Calculates cadence in steps per minute (BPM) based on recent intervals
   */
  private calculateCadence(): number {
    if (this.recentIntervals.length === 0) return 0;
    
    // Average the last few step intervals (in ms)
    const sum = this.recentIntervals.reduce((acc, val) => acc + val, 0);
    const avgIntervalMs = sum / this.recentIntervals.length;
    
    // Convert ms interval to steps per minute (BPM)
    return Math.round(60000 / avgIntervalMs);
  }

  /**
   * Calculates the entropy (irregularity) of the step pattern
   * by measuring the coefficient of variation (StDev / Mean) of step intervals.
   */
  private calculateGaitEntropy(): number {
    if (this.recentIntervals.length < 3) return 0;

    const mean = this.recentIntervals.reduce((acc, val) => acc + val, 0) / this.recentIntervals.length;
    
    const variance = this.recentIntervals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / this.recentIntervals.length;
    const stdev = Math.sqrt(variance);
    
    // Coefficient of variation is a standard descriptor for gait entropy (0.0 = perfect regular metronome, 1.0+ = irregular)
    return Math.min(1.0, stdev / mean);
  }

  /**
   * Calculates smoothness based on standard deviation of recent acceleration magnitude changes
   */
  private calculateSmoothness(): number {
    if (this.smoothVarianceBuffer.length < 5) return 1.0;

    const mean = this.smoothVarianceBuffer.reduce((acc, val) => acc + val, 0) / this.smoothVarianceBuffer.length;
    const variance = this.smoothVarianceBuffer.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / this.smoothVarianceBuffer.length;
    
    // Low variance in acceleration magnitude means a smooth, fluid walk (gait smoothness close to 1.0)
    // High variance means heavy steps or jerky movement (gait smoothness close to 0.0)
    const rawStdev = Math.sqrt(variance);
    const maxSmoothnessThreshold = 4.0; // Acceleration variation cap
    
    const smoothness = 1.0 - Math.min(1.0, rawStdev / maxSmoothnessThreshold);
    return Number(smoothness.toFixed(3));
  }

  /**
   * Resets all walk compilation metrics (used at start of session)
   */
  public reset(): void {
    this.footfalls = 0;
    this.stepTimestamps = [];
    this.recentIntervals = [];
    this.smoothVarianceBuffer = [];
    this.lastStepTime = 0;
    this.filteredAccel = 0;
    this.currentHeading = 0;
    this.gravity = { x: 0, y: 0, z: 0 };
  }
}
