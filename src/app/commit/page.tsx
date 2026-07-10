"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWalkStore } from "@/stores/useWalkStore";
import { CommitCard } from "@/components/CommitCard";
import { ExportEngine } from "@/engine/export/ExportEngine";
import { GeometryEngine } from "@/engine/geometry/GeometryEngine";
import { githubCommit } from "@/app/actions/githubCommit";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { Download, Check, ArrowLeft, RefreshCw, FileCode, ImageIcon, EyeOff } from "lucide-react";
import Link from "next/link";

export default function CommitPage() {
  const router = useRouter();
  const walkStore = useWalkStore();
  
  const [isCommitting, setIsCommitting] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);
  const [specimenNumber] = useState(() => Math.floor(Math.random() * 800) + 1); // Mock counter for Hackathon
  const [seedHash] = useState(() => {
    return walkStore.lat && walkStore.lng
      ? `${walkStore.lat}_${walkStore.lng}_${walkStore.startTime}`
      : "GLYPH_SEED_" + Date.now();
  });

  // Safe redirect if direct navigation occurred without walking
  const hasWalkData = walkStore.footfalls > 0;

  const formattedDate = useMemoDate();

  // Trigger SVG to PNG conversion and download
  const handleDownloadPNG = () => {
    const svgElement = document.querySelector("svg");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Set blob properties
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.drawImage(img, 0, 0, 600, 600);
      }
      
      ExportEngine.downloadPNGFile(canvas, `mandala_commit_${formattedCommitNum()}`);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleDownloadSVG = () => {
    const geom = new GeometryEngine();
    geom.setSeed(seedHash);
    
    geom.rebuildFromHistory(
      walkStore.footfalls,
      walkStore.history.cadence,
      walkStore.history.acceleration,
      walkStore.history.smoothness,
      walkStore.history.entropy
    );

    const geomState = geom.getGeometryState(walkStore.footfalls, walkStore.rotation);
    if (walkStore.skyState) {
      ExportEngine.downloadSVGFile(
        geomState,
        walkStore.skyState.palette,
        `mandala_commit_${formattedCommitNum()}`
      );
    }
  };

  const handleDownloadJSON = () => {
    const walkDNAData = {
      commitNumber: specimenNumber,
      seed: seedHash,
      date: formattedDate,
      footfalls: walkStore.footfalls,
      cadenceBpm: walkStore.cadence,
      smoothness: walkStore.smoothness,
      entropy: walkStore.entropy,
      sky: walkStore.skyState,
      history: walkStore.history,
      version: "v1.0"
    };

    ExportEngine.downloadJSONFile(
      walkDNAData,
      `mandala_dna_${formattedCommitNum()}`
    );
  };

  // Real server action trigger for GitHub repository push
  const handleGitHubCommit = async () => {
    setIsCommitting(true);
    
    // Reconstruct geometry and SVG content to push
    const geom = new GeometryEngine();
    geom.setSeed(seedHash);
    geom.rebuildFromHistory(
      walkStore.footfalls,
      walkStore.history.cadence,
      walkStore.history.acceleration,
      walkStore.history.smoothness,
      walkStore.history.entropy
    );
    const geomState = geom.getGeometryState(walkStore.footfalls, walkStore.rotation);
    const svgContent = ExportEngine.generateSVG(geomState, walkStore.skyState!.palette);
    
    const jsonContent = JSON.stringify({
      commitNumber: specimenNumber,
      seed: seedHash,
      date: formattedDate,
      footfalls: walkStore.footfalls,
      cadenceBpm: walkStore.cadence,
      smoothness: walkStore.smoothness,
      entropy: walkStore.entropy,
      sky: walkStore.skyState,
      history: walkStore.history,
      version: "v1.0"
    }, null, 2);

    try {
      const res = await githubCommit({
        svgContent,
        jsonContent,
        commitNumber: specimenNumber,
        solarPeriod: walkStore.skyState!.solarPeriod,
        seed: seedHash,
      });

      if (res.success) {
        setIsCommitted(true);
      } else {
        alert(res.error || "Failed to commit. Storing locally.");
      }
    } catch (e) {
      console.error("Failed to commit to GitHub:", e);
      alert("Error contacting server. Storing walk details locally.");
    } finally {
      setIsCommitting(false);
    }
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
    <div className="min-h-screen bg-canvas text-neutral-900 flex flex-col justify-between pb-12 selection:bg-nature-forest selection:text-white">
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
          {walkStore.skyState && (
            <CommitCard
              commitNumber={specimenNumber}
              seed={seedHash}
              footfalls={walkStore.footfalls}
              cadence={walkStore.cadence}
              smoothness={walkStore.smoothness}
              entropy={walkStore.entropy}
              rotation={walkStore.rotation}
              solarPeriod={walkStore.skyState.solarPeriod}
              moonPhase={walkStore.skyState.moonPhase}
              date={formattedDate}
              palette={walkStore.skyState.palette}
              history={walkStore.history}
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
          {/* GitHub Commit action */}
          {isCommitted ? (
            <div className="w-full py-4 px-6 rounded-full border border-nature-forest bg-nature-forest/5 text-nature-forest flex items-center justify-center gap-2 font-semibold">
              <Check className="w-4 h-4" />
              <span>Committed to GitHub</span>
            </div>
          ) : (
            <button
              onClick={handleGitHubCommit}
              disabled={isCommitting}
              className="w-full py-4 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white flex items-center justify-center gap-2 font-semibold active:scale-98 shadow-md transition-all"
            >
              {isCommitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating Repository Contribution...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  <span>Commit to GitHub</span>
                </>
              )}
            </button>
          )}

          {/* Download options */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleDownloadSVG}
              className="py-3 px-2 rounded-xl border border-border-subtle bg-white hover:bg-neutral-50 text-neutral-700 flex flex-col items-center gap-1.5 text-[10px] font-mono hover:border-neutral-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>VEC (SVG)</span>
            </button>
            <button
              onClick={handleDownloadPNG}
              className="py-3 px-2 rounded-xl border border-border-subtle bg-white hover:bg-neutral-50 text-neutral-700 flex flex-col items-center gap-1.5 text-[10px] font-mono hover:border-neutral-300 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>IMG (PNG)</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="py-3 px-2 rounded-xl border border-border-subtle bg-white hover:bg-neutral-50 text-neutral-700 flex flex-col items-center gap-1.5 text-[10px] font-mono hover:border-neutral-300 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>DNA (JSON)</span>
            </button>
          </div>

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
