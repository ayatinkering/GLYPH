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
    const S = geomState.arms;
    const points = geomState.points;
    const size = 600; // Unified output canvas size
    const cx = size / 2;
    const cy = size / 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%">\n`;
    svg += `  <style>\n`;
    svg += `    .bg { fill: ${palette.background}; }\n`;
    svg += `    .accent-line { stroke: ${palette.accent}; stroke-width: 1.2; fill: none; opacity: 0.18; stroke-linecap: round; stroke-linejoin: round; }\n`;
    svg += `    .accent-dot { fill: ${palette.accent}; }\n`;
    svg += `    .grid-line { stroke: #E8E8E6; stroke-width: 0.75; fill: none; stroke-dasharray: 2 4; }\n`;
    svg += `    .seed-dot { fill: ${palette.accent}; opacity: 0.5; }\n`;
    svg += `  </style>\n`;

    // 1. Background paper sheet
    svg += `  <rect width="${size}" height="${size}" class="bg" />\n`;

    // 2. Guidelines (Scientific instrumentation lines)
    svg += `  <line x1="0" y1="${cy}" x2="${size}" y2="${cy}" class="grid-line" />\n`;
    svg += `  <line x1="${cx}" y1="0" x2="${cx}" y2="${size}" class="grid-line" />\n`;
    svg += `  <circle cx="${cx}" cy="${cy}" r="${size * 0.1}" class="grid-line" />\n`;
    svg += `  <circle cx="${cx}" cy="${cy}" r="${size * 0.2}" class="grid-line" />\n`;
    svg += `  <circle cx="${cx}" cy="${cy}" r="${size * 0.3}" class="grid-line" />\n`;

    // 3. Central starting point
    svg += `  <circle cx="${cx}" cy="${cy}" r="3" class="seed-dot" />\n`;

    // 4. Mathematical Mandala group (with global turning rotation)
    const rotationDeg = (geomState.rotation * 180) / Math.PI;
    svg += `  <g transform="translate(${cx}, ${cy}) rotate(${rotationDeg.toFixed(3)})">\n`;

    // Repeat geometry across symmetry arms
    for (let s = 0; s < S; s++) {
      const armAngleDeg = (s * 360) / S;
      svg += `    <g transform="rotate(${armAngleDeg.toFixed(3)})">\n`;

      // Draw vector lines connecting the nodes
      if (points.length > 0) {
        let pathD = "";
        for (let i = 0; i < points.length; i++) {
          const pt = points[i];
          const curveX = pt.x + Math.sin(pt.index) * pt.smoothnessOffset;
          const curveY = pt.y + Math.cos(pt.index) * pt.smoothnessOffset;
          
          if (i === 0) {
            pathD += `M ${curveX.toFixed(2)} ${curveY.toFixed(2)}`;
          } else {
            pathD += ` L ${curveX.toFixed(2)} ${curveY.toFixed(2)}`;
          }
        }
        svg += `      <path d="${pathD}" class="accent-line" />\n`;
      }

      // Draw the circular nodes
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const radiusVal = (pt.weight * 1.5).toFixed(2);
        svg += `      <circle cx="${pt.x.toFixed(2)}" cy="${pt.y.toFixed(2)}" r="${radiusVal}" class="accent-dot" />\n`;
      }

      svg += `    </g>\n`;
    }

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
    
    // Clean up
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
