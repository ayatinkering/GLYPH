import { GeometryState } from "../geometry/GeometryEngine";
import { ColorPalette } from "../sky/SkyEngine";

export class ExportEngine {
  constructor() {}

  /**
   * Generates a fully responsive, printable vector SVG string from geometry and palette
   */
  public static generateSVG(
    geomState: GeometryState,
    palette: ColorPalette
  ): string {
    const size = 600; // Unified output canvas size
    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.40; // Max radius

    const PHI = (1 + Math.sqrt(5)) / 2;
    const GOLDEN_ANGLE = 2 * Math.PI * (2 - PHI);

    // Helpers to construct vector path commands
    const getRosePath = (maxR: number, k: number, rotations: number, steps: number = 1000) => {
      const total = Math.PI * 2 * rotations;
      let path = "";
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * total;
        const r = maxR * Math.cos(k * t);
        const x = r * Math.cos(t);
        const y = r * Math.sin(t);
        if (i === 0) {
          path += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
        } else {
          path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
        }
      }
      return path;
    };

    const getEpitrochoidPath = (Rr: number, rr: number, d: number, steps: number = 1000) => {
      const revs = Math.round(Rr / rr);
      const total = Math.PI * 2 * revs;
      let path = "";
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * total;
        const x = (Rr + rr) * Math.cos(t) - d * Math.cos(((Rr + rr) / rr) * t);
        const y = (Rr + rr) * Math.sin(t) - d * Math.sin(((Rr + rr) / rr) * t);
        if (i === 0) {
          path += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
        } else {
          path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
        }
      }
      return path;
    };

    const getHypocycloidPath = (Rr: number, rr: number, d: number, steps: number = 1000) => {
      const revs = Math.round(Rr / rr);
      const total = Math.PI * 2 * revs;
      let path = "";
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * total;
        const x = (Rr - rr) * Math.cos(t) + d * Math.cos(((Rr - rr) / rr) * t);
        const y = (Rr - rr) * Math.sin(t) - d * Math.sin(((Rr - rr) / rr) * t);
        if (i === 0) {
          path += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
        } else {
          path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
        }
      }
      return path;
    };

    const customPalette = {
      background: "#F7F4D5",     // Beige
      accent: "#0A3323",         // Dark green
      secondary: "#839958",      // Moss green
      rosyBrown: "#D3968C",      // Rosy brown
      midnightGreen: "#105666"   // Midnight green
    };

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%">\n`;
    svg += `  <rect width="${size}" height="${size}" fill="${customPalette.background}" />\n`;

    // Rotation transform
    const rotationDeg = (geomState.rotation * 180) / Math.PI;
    svg += `  <g transform="translate(${cx}, ${cy}) rotate(${rotationDeg.toFixed(3)})">\n`;

    // ── 1. Radial guide lines (24 guidelines) ────────────────────────────
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const x2 = R * 1.16 * Math.cos(a);
      const y2 = R * 1.16 * Math.sin(a);
      svg += `    <line x1="0" y1="0" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${customPalette.secondary}" stroke-width="0.6" opacity="0.12" />\n`;
    }

    // ── 2. Outer boundary circle ───────────────────────────────────────
    svg += `    <circle cx="0" cy="0" r="${(R * 1.09).toFixed(2)}" fill="none" stroke="${customPalette.secondary}" stroke-width="0.95" opacity="0.28" />\n`;

    // ── 3. Instrument tick marks (72 ticks) ─────────────────────────────
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const major = i % 6 === 0;
      const semi = i % 3 === 0;
      const r1 = R * (major ? 1.0 : semi ? 1.035 : 1.065);
      const r2 = R * 1.1;
      
      const x1 = r1 * Math.cos(a);
      const y1 = r1 * Math.sin(a);
      const x2 = r2 * Math.cos(a);
      const y2 = r2 * Math.sin(a);
      
      const opacity = major ? "0.7" : semi ? "0.4" : "0.18";
      const strokeW = major ? "1.25" : semi ? "0.8" : "0.5";
      svg += `    <line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${customPalette.accent}" stroke-width="${strokeW}" opacity="${opacity}" />\n`;
    }

    // ── 4. Golden-ratio concentric circles (8 circles) ──────────────────
    for (let i = 0; i <= 8; i++) {
      const r = R * Math.pow(1 / PHI, i);
      const opacity = (0.08 + (8 - i) * 0.038).toFixed(3);
      svg += `    <circle cx="0" cy="0" r="${r.toFixed(2)}" fill="none" stroke="${customPalette.midnightGreen}" stroke-width="0.8" opacity="${opacity}" />\n`;
    }

    // ── 5. Polar rose layers ───────────────────────────────────────────
    svg += `    <path d="${getRosePath(R, 13/6, 6)}" fill="none" stroke="${customPalette.midnightGreen}" stroke-width="0.9" opacity="0.32" />\n`;
    svg += `    <path d="${getRosePath(R * 0.875, 7/4, 4)}" fill="none" stroke="${customPalette.secondary}" stroke-width="0.9" opacity="0.40" />\n`;
    svg += `    <path d="${getRosePath(R * 0.755, 5/3, 3)}" fill="none" stroke="${customPalette.rosyBrown}" stroke-width="1.0" opacity="0.52" />\n`;
    svg += `    <path d="${getRosePath(R * 0.62, 3/2, 2)}" fill="none" stroke="${customPalette.midnightGreen}" stroke-width="1.15" opacity="0.64" />\n`;
    svg += `    <path d="${getRosePath(R * 0.465, 5, 1)}" fill="none" stroke="${customPalette.secondary}" stroke-width="1.25" opacity="0.76" />\n`;
    svg += `    <path d="${getRosePath(R * 0.30, 3, 1)}" fill="none" stroke="${customPalette.rosyBrown}" stroke-width="1.35" opacity="0.85" />\n`;
    svg += `    <path d="${getRosePath(R * 0.17, 2, 1)}" fill="none" stroke="${customPalette.accent}" stroke-width="1.5" opacity="0.92" />\n`;

    // ── 6. Spirographs (Epitrochoid & Hypocycloid) ──────────────────────
    svg += `    <path d="${getEpitrochoidPath(R * 0.68, R * 0.68 / 6, R * 0.68 / 6 * 1.12)}" fill="none" stroke="${customPalette.rosyBrown}" stroke-width="0.85" opacity="0.30" />\n`;
    svg += `    <path d="${getHypocycloidPath(R * 0.52, R * 0.52 / 7, R * 0.52 / 7 * 0.85)}" fill="none" stroke="${customPalette.midnightGreen}" stroke-width="0.8" opacity="0.25" />\n`;

    // ── 7. Fibonacci phyllotaxis constellation ─────────────────────────
    const dotR = R * 0.35;
    for (let i = 0; i < 233; i++) {
      const r = dotR * Math.sqrt(i / 233);
      const theta = i * GOLDEN_ANGLE;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const t = i / 233;
      const radiusVal = (0.45 + t * 0.95).toFixed(2);
      const opacity = (0.12 + t * 0.48).toFixed(3);
      svg += `    <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radiusVal}" fill="${customPalette.accent}" opacity="${opacity}" />\n`;
    }

    // ── 8. Centre ornamental rings ─────────────────────────────────────
    svg += `    <circle cx="0" cy="0" r="12" fill="none" stroke="${customPalette.accent}" stroke-width="0.8" opacity="0.25" />\n`;
    svg += `    <circle cx="0" cy="0" r="8" fill="none" stroke="${customPalette.accent}" stroke-width="0.8" opacity="0.40" />\n`;
    svg += `    <circle cx="0" cy="0" r="5" fill="none" stroke="${customPalette.accent}" stroke-width="0.8" opacity="0.55" />\n`;
    svg += `    <circle cx="0" cy="0" r="2.8" fill="${customPalette.rosyBrown}" />\n`;

    svg += `  </g>\n`;
    svg += `</svg>`;

    return svg;
  }

  /**
   * Triggers client-side browser download for a raw string as an SVG file
   */
  public static downloadSVGFile(
    geomState: GeometryState,
    palette: ColorPalette,
    filename: string
  ): void {
    if (typeof window === "undefined") return;

    const svgContent = this.generateSVG(geomState, palette);
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.svg`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Triggers client-side browser download for JSON metadata
   */
  public static downloadJSONFile(
    data: any,
    filename: string
  ): void {
    if (typeof window === "undefined") return;

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Triggers client-side browser download for a PNG image from an HTML5 Canvas node
   */
  public static downloadPNGFile(
    canvasElement: HTMLCanvasElement,
    filename: string
  ): void {
    if (typeof window === "undefined" || !canvasElement) return;

    const url = canvasElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
  }
}
