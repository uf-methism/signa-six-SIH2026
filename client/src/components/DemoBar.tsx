import React from "react";
import { AlertTriangle, CloudRain, Moon, Radio, ShieldAlert, Sun, Users, X } from "lucide-react";
import { type DemoContext } from "@/lib/travelData";
import { Link } from "wouter";

interface DemoBarProps {
  context: DemoContext;
  setContext: React.Dispatch<React.SetStateAction<DemoContext>>;
  onClose?: () => void;
}

export function DemoBar({ context, setContext, onClose }: DemoBarProps) {
  const isNight = context.time === "Night" || context.time === "Late Night";
  const isRain = context.weather === "Heavy Rain" || context.time === "Rain";

  return (
    <div className="border-b border-ink/10 bg-[#162724] px-4 py-3 text-paper shadow-md transition-all duration-300">
      <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-3">
        {/* Left: Kicker & Active Mode Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f1bd58]">
            <Radio size={13} className="animate-pulse text-[#f1bd58]" />
            <span>DISHA — SIH 2026 Presentation Bar</span>
          </div>

          {isNight && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ember/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f3b4a5] border border-ember/40">
              <Moon size={12} /> Safe After Dark Active
            </span>
          )}

          {isRain && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b2ddd4] border border-teal/40">
              <CloudRain size={12} /> Heavy Rain Mode
            </span>
          )}

          {context.disasterAlert && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red-300 border border-red-500/50 animate-pulse">
              <ShieldAlert size={12} /> Disaster Broadcast
            </span>
          )}
        </div>

        {/* Center: Controls for Time, Weather, Crowd, Alert, Disaster */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Time of Day */}
          <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 border border-white/10">
            <Sun size={13} className="text-[#f1bd58]" />
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
              <option value="Morning" className="bg-[#183d3b] text-paper">Morning</option>
              <option value="Sunset" className="bg-[#183d3b] text-paper">Sunset</option>
              <option value="Night" className="bg-[#183d3b] text-paper">Night</option>
              <option value="Rain" className="bg-[#183d3b] text-paper">Rain</option>
            </select>
          </div>

          {/* Weather */}
          <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 border border-white/10">
            <CloudRain size={13} className="text-[#b2ddd4]" />
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
              <option value="Clear" className="bg-[#183d3b] text-paper">Clear</option>
              <option value="Heavy Rain" className="bg-[#183d3b] text-paper">Heavy Rain</option>
            </select>
          </div>

          {/* Crowd Density */}
          <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 border border-white/10">
            <Users size={13} className="text-[#f1bd58]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-paper/60">Crowd:</span>
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
              <option value="Low" className="bg-[#183d3b] text-paper">Low</option>
              <option value="High" className="bg-[#183d3b] text-paper">High</option>
              <option value="Peak" className="bg-[#183d3b] text-paper">Peak</option>
            </select>
          </div>

          {/* Trigger Alert Toggle */}
          <button
            onClick={() => setContext((c) => ({ ...c, alert: !c.alert }))}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              context.alert
                ? "bg-ember text-white shadow-[0_0_12px_rgba(198,75,63,0.5)]"
                : "bg-white/10 text-paper/80 hover:bg-white/20"
            }`}
          >
            <AlertTriangle size={13} />
            <span>{context.alert ? "Hazard Active" : "Hazard Alert"}</span>
          </button>

          {/* Simulate Disaster Trigger */}
          <button
            onClick={() => setContext((c) => ({ ...c, disasterAlert: !c.disasterAlert }))}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              context.disasterAlert
                ? "bg-red-600 text-white shadow-[0_0_14px_rgba(239,68,68,0.7)] border border-red-400 animate-pulse"
                : "bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30"
            }`}
          >
            <ShieldAlert size={13} />
            <span>{context.disasterAlert ? "Disaster Sim ON" : "Simulate Disaster"}</span>
          </button>

          {/* Jump to Disaster Page */}
          <Link
            href="/disaster"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:from-red-500 hover:to-rose-500 transition cursor-pointer"
          >
            <Radio size={13} className="text-white animate-pulse" />
            <span>Disaster Hub</span>
          </Link>
        </div>

        {/* Right: Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-1.5 text-paper/70 transition hover:bg-white/20 hover:text-paper cursor-pointer"
            aria-label="Close demo bar"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
