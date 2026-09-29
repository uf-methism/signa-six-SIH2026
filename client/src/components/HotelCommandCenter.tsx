/**
 * DISHA Hotel Command Center
 * Context-Aware Hospitality Operations & Service Request Lifecycle Console
 */

import React, { useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  CloudRain,
  Compass,
  Filter,
  Flame,
  History,
  Info,
  Layers,
  MapPin,
  Navigation,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { ContextIntelligencePanel } from "@/components/ContextIntelligencePanel";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import {
  CATEGORY_SLA_MINUTES,
  DemoContext,
  ServiceTicket,
  ServiceTicketCategory,
  TicketAuditLog,
  TicketStateAction,
  classifyServiceRequestText,
  currentProperty,
} from "@/lib/travelData";
import { toast } from "sonner";

interface HotelCommandCenterProps {
  context: DemoContext;
  tickets: ServiceTicket[];
  setTickets: React.Dispatch<React.SetStateAction<ServiceTicket[]>>;
  activeRole: string;
}

export function HotelCommandCenter({
  context,
  tickets,
  setTickets,
  activeRole,
}: HotelCommandCenterProps) {
  // State for filtering & searching
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState<boolean>(false);
  const [reopenNote, setReopenNote] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics">("dashboard");

  // New ticket state
  const [newRoom, setNewRoom] = useState("");
  const [newGuest, setNewGuest] = useState("");
  const [newCategory, setNewCategory] = useState<ServiceTicketCategory>("Housekeeping");
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newPriority, setNewPriority] = useState<ServiceTicket["priority"]>("Medium");
  const [newAssigned, setNewAssigned] = useState("");
  const [newPreferredTime, setNewPreferredTime] = useState("Immediate");

  // KPI Calculations
  const occupancyPct = context.crowd === "Low" ? 45 : context.crowd === "High" ? 82 : 92;
  const totalOccupied = Math.round((occupancyPct / 100) * currentProperty.totalRooms);
  const openTickets = tickets.filter((t) => t.status !== "Completed" && t.status !== "Closed");
  const urgentCount = tickets.filter(
    (t) => (t.priority === "High" || t.priority === "Urgent") && t.status !== "Closed"
  ).length;

  // Available Staff for Assignment
  const staffList = [
    "Priya Singh",
    "Ramesh K.",
    "Technician Rajesh",
    "Chef David",
    "Driver Vikram",
    "Laundry Care Team",
    "Sous Chef Ankit",
    "Unassigned",
  ];

  // SLA Overdue helper
  const nowMs = Date.now();
  const isTicketOverdue = (t: ServiceTicket) => {
    if (t.status === "Closed" || t.status === "Completed") return false;
    const elapsedMinutes = (nowMs - t.createdTimeMs) / (1000 * 60);
    return elapsedMinutes > (t.slaMinutes || 15);
  };

  const overdueCount = tickets.filter(isTicketOverdue).length;

  // Analytics Metrics Calculation
  const ticketsWithResponse = tickets.filter((t) => t.responseTimeMinutes !== undefined);
  const avgResponseTime =
    ticketsWithResponse.length > 0
      ? (
          ticketsWithResponse.reduce((acc, t) => acc + (t.responseTimeMinutes || 0), 0) /
          ticketsWithResponse.length
        ).toFixed(1)
      : "4.5";

  const ticketsWithResolution = tickets.filter((t) => t.resolutionTimeMinutes !== undefined);
  const avgResolutionTime =
    ticketsWithResolution.length > 0
      ? (
          ticketsWithResolution.reduce((acc, t) => acc + (t.resolutionTimeMinutes || 0), 0) /
          ticketsWithResolution.length
        ).toFixed(1)
      : "22.0";

  const slaCompliantCount = tickets.filter((t) => {
    if (!t.responseTimeMinutes) return true;
    return t.responseTimeMinutes <= (t.slaMinutes || 15);
  }).length;
  const slaCompliancePct = Math.round((slaCompliantCount / (tickets.length || 1)) * 100);

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Open"
        ? t.status !== "Completed" && t.status !== "Closed"
        : statusFilter === "Overdue"
        ? isTicketOverdue(t)
        : t.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
    const matchesSearch =
      t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // State Machine Transition Handler
  const handleUpdateStatus = (
    ticketId: string,
    newStatus: ServiceTicket["status"],
    assignedStaff?: string,
    customActionNote?: string
  ) => {
    const timeFormatted = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const currentTime = Date.now();
          const updatedStaff = assignedStaff !== undefined ? assignedStaff : t.assignedStaff;

          // Determine State Machine Action
          let actionName: TicketStateAction = "Accepted";
          if (newStatus === "Accepted") actionName = "Accepted";
          else if (newStatus === "In Progress") actionName = t.status === "Completed" || t.status === "Closed" ? "Reopened" : "Started Work";
          else if (newStatus === "Completed") actionName = "Completed Work";
          else if (newStatus === "Closed") actionName = "Closed";

          // Calculate Response Time & Resolution Time
          let newAcceptedTime = t.acceptedTimeMs;
          let newStartedTime = t.startedTimeMs;
          let newCompletedTime = t.completedTimeMs;
          let newClosedTime = t.closedTimeMs;
          let calculatedResponseTime = t.responseTimeMinutes;
          let calculatedResolutionTime = t.resolutionTimeMinutes;

          if (newStatus === "Accepted" && !t.acceptedTimeMs) {
            newAcceptedTime = currentTime;
            calculatedResponseTime = Math.round((currentTime - t.createdTimeMs) / (1000 * 60));
          } else if (newStatus === "In Progress" && !t.startedTimeMs) {
            newStartedTime = currentTime;
            if (!t.acceptedTimeMs) {
              newAcceptedTime = currentTime;
              calculatedResponseTime = Math.round((currentTime - t.createdTimeMs) / (1000 * 60));
            }
          } else if (newStatus === "Completed" && !t.completedTimeMs) {
            newCompletedTime = currentTime;
            calculatedResolutionTime = Math.round((currentTime - t.createdTimeMs) / (1000 * 60));
          } else if (newStatus === "Closed") {
            newClosedTime = currentTime;
          }

          const auditEntry: TicketAuditLog = {
            timestamp: timeFormatted,
            user: activeRole === "Manager" ? "Duty Manager Ramesh" : "Priya Singh (Staff)",
            role: activeRole === "Manager" ? "Manager" : "Staff",
            action: actionName,
            fromStatus: t.status,
            toStatus: newStatus,
            note: customActionNote || `Status updated from ${t.status} to ${newStatus}`,
          };

          const updatedTicket: ServiceTicket = {
            ...t,
            status: newStatus,
            assignedStaff: updatedStaff,
            acceptedTimeMs: newAcceptedTime,
            startedTimeMs: newStartedTime,
            completedTimeMs: newCompletedTime,
            closedTimeMs: newClosedTime,
            responseTimeMinutes: calculatedResponseTime,
            resolutionTimeMinutes: calculatedResolutionTime,
            timestamp: `${t.timestamp} · ${newStatus} at ${timeFormatted.slice(0, 5)}`,
            history: [...(t.history || []), auditEntry],
          };

          if (selectedTicket && selectedTicket.id === ticketId) {
            setSelectedTicket(updatedTicket);
          }

          toast.success(`Ticket ${t.id} transitioned to "${newStatus}"`);
          return updatedTicket;
        }
        return t;
      })
    );
  };

  // Reopen Request Handler
  const handleReopenRequest = (ticketId: string) => {
    handleUpdateStatus(ticketId, "In Progress", undefined, reopenNote || "Reopened by staff for additional verification");
    setReopenNote("");
  };

  // Create Ticket Handler
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom || !newTitle) {
      toast.error("Please fill in room number and request title.");
      return;
    }
    const timeFormatted = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const aiResult = classifyServiceRequestText(`${newTitle} ${newDetails}`);
    const slaLimit = CATEGORY_SLA_MINUTES[newCategory] || 15;

    const initialAudit: TicketAuditLog = {
      timestamp: timeFormatted,
      user: newGuest || "Staff Logged",
      role: "Staff",
      action: "Created",
      note: `Logged for Room ${newRoom} (Category: ${newCategory}, SLA: ${slaLimit}m)`,
    };

    const newTkt: ServiceTicket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      roomNumber: newRoom,
      guestName: newGuest || "Guest",
      category: newCategory,
      title: newTitle,
      details: newDetails || "Staff initiated service ticket",
      priority: newPriority,
      status: "New",
      assignedStaff: newAssigned || "Unassigned",
      timestamp: timeFormatted,
      preferredTime: newPreferredTime,
      slaMinutes: slaLimit,
      createdTimeMs: Date.now(),
      aiSuggestedCategory: aiResult.suggestedCategory,
      aiSuggestedPriority: aiResult.suggestedPriority,
      aiConfidence: aiResult.confidence,
      history: [initialAudit],
    };

    setTickets((prev) => [newTkt, ...prev]);
    toast.success(`Service request logged for Room ${newRoom}`);
    setShowNewTicketModal(false);
    setNewRoom("");
    setNewGuest("");
    setNewTitle("");
    setNewDetails("");
  };

  // Live AI Suggestion as user types new request
  const liveAiSuggestion = classifyServiceRequestText(`${newTitle} ${newDetails}`);

  return (
    <div className="animate-enter space-y-6 pb-12 text-[#1c2e2a]">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. DASHBOARD HEADER & TAGLINE
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[28px] bg-[#0f2420] p-6 text-paper sm:p-8 shadow-xl border border-white/10">
        <div className="hero-wash" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-[#f1bd58]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f1bd58] border border-[#f1bd58]/30">
                DISHA HOTEL COMMAND CENTER
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-paper/60">
                LIFECYCLE & OPERATIONAL STATE MACHINE
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-paper sm:text-4xl">
              Live Property Intelligence
            </h1>
            <p className="mt-1 text-sm text-paper/70 font-sans">
              {currentProperty.name} · Real-time service request state machine & operational audit trail
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#0C7C74] px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-[#096660] cursor-pointer"
            >
              <Plus size={16} />
              <span>Log Request</span>
            </button>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-mono font-bold text-paper/80 border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} LOCAL</span>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────────────────
            2. TOP OPERATIONAL KPI & ANALYTICS METRICS BAR
        ────────────────────────────────────────────────────────────────────────── */}
        <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 1. Occupancy */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-paper/50 mb-1">
              <span>Occupancy</span>
              <Building2Icon size={13} className="text-[#f1bd58]" />
            </div>
            <div className="font-display text-2xl font-bold text-paper">{occupancyPct}%</div>
            <div className="text-[10px] text-paper/60 mt-0.5">{totalOccupied} / {currentProperty.totalRooms} Rooms</div>
          </div>

          {/* 2. Active Guests */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-paper/50 mb-1">
              <span>Active Guests</span>
              <Users size={13} className="text-emerald-400" />
            </div>
            <div className="font-display text-2xl font-bold text-paper">146</div>
            <div className="text-[10px] text-paper/60 mt-0.5">84 Resort · 62 Outside</div>
          </div>

          {/* 3. Open Requests */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-paper/50 mb-1">
              <span>Open Queue</span>
              <Bell size={13} className="text-amber-400" />
            </div>
            <div className="font-display text-2xl font-bold text-amber-400">{openTickets.length}</div>
            <div className="text-[10px] text-paper/60 mt-0.5">{urgentCount} High Priority</div>
          </div>

          {/* 4. SLA Overdue */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-paper/50 mb-1">
              <span>SLA Overdue</span>
              <Clock size={13} className={overdueCount > 0 ? "text-rose-400" : "text-emerald-400"} />
            </div>
            <div className={`font-display text-2xl font-bold ${overdueCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {overdueCount}
            </div>
            <div className="text-[10px] text-paper/60 mt-0.5">
              {overdueCount > 0 ? "Attention required" : "All within SLA"}
            </div>
          </div>

          {/* 5. Avg Response Time */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-paper/50 mb-1">
              <span>Avg Response</span>
              <Zap size={13} className="text-sky-300" />
            </div>
            <div className="font-display text-2xl font-bold text-sky-300">{avgResponseTime} m</div>
            <div className="text-[10px] text-paper/60 mt-0.5">Target: &lt;10 min</div>
          </div>

          {/* 6. Avg Resolution Time */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-paper/50 mb-1">
              <span>Avg Resolution</span>
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
            <div className="font-display text-2xl font-bold text-emerald-400">{avgResolutionTime} m</div>
            <div className="text-[10px] text-paper/60 mt-0.5">Target: &lt;30 min</div>
          </div>

          {/* 7. SLA Compliance */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-paper/50 mb-1">
              <span>SLA Rate</span>
              <ShieldCheck size={13} className="text-[#f1bd58]" />
            </div>
            <div className="font-display text-2xl font-bold text-[#f1bd58]">{slaCompliancePct}%</div>
            <div className="text-[10px] text-paper/60 mt-0.5">Service standard</div>
          </div>

          {/* 8. Env Risk */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-paper/50 mb-1">
              <span>Env Risk</span>
              <CloudRain size={13} className="text-sky-300" />
            </div>
            <div className="font-display text-2xl font-bold text-amber-300">Moderate</div>
            <div className="text-[10px] text-paper/60 mt-0.5">Rain 17:30–19:30</div>
          </div>
        </div>
      </section>

      {/* DISHA Context Intelligence Engine Section */}
      <ContextIntelligencePanel demoContext={context} />

      {/* ──────────────────────────────────────────────────────────────────────────
          3. LIVE PROPERTY INTELLIGENCE (CENTRAL HUB WITH AI RECOMMENDATIONS)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="rounded-[24px] border border-amber-500/20 bg-gradient-to-r from-[#0f2420] via-[#142d28] to-[#0f2420] p-6 text-paper shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">WEATHER & OPERATIONAL IMPACT SIGNAL</span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">ACTIVE RADAR</span>
              </div>
              <h2 className="font-display text-xl font-bold text-paper">
                Heavy rainfall expected 17:30–19:30 (Jaipur North / Amer Sector)
              </h2>
            </div>
          </div>
          <div className="rounded-xl bg-white/10 px-3.5 py-1.5 text-xs text-paper/70 shrink-0 border border-white/10">
            Probability: <strong className="text-amber-300">85%</strong> · Impact Window: 2 hrs
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Potential Operational Impact */}
          <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-paper/60 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" />
              Potential Operational Impact
            </h3>
            <ul className="space-y-2.5 text-sm text-paper/85">
              <li className="flex items-center justify-between rounded-xl bg-white/5 p-2.5">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <strong>12 guests currently outside</strong> (Amber Fort & Stepwell)
                </span>
                <span className="text-xs font-mono text-amber-300 font-bold">High Risk</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-white/5 p-2.5">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <strong>4 transport requests</strong> scheduled near rain window
                </span>
                <span className="text-xs font-mono text-paper/70 font-bold">Action Needed</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-white/5 p-2.5">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <strong>2 affected routes</strong> (Amer Valley Road & Old City Pass)
                </span>
                <span className="text-xs font-mono text-rose-300 font-bold">Bypass Active</span>
              </li>
            </ul>
          </div>

          {/* AI-assisted Suggested Preparation */}
          <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-paper/60 mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-[#f1bd58]" />
              Suggested Preparation (AI Decision Support)
            </h3>
            <ul className="space-y-2.5 text-sm text-paper/85">
              <li className="flex items-start gap-2.5 rounded-xl bg-white/5 p-2.5">
                <span className="rounded-md bg-[#0C7C74]/30 px-2 py-0.5 text-xs font-bold text-[#b2ddd4] shrink-0 mt-0.5">1</span>
                <div>
                  <strong>Increase transport availability:</strong> Stage 3 covered SUVs at Amber Fort lower gate for immediate guest pickups.
                </div>
              </li>
              <li className="flex items-start gap-2.5 rounded-xl bg-white/5 p-2.5">
                <span className="rounded-md bg-[#0C7C74]/30 px-2 py-0.5 text-xs font-bold text-[#b2ddd4] shrink-0 mt-0.5">2</span>
                <div>
                  <strong>Prepare lobby capacity:</strong> Setup warm masala chai & towel station at main portico for incoming excursion guests.
                </div>
              </li>
              <li className="flex items-start gap-2.5 rounded-xl bg-white/5 p-2.5">
                <span className="rounded-md bg-[#0C7C74]/30 px-2 py-0.5 text-xs font-bold text-[#b2ddd4] shrink-0 mt-0.5">3</span>
                <div>
                  <strong>Monitor guest requests:</strong> Anticipate 40% surge in In-Room Dining between 18:00–19:30 due to outdoor terrace shift.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Governance Warning */}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-black/20 px-3.5 py-2 text-[11px] text-paper/60 border border-white/5">
          <Info size={14} className="text-amber-400 shrink-0" />
          <span>
            <strong>IMPORTANT:</strong> These are AI-assisted context recommendations. Operational staff retain full authority over execution and dispatch decisions.
          </span>
        </div>
      </section>

      {/* ── Tab Navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-[#0C7C74] text-white shadow-sm"
              : "border border-ink/10 bg-white text-ink/60 hover:text-ink"
          }`}
        >
          <Layers size={13} />
          Live Dashboard
          <span className={`ml-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
            activeTab === "dashboard" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700"
          }`}>
            {openTickets.length} open
          </span>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "analytics"
              ? "bg-[#0C7C74] text-white shadow-sm"
              : "border border-ink/10 bg-white text-ink/60 hover:text-ink"
          }`}
        >
          <TrendingUp size={13} />
          Analytics & Management
        </button>
      </div>

      {/* ── Analytics Tab ──────────────────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <AnalyticsDashboard tickets={tickets} activeRole={activeRole} />
      )}

      {/* ── Dashboard Tab Content ──────────────────────────────────────────── */}
      {activeTab === "dashboard" && (<>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. PRIORITY INTELLIGENCE ("NEEDS ATTENTION")
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-rose-600" />
            <h2 className="font-display text-xl font-bold tracking-tight text-[#0f2420]">Needs Attention</h2>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
              3 Action Items
            </span>
          </div>
          <span className="text-xs text-ink/50 font-medium">Click any item for guest context & immediate dispatch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* HIGH PRIORITY CARD */}
          <div
            onClick={() => {
              const tkt = tickets.find((t) => t.id === "tkt-204") || tickets[0];
              setSelectedTicket(tkt);
            }}
            className="group cursor-pointer rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-sm transition hover:shadow-md hover:border-rose-400 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              HIGH PRIORITY
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-800 mb-2">
              <Navigation size={14} />
              <span>Transport Request · Room 204</span>
            </div>
            <h3 className="font-bold text-sm text-ink group-hover:text-rose-900 transition">
              Amber Fort Pre-Rain Pickup
            </h3>
            <p className="mt-1 text-xs text-ink/70 line-clamp-2">
              Guest requested pickup before 17:30 heavy rainfall. 12 mins estimated drive time.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-rose-200/60 pt-3 text-[11px]">
              <span className="text-ink/60">Guest: <strong>S. Roy (Aarav)</strong></span>
              <span className="font-bold text-rose-700 underline group-hover:translate-x-0.5 transition flex items-center gap-1">
                Open Context & Action →
              </span>
            </div>
          </div>

          {/* MEDIUM PRIORITY CARD */}
          <div
            onClick={() => {
              const tkt = tickets.find((t) => t.id === "tkt-318") || tickets[1];
              setSelectedTicket(tkt);
            }}
            className="group cursor-pointer rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm transition hover:shadow-md hover:border-amber-400 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              MEDIUM PRIORITY
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-2">
              <Wrench size={14} />
              <span>Maintenance · Room 318</span>
            </div>
            <h3 className="font-bold text-sm text-ink group-hover:text-amber-900 transition">
              HVAC Climate Issue
            </h3>
            <p className="mt-1 text-xs text-ink/70 line-clamp-2">
              AC cooling efficiency low. Temperature reading 26°C (Target: 22°C). Technician Rajesh assigned.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-amber-200/60 pt-3 text-[11px]">
              <span className="text-ink/60">Guest: <strong>M. Patel</strong></span>
              <span className="font-bold text-amber-700 underline group-hover:translate-x-0.5 transition flex items-center gap-1">
                Open Context & Action →
              </span>
            </div>
          </div>

          {/* LOW PRIORITY CARD */}
          <div
            onClick={() => {
              const tkt = tickets.find((t) => t.id === "tkt-412") || tickets[2];
              setSelectedTicket(tkt);
            }}
            className="group cursor-pointer rounded-2xl border border-teal-200 bg-[#0C7C74]/5 p-5 shadow-sm transition hover:shadow-md hover:border-[#0C7C74]/40 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-[#0C7C74] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              LOW PRIORITY
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0C7C74] mb-2">
              <Layers size={14} />
              <span>Housekeeping · Room 412</span>
            </div>
            <h3 className="font-bold text-sm text-ink group-hover:text-[#0C7C74] transition">
              Extra Towels & Foam Pillows
            </h3>
            <p className="mt-1 text-xs text-ink/70 line-clamp-2">
              Guest requested 2 bath sheets & hypoallergenic memory foam pillows. Attendant Priya Singh assigned.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-teal-200/60 pt-3 text-[11px]">
              <span className="text-ink/60">Guest: <strong>K. Sharma</strong></span>
              <span className="font-bold text-[#0C7C74] underline group-hover:translate-x-0.5 transition flex items-center gap-1">
                Open Context & Action →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. LIVE SERVICE REQUEST QUEUE (TABLE WITH FULL STATE MACHINE CONTROLS)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold tracking-tight text-[#0f2420]">
                Service Request State Machine Queue
              </h2>
              <span className="rounded-full bg-[#0C7C74]/10 px-3 py-1 text-xs font-bold text-[#0C7C74]">
                {filteredTickets.length} Displayed
              </span>
            </div>
            <p className="text-xs text-ink/60 mt-0.5">
              Full lifecycle: New → Accepted → In Progress → Completed → Closed (with audit trail)
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                type="text"
                placeholder="Search room, guest, or request..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-56 rounded-xl border border-ink/15 bg-white pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-ink/40 focus:border-[#0C7C74] focus:outline-none shadow-sm"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-ink/15 bg-white px-3 py-1.5 text-xs font-bold text-ink/80 focus:border-[#0C7C74] focus:outline-none cursor-pointer shadow-sm"
            >
              <option value="All">Status: All</option>
              <option value="Open">Status: Open Only</option>
              <option value="Overdue">Status: ⚠️ Overdue SLA</option>
              <option value="New">Status: New</option>
              <option value="Accepted">Status: Accepted</option>
              <option value="In Progress">Status: In Progress</option>
              <option value="Completed">Status: Completed</option>
              <option value="Closed">Status: Closed</option>
            </select>

            {/* Category Filter Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-ink/15 bg-white px-3 py-1.5 text-xs font-bold text-ink/80 focus:border-[#0C7C74] focus:outline-none cursor-pointer shadow-sm"
            >
              <option value="All">Category: All</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Transport">Transport</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Room Service">Room Service</option>
              <option value="Laundry">Laundry</option>
              <option value="Amenities">Amenities</option>
              <option value="Special Assistance">Special Assistance</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Live Requests Table */}
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-sm">
          <table className="w-full text-left text-xs text-ink">
            <thead className="bg-[#f7f4ee] border-b border-ink/10 text-[10px] font-bold uppercase tracking-wider text-ink/60">
              <tr>
                <th className="p-4">Request</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Room</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority & SLA</th>
                <th className="p-4">Created / Logs</th>
                <th className="p-4">Assigned Staff</th>
                <th className="p-4">State</th>
                <th className="p-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {filteredTickets.map((t) => {
                const overdue = isTicketOverdue(t);
                return (
                  <tr key={t.id} className={`hover:bg-paper/40 transition ${overdue ? "bg-rose-50/40" : ""}`}>
                    {/* Request */}
                    <td className="p-4 font-bold text-ink min-w-[160px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold">{t.title}</span>
                        {t.aiConfidence && (
                          <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2" title="AI Suggested Classification">
                            AI
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink/60 font-normal line-clamp-1 mt-0.5">{t.details}</div>
                    </td>

                    {/* Guest */}
                    <td className="p-4 font-semibold text-ink/80 whitespace-nowrap">
                      {t.guestName}
                    </td>

                    {/* Room */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="rounded-lg bg-ink/5 px-2 py-1 font-mono font-bold text-ink">
                        {t.roomNumber}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="rounded-full border border-ink/10 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink/70">
                        {t.category}
                      </span>
                    </td>

                    {/* Priority & SLA Overdue */}
                    <td className="p-4 whitespace-nowrap space-y-1">
                      <div>
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            t.priority === "Urgent" || t.priority === "High"
                              ? "bg-rose-100 text-rose-800"
                              : t.priority === "Medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      {overdue ? (
                        <div className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <AlertTriangle size={10} /> SLA Exceeded ({t.slaMinutes}m)
                        </div>
                      ) : (
                        <div className="text-[10px] text-ink/50 font-mono">SLA: {t.slaMinutes || 15}m limit</div>
                      )}
                    </td>

                    {/* Created / Logs */}
                    <td className="p-4 text-[11px] text-ink/60 min-w-[140px]">
                      <div className="font-mono">{t.timestamp}</div>
                      {t.responseTimeMinutes !== undefined && (
                        <div className="text-[10px] text-[#0C7C74] font-bold">
                          Resp: {t.responseTimeMinutes}m {t.resolutionTimeMinutes ? `· Res: ${t.resolutionTimeMinutes}m` : ""}
                        </div>
                      )}
                    </td>

                    {/* Assigned Staff */}
                    <td className="p-4 whitespace-nowrap">
                      <select
                        value={t.assignedStaff}
                        onChange={(e) => handleUpdateStatus(t.id, t.status, e.target.value, `Reassigned staff to ${e.target.value}`)}
                        className="rounded-lg border border-ink/15 bg-white px-2 py-1 text-xs text-ink/80 focus:border-[#0C7C74] focus:outline-none cursor-pointer"
                      >
                        {staffList.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>

                    {/* State Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          t.status === "New"
                            ? "bg-blue-100 text-blue-800"
                            : t.status === "Accepted"
                            ? "bg-amber-100 text-amber-800"
                            : t.status === "In Progress"
                            ? "bg-sky-100 text-sky-800"
                            : t.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            t.status === "In Progress" ? "bg-sky-600 animate-pulse" : "bg-current"
                          }`}
                        />
                        {t.status}
                      </span>
                    </td>

                    {/* Action Buttons for State Transitions */}
                    <td className="p-4 text-right whitespace-nowrap space-x-1">
                      {t.status === "New" && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, "Accepted")}
                          className="rounded-lg bg-amber-600 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-amber-700 transition cursor-pointer"
                        >
                          Accept
                        </button>
                      )}
                      {(t.status === "New" || t.status === "Accepted") && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, "In Progress")}
                          className="rounded-lg bg-[#0C7C74] text-white px-2.5 py-1 text-[11px] font-bold hover:bg-[#096660] transition cursor-pointer"
                        >
                          Start Work
                        </button>
                      )}
                      {t.status === "In Progress" && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, "Completed")}
                          className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Complete ✓
                        </button>
                      )}
                      {t.status === "Completed" && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, "Closed")}
                          className="rounded-lg border border-ink/20 text-ink/60 px-2.5 py-1 text-[11px] font-bold hover:bg-ink/5 transition cursor-pointer"
                        >
                          Close
                        </button>
                      )}
                      {(t.status === "Completed" || t.status === "Closed") && (
                        <button
                          onClick={() => {
                            setSelectedTicket(t);
                          }}
                          className="rounded-lg border border-amber-300 text-amber-800 bg-amber-50 px-2.5 py-1 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer"
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="rounded-lg border border-ink/15 bg-white px-2 py-1 text-[11px] font-bold text-ink/70 hover:bg-paper transition cursor-pointer"
                      >
                        Audit Log
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-ink/40 font-bold">
                    No requests match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. OCCUPANCY CONTEXT & DEMAND INTELLIGENCE (VISUAL CHARTS & BREAKDOWN)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Trend & Outside Guest Chart */}
        <div className="lg:col-span-2 rounded-[24px] border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-[#0f2420]">Occupancy & Mobility Radar</h3>
              <p className="text-xs text-ink/60">Hourly breakdown of guests on-property vs outdoors</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-ink/70">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0C7C74]" /> On Resort
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-ink/70">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> On Excursion
              </span>
            </div>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="space-y-3 pt-2">
            {[
              { time: "08:00", resort: 80, excursion: 20, rain: false },
              { time: "11:00", resort: 45, excursion: 55, rain: false },
              { time: "14:00 (Now)", resort: 40, excursion: 60, rain: false },
              { time: "17:30 (Rain)", resort: 85, excursion: 15, rain: true },
              { time: "20:00", resort: 95, excursion: 5, rain: true },
            ].map((item) => (
              <div key={item.time} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-ink/70">
                  <span className="flex items-center gap-1.5">
                    {item.time}
                    {item.rain && <span className="rounded bg-sky-100 text-sky-800 px-1.5 py-0.2 text-[9px]">Rain Shift</span>}
                  </span>
                  <span>{item.resort}% Resort · {item.excursion}% Outdoors</span>
                </div>
                <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-ink/5">
                  <div
                    style={{ width: `${item.resort}%` }}
                    className="bg-[#0C7C74] transition-all duration-500"
                  />
                  <div
                    style={{ width: `${item.excursion}%` }}
                    className="bg-amber-400 transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-[#0f2420]/5 p-3.5 text-xs text-ink/80 flex items-start gap-2 border border-ink/5">
            <TrendingUp size={16} className="text-[#0C7C74] shrink-0 mt-0.5" />
            <div>
              <strong>Service Demand Forecast:</strong> Guest return wave projected between 16:45–17:30 before rainfall. Expect high demand for lobby arrivals & room service dining.
            </div>
          </div>
        </div>

        {/* Expected Arrivals & Departures Breakdown */}
        <div className="rounded-[24px] border border-ink/10 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold text-[#0f2420]">Movement Pipeline</h3>

          {/* Expected Arrivals */}
          <div className="rounded-2xl bg-blue-50/60 p-4 border border-blue-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <UserCheck size={14} /> Expected Arrivals (28)
              </span>
              <span className="text-xs font-mono font-bold text-blue-700">14 Remaining</span>
            </div>
            <div className="text-xs text-blue-950">
              Peak arrival window: <strong>14:00 – 17:00</strong>
            </div>
            <div className="w-full bg-blue-200/60 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-1/2" />
            </div>
            <div className="text-[11px] text-blue-800">14 rooms pre-inspected and ready for guest key card handover.</div>
          </div>

          {/* Expected Departures */}
          <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Clock size={14} /> Expected Departures (19)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700">5 Remaining</span>
            </div>
            <div className="text-xs text-emerald-950">
              Express check-outs completed: <strong>14 / 19</strong>
            </div>
            <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-3/4" />
            </div>
            <div className="text-[11px] text-emerald-800">5 pending luggage collection & final billing verification.</div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          7. ENVIRONMENT PANEL (CONNECTING WEATHER/TRAFFIC TO OPERATIONS)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="rounded-[24px] border border-ink/10 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink/10 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0C7C74]">ENVIRONMENT & SURROUNDING CONTEXT</span>
            <h2 className="font-display text-xl font-bold text-[#0f2420]">
              Jaipur Environmental Radar & Operational Bridge
            </h2>
          </div>
          <span className="text-xs font-semibold text-ink/60">Updated 2 mins ago</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Weather */}
          <div className="rounded-2xl bg-paper/60 p-4 border border-ink/10">
            <div className="flex items-center gap-2 text-xs font-bold text-ink/70 mb-2">
              <CloudRain size={16} className="text-sky-600" />
              <span>Weather Context</span>
            </div>
            <div className="font-display text-xl font-bold text-ink">28°C · Rain Alert</div>
            <p className="mt-1 text-xs text-ink/70">Clear sky currently. 85% rain intensity expected 17:30–19:30.</p>
          </div>

          {/* Traffic */}
          <div className="rounded-2xl bg-paper/60 p-4 border border-ink/10">
            <div className="flex items-center gap-2 text-xs font-bold text-ink/70 mb-2">
              <Navigation size={16} className="text-amber-600" />
              <span>Mobility & Traffic</span>
            </div>
            <div className="font-display text-xl font-bold text-ink">NH-11 Congestion</div>
            <p className="mt-1 text-xs text-ink/70">Amer Bypass bottleneck (+18m delay). Pre-route airport shuttles via Link Road.</p>
          </div>

          {/* Crowd */}
          <div className="rounded-2xl bg-paper/60 p-4 border border-ink/10">
            <div className="flex items-center gap-2 text-xs font-bold text-ink/70 mb-2">
              <Users size={16} className="text-rose-600" />
              <span>Surrounding Crowd</span>
            </div>
            <div className="font-display text-xl font-bold text-ink">High (88 / 100)</div>
            <p className="mt-1 text-xs text-ink/70">Heavy tour bus density near Amber Fort lower parking lot.</p>
          </div>

          {/* Local Events */}
          <div className="rounded-2xl bg-paper/60 p-4 border border-ink/10">
            <div className="flex items-center gap-2 text-xs font-bold text-ink/70 mb-2">
              <Compass size={16} className="text-[#0C7C74]" />
              <span>Local Event Context</span>
            </div>
            <div className="font-display text-xl font-bold text-ink">Heritage Craft Fair</div>
            <p className="mt-1 text-xs text-ink/70">City Palace precinct diversion active until 20:00.</p>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: TICKET DETAILS, STATE MACHINE AUDIT TRAIL & REOPEN
      ────────────────────────────────────────────────────────────────────────── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-enter">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl space-y-4 border border-ink/10">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0C7C74]">Ticket #{selectedTicket.id}</span>
                  <span className="rounded-full bg-[#0C7C74]/10 px-2 py-0.5 text-[10px] font-bold text-[#0C7C74]">
                    {selectedTicket.status}
                  </span>
                  {isTicketOverdue(selectedTicket) && (
                    <span className="rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5">
                      ⚠️ Overdue SLA ({selectedTicket.slaMinutes}m limit)
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl font-bold text-ink mt-0.5">{selectedTicket.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-full p-1 text-ink/40 hover:bg-paper hover:text-ink transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-ink/80">
              {/* Room & Category info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-paper/60 p-3">
                <div>
                  <span className="text-ink/50 font-bold block text-[10px] uppercase">Room & Guest</span>
                  <strong className="text-sm">Room {selectedTicket.roomNumber}</strong>
                  <div className="text-[11px] text-ink/70">{selectedTicket.guestName}</div>
                </div>
                <div>
                  <span className="text-ink/50 font-bold block text-[10px] uppercase">Category & SLA</span>
                  <span className="font-bold text-[#0C7C74]">{selectedTicket.category}</span>
                  <div className="text-[11px] text-ink/60">Target: {selectedTicket.slaMinutes} mins</div>
                </div>
                <div>
                  <span className="text-ink/50 font-bold block text-[10px] uppercase">Priority</span>
                  <span
                    className={`font-bold ${
                      selectedTicket.priority === "High" || selectedTicket.priority === "Urgent"
                        ? "text-rose-700"
                        : "text-amber-700"
                    }`}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>
                <div>
                  <span className="text-ink/50 font-bold block text-[10px] uppercase">Metrics</span>
                  <div className="text-[11px] font-mono">
                    Resp: <strong>{selectedTicket.responseTimeMinutes ?? "—"}m</strong>
                  </div>
                  <div className="text-[11px] font-mono">
                    Res: <strong>{selectedTicket.resolutionTimeMinutes ?? "—"}m</strong>
                  </div>
                </div>
              </div>

              {/* AI Classifier context if present */}
              {selectedTicket.aiSuggestedCategory && (
                <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-600" />
                    <div>
                      <strong className="text-amber-900">DISHA AI Classification Suggestion:</strong>
                      <span className="ml-1 text-amber-800">
                        Category: {selectedTicket.aiSuggestedCategory} · Priority: {selectedTicket.aiSuggestedPriority} ({Math.round((selectedTicket.aiConfidence || 0.9) * 100)}% confidence)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-200/50 px-2 py-0.5 rounded">
                    Staff Override Allowed
                  </span>
                </div>
              )}

              <div>
                <span className="text-ink/50 font-bold block text-[10px] uppercase mb-1">Guest Note & Details</span>
                <p className="rounded-xl border border-ink/10 p-3 bg-white text-ink leading-relaxed">{selectedTicket.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-ink/50 font-bold block text-[10px] uppercase mb-1">Assigned Staff</span>
                  <select
                    value={selectedTicket.assignedStaff}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, selectedTicket.status, e.target.value, `Assigned staff to ${e.target.value}`)}
                    className="w-full rounded-xl border border-ink/15 bg-white p-2 text-xs font-bold text-ink focus:border-[#0C7C74] focus:outline-none"
                  >
                    {staffList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-ink/50 font-bold block text-[10px] uppercase mb-1">State Machine Control</span>
                  <div className="flex gap-1">
                    {selectedTicket.status === "New" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedTicket.id, "Accepted")}
                        className="w-full rounded-xl bg-amber-600 text-white py-2 font-bold hover:bg-amber-700 cursor-pointer"
                      >
                        Accept Request
                      </button>
                    )}
                    {selectedTicket.status === "Accepted" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedTicket.id, "In Progress")}
                        className="w-full rounded-xl bg-[#0C7C74] text-white py-2 font-bold hover:bg-[#096660] cursor-pointer"
                      >
                        Start Work
                      </button>
                    )}
                    {selectedTicket.status === "In Progress" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedTicket.id, "Completed")}
                        className="w-full rounded-xl bg-emerald-600 text-white py-2 font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        Complete Request ✓
                      </button>
                    )}
                    {selectedTicket.status === "Completed" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedTicket.id, "Closed")}
                        className="w-full rounded-xl border border-ink/20 text-ink py-2 font-bold hover:bg-paper cursor-pointer"
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reopen Workflow if Completed or Closed */}
              {(selectedTicket.status === "Completed" || selectedTicket.status === "Closed") && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <RotateCcw size={14} /> Reopen Service Request
                    </span>
                    <span className="text-[10px] font-normal text-amber-700">Transitions state back to "In Progress"</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Reason for reopening request..."
                      value={reopenNote}
                      onChange={(e) => setReopenNote(e.target.value)}
                      className="flex-1 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs text-ink focus:outline-none"
                    />
                    <button
                      onClick={() => handleReopenRequest(selectedTicket.id)}
                      className="rounded-xl bg-amber-700 text-white px-4 py-1.5 text-xs font-bold hover:bg-amber-800 transition cursor-pointer"
                    >
                      Reopen Ticket
                    </button>
                  </div>
                </div>
              )}

              {/* Audit Trail Timeline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-ink/50 font-bold block text-[10px] uppercase flex items-center gap-1">
                    <History size={12} /> State Transition Audit Trail
                  </span>
                  <span className="text-[10px] text-ink/50 font-mono">{selectedTicket.history?.length || 0} entries</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(selectedTicket.history || []).map((log, index) => (
                    <div key={index} className="rounded-xl border border-ink/5 bg-paper/40 p-2.5 flex items-start justify-between text-[11px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink">{log.action}</span>
                          <span className="rounded bg-ink/10 px-1.5 py-0.2 text-[9px] font-bold uppercase text-ink/70">
                            {log.role}
                          </span>
                          <span className="text-ink/60">{log.user}</span>
                        </div>
                        {log.note && <div className="text-ink/60 mt-0.5 font-sans">{log.note}</div>}
                      </div>
                      <span className="font-mono text-[10px] text-ink/50 shrink-0">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: NEW SERVICE TICKET LOGGING WITH REAL-TIME AI CLASSIFICATION
      ────────────────────────────────────────────────────────────────────────── */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-enter">
          <form onSubmit={handleCreateTicket} className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl space-y-4 border border-ink/10">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div>
                <h3 className="font-display text-xl font-bold text-ink">Log Service Request</h3>
                <p className="text-xs text-ink/60">Creates new ticket in state "New" with SLA timestamping</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="rounded-full p-1 text-ink/40 hover:bg-paper hover:text-ink transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 204"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 p-2 text-xs font-bold text-ink focus:border-[#0C7C74] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Guest Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={newGuest}
                  onChange={(e) => setNewGuest(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 p-2 text-xs font-bold text-ink focus:border-[#0C7C74] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Request Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. AC leaking and making strange noise"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl border border-ink/15 p-2 text-xs font-bold text-ink focus:border-[#0C7C74] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Details & Context Note</label>
              <textarea
                rows={2}
                placeholder="Provide guest request description..."
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                className="w-full rounded-xl border border-ink/15 p-2 text-xs font-sans text-ink focus:border-[#0C7C74] focus:outline-none"
              />
            </div>

            {/* Live AI Classification Suggestion Chip */}
            {(newTitle || newDetails) && (
              <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-900">AI Suggested Classification:</span>
                    <div className="text-amber-800 text-[11px]">
                      Category: <strong>{liveAiSuggestion.suggestedCategory}</strong> · Priority: <strong>{liveAiSuggestion.suggestedPriority}</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewCategory(liveAiSuggestion.suggestedCategory);
                    setNewPriority(liveAiSuggestion.suggestedPriority);
                    toast.success("Applied AI Classification");
                  }}
                  className="rounded-lg bg-amber-600 text-white px-3 py-1.5 text-[10px] font-bold hover:bg-amber-700 transition cursor-pointer shrink-0"
                >
                  Apply AI
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ServiceTicketCategory)}
                  className="w-full rounded-xl border border-ink/15 p-2 text-xs font-bold text-ink focus:border-[#0C7C74] focus:outline-none"
                >
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Room Service">Room Service</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Transport">Transport</option>
                  <option value="Laundry">Laundry</option>
                  <option value="Amenities">Amenities</option>
                  <option value="Special Assistance">Special Assistance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full rounded-xl border border-ink/15 p-2 text-xs font-bold text-ink focus:border-[#0C7C74] focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Preferred Time</label>
                <select
                  value={newPreferredTime}
                  onChange={(e) => setNewPreferredTime(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 p-2 text-xs font-bold text-ink focus:border-[#0C7C74] focus:outline-none"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="Within 30 mins">Within 30 mins</option>
                  <option value="This Evening">This Evening</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Assign Staff</label>
              <select
                value={newAssigned}
                onChange={(e) => setNewAssigned(e.target.value)}
                className="w-full rounded-xl border border-ink/15 p-2 text-xs font-bold text-ink focus:border-[#0C7C74] focus:outline-none"
              >
                {staffList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2 border-t border-ink/10">
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="flex-1 rounded-xl border border-ink/15 py-2.5 text-xs font-bold text-ink/70 hover:bg-paper transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#0C7C74] py-2.5 text-xs font-bold text-white hover:bg-[#096660] transition cursor-pointer"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </>) /* end dashboard tab */}
    </div>
  );
}

function Building2Icon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
      <path d="M10 6h4"/>
      <path d="M10 10h4"/>
      <path d="M10 14h4"/>
      <path d="M10 18h4"/>
    </svg>
  );
}
