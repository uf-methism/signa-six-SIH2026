/**
 * DISHA Analytics & Management Dashboard
 * B2B Hospitality Intelligence Platform — Property Analytics Layer
 * Demonstrates context-aware operational intelligence with seeded demo data.
 */

import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CloudRain,
  Download,
  Flame,
  Hotel,
  Info,
  Layers,
  LineChart,
  MessageSquare,
  Minus,
  RefreshCw,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { ServiceTicket, currentProperty } from "@/lib/travelData";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsDashboardProps {
  tickets: ServiceTicket[];
  activeRole: string;
}

// ─── Seeded Historical Data (Demo) ────────────────────────────────────────────

const CATEGORIES = [
  "Housekeeping",
  "Transport",
  "Maintenance",
  "Room Service",
  "Laundry",
  "Other",
] as const;

const CAT_COLORS: Record<string, string> = {
  Housekeeping: "#0C7C74",
  Transport: "#f1bd58",
  Maintenance: "#e85d3d",
  "Room Service": "#6366f1",
  Laundry: "#22c55e",
  Other: "#94a3b8",
};

// 7-day historical requests by category (seeded)
const HISTORICAL_CATEGORIES: Record<string, number[]> = {
  Housekeeping: [14, 18, 12, 21, 17, 23, 19],
  Transport: [7, 9, 6, 11, 8, 12, 10],
  Maintenance: [3, 5, 2, 4, 6, 3, 5],
  "Room Service": [9, 11, 8, 14, 10, 15, 12],
  Laundry: [4, 6, 3, 7, 5, 8, 6],
  Other: [2, 3, 1, 2, 3, 2, 3],
};

const DAYS_7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// 24h demand forecast (historical vs predicted vs actual) — 3-hour buckets
const DEMAND_TIMELINE = [
  { time: "00:00", historical: 2, predicted: 2, actual: 2 },
  { time: "03:00", historical: 1, predicted: 1, actual: 1 },
  { time: "06:00", historical: 5, predicted: 6, actual: 6 },
  { time: "09:00", historical: 18, predicted: 20, actual: 19 },
  { time: "12:00", historical: 22, predicted: 24, actual: 22 },
  { time: "15:00", historical: 16, predicted: 18, actual: 17 },
  { time: "18:00", historical: 28, predicted: 34, actual: null }, // weather spike
  { time: "21:00", historical: 15, predicted: 18, actual: null },
  { time: "24:00", historical: 6, predicted: 7, actual: null },
];

// Response time trend (7 days, minutes)
const RESPONSE_TREND = [8.2, 6.5, 7.1, 5.8, 4.9, 5.2, 4.5];
const RESOLUTION_TREND = [32, 28, 25, 22, 26, 21, 19];

// Incident log (seeded demo)
const INCIDENT_LOG = [
  {
    id: "inc-001",
    type: "Weather",
    severity: "Medium",
    title: "Heavy Rainfall Advisory",
    time: "14:22",
    ack: true,
    resolved: false,
    guests: 12,
    note: "12 guests outside at rainfall onset — transport dispatched",
  },
  {
    id: "inc-002",
    type: "Maintenance",
    severity: "Low",
    title: "Lift B Maintenance Pause",
    time: "11:00",
    ack: true,
    resolved: true,
    guests: 0,
    note: "Floor 3-5 guests re-routed via Lift A. Resolved 11:45.",
  },
  {
    id: "inc-003",
    type: "Safety",
    severity: "Low",
    title: "Fire Panel Test — Wing C",
    time: "09:30",
    ack: true,
    resolved: true,
    guests: 0,
    note: "Scheduled fire alarm test. All clear.",
  },
];

// Occupancy trend (7 days, %)
const OCCUPANCY_TREND = [78, 81, 84, 82, 85, 88, 85];

// Guest satisfaction seed (NPS-style)
const SATISFACTION_DATA = {
  overall: 87,
  service: 90,
  cleanliness: 92,
  communication: 84,
  value: 81,
};

// ─── Mini SVG Bar Chart ───────────────────────────────────────────────────────
function BarChart({
  data,
  color = "#0C7C74",
  height = 60,
  showLabels = false,
  labels,
}: {
  data: number[];
  color?: string;
  height?: number;
  showLabels?: boolean;
  labels?: string[];
}) {
  const max = Math.max(...data, 1);
  const barW = 100 / data.length;
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      {data.map((val, i) => {
        const bh = (val / max) * (height - (showLabels ? 14 : 4));
        const by = height - bh - (showLabels ? 14 : 0);
        return (
          <g key={i}>
            <rect
              x={i * barW + barW * 0.12}
              y={by}
              width={barW * 0.76}
              height={bh}
              rx="2"
              fill={color}
              opacity="0.85"
            />
            {showLabels && labels && (
              <text
                x={i * barW + barW / 2}
                y={height - 2}
                textAnchor="middle"
                fontSize="5"
                fill="#94a3b8"
                fontFamily="system-ui"
              >
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Mini SVG Line Chart ──────────────────────────────────────────────────────
function LineChartSvg({
  datasets,
  height = 80,
  showLabels = false,
  labels,
}: {
  datasets: { data: (number | null)[]; color: string; dashed?: boolean; label?: string }[];
  height?: number;
  showLabels?: boolean;
  labels?: string[];
}) {
  const allVals = datasets.flatMap((d) => d.data.filter((v): v is number => v !== null));
  const max = Math.max(...allVals, 1);
  const n = datasets[0]?.data.length || 1;
  const step = 100 / (n - 1);
  const innerH = height - (showLabels ? 18 : 4);

  function toPath(data: (number | null)[]): string {
    const points: string[] = [];
    data.forEach((val, i) => {
      if (val === null) return;
      const x = i * step;
      const y = innerH - (val / max) * innerH;
      points.push(`${x},${y}`);
    });
    if (points.length === 0) return "";
    return `M ${points.join(" L ")}`;
  }

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((frac) => (
        <line
          key={frac}
          x1="0"
          y1={innerH * (1 - frac)}
          x2="100"
          y2={innerH * (1 - frac)}
          stroke="#e2e8f0"
          strokeWidth="0.4"
        />
      ))}
      {datasets.map((ds, di) => (
        <path
          key={di}
          d={toPath(ds.data)}
          fill="none"
          stroke={ds.color}
          strokeWidth={ds.dashed ? "1.2" : "1.8"}
          strokeDasharray={ds.dashed ? "3,2" : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {/* Dots on actual points */}
      {datasets.map((ds, di) =>
        ds.data.map((val, i) =>
          val !== null ? (
            <circle
              key={`${di}-${i}`}
              cx={i * step}
              cy={innerH - (val / max) * innerH}
              r="1.5"
              fill={ds.color}
            />
          ) : null
        )
      )}
      {showLabels && labels &&
        labels.map((lbl, i) => (
          <text
            key={i}
            x={i * step}
            y={height - 2}
            textAnchor="middle"
            fontSize="4.5"
            fill="#94a3b8"
            fontFamily="system-ui"
          >
            {lbl}
          </text>
        ))}
    </svg>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ value, max = 100, color = "#0C7C74", size = 64 }: { value: number; max?: number; color?: string; size?: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#e8f0ef" strokeWidth="6" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="700" fill={color} fontFamily="system-ui">
        {value}%
      </text>
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  unit,
  trend,
  trendLabel,
  icon: Icon,
  color = "#0C7C74",
  chart,
}: {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  icon: React.ElementType;
  color?: string;
  chart?: React.ReactNode;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "#22c55e" : trend === "down" ? "#e85d3d" : "#94a3b8";
  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-sm flex flex-col gap-2 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink/50">{label}</span>
        <div className="grid h-7 w-7 place-items-center rounded-xl" style={{ background: `${color}18` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="font-display text-2xl font-bold text-ink leading-none">{value}</span>
        {unit && <span className="text-xs text-ink/40 mb-0.5">{unit}</span>}
      </div>
      {trendLabel && (
        <div className="flex items-center gap-1" style={{ color: trendColor }}>
          <TrendIcon size={11} />
          <span className="text-[10px] font-semibold">{trendLabel}</span>
        </div>
      )}
      {chart && <div className="mt-1">{chart}</div>}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function AnalyticsDashboard({ tickets, activeRole }: AnalyticsDashboardProps) {
  const [activeSection, setActiveSection] = useState<"overview" | "service" | "demand" | "incidents" | "satisfaction">(
    "overview"
  );
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  // ── Derived Metrics ──────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const completed = tickets.filter((t) => t.status === "Completed" || t.status === "Closed");
    const completionRate = Math.round((completed.length / Math.max(tickets.length, 1)) * 100);

    const withResponse = tickets.filter((t) => t.responseTimeMinutes !== undefined);
    const avgResponse =
      withResponse.length > 0
        ? (withResponse.reduce((s, t) => s + (t.responseTimeMinutes || 0), 0) / withResponse.length).toFixed(1)
        : "4.5";

    const withResolution = tickets.filter((t) => t.resolutionTimeMinutes !== undefined);
    const avgResolution =
      withResolution.length > 0
        ? (withResolution.reduce((s, t) => s + (t.resolutionTimeMinutes || 0), 0) / withResolution.length).toFixed(1)
        : "22.0";

    const slaCompliant = tickets.filter((t) => !t.responseTimeMinutes || t.responseTimeMinutes <= (t.slaMinutes || 15)).length;
    const slaPct = Math.round((slaCompliant / Math.max(tickets.length, 1)) * 100);

    const byCat: Record<string, number> = {};
    tickets.forEach((t) => {
      byCat[t.category] = (byCat[t.category] || 0) + 1;
    });

    const incidentAckPct = Math.round((INCIDENT_LOG.filter((i) => i.ack).length / INCIDENT_LOG.length) * 100);

    return {
      completionRate,
      avgResponse,
      avgResolution,
      slaPct,
      byCat,
      incidentAckPct,
      totalTickets: tickets.length,
      openTickets: tickets.filter((t) => t.status !== "Completed" && t.status !== "Closed").length,
    };
  }, [tickets]);

  // Category bars data
  const catData = CATEGORIES.map((cat) => ({
    cat,
    count: metrics.byCat[cat] || 0,
    historical: HISTORICAL_CATEGORIES[cat]?.reduce((a, b) => a + b, 0) || 0,
    color: CAT_COLORS[cat],
  }));

  const maxCatCount = Math.max(...catData.map((d) => d.historical + (d.count || 0)), 1);

  // ── AI Insights (deterministic) ──────────────────────────────────────────────
  const insights = [
    {
      id: "ins-1",
      priority: "High",
      icon: CloudRain,
      color: "#3b82f6",
      title: "Weather-Driven Demand Surge — 18:00",
      body: "DISHA predicts a 34% increase in Transport and Room Service requests between 18:00–20:00 due to the active rainfall advisory. Recommend pre-positioning Shuttle #3 at Amer Gate by 17:30 and pre-staging kitchen orders.",
      action: "Pre-position transport",
    },
    {
      id: "ins-2",
      priority: "Medium",
      icon: Zap,
      color: "#f1bd58",
      title: "Housekeeping Load Concentration — 12:00–14:00",
      body: "68% of housekeeping requests are created between 12:00 and 14:00. Recommend shifting one housekeeping associate to the 11:30 shift to reduce peak SLA breach risk.",
      action: "Adjust shift roster",
    },
    {
      id: "ins-3",
      priority: "Low",
      icon: ThumbsUp,
      color: "#22c55e",
      title: "Response Time Improving — −3.7 min week-on-week",
      body: "Average response time has decreased from 8.2 min (Monday) to 4.5 min (today). The AI routing implementation is contributing to measurable SLA improvements.",
      action: "View trend",
    },
    {
      id: "ins-4",
      priority: "Medium",
      icon: Target,
      color: "#6366f1",
      title: "Demand Forecast Accuracy: 94.2%",
      body: "Today's demand model predicted 88 total requests by 15:00. Actual: 91 (3.4% variance). Weather multiplier from Environmental Intelligence is calibrating well.",
      action: "View forecast log",
    },
  ];

  const navSections = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "service", label: "Service Analytics", icon: Layers },
    { id: "demand", label: "Demand Forecast", icon: LineChart },
    { id: "incidents", label: "Incidents", icon: AlertTriangle },
    { id: "satisfaction", label: "Guest Satisfaction", icon: ThumbsUp },
  ] as const;

  return (
    <div className="animate-enter space-y-6 pb-12">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0f2420] via-[#122d28] to-[#0a1f1c] p-6 text-white shadow-xl border border-white/10 sm:p-8">
        <div className="hero-wash" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-[#f1bd58]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f1bd58] border border-[#f1bd58]/30">
                DISHA ANALYTICS
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
                B2B INTELLIGENCE LAYER
              </span>
              <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-400/20">
                DEMO DATA
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Property Analytics & Management
            </h1>
            <p className="mt-1 text-sm text-white/70">
              {currentProperty.name} · Seeded demo data — production connects to live property APIs
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white/80 border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE DEMO MODE</span>
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-bold text-white/70 hover:bg-white/10 transition cursor-pointer">
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        {/* Quick stat strip */}
        <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Completion Rate", value: `${metrics.completionRate}%`, delta: "+4% vs last week" },
            { label: "Avg Response", value: `${metrics.avgResponse}m`, delta: "−3.7m week-on-week" },
            { label: "SLA Compliance", value: `${metrics.slaPct}%`, delta: "Target: 90%" },
            { label: "Forecast Accuracy", value: "94.2%", delta: "AI-calibrated" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/8 p-3.5 backdrop-blur-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">{stat.label}</div>
              <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
              <div className="mt-0.5 text-[10px] text-[#f1bd58]/80">{stat.delta}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section Nav ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {navSections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as typeof activeSection)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeSection === id
                ? "bg-[#0C7C74] text-white shadow-sm"
                : "border border-ink/10 bg-white text-ink/60 hover:text-ink hover:border-ink/20"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SECTION: OVERVIEW                                                       */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Request Completion"
              value={`${metrics.completionRate}%`}
              trend="up"
              trendLabel="+4% vs last week"
              icon={CheckCircle2}
              color="#0C7C74"
              chart={<BarChart data={[68, 72, 75, 70, 78, 82, metrics.completionRate]} color="#0C7C74" height={40} />}
            />
            <KpiCard
              label="Avg Response Time"
              value={metrics.avgResponse}
              unit="min"
              trend="down"
              trendLabel="−3.7m week-on-week ✓"
              icon={Clock}
              color="#6366f1"
              chart={<BarChart data={RESPONSE_TREND} color="#6366f1" height={40} />}
            />
            <KpiCard
              label="Avg Resolution"
              value={metrics.avgResolution}
              unit="min"
              trend="down"
              trendLabel="−13m vs baseline"
              icon={Activity}
              color="#f1bd58"
              chart={<BarChart data={RESOLUTION_TREND} color="#f1bd58" height={40} />}
            />
            <KpiCard
              label="SLA Compliance"
              value={`${metrics.slaPct}%`}
              trend={metrics.slaPct >= 90 ? "up" : "flat"}
              trendLabel={`Target: 90% · ${metrics.slaPct >= 90 ? "Met ✓" : "Below target"}`}
              icon={Target}
              color="#22c55e"
              chart={<BarChart data={[84, 86, 89, 88, 91, 90, metrics.slaPct]} color="#22c55e" height={40} />}
            />
            <KpiCard
              label="Incident Ack Rate"
              value={`${metrics.incidentAckPct}%`}
              trend="up"
              trendLabel="All incidents acknowledged"
              icon={Bell}
              color="#e85d3d"
            />
            <KpiCard
              label="Recommendation Engagement"
              value="68%"
              trend="up"
              trendLabel="+12% vs last week"
              icon={Sparkles}
              color="#8b5cf6"
              chart={<BarChart data={[48, 52, 55, 58, 60, 65, 68]} color="#8b5cf6" height={40} />}
            />
            <KpiCard
              label="Forecast Accuracy"
              value="94.2%"
              trend="up"
              trendLabel="±3.4% avg variance"
              icon={Bot}
              color="#0891b2"
            />
            <KpiCard
              label="Occupancy"
              value="85%"
              trend="up"
              trendLabel="+3% vs last week"
              icon={Hotel}
              color="#0C7C74"
              chart={<BarChart data={OCCUPANCY_TREND} color="#0C7C74" height={40} />}
            />
          </div>

          {/* AI Management Insights */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bot size={16} className="text-[#0C7C74]" />
              <h2 className="font-display text-lg font-bold text-ink">AI-Assisted Management Insights</h2>
              <span className="rounded-full bg-[#0C7C74]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0C7C74]">
                AI-assisted · Human confirmation required
              </span>
            </div>
            <div className="space-y-3">
              {insights.map((ins) => {
                const Icon = ins.icon;
                const isOpen = expandedInsight === ins.id;
                return (
                  <div
                    key={ins.id}
                    className="rounded-2xl border border-ink/8 bg-white shadow-sm overflow-hidden transition"
                  >
                    <button
                      className="w-full flex items-center gap-4 p-4 text-left cursor-pointer hover:bg-[#f6f3ed]/50 transition"
                      onClick={() => setExpandedInsight(isOpen ? null : ins.id)}
                    >
                      <div
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                        style={{ background: `${ins.color}15` }}
                      >
                        <Icon size={16} style={{ color: ins.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
                            style={{ background: `${ins.color}15`, color: ins.color }}
                          >
                            {ins.priority}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-ink">{ins.title}</p>
                      </div>
                      {isOpen ? <ChevronUp size={16} className="text-ink/30 shrink-0" /> : <ChevronDown size={16} className="text-ink/30 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-0 border-t border-ink/5 bg-[#f9f7f4]">
                        <p className="text-sm text-ink/70 leading-relaxed mt-3">{ins.body}</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer hover:opacity-90"
                            style={{ background: ins.color }}
                          >
                            {ins.action}
                          </button>
                          <button className="rounded-xl border border-ink/10 px-4 py-2 text-xs font-bold text-ink/60 hover:text-ink transition cursor-pointer">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SECTION: SERVICE ANALYTICS                                              */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {activeSection === "service" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Requests by Category */}
            <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={15} className="text-[#0C7C74]" />
                <h3 className="font-semibold text-ink">Requests by Category</h3>
                <span className="ml-auto text-[10px] font-bold text-ink/40 uppercase tracking-wider">7-day total</span>
              </div>
              <div className="space-y-3">
                {catData
                  .sort((a, b) => b.historical - a.historical)
                  .map(({ cat, count, historical, color }) => {
                    const total = historical + count;
                    const pct = Math.round((total / maxCatCount) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-ink/80">{cat}</span>
                          <div className="flex items-center gap-2 text-ink/50">
                            <span>+{count} today</span>
                            <span className="font-bold text-ink">{total}</span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-ink/5 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Requests over time (7d) */}
            <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={15} className="text-[#6366f1]" />
                <h3 className="font-semibold text-ink">Total Requests — Last 7 Days</h3>
              </div>
              <div className="mb-2">
                <BarChart
                  data={DAYS_7.map((_, i) =>
                    CATEGORIES.reduce((s, cat) => s + (HISTORICAL_CATEGORIES[cat]?.[i] || 0), 0)
                  )}
                  color="#0C7C74"
                  height={100}
                  showLabels
                  labels={DAYS_7}
                />
              </div>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-ink/50">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded bg-[#0C7C74]" />
                  Daily requests
                </div>
              </div>
            </div>

            {/* Avg Response Time Trend */}
            <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={15} className="text-[#6366f1]" />
                <h3 className="font-semibold text-ink">Response Time Trend (minutes)</h3>
                <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ↓ Improving
                </span>
              </div>
              <LineChartSvg
                datasets={[
                  { data: RESPONSE_TREND, color: "#6366f1", label: "Response Time" },
                ]}
                height={90}
                showLabels
                labels={DAYS_7}
              />
              <div className="mt-3 flex items-center gap-4 text-[11px] text-ink/50">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-5 rounded bg-[#6366f1]" />
                  Avg response (min)
                </div>
                <div className="ml-auto font-semibold text-ink">SLA target: ≤10 min</div>
              </div>
            </div>

            {/* Avg Resolution Time Trend */}
            <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={15} className="text-[#f1bd58]" />
                <h3 className="font-semibold text-ink">Resolution Time Trend (minutes)</h3>
                <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ↓ Improving
                </span>
              </div>
              <LineChartSvg
                datasets={[
                  { data: RESOLUTION_TREND, color: "#f1bd58", label: "Resolution Time" },
                ]}
                height={90}
                showLabels
                labels={DAYS_7}
              />
              <div className="mt-3 flex items-center gap-4 text-[11px] text-ink/50">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-5 rounded bg-[#f1bd58]" />
                  Avg resolution (min)
                </div>
                <div className="ml-auto font-semibold text-ink">Target: ≤30 min</div>
              </div>
            </div>
          </div>

          {/* Open vs Completed tickets table */}
          <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={15} className="text-ink/50" />
              <h3 className="font-semibold text-ink">Current Ticket Status Distribution</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/5">
                    {["Status", "Count", "% of Total", "Avg SLA (min)", "Action"].map((h) => (
                      <th key={h} className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {(["New", "Accepted", "In Progress", "Completed", "Closed"] as const).map((status) => {
                    const count = tickets.filter((t) => t.status === status).length;
                    const pct = Math.round((count / Math.max(tickets.length, 1)) * 100);
                    const avgSla = tickets
                      .filter((t) => t.status === status)
                      .reduce((s, t) => s + (t.slaMinutes || 15), 0) / Math.max(count, 1);

                    const statusColors: Record<string, string> = {
                      New: "text-amber-700 bg-amber-50",
                      Accepted: "text-blue-700 bg-blue-50",
                      "In Progress": "text-purple-700 bg-purple-50",
                      Completed: "text-emerald-700 bg-emerald-50",
                      Closed: "text-ink/50 bg-ink/5",
                    };

                    return (
                      <tr key={status} className="hover:bg-[#f9f7f4] transition">
                        <td className="py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusColors[status]}`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-ink">{count}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-ink/5">
                              <div
                                className="h-1.5 rounded-full bg-[#0C7C74]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-ink/50 text-xs">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-ink/60">{count > 0 ? avgSla.toFixed(0) : "—"}</td>
                        <td className="py-3">
                          <span className="text-[11px] text-[#0C7C74] font-semibold cursor-pointer hover:underline">
                            View
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SECTION: DEMAND FORECAST                                                */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {activeSection === "demand" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-200/50 bg-blue-50/50 p-4 flex items-start gap-3">
            <Bot size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <span className="font-bold">DISHA Demand Forecast:</span> Today's 18:00–20:00 window shows a predicted{" "}
              <span className="font-bold">+34 requests above baseline</span> due to the active rainfall advisory. Prediction
              confidence: <span className="font-bold">87%</span>. Recommend pre-staffing Room Service and Transport by 17:30.
            </div>
          </div>

          {/* 24h demand timeline */}
          <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <LineChart size={15} className="text-[#0C7C74]" />
              <h3 className="font-semibold text-ink">24-Hour Demand Timeline</h3>
            </div>
            <p className="text-xs text-ink/50 mb-4">Historical average vs. today's prediction vs. actual (3-hour buckets)</p>
            <LineChartSvg
              datasets={[
                {
                  data: DEMAND_TIMELINE.map((d) => d.historical),
                  color: "#94a3b8",
                  dashed: true,
                  label: "Historical avg",
                },
                {
                  data: DEMAND_TIMELINE.map((d) => d.predicted),
                  color: "#6366f1",
                  label: "Predicted",
                },
                {
                  data: DEMAND_TIMELINE.map((d) => d.actual),
                  color: "#0C7C74",
                  label: "Actual",
                },
              ]}
              height={120}
              showLabels
              labels={DEMAND_TIMELINE.map((d) => d.time)}
            />
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5 text-ink/50">
                <div className="h-px w-6 border-t-2 border-dashed border-[#94a3b8]" />
                Historical avg
              </div>
              <div className="flex items-center gap-1.5 text-ink/50">
                <div className="h-0.5 w-6 rounded bg-[#6366f1]" />
                AI Prediction
              </div>
              <div className="flex items-center gap-1.5 text-ink/50">
                <div className="h-0.5 w-6 rounded bg-[#0C7C74]" />
                Actual
              </div>
              <div className="ml-auto text-[10px] font-bold text-amber-600 flex items-center gap-1">
                <CloudRain size={11} />
                Rainfall spike predicted 18:00–20:00
              </div>
            </div>
          </div>

          {/* Category demand breakdown table */}
          <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={15} className="text-ink/50" />
              <h3 className="font-semibold text-ink">Category Demand Breakdown — Today vs. Prediction</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/5">
                    {["Category", "Yesterday", "Today (Actual)", "Today (Predicted)", "Variance"].map((h) => (
                      <th key={h} className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {[
                    { cat: "Housekeeping", yesterday: 23, actual: 19, predicted: 21 },
                    { cat: "Transport", yesterday: 12, actual: 10, predicted: 15 },
                    { cat: "Room Service", yesterday: 15, actual: 12, predicted: 18 },
                    { cat: "Maintenance", yesterday: 3, actual: 5, predicted: 4 },
                    { cat: "Laundry", yesterday: 8, actual: 6, predicted: 7 },
                    { cat: "Other", yesterday: 2, actual: 3, predicted: 2 },
                  ].map((row) => {
                    const variance = row.actual - row.predicted;
                    const varColor = Math.abs(variance) <= 2 ? "text-emerald-600" : "text-amber-600";
                    return (
                      <tr key={row.cat} className="hover:bg-[#f9f7f4] transition">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ background: CAT_COLORS[row.cat] || "#94a3b8" }}
                            />
                            <span className="font-semibold text-ink">{row.cat}</span>
                          </div>
                        </td>
                        <td className="py-3 text-ink/50">{row.yesterday}</td>
                        <td className="py-3 font-bold text-ink">{row.actual}</td>
                        <td className="py-3 text-ink/60">{row.predicted}</td>
                        <td className={`py-3 font-bold ${varColor}`}>
                          {variance > 0 ? `+${variance}` : variance}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Occupancy Trend */}
          <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users size={15} className="text-[#0C7C74]" />
              <h3 className="font-semibold text-ink">Occupancy Trend — Last 7 Days</h3>
            </div>
            <LineChartSvg
              datasets={[{ data: OCCUPANCY_TREND, color: "#0C7C74" }]}
              height={90}
              showLabels
              labels={DAYS_7}
            />
            <div className="mt-3 flex justify-between text-xs text-ink/50">
              <span>Low: 78% (Monday)</span>
              <span className="font-bold text-[#0C7C74]">Current: 85%</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SECTION: INCIDENTS                                                       */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {activeSection === "incidents" && (
        <div className="space-y-6">
          {/* Incident KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Incidents", value: INCIDENT_LOG.length, icon: Flame, color: "#e85d3d" },
              {
                label: "Acknowledged",
                value: INCIDENT_LOG.filter((i) => i.ack).length,
                icon: Bell,
                color: "#6366f1",
              },
              {
                label: "Resolved",
                value: INCIDENT_LOG.filter((i) => i.resolved).length,
                icon: CheckCircle2,
                color: "#22c55e",
              },
              { label: "Active", value: INCIDENT_LOG.filter((i) => !i.resolved).length, icon: AlertTriangle, color: "#f1bd58" },
            ].map((card) => (
              <KpiCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                color={card.color}
              />
            ))}
          </div>

          {/* Incident log */}
          <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={15} className="text-amber-500" />
              <h3 className="font-semibold text-ink">Incident Log — Today</h3>
              <span className="ml-auto text-[10px] font-bold text-ink/40 uppercase tracking-wider">DEMO DATA</span>
            </div>
            <div className="space-y-4">
              {INCIDENT_LOG.map((inc) => {
                const severityColors: Record<string, string> = {
                  High: "text-red-700 bg-red-50 border-red-200",
                  Medium: "text-amber-700 bg-amber-50 border-amber-200",
                  Low: "text-blue-700 bg-blue-50 border-blue-200",
                };
                const sev = inc.severity as keyof typeof severityColors;
                return (
                  <div
                    key={inc.id}
                    className={`rounded-2xl border p-4 ${inc.resolved ? "opacity-60" : ""} ${severityColors[sev] || "border-ink/10 bg-white"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider">{inc.type}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${severityColors[sev]}`}>
                            {inc.severity}
                          </span>
                          {inc.resolved && (
                            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold">
                              RESOLVED
                            </span>
                          )}
                          {inc.ack && !inc.resolved && (
                            <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[9px] font-bold">
                              ACKNOWLEDGED
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-sm">{inc.title}</p>
                        <p className="text-xs text-current/70 mt-1 leading-relaxed">{inc.note}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[10px] font-mono font-bold">{inc.time}</div>
                        {inc.guests > 0 && (
                          <div className="text-[10px] font-semibold mt-1 flex items-center gap-1">
                            <Users size={10} />
                            {inc.guests} guests
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incident type breakdown */}
          <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={15} className="text-ink/50" />
              <h3 className="font-semibold text-ink">Incident Type Distribution (30 days)</h3>
            </div>
            <div className="space-y-3">
              {[
                { type: "Weather", count: 8, color: "#3b82f6" },
                { type: "Maintenance", count: 12, color: "#f1bd58" },
                { type: "Safety", count: 4, color: "#e85d3d" },
                { type: "Operations", count: 6, color: "#6366f1" },
                { type: "Guest Complaint", count: 3, color: "#22c55e" },
              ].map(({ type, count, color }) => {
                const total = 33;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-ink/80">{type}</span>
                      <span className="text-ink/50">{count} incidents · {pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-ink/5 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SECTION: GUEST SATISFACTION                                             */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {activeSection === "satisfaction" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50/40 p-4 flex items-start gap-3">
            <Info size={16} className="text-emerald-700 mt-0.5 shrink-0" />
            <p className="text-sm text-emerald-800">
              <span className="font-bold">Demo data:</span> Satisfaction scores are seeded for prototype demonstration. Production
              connects to post-stay guest feedback APIs and real-time sentiment signals.
            </p>
          </div>

          {/* NPS / Satisfaction Donut Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(SATISFACTION_DATA).map(([key, val]) => {
              const label = key === "overall" ? "Overall CSAT" : key.charAt(0).toUpperCase() + key.slice(1);
              const color = val >= 90 ? "#22c55e" : val >= 80 ? "#0C7C74" : "#f1bd58";
              return (
                <div key={key} className="rounded-2xl border border-ink/8 bg-white p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition">
                  <DonutChart value={val} color={color} size={72} />
                  <span className="text-[11px] font-bold text-ink/60 text-center leading-tight">{label}</span>
                </div>
              );
            })}
          </div>

          {/* Recommendation engagement */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={15} className="text-[#8b5cf6]" />
                <h3 className="font-semibold text-ink">Recommendation Engagement</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Opened recommendation card", pct: 87 },
                  { label: "Saved a recommendation", pct: 68 },
                  { label: "Acted on recommendation", pct: 52 },
                  { label: "Returned positive feedback", pct: 44 },
                ].map(({ label, pct }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-ink/70">{label}</span>
                      <span className="font-bold text-ink">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-ink/5 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-[#8b5cf6] transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-[#0C7C74]" />
                <h3 className="font-semibold text-ink">Guest Feedback Trend (7 Days)</h3>
              </div>
              <LineChartSvg
                datasets={[
                  { data: [82, 83, 85, 84, 86, 88, 87], color: "#0C7C74", label: "CSAT" },
                  { data: [78, 80, 82, 81, 84, 86, 84], color: "#6366f1", dashed: true, label: "NPS" },
                ]}
                height={90}
                showLabels
                labels={DAYS_7}
              />
              <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-ink/50">
                <div className="flex items-center gap-1.5">
                  <div className="h-0.5 w-5 rounded bg-[#0C7C74]" />
                  CSAT
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-px w-5 border-t-2 border-dashed border-[#6366f1]" />
                  NPS Score
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="rounded-2xl border border-[#0C7C74]/20 bg-[#0C7C74]/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot size={16} className="text-[#0C7C74]" />
              <h3 className="font-semibold text-ink">AI-Assisted Executive Summary</h3>
              <span className="rounded-full bg-[#0C7C74]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0C7C74]">
                AI-assisted
              </span>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-ink/80">
              <div className="rounded-xl bg-white/70 p-4 border border-[#0C7C74]/10">
                <div className="font-bold text-ink mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Performing Well
                </div>
                <ul className="space-y-1 text-xs text-ink/60">
                  <li>• Housekeeping CSAT: 92%</li>
                  <li>• Response time improving week-on-week</li>
                  <li>• Incident acknowledgement: 100%</li>
                  <li>• AI recommendation engagement up 12%</li>
                </ul>
              </div>
              <div className="rounded-xl bg-white/70 p-4 border border-amber-200/60">
                <div className="font-bold text-ink mb-1 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-amber-500" />
                  Needs Attention
                </div>
                <ul className="space-y-1 text-xs text-ink/60">
                  <li>• Transport demand may spike at 18:00</li>
                  <li>• Communication CSAT below 90% target</li>
                  <li>• Laundry SLA borderline (Peak hours)</li>
                </ul>
              </div>
              <div className="rounded-xl bg-white/70 p-4 border border-[#6366f1]/20">
                <div className="font-bold text-ink mb-1 flex items-center gap-1.5">
                  <Zap size={13} className="text-[#6366f1]" />
                  Recommended Actions
                </div>
                <ul className="space-y-1 text-xs text-ink/60">
                  <li>• Pre-position Shuttle #3 by 17:30</li>
                  <li>• Shift one HK associate to 11:30</li>
                  <li>• Send weather advisory to guests outside</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
