/**
 * MapContext.tsx — Global singleton Google Maps script loader.
 * Ensures the Maps API script is loaded ONCE at app startup and shared
 * across all pages/tabs without re-initialization or memory leaks.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type MapEngine = "google" | "leaflet" | "loading";

interface MapContextValue {
  engine: MapEngine;
  isLoaded: boolean;
}

const MapContext = createContext<MapContextValue>({ engine: "loading", isLoaded: false });

export function useMapContext() {
  return useContext(MapContext);
}

// Singleton promise lives on window so it survives React re-renders
function loadGoogleMapsOnce(apiKey: string): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.google?.maps) return Promise.resolve(true);
  if (window.__googleMapsLoadingPromise) return window.__googleMapsLoadingPromise;

  window.__googleMapsLoadingPromise = new Promise((resolve) => {
    if (!apiKey || apiKey.trim() === "") {
      resolve(false);
      return;
    }

    const scriptId = "google-maps-js-sdk";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      if (window.google?.maps) { resolve(true); return; }
      existing.addEventListener("load", () => resolve(!!window.google?.maps));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,geometry,drawing,visualization&loading=async`;
    script.async = true;
    script.defer = true;

    const timeout = setTimeout(() => resolve(false), 8000);
    script.onload = () => { clearTimeout(timeout); resolve(!!window.google?.maps); };
    script.onerror = () => { clearTimeout(timeout); resolve(false); };
    document.head.appendChild(script);
  });

  return window.__googleMapsLoadingPromise;
}

function loadLeafletOnce(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.L) return Promise.resolve(true);

  return new Promise((resolve) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export function MapProvider({ children }: { children: ReactNode }) {
  const [engine, setEngine] = useState<MapEngine>("loading");

  useEffect(() => {
    let mounted = true;

    const apiKey =
      (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
      (import.meta as any).env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "";

    async function init() {
      const googleOk = await loadGoogleMapsOnce(apiKey);
      if (!mounted) return;

      if (googleOk && window.google?.maps) {
        setEngine("google");
        return;
      }

      // Fallback: load Leaflet
      await loadLeafletOnce();
      if (!mounted) return;
      setEngine(window.L ? "leaflet" : "loading");
    }

    init();
    return () => { mounted = false; };
  }, []);

  return (
    <MapContext.Provider value={{ engine, isLoaded: engine !== "loading" }}>
      {children}
    </MapContext.Provider>
  );
}
