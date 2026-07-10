import { MotionState } from "../motion/MotionCompiler";

export class BeatEngine {
  private toneInstance: any = null;
  private isInitialized = false;

  // Synthesizers
  private kickSynth: any = null;
  private pluckSynth: any = null;
  private droneSynth: any = null;
  private panner: any = null;
  private delay: any = null;
  
  // Pentatonic scale notes for harmonic woodblock triggers
  private PENTATONIC_SCALE = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5"];

  constructor() {}

  /**
   * Safe browser initialization of the audio graph
   */
  public async initialize(): Promise<void> {
    if (typeof window === "undefined" || this.isInitialized) return;

    try {
      const Tone = await import("tone");
      this.toneInstance = Tone;

      // Start the audio context
      await Tone.start();

      // 1. Create stereo panner for rotation-based stereo imaging
      this.panner = new Tone.Panner(0).toDestination();

      // 2. Create delay send node for forest echo
      this.delay = new Tone.FeedbackDelay("8n", 0.45).connect(this.panner);

      // 3. Kick Synth: warm sub-kick
      this.kickSynth = new Tone.MembraneSynth({
        envelope: { attack: 0.005, decay: 0.25, sustain: 0, release: 0.1 },
        oscillator: { type: "sine" },
      }).connect(this.panner);

      // 4. Pluck Synth: FM synthesis woodblock pluck
      this.pluckSynth = new Tone.FMSynth({
        harmonicity: 3,
        modulationIndex: 8,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.08 },
        modulation: { type: "square" },
        modulationEnvelope: { attack: 0.005, decay: 0.04, sustain: 0, release: 0.08 },
      }).connect(this.delay);

      // Set volume slightly lower for plucks to feel calm
      this.pluckSynth.volume.value = -6;

      // 5. Evolving ambient nature drone
      this.droneSynth = new Tone.FMSynth({
        harmonicity: 1.5,
        modulationIndex: 4,
        oscillator: { type: "triangle" },
        envelope: { attack: 2.0, decay: 1.0, sustain: 0.8, release: 2.0 },
      }).connect(this.panner);
      
      this.droneSynth.volume.value = -16; // Low background pad

      // Start drone softly
      this.droneSynth.triggerAttack("F3");

      this.isInitialized = true;
      console.log("GLYPH BeatEngine initialized successfully.");
    } catch (err) {
      console.error("Failed to initialize Tone.js BeatEngine:", err);
    }
  }

  /**
   * Triggers percussion hits based on footfall step index.
   * Cadence updates delay speed. Rotation adjusts stereo panning.
   */
  public triggerFootfallBeat(
    stepIndex: number,
    cadenceBpm: number,
    headingRad: number
  ): void {
    if (!this.isInitialized || !this.toneInstance) return;

    // 1. Modulate stereo panning from compass heading (headingRad is [0, 2PI])
    // Map headingRad: 0 -> center (0), PI/2 -> right (1), 3PI/2 -> left (-1)
    const panValue = Math.sin(headingRad);
    this.panner.pan.rampTo(panValue, 0.1);

    // 2. Modulate delay parameters based on step cadence
    if (cadenceBpm > 0) {
      // Slower walk = more feedback echo; faster = tighter delays
      const feedback = Math.max(0.1, Math.min(0.6, 0.7 - cadenceBpm / 250));
      this.delay.feedback.rampTo(feedback, 0.2);
    }

    // 3. Play Kick on beat intervals (every 4th step represents bar start)
    if (stepIndex % 4 === 1) {
      this.kickSynth.triggerAttackRelease("C2", "8n");
    }

    // 4. Play Woodblock plink on every footfall mapped to scale note
    const noteIndex = (stepIndex - 1) % this.PENTATONIC_SCALE.length;
    const note = this.PENTATONIC_SCALE[noteIndex];
    
    // Slight accent on alternate steps
    const velocity = stepIndex % 2 === 0 ? 0.95 : 0.75;
    this.pluckSynth.triggerAttackRelease(note, "16n", undefined, velocity);

    // 5. Occasionally trigger a high chord extension on long walks
    if (stepIndex > 30 && stepIndex % 16 === 8) {
      const highNote = this.PENTATONIC_SCALE[(noteIndex + 4) % this.PENTATONIC_SCALE.length];
      this.pluckSynth.triggerAttackRelease(highNote, "8n", undefined, 0.5);
    }
  }

  /**
   * Evolve the background pad pitch based on walk duration
   */
  public evolveAtmosphere(elapsedMinutes: number): void {
    if (!this.isInitialized || !this.droneSynth) return;

    // Shift the drone key based on duration to represent movement in time
    const chords = ["F3", "Ab3", "Bb3", "Db3", "Eb3"];
    const chordIndex = Math.floor(elapsedMinutes) % chords.length;
    
    // Smooth glide to the new base root frequency
    this.droneSynth.frequency.rampTo(chords[chordIndex], 8.0);
  }

  /**
   * Graceful stop of audio graph nodes
   */
  public stop(): void {
    if (!this.isInitialized) return;

    try {
      if (this.droneSynth) {
        this.droneSynth.triggerRelease();
      }
      
      // Stop all synth nodes
      setTimeout(() => {
        if (this.kickSynth) this.kickSynth.dispose();
        if (this.pluckSynth) this.pluckSynth.dispose();
        if (this.droneSynth) this.droneSynth.dispose();
        if (this.delay) this.delay.dispose();
        if (this.panner) this.panner.dispose();
        this.isInitialized = false;
        console.log("GLYPH BeatEngine stopped and audio nodes disposed.");
      }, 2000); // 2-second release buffer
    } catch (e) {
      console.warn("Error while disposing Tone.js BeatEngine nodes:", e);
    }
  }
}
