import React from "react";
import { AlertTriangle, Building2, CloudRain, Moon, Radio, ShieldAlert, Sun, Users, X, Zap } from "lucide-react";
import { type DemoContext } from "@/lib/travelData";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { Link } from "wouter";

interface DemoBarProps {
  context: DemoContext;
  setContext: React.Dispatch<React.SetStateAction<DemoContext>>;
  onClose?: () => void;
}

export function DemoBar({ context, setContext, onClose }: DemoBarProps) {
  const { activeRole, setActiveRole } = useAuth();
  const isNight = context.time === "Night" || context.time === "Late Night";
  const isRain = context.weather === "Heavy Rain" || context.time === "Rain";

  return (
    <div className="border-b border-ink/10 bg-[#142624] px-4 py-2.5 text-paper shadow-md transition-all duration-300 z-50 relative">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Badge & Role Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f1bd58]">
            <Radio size={12} className="animate-pulse text-[#f1bd58]" />
            <span>DISHA — Hospitality Intelligence Demo</span>
          </div>

          {/* Persona Role Switcher */}
          <div className="flex items-center rounded-xl bg-black/30 p-0.5 border border-white/10">
            {(["Guest", "Staff", "Manager"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  activeRole === r
                    ? "bg-[#0C7C74] text-white shadow-sm"
                    : "text-paper/60 hover:text-paper"
                }`}
              >
                {r === "Guest" ? "Guest Portal" : r === "Staff" ? "Staff Queue" : "Ops & Admin"}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Controls for Hotel Occupancy, Weather, Time, Environmental Alert */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Time of Day */}
          <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1 border border-white/10">
            <Sun size={12} className="text-[#f1bd58]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-paper/60">Time:</span>
            <select
              value={context.time}
              onChange={(e) =>
                setContext((c) => ({
                  ...c,
                  time: e.target.value as DemoContext["time"],
                }))
              }
              className="bg-transparent font-bold text-paper outline-none cursor-pointer text-xs"
            >
              <option value="Morning" className="bg-[#183d3b] text-paper">Morning (7 AM)</option>
              <option value="Sunset" className="bg-[#183d3b] text-paper">Sunset (6 PM)</option>
              <option value="Night" className="bg-[#183d3b] text-paper">Night (9 PM)</option>
              <option value="Rain" className="bg-[#183d3b] text-paper">Rain Event</option>
            </select>
          </div>

          {/* Occupancy Level */}
          <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1 border border-white/10">
            <Building2 size={12} className="text-[#f1bd58]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-paper/60">Occupancy:</span>
            <select
              value={context.crowd}
              onChange={(e) =>
                setContext((c) => ({
                  ...c,
                  crowd: e.target.value as DemoContext["crowd"],
                }))
              }
              className="bg-transparent font-bold text-paper outline-none cursor-pointer text-xs"
            >
              <option value="Low" className="bg-[#183d3b] text-paper">Low (45%)</option>
              <option value="High" className="bg-[#183d3b] text-paper">High (85%)</option>
              <option value="Peak" className="bg-[#183d3b] text-paper">Full (100%)</option>
            </select>
          </div>

          {/* Weather Risk */}
          <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1 border border-white/10">
            <CloudRain size={12} className="text-[#b2ddd4]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-paper/60">Weather:</span>
            <select
              value={context.weather || (context.time === "Rain" ? "Heavy Rain" : "Clear")}
              onChange={(e) =>
                setContext((c) => ({
                  ...c,
                  weather: e.target.value as DemoContext["weather"],
                }))
              }
              className="bg-transparent font-bold text-paper outline-none cursor-pointer text-xs"
            >
              <option value="Clear" className="bg-[#183d3b] text-paper">Clear Weather</option>
              <option value="Heavy Rain" className="bg-[#183d3b] text-paper">Heavy Rain Warning</option>
            </select>
          </div>

          {/* Environmental Hazard Alert Toggle */}
          <button
            onClick={() => setContext((c) => ({ ...c, alert: !c.alert }))}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
              context.alert
                ? "bg-amber-600 text-white shadow-[0_0_10px_rgba(217,119,6,0.5)]"
                : "bg-white/10 text-paper/80 hover:bg-white/20"
            }`}
          >
            <AlertTriangle size={12} />
            <span>{context.alert ? "Weather Alert ON" : "Simulate Weather Hazard"}</span>
          </button>

          {/* Incident Alert Trigger */}
          <button
            onClick={() => setContext((c) => ({ ...c, disasterAlert: !c.disasterAlert }))}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
              context.disasterAlert
                ? "bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.7)] border border-red-400 animate-pulse"
                : "bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30"
            }`}
          >
            <ShieldAlert size={12} />
            <span>{context.disasterAlert ? "Incident Active" : "Simulate Property Alert"}</span>
          </button>
        </div>

        {/* Right: Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-1.5 text-paper/70 transition hover:bg-white/20 hover:text-paper cursor-pointer"
            aria-label="Close demo bar"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

