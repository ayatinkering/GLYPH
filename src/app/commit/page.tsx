"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWalkStore } from "@/stores/useWalkStore";
import { CommitCard } from "@/components/CommitCard";
import { ExportEngine } from "@/engine/export/ExportEngine";
import { GeometryEngine } from "@/engine/geometry/GeometryEngine";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { Download, Check, ArrowLeft, RefreshCw, FileCode, ImageIcon, EyeOff, Share2 } from "lucide-react";
import Link from "next/link";

export default function CommitPage() {
  const router = useRouter();
  const walkStore = useWalkStore();
  
  const [specimenNumber] = useState(() => Math.floor(Math.random() * 800) + 1); // Mock counter for Hackathon
  const [seedHash] = useState(() => {
    return walkStore.lat && walkStore.lng
      ? `${walkStore.lat}_${walkStore.lng}_${walkStore.startTime}`
      : "GLYPH_SEED_" + Date.now();
  });

  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  // State to load link-serialized shared walks
  const [sharedData, setSharedData] = useState<{
    seed: string;
    footfalls: number;
    cadence: number;
    smoothness: number;
    entropy: number;
    solarPeriod: string;
    duration: number;
    date: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const seed = params.get("seed");
    const steps = params.get("steps");
    if (seed && steps) {
      setSharedData({
        seed,
        footfalls: parseInt(steps) || 0,
        cadence: parseInt(params.get("cadence") || "0") || 0,
        smoothness: parseFloat(params.get("smoothness") || "1.0") || 1.0,
        entropy: parseFloat(params.get("entropy") || "0.0") || 0.0,
        solarPeriod: params.get("solarPeriod") || "day",
        duration: parseInt(params.get("duration") || "0") || 0,
        date: params.get("date") || new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
  }, []);

  // Safe redirect if direct navigation occurred without walking or loading a shared card
  const hasWalkData = walkStore.footfalls > 0 || sharedData !== null;

  const formattedDate = useMemoDate();

  // Dynamic values mapped from either active walk store or shared query params
  const activeSeed = sharedData?.seed || seedHash;
  const activeFootfalls = sharedData?.footfalls || walkStore.footfalls;
  const activeCadence = sharedData?.cadence || walkStore.cadence;
  const activeSmoothness = sharedData?.smoothness || walkStore.smoothness;
  const activeEntropy = sharedData?.entropy || walkStore.entropy;
  const activeSolarPeriod = sharedData?.solarPeriod || (walkStore.skyState?.solarPeriod || "day");
  const activeMoonPhase = sharedData ? 0.5 : (walkStore.skyState?.moonPhase || 0.5);
  const activeDate = sharedData?.date || formattedDate;
  
  const activePalette = useMemo(() => {
    if (sharedData) {
      switch (sharedData.solarPeriod.toLowerCase()) {
        case "goldenhour":
          return { name: "Golden Hour Specimen", accent: "#D4A937", secondary: "#8A8A8A", background: "#FAFAF8", ambientGlow: "rgba(212, 169, 55, 0.08)" };
        case "bluehour":
          return { name: "Blue Hour Specimen", accent: "#7764D8", secondary: "#36543B", background: "#F5F7FA", ambientGlow: "rgba(119, 100, 216, 0.08)" };
        case "night":
          return { name: "Midnight Specimen", accent: "#1A2E40", secondary: "#7764D8", background: "#F2F4F7", ambientGlow: "rgba(26, 46, 64, 0.08)" };
        case "day":
        default:
          return { name: "Diurnal Specimen", accent: "#36543B", secondary: "#D4A937", background: "#FAFAF8", ambientGlow: "rgba(54, 84, 59, 0.06)" };
      }
    }
    return walkStore.skyState?.palette;
  }, [sharedData, walkStore.skyState]);

  const activeDuration = sharedData?.duration || walkStore.duration;
  
  const activeHistory = useMemo(() => {
    if (sharedData) {
      return { cadence: [], acceleration: [], smoothness: [], entropy: [], rotation: [] };
    }
    return walkStore.history;
  }, [sharedData, walkStore.history]);

  // Re-generate SVG in memory for hidden tag download hooks
  const svgString = useMemo(() => {
    if (!activePalette) return "";
    const geom = new GeometryEngine();
    geom.setSeed(activeSeed);
    geom.rebuildFromHistory(
      activeFootfalls,
      activeHistory.cadence,
      activeHistory.acceleration,
      activeHistory.smoothness,
      activeHistory.entropy
    );
    const geomState = geom.getGeometryState(activeFootfalls, walkStore.rotation);
    const formattedDuration = `${Math.max(1, Math.round(activeDuration / 60))} min`;
    const formattedDistance = `${(activeFootfalls * 0.00075).toFixed(1)} km`;
    const pointsCount = Math.min(987, activeFootfalls * 8 + 34);

    return ExportEngine.generateSVG(geomState, activePalette, {
      title: activeSolarPeriod === "goldenhour" ? "Golden Hour Walk" : activeSolarPeriod === "bluehour" ? "Blue Hour Walk" : activeSolarPeriod === "night" ? "Night Walk" : "Morning Walk",
      date: activeDate,
      footfalls: activeFootfalls,
      duration: formattedDuration,
      distance: formattedDistance,
      arms: geom.getSymmetryArms(activeFootfalls),
      points: pointsCount,
      commitNumber: specimenNumber,
    });
  }, [activeSeed, activeFootfalls, walkStore.rotation, activeHistory, activePalette, activeDuration, activeSolarPeriod, activeDate, specimenNumber]);

  // Trigger SVG to PNG conversion and download
  const handleDownloadPNG = () => {
    const svgElement = document.querySelector("#hidden-svg-holder svg");
    if (!svgElement) return;

    const svgStringContent = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    const blob = new Blob([svgStringContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = 750;
      canvas.height = 1200;
      if (ctx) {
        ctx.drawImage(img, 0, 0, 750, 1200);
      }
      
      ExportEngine.downloadPNGFile(canvas, `mandala_commit_${formattedCommitNum()}`);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleDownloadSVG = () => {
    const geom = new GeometryEngine();
    geom.setSeed(activeSeed);
    
    geom.rebuildFromHistory(
      activeFootfalls,
      activeHistory.cadence,
      activeHistory.acceleration,
      activeHistory.smoothness,
      activeHistory.entropy
    );

    const geomState = geom.getGeometryState(activeFootfalls, walkStore.rotation);
    const formattedDuration = `${Math.max(1, Math.round(activeDuration / 60))} min`;
    const formattedDistance = `${(activeFootfalls * 0.00075).toFixed(1)} km`;
    const pointsCount = Math.min(987, activeFootfalls * 8 + 34);

    if (activePalette) {
      ExportEngine.downloadSVGFile(
        geomState,
        activePalette,
        `mandala_commit_${formattedCommitNum()}`,
        {
          title: activeSolarPeriod === "goldenhour" ? "Golden Hour Walk" : activeSolarPeriod === "bluehour" ? "Blue Hour Walk" : activeSolarPeriod === "night" ? "Night Walk" : "Morning Walk",
          date: activeDate,
          footfalls: activeFootfalls,
          duration: formattedDuration,
          distance: formattedDistance,
          arms: geom.getSymmetryArms(activeFootfalls),
          points: pointsCount,
          commitNumber: specimenNumber,
        }
      );
    }
  };

  const handleDownloadJSON = () => {
    const walkDNAData = {
      commitNumber: specimenNumber,
      seed: activeSeed,
      date: activeDate,
      footfalls: activeFootfalls,
      cadenceBpm: activeCadence,
      smoothness: activeSmoothness,
      entropy: activeEntropy,
      sky: {
        solarPeriod: activeSolarPeriod,
        moonPhase: activeMoonPhase,
        palette: activePalette,
      },
      duration: activeDuration,
      version: "v1.0"
    };

    ExportEngine.downloadJSONFile(
      walkDNAData,
      `mandala_dna_${formattedCommitNum()}`
    );
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/commit?seed=${activeSeed}&steps=${activeFootfalls}&cadence=${activeCadence}&smoothness=${activeSmoothness}&entropy=${activeEntropy}&solarPeriod=${activeSolarPeriod}&duration=${activeDuration}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedCommitNum = () => {
    return specimenNumber.toString().padStart(4, "0");
  };

  // RENDER EMPTY STATE IF NO DATA
  if (!hasWalkData) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col justify-between text-neutral-900 selection:bg-nature-forest selection:text-white">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <EyeOff className="w-12 h-12 text-neutral-300 mb-6" />
          <h1 className="font-serif text-3xl text-neutral-900 mb-4">Every collection starts with one walk.</h1>
          <p className="text-neutral-500 font-mono text-xs mb-8">No active specimen found.</p>
          <Link
            href="/walk"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold shadow-sm active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Start your first Mandala Commit</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col justify-between pb-12 selection:bg-nature-forest selection:text-white">
      <Header />

      {/* CLIMAX REVEAL CONTAINER */}
      <main className="flex-1 flex flex-col items-center pt-32 px-6 max-w-4xl mx-auto w-full">
        {/* Step 1: Specimen Card Reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full flex justify-center mb-10"
        >
          {activePalette && (
            <CommitCard
              commitNumber={specimenNumber}
              seed={activeSeed}
              footfalls={activeFootfalls}
              cadence={activeCadence}
              smoothness={activeSmoothness}
              entropy={activeEntropy}
              rotation={walkStore.rotation}
              solarPeriod={activeSolarPeriod}
              moonPhase={activeMoonPhase}
              date={activeDate}
              palette={activePalette}
              history={activeHistory}
              duration={activeDuration}
            />
          )}
        </motion.div>
 
        {/* Step 2: Action details and buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-sm flex flex-col gap-4"
        >
          {/* Action Row: Primary Share + GitHub silhouette alert */}
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="flex-grow py-4 px-6 rounded-full bg-btn-primary-bg hover:bg-btn-primary-hover text-white flex items-center justify-center gap-2 font-serif font-normal text-base shadow-md transition-all duration-200 active:scale-98"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Specimen</span>
            </button>
            
            <button
              onClick={() => alert("GitHub Mandala Commit is only available when you scan the QR code and commit from your mobile device.")}
              className="w-14 h-14 rounded-full border border-border-subtle bg-white hover:bg-neutral-50 flex items-center justify-center text-text-primary shadow-sm hover:border-neutral-300 transition-all duration-200"
              title="Commit to GitHub"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </button>
          </div>

          {/* Share options panel */}
          {showShareOptions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-[24px] border border-border-subtle bg-white p-6 shadow-md flex flex-col gap-3 text-left font-serif text-sm text-text-secondary"
            >
              <h4 className="font-serif font-normal text-text-primary text-base mb-1">Share & Export</h4>
              
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-border-subtle"
              >
                <span className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </span>
                  <span>Copy Shareable Link</span>
                </span>
                <span className="text-xs font-mono text-emerald-600">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>

              <button
                onClick={handleDownloadPNG}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-border-subtle"
              >
                <span className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                  <span>Download Specimen Image (PNG)</span>
                </span>
                <span className="text-xs text-neutral-400 font-mono">PNG</span>
              </button>

              <button
                onClick={handleDownloadSVG}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-border-subtle"
              >
                <span className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <Download className="w-4 h-4" />
                  </span>
                  <span>Download Vector Specimen (SVG)</span>
                </span>
                <span className="text-xs text-neutral-400 font-mono">SVG</span>
              </button>

              <button
                onClick={handleDownloadJSON}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-border-subtle"
              >
                <span className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-orange-50 text-orange-600">
                    <FileCode className="w-4 h-4" />
                  </span>
                  <span>Download Mathematical DNA (JSON)</span>
                </span>
                <span className="text-xs text-neutral-400 font-mono">JSON</span>
              </button>
            </motion.div>
          )}

          <div className="w-full text-center mt-4">
            <Link
              href="/"
              onClick={() => walkStore.resetStore()}
              className="text-xs font-mono text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              ← Back to Homepage
            </Link>
          </div>
        </motion.div>
      </main>
      
      {/* Hidden SVG container to enable SVG/PNG downloads of the specimen */}
      <div id="hidden-svg-holder" style={{ display: "none" }} dangerouslySetInnerHTML={{ __html: svgString }} />
    </div>
  );
}

// Custom hook to format date nicely
function useMemoDate() {
  const [formattedDate, setFormattedDate] = useState("");
  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    setFormattedDate(new Date().toLocaleDateString("en-US", options));
  }, []);
  return formattedDate;
}
