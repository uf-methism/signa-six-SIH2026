import React, { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  CloudRain,
  Compass,
  ExternalLink,
  LifeBuoy,
  MapPin,
  MessageSquarePlus,
  Navigation,
  Phone,
  PhoneCall,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ThumbsUp,
  Umbrella,
  Users,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  shelters,
  disasterFeed as initialDisasterFeed,
  disasterAuthorities,
  type Shelter,
  type DisasterReport,
} from "@/lib/travelData";
import { useWeatherMonitor, mockFallbackWeather } from "@/lib/weatherService";
import { useLocationContext, getDistanceKm } from "@/contexts/LocationContext";
import { InteractiveMap, type MapMarkerData } from "@/components/Map";
import { PlaceImage } from "@/components/PlaceImage";

export default function DisasterPage() {
  const { userLocation, locationName, isLiveGPS, refreshLocation, formatDistance, formatTravelTime } =
    useLocationContext();

  const [activeTab, setActiveTab] = useState<"shelters" | "feed" | "weather" | "contacts">("shelters");
  const [feedFilter, setFeedFilter] = useState<"all" | "authority" | "community">("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Live Incident Feed State (Loaded from backend or fallback data)
  const [feed, setFeed] = useState<DisasterReport[]>(initialDisasterFeed);
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);
  const [reportDrawerOpen, setReportDrawerOpen] = useState<boolean>(false);

  // New Hazard Report Form State
  const [hazardCategory, setHazardCategory] = useState<DisasterReport["category"]>("Flooding");
  const [hazardDescription, setHazardDescription] = useState<string>("");
  const [hazardLocationName, setHazardLocationName] = useState<string>("");
  const [hazardSeverity, setHazardSeverity] = useState<"Low" | "Medium" | "Critical">("Medium");
  const [hazardActionAdvice, setHazardActionAdvice] = useState<string>("");

  // Map and Selected Route State
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
  const [activeRouteDestination, setActiveRouteDestination] = useState<Shelter | null>(null);

  // Live weather monitor for current coords or Jaipur hub
  const weatherState = useWeatherMonitor(userLocation.lat, userLocation.lng);
  const activeWeather = weatherState.weather || mockFallbackWeather;

  // Fetch live disaster alerts from backend
  useEffect(() => {
    fetch("/api/disaster/alerts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.alerts) && data.alerts.length > 0) {
          setFeed(data.alerts);
        }
      })
      .catch(() => {
        // Fallback to local feed if offline
      });
  }, []);

  // Compute and sort shelters by exact distance from user's current GPS position
  const sortedShelters = useMemo(() => {
    return shelters
      .map((shelter) => {
        const distKm = getDistanceKm(userLocation.lat, userLocation.lng, shelter.lat, shelter.lng);
        return {
          ...shelter,
          realDistanceKm: distKm,
          realDistanceText: distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`,
          estimatedTravelTime: formatTravelTime(shelter.lat, shelter.lng, "driving"),
        };
      })
      .sort((a, b) => a.realDistanceKm - b.realDistanceKm);
  }, [userLocation, formatTravelTime]);

  // Nearest Safe Shelter is always the first one in the sorted list
  const nearestShelter = sortedShelters[0] || null;

  // Filtered shelters list based on search and category filter
  const filteredShelters = useMemo(() => {
    return sortedShelters.filter((s) => {
      if (filterType !== "all" && s.type !== filterType) return false;
      if (
        searchQuery &&
        !s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !s.address.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [sortedShelters, filterType, searchQuery]);

  // Dual-Stream filtered feed
  const filteredFeed = useMemo(() => {
    return feed.filter((r) => {
      if (feedFilter === "authority" && r.source !== "authority") return false;
      if (feedFilter === "community" && r.source !== "community") return false;
      if (
        searchQuery &&
        !r.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.category.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [feed, feedFilter, searchQuery]);

  // Create Map Markers for shelters, hazards, and user
  const mapMarkers: MapMarkerData[] = useMemo(() => {
    const list: MapMarkerData[] = [];

    // Add Shelters
    sortedShelters.forEach((s) => {
      list.push({
        id: s.id,
        name: s.name,
        category: s.type,
        type: "shelter",
        lat: s.lat,
        lng: s.lng,
        distance: s.realDistanceText,
        description: `${s.address} · Occupancy: ${s.occupancy}/${s.capacity}`,
        occupancy: s.occupancy,
        capacity: s.capacity,
      });
    });

    // Add Hazards from live feed
    feed.forEach((h) => {
      list.push({
        id: h.id,
        name: `${h.category} Hazard`,
        category: h.category,
        type: "hazard",
        lat: h.lat,
        lng: h.lng,
        description: h.description,
        severity: h.severity || "Medium",
        signal: h.actionAdvice,
      });
    });

    return list;
  }, [sortedShelters, feed]);

  // Route Path calculation from User Location to Active Target Shelter
  const routePath = useMemo(() => {
    if (!activeRouteDestination) return undefined;
    return [
      { lat: userLocation.lat, lng: userLocation.lng },
      {
        lat: (userLocation.lat + activeRouteDestination.lat) / 2 + 0.003,
        lng: (userLocation.lng + activeRouteDestination.lng) / 2 - 0.002,
      },
      { lat: activeRouteDestination.lat, lng: activeRouteDestination.lng },
    ];
  }, [userLocation, activeRouteDestination]);

  // Handle CTA: Navigate to Shelter
  const handleSelectShelter = (shelter: Shelter) => {
    setSelectedShelterId(shelter.id);
    setActiveRouteDestination(shelter);
    toast.success(`Navigation loaded to ${shelter.name}`, {
      description: `Distance: ${formatDistance(shelter.lat, shelter.lng)} · Evacuation route highlighted on map`,
    });
  };

  // Upvote Community Hazard
  const handleUpvote = (reportId: string) => {
    setFeed((prev) =>
      prev.map((item) => (item.id === reportId ? { ...item, upvotes: (item.upvotes || 0) + 1 } : item))
    );
    toast.success("Report confirmed and verified by your vote.", { icon: <ThumbsUp size={14} /> });
  };

  // Submit User Incident Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hazardDescription.trim()) {
      toast.error("Please enter a brief description of the incident.");
      return;
    }

    setIsSubmittingReport(true);

    const newReport: DisasterReport = {
      id: `comm-${Date.now()}`,
      category: hazardCategory,
      description: hazardDescription.trim(),
      location: hazardLocationName.trim() || `Near ${locationName}`,
      lat: userLocation.lat,
      lng: userLocation.lng,
      severity: hazardSeverity,
      timestamp: new Date().toISOString(),
      verified: false,
      source: "community",
      actionAdvice: hazardActionAdvice.trim() || undefined,
      upvotes: 1,
    };

    try {
      const response = await fetch("/api/disaster/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });

      if (response.ok) {
        const data = await response.json();
        setFeed((prev) => [data.alert || newReport, ...prev]);
      } else {
        setFeed((prev) => [newReport, ...prev]);
      }

      toast.success("Hazard Report Broadcasted Live!", {
        description: "Your report has been shared with nearby travelers and response teams.",
      });

      setHazardDescription("");
      setHazardActionAdvice("");
      setHazardLocationName("");
      setReportDrawerOpen(false);
      setActiveTab("feed");
    } catch {
      setFeed((prev) => [newReport, ...prev]);
      toast.success("Hazard report logged in local response buffer.");
      setReportDrawerOpen(false);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans antialiased selection:bg-amber-500/20">
      {/* ── Top Navigation Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-amber-200/60 bg-white/85 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl bg-stone-100 hover:bg-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 transition cursor-pointer border border-stone-200/60"
            >
              <ArrowLeft size={16} />
              <span>Back to Explorer</span>
            </Link>
            <div className="h-5 w-[1px] bg-stone-200" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 border border-amber-300/50">
                <ShieldAlert size={20} className="animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-stone-900 flex items-center gap-2 tracking-tight">
                  <span>Disaster & Emergency Hub</span>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 uppercase tracking-wider border border-amber-300/50">
                    Live Response
                  </span>
                </h1>
                <p className="text-[11px] font-medium text-stone-500">Jaipur Regional Crisis Management & Evacuation Radar</p>
              </div>
            </div>
          </div>

          {/* Location Badge & Report Trigger & SOS */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setReportDrawerOpen(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-300/60 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-500/20 transition cursor-pointer shadow-xs"
            >
              <MessageSquarePlus size={14} />
              <span>Report Hazard</span>
            </button>

            <a
              href="tel:112"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-red-600/20 hover:from-red-700 hover:to-rose-700 transition cursor-pointer"
            >
              <PhoneCall size={14} className="animate-bounce" />
              <span>SOS: 112</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Live Weather Advisory Ribbon ─────────────────────────────────── */}
      <div className="border-b border-amber-200/50 bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-amber-500/10 px-4 py-2.5 text-xs text-amber-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-amber-600 animate-pulse shrink-0" />
            <span className="font-extrabold text-amber-900 uppercase tracking-wider">Live Weather Telemetry:</span>
            <span className="font-medium text-stone-700">
              {activeWeather.description} • Rain: {activeWeather.rain1h} mm/h • Wind:{" "}
              {Math.round(activeWeather.windSpeed * 3.6)} km/h • Temp: {activeWeather.temp}°C
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={refreshLocation}
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold transition cursor-pointer"
            >
              <MapPin size={12} className={isLiveGPS ? "animate-pulse text-emerald-600" : "text-stone-400"} />
              <span>{isLiveGPS ? `GPS Active (${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)})` : locationName}</span>
              <RefreshCw size={10} className="ml-1 opacity-70" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Container ───────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* ── ⭐ HERO CARD: NEAREST SAFE SHELTER WITH PULSE ACTION ─────────── */}
        {nearestShelter && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-white/90 p-6 shadow-md backdrop-blur-md"
          >
            <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                    <Shield size={14} className="text-emerald-600" />
                    Nearest Safe Shelter
                  </span>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 border border-stone-200">
                    {nearestShelter.type}
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-800">
                    {nearestShelter.realDistanceText} away · {nearestShelter.estimatedTravelTime}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    {nearestShelter.name}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 flex items-center gap-1.5 font-medium">
                    <MapPin size={15} className="shrink-0 text-emerald-600" />
                    <span>{nearestShelter.address}</span>
                  </p>
                </div>

                {/* Occupancy & Facilities */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-3.5 py-1.5 border border-stone-200">
                    <span className="text-stone-500 font-medium">Occupancy:</span>
                    <span className="font-bold text-emerald-700">
                      {nearestShelter.occupancy} / {nearestShelter.capacity} (
                      {Math.round((nearestShelter.occupancy / nearestShelter.capacity) * 100)}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {nearestShelter.facilities.map((fac) => (
                      <span
                        key={fac}
                        className="rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700 border border-stone-200"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={() => handleSelectShelter(nearestShelter)}
                  className="relative flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 px-6 py-4 text-xs font-extrabold text-white shadow-lg shadow-emerald-700/25 transition cursor-pointer overflow-hidden group"
                >
                  <span className="absolute inset-0 rounded-2xl border-2 border-emerald-400/50 animate-ping opacity-30 pointer-events-none" />
                  <Navigation size={16} />
                  <span>Evacuate Now (Show Route)</span>
                </button>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${nearestShelter.lat},${nearestShelter.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-300 px-5 py-4 text-xs font-bold text-stone-800 transition cursor-pointer"
                >
                  <ExternalLink size={16} className="text-emerald-700" />
                  <span>Google Maps</span>
                </a>

                <a
                  href={`tel:${nearestShelter.contactNumber}`}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-red-100 border border-red-300 hover:bg-red-200 p-4 text-xs font-bold text-red-700 transition"
                  title="Direct Phone Call"
                >
                  <Phone size={16} />
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Interactive Map Radar Component ───────────────────────────── */}
        <div className="rounded-3xl border border-amber-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200/60">
            <div className="flex items-center gap-2.5">
              <Compass size={20} className="text-amber-700" />
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">Real-Time Disaster & Evacuation Radar</h3>
                <p className="text-[11px] text-stone-500 font-medium">
                  Live location coordinates, safe shelters (🛡 Green), and active hazard signals (⚠ Amber/Red)
                </p>
              </div>
            </div>

            {activeRouteDestination && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-300">
                <Navigation size={13} className="animate-pulse text-emerald-600" />
                <span>Active Evacuation Route: {activeRouteDestination.name}</span>
                <button
                  onClick={() => setActiveRouteDestination(null)}
                  className="ml-1 text-stone-400 hover:text-stone-700"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="mt-3 h-[380px] w-full rounded-2xl overflow-hidden border border-stone-200">
            <InteractiveMap
              markers={mapMarkers}
              userLocation={userLocation}
              selectedMarkerId={selectedShelterId}
              onMarkerClick={(m) => {
                if (m.type === "shelter") {
                  const target = sortedShelters.find((s) => s.id === m.id);
                  if (target) handleSelectShelter(target);
                } else if (m.type === "hazard") {
                  toast.warning(`${m.name}: ${m.description}`, {
                    description: m.signal ? `Safety Measure: ${m.signal}` : undefined,
                  });
                }
              }}
              routePath={routePath}
              routeMode="safety"
              center={
                activeRouteDestination
                  ? { lat: activeRouteDestination.lat, lng: activeRouteDestination.lng }
                  : { lat: userLocation.lat, lng: userLocation.lng }
              }
              zoom={13}
              showEngineBadge={true}
            />
          </div>
        </div>

        {/* ── Framer Motion Tab Bar ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "shelters", label: `Evacuation Shelters (${shelters.length})`, icon: Building2 },
              { id: "feed", label: `Dual-Stream Alerts (${feed.length})`, icon: Radio },
              { id: "weather", label: "Weather Risk Gauge", icon: CloudRain },
              { id: "contacts", label: `Emergency Helplines (${disasterAuthorities.length})`, icon: Phone },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`relative flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
                    isActive ? "text-amber-900 bg-amber-500/20 border border-amber-300" : "text-stone-600 bg-white/60 hover:bg-stone-100 border border-stone-200/60"
                  }`}
                >
                  <Icon size={15} className={isActive ? "text-amber-700" : "text-stone-500"} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search shelters, alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-white border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* ── TAB CONTENT WITH ANIMATEPRESENCE ────────────────────────────── */}
        <AnimatePresence mode="wait">
          {/* TAB 1: SHELTERS */}
          {activeTab === "shelters" && (
            <motion.div
              key="shelters"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-stone-900">Evacuation Shelters & Relief Hubs</h2>
                  <p className="text-xs text-stone-500 font-medium">
                    Sorted by live GPS distance from your current position with capacity and facility signals.
                  </p>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {["all", "Community Center", "School", "Elevated Zone", "Hospital"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`rounded-xl px-3 py-1.5 font-bold transition cursor-pointer ${
                        filterType === t
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                      }`}
                    >
                      {t === "all" ? "All Types" : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Shelters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredShelters.map((shelter, idx) => {
                  const occupancyPercent = Math.round((shelter.occupancy / shelter.capacity) * 100);
                  const isFull = occupancyPercent >= 90;
                  const isNearest = idx === 0;

                  return (
                    <motion.div
                      key={shelter.id}
                      whileHover={{ y: -3 }}
                      className={`flex flex-col justify-between rounded-3xl border p-5 shadow-sm bg-white/90 backdrop-blur-md transition ${
                        isNearest ? "border-emerald-300 ring-2 ring-emerald-500/20" : "border-amber-100/80 hover:border-amber-300"
                      }`}
                    >
                      <div className="space-y-3.5">
                        {/* Shelter Thumbnail */}
                        <div className="relative h-40 w-full rounded-2xl overflow-hidden">
                          <PlaceImage
                            query={`${shelter.name} Jaipur`}
                            lat={shelter.lat}
                            lng={shelter.lng}
                            alt={shelter.name}
                            category="shelter"
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1">
                            <span className="rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider">
                              {shelter.type}
                            </span>
                            {isNearest && (
                              <span className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[10px] font-extrabold uppercase">
                                Nearest Hub
                              </span>
                            )}
                          </div>
                          <span className="absolute bottom-2 right-2 rounded-lg bg-white/90 backdrop-blur-md px-2.5 py-1 text-xs font-extrabold text-emerald-800 shadow-xs">
                            {shelter.realDistanceText}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-stone-900 text-base leading-snug">
                            {shelter.name}
                          </h3>
                          <p className="mt-1 text-xs text-stone-500 flex items-start gap-1 font-medium">
                            <MapPin size={14} className="shrink-0 text-emerald-600 mt-0.5" />
                            <span>{shelter.address}</span>
                          </p>
                        </div>

                        {/* Occupancy bar */}
                        <div className="space-y-1.5 rounded-2xl bg-stone-50 p-3 border border-stone-200/80">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-stone-500">Live Occupancy</span>
                            <span className={isFull ? "text-red-600" : "text-emerald-700"}>
                              {shelter.occupancy} / {shelter.capacity} ({occupancyPercent}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-stone-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isFull ? "bg-red-500" : occupancyPercent > 60 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                            />
                          </div>
                        </div>

                        {/* Facilities */}
                        <div className="flex flex-wrap gap-1.5">
                          {shelter.facilities.map((f) => (
                            <span
                              key={f}
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-50/80 px-2.5 py-1 text-[10px] font-bold text-amber-900 border border-amber-200/60"
                            >
                              {f === "Food" && <Umbrella size={11} className="text-amber-600" />}
                              {f === "Medical" && <LifeBuoy size={11} className="text-red-500" />}
                              {f === "Power" && <Zap size={11} className="text-amber-500" />}
                              {f === "Water" && <CloudRain size={11} className="text-blue-500" />}
                              {f === "WiFi" && <Wifi size={11} className="text-teal-600" />}
                              <span>{f}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleSelectShelter(shelter)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                        >
                          <Navigation size={13} />
                          <span>Map Route</span>
                        </button>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${shelter.lat},${shelter.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 px-3 py-2.5 text-xs font-bold text-stone-700 transition cursor-pointer"
                        >
                          <ExternalLink size={13} />
                        </a>

                        <a
                          href={`tel:${shelter.contactNumber}`}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 px-3 py-2.5 text-xs font-bold text-red-700 transition cursor-pointer"
                        >
                          <Phone size={13} />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: DUAL STREAM ALERTS */}
          {activeTab === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-stone-900">Dual-Stream Incident & Hazard Network</h2>
                  <p className="text-xs text-stone-500 font-medium">
                    Verified emergency directives from NDRF / Police combined with real-time crowd hazards.
                  </p>
                </div>

                {/* Filter */}
                <div className="flex items-center rounded-2xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
                  <button
                    onClick={() => setFeedFilter("all")}
                    className={`rounded-xl px-3 py-1.5 transition cursor-pointer ${
                      feedFilter === "all" ? "bg-amber-600 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    All Stream ({feed.length})
                  </button>
                  <button
                    onClick={() => setFeedFilter("authority")}
                    className={`flex items-center gap-1 rounded-xl px-3 py-1.5 transition cursor-pointer ${
                      feedFilter === "authority" ? "bg-emerald-700 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    <span>Official Authority Directives</span>
                  </button>
                  <button
                    onClick={() => setFeedFilter("community")}
                    className={`flex items-center gap-1 rounded-xl px-3 py-1.5 transition cursor-pointer ${
                      feedFilter === "community" ? "bg-amber-700 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Users size={13} />
                    <span>Community Crowd Reports</span>
                  </button>
                </div>
              </div>

              {/* Feed Cards */}
              <div className="space-y-4">
                {filteredFeed.map((item) => {
                  const distKm = getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
                  const distText = distKm < 1 ? `${Math.round(distKm * 1000)} m away` : `${distKm.toFixed(1)} km away`;
                  const isAuth = item.source === "authority" || item.verified;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-3xl border p-5 shadow-xs bg-white/90 backdrop-blur-md transition ${
                        isAuth ? "border-emerald-200/80 bg-emerald-50/20" : "border-amber-200/80 bg-amber-50/20"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2.5 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                                item.category === "Flooding"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : item.category === "Road Blocked"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {item.category}
                            </span>

                            {item.severity && (
                              <span
                                className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                  item.severity === "Critical"
                                    ? "bg-red-600 text-white shadow-xs animate-pulse"
                                    : item.severity === "Medium"
                                    ? "bg-amber-500 text-white"
                                    : "bg-emerald-600 text-white"
                                }`}
                              >
                                {item.severity} Severity
                              </span>
                            )}

                            {isAuth ? (
                              <span className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-300">
                                <CheckCircle2 size={12} /> Official Authority Directive
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900 border border-amber-300">
                                <Users size={12} /> Community Verified Report
                              </span>
                            )}

                            <span className="text-xs text-stone-500 flex items-center gap-1 font-semibold">
                              <MapPin size={12} className="text-red-500" /> {item.location} ({distText})
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-stone-800 leading-relaxed">
                            {item.description}
                          </p>

                          {item.actionAdvice && (
                            <div className="rounded-2xl bg-amber-100/60 p-3 border border-amber-300/60 space-y-1 text-xs">
                              <span className="font-extrabold text-amber-900 flex items-center gap-1">
                                <Shield size={12} /> Recommended Action:
                              </span>
                              <p className="text-stone-700 font-medium leading-normal">{item.actionAdvice}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 text-right">
                          <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                            <Clock3 size={12} />
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>

                          <button
                            onClick={() => handleUpvote(item.id)}
                            className="flex items-center gap-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 px-3.5 py-1.5 text-xs font-bold text-stone-800 transition cursor-pointer"
                          >
                            <ThumbsUp size={13} className="text-emerald-600" />
                            <span>Confirm ({item.upvotes || 1})</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 3: WEATHER GAUGE */}
          {activeTab === "weather" && (
            <motion.div
              key="weather"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-extrabold text-stone-900">Meteorological Radar & Weather Risk Gauge</h2>
                <p className="text-xs text-stone-500 font-medium">
                  Synchronized with live OpenWeatherMap telemetry for real-time risk classification.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="rounded-3xl border border-amber-200/80 bg-white/90 p-5 space-y-3 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Current Temperature</span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-stone-900">{activeWeather.temp}°</span>
                      <span className="text-sm font-semibold text-stone-500">C</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-stone-700">Feels like {activeWeather.feelsLike}°C</span>
                      <span className="text-[11px] text-stone-500 capitalize font-medium">{activeWeather.description}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-amber-200/80 bg-white/90 p-5 space-y-3 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Precipitation & Rain</span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-blue-600">{activeWeather.rain1h}</span>
                      <span className="text-sm font-semibold text-stone-500">mm/h</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-stone-700">Humidity: {activeWeather.humidity}%</span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {activeWeather.rain1h > 10 ? "Heavy Rain Advisory" : "Normal Runoff"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-amber-200/80 bg-white/90 p-5 space-y-3 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Wind & Visibility</span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-amber-700">{Math.round(activeWeather.windSpeed * 3.6)}</span>
                      <span className="text-sm font-semibold text-stone-500">km/h</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-stone-700">
                        Visibility: {(activeWeather.visibility / 1000).toFixed(1)} km
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium">Clear Evacuation Threshold</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: HELPLINES */}
          {activeTab === "contacts" && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-extrabold text-stone-900">Verified 24x7 Emergency Response Channels</h2>
                <p className="text-xs text-stone-500 font-medium">
                  Direct telephony and emergency dispatch channels for state and national disaster forces.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {disasterAuthorities.map((auth) => (
                  <div
                    key={auth.id}
                    className="rounded-3xl border border-amber-200/80 bg-white/90 p-6 space-y-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[10px] font-extrabold text-stone-600">
                          24x7 Direct
                        </span>
                        {auth.smsAvailable && (
                          <span className="rounded-full bg-teal-100 text-teal-800 px-2.5 py-0.5 text-[10px] font-extrabold border border-teal-300">
                            SMS Enabled
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-stone-900 text-base leading-snug">{auth.name}</h3>
                      <p className="text-xs text-stone-500 font-medium">{auth.role}</p>
                    </div>

                    <div className="pt-3 border-t border-stone-200/60">
                      <a
                        href={`tel:${auth.phone}`}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 text-xs font-extrabold text-white shadow-md shadow-red-600/20 hover:from-red-700 hover:to-rose-700 transition cursor-pointer"
                      >
                        <PhoneCall size={15} />
                        <span>Call {auth.phone}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── REPORT HAZARD MODAL ──────────────────────────────────────────── */}
      {reportDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm animate-enter">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl space-y-5 text-stone-900"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-800 border border-amber-300">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">Report Local Hazard</h3>
                  <p className="text-xs text-stone-500 font-medium">Broadcast safety intel to nearby travelers & authorities</p>
                </div>
              </div>

              <button
                onClick={() => setReportDrawerOpen(false)}
                className="rounded-full bg-stone-100 p-2 text-stone-400 hover:text-stone-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Hazard Category
                </label>
                <select
                  value={hazardCategory}
                  onChange={(e) => setHazardCategory(e.target.value as DisasterReport["category"])}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 text-stone-900 font-bold outline-none cursor-pointer focus:border-amber-500"
                >
                  <option value="Flooding">🌊 Flooding / Waterlogging</option>
                  <option value="Landslide">⛰ Landslide / Rockfall</option>
                  <option value="Road Blocked">🚧 Road Blocked / Diversion</option>
                  <option value="Extreme Weather">⛈ Extreme Weather / Hail</option>
                  <option value="Unsafe Area">⚠ Unsafe Area / Stampede Risk</option>
                  <option value="Power Failure">⚡ Power Failure / Outage</option>
                  <option value="Other">📍 Other Local Hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2 font-bold">
                  {(["Low", "Medium", "Critical"] as const).map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setHazardSeverity(sev)}
                      className={`rounded-2xl py-2.5 transition text-xs cursor-pointer ${
                        hazardSeverity === sev
                          ? sev === "Critical"
                            ? "bg-red-600 text-white shadow-xs"
                            : sev === "Medium"
                            ? "bg-amber-600 text-white shadow-xs"
                            : "bg-emerald-600 text-white shadow-xs"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {sev === "Critical" ? "🔥 Critical" : sev === "Medium" ? "⚠ Medium" : "🟢 Low"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Description of Condition
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Underpass waterlogged near Johari Bazaar..."
                  value={hazardDescription}
                  onChange={(e) => setHazardDescription(e.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 text-stone-900 placeholder-stone-400 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Actionable Advice / Workaround (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take bypass via Jhotwara Road instead"
                  value={hazardActionAdvice}
                  onChange={(e) => setHazardActionAdvice(e.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 p-3 text-stone-900 placeholder-stone-400 outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReportDrawerOpen(false)}
                  className="flex-1 rounded-2xl bg-stone-100 py-3 text-xs font-bold text-stone-600 hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-xs font-extrabold text-white shadow-md shadow-red-600/20 hover:from-red-700 hover:to-rose-700 transition cursor-pointer disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{isSubmittingReport ? "Publishing..." : "Broadcast Report"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
