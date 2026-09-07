import React from "react";
import { AlertOctagon, PhoneCall, ShieldAlert, ArrowRight, X, MapPin, Radio, BellRing } from "lucide-react";
import { type WeatherAlert } from "@/lib/weatherService";
import { useLocation } from "wouter";

interface DisasterAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: WeatherAlert | null;
}

export function DisasterAlertModal({ isOpen, onClose, alert }: DisasterAlertModalProps) {
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const headline = alert?.headline || "SEVERE WEATHER EMERGENCY ALERT";
  const description =
    alert?.description ||
    "A severe meteorological emergency has been detected in the Jaipur area. Flash flood and extreme waterlogging warnings active. Please seek shelter immediately.";
  const radius = alert?.affectedRadius || "2–8 km radius";
  const timestamp = alert?.timestamp || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const handleGoToHub = () => {
    onClose();
    setLocation("/disaster");
  };

  const handleSOSCall = () => {
    window.location.href = "tel:112";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-red-500/50 bg-[#120707] text-white shadow-[0_0_50px_rgba(239,68,68,0.35)]">
        {/* Flashing Top Banner */}
        <div className="flex items-center justify-between bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-5 py-3 text-white">
          <div className="flex items-center gap-2 font-bold tracking-wider text-xs uppercase">
            <span className="flex h-2.5 w-2.5 rounded-full bg-white animate-ping" />
            <Radio size={16} className="text-white animate-pulse" />
            <span>Official Emergency Broadcast</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-black/20 p-1 transition hover:bg-black/40 text-white/80 hover:text-white"
            aria-label="Dismiss Alert"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-red-500/20 p-3 border border-red-500/40 text-red-400 shrink-0">
              <AlertOctagon size={32} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-red-400 font-semibold mb-1">
                <BellRing size={13} />
                <span>Active Warning • {timestamp} IST</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
                {headline}
              </h2>
            </div>
          </div>

          {/* Description & Impact */}
          <div className="rounded-xl bg-red-950/40 border border-red-800/40 p-4 space-y-2 text-sm text-red-100/90 leading-relaxed">
            <p>{description}</p>
            <div className="flex items-center gap-2 pt-2 text-xs text-amber-300 font-medium">
              <MapPin size={14} className="shrink-0 text-amber-400" />
              <span>Affected Zone: {radius} (Jaipur Urban & Heritage Corridor)</span>
            </div>
          </div>

          {/* Critical Recommendations */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Immediate Safety Instructions:
            </h4>
            <ul className="text-xs space-y-1.5 text-neutral-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <span>Move to elevated or officially designated shelter locations.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <span>Avoid flooded low-lying streets and submerged electrical poles.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <span>Keep offline contacts and power banks accessible.</span>
              </li>
            </ul>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleGoToHub}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/40 hover:from-red-500 hover:to-rose-500 transition-all cursor-pointer"
            >
              <ShieldAlert size={16} />
              <span>Open Disaster Hub</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={handleSOSCall}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <PhoneCall size={16} className="text-red-400 animate-pulse" />
              <span>Call Helpline (112)</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-white/10 bg-black/40 px-6 py-2.5 text-center text-[11px] text-neutral-400 flex items-center justify-between">
          <span>Source: Real-time Weather Sync & Disaster Mgmt</span>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white underline cursor-pointer text-[11px]"
          >
            I understand, minimize
          </button>
        </div>
      </div>
    </div>
  );
}
