"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWalkStore } from "@/stores/useWalkStore";
import { MotionCompiler } from "@/engine/motion/MotionCompiler";
import { GeometryEngine } from "@/engine/geometry/GeometryEngine";
import { SkyEngine, SkyState } from "@/engine/sky/SkyEngine";
import { BeatEngine } from "@/engine/beat/BeatEngine";
import { WalkCanvas } from "@/components/WalkCanvas";
import { Sparkles, Footprints, ShieldCheck, Compass, EyeOff, Music } from "lucide-react";

export default function WalkPage() {
  const router = useRouter();
  
  // Zustand store bindings
  const {
    isWalking,
    footfalls,
    cadence,
    rotation,
    duration,
    startTime,
    lat,
    lng,
    skyState,
    isPermitted,
    setPermitted,
    setCoordinates,
    setSkyState,
    startWalk,
    addStep,
    updateRotation,
    updateDuration,
    endWalk,
    resetStore,
  } = useWalkStore();

  // persistent compiler engines
  const motionCompiler = useRef<MotionCompiler | null>(null);
  const geometryEngine = useRef<GeometryEngine | null>(null);
  const skyEngine = useRef<SkyEngine | null>(null);
  const beatEngine = useRef<BeatEngine | null>(null);

  // local permission state
  const [requestStatus, setRequestStatus] = useState<"idle" | "requesting" | "denied">("idle");
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Instantiate compilers
    motionCompiler.current = new MotionCompiler();
    geometryEngine.current = new GeometryEngine();
    skyEngine.current = new SkyEngine();
    beatEngine.current = new BeatEngine();

    // Check if running on iOS (requires explicit permission button)
    const isIOSDevice =
      typeof window !== "undefined" &&
      typeof DeviceMotionEvent !== "undefined" &&
      typeof (DeviceMotionEvent as any).requestPermission === "function";
    setIsIOS(isIOSDevice);
    
    return () => {
      // Cleanup audio context if page unmounts
      if (beatEngine.current) {
        beatEngine.current.stop();
      }
      resetStore();
    };
  }, []);

  // Request permissions and start walking session
  const handleAuthorize = async () => {
    setRequestStatus("requesting");

    try {
      // A. Get Geolocation coordinates for Sky position
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const latitude = pos.coords.latitude;
            const longitude = pos.coords.longitude;
            setCoordinates(latitude, longitude);
            
            // Calculate Sun coordinates atmosphere
            if (skyEngine.current) {
              const sState = skyEngine.current.getSkyState(new Date(), latitude, longitude);
              setSkyState(sState);
              if (geometryEngine.current) {
                geometryEngine.current.setSeed(latitude + "_" + longitude + "_" + Date.now());
              }
            }
          },
          (err) => {
            console.warn("Geolocation denied. Using default coordinates.", err);
            // Default baseline
            if (skyEngine.current) {
              const sState = skyEngine.current.getSkyState(new Date());
              setSkyState(sState);
            }
          }
        );
      } else {
        if (skyEngine.current) {
          const sState = skyEngine.current.getSkyState(new Date());
          setSkyState(sState);
        }
      }

      // B. Request Device Motion permission (iOS specific)
      let motionGranted = true;
      if (isIOS) {
        const response = await (DeviceMotionEvent as any).requestPermission();
        motionGranted = response === "granted";
      }

      if (motionGranted) {
        setPermitted(true);
        startWalk();
        
        // Start synthetic instrument beat engine
        if (beatEngine.current) {
          await beatEngine.current.initialize();
        }
        setRequestStatus("idle");
      } else {
        setRequestStatus("denied");
      }
    } catch (e) {
      console.error("Sensor authorization error:", e);
      setRequestStatus("denied");
    }
  };

  // Real-time loop for sensors listener
  useEffect(() => {
    if (!isPermitted || !isWalking) return;

    // Start timer interval (in seconds)
    const timer = setInterval(() => {
      if (startTime) {
        updateDuration(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    // Sensor callback: device motion
    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.acceleration || !motionCompiler.current || !geometryEngine.current || !beatEngine.current) return;

      const ax = event.acceleration.x || 0;
      const ay = event.acceleration.y || 0;
      const az = event.acceleration.z || 0;
      const timestamp = Date.now();

      const isStep = motionCompiler.current.processDeviceMotion(ax, ay, az, timestamp);
      
      if (isStep && startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mState = motionCompiler.current.getMotionState(elapsed);

        // 1. Update Zustand store values
        addStep(mState.cadence, mState.acceleration, mState.smoothness, mState.entropy);

        // 2. Play synthetic Tone plink note & ambient panning
        beatEngine.current.triggerFootfallBeat(mState.footfalls, mState.cadence, mState.rotation);

        // 3. Render point in geometry coordinates
        geometryEngine.current.addFootfallPoint(
          mState.footfalls,
          mState.cadence,
          mState.acceleration,
          mState.smoothness,
          mState.entropy
        );
      }
    };

    // Sensor callback: device orientation alpha (compass heading)
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (!motionCompiler.current) return;
      const heading = event.alpha || 0;
      motionCompiler.current.processDeviceOrientation(heading);
      
      const headingRad = (heading * Math.PI) / 180;
      updateRotation(headingRad);
    };

    window.addEventListener("devicemotion", handleMotion);
    window.addEventListener("deviceorientation", handleOrientation);

    // Desktop keyboard Spacebar fallback to test session rendering
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        simulateStep();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener("devicemotion", handleMotion);
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPermitted, isWalking]);

  // Fallback simulator for development/desktop testing
  const simulateStep = () => {
    if (!geometryEngine.current || !beatEngine.current) return;
    
    const newStepIndex = footfalls + 1;
    const mockCadence = cadence === 0 ? 100 : cadence; // basic stepping tempo
    
    addStep(mockCadence, 1.2, 0.9, 0.1);
    
    beatEngine.current.triggerFootfallBeat(newStepIndex, mockCadence, rotation);
    
    geometryEngine.current.addFootfallPoint(
      newStepIndex,
      mockCadence,
      1.2,
      0.9,
      0.1
    );
  };

  // Conclude Walk session
  const handleEndWalk = () => {
    endWalk();
    if (beatEngine.current) {
      beatEngine.current.stop();
    }
    
    // Redirect to the commit specimen page
    router.push("/commit");
  };

  // Formatting utility: seconds -> mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // RENDER PERMISSION MODAL SCREEN
  if (!isPermitted || !isWalking) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-text-primary selection:bg-nature-forest selection:text-white">
        <div className="w-full max-w-md p-8 rounded-3xl border border-border-subtle bg-white shadow-sm flex flex-col items-center text-center">
          <Sparkles className="w-10 h-10 text-nature-gold animate-pulse mb-6" />
          <h1 className="font-serif text-3xl font-normal text-text-primary mb-2">Motion & Atmosphere</h1>
          <p className="text-sm font-mono text-text-muted uppercase tracking-wider mb-8">Permission Setup</p>

          <p className="text-base text-text-secondary leading-relaxed mb-8 font-serif font-normal">
            GLYPH acts as a computational lens. To draw your footsteps mandala, we request access to your device motion sensors and coordinates.
          </p>

          {/* Checklist items */}
          <div className="w-full space-y-4 mb-8 text-left text-sm font-mono text-text-secondary">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border-subtle bg-canvas">
              <ShieldCheck className="w-4 h-4 text-nature-forest" />
              <span>Gait cadence & steps (DeviceMotion)</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border-subtle bg-canvas">
              <Compass className="w-4 h-4 text-nature-forest" />
              <span>Orientation heading (DeviceOrientation)</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border-subtle bg-canvas">
              <Music className="w-4 h-4 text-nature-forest" />
              <span>Tone.js procedural audio synthesizer</span>
            </div>
          </div>

          {requestStatus === "denied" && (
            <div className="flex items-center gap-2 text-sm font-mono text-red-600 mb-6 bg-red-50 p-3 rounded-xl w-full text-left">
              <EyeOff className="w-4 h-4 flex-shrink-0" />
              <span>Sensor access denied. Please verify browser options and refresh.</span>
            </div>
          )}

          <button
            onClick={handleAuthorize}
            disabled={requestStatus === "requesting"}
            className="w-full py-4 rounded-full bg-btn-primary-bg hover:bg-btn-primary-hover text-white font-normal shadow-md disabled:bg-neutral-300 transition-all duration-200 font-serif text-base"
          >
            {requestStatus === "requesting" ? "Requesting..." : "Authorize Sensors"}
          </button>
        </div>
      </div>
    );
  }

  // RENDER ACTIVE WALK SCREEN
  return (
    <div className="fixed inset-0 bg-canvas text-neutral-900 flex flex-col justify-between select-none overflow-hidden">
      {/* Top: Large dynamic step count */}
      <div className="w-full text-center pt-12 pb-4 z-10 pointer-events-none">
        <h1 className="font-serif font-bold text-6xl sm:text-7xl text-neutral-900 tracking-tight transition-all duration-300">
          {footfalls}
        </h1>
        <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest mt-2">Footfalls Compiled</p>
      </div>

      {/* Center: Live WebGL p5 mandala canvas */}
      <div className="flex-1 w-full relative z-0" onClick={simulateStep}>
        {geometryEngine.current && skyState && (
          <WalkCanvas
            geometryEngine={geometryEngine.current}
            palette={skyState.palette}
            footfalls={footfalls}
            rotation={rotation}
          />
        )}
      </div>

      {/* Bottom overlay: Metrics, timer and End CTA */}
      <div className="w-full px-8 pb-12 pt-4 flex flex-col items-center gap-6 z-10 bg-gradient-to-t from-canvas via-canvas/90 to-transparent">
        {/* Desktop notification banner if sensor fallback is used */}
        {footfalls === 0 && (
          <div className="px-3 py-1 rounded-full bg-neutral-950/80 text-white text-[10px] font-mono animate-bounce">
            ⌨️ PRES SPACEBAR OR TAP SCREEN TO SIMULATE FOOTFALLS
          </div>
        )}

        <div className="w-full max-w-lg flex justify-between items-center text-xs font-mono text-neutral-500">
          <div className="flex flex-col items-start gap-1">
            <span className="text-neutral-400 uppercase tracking-wider">Atmosphere</span>
            <span className="text-nature-forest font-semibold uppercase">{skyState?.palette?.name ?? "Daylight"}</span>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-neutral-400 uppercase tracking-wider">Duration</span>
            <span className="text-neutral-900 font-bold">{formatTimer(duration)}</span>
          </div>
        </div>

        {/* End Walk Button */}
        <button
          onClick={handleEndWalk}
          className="px-8 py-4 rounded-full border border-border-subtle bg-white hover:bg-neutral-50 text-neutral-900 font-semibold shadow-sm hover:border-neutral-300 transition-all duration-200 active:scale-95"
        >
          End Walk
        </button>
      </div>
    </div>
  );
}
