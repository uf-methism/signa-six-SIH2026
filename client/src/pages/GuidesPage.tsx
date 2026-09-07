/* Civic Calm style: verified local guides directory for safe, expert-guided exploration. */
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  HeartHandshake,
  Languages,
  MapPin,
  MessageCircle,
  Phone,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { localGuides, communityVolunteers, type Guide } from "@/lib/guidesData";
import { VolunteerChatDrawer } from "@/components/VolunteerChatDrawer";

type GuideFilter = "All" | "Available Now" | "Govt. Approved" | "Safety Certified";
type ViewMode = "paid" | "volunteers";

export default function GuidesPage() {
  const [filter, setFilter] = useState<GuideFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("paid");
  const [chatVolunteer, setChatVolunteer] = useState<Guide | null>(null);

  const sourceList = viewMode === "paid" ? localGuides : communityVolunteers;

  const filteredGuides = useMemo(() => {
    return sourceList.filter((guide) => {
      // Volunteer mode: no badge filters
      if (viewMode === "volunteers") {
        if (filter === "Available Now" && !guide.available) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (
            !guide.name.toLowerCase().includes(q) &&
            !guide.specialty.toLowerCase().includes(q) &&
            !guide.languages.some((l) => l.toLowerCase().includes(q)) &&
            !guide.areasCovered.some((a) => a.toLowerCase().includes(q))
          ) return false;
        }
        return true;
      }
      // Paid guide filters
      if (filter === "Available Now" && !guide.available) return false;
      if (filter === "Govt. Approved" && guide.badge !== "Govt. Approved") return false;
      if (filter === "Safety Certified" && guide.badge !== "Safety Certified") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = guide.name.toLowerCase().includes(q);
        const matchesSpecialty = guide.specialty.toLowerCase().includes(q);
        const matchesLang = guide.languages.some((l) => l.toLowerCase().includes(q));
        const matchesArea = guide.areasCovered.some((a) => a.toLowerCase().includes(q));
        if (!matchesName && !matchesSpecialty && !matchesLang && !matchesArea) return false;
      }
      return true;
    });
  }, [filter, searchQuery, sourceList, viewMode]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-ink pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-ink/8 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="grid h-10 w-10 place-items-center rounded-xl bg-paper text-ink/70 hover:text-teal hover:bg-teal/10 transition"
              aria-label="Back to home"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold tracking-[-0.04em]">Local Guides & Volunteers</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/45">Jaipur & Amer Tourist Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-teal border border-teal/20">
              <ShieldCheck size={13} /> 100% Police & Govt. Verified
            </span>
            <Link
              href="/map"
              className="rounded-full border border-ink/10 bg-white px-3.5 py-1.5 text-xs font-bold text-ink/75 hover:border-teal hover:text-teal shadow-sm transition"
            >
              Map View
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 md:px-8 pt-6">
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#183d3b] p-6 text-paper sm:p-10 lg:p-12 mb-8">
          <div className="hero-wash" />
          <div className="relative z-10 max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b2ddd4]">
              <Sparkles size={12} className="text-[#f1bd58]" /> Tourism Ministry Certified
            </div>
            <h2 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.92] tracking-[-0.05em]">
              Explore with trusted <em className="text-[#f1bd58]">local experts.</em>
            </h2>
            <p className="mt-4 text-sm leading-6 text-paper/70 sm:text-base">
              Connect with verified local historians, safety companions, and community volunteers — free of charge.
            </p>
          </div>
        </section>

        {/* Paid / Volunteer Toggle */}
        <div className="mb-6 flex items-center justify-center">
          <div className="inline-flex items-center rounded-2xl border border-ink/10 bg-white p-1 shadow-sm">
            <button
              onClick={() => setViewMode("paid")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition duration-200 ${viewMode === "paid"
                  ? "bg-ink text-paper shadow-sm"
                  : "text-ink/60 hover:text-ink"
                }`}
            >
              <ShieldCheck size={13} /> Paid Verified Guides
            </button>
            <button
              onClick={() => setViewMode("volunteers")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition duration-200 ${viewMode === "volunteers"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-ink/60 hover:text-ink"
                }`}
            >
              <Zap size={13} /> Free Local Volunteers
              <span className="rounded-full bg-emerald-100 text-emerald-700 px-1.5 py-0.5 text-[9px] font-black">FREE</span>
            </button>
          </div>
        </div>

        {viewMode === "volunteers" && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3.5">
            <Zap size={16} className="text-emerald-700 shrink-0" />
            <p className="text-xs text-emerald-800 font-semibold">
              These are community residents offering <strong>free advice and local tips</strong> via in-app chat or phone call.
              No booking or payment needed — just tap Chat!
            </p>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(["All", "Available Now", ...(viewMode === "paid" ? ["Govt. Approved", "Safety Certified"] : [])] as GuideFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as GuideFilter)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition duration-200 ${filter === tab
                    ? "bg-ink text-paper shadow-sm"
                    : "border border-ink/10 bg-white text-ink/60 hover:border-teal hover:text-teal"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, language, area..."
              className="w-full rounded-full border border-ink/12 bg-white pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-teal"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Guides Grid */}
        {filteredGuides.length === 0 ? (
          <div className="my-12 rounded-3xl bg-white p-12 text-center border border-ink/8">
            <Users size={32} className="mx-auto text-ink/30 mb-3" />
            <h3 className="font-display text-xl font-bold">{viewMode === "volunteers" ? "No volunteers found" : "No guides found"}</h3>
            <p className="text-sm text-ink/50 mt-1">Try clearing your search query or switching filters.</p>
            <button
              onClick={() => { setFilter("All"); setSearchQuery(""); }}
              className="mt-4 rounded-full bg-teal px-5 py-2 text-xs font-bold text-paper shadow"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                isVolunteer={viewMode === "volunteers"}
                onOpenDetails={() => setSelectedGuide(guide)}
                onChat={() => setChatVolunteer(guide)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Guide Details Modal */}
      {selectedGuide && (
        <GuideDetailModal guide={selectedGuide} onClose={() => setSelectedGuide(null)} />
      )}

      {/* Volunteer Chat Drawer */}
      {chatVolunteer && (
        <VolunteerChatDrawer volunteer={chatVolunteer} onClose={() => setChatVolunteer(null)} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Guide Card Component
 * ───────────────────────────────────────────────────────────── */
function GuideCard({ guide, isVolunteer = false, onOpenDetails, onChat }: { guide: Guide; isVolunteer?: boolean; onOpenDetails: () => void; onChat?: () => void }) {
  const badgeColor =
    guide.badge === "Govt. Approved"
      ? "bg-[#0c7c74]/10 text-teal border-[#0c7c74]/20"
      : guide.badge === "Safety Certified"
        ? "bg-ember/10 text-ember border-ember/20"
        : guide.badge === "Community Volunteer"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-[#f1bd58]/15 text-[#8a5b00] border-[#f1bd58]/30";

  return (
    <article className="group overflow-hidden rounded-[24px] border border-ink/10 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Top Header Row */}
        <div className="flex items-start gap-4">
          <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-ink/8">
            <img src={guide.photo} alt={guide.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            {guide.available && (
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Available Now" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${badgeColor}`}>
                <ShieldCheck size={11} className="inline mr-1" />
                {guide.badge}
              </span>
              {isVolunteer && (
                <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]">
                  FREE
                </span>
              )}
            </div>

            <h3 className="mt-1 font-display text-xl font-bold tracking-[-0.03em] text-ink truncate">{guide.name}</h3>

            <p className="mt-0.5 text-xs font-semibold text-teal truncate">{guide.specialty}</p>

            <div className="mt-1.5 flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-bold text-ink">
                <Star size={13} className="fill-[#f1bd58] text-[#f1bd58]" /> {guide.rating}
              </span>
              <span className="text-ink/40">({guide.reviewsCount} reviews)</span>
              <span className="text-ink/30">·</span>
              <span className="font-semibold text-ink/60">{guide.experienceYears} yrs exp</span>
            </div>
          </div>
        </div>

        {/* Languages & Bio */}
        <div className="mt-4 border-t border-ink/8 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-ink/60">
            <Languages size={13} className="shrink-0 text-ink/40" />
            <span className="font-medium truncate">{guide.languages.join(", ")}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-ink/65 line-clamp-2">{guide.bio}</p>
        </div>

        {/* Areas Covered Pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {guide.areasCovered.slice(0, 3).map((area) => (
            <span key={area} className="rounded-md bg-paper px-2 py-0.5 text-[10px] font-medium text-ink/60">
              <MapPin size={10} className="inline mr-0.5" /> {area}
            </span>
          ))}
          {guide.areasCovered.length > 3 && (
            <span className="rounded-md bg-paper px-1.5 py-0.5 text-[10px] font-medium text-ink/40">
              +{guide.areasCovered.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-5 border-t border-ink/8 pt-3.5 flex items-center justify-between gap-3">
        <div>
          {isVolunteer ? (
            <>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 block font-black">Community Help</span>
              <span className="font-display text-lg font-bold text-emerald-600">FREE<small className="text-xs font-normal text-ink/50"> · No booking</small></span>
            </>
          ) : (
            <>
              <span className="text-[10px] uppercase tracking-wider text-ink/40 block font-bold">Standard Rate</span>
              <span className="font-display text-lg font-bold text-ink">₹{guide.hourlyRate}<small className="text-xs font-normal text-ink/50">/hr</small></span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${guide.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-xl bg-paper p-2.5 text-teal hover:bg-teal hover:text-white transition border border-teal/20"
            aria-label={`Call ${guide.name}`}
            title="Call Guide"
          >
            <Phone size={15} />
          </a>

          {isVolunteer ? (
            <button
              onClick={onChat}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-sm"
            >
              <MessageCircle size={14} /> Chat
            </button>
          ) : (
            <button
              onClick={onOpenDetails}
              className="rounded-xl bg-teal px-3.5 py-2 text-xs font-bold text-paper transition hover:bg-teal/90 shadow-sm"
            >
              View Profile
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Guide Full Details Modal
 * ───────────────────────────────────────────────────────────── */
function GuideDetailModal({ guide, onClose }: { guide: Guide; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-enter">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-paper p-6 text-ink shadow-2xl border border-ink/10 sm:p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="aspect-square h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 border border-ink/10">
              <img src={guide.photo} alt={guide.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-teal border border-teal/20">
                {guide.badge}
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.04em]">{guide.name}</h2>
              <p className="text-xs text-ink/60">{guide.specialty}</p>
            </div>
          </div>

          <button onClick={onClose} className="rounded-full bg-white p-2 text-ink/50 hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        {/* Rating & Availability */}
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 border border-ink/8 text-xs">
          <div>
            <span className="text-ink/45 block text-[10px] uppercase font-bold tracking-wider">Rating & Reviews</span>
            <span className="mt-1 flex items-center gap-1 font-bold text-sm text-ink">
              <Star size={14} className="fill-[#f1bd58] text-[#f1bd58]" /> {guide.rating} ({guide.reviewsCount} verified reviews)
            </span>
          </div>
          <div>
            <span className="text-ink/45 block text-[10px] uppercase font-bold tracking-wider">Status</span>
            <span className={`mt-1 font-bold text-sm block ${guide.available ? "text-emerald-600" : "text-amber-600"}`}>
              {guide.availabilityText}
            </span>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink/50">About the Guide</h3>
          <p className="mt-1.5 text-sm leading-6 text-ink/75">{guide.bio}</p>
        </div>

        {/* Verified Credentials Box */}
        <div className="mt-5 rounded-2xl bg-white p-4 border border-ink/8">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-teal flex items-center gap-1.5">
            <ShieldCheck size={15} /> Safety & Government Verification
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-emerald-600" />
              <span>License: <strong className="font-mono">{guide.credentials.licenseNo}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} className="text-emerald-600" />
              <span>Police Background Check</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} className="text-emerald-600" />
              <span>Local Identity Verified</span>
            </div>
            <div className="flex items-center gap-2">
              {guide.credentials.firstAidCertified ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span>First Aid & CPR Certified</span>
                </>
              ) : (
                <>
                  <span className="text-ink/30">—</span>
                  <span className="text-ink/50">Standard Escort</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Areas Covered */}
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink/50">Circuits & Areas Covered</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {guide.areasCovered.map((area) => (
              <span key={area} className="rounded-xl bg-white px-3 py-1 text-xs font-semibold text-ink border border-ink/10">
                <MapPin size={12} className="inline mr-1 text-teal" /> {area}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Triggers */}
        <div className="mt-6 grid grid-cols-2 gap-3 pt-2">
          <a
            href={`tel:${guide.phone}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-teal py-3.5 text-sm font-bold text-paper shadow hover:bg-teal/90 transition"
          >
            <Phone size={16} /> Call Guide Now
          </a>
          <a
            href={`https://wa.me/${guide.whatsapp}?text=Hi%20${encodeURIComponent(guide.name)},%20I%20found%20your%20profile%20on%20Travel%20Guardian.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-bold text-white shadow hover:bg-[#20bd5a] transition"
          >
            <MessageCircle size={16} /> WhatsApp Chat
          </a>
        </div>
      </div>
    </div>
  );
}
