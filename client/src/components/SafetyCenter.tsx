/**
 * DISHA Environmental Intelligence & Safety Center
 * Integrates Weather/Mobility Radar, Deterministic SOS, Environmental Alerts,
 * Guest Response Advisory, and Staff Incident Workflow.
 */

import React, { useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CloudRain,
  Compass,
  ExternalLink,
  LifeBuoy,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Thermometer,
  UserCheck,
  Users,
  Wind,
  X,
} from "lucide-react";
import {
  EnvironmentalAdapters,
  PropertyIncidentData,
} from "@/lib/environmentalAdapters";
import { DemoContext } from "@/lib/travelData";
import { toast } from "sonner";

interface SafetyCenterProps {
  demoContext: DemoContext;
  onRequestTransport?: () => void;
  onContactConcierge?: () => void;
  activeRole?: string;
}

export function SafetyCenter({
  demoContext,
  onRequestTransport,
  onContactConcierge,
  activeRole = "Guest",
}: SafetyCenterProps) {
  // Incidents State
  const [incidents, setIncidents] = useState<PropertyIncidentData[]>(() =>
    EnvironmentalAdapters.getInitialIncidents()
  );

  // Modals & Drawers
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<PropertyIncidentData | null>(null);

  // New Incident Form State
  const [reportCategory, setReportCategory] = useState<PropertyIncidentData["category"]>("Weather / Flood");
  const [reportLocation, setReportLocation] = useState<string>("Amber Fort Grounds");
  const [reportDescription, setReportDescription] = useState<string>("");
  const [reportSeverity, setReportSeverity] = useState<PropertyIncidentData["severity"]>("Medium");

  // Deterministic SOS Trigger Handler (Zero LLM reliance)
  const handleTriggerSos = () => {
    const timeFormatted = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const sosIncident: PropertyIncidentData = {
      id: `sos-${Date.now().toString().slice(-4)}`,
      time: timeFormatted,
      location: "Room 204 / Amber Fort Grounds (GPS: 26.9855, 75.8513)",
      category: "Guest Security",
      severity: "Critical",
      description: "DETERMINISTIC SOS ACTIVATION: Guest pressed Emergency SOS button. Immediate security check dispatched.",
      source: "Guest Report",
      status: "New",
      assignedStaff: "Resort Safety Officer",
      evidence: "Client press-and-hold trigger telemetry",
    };

    setIncidents((prev) => [sosIncident, ...prev]);
    setShowSosModal(true);
    toast.error("SOS Emergency Alert Dispatched to Hotel Control Room!");
  };

  // Status transition handler for staff
  const handleUpdateIncidentStatus = (
    id: string,
    newStatus: PropertyIncidentData["status"],
    staff?: string
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const updatedStaff = staff !== undefined ? staff : inc.assignedStaff;
          toast.success(`Incident ${id} updated to "${newStatus}"`);
          return {
            ...inc,
            status: newStatus,
            assignedStaff: updatedStaff,
          };
        }
        return inc;
      })
    );
  };

  // Report submission handler
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription) {
      toast.error("Please enter incident details.");
      return;
    }
    const timeFormatted = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const newInc: PropertyIncidentData = {
      id: `inc-${Date.now().toString().slice(-4)}`,
      time: timeFormatted,
      location: reportLocation || "Property Grounds",
      category: reportCategory,
      severity: reportSeverity,
      description: reportDescription,
      source: activeRole === "Guest" ? "Guest Report" : "Staff Dispatch",
      status: "New",
      assignedStaff: "Unassigned",
      evidence: "User submitted hazard report",
    };

    setIncidents((prev) => [newInc, ...prev]);
    toast.success("Safety incident reported! Operations team notified.");
    setShowReportModal(false);
    setReportDescription("");
  };

  const activeAlertsCount = incidents.filter((i) => i.status !== "Resolved" && i.status !== "Closed").length;

  return (
    <div className="animate-enter space-y-8 pb-12 text-[#1c2e2a]">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. SAFETY CENTER HEADER & EMERGENCY SOS TRIGGER
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[28px] bg-[#0f2420] p-6 text-paper sm:p-8 shadow-xl border border-white/10">
        <div className="hero-wash" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 border border-emerald-500/30">
                DISHA ENVIRONMENTAL & SAFETY MODULE
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-paper/60">
                PROTOTYPE DEMO RADAR
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-paper sm:text-4xl">
              Property & Environmental Safety
            </h1>
            <p className="mt-1 text-sm text-paper/70 font-sans">
              Context-aware guest assistance, deterministic emergency SOS, and property incident management
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-paper hover:bg-white/20 transition cursor-pointer"
            >
              <AlertTriangle size={15} className="text-amber-400" />
              <span>Report Incident</span>
            </button>

            {/* DETERMINISTIC SOS BUTTON (No LLM dependencies) */}
            <button
              onClick={handleTriggerSos}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg transition hover:bg-rose-700 cursor-pointer animate-pulse"
            >
              <Siren size={16} />
              <span>SOS EMERGENCY ASSISTANCE</span>
            </button>
          </div>
        </div>

        {/* Live Safety Status Bar */}
        <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-paper/50 mb-1">
              <span>Overall Safety Status</span>
              <ShieldCheck size={14} className="text-emerald-400" />
            </div>
            <div className="font-display text-xl font-bold text-emerald-400">Secure & Monitored</div>
            <div className="text-[10px] text-paper/60 mt-0.5">24/7 Security Patrol</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-paper/50 mb-1">
              <span>Weather Radar</span>
              <CloudRain size={14} className="text-sky-300" />
            </div>
            <div className="font-display text-xl font-bold text-amber-300">28°C · Rain Alert</div>
            <div className="text-[10px] text-paper/60 mt-0.5">Rain forecast 17:30–19:30</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-paper/50 mb-1">
              <span>Mobility & Traffic</span>
              <Navigation size={14} className="text-amber-400" />
            </div>
            <div className="font-display text-xl font-bold text-paper">NH-11 Bypass Active</div>
            <div className="text-[10px] text-paper/60 mt-0.5">+18m delay near valley</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-paper/50 mb-1">
              <span>Active Alerts</span>
              <ShieldAlert size={14} className="text-rose-400" />
            </div>
            <div className="font-display text-xl font-bold text-rose-300">{activeAlertsCount} Active</div>
            <div className="text-[10px] text-paper/60 mt-0.5">1 Weather · 1 Maintenance</div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. DEMONSTRABLE WEATHER SCENARIO & ADVISORY (GUEST & HOTEL RESPONSE)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="rounded-[24px] border border-amber-500/30 bg-gradient-to-r from-[#0f2420] via-[#16302b] to-[#0f2420] p-6 text-paper shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CloudRain size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">ENVIRONMENTAL WEATHER ADVISORY</span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">DEMO SCENARIO DETECTED</span>
              </div>
              <h2 className="font-display text-xl font-bold text-paper mt-0.5">
                Heavy rainfall is expected around 6 PM (17:30 – 19:30 Window)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 shrink-0">
            <span>85% Rain Probability</span>
          </div>
        </div>

        {/* Dual Response Columns: Guest Advisory vs Hotel Command Response */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* GUEST RESPONSE CARD */}
          <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#b2ddd4] flex items-center gap-1.5">
                <UserCheck size={14} /> Recommended Guest Guidance
              </span>
              <span className="text-[10px] text-paper/60">Guest View</span>
            </div>

            <p className="text-xs text-paper/90 leading-relaxed font-sans">
              <strong>Advisory:</strong> Consider returning to the property before weather conditions worsen at 17:30. DISHA shuttles are pre-staged at Amber Fort lower gate for return transfers.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => toast.info("Advisory Route: Amer Bypass -> Elevated Link Road -> Resort Gate")}
                className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-paper hover:bg-white/20 transition cursor-pointer"
              >
                View Advisory Route
              </button>
              <button
                onClick={() => {
                  if (onRequestTransport) onRequestTransport();
                  else toast.success("Shuttle pickup requested for Room 204!");
                }}
                className="rounded-xl bg-[#0C7C74] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#096660] transition cursor-pointer"
              >
                Request Shuttle Pickup
              </button>
              <button
                onClick={() => {
                  if (onContactConcierge) onContactConcierge();
                  else toast.info("Connecting to Front Desk Concierge...");
                }}
                className="rounded-xl border border-white/20 px-3 py-1.5 text-xs font-bold text-paper/80 hover:bg-white/10 transition cursor-pointer"
              >
                Contact Concierge
              </button>
            </div>

            <div className="text-[10px] text-paper/50 italic pt-1 border-t border-white/5">
              * Route navigation recommendations are advisory based on meteorological radar; please verify live local conditions.
            </div>
          </div>

          {/* HOTEL COMMAND CENTER RESPONSE CARD */}
          <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldAlert size={14} /> Potential Operational Impact
              </span>
              <span className="text-[10px] text-paper/60">Hotel Operations View</span>
            </div>

            <ul className="space-y-2 text-xs text-paper/85">
              <li className="flex items-center justify-between rounded-xl bg-white/5 p-2">
                <span><strong>12 guests currently outside</strong> (Amber Fort & Stepwell)</span>
                <span className="text-[10px] font-mono text-amber-300 font-bold">High Attention</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-white/5 p-2">
                <span><strong>4 transport requests</strong> near rain window</span>
                <span className="text-[10px] font-mono text-paper/70 font-bold">Action Needed</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-white/5 p-2">
                <span><strong>2 affected routes</strong> (Amer Valley Road & Old Pass)</span>
                <span className="text-[10px] font-mono text-rose-300 font-bold">Bypass Reroute</span>
              </li>
            </ul>

            <div className="pt-1 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-paper/50 block">Suggested Preparation:</span>
              <div className="text-xs text-paper/80 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Increase transport availability (Stage 3 SUVs)
              </div>
              <div className="text-xs text-paper/80 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Prepare lobby capacity (Masala chai & towel station)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. PROPERTY INCIDENT MANAGEMENT WORKFLOW (STAFF & MANAGER VIEW)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold tracking-tight text-[#0f2420]">
                Property Incident Workflow & Audit Queue
              </h2>
              <span className="rounded-full bg-rose-100 px-3 py-0.5 text-xs font-bold text-rose-800">
                {incidents.length} Logged
              </span>
            </div>
            <p className="text-xs text-ink/60 mt-0.5">
              Incident Lifecycle: New → Acknowledged → Investigating → Resolved → Closed
            </p>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#0C7C74] px-4 py-2 text-xs font-bold text-white hover:bg-[#096660] transition cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>Create New Incident</span>
          </button>
        </div>

        {/* Incidents Table */}
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-sm">
          <table className="w-full text-left text-xs text-ink">
            <thead className="bg-[#f7f4ee] border-b border-ink/10 text-[10px] font-bold uppercase tracking-wider text-ink/60">
              <tr>
                <th className="p-4">ID & Time</th>
                <th className="p-4">Location</th>
                <th className="p-4">Category</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Description</th>
                <th className="p-4">Source</th>
                <th className="p-4">Assigned Staff</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-paper/40 transition">
                  <td className="p-4 font-mono whitespace-nowrap">
                    <div className="font-bold text-ink">{inc.id}</div>
                    <div className="text-[10px] text-ink/50">{inc.time}</div>
                  </td>

                  <td className="p-4 font-semibold whitespace-nowrap">
                    {inc.location}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <span className="rounded-full border border-ink/10 bg-white px-2.5 py-1 text-[10px] font-bold uppercase text-ink/70">
                      {inc.category}
                    </span>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        inc.severity === "Critical"
                          ? "bg-rose-600 text-white"
                          : inc.severity === "High"
                          ? "bg-rose-100 text-rose-800"
                          : inc.severity === "Medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>

                  <td className="p-4 text-xs text-ink/80 max-w-[220px]">
                    <div className="line-clamp-2">{inc.description}</div>
                  </td>

                  <td className="p-4 text-[10px] font-bold text-ink/60 whitespace-nowrap">
                    {inc.source}
                  </td>

                  <td className="p-4 whitespace-nowrap font-medium text-ink/80">
                    {inc.assignedStaff}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        inc.status === "New"
                          ? "bg-rose-100 text-rose-800"
                          : inc.status === "Acknowledged"
                          ? "bg-amber-100 text-amber-800"
                          : inc.status === "Investigating"
                          ? "bg-sky-100 text-sky-800"
                          : inc.status === "Resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {inc.status}
                    </span>
                  </td>

                  <td className="p-4 text-right whitespace-nowrap space-x-1">
                    {inc.status === "New" && (
                      <button
                        onClick={() => handleUpdateIncidentStatus(inc.id, "Acknowledged")}
                        className="rounded-lg bg-amber-600 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-amber-700 transition cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                    {inc.status === "Acknowledged" && (
                      <button
                        onClick={() => handleUpdateIncidentStatus(inc.id, "Investigating")}
                        className="rounded-lg bg-[#0C7C74] text-white px-2.5 py-1 text-[11px] font-bold hover:bg-[#096660] transition cursor-pointer"
                      >
                        Investigate
                      </button>
                    )}
                    {inc.status === "Investigating" && (
                      <button
                        onClick={() => handleUpdateIncidentStatus(inc.id, "Resolved")}
                        className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-emerald-700 transition cursor-pointer"
                      >
                        Resolve ✓
                      </button>
                    )}
                    {inc.status === "Resolved" && (
                      <button
                        onClick={() => handleUpdateIncidentStatus(inc.id, "Closed")}
                        className="rounded-lg border border-ink/20 text-ink/60 px-2.5 py-1 text-[11px] font-bold hover:bg-ink/5 transition cursor-pointer"
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedIncident(inc)}
                      className="rounded-lg border border-ink/15 bg-white px-2 py-1 text-[11px] font-bold text-ink/70 hover:bg-paper transition cursor-pointer"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. EMERGENCY CONTACTS & SAFE MOBILITY DIRECTORY
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emergency Contacts Directory */}
        <div className="rounded-[24px] border border-ink/10 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <h3 className="font-display text-lg font-bold text-[#0f2420] flex items-center gap-2">
              <PhoneCall size={18} className="text-[#0C7C74]" /> Verified Emergency Contacts
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0C7C74]">24/7 Availability</span>
          </div>

          <div className="space-y-3">
            {[
              { title: "Jaipur Police Control Room", number: "100 / 112", role: "Local Law Enforcement" },
              { title: "Medical Emergency Ambulance", number: "108", role: "Emergency Medical Response" },
              { title: "Fire & Rescue Services", number: "101", role: "Fire Emergency" },
              { title: "Jaipur Heritage Resort Security", number: "+91 141 555 0199", role: "Hotel Control Room Direct Dial" },
            ].map((contact, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl bg-paper/60 p-3.5 border border-ink/5">
                <div>
                  <div className="font-bold text-sm text-ink">{contact.title}</div>
                  <div className="text-xs text-ink/60">{contact.role}</div>
                </div>
                <a
                  href={`tel:${contact.number}`}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0C7C74] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#096660] transition"
                >
                  <Phone size={13} /> {contact.number}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Safe Mobility Guidance & Route Advisories */}
        <div className="rounded-[24px] border border-ink/10 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <h3 className="font-display text-lg font-bold text-[#0f2420] flex items-center gap-2">
              <Compass size={18} className="text-[#0C7C74]" /> Safe Mobility Guidance
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Route Advisory Active
            </span>
          </div>

          <div className="space-y-3 text-xs text-ink/80">
            <div className="rounded-2xl bg-sky-50/70 p-4 border border-sky-100 space-y-1.5">
              <div className="font-bold text-sky-900 flex items-center gap-1.5">
                <Navigation size={14} /> Elevated Link Bypass Route
              </div>
              <p className="text-sky-950 leading-relaxed">
                Advisory route for airport departures during low-lying road rain runoff. Avoids Amer Valley bottleneck.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100 space-y-1.5">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Well-Lit Pedestrian Corridors
              </div>
              <p className="text-emerald-950 leading-relaxed">
                Resort grounds & main courtyard corridors illuminated until 02:00. 24/7 security station active at main gate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: DETERMINISTIC SOS ACTIVATION & DIRECTORY (OFFLINE READY)
      ────────────────────────────────────────────────────────────────────────── */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-enter">
          <div className="w-full max-w-lg rounded-[28px] bg-[#0f2420] p-6 text-paper shadow-2xl space-y-4 border border-rose-500/40">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Siren size={24} className="animate-pulse" />
                <h3 className="font-display text-2xl font-bold text-paper">DETERMINISTIC SOS ACTIVATED</h3>
              </div>
              <button
                onClick={() => setShowSosModal(false)}
                className="rounded-full p-1 text-paper/40 hover:text-paper transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Prototype Demo Warning Badge */}
            <div className="rounded-xl bg-rose-500/20 p-3 text-xs text-rose-200 border border-rose-500/30">
              <strong>PROTOTYPE DEMO SOS:</strong> This is a simulated local emergency alert for demonstration purposes. It does not dispatch real public emergency services.
            </div>

            <div className="space-y-3 text-xs text-paper/85">
              <div className="rounded-xl bg-white/5 p-3 space-y-1">
                <span className="text-paper/50 block text-[10px] uppercase font-bold">Recorded Location</span>
                <strong className="text-sm text-paper">Room 204 / Amber Fort Grounds (GPS: 26.9855, 75.8513)</strong>
              </div>

              <div>
                <span className="text-paper/50 block text-[10px] uppercase font-bold mb-2">Direct Emergency Dial Directory</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                    <div>
                      <div className="font-bold text-paper text-sm">Resort Security Desk</div>
                      <div className="text-[10px] text-paper/60">Direct Dial Hotel Control Room</div>
                    </div>
                    <a
                      href="tel:+911415550199"
                      className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                      +91 141 555 0199
                    </a>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                    <div>
                      <div className="font-bold text-paper text-sm">Jaipur Police Control Room</div>
                      <div className="text-[10px] text-paper/60">Local Law Enforcement</div>
                    </div>
                    <a
                      href="tel:100"
                      className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition"
                    >
                      Dial 100 / 112
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowSosModal(false)}
                className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold text-paper hover:bg-white/20 transition cursor-pointer"
              >
                Dismiss SOS Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: REPORT INCIDENT (GUEST & STAFF)
      ────────────────────────────────────────────────────────────────────────── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-enter">
          <form onSubmit={handleReportSubmit} className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl space-y-4 border border-ink/10 text-ink">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold">
                <AlertTriangle size={18} />
                <h3 className="font-display text-xl font-bold text-ink">Report Safety / Property Incident</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="rounded-full p-1 text-ink/40 hover:bg-paper hover:text-ink transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-ink/15 p-2 text-xs font-bold text-ink focus:border-[#0C7C74] focus:outline-none"
                >
                  <option value="Weather / Flood">Weather / Flood</option>
                  <option value="HVAC / Maintenance">HVAC / Maintenance</option>
                  <option value="Mobility Delay">Mobility Delay</option>
                  <option value="Guest Security">Guest Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Severity Level</label>
                <select
                  value={reportSeverity}
                  onChange={(e) => setReportSeverity(e.target.value as any)}
                  className="w-full rounded-xl border border-ink/15 p-2 text-xs font-bold text-ink focus:border-[#0C7C74] focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Incident Location</label>
              <input
                type="text"
                placeholder="e.g. Amer Valley Road Gate / Room 318"
                value={reportLocation}
                onChange={(e) => setReportLocation(e.target.value)}
                className="w-full rounded-xl border border-ink/15 p-2.5 text-xs font-bold text-ink focus:border-[#0C7C74] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Incident Description *</label>
              <textarea
                required
                rows={3}
                placeholder="Provide details about the incident or hazard..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="w-full rounded-xl border border-ink/15 p-2.5 text-xs font-sans text-ink focus:border-[#0C7C74] focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-ink/10">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="flex-1 rounded-xl border border-ink/15 py-2.5 text-xs font-bold text-ink/70 hover:bg-paper transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
              >
                Submit Incident Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
