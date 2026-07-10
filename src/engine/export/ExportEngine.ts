"use client";

import { GeometryState } from "../geometry/GeometryEngine";
import { ColorPalette } from "../sky/SkyEngine";

export class ExportEngine {
  constructor() {}

  /**
   * Generates a fully responsive, printable vector SVG string representing the ENTIRE specimen card
   */
  public static generateSVG(
    geomState: GeometryState,
    palette: ColorPalette,
    options?: {
      title?: string;
      date?: string;
      footfalls?: number;
      duration?: string;
      distance?: string;
      arms?: number;
      points?: number;
      commitNumber?: number;
    }
  ): string {
    const size = 375; // Card width
    const height = 600; // Card height
    const cx = size / 2;
    const cy = 230; // Mandala center
    const R = size * 0.43; // Mandala radius

    const PHI = (1 + Math.sqrt(5)) / 2;
    const GOLDEN_ANGLE = 2 * Math.PI * (2 - PHI);

    const DARK_GREEN = "#0A3323";
    const MOSS_GREEN = "#839958";
    const BEIGE = "#f8f6e9";
    const ROSY_BROWN = "#D3968C";
    const MIDNIGHT_GREEN = "#105666";
    const SOFT_PINK = "#E2959D";

    const customPalette = {
      background: BEIGE,
      accent: DARK_GREEN,
      secondary: MOSS_GREEN,
      rosyBrown: ROSY_BROWN,
      midnightGreen: MIDNIGHT_GREEN
    };

    // Helper to convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
      let r = 10, g = 51, b = 35;
      const h = hex.replace("#", "");
      if (h.length === 6) {
        r = parseInt(h.substring(0, 2), 16);
        g = parseInt(h.substring(2, 4), 16);
        b = parseInt(h.substring(4, 6), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

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

    // Extract dynamic options with fallbacks matching standard specs
    const title = options?.title || "Morning Walk";
    const date = options?.date || new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const footfallsVal = options?.footfalls !== undefined ? options.footfalls.toLocaleString() : "86";
    const durationVal = options?.duration || "1 min";
    const distanceVal = options?.distance || "0.1 km";
    const armsCount = options?.arms !== undefined ? options.arms : 3;
    const pointsCount = options?.points !== undefined ? options.points : 722;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${height}" width="${size}" height="${height}">\n`;
    svg += `  <defs>\n`;
    svg += `    <pattern id="dot-grid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">\n`;
    svg += `      <circle cx="1" cy="1" r="1" fill="#dfddd0" />\n`;
    svg += `    </pattern>\n`;
    svg += `    <style type="text/css">\n`;
    svg += `      @font-face {\n`;
    svg += `        font-family: 'Lastik';\n`;
    svg += `        src: local('Lastik'), local('Lastik-Regular');\n`;
    svg += `      }\n`;
    svg += `      text {\n`;
    svg += `        font-family: 'Lastik', 'Georgia', 'Times New Roman', serif;\n`;
    svg += `      }\n`;
    svg += `    </style>\n`;
    svg += `  </defs>\n`;

    // ── Card container background ──
    svg += `  <rect width="${size}" height="${height}" rx="26" fill="${customPalette.background}" stroke="${hexToRgba(DARK_GREEN, 0.12)}" stroke-width="1.5" />\n`;
    svg += `  <rect width="${size}" height="${height}" rx="26" fill="url(#dot-grid)" />\n`;

    // ── Top Header ──
    svg += `  <g>\n`;
    svg += `    <circle cx="28" cy="30" r="4" fill="${customPalette.secondary}" />\n`;
    svg += `    <text x="39" y="34" font-size="15" fill="${customPalette.accent}">glyph</text>\n`;
    svg += `  </g>\n`;

    // ── Middle Mandala Artwork (g transform translate cx, cy) ──
    const rotationDeg = (geomState.rotation * 180) / Math.PI;
    svg += `  <g transform="translate(${cx}, ${cy}) rotate(${rotationDeg.toFixed(3)})">\n`;

    // Guidelines (24)
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const x2 = R * 1.16 * Math.cos(a);
      const y2 = R * 1.16 * Math.sin(a);
      svg += `    <line x1="0" y1="0" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${customPalette.secondary}" stroke-width="0.6" opacity="0.12" />\n`;
    }

    // Outer Boundary Circle
    svg += `    <circle cx="0" cy="0" r="${(R * 1.09).toFixed(2)}" fill="none" stroke="${customPalette.secondary}" stroke-width="0.95" opacity="0.28" />\n`;

    // Instrument ticks (72)
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

    // Concentric circles (8)
    for (let i = 0; i <= 8; i++) {
      const r = R * Math.pow(1 / PHI, i);
      const opacity = (0.08 + (8 - i) * 0.038).toFixed(3);
      svg += `    <circle cx="0" cy="0" r="${r.toFixed(2)}" fill="none" stroke="${customPalette.midnightGreen}" stroke-width="0.8" opacity="${opacity}" />\n`;
    }

    // Polar roses
    svg += `    <path d="${getRosePath(R,          13/6, 6)}" fill="none" stroke="${customPalette.midnightGreen}" stroke-width="0.9" opacity="0.32" />\n`;
    svg += `    <path d="${getRosePath(R * 0.875,  7/4, 4)}" fill="none" stroke="${customPalette.secondary}" stroke-width="0.9" opacity="0.40" />\n`;
    svg += `    <path d="${getRosePath(R * 0.755,  5/3, 3)}" fill="none" stroke="${customPalette.rosyBrown}" stroke-width="1.0" opacity="0.52" />\n`;
    svg += `    <path d="${getRosePath(R * 0.62,   3/2, 2)}" fill="none" stroke="${customPalette.midnightGreen}" stroke-width="1.15" opacity="0.64" />\n`;
    svg += `    <path d="${getRosePath(R * 0.465,  5,   1)}" fill="none" stroke="${customPalette.secondary}" stroke-width="1.25" opacity="0.76" />\n`;
    svg += `    <path d="${getRosePath(R * 0.30,   3,   1)}" fill="none" stroke="${customPalette.rosyBrown}" stroke-width="1.35" opacity="0.85" />\n`;
    svg += `    <path d="${getRosePath(R * 0.17,   2,   1)}" fill="none" stroke="${customPalette.accent}" stroke-width="1.5" opacity="0.92" />\n`;

    // Spirographs
    svg += `    <path d="${getEpitrochoidPath(R * 0.68, R * 0.68 / 6, R * 0.68 / 6 * 1.12)}" fill="none" stroke="${customPalette.rosyBrown}" stroke-width="0.85" opacity="0.30" />\n`;
    svg += `    <path d="${getHypocycloidPath(R * 0.52, R * 0.52 / 7, R * 0.52 / 7 * 0.85)}" fill="none" stroke="${customPalette.midnightGreen}" stroke-width="0.8" opacity="0.25" />\n`;

    // Phyllotaxis
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

    // Center rings
    svg += `    <circle cx="0" cy="0" r="12" fill="none" stroke="${customPalette.accent}" stroke-width="0.8" opacity="0.25" />\n`;
    svg += `    <circle cx="0" cy="0" r="8" fill="none" stroke="${customPalette.accent}" stroke-width="0.8" opacity="0.40" />\n`;
    svg += `    <circle cx="0" cy="0" r="5" fill="none" stroke="${customPalette.accent}" stroke-width="0.8" opacity="0.55" />\n`;
    svg += `    <circle cx="0" cy="0" r="2.8" fill="${customPalette.rosyBrown}" />\n`;

    svg += `  </g>\n`;

    // ── Walk Title & Date ──
    svg += `  <text x="24" y="445" font-size="32" fill="${customPalette.accent}" font-weight="normal">${title}</text>\n`;
    svg += `  <text x="24" y="465" font-size="11" fill="${customPalette.midnightGreen}" letter-spacing="0.06" text-transform="uppercase">${date}</text>\n`;

    // Divider Line
    svg += `  <line x1="24" y1="482" x2="351" y2="482" stroke="${hexToRgba(DARK_GREEN, 0.12)}" stroke-width="1" />\n`;

    // ── Stats Block ──
    svg += `  <g>\n`;
    // Column 1: Footfalls
    svg += `    <text x="24" y="508" font-size="20" fill="${customPalette.accent}">${footfallsVal}</text>\n`;
    svg += `    <text x="24" y="522" font-size="9" fill="${hexToRgba(MIDNIGHT_GREEN, 0.65)}" letter-spacing="0.15" text-transform="uppercase">footfalls</text>\n`;
    // Column 2: Duration
    svg += `    <text x="145" y="508" font-size="20" fill="${customPalette.accent}">${durationVal}</text>\n`;
    svg += `    <text x="145" y="522" font-size="9" fill="${hexToRgba(MIDNIGHT_GREEN, 0.65)}" letter-spacing="0.15" text-transform="uppercase">duration</text>\n`;
    // Column 3: Distance
    svg += `    <text x="260" y="508" font-size="20" fill="${customPalette.accent}">${distanceVal}</text>\n`;
    svg += `    <text x="260" y="522" font-size="9" fill="${hexToRgba(MIDNIGHT_GREEN, 0.65)}" letter-spacing="0.15" text-transform="uppercase">distance</text>\n`;
    svg += `  </g>\n`;

    // ── Mathematical Signature Bar ──
    svg += `  <g>\n`;
    svg += `    <rect x="24" y="538" width="327" height="34" rx="10" fill="rgba(10, 51, 35, 0.02)" stroke="rgba(10, 51, 35, 0.12)" stroke-width="1" />\n`;
    svg += `    <text x="38" y="559" font-size="10.5" fill="${customPalette.secondary}">φ = 1.618</text>\n`;
    svg += `    <line x1="120" y1="548" x2="120" y2="562" stroke="rgba(10, 51, 35, 0.12)" stroke-width="1" />\n`;
    svg += `    <text x="135" y="559" font-size="10.5" fill="${customPalette.midnightGreen}">${armsCount} arms</text>\n`;
    svg += `    <line x1="240" y1="548" x2="240" y2="562" stroke="rgba(10, 51, 35, 0.12)" stroke-width="1" />\n`;
    svg += `    <text x="255" y="559" font-size="10.5" fill="${customPalette.rosyBrown}">${pointsCount} points</text>\n`;
    svg += `  </g>\n`;

    // ── Footer ──
    svg += `  <g>\n`;
    svg += `    <text x="24" y="588" font-size="10.5" fill="${customPalette.accent}" letter-spacing="0.04">Commit to touching grass.</text>\n`;
    svg += `    <text x="348" y="588" font-size="10" fill="${hexToRgba(MIDNIGHT_GREEN, 0.65)}" text-anchor="end">glyph</text>\n`;
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
    filename: string,
    options?: {
      title?: string;
      date?: string;
      footfalls?: number;
      duration?: string;
      distance?: string;
      arms?: number;
      points?: number;
      commitNumber?: number;
    }
  ): void {
    if (typeof window === "undefined") return;

    const svgContent = this.generateSVG(geomState, palette, options);
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
