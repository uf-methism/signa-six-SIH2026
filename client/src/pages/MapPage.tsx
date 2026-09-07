/* Civic Calm style: interactive Google Maps & Safety Exploration Page with Route Builder */
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Clock3,
  Compass,
  ExternalLink,
  HeartHandshake,
  Hospital,
  Layers,
  MapPin,
  Navigation,
  Phone,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { InteractiveMap, type MapMarkerData } from "@/components/Map";
import { emergencyPlaces, places, type Place } from "@/lib/travelData";

type MapCategoryFilter = "All" | "Must Visit" | "Hidden Gems" | "Safety & Emergency" | "Food";
type RouteMode = "fastest" | "balanced" | "safety";

/* Route description constants */
const routeDescriptions: Record<RouteMode, { label: string; desc: string; icon: typeof Zap; color: string }> = {
  fastest: { label: "Fastest Route", desc: "Shortest travel time via main arterial roads", icon: Zap, color: "#0c7c74" },
  balanced: { label: "Balanced Route", desc: "Scenic heritage trail avoiding highway traffic", icon: Compass, color: "#f1bd58" },
  safety: { label: "Safety-Aware Route", desc: "Lit corridors, high footfall & emergency hub proximity", icon: ShieldCheck, color: "#c64b3f" },
};

/* Bézier curve generator for simulated smooth route paths */
function generateBezierPath(a: { lat: number; lng: number }, b: { lat: number; lng: number }, curve: number): { lat: number; lng: number }[] {
  const steps = 25;
  const midLat = (a.lat + b.lat) / 2 + curve;
  const midLng = (a.lng + b.lng) / 2 + curve * 0.8;
  const path: { lat: number; lng: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = (1 - t) ** 2 * a.lat + 2 * (1 - t) * t * midLat + t ** 2 * b.lat;
    const lng = (1 - t) ** 2 * a.lng + 2 * (1 - t) * t * midLng + t ** 2 * b.lng;
    path.push({ lat, lng });
  }
  return path;
}

function generateSafetyPath(a: { lat: number; lng: number }, b: { lat: number; lng: number }): { lat: number; lng: number }[] {
  const helpPoints = emergencyPlaces.filter(
    (e) => e.lat >= Math.min(a.lat, b.lat) - 0.03 && e.lat <= Math.max(a.lat, b.lat) + 0.03
  );
  const waypoints = helpPoints.length > 0 ? [helpPoints[0]] : [];
  const segments: { lat: number; lng: number }[] = [a];
  if (waypoints.length > 0) {
    segments.push({ lat: waypoints[0].lat, lng: waypoints[0].lng });
  }
  segments.push(b);

  const path: { lat: number; lng: number }[] = [];
  for (let s = 0; s < segments.length - 1; s++) {
    const sub = generateBezierPath(segments[s], segments[s + 1], 0.003);
    path.push(...(s === 0 ? sub : sub.slice(1)));
  }
  return path;
}

export default function MapPage() {
  const [filter, setFilter] = useState<MapCategoryFilter>("All");
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerData | null>(null);
  const [routePanelOpen, setRoutePanelOpen] = useState(false);
  const [routeMode, setRouteMode] = useState<RouteMode>("safety");
  const [origin, setOrigin] = useState("amber-fort");
  const [destination, setDestination] = useState("jal-mahal");

  // Format all points into unified map marker items
  const allMarkers: MapMarkerData[] = useMemo(() => {
    const list: MapMarkerData[] = [
      ...places.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        type: (p.bestFor?.includes("Food") || p.category === "LOCAL FAVORITE" && p.id.includes("lmb") ? "food" : "place") as MapMarkerData["type"],
        lat: p.lat,
        lng: p.lng,
        score: p.score,
        bestTime: p.signal,
        signal: p.signal,
        description: p.description,
      })),
      ...emergencyPlaces.map((e) => ({
        id: e.id,
        name: e.name,
        category: "Emergency Facility",
        type: e.type.toLowerCase() as "hospital" | "police" | "shelter",
        lat: e.lat,
        lng: e.lng,
        distance: e.distance,
        description: e.signal,
        signal: e.signal,
      })),
    ];
    return list;
  }, []);

  // Filtered markers based on active category
  const filteredMarkers = useMemo(() => {
    if (filter === "Must Visit") return allMarkers.filter((m) => m.category?.includes("POPULAR") || (m.score && m.score >= 90));
    if (filter === "Hidden Gems") return allMarkers.filter((m) => m.category?.includes("HIDDEN") || m.category?.includes("ALTERNATIVE"));
    if (filter === "Safety & Emergency") return allMarkers.filter((m) => ["hospital", "police", "shelter"].includes(m.type));
    if (filter === "Food") return allMarkers.filter((m) => m.type === "food" || m.id.includes("lmb") || m.id.includes("ramganj"));
    return allMarkers;
  }, [allMarkers, filter]);

  // Origin and destination coordinates
  const originCoord = useMemo(() => {
    const found = allMarkers.find((m) => m.id === origin);
    return found ? { lat: found.lat, lng: found.lng } : { lat: 26.9855, lng: 75.8513 };
  }, [allMarkers, origin]);

  const destCoord = useMemo(() => {
    const found = allMarkers.find((m) => m.id === destination);
    return found ? { lat: found.lat, lng: found.lng } : { lat: 26.9534, lng: 75.8462 };
  }, [allMarkers, destination]);

  // Simulated routing paths
  const currentRoutePath = useMemo(() => {
    if (!routePanelOpen) return undefined;
    if (routeMode === "safety") return generateSafetyPath(originCoord, destCoord);
    if (routeMode === "balanced") return generateBezierPath(originCoord, destCoord, -0.005);
    return generateBezierPath(originCoord, destCoord, 0.002);
  }, [routePanelOpen, routeMode, originCoord, destCoord]);

  // Distance calculation
  const routeDistance = useMemo(() => {
    const d = Math.sqrt((destCoord.lat - originCoord.lat) ** 2 + (destCoord.lng - originCoord.lng) ** 2) * 111;
    return d.toFixed(1);
  }, [originCoord, destCoord]);

  function handleStartDirections(marker: MapMarkerData) {
    setDestination(marker.id);
    setRoutePanelOpen(true);
    toast.success(`Route calculated to ${marker.name}!`, { icon: <Route size={16} /> });
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#FAF8F5] text-ink flex flex-col">
      {/* Top Header Bar */}
      <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-ink/10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="grid h-10 w-10 place-items-center rounded-xl bg-paper text-ink/70 hover:text-teal hover:bg-teal/10 transition"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold tracking-[-0.04em] flex items-center gap-2">
              <Compass className="text-teal" size={20} />
              Jaipur Explorer Map
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/45">Interactive Safety & Discovery Pins</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRoutePanelOpen(!routePanelOpen)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              routePanelOpen ? "bg-teal text-paper" : "bg-white text-ink/75 border border-ink/10 hover:border-teal"
            }`}
          >
            <Route size={14} />
            <span>Route Builder</span>
          </button>

          <Link
            href="/guides"
            className="hidden sm:inline-flex items-center gap-1 rounded-full border border-ink/10 bg-white px-3.5 py-1.5 text-xs font-bold text-ink/75 hover:border-teal hover:text-teal shadow-sm transition"
          >
            <Users size={14} className="text-teal" />
            <span>Local Guides</span>
          </Link>
        </div>
      </header>

      {/* Floating Category Filter Bar */}
      <div className="absolute top-16 inset-x-0 z-20 px-4 py-2 pointer-events-none flex justify-center">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/95 p-1.5 shadow-lg border border-ink/10 backdrop-blur-md overflow-x-auto max-w-full scrollbar-none">
          {(["All", "Must Visit", "Hidden Gems", "Safety & Emergency", "Food"] as MapCategoryFilter[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition duration-200 ${
                filter === cat ? "bg-ink text-paper shadow-sm" : "text-ink/65 hover:text-teal hover:bg-paper"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Viewport */}
      <div className="relative flex-1 w-full h-full pt-14">
        <InteractiveMap
          markers={filteredMarkers}
          selectedMarkerId={selectedMarker?.id}
          onMarkerClick={(m) => setSelectedMarker(m)}
          routePath={currentRoutePath}
          routeMode={routeMode}
          center={selectedMarker ? { lat: selectedMarker.lat, lng: selectedMarker.lng } : { lat: 26.9450, lng: 75.8200 }}
          zoom={13}
          className="w-full h-full rounded-none"
        />
      </div>

      {/* Marker Preview Drawer / Bottom Sheet */}
      {selectedMarker && (
        <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-enter">
          <div className="rounded-[24px] bg-white p-5 shadow-2xl border border-ink/10 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="rounded-full bg-[#f1bd58]/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-ink">
                  {selectedMarker.category || selectedMarker.type.toUpperCase()}
                </span>
                <h3 className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] truncate text-ink">
                  {selectedMarker.name}
                </h3>
              </div>

              {selectedMarker.score && (
                <div className="score-badge shrink-0">
                  <span>{selectedMarker.score}</span>
                  <small>score</small>
                </div>
              )}

              <button
                onClick={() => setSelectedMarker(null)}
                className="rounded-full bg-paper p-1 text-ink/40 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-2 text-xs leading-5 text-ink/65 line-clamp-2">{selectedMarker.description}</p>

            {selectedMarker.signal && (
              <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-teal/10 p-2.5 text-xs text-teal font-medium">
                <Sun size={14} className="shrink-0" />
                <span className="truncate">{selectedMarker.signal}</span>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-ink/8">
              <button
                onClick={() => handleStartDirections(selectedMarker)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-teal py-2.5 text-xs font-bold text-paper shadow hover:bg-teal/90 transition"
              >
                <Route size={14} /> Get Directions
              </button>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.lat},${selectedMarker.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-ink/12 bg-white py-2.5 text-xs font-bold text-ink/75 hover:border-teal hover:text-teal transition"
              >
                <ExternalLink size={14} /> Native Maps
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Route Builder Overlay Panel */}
      {routePanelOpen && (
        <div className="absolute top-16 left-4 z-40 w-full max-w-sm rounded-[26px] bg-white p-5 shadow-2xl border border-ink/10 backdrop-blur-xl animate-enter">
          <div className="flex items-center justify-between border-b border-ink/8 pb-3">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <Route className="text-teal" size={18} />
              <span>Route Builder</span>
            </div>
            <button onClick={() => setRoutePanelOpen(false)} className="rounded-full p-1 text-ink/40 hover:text-ink">
              <X size={16} />
            </button>
          </div>

          {/* Start & Destination Selectors */}
          <div className="mt-4 space-y-2.5 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-ink/45 mb-1">Start Location</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full rounded-xl border border-ink/12 bg-paper p-2.5 font-semibold text-ink outline-none cursor-pointer"
              >
                {allMarkers.map((m) => (
                  <option key={m.id} value={m.id}>
                    📍 {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-ink/45 mb-1">Destination</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-xl border border-ink/12 bg-paper p-2.5 font-semibold text-ink outline-none cursor-pointer"
              >
                {allMarkers.map((m) => (
                  <option key={m.id} value={m.id}>
                    🎯 {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3 Route Mode Tabs */}
          <div className="mt-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink/45 mb-1.5">Route Mode</label>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-paper p-1 border border-ink/8">
              {(["safety", "fastest", "balanced"] as RouteMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setRouteMode(mode)}
                  className={`rounded-lg py-1.5 text-[11px] font-bold transition capitalize ${
                    routeMode === mode ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink"
                  }`}
                >
                  {mode === "safety" ? "🛡 Safety" : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Route Info Badge */}
          <div className="mt-4 rounded-2xl bg-paper p-3 border border-ink/8 text-xs leading-5">
            <div className="flex items-center justify-between font-bold">
              <span className="text-teal flex items-center gap-1">
                <Clock3 size={13} /> ~{Math.round(Number(routeDistance) * 3.5)} mins
              </span>
              <span className="font-mono text-ink/60">{routeDistance} km</span>
            </div>
            <p className="mt-1 text-[11px] text-ink/65 font-medium">{routeDescriptions[routeMode].desc}</p>
          </div>

          {/* Launch Native Turn-by-Turn navigation */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${originCoord.lat},${originCoord.lng}&destination=${destCoord.lat},${destCoord.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal py-3 text-xs font-bold text-paper shadow hover:bg-teal/90 transition"
          >
            <Navigation size={14} /> Launch Turn-by-Turn Navigation
          </a>
        </div>
      )}
    </div>
  );
}
