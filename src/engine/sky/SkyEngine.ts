import * as SunCalc from "suncalc";

export interface ColorPalette {
  name: string;
  accent: string;        // Main math line/dot color
  secondary: string;     // Supporting details/rings
  background: string;    // Canvas clean paper bg color
  ambientGlow: string;   // Glowing aura shader uniform color
}

export interface SkyState {
  sunAltitude: number;    // In degrees
  moonPhase: number;      // 0.0 to 1.0 (0: New, 0.5: Full)
  solarPeriod: "goldenHour" | "blueHour" | "day" | "night";
  palette: ColorPalette;
}

export class SkyEngine {
  // Default coordinates (approx. Greenwich Meridian) if geolocation is denied
  private defaultLat = 51.5074;
  private defaultLng = -0.1278;

  constructor() {}

  /**
   * Calculates the current sky state and returns a matching color palette.
   */
  public getSkyState(
    date: Date,
    lat?: number,
    lng?: number
  ): SkyState {
    const latitude = lat ?? this.defaultLat;
    const longitude = lng ?? this.defaultLng;

    // 1. Calculate Sun Position
    const sunPos = SunCalc.getPosition(date, latitude, longitude);
    const sunAltitudeDegrees = (sunPos.altitude * 180) / Math.PI;

    // 2. Classify Solar Period based on Sun Elevation
    // Golden Hour: -4 to +6 degrees (civil twilight to early sun rise/set)
    // Blue Hour: -6 to -4 degrees (nautical twilight)
    // Day: > 6 degrees
    // Night: < -6 degrees
    let period: "goldenHour" | "blueHour" | "day" | "night" = "day";

    if (sunAltitudeDegrees >= -4 && sunAltitudeDegrees <= 6) {
      period = "goldenHour";
    } else if (sunAltitudeDegrees >= -6 && sunAltitudeDegrees < -4) {
      period = "blueHour";
    } else if (sunAltitudeDegrees < -6) {
      period = "night";
    } else {
      period = "day";
    }

    // 3. Calculate Moon Phase
    const moonIllum = SunCalc.getMoonIllumination(date);
    const moonPhase = moonIllum.phase; // 0.0 - 1.0

    // 4. Generate Palette from Period
    const palette = this.getPaletteForPeriod(period);

    return {
      sunAltitude: Number(sunAltitudeDegrees.toFixed(2)),
      moonPhase: Number(moonPhase.toFixed(2)),
      solarPeriod: period,
      palette,
    };
  }

  /**
   * Deterministic palette selection based on the solar period
   */
  private getPaletteForPeriod(period: "goldenHour" | "blueHour" | "day" | "night"): ColorPalette {
    switch (period) {
      case "goldenHour":
        return {
          name: "Golden Hour Specimen",
          accent: "#D4A937",       // Golden Amber
          secondary: "#8A8A8A",    // Slate grey
          background: "#FAFAF8",   // Ivory paper
          ambientGlow: "rgba(212, 169, 55, 0.08)", // Soft warm gold
        };
      case "blueHour":
        return {
          name: "Blue Hour Specimen",
          accent: "#7764D8",       // Lavender Violet
          secondary: "#36543B",    // Moss Green
          background: "#F5F7FA",   // Cool paper
          ambientGlow: "rgba(119, 100, 216, 0.08)", // Soft lavender mist
        };
      case "night":
        return {
          name: "Midnight Specimen",
          accent: "#1A2E40",       // Deep Indigo
          secondary: "#7764D8",    // Lavender
          background: "#F2F4F7",   // Slate paper
          ambientGlow: "rgba(26, 46, 64, 0.08)", // Dark aura
        };
      case "day":
      default:
        return {
          name: "Diurnal Specimen",
          accent: "#36543B",       // Forest/Moss Green
          secondary: "#D4A937",    // Golden ratio yellow
          background: "#FAFAF8",   // Warm paper
          ambientGlow: "rgba(54, 84, 59, 0.06)", // Soft chlorophyl green
        };
    }
  }
}
