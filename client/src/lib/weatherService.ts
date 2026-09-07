/* Weather Service — OpenWeatherMap integration with graceful fallback.
 * Uses VITE_OPENWEATHER_API_KEY. If absent or request fails, returns null so
 * the SIH Demo Bar can drive simulated alerts instead.
 */

import { useEffect, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type WeatherSeverity = "none" | "minor" | "moderate" | "severe" | "extreme";

export interface WeatherData {
  temp: number;          // °C
  feelsLike: number;     // °C
  description: string;
  conditionCode: number; // OWM weather condition code
  icon: string;
  rain1h: number;        // mm in last hour (0 if not raining)
  windSpeed: number;     // m/s
  humidity: number;      // %
  visibility: number;    // metres
  dt: number;            // unix timestamp
  cityName: string;
}

export interface WeatherAlert {
  severity: WeatherSeverity;
  headline: string;
  description: string;
  affectedRadius: string; // e.g. "2–5 km radius"
  timestamp: string;
}

export interface WeatherMonitorState {
  weather: WeatherData | null;
  severity: WeatherSeverity;
  alert: WeatherAlert | null;
  loading: boolean;
  lastFetched: Date | null;
  error: string | null;
}

// ── OWM condition-code → severity mapping ────────────────────────────────────

/** Returns severity based on OWM condition codes and precipitation data. */
export function classifyWeatherSeverity(data: WeatherData): WeatherSeverity {
  const { conditionCode, rain1h, windSpeed } = data;

  // Tornado / squall
  if (conditionCode === 781 || conditionCode === 900) return "extreme";

  // Violent thunderstorm / tropical storm / hurricane-class
  if ([202, 212, 221, 230, 902, 960, 961, 902].includes(conditionCode)) return "extreme";

  // Heavy thunderstorm / heavy rain (>20 mm/h) / blizzard / sandstorm
  if (
    [201, 211, 302, 312, 314, 321, 502, 503, 504, 511, 622, 701, 741, 751, 761, 762, 771].includes(conditionCode) ||
    rain1h > 20
  )
    return "severe";

  // Moderate thunderstorm / moderate rain (>5 mm/h) / freezing rain / heavy snow
  if (
    [200, 210, 230, 231, 232, 301, 311, 313, 501, 520, 521, 522, 531, 601, 602, 611, 612, 613, 615, 616, 621].includes(
      conditionCode
    ) ||
    rain1h > 5 ||
    windSpeed > 15
  )
    return "moderate";

  // Light rain / drizzle / mist / fog
  if ([300, 310, 500, 520, 600, 731, 801, 802].includes(conditionCode) || rain1h > 0.5)
    return "minor";

  return "none";
}

/** Builds a structured alert object from weather data + severity. */
export function buildWeatherAlert(data: WeatherData, severity: WeatherSeverity): WeatherAlert | null {
  if (severity === "none") return null;

  const headlines: Record<WeatherSeverity, string> = {
    none: "",
    minor: "Weather Advisory: Light Conditions",
    moderate: "WEATHER WARNING: Moderate Hazard Conditions",
    severe: "SEVERE WEATHER ALERT: High-Risk Conditions Active",
    extreme: "EXTREME WEATHER EMERGENCY: Evacuate to Safe Zones",
  };

  const descriptions: Record<WeatherSeverity, string> = {
    none: "",
    minor: `Mild weather conditions detected (${data.description}). Carry rain protection.`,
    moderate: `Moderate hazard detected: ${data.description}. Rainfall ${data.rain1h}mm/h, wind ${Math.round(data.windSpeed * 3.6)} km/h. Stay in covered areas.`,
    severe: `Severe conditions: ${data.description}. Heavy rainfall ${data.rain1h}mm/h. Visibility reduced to ${(data.visibility / 1000).toFixed(1)} km. Move to shelters immediately.`,
    extreme: `CRITICAL: ${data.description}. Extreme conditions pose immediate risk to life. Proceed to nearest designated emergency shelter NOW.`,
  };

  const radii: Record<WeatherSeverity, string> = {
    none: "",
    minor: "Local area",
    moderate: "1–3 km radius",
    severe: "2–8 km radius",
    extreme: "10+ km radius",
  };

  return {
    severity,
    headline: headlines[severity],
    description: descriptions[severity],
    affectedRadius: radii[severity],
    timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ── Fetch helper ─────────────────────────────────────────────────────────────

const OWM_BASE = "https://api.openweathermap.org/data/2.5";

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
  const key =
    (import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined) ||
    "c7f23af0fcad1bcd9fe229260be54594";
  if (!key || key.trim() === "") return null;

  try {
    const res = await fetch(
      `${OWM_BASE}/weather?lat=${lat}&lon=${lng}&appid=${key}&units=metric&lang=en`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const d = await res.json();

    return {
      temp: Math.round(d.main?.temp ?? 0),
      feelsLike: Math.round(d.main?.feels_like ?? 0),
      description: d.weather?.[0]?.description ?? "Unknown",
      conditionCode: d.weather?.[0]?.id ?? 800,
      icon: d.weather?.[0]?.icon ?? "01d",
      rain1h: d.rain?.["1h"] ?? 0,
      windSpeed: d.wind?.speed ?? 0,
      humidity: d.main?.humidity ?? 0,
      visibility: d.visibility ?? 10000,
      dt: d.dt ?? Date.now() / 1000,
      cityName: d.name ?? "Jaipur",
    };
  } catch {
    return null;
  }
}

// ── React Hook ───────────────────────────────────────────────────────────────

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Polls OpenWeatherMap every `intervalMs` milliseconds.
 * Returns null weather (and severity "none") when API key is absent.
 * Callers may override severity via the `demoSeverity` param for SIH demos.
 */
export function useWeatherMonitor(
  lat: number,
  lng: number,
  intervalMs = DEFAULT_INTERVAL_MS,
  demoSeverity?: WeatherSeverity
): WeatherMonitorState {
  const [state, setState] = useState<WeatherMonitorState>({
    weather: null,
    severity: "none",
    alert: null,
    loading: false,
    lastFetched: null,
    error: null,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function poll() {
    setState((s) => ({ ...s, loading: true, error: null }));
    const data = await fetchWeather(lat, lng);

    if (!data) {
      setState((s) => ({
        ...s,
        loading: false,
        weather: null,
        severity: demoSeverity ?? "none",
        alert: demoSeverity ? buildWeatherAlert(mockFallbackWeather, demoSeverity) : null,
        lastFetched: new Date(),
        error: null,
      }));
      return;
    }

    const severity = demoSeverity ?? classifyWeatherSeverity(data);
    const alert = buildWeatherAlert(data, severity);

    setState({
      weather: data,
      severity,
      alert,
      loading: false,
      lastFetched: new Date(),
      error: null,
    });
  }

  useEffect(() => {
    poll();
    timerRef.current = setInterval(poll, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, intervalMs, demoSeverity]);

  return state;
}

// ── Fallback demo weather object (used when API key is absent) ────────────────

export const mockFallbackWeather: WeatherData = {
  temp: 34,
  feelsLike: 38,
  description: "Thunderstorm with heavy rain",
  conditionCode: 202,
  icon: "11d",
  rain1h: 24,
  windSpeed: 18,
  humidity: 88,
  visibility: 1200,
  dt: Math.floor(Date.now() / 1000),
  cityName: "Jaipur",
};
