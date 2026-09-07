/* Civic Calm style: editorial rails, mineral canvas, signal labels, and calm safety affordances. */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Bookmark,
  BookmarkCheck,
  Bot,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  CloudRain,
  Compass,
  Copy,
  ExternalLink,
  Flame,
  HeartHandshake,
  Hospital,
  Languages,
  LocateFixed,
  MapPin,
  Menu,
  Mic,
  MicOff,
  Moon,
  Navigation,
  Phone,
  Plus,
  Radio,
  Route,
  Search,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Sun,
  Users,
  Volume2,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { DemoBar } from "@/components/DemoBar";
import { DisasterAlertModal } from "@/components/DisasterAlertModal";
import { useWeatherMonitor } from "@/lib/weatherService";
import { useLocationContext, getDistanceKm } from "@/contexts/LocationContext";
import {
  authorities,
  bestTime,
  createItinerary,
  getGoodRightNow,
  nearbyHelp,
  places,
  scoreFactors,
  shuffleItinerary,
  type DemoContext,
  type Place,
} from "@/lib/travelData";

type Tab = "Explore" | "Plan" | "Safety" | "Assistant" | "Profile";
type FilterLabel = "All places" | "Popular / Must Visit" | "Hidden Gem" | "Local Favorite" | "Trending" | "Alternative";

const filterLabels: FilterLabel[] = ["All places", "Popular / Must Visit", "Hidden Gem", "Local Favorite", "Trending", "Alternative"];

const navItems = [
  { label: "Explore", icon: Compass, type: "tab" as const, tab: "Explore" as Tab },
  { label: "Map", icon: Navigation, type: "link" as const, href: "/map" },
  { label: "Guides", icon: Users, type: "link" as const, href: "/guides" },
  { label: "Disaster", icon: ShieldAlert, type: "link" as const, href: "/disaster" },
  { label: "Plan", icon: Route, type: "tab" as const, tab: "Plan" as Tab },
  { label: "Safety", icon: ShieldCheck, type: "tab" as const, tab: "Safety" as Tab },
  { label: "Assistant", icon: Bot, type: "tab" as const, tab: "Assistant" as Tab },
];

const pillClass = "inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink/70";

import { PlaceImage as LocationPlaceImage } from "@/components/PlaceImage";

function PlaceImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <LocationPlaceImage
      query={alt}
      alt={alt}
      className={className}
      fallbackUrl={src}
    />
  );
}


export default function Home() {
  const [tab, setTab] = useState<Tab>("Explore");
  const [demoOpen, setDemoOpen] = useState(false);
  const [selected, setSelected] = useState<Place | null>(null);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [context, setContext] = useState<DemoContext>({
    time: "Morning",
    weather: "Clear",
    crowd: "Low",
    location: "Jaipur",
    alert: false,
    disasterAlert: false,
    authorityVerified: false,
  });
  const [hours, setHours] = useState(4);
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  });

  // SOS state
  const [sosActive, setSosActive] = useState(false);
  const [sosArmed, setSosArmed] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosLocation, setSosLocation] = useState<{ lat: number; lng: number }>({ lat: 26.9855, lng: 75.8513 });

  // Assistant & Saved/Planned places
  const [savedPlaces, setSavedPlaces] = useState<Set<string>>(new Set());
  const [plannedPlaces, setPlannedPlaces] = useState<Set<string>>(new Set());

  // Incident reporting modal state
  const [reportOpen, setReportOpen] = useState(false);

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const weatherMonitor = useWeatherMonitor(26.9124, 75.7873);
  const recommendation = useMemo(() => bestTime(context), [context]);
  const itinerary = useMemo(() => createItinerary(hours, context, startTime), [hours, context, startTime]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);

  function captureLocation() {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSosLocation({ lat: Number(pos.coords.latitude.toFixed(4)), lng: Number(pos.coords.longitude.toFixed(4)) });
        },
        () => {
          setSosLocation({ lat: 26.9855, lng: 75.8513 });
        },
        { timeout: 3000 }
      );
    }
  }

  function startSos() {
    setSosArmed(true);
    captureLocation();
    holdTimer.current = setTimeout(() => {
      setSosActive(true);
      setSosArmed(false);
      setSosCountdown(5);

      fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: sosLocation.lat, lng: sosLocation.lng, note: "Offline/Client press-and-hold trigger" }),
      }).catch(() => {});

      if (countdownInterval.current) clearInterval(countdownInterval.current);
      countdownInterval.current = setInterval(() => {
        setSosCountdown((prev) => {
          if (prev <= 1) {
            if (countdownInterval.current) clearInterval(countdownInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      if (typeof window !== "undefined") window.localStorage.setItem("disha-sos-demo", "armed");
    }, 1200);
  }

  function stopSos() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (!sosActive) setSosArmed(false);
  }

  function closeSos() {
    setSosActive(false);
    setSosArmed(false);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }

  function toggleSave(placeId: string) {
    setSavedPlaces((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) {
        next.delete(placeId);
        toast("Removed from saved places");
      } else {
        next.add(placeId);
        toast.success("Saved to your collection");
      }
      return next;
    });
  }

  function togglePlan(placeId: string) {
    setPlannedPlaces((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) {
        next.delete(placeId);
        toast("Removed from today's plan");
      } else {
        next.add(placeId);
        toast.success("Added to today's plan!");
      }
      return next;
    });
  }

  function renderHeader() {
    return (
      <header className="sticky top-0 z-30 border-b border-ink/8 bg-white/90 backdrop-blur-xl mb-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <div className="brand-mark grid h-10 w-10 place-items-center rounded-[15px] bg-teal text-paper shadow-[0_10px_24px_rgba(12,124,116,0.18)]">
              <img src="/manus-storage/travel-guardian-mark_d4a7b0f5.png" alt="" className="h-7 w-7 object-contain" />
            </div>
            <div className="brand-lockup">
              <div className="font-display text-[20px] font-semibold leading-none tracking-[-0.055em]">DISHA</div>
              <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/42">
                <span className="brand-tick" /> Jaipur · SIH Demo Mode
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`${pillClass} hidden sm:inline-flex`}>
              <LocateFixed size={12} /> Amber Fort Context
            </span>
            <button
              onClick={() => setDemoOpen((v) => !v)}
              className="rounded-full border border-ink/10 bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/75 transition hover:border-teal hover:text-teal shadow-sm"
            >
              {demoOpen ? "Hide SIH Demo Bar" : "SIH Demo Bar"}
            </button>
          </div>
        </div>

        {demoOpen && <DemoBar context={context} setContext={setContext} onClose={() => setDemoOpen(false)} />}
      </header>
    );
  }

  const isNight = context.time === "Night" || context.time === "Late Night";

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-ink pb-28">
      {renderHeader()}

      <main className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Mobile Context bar */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button onClick={() => setDemoOpen((v) => !v)} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/50">
            <Radio size={13} className={context.alert ? "text-ember" : "text-teal"} />
            {context.alert ? "Simulated incident active" : "SIH demo controls"}
          </button>
          <span className="text-[11px] font-semibold text-ink/40">
            {context.time} · {context.crowd} crowd
          </span>
        </div>

        {/* Safe After Dark Warning Banner */}
        {isNight && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-ember/30 bg-ember/10 p-4 text-sm text-ember animate-enter">
            <Moon size={18} className="shrink-0" />
            <div>
              <span className="font-bold">Safe After Dark Mode Active:</span> Night illumination route signals enabled. Sticking to well-lit commercial boulevards and official safety checkpoints.
            </div>
          </div>
        )}

        {/* Alert Banner */}
        {context.alert && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-ember/20 bg-ember/8 px-4 py-3 text-sm text-ember">
            <AlertTriangle size={17} />
            <span>
              <b>Demo alert:</b> a reported road hazard is affecting one route near Amer Fort. This is simulated data.
            </span>
            <button className="ml-auto" onClick={() => setContext((c) => ({ ...c, alert: false }))}>
              <X size={16} />
            </button>
          </div>
        )}

        {tab === "Explore" && (
          <ExploreView
            recommendation={recommendation}
            context={context}
            places={places}
            onSelect={(place) => {
              setSelected(place);
              setScoreOpen(false);
            }}
            onScore={(place) => {
              setSelected(place);
              setScoreOpen(true);
            }}
          />
        )}
        {tab === "Plan" && <PlanView hours={hours} setHours={setHours} startTime={startTime} setStartTime={setStartTime} context={context} itinerary={itinerary} />}
        {tab === "Safety" && (
          <SafetyView
            sharing={false}
            setSharing={() => {}}
            checkIn={false}
            setCheckIn={() => {}}
            onAlert={() => setReportOpen(true)}
            setTab={setTab}
          />
        )}
        {tab === "Assistant" && <AssistantView hours={hours} context={context} />}
        {tab === "Profile" && <ProfileView />}
      </main>

      <DesktopNav tab={tab} setTab={setTab} />
      <MobileNav tab={tab} setTab={setTab} />

      {/* Weather & Disaster Alert Modal */}
      <DisasterAlertModal
        isOpen={
          context.disasterAlert ||
          weatherMonitor.severity === "severe" ||
          weatherMonitor.severity === "extreme"
        }
        onClose={() => setContext((c) => ({ ...c, disasterAlert: false }))}
        alert={weatherMonitor.alert}
      />

      {/* Press-and-hold SOS FAB button */}
      <button
        className={`sos-fab ${sosArmed ? "sos-armed" : ""} ${sosActive ? "sos-live" : ""}`}
        onPointerDown={startSos}
        onPointerUp={stopSos}
        onPointerLeave={stopSos}
        aria-label="Press and hold to activate SOS"
      >
        <Siren size={18} />
        <span>{sosActive ? "SOS active" : sosArmed ? "Hold…" : "Hold SOS"}</span>
      </button>

      {/* Active Emergency Status Screen */}
      {sosActive && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1c0f0f]/85 p-4 backdrop-blur-md animate-enter">
          <div className="w-full max-w-lg rounded-[28px] bg-[#fff8f5] p-6 text-[#351516] shadow-2xl border border-ember/30 sm:p-8">
            <div className="mb-4 flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ember text-white shadow-lg">
                <Siren className="animate-bounce" size={24} />
              </div>
              <button onClick={closeSos} className="rounded-full bg-black/5 p-2 text-ink/50 hover:bg-black/10">
                <X size={20} />
              </button>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ember">Client-Side Emergency Flow</p>
            <h2 className="mt-1 font-display text-4xl tracking-[-0.05em]">Emergency SOS Active</h2>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-ember/10 p-4 border border-ember/20">
              <div className="flex items-center gap-2 text-sm font-bold text-ember">
                <Clock3 size={18} />
                <span>Auto-alerting trusted contacts in:</span>
              </div>
              <span className="font-display text-3xl font-bold text-ember">{sosCountdown}s</span>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4 border border-ink/10 text-xs leading-5">
              <p className="font-bold text-ink/70 flex items-center gap-1.5">
                <LocateFixed size={14} className="text-teal" />
                Captured GPS Location:
              </p>
              <p className="mt-1 font-mono text-sm text-ink font-semibold">
                {sosLocation.lat}° N, {sosLocation.lng}° E (Amer, Jaipur)
              </p>
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-ink/50">One-Tap Emergency Phone Triggers (tel:)</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a
                href="tel:112"
                className="flex items-center justify-between rounded-2xl bg-ember px-4 py-3 text-sm font-bold text-white shadow hover:bg-ember/90"
              >
                <span><Phone size={15} className="mr-1.5 inline" /> Police</span>
                <span className="font-mono">112</span>
              </a>
              <a
                href="tel:108"
                className="flex items-center justify-between rounded-2xl bg-[#183d3b] px-4 py-3 text-sm font-bold text-white shadow hover:bg-[#183d3b]/90"
              >
                <span><Phone size={15} className="mr-1.5 inline" /> Ambulance</span>
                <span className="font-mono">108</span>
              </a>
              <a
                href="tel:101"
                className="flex items-center justify-between rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm font-bold text-ink hover:bg-paper"
              >
                <span>Fire</span>
                <span className="font-mono text-ink/60">101</span>
              </a>
              <a
                href="tel:1363"
                className="flex items-center justify-between rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm font-bold text-ink hover:bg-paper"
              >
                <span>Tourist Police</span>
                <span className="font-mono text-ink/60">1363</span>
              </a>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={closeSos} className="rounded-2xl border border-[#351516]/20 px-6 py-3 text-sm font-bold text-[#351516]">
                Cancel Emergency State
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Reporting Dialog */}
      {reportOpen && (
        <IncidentReportModal onClose={() => setReportOpen(false)} />
      )}

      {selected && (
        <PlaceSheet
          place={selected}
          scoreOpen={scoreOpen}
          setScoreOpen={setScoreOpen}
          onClose={() => setSelected(null)}
          saved={savedPlaces.has(selected.id)}
          planned={plannedPlaces.has(selected.id)}
          onToggleSave={() => toggleSave(selected.id)}
          onTogglePlan={() => togglePlan(selected.id)}
        />
      )}
    </div>
  );
}

function ExploreView({
  recommendation,
  context,
  places,
  onSelect,
  onScore,
}: {
  recommendation: ReturnType<typeof bestTime>;
  context: DemoContext;
  places: Place[];
  onSelect: (place: Place) => void;
  onScore: (place: Place) => void;
}) {
  const { userLocation, locationName, isLiveGPS, refreshLocation, formatDistance, formatTravelTime } =
    useLocationContext();

  const [activeFilter, setActiveFilter] = useState<FilterLabel>("All places");
  const [goodNowActive, setGoodNowActive] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);

  // Compute live distance & travel times for all places
  const placesWithLocation = useMemo(() => {
    return places.map((p) => {
      const distKm = getDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng);
      return {
        ...p,
        realDistKm: distKm,
        distanceText: formatDistance(p.lat, p.lng),
        travelTimeText: formatTravelTime(p.lat, p.lng, "driving"),
      };
    });
  }, [places, userLocation, formatDistance, formatTravelTime]);

  const filteredPlaces = useMemo(() => {
    let result = [...placesWithLocation];

    if (goodNowActive) {
      result = getGoodRightNow(result as any) as any;
    }
    if (activeFilter !== "All places") {
      result = result.filter((p) => p.category.toLowerCase() === activeFilter.toLowerCase());
    }

    if (sortByDistance) {
      result.sort((a, b) => a.realDistKm - b.realDistKm);
    } else {
      result.sort((a, b) => b.score - a.score);
    }

    return result;
  }, [placesWithLocation, activeFilter, goodNowActive, sortByDistance]);

  function handleFilterClick(label: FilterLabel) {
    setActiveFilter(label);
    if (label !== "All places") {
      setGoodNowActive(false);
    }
  }

  function handleGoodNow() {
    setGoodNowActive((prev) => {
      if (!prev) {
        setActiveFilter("All places");
        toast.success("Showing what's good right now");
      } else {
        toast("Showing all places");
      }
      return !prev;
    });
  }

  return (
    <div className="animate-enter">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[30px] bg-[#183d3b] p-6 text-paper sm:p-10 lg:grid lg:min-h-[400px] lg:grid-cols-[1fr_0.95fr] lg:gap-10 lg:p-12">
        <div className="hero-wash" />
        <div className="relative z-10 flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b2ddd4]">
              <span className="h-2 w-2 rounded-full bg-[#f1bd58]" /> Good day, Explorer
            </div>
            <h1 className="max-w-[600px] font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.9] tracking-[-0.06em]">
              Make room for the <em className="text-[#f1bd58]">unexpected.</em>
            </h1>
            <p className="mt-5 max-w-[430px] text-sm leading-6 text-paper/65 sm:text-base">
              A context-aware companion for better days in unfamiliar places. Start with what is good right now.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
              <Clock3 size={13} className="mr-1.5 inline" /> {context.time} context
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
              <Waves size={13} className="mr-1.5 inline" /> {context.crowd} crowd signal
            </span>

            {/* Live GPS Lock Indicator */}
            <button
              onClick={refreshLocation}
              className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LocateFixed size={13} className={isLiveGPS ? "animate-pulse text-emerald-300" : "text-white/60"} />
              <span>{isLiveGPS ? `GPS Active (${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)})` : "Jaipur Hub"}</span>
            </button>
          </div>
        </div>

        <div className="relative mt-8 min-h-[220px] overflow-hidden rounded-[24px] lg:mt-0">
          <PlaceImage src="https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=1200&auto=format&fit=crop" alt="Amber Fort view" className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b2c2a]/85 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 z-10">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">Your first signal</div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="font-display text-2xl sm:text-3xl tracking-[-0.04em]">{recommendation.label}</div>
                <div className="mt-1 max-w-[320px] text-xs leading-5 text-white/75">{recommendation.detail}</div>
              </div>
              <ArrowUpRight size={22} className="mb-1 text-[#f1bd58] shrink-0" />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker text-teal">Discovery, without the blind spots</p>
          <h2 className="section-title">What's good right now?</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Sort By Distance / Score Toggle */}
          <button
            onClick={() => setSortByDistance(!sortByDistance)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              sortByDistance
                ? "bg-emerald-700 text-white shadow-sm"
                : "border border-ink/10 bg-white text-ink/65 hover:border-teal hover:text-teal"
            }`}
          >
            <Compass size={13} />
            <span>{sortByDistance ? "Sorted: Nearest GPS" : "Sort by Distance"}</span>
          </button>

          <button
            onClick={handleGoodNow}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-300 cursor-pointer ${
              goodNowActive
                ? "bg-teal text-paper shadow-[0_4px_16px_rgba(12,124,116,0.3)]"
                : "border border-ink/10 bg-white text-ink/65 hover:border-teal hover:text-teal"
            }`}
          >
            <Zap size={13} /> {goodNowActive ? "Clear filter" : "Good right now"}
            {goodNowActive && <X size={12} className="ml-1" />}
          </button>
          <Link href="/map" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.16em] text-teal hover:underline">
            View map <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-4 flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {filterLabels.map((label) => (
          <button
            key={label}
            onClick={() => handleFilterClick(label)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeFilter === label
                ? "bg-ink text-paper shadow-md"
                : "border border-ink/10 bg-white text-ink/60 hover:border-teal hover:text-teal"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Clean Grid Layout: Lead (Col 7) + Secondary List (Col 5) */}
      {filteredPlaces.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 py-16 text-center bg-white rounded-3xl border border-ink/8">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-ink/5 text-ink/30">
            <Search size={24} />
          </div>
          <p className="font-display text-2xl tracking-[-0.04em] text-ink/50">No places match this filter</p>
          <button
            onClick={() => {
              setActiveFilter("All places");
              setGoodNowActive(false);
            }}
            className="mt-2 rounded-full bg-teal px-5 py-2.5 text-xs font-bold text-paper shadow hover:bg-teal/90 cursor-pointer"
          >
            Show all places
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lead Recommendation Card (Spans 7 cols) */}
          <div className="lg:col-span-7">
            <LeadPlace place={filteredPlaces[0]} onSelect={onSelect} onScore={onScore} />
          </div>

          {/* Secondary Recommendation Feed (Spans 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {filteredPlaces.slice(1).map((place) => (
              <PlaceCard key={place.id} place={place} onSelect={onSelect} onScore={onScore} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Lead Hero Card Component
 * ───────────────────────────────────────────────────────────── */
function LeadPlace({
  place,
  onSelect,
  onScore,
}: {
  place: Place & { distanceText?: string; travelTimeText?: string };
  onSelect: (place: Place) => void;
  onScore: (place: Place) => void;
}) {
  const { userLocation } = useLocationContext();

  return (
    <article className="lead-place group overflow-hidden rounded-[26px] border border-ink/10 bg-white shadow-[0_12px_32px_rgba(31,37,31,0.06)] flex flex-col h-full">
      <div className="relative w-full h-72 md:h-80 overflow-hidden rounded-t-[26px] bg-slate-100">
        <PlaceImage src={place.image} alt={place.name} className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0 pointer-events-none" />

        {/* Absolute positioned Category & Lead Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
          <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ink/70 shadow-sm">
            Lead recommendation
          </span>
          <span className="rounded-full bg-[#f1bd58] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ink shadow-sm">
            {place.category}
          </span>
          {place.distanceText && (
            <span className="rounded-full bg-emerald-600/90 text-white backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold tracking-[0.1em] shadow-sm">
              📍 {place.distanceText} · {place.travelTimeText}
            </span>
          )}
        </div>

        {/* Place Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white z-10">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-3xl sm:text-4xl tracking-[-0.05em] truncate">{place.name}</h3>
              <p className="mt-1 text-xs text-white/80 font-medium truncate">{place.neighborhood} · {place.duration} · {place.bestFor}</p>
            </div>
            <button onClick={() => onScore(place)} className="score-badge shrink-0">
              <span>{place.score}</span>
              <small>score</small>
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <p className="text-sm leading-6 text-ink/65 line-clamp-3">{place.description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-ink/8 gap-3">
          <p className="text-xs font-semibold text-teal truncate flex items-center gap-1.5 min-w-0">
            <Sun size={14} className="shrink-0" />
            <span className="truncate">{place.signal}</span>
          </p>
          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${place.lat},${place.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink/12 bg-paper px-3 py-2 text-xs font-bold text-ink/75 hover:text-teal hover:border-teal transition"
              title="Open Google Maps Directions"
            >
              <Navigation size={13} className="inline mr-1" /> Route
            </a>
            <button onClick={() => onSelect(place)} className="shrink-0 rounded-full bg-teal px-4 py-2.5 text-xs font-bold text-paper transition hover:bg-teal/90 cursor-pointer">
              Open place <ArrowUpRight size={14} className="ml-1 inline" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Secondary Feed Place Card Component
 * ───────────────────────────────────────────────────────────── */
function PlaceCard({
  place,
  onSelect,
  onScore,
}: {
  place: Place & { distanceText?: string; travelTimeText?: string };
  onSelect: (place: Place) => void;
  onScore: (place: Place) => void;
}) {
  return (
    <article
      onClick={() => onSelect(place)}
      className="group overflow-hidden rounded-[20px] border border-ink/10 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-0"
    >
      {/* Image Container with Absolute Category Badge */}
      <div className="relative w-full h-40 sm:w-36 sm:h-full flex-shrink-0 overflow-hidden rounded-t-[20px] sm:rounded-l-[20px] sm:rounded-tr-none bg-slate-100">
        <PlaceImage src={place.image} alt={place.name} className="h-full w-full object-cover object-center" />
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1 pointer-events-none">
          <span className="rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ink/75 shadow-sm">
            {place.category}
          </span>
          {place.distanceText && (
            <span className="rounded-full bg-emerald-700/90 text-white backdrop-blur-sm px-2 py-0.5 text-[8px] font-bold shadow-sm">
              📍 {place.distanceText}
            </span>
          )}
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-xl font-semibold leading-tight tracking-[-0.03em] text-ink truncate">{place.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onScore(place);
              }}
              className="score-badge shrink-0"
            >
              <span>{place.score}</span>
              <small>score</small>
            </button>
          </div>
          <p className="mt-1 text-xs font-semibold text-ink/45 flex items-center gap-1">
            <MapPin size={12} /> {place.neighborhood} · {place.duration}
            {place.travelTimeText && <span className="text-emerald-700">· {place.travelTimeText}</span>}
          </p>
          <p className="mt-2 text-xs leading-5 text-ink/60 line-clamp-2">{place.description}</p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-ink/8 pt-2 text-[11px] font-semibold text-teal truncate">
          <div className="flex items-center gap-1.5 truncate">
            <Sun size={12} className="shrink-0" />
            <span className="truncate">{place.signal}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function PlanView({ hours, setHours, startTime, setStartTime, context, itinerary }: {
  hours: number;
  setHours: (value: number) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  context: DemoContext;
  itinerary: ReturnType<typeof createItinerary>;
}) {
  const [localItinerary, setLocalItinerary] = useState(itinerary);
  const [regenerateKey, setRegenerateKey] = useState(0);

  useEffect(() => {
    setLocalItinerary(itinerary);
  }, [itinerary]);

  function handleRegenerate() {
    fetch("/api/planner/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours, time: context.time, crowd: context.crowd, weather: context.weather, startTime }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.itinerary) {
          setLocalItinerary(data.itinerary);
          setRegenerateKey((k) => k + 1);
          toast.success("Itinerary regenerated via API!", { icon: <Sparkles size={16} /> });
        } else {
          setLocalItinerary(shuffleItinerary(localItinerary));
          setRegenerateKey((k) => k + 1);
        }
      })
      .catch(() => {
        setLocalItinerary(shuffleItinerary(localItinerary));
        setRegenerateKey((k) => k + 1);
      });
  }

  const displayHours = Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);

  return (
    <div className="animate-enter max-w-5xl mx-auto">
      <PageIntro eyebrow="AI day planner" title="Only plan what you need." body="Start with a few hours. Disha keeps the day flexible when context changes." icon={<Sparkles />} />
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[28px] bg-[#183d3b] p-6 text-paper sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b2ddd4]">Your constraints</p>

          {/* Start Time Picker */}
          <div className="mt-6">
            <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-paper/50 mb-2">Start Plan At</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-paper font-display text-xl tracking-[-0.04em] outline-none focus:border-[#f1bd58] transition"
            />
            <p className="mt-1.5 text-[10px] text-paper/40">Your itinerary will begin at this time</p>
          </div>

          {/* Duration Slider */}
          <label className="mt-6 block font-display text-4xl tracking-[-0.06em]">
            I have <span className="text-[#f1bd58]">{displayHours}</span> hours.
          </label>
          <input
            type="range"
            min="1.5"
            max="8"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="mt-5 w-full accent-[#f1bd58]"
          />
          <div className="mt-1 flex justify-between text-xs text-paper/40">
            <span>1.5 hrs</span>
            <span>4 hrs</span>
            <span>8 hrs</span>
          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-paper/70">
            <span className="font-bold text-[#f1bd58]">Context shift:</span> {context.time} · {context.crowd} crowd · {context.weather || "Clear"} weather.
          </div>
          <button onClick={handleRegenerate} className="mt-8 w-full rounded-2xl bg-[#f1bd58] px-4 py-3.5 text-sm font-bold text-ink transition-all duration-200 hover:bg-[#e8b04e] active:scale-[0.97]">
            Regenerate itinerary <Sparkles size={16} className="ml-2 inline" />
          </button>
        </div>

        <div className="rounded-[28px] border border-ink/8 bg-white p-6 sm:p-8">
          <div className="flex items-end justify-between border-b border-ink/8 pb-5">
            <div>
              <p className="section-kicker text-teal">A flexible outline</p>
              <h2 className="mt-2 font-display text-3xl tracking-[-0.05em]">Your Jaipur thread</h2>
            </div>
            <span className="rounded-full bg-[#f4eddd] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">Structured API Itinerary</span>
          </div>

          <div className="mt-6 space-y-1" key={regenerateKey}>
            {localItinerary.map((item, index) => (
              <div key={`${item.time}-${item.title}`} className="relative flex gap-4 pb-7 animate-enter" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="flex flex-col items-center">
                  <span className={`z-10 grid h-8 w-8 place-items-center rounded-full ${index === 0 ? "bg-teal text-paper" : "bg-[#e5f0ec] text-teal"}`}>
                    <span className="text-xs font-bold">{index + 1}</span>
                  </span>
                  {index < localItinerary.length - 1 && <span className="mt-1 h-full w-px bg-teal/20" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-ink/42">{item.time}</span>
                    <span className="rounded-full bg-ink/5 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ink/45">{item.tag}</span>
                  </div>
                  <h3 className="mt-2 font-display text-2xl tracking-[-0.04em]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink/58">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Interactive Emergency Translator (Web Speech TTS + STT + Presets)
 * ───────────────────────────────────────────────────────────── */
const TRANSLATION_PRESETS: Record<string, Record<string, string>> = {
  "I need help": {
    "hi-IN": "मुझे मदद चाहिए (Mujhe madad chahiye)",
    "en-US": "I need urgent assistance.",
    "es-ES": "Necesito ayuda urgente.",
    "fr-FR": "J'ai besoin d'aide d'urgence.",
    "de-DE": "Ich brauche dringend Hilfe.",
    "ja-JP": "助けてください (Tasukete kudasai)",
    "bn-IN": "আমার সাহায্য দরকার (Amar sahajjo dorkar)",
  },
  "Call an ambulance": {
    "hi-IN": "एम्बुलेंस बुलाओ (Ambulance bulao)",
    "en-US": "Call an ambulance immediately.",
    "es-ES": "Llame a una ambulancia de inmediato.",
    "fr-FR": "Appelez une ambulance immédiatement.",
    "de-DE": "Rufen Sie sofort einen Krankenwagen.",
    "ja-JP": "救急車を呼んでください (Kyūkyūsha o yonde kudasai)",
    "bn-IN": "অ্যাম্বুলেন্স ডাকুন (Ambulance dakun)",
  },
  "I am lost": {
    "hi-IN": "मैं रास्ता भूल गया हूँ (Main rasta bhool gaya hoon)",
    "en-US": "I am lost and need directions.",
    "es-ES": "Estoy perdido y necesito indicaciones.",
    "fr-FR": "Je suis perdu et j'ai besoin d'orientations.",
    "de-DE": "Ich habe mich verlaufen.",
    "ja-JP": "道に迷いました (Michi ni mayoimashita)",
    "bn-IN": "আমি হারিয়ে গেছি (Ami hariye gechi)",
  },
  "Where is the police station?": {
    "hi-IN": "पुलिस स्टेशन कहाँ है? (Police station kahan hai?)",
    "en-US": "Where is the nearest police station?",
    "es-ES": "¿Dónde está la comisaría de policía más cercana?",
    "fr-FR": "Où est le poste de police le plus proche?",
    "de-DE": "Wo ist die nächste Polizeidienststelle?",
    "ja-JP": "最寄りの警察署はどこですか？ (Moyori no keisatsusho wa doko desu ka?)",
    "bn-IN": "নিকটস্থ পুলিশ স্টেশন কোথায়? (Nikotostho police station kothay?)",
  },
};

const LANG_OPTIONS = [
  { code: "hi-IN", label: "Hindi (हिंदी)" },
  { code: "en-US", label: "English (US)" },
  { code: "es-ES", label: "Spanish (Español)" },
  { code: "fr-FR", label: "French (Français)" },
  { code: "de-DE", label: "German (Deutsch)" },
  { code: "ja-JP", label: "Japanese (日本語)" },
  { code: "bn-IN", label: "Bengali (বাংলা)" },
];

function EmergencyTranslator() {
  const [selectedPreset, setSelectedPreset] = useState("I need help");
  const [inputText, setInputText] = useState("I need help");
  const [targetLang, setTargetLang] = useState("hi-IN");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const translatedText = useMemo(() => {
    if (TRANSLATION_PRESETS[inputText]?.[targetLang]) {
      return TRANSLATION_PRESETS[inputText][targetLang];
    }
    if (TRANSLATION_PRESETS[selectedPreset]?.[targetLang]) {
      return TRANSLATION_PRESETS[selectedPreset][targetLang];
    }
    return `${inputText} [${LANG_OPTIONS.find((l) => l.code === targetLang)?.label}]`;
  }, [inputText, selectedPreset, targetLang]);

  const handlePlayAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Speech Synthesis is not supported in this browser.");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const textToSpeak = translatedText.replace(/\(.*\)/, "").trim() || inputText;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = targetLang;
      utterance.rate = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) => v.lang.toLowerCase() === targetLang.toLowerCase() || v.lang.includes(targetLang.split("-")[0])
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      toast.success("Playing phrase audio", { icon: <Volume2 size={14} /> });
    } catch {
      toast.error("Could not play phrase audio.");
    }
  };

  const handleMicToggle = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice recognition is supported in Google Chrome & Edge browsers.", {
        description: "Please type your emergency phrase into the text input.",
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Listening... Speak your emergency phrase now.", { icon: <Mic size={14} /> });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          setSelectedPreset("");
          toast.success(`Transcribed: "${transcript}"`);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Speech recognition error. Please try again.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      toast.error("Could not start microphone input.");
    }
  };

  return (
    <div className="rounded-[24px] border border-ink/8 bg-white p-6 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4eddd] text-ink">
            <Languages size={18} />
          </div>
          <div>
            <p className="section-kicker text-teal">Emergency Translator</p>
            <h3 className="font-display text-2xl tracking-[-0.04em]">Make yourself understood.</h3>
          </div>
        </div>

        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="rounded-xl border border-ink/15 bg-paper px-3 py-1.5 text-xs font-bold text-ink outline-none cursor-pointer hover:border-teal"
        >
          {LANG_OPTIONS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {Object.keys(TRANSLATION_PRESETS).map((phrase) => (
          <button
            key={phrase}
            onClick={() => {
              setSelectedPreset(phrase);
              setInputText(phrase);
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              inputText === phrase
                ? "bg-teal text-white shadow-xs"
                : "bg-paper text-ink/70 hover:bg-stone-200 border border-ink/8"
            }`}
          >
            {phrase}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setSelectedPreset("");
          }}
          placeholder="Type phrase or speak..."
          className="flex-1 rounded-2xl border border-ink/15 bg-paper px-4 py-2.5 text-xs font-bold text-ink placeholder-ink/40 outline-none focus:border-teal"
        />

        <button
          onClick={handleMicToggle}
          className={`flex items-center justify-center h-10 w-10 rounded-2xl transition cursor-pointer shrink-0 ${
            isListening
              ? "bg-red-600 text-white animate-pulse shadow-md"
              : "bg-paper hover:bg-stone-200 text-ink border border-ink/15"
          }`}
          title={isListening ? "Listening... Click to stop" : "Speak via Microphone"}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
      </div>

      <div className="rounded-2xl bg-[#f8f5ee] p-4 border border-ink/8 flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-base font-extrabold text-ink leading-snug">{translatedText}</p>
          <p className="text-[11px] font-semibold text-ink/50">
            Target Language: {LANG_OPTIONS.find((l) => l.code === targetLang)?.label}
          </p>
        </div>

        <button
          onClick={handlePlayAudio}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer shrink-0 ${
            isSpeaking ? "bg-amber-500 text-white shadow-md animate-pulse" : "bg-teal hover:bg-teal/90 text-white shadow-xs"
          }`}
        >
          <Volume2 size={15} />
          <span>{isSpeaking ? "Speaking..." : "Play Audio"}</span>
        </button>
      </div>
    </div>
  );
}

function SafetyView({
  sharing,
  setSharing,
  checkIn,
  setCheckIn,
  onAlert,
  setTab,
}: {
  sharing: boolean;
  setSharing: (v: boolean) => void;
  checkIn: boolean;
  setCheckIn: (v: boolean) => void;
  onAlert: () => void;
  setTab: (tab: Tab) => void;
}) {
  const { userLocation, formatDistance } = useLocationContext();

  // ── Location Sharing State Machine ──────────────────────────
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareDurationMinutes, setShareDurationMinutes] = useState<number>(30);
  const [shareSecondsLeft, setShareSecondsLeft] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  // ── Safety Check-In State Machine ───────────────────────────
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInIntervalMinutes, setCheckInIntervalMinutes] = useState<number>(30);
  const [checkInSecondsLeft, setCheckInSecondsLeft] = useState<number | null>(null);
  const [isMissedAlertOpen, setIsMissedAlertOpen] = useState(false);
  const [missedGraceSeconds, setMissedGraceSeconds] = useState(60);

  // Location sharing timer effect
  useEffect(() => {
    let interval: any = null;
    if (sharing && shareSecondsLeft !== null && shareSecondsLeft > 0) {
      interval = setInterval(() => {
        setShareSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (sharing && shareSecondsLeft === 0) {
      setSharing(false);
      setShareSecondsLeft(null);
      toast.info("Location sharing session duration ended.");
    }
    return () => clearInterval(interval);
  }, [sharing, shareSecondsLeft, setSharing]);

  // Safety check-in timer effect
  useEffect(() => {
    let interval: any = null;
    if (checkIn && checkInSecondsLeft !== null && checkInSecondsLeft > 0) {
      interval = setInterval(() => {
        setCheckInSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (checkIn && checkInSecondsLeft === 0) {
      setIsMissedAlertOpen(true);
      setMissedGraceSeconds(60);
    }
    return () => clearInterval(interval);
  }, [checkIn, checkInSecondsLeft]);

  // Missed check-in grace timer effect
  useEffect(() => {
    let interval: any = null;
    if (isMissedAlertOpen && missedGraceSeconds > 0) {
      interval = setInterval(() => {
        setMissedGraceSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (isMissedAlertOpen && missedGraceSeconds === 0) {
      toast.error("MISSED CHECK-IN! Emergency alert dispatched to trusted contacts.", { duration: 8000 });
    }
    return () => clearInterval(interval);
  }, [isMissedAlertOpen, missedGraceSeconds]);

  // Actions
  const handleStartLocationSharing = (mins: number) => {
    const newSessionId = `disha-loc-${Math.floor(100000 + Math.random() * 900000)}`;
    setSessionId(newSessionId);
    setShareDurationMinutes(mins);
    setShareSecondsLeft(mins > 0 ? mins * 60 : null);
    setSharing(true);
    setIsShareModalOpen(false);
    toast.success("Live GPS Location Sharing Active!", {
      description: mins > 0 ? `Duration: ${mins} mins` : "Sharing until manually stopped",
    });
  };

  const copyTrackingLink = () => {
    const link = `https://disha.app/track/${sessionId || "disha-demo-session"}`;
    navigator.clipboard?.writeText(link);
    setIsCopied(true);
    toast.success("Live tracking link copied!", { description: link });
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleStartCheckIn = (intervalMins: number) => {
    setCheckInIntervalMinutes(intervalMins);
    setCheckInSecondsLeft(intervalMins * 60);
    setCheckIn(true);
    setIsCheckInModalOpen(false);
    toast.success(`Safety Check-in active (Every ${intervalMins} mins)`);
  };

  const handleMarkSafe = () => {
    setCheckInSecondsLeft(checkInIntervalMinutes * 60);
    setIsMissedAlertOpen(false);
    toast.success("Status confirmed: You are safe!", { description: "Timer reset for next check-in." });
  };

  const handleExtendCheckIn = () => {
    setCheckInSecondsLeft((prev) => (prev ? prev + 15 * 60 : 15 * 60));
    toast.success("Check-in extended by 15 minutes");
  };

  const formatTimer = (secs: number | null) => {
    if (secs === null) return "Until Stopped";
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="animate-enter max-w-5xl mx-auto space-y-6">
      <PageIntro
        eyebrow="Safety signals & assistance"
        title="Ground truth you can act on."
        body="Structured emergency directory, live location tracking, and speech emergency translator."
        icon={<ShieldCheck />}
      />

      {/* Safety State Cards */}
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-ink/8 bg-white p-6 sm:p-8 space-y-5">
          <div className="flex items-end justify-between border-b border-ink/8 pb-4">
            <div>
              <p className="section-kicker text-teal">Safety state</p>
              <h2 className="mt-2 font-display text-3xl tracking-[-0.05em]">Stay grounded.</h2>
            </div>
            <span className="rounded-full bg-[#e5f0ec] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-teal">
              Active session
            </span>
          </div>

          <div className="space-y-4">
            {/* Location Sharing Toggle */}
            <SafetyToggle
              icon={<LocateFixed />}
              label="Share location"
              detail={
                sharing
                  ? `LIVE SHARING ACTIVE (${formatTimer(shareSecondsLeft)})`
                  : "Off · Click to configure duration"
              }
              active={sharing}
              onClick={() => {
                if (sharing) {
                  setSharing(false);
                  setShareSecondsLeft(null);
                  toast.info("Location sharing stopped.");
                } else {
                  setIsShareModalOpen(true);
                }
              }}
            />

            {/* Active Location Sharing Link Banner */}
            {sharing && (
              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 animate-enter">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>Tracking Link Ready:</span>
                  <span className="font-mono text-emerald-800 underline truncate max-w-[180px]">
                    https://disha.app/track/{sessionId || "demo"}
                  </span>
                </div>
                <button
                  onClick={copyTrackingLink}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <Copy size={13} />
                  <span>{isCopied ? "Copied!" : "Copy Live Link"}</span>
                </button>
              </div>
            )}

            {/* Safety Check-In Toggle */}
            <SafetyToggle
              icon={<Radio />}
              label="Safety check-in"
              detail={
                checkIn
                  ? `Time remaining: ${formatTimer(checkInSecondsLeft)}`
                  : "Paused · Click to start timer"
              }
              active={checkIn}
              onClick={() => {
                if (checkIn) {
                  setCheckIn(false);
                  setCheckInSecondsLeft(null);
                  toast.info("Safety check-in paused.");
                } else {
                  setIsCheckInModalOpen(true);
                }
              }}
            />

            {/* Active Check-In Control Banner */}
            {checkIn && (
              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 space-y-3 animate-enter">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <Clock3 size={15} className="text-amber-700 animate-pulse" />
                    <span>Check-in Timer: {formatTimer(checkInSecondsLeft)}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Interval: Every {checkInIntervalMinutes}m
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkSafe}
                    className="flex-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white py-2 text-xs font-extrabold shadow-xs transition cursor-pointer"
                  >
                    I'M SAFE (Reset)
                  </button>
                  <button
                    onClick={handleExtendCheckIn}
                    className="flex-1 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 py-2 text-xs font-bold border border-amber-300 transition cursor-pointer"
                  >
                    +15 MINS
                  </button>
                </div>
              </div>
            )}

            {/* Incident Simulation Toggle */}
            <SafetyToggle
              icon={<AlertTriangle />}
              label="Simulate Incident"
              detail="Trigger live hazard modal"
              active={false}
              onClick={onAlert}
            />
          </div>
        </div>

        {/* Nearby Assistance */}
        <div className="rounded-[28px] border border-ink/8 bg-white p-6 sm:p-8">
          <div className="flex items-end justify-between border-b border-ink/8 pb-4">
            <div>
              <p className="section-kicker text-teal">Nearby assistance</p>
              <h2 className="mt-2 font-display text-3xl tracking-[-0.05em]">Help, if you need it.</h2>
            </div>
            <Navigation className="text-teal" />
          </div>
          <div className="mt-6 space-y-3">
            {nearbyHelp.map((item) => (
              <div key={item.name} className="flex items-center gap-3 rounded-2xl bg-paper px-3.5 py-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e5f0ec] text-teal">
                  {item.type === "Hospital" ? (
                    <Hospital size={17} />
                  ) : item.type === "Police" ? (
                    <ShieldCheck size={17} />
                  ) : (
                    <HeartHandshake size={17} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.name}</p>
                  <p className="mt-1 text-xs text-ink/45">
                    {item.type} · {item.signal}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800">
                  {formatDistance(item.lat, item.lng)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <Link
              href="/map"
              className="inline-flex items-center text-xs font-bold uppercase tracking-[0.16em] text-teal hover:underline"
            >
              Open map <ArrowUpRight size={14} className="ml-1 inline" />
            </Link>
            <Link
              href="/disaster"
              className="inline-flex items-center text-xs font-bold uppercase tracking-[0.16em] text-red-600 hover:underline"
            >
              Disaster hub <ShieldAlert size={14} className="ml-1 inline" />
            </Link>
          </div>
        </div>
      </div>

      {/* Directory + Upgraded Emergency Translator */}
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-[24px] border border-ink/8 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f8e8e2] text-ember">
              <Phone size={17} />
            </div>
            <div>
              <p className="section-kicker text-ember">Emergency directory</p>
              <h3 className="font-display text-2xl tracking-[-0.04em]">Contacts at a glance</h3>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {authorities.slice(0, 4).map((item) => (
              <a
                key={item.label}
                href={`tel:${item.number}`}
                className="rounded-2xl border border-ink/8 p-3 text-left hover:border-ember/35 transition block"
              >
                <span className="block text-xs font-bold">{item.label}</span>
                <span className="mt-1 block text-lg font-semibold text-ember">{item.number}</span>
                <span className="mt-1 block text-[9px] leading-4 text-ink/40">Direct tel: link</span>
              </a>
            ))}
          </div>
        </div>

        {/* Upgraded Speech Translator Component */}
        <EmergencyTranslator />
      </div>

      {/* ── MODAL 1: LOCATION SHARING SETUP ──────────────────────────── */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-enter">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-ink space-y-4">
            <div className="flex items-center justify-between border-b border-ink/8 pb-3">
              <div className="flex items-center gap-2 text-teal font-extrabold">
                <LocateFixed size={18} />
                <span>Share Live GPS Location</span>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="rounded-full p-1 text-ink/40 hover:bg-stone-100"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-ink/60 font-medium">
              Select session duration. Trusted contacts will receive a live tracking link.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { mins: 15, label: "15 Mins" },
                { mins: 30, label: "30 Mins" },
                { mins: 60, label: "1 Hour" },
                { mins: 0, label: "Until Stopped" },
              ].map((opt) => (
                <button
                  key={opt.mins}
                  onClick={() => handleStartLocationSharing(opt.mins)}
                  className="rounded-2xl border border-ink/15 bg-paper hover:bg-teal/10 hover:border-teal p-3.5 text-center font-extrabold text-xs text-ink transition cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: SAFETY CHECK-IN SETUP ──────────────────────────── */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-enter">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-ink space-y-4">
            <div className="flex items-center justify-between border-b border-ink/8 pb-3">
              <div className="flex items-center gap-2 text-amber-700 font-extrabold">
                <Radio size={18} />
                <span>Configure Safety Check-In</span>
              </div>
              <button
                onClick={() => setIsCheckInModalOpen(false)}
                className="rounded-full p-1 text-ink/40 hover:bg-stone-100"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-ink/60 font-medium">
              Choose check-in interval. You will need to tap "I'm Safe" before the timer expires.
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {[15, 30, 45].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleStartCheckIn(mins)}
                  className="rounded-2xl border border-ink/15 bg-paper hover:bg-amber-100 hover:border-amber-400 p-3.5 text-center font-extrabold text-xs text-ink transition cursor-pointer"
                >
                  {mins} Mins
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: MISSED CHECK-IN EMERGENCY ALERT ───────────────────── */}
      {isMissedAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/80 p-4 backdrop-blur-md animate-enter">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-red-500 bg-[#170909] p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-red-600/30 p-3 text-red-400 border border-red-500/40 shrink-0">
                <AlertOctagon size={28} className="animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg leading-snug">Safety Check-In Missed!</h3>
                <p className="text-xs text-red-300 font-medium">
                  Dispatching alert to trusted contacts in {missedGraceSeconds}s...
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-red-900/30 p-4 border border-red-500/30 text-center space-y-1">
              <span className="text-3xl font-extrabold text-red-400 font-mono">00:{missedGraceSeconds.toString().padStart(2, "0")}</span>
              <p className="text-[11px] text-red-200">Tap below to cancel emergency response.</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleMarkSafe}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-900/40 transition cursor-pointer"
              >
                I AM SAFE — CANCEL EMERGENCY
              </button>

              <a
                href="tel:112"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 py-3 text-xs font-extrabold text-white transition cursor-pointer"
              >
                <Phone size={14} />
                <span>Call SOS 112</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SafetyToggle({ icon, label, detail, active, onClick }: { icon: React.ReactNode; label: string; detail: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-[#f1bd58]/50 bg-[#f1bd58]/10" : "border-white/12 bg-white/6"}`}>
      <span className={active ? "text-[#f1bd58]" : "text-paper/55"}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{label}</span>
        <span className="mt-1 block truncate text-xs text-paper/45">{detail}</span>
      </span>
      <span className={`h-5 w-9 rounded-full p-1 ${active ? "bg-[#f1bd58]" : "bg-white/15"}`}>
        <span className={`block h-3 w-3 rounded-full bg-white transition ${active ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

function IncidentReportModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"Hazard" | "Harassment" | "Medical">("Hazard");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);

    fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, description, lat: 26.9855, lng: 75.8513, location: "Amer, Jaipur" }),
    })
      .then((r) => r.json())
      .then((res) => {
        setLoading(false);
        if (res.success) {
          toast.success("Safety incident reported successfully!");
          onClose();
        } else {
          toast.error(res.error || "Failed to submit report");
        }
      })
      .catch(() => {
        setLoading(false);
        toast.error("Network error submitting incident report");
      });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm animate-enter">
      <div className="w-full max-w-md rounded-[28px] bg-paper p-6 text-ink shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-ember font-bold">
            <AlertTriangle size={18} />
            <span>Report Safety Incident</span>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink/50 hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-ink/60 mb-1">Incident Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Hazard", "Harassment", "Medical"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-xl py-2 text-xs font-bold transition ${type === t ? "bg-ember text-white" : "border border-ink/10 bg-white text-ink/70"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-ink/60 mb-1">Description / Location Details</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide clear details (e.g. Broken pavement along Amer fort lower road)..."
              className="w-full rounded-2xl border border-ink/12 bg-white p-3 text-sm outline-none focus:border-teal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-xs font-bold text-ink/60">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-xl bg-ember px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-ember/90">
              {loading ? "Submitting..." : "Submit Incident Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssistantView({ hours, context }: { hours: number; context: DemoContext }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string; itinerary?: any[] }>>([
    {
      sender: "bot",
      text: "Hello! I am your DISHA AI Assistant. Ask me anything like 'I have 5 hours in Jaipur', 'Find hidden gems nearby', or 'Safe routes after dark'.",
    },
  ]);

  function handleSend() {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userText, hours, context }),
    })
      .then((r) => r.json())
      .then((res) => {
        setLoading(false);
        if (res.success) {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: res.reply, itinerary: res.itinerary },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "I'm sorry, I couldn't process that request right now." },
          ]);
        }
      })
      .catch(() => {
        setLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Based on your 4-hour window in Jaipur: start early at Amber Fort, explore Panna Meena stepwell, and catch golden hour at Jal Mahal.",
            itinerary: createItinerary(hours, context),
          },
        ]);
      });
  }

  return (
    <div className="animate-enter max-w-4xl mx-auto">
      <PageIntro
        eyebrow="AI tourist assistant"
        title="Ask the city, simply."
        body="A calm planning layer for local context, phrasing, and next steps. Connected to backend API routes with deterministic fallbacks when AI keys are unconfigured."
        icon={<Bot />}
      />

      <div className="rounded-[28px] border border-ink/8 bg-white p-5 sm:p-8">
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "bot" && (
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-teal text-paper font-bold">
                  <Bot size={18} />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-6 ${msg.sender === "user" ? "bg-ink text-paper rounded-tr-sm" : "bg-paper text-ink/80 rounded-tl-sm"}`}>
                <p>{msg.text}</p>

                {msg.itinerary && msg.itinerary.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-ink/10 pt-3">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">Structured Itinerary Response:</p>
                    {msg.itinerary.map((item, i) => (
                      <div key={i} className="rounded-xl bg-white p-3 border border-ink/8 text-ink text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span>{item.time} — {item.title}</span>
                          <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[9px] text-teal">{item.tag}</span>
                        </div>
                        <p className="mt-1 text-ink/60">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-teal text-paper font-bold">
                  M
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-teal text-paper font-bold">
                <Bot size={18} />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-paper p-4 text-sm text-ink/50 italic">
                Thinking / computing structured response...
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2 rounded-2xl border border-ink/10 p-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Ask about Jaipur (e.g. 'I have 5 hours', 'Find hidden gems')..."
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-ink/35"
          />
          <button onClick={handleSend} disabled={loading} className="rounded-xl bg-teal px-5 py-2.5 text-sm font-bold text-paper transition hover:bg-teal/90">
            Send
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => setInput("I have 5 hours in Jaipur")} className="rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-[10px] font-bold text-ink/70 hover:border-teal">
            "I have 5 hours"
          </button>
          <button onClick={() => setInput("Find hidden gems nearby")} className="rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-[10px] font-bold text-ink/70 hover:border-teal">
            "Find hidden gems"
          </button>
          <button onClick={() => setInput("Safe after dark routes")} className="rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-[10px] font-bold text-ink/70 hover:border-teal">
            "Safe after dark routes"
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="animate-enter max-w-4xl mx-auto">
      <PageIntro eyebrow="Your travel profile" title="Set your comfort layer." body="Privacy, location, and communication preferences stay visible and controllable." icon={<Users />} />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { icon: <LocateFixed />, title: "Precise location", detail: "Only used with explicit permission and limited sharing windows.", action: "Manage permission" },
          { icon: <HeartHandshake />, title: "Trusted Circle", detail: "Add people who can receive a check-in or live location session.", action: "Add a contact" },
          { icon: <Moon />, title: "Safe After Dark", detail: "Prefer better-lit route signals when late-night context is active.", action: "Set preference" },
          { icon: <Languages />, title: "Language", detail: "English for interface · Hindi phrases available in Safety Center.", action: "Change language" },
        ].map((item) => (
          <div key={item.title} className="rounded-[24px] border border-ink/8 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-paper text-teal">{item.icon}</div>
              <ChevronRight size={17} className="text-ink/30" />
            </div>
            <h3 className="mt-6 font-display text-2xl tracking-[-0.04em]">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/55">{item.detail}</p>
            <button className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-teal">{item.action}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageIntro({ eyebrow, title, body, icon }: { eyebrow: string; title: string; body: string; icon: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 border-b border-ink/8 pb-6 sm:flex-row sm:items-end">
      <div>
        <p className="section-kicker text-teal">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl font-display text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.9] tracking-[-0.06em]">{title}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-ink/60 sm:text-base">{body}</p>
      </div>
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#e5f0ec] text-teal">{icon}</div>
    </div>
  );
}

function PlaceSheet({
  place,
  scoreOpen,
  setScoreOpen,
  onClose,
  saved,
  planned,
  onToggleSave,
  onTogglePlan,
}: {
  place: Place;
  scoreOpen: boolean;
  setScoreOpen: (value: boolean) => void;
  onClose: () => void;
  saved: boolean;
  planned: boolean;
  onToggleSave: () => void;
  onTogglePlan: () => void;
}) {
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 backdrop-blur-sm sm:items-center animate-enter">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-paper p-5 shadow-2xl sm:p-7 border border-ink/10">
        <div className="flex items-start justify-between">
          <div>
            <span className={pillClass}>{place.category}</span>
            <h2 className="mt-4 font-display text-4xl tracking-[-0.06em]">{place.name}</h2>
            <p className="mt-2 text-sm text-ink/50">
              <MapPin size={13} className="mr-1 inline" /> {place.neighborhood} · {place.duration}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSave}
              className={`grid h-10 w-10 place-items-center rounded-full transition-all duration-200 ${saved ? "bg-teal/10 text-teal" : "bg-white text-ink/40 hover:text-teal"}`}
              aria-label={saved ? "Unsave place" : "Save place"}
            >
              {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
            <button onClick={onClose} className="rounded-full bg-white p-2 text-ink/50 hover:bg-black/5">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mt-5 relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
          <PlaceImage src={place.image} alt={place.name} className="h-full w-full" />
        </div>
        <p className="mt-5 text-sm leading-6 text-ink/65">{place.description}</p>

        <div className="mt-5 rounded-2xl bg-[#e5f0ec] p-4">
          <div className="flex items-center gap-2 text-teal">
            <Sun size={16} />
            <span className="text-xs font-bold uppercase tracking-[0.16em]">Best-time signal</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-ink/70">{place.signal}</p>
        </div>

        <button
          onClick={() => setScoreOpen(!scoreOpen)}
          className="mt-5 flex w-full items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3 text-left transition-all duration-200 hover:border-teal/30"
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <CircleHelp size={16} className="text-teal" /> Why this score?
          </span>
          <span className="score-badge">
            <span>{place.score}</span>
            <small>/100</small>
          </span>
        </button>

        {scoreOpen && (
          <div className="mt-3 rounded-2xl border border-ink/8 bg-white p-4 animate-enter">
            <p className="text-xs leading-5 text-ink/50">Discovery Score = Quality + Local Relevance + Uniqueness + Accessibility − Tourist Crowding.</p>
            <div className="mt-4 space-y-3">
              {scoreFactors(place).map(([label, value, detail]) => (
                <div key={label} className="grid grid-cols-[1fr_auto] gap-3">
                  <div>
                    <p className="text-xs font-bold">{label}</p>
                    <p className="mt-1 text-[11px] leading-4 text-ink/45">{detail}</p>
                  </div>
                  <span className={`text-sm font-bold ${value < 0 ? "text-ember" : "text-teal"}`}>{value > 0 ? "+" : ""}{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-ink/8 pt-3 text-right text-sm font-bold">
              Total <span className="ml-2 text-teal">{place.score}</span>
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            onClick={onTogglePlan}
            className={`w-full rounded-2xl py-3.5 text-sm font-bold transition-all duration-200 ${planned ? "bg-[#e5f0ec] text-teal" : "bg-teal text-paper hover:bg-teal/90"}`}
          >
            {planned ? (
              <>
                <Check size={16} className="mr-1 inline" /> Added to plan
              </>
            ) : (
              <>
                <Plus size={16} className="mr-1 inline" /> Add to today's plan
              </>
            )}
          </button>
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white py-3.5 text-sm font-bold text-ink/70 transition hover:border-teal hover:text-teal"
          >
            <ExternalLink size={15} /> Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

function DesktopNav({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  return (
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 hidden lg:flex items-center gap-1 rounded-full border border-ink/10 bg-white/90 p-1.5 shadow-xl backdrop-blur-md">
      {navItems.map((item) => {
        const Icon = item.icon;
        if (item.type === "link") {
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold text-ink/65 hover:text-teal hover:bg-paper transition duration-200"
            >
              <Icon size={15} /> {item.label}
            </Link>
          );
        }
        return (
          <button
            key={item.label}
            onClick={() => setTab(item.tab)}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition duration-200 ${
              tab === item.tab ? "bg-ink text-paper shadow-sm" : "text-ink/65 hover:text-teal hover:bg-paper"
            }`}
          >
            <Icon size={15} /> {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function MobileNav({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-ink/10 bg-white/95 px-2 py-2 backdrop-blur-md lg:hidden shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        if (item.type === "link") {
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-w-0 flex-col items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-ink/45 hover:text-teal"
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        }
        return (
          <button
            key={item.label}
            onClick={() => setTab(item.tab)}
            className={`flex min-w-0 flex-col items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${
              tab === item.tab ? "text-teal" : "text-ink/45"
            }`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
            {tab === item.tab && <span className="h-1 w-1 rounded-full bg-teal" />}
          </button>
        );
      })}
    </nav>
  );
}
