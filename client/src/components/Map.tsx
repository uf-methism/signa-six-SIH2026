/**
 * High-Performance Interactive Map Engine
 * - Consumes global MapContext singleton (never re-loads the script)
 * - Automatic Graceful Fallback to Leaflet / OpenStreetMap
 * - Live Engine Status Indicator ("Google Maps Live" vs "Fallback Engine Active")
 * - Polyline directions & dynamic custom markers
 * - Animated skeleton loader while tiles render
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useMapContext } from "@/contexts/MapContext";

declare global {
  interface Window {
    google?: any;
    L?: any;
    __googleMapsLoadingPromise?: Promise<boolean>;
  }
}


export type MapMarkerData = {
  id: string;
  name: string;
  category?: string;
  type: "place" | "hospital" | "police" | "shelter" | "food" | "hazard" | "user";
  lat: number;
  lng: number;
  score?: number;
  bestTime?: string;
  signal?: string;
  description?: string;
  distance?: string;
  occupancy?: number;
  capacity?: number;
  severity?: "Low" | "Medium" | "Critical";
};

interface InteractiveMapProps {
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers: MapMarkerData[];
  selectedMarkerId?: string | null;
  onMarkerClick?: (marker: MapMarkerData) => void;
  routePath?: { lat: number; lng: number }[];
  routeMode?: "fastest" | "balanced" | "safety";
  showEngineBadge?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

export function InteractiveMap({
  className,
  center = { lat: 26.9124, lng: 75.7873 },
  zoom = 13,
  markers,
  selectedMarkerId,
  onMarkerClick,
  routePath,
  routeMode = "fastest",
  showEngineBadge = true,
  userLocation,
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Consume global engine from MapContext — never re-load scripts
  const { engine, isLoaded: contextLoaded } = useMapContext();

  // References for Google Maps
  const gMapRef = useRef<any>(null);
  const gMarkersRef = useRef<{ [id: string]: any }>({});
  const gPolylineRef = useRef<any>(null);

  // References for Leaflet
  const lMapRef = useRef<any>(null);
  const lMarkersRef = useRef<{ [id: string]: any }>({});
  const lPolylineRef = useRef<any>(null);

  // Initialize map instance once the global engine is ready
  useEffect(() => {
    if (!contextLoaded || !containerRef.current) return;
    if (isReady) return; // already initialized

    if (engine === "google" && window.google?.maps) {
      try {
        if (!gMapRef.current) {
          const map = new window.google.maps.Map(containerRef.current, {
            center: { lat: center.lat, lng: center.lng },
            zoom,
            mapId: "DEMO_MAP_ID",
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            styles: [
              { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
            ],
          });
          gMapRef.current = map;
        }
        setIsReady(true);
      } catch (err) {
        console.warn("[MapEngine] Google Maps instance init error:", err);
      }
    } else if (engine === "leaflet" && window.L) {
      if (!lMapRef.current) {
        containerRef.current.innerHTML = "";
        const map = window.L.map(containerRef.current, {
          center: [center.lat, center.lng],
          zoom,
          zoomControl: false,
        });
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: "abc",
          maxZoom: 19,
        }).addTo(map);
        window.L.control.zoom({ position: "topright" }).addTo(map);
        lMapRef.current = map;
      }
      setIsReady(true);
    }

    return () => {
      // Clean up map instances when component unmounts
      if (lMapRef.current) {
        try { lMapRef.current.remove(); } catch { }
        lMapRef.current = null;
      }
      if (gMapRef.current) {
        // Google Maps doesn't have a .destroy() — clear markers and nullify
        Object.values(gMarkersRef.current).forEach((m) => { try { m.setMap(null); } catch { } });
        gMarkersRef.current = {};
        gMapRef.current = null;
      }
      setIsReady(false);
    };
    // Only re-run when the global engine becomes available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, contextLoaded]);

  // Center update
  useEffect(() => {
    if (!isReady || !center) return;
    if (engine === "google" && gMapRef.current) {
      gMapRef.current.panTo({ lat: center.lat, lng: center.lng });
    } else if (engine === "leaflet" && lMapRef.current) {
      lMapRef.current.setView([center.lat, center.lng], zoom, { animate: true });
    }
  }, [center.lat, center.lng, zoom, engine, isReady]);

  // Marker Color & Icon Helper
  const getMarkerStyling = useCallback(
    (item: MapMarkerData, isSelected: boolean) => {
      let bg = "#0c7c74"; // Teal
      let text = "white";
      let iconContent = item.score ? `${item.score}` : "★";

      if (item.type === "user") {
        bg = "#2563eb"; // Pulsing Blue
        text = "white";
        iconContent = "📍";
      } else if (item.type === "shelter") {
        bg = "#10b981"; // Emerald green
        text = "white";
        iconContent = "🛡";
      } else if (item.type === "hazard") {
        bg = "#ef4444"; // Red alert
        text = "white";
        iconContent = "⚠";
      } else if (item.type === "hospital") {
        bg = "#dc2626";
        text = "white";
        iconContent = "+";
      } else if (item.type === "police") {
        bg = "#1e3a8a";
        text = "white";
        iconContent = "👮";
      } else if (item.type === "food") {
        bg = "#ea580c";
        text = "white";
        iconContent = "☕";
      } else if (item.category?.includes("HIDDEN")) {
        bg = "#0d9488";
        iconContent = "💎";
      }

      return { bg, text, iconContent };
    },
    []
  );

  // Render Markers for Google Maps or Leaflet
  useEffect(() => {
    if (!isReady) return;

    // Combine prop markers with User Location if provided
    const allRenderMarkers = [...markers];
    if (userLocation && !allRenderMarkers.some((m) => m.id === "user-gps-pin")) {
      allRenderMarkers.unshift({
        id: "user-gps-pin",
        name: "Your Current Location",
        type: "user",
        lat: userLocation.lat,
        lng: userLocation.lng,
        signal: "Live GPS Fix",
        description: "You are currently here.",
      });
    }

    if (engine === "google" && gMapRef.current && window.google?.maps) {
      // Clear old google markers
      Object.values(gMarkersRef.current).forEach((m) => m.setMap(null));
      gMarkersRef.current = {};

      allRenderMarkers.forEach((item) => {
        const isSelected = selectedMarkerId === item.id;
        const { bg, text, iconContent } = getMarkerStyling(item, isSelected);

        const markerSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 44 : 36}" height="${isSelected ? 44 : 36
          }" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="${bg}" stroke="#ffffff" stroke-width="3"/>
            <text x="18" y="22" fill="${text}" font-size="${iconContent.length > 2 ? "10" : "13"
          }" font-family="system-ui, sans-serif" font-weight="bold" text-anchor="middle">${iconContent}</text>
          </svg>
        `;

        const marker = new window.google.maps.Marker({
          position: { lat: item.lat, lng: item.lng },
          map: gMapRef.current,
          title: item.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg)}`,
            scaledSize: new window.google.maps.Size(isSelected ? 44 : 36, isSelected ? 44 : 36),
            anchor: new window.google.maps.Point(isSelected ? 22 : 18, isSelected ? 22 : 18),
          },
          zIndex: item.type === "user" ? 999 : isSelected ? 500 : 100,
        });

        marker.addListener("click", () => {
          if (onMarkerClick) onMarkerClick(item);
        });

        gMarkersRef.current[item.id] = marker;
      });
    } else if (engine === "leaflet" && lMapRef.current && window.L) {
      // Clear old leaflet markers
      Object.values(lMarkersRef.current).forEach((m) => m.remove());
      lMarkersRef.current = {};

      allRenderMarkers.forEach((item) => {
        const isSelected = selectedMarkerId === item.id;
        const { bg, text, iconContent } = getMarkerStyling(item, isSelected);

        const customIcon = window.L.divIcon({
          className: "custom-map-pin",
          html: `
            <div style="
              background: ${bg};
              color: ${text};
              width: ${isSelected ? "44px" : "36px"};
              height: ${isSelected ? "44px" : "36px"};
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 14px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: ${iconContent.length > 2 ? "10px" : "12px"};
              cursor: pointer;
              transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
              transform: ${isSelected ? "scale(1.18)" : "scale(1)"};
              ${item.type === "user" ? "box-shadow: 0 0 0 6px rgba(37,99,235,0.3);" : ""}
            ">
              ${iconContent}
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = window.L.marker([item.lat, item.lng], {
          icon: customIcon,
          zIndexOffset: item.type === "user" ? 1000 : isSelected ? 500 : 100,
        }).addTo(lMapRef.current);

        marker.on("click", () => {
          if (onMarkerClick) onMarkerClick(item);
        });

        lMarkersRef.current[item.id] = marker;
      });
    }
  }, [markers, selectedMarkerId, engine, isReady, userLocation, onMarkerClick, getMarkerStyling]);

  // Render Routes and Polylines
  useEffect(() => {
    if (!isReady) return;

    const routeColor =
      routeMode === "safety"
        ? "#10b981" // Emerald safe route
        : routeMode === "balanced"
          ? "#f59e0b" // Amber balanced
          : "#0c7c74"; // Teal fastest

    if (engine === "google" && gMapRef.current && window.google?.maps) {
      if (gPolylineRef.current) {
        gPolylineRef.current.setMap(null);
        gPolylineRef.current = null;
      }

      if (routePath && routePath.length > 1) {
        const polyline = new window.google.maps.Polyline({
          path: routePath.map((p) => ({ lat: p.lat, lng: p.lng })),
          geodesic: true,
          strokeColor: routeColor,
          strokeOpacity: 0.9,
          strokeWeight: 5,
        });

        polyline.setMap(gMapRef.current);
        gPolylineRef.current = polyline;

        const bounds = new window.google.maps.LatLngBounds();
        routePath.forEach((p) => bounds.extend(new window.google.maps.LatLng(p.lat, p.lng)));
        gMapRef.current.fitBounds(bounds, 60);
      }
    } else if (engine === "leaflet" && lMapRef.current && window.L) {
      if (lPolylineRef.current) {
        lPolylineRef.current.remove();
        lPolylineRef.current = null;
      }

      if (routePath && routePath.length > 1) {
        const latLngs = routePath.map((p) => [p.lat, p.lng]);
        const polyline = window.L.polyline(latLngs, {
          color: routeColor,
          weight: 5,
          opacity: 0.88,
          dashArray: routeMode === "safety" ? "8, 6" : undefined,
        }).addTo(lMapRef.current);

        lPolylineRef.current = polyline;
        lMapRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }
    }
  }, [routePath, routeMode, engine, isReady]);

  return (
    <div className={cn("relative w-full h-full min-h-[420px] overflow-hidden rounded-2xl bg-[#0f1917]", className)}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Engine Status & Quality Badge */}
      {showEngineBadge && isReady && (
        <div className="absolute top-3 left-3 z-30 pointer-events-none">
          <div className="flex items-center gap-2 rounded-xl bg-black/75 px-3 py-1.5 text-[11px] font-bold text-white shadow-xl backdrop-blur-md border border-white/10">
            {engine === "google" ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-300">Google Maps Live</span>
                <span className="text-[9px] text-white/50">Geometry · Places</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
                </span>
                <span className="text-teal-300">GeoEngine Active</span>
                <span className="text-[9px] text-white/50">OSM Tiles · Vector</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1615]">
          {/* Shimmer grid tiles */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-px opacity-20 pointer-events-none">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="bg-teal-900/50 animate-pulse"
                style={{ animationDelay: `${(i * 80) % 700}ms` }}
              />
            ))}
          </div>
          {/* Status pill */}
          <div className="relative z-10 flex items-center gap-3 rounded-2xl bg-white/8 px-5 py-3 border border-white/10 shadow-2xl backdrop-blur-md">
            <span className="h-3 w-3 rounded-full bg-teal-400 animate-ping" />
            <span className="text-xs font-bold tracking-wide text-white/80">Loading Map Engine…</span>
          </div>
        </div>
      )}
    </div>
  );
}
