"use client";

import { useMemo } from "react";
import { GeometryEngine } from "@/engine/geometry/GeometryEngine";
import { ExportEngine } from "@/engine/export/ExportEngine";
import { ColorPalette } from "@/engine/sky/SkyEngine";

interface CommitCardProps {
  commitNumber: number;
  seed: string;
  footfalls: number;
  cadence: number;
  smoothness: number;
  entropy: number;
  rotation: number;
  solarPeriod: string;
  moonPhase: number;
  date: string;
  palette: ColorPalette;
  history: {
    cadence: number[];
    acceleration: number[];
    smoothness: number[];
    entropy: number[];
    rotation: number[];
  };
}

export function CommitCard({
  commitNumber,
  seed,
  footfalls,
  cadence,
  smoothness,
  entropy,
  rotation,
  solarPeriod,
  moonPhase,
  date,
  palette,
  history,
}: CommitCardProps) {
  
  // Rebuild geometry to generate the SVG string (useMemo to prevent re-generation)
  const svgString = useMemo(() => {
    const geom = new GeometryEngine();
    geom.setSeed(seed);
    
    // Re-populate historical footsteps to reconstruct identical visual coordinates
    geom.rebuildFromHistory(
      footfalls,
      history.cadence,
      history.acceleration,
      history.smoothness,
      history.entropy
    );

    const geomState = geom.getGeometryState(footfalls, rotation);
    return ExportEngine.generateSVG(geomState, palette);
  }, [seed, footfalls, rotation, history, palette]);

  // Formatter for specimen number
  const formattedCommitNumber = `MC-${commitNumber.toString().padStart(4, "0")}`;

  return (
    <div className="w-full max-w-sm border border-border-subtle bg-white rounded-[24px] p-8 shadow-sm flex flex-col items-center">
      {/* Specimen Header */}
      <div className="w-full flex justify-between items-baseline mb-6 font-mono">
        <span className="text-[10px] text-neutral-400 uppercase tracking-widest">MANDALA SPECIMEN</span>
        <span className="text-sm font-bold text-neutral-800">{formattedCommitNumber}</span>
      </div>

      {/* Centered Mandala vector illustration */}
      <div 
        className="w-full aspect-square bg-[#FAFAF8] rounded-[16px] border border-neutral-100 overflow-hidden flex items-center justify-center p-2 mb-6"
        dangerouslySetInnerHTML={{ __html: svgString }}
      />

      {/* Monospace display plate details */}
      <div className="w-full border-t border-dashed border-neutral-200 pt-5 text-left">
        <table className="w-full font-mono text-[11px] text-neutral-500 space-y-1">
          <tbody>
            <tr>
              <td className="text-neutral-400 py-1 font-semibold">GENERATOR</td>
              <td className="text-neutral-800 text-right py-1">Phyllotaxis (Golden Angle)</td>
            </tr>
            <tr>
              <td className="text-neutral-400 py-1 font-semibold">SEED HASH</td>
              <td className="text-neutral-800 text-right py-1 tracking-wider uppercase">{seed.substring(0, 8)}</td>
            </tr>
            <tr>
              <td className="text-neutral-400 py-1 font-semibold">FOOTFALLS</td>
              <td className="text-neutral-900 text-right py-1 font-bold">{footfalls} steps</td>
            </tr>
            <tr>
              <td className="text-neutral-400 py-1 font-semibold">AVG CADENCE</td>
              <td className="text-neutral-800 text-right py-1">{cadence} BPM</td>
            </tr>
            <tr>
              <td className="text-neutral-400 py-1 font-semibold">GAIT SMOOTHNESS</td>
              <td className="text-neutral-800 text-right py-1">{(smoothness * 100).toFixed(0)}%</td>
            </tr>
            <tr>
              <td className="text-neutral-400 py-1 font-semibold">ENTROPY VARIANCE</td>
              <td className="text-neutral-800 text-right py-1">{entropy.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="text-neutral-400 py-1 font-semibold">ATMOSPHERE</td>
              <td className="text-nature-forest text-right py-1 uppercase font-bold">{solarPeriod}</td>
            </tr>
            <tr>
              <td className="text-neutral-400 py-1 font-semibold">MOON PHASE</td>
              <td className="text-neutral-800 text-right py-1">{(moonPhase * 100).toFixed(0)}% (Fullness)</td>
            </tr>
            <tr>
              <td className="text-neutral-400 py-1 font-semibold">DATE RECORDED</td>
              <td className="text-neutral-800 text-right py-1">{date}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Specimen Footer */}
      <div className="w-full text-center border-t border-neutral-100 mt-5 pt-3">
        <span className="font-mono text-[9px] text-neutral-400">GLYPH SPECIMEN PLATE • HACKATHON v1.0</span>
      </div>
    </div>
  );
}
