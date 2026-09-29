/**
 * DISHA Context Intelligence Panel Component
 * Displays Ranked Recommendations, Demand Predictions, AI Classification,
 * and Risk Signals with AI Explainability & Human Oversight Controls.
 */

import React, { useState } from "react";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CloudRain,
  Compass,
  Cpu,
  HelpCircle,
  Info,
  Layers,
  Lightbulb,
  Navigation,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
  Wrench,
  X,
} from "lucide-react";
import {
  ContextRiskSignal,
  NormalizedContext,
  RankedRecommendation,
  ServiceDemandPrediction,
  computeRiskSignal,
  getNormalizedContext,
  getRankedRecommendations,
  predictPropertyDemand,
} from "@/lib/contextIntelligence";
import { classifyRequestWithAI, getAIServiceConfig } from "@/lib/aiService";
import { DemoContext, places } from "@/lib/travelData";
import { toast } from "sonner";

interface ContextIntelligencePanelProps {
  demoContext: DemoContext;
  compact?: boolean;
}

export function ContextIntelligencePanel({ demoContext, compact = false }: ContextIntelligencePanelProps) {
  const normCtx: NormalizedContext = getNormalizedContext(demoContext);
  const aiConfig = getAIServiceConfig();

  // Active tab state in intelligence panel
  const [activeTab, setActiveTab] = useState<"Recommendations" | "DemandPrediction" | "RiskSignal" | "Classifier">("RiskSignal");
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);

  // Live classifier demo state
  const [inputText, setInputText] = useState("The AC in room 204 is leaking water and making strange rattling noises.");
  const [classifiedResult, setClassifiedResult] = useState(() => classifyRequestWithAI(inputText));

  // High-Impact Action Human Confirmation Modal state
  const [confirmActionModal, setConfirmActionModal] = useState<{
    isOpen: boolean;
    actionTitle: string;
    actionDetail: string;
  }>({ isOpen: false, actionTitle: "", actionDetail: "" });

  // Compute Engine Outputs
  const recommendations: RankedRecommendation[] = getRankedRecommendations(normCtx, places);
  const demandPredictions: ServiceDemandPrediction[] = predictPropertyDemand(normCtx);
  const riskSignal: ContextRiskSignal = computeRiskSignal(normCtx);

  const handleTestClassify = () => {
    const res = classifyRequestWithAI(inputText);
    setClassifiedResult(res);
    toast.success(`Classified as "${res.suggestedCategory}" (${res.suggestedPriority} priority)`);
  };

  const handleExecuteIncidentAction = () => {
    toast.success(`Action Executed: "${confirmActionModal.actionTitle}". Staff notification sent.`);
    setConfirmActionModal({ isOpen: false, actionTitle: "", actionDetail: "" });
  };

  return (
    <div className="rounded-[28px] border border-amber-500/20 bg-[#0f2420] p-6 text-paper shadow-xl space-y-6">
      {/* ── HEADER & AI PROVIDER STATUS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <Brain size={12} /> DISHA CONTEXT INTELLIGENCE LAYER
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-paper/70 flex items-center gap-1">
              <Cpu size={10} className="text-emerald-400" />
              Provider: {aiConfig.provider} {aiConfig.hasApiKey ? "(Live API)" : "(Deterministic Engine)"}
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-paper">
            Real-Time Context & Operational Synthesis
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1 rounded-2xl bg-white/10 p-1 border border-white/10">
          {(["RiskSignal", "DemandPrediction", "Recommendations", "Classifier"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === tab
                  ? "bg-[#0C7C74] text-white shadow-md"
                  : "text-paper/60 hover:text-paper hover:bg-white/5"
              }`}
            >
              {tab === "RiskSignal" && "Risk Signal"}
              {tab === "DemandPrediction" && "Demand Predictor"}
              {tab === "Recommendations" && "Recommendations"}
              {tab === "Classifier" && "AI Classifier"}
            </button>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: RISK & CONTEXT SIGNAL
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "RiskSignal" && (
        <div className="space-y-5 animate-enter">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white/5 p-4 border border-white/10">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                  riskSignal.level === "Critical" || riskSignal.level === "High"
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    : riskSignal.level === "Moderate"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                }`}
              >
                <ShieldAlert size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      riskSignal.level === "Critical" || riskSignal.level === "High"
                        ? "bg-rose-500 text-white"
                        : riskSignal.level === "Moderate"
                        ? "bg-amber-500 text-black"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    {riskSignal.level} RISK SIGNAL
                  </span>
                  <span className="text-xs text-paper/60">Updated {riskSignal.lastUpdated}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-paper mt-1">{riskSignal.signalTitle}</h3>
                <p className="text-xs text-paper/80 mt-0.5 leading-relaxed">{riskSignal.summary}</p>
              </div>
            </div>
          </div>

          {/* Contributing Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Contributing Context Factors
              </h4>
              <ul className="space-y-2">
                {riskSignal.contributingFactors.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 text-xs">
                    <span className="text-paper/90">{f.factor}</span>
                    <span
                      className={`text-[10px] font-bold uppercase rounded px-2 py-0.5 ${
                        f.impact === "High" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {f.impact} Impact
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Suggested High-Impact Incident Preparation Actions */}
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#b2ddd4] flex items-center gap-1.5">
                <Sparkles size={14} /> AI Recommended Incident Actions
              </h4>
              <div className="space-y-2">
                {riskSignal.suggestedActions.map((action, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 text-xs">
                    <span className="text-paper/90 truncate mr-2">{action}</span>
                    <button
                      onClick={() =>
                        setConfirmActionModal({
                          isOpen: true,
                          actionTitle: action,
                          actionDetail: "Dispatch high-impact operational directive to property staff queue.",
                        })
                      }
                      className="rounded-lg bg-[#0C7C74] text-white px-3 py-1 text-[11px] font-bold hover:bg-[#096660] transition cursor-pointer shrink-0"
                    >
                      Confirm Action
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-black/30 p-3 text-[11px] text-paper/60 border border-white/5 flex items-center gap-2">
            <Info size={14} className="text-amber-400 shrink-0" />
            <span>
              <strong>GOVERNANCE RULE:</strong> DISHA risk signals provide decision support. High-impact operational dispatches require staff confirmation before execution.
            </span>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: DEMAND PREDICTOR ENGINE
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "DemandPrediction" && (
        <div className="space-y-4 animate-enter">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-display text-lg font-bold text-paper">Service Demand Forecast & Workload Radar</h3>
              <p className="text-xs text-paper/60">Predictive modeling combining weather shift, occupancy, and guest itinerary data</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-mono font-bold text-amber-300">
              AI Confidence: 85%–94%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {demandPredictions.map((pred, i) => (
              <div key={i} className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {pred.timeWindow}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {pred.confidencePct}% Confidence
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="font-bold text-sm text-paper">{pred.category} Demand</span>
                  <span className="font-display text-2xl font-bold text-[#b2ddd4]">
                    {pred.predictedDemand} <span className="text-xs text-paper/50 font-normal">requests</span>
                  </span>
                </div>

                <p className="text-xs text-paper/80 leading-relaxed font-sans">{pred.reasoning}</p>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-paper/50">Factors Considered:</span>
                  <ul className="space-y-1">
                    {pred.contributingFactors.map((fact, idx) => (
                      <li key={idx} className="text-[11px] text-paper/70 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0C7C74]" /> {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: RANKED RECOMMENDATIONS WITH AI EXPLAINABILITY
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "Recommendations" && (
        <div className="space-y-4 animate-enter">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-display text-lg font-bold text-paper">Context-Aware Guest Recommendations</h3>
              <p className="text-xs text-paper/60">Ranked by guest profile match, weather safety, and crowd density</p>
            </div>
            <span className="text-xs text-amber-400 font-semibold">Guest: Aarav Sharma (Heritage Suite 204)</span>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec) => {
              const isExpanded = expandedRecId === rec.placeId;
              return (
                <div key={rec.placeId} className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0C7C74]/30 text-[#b2ddd4] font-display font-bold flex items-center justify-center text-lg border border-[#0C7C74]/40">
                        {rec.score}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-paper">{rec.title}</h4>
                        <span className="text-xs text-paper/60">{rec.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase rounded-full px-2.5 py-1 ${
                          rec.isRainSafe ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {rec.isRainSafe ? "✓ Rain Safe" : "⚠ Outdoor Spot"}
                      </span>
                      <button
                        onClick={() => setExpandedRecId(isExpanded ? null : rec.placeId)}
                        className="rounded-lg bg-white/10 p-1.5 text-paper/70 hover:text-paper hover:bg-white/20 transition cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* AI Explainability Banner */}
                  <div className="rounded-xl bg-black/20 p-3 text-xs text-paper/85 border border-white/5 flex items-start gap-2">
                    <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Why DISHA Recommended This:</strong> {rec.whyRecommended}
                    </div>
                  </div>

                  {/* Expanded Factors Considered */}
                  {isExpanded && (
                    <div className="space-y-2 pt-2 border-t border-white/5 animate-enter">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-paper/50">Factors Considered in Ranking:</span>
                      <ul className="space-y-1.5">
                        {rec.factorsConsidered.map((f, i) => (
                          <li key={i} className="text-xs text-paper/80 flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-[10px] text-paper/50 font-mono pt-1">
                        Confidence Rating: {(rec.confidence * 100).toFixed(0)}% · Provider: {aiConfig.provider}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 4: AI REQUEST CLASSIFIER DEMO
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "Classifier" && (
        <div className="space-y-4 animate-enter">
          <div className="border-b border-white/10 pb-3">
            <h3 className="font-display text-lg font-bold text-paper">AI Request Classification Engine</h3>
            <p className="text-xs text-paper/60">Test DISHA's real-time guest request categorization and priority scoring</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-paper/60 block">Guest Request Input Text:</label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-xs text-paper focus:border-[#0C7C74] focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleTestClassify}
                className="rounded-xl bg-[#0C7C74] px-4 py-2 text-xs font-bold text-white hover:bg-[#096660] transition cursor-pointer"
              >
                Run AI Classification
              </button>
              <button
                onClick={() => setInputText("Need urgent cab pickup at Amber Fort before rain starts.")}
                className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs text-paper/80 hover:bg-white/10 transition cursor-pointer"
              >
                Sample: Rain Cab Request
              </button>
            </div>

            {classifiedResult && (
              <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">AI Classification Output</span>
                  <span className="text-xs font-mono text-emerald-400">{(classifiedResult.confidence * 100).toFixed(0)}% Confidence</span>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl bg-white/5 p-3 text-xs">
                  <div>
                    <span className="text-paper/50 block text-[10px] uppercase">Suggested Category</span>
                    <strong className="text-base text-[#b2ddd4]">{classifiedResult.suggestedCategory}</strong>
                  </div>
                  <div>
                    <span className="text-paper/50 block text-[10px] uppercase">Suggested Priority</span>
                    <strong className="text-base text-amber-300">{classifiedResult.suggestedPriority}</strong>
                  </div>
                </div>

                <div className="text-xs text-paper/80">
                  <strong>Classification Reason:</strong> {classifiedResult.reason}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HUMAN CONFIRMATION MODAL FOR HIGH IMPACT ACTIONS ── */}
      {confirmActionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-enter">
          <div className="w-full max-w-md rounded-[24px] bg-[#0f2420] p-6 text-paper shadow-2xl space-y-4 border border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle size={18} />
                <h3 className="font-display text-lg font-bold text-paper">Human Operational Confirmation</h3>
              </div>
              <button
                onClick={() => setConfirmActionModal({ isOpen: false, actionTitle: "", actionDetail: "" })}
                className="rounded-full p-1 text-paper/40 hover:text-paper transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-paper/80">
              <p className="font-bold text-sm text-paper">{confirmActionModal.actionTitle}</p>
              <p className="rounded-xl bg-white/5 p-3 border border-white/10 text-paper/70">{confirmActionModal.actionDetail}</p>
              <p className="text-[11px] text-paper/50">
                DISHA AI recommends this action based on environmental risk synthesis. Staff confirmation executes the operational dispatch.
              </p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setConfirmActionModal({ isOpen: false, actionTitle: "", actionDetail: "" })}
                className="flex-1 rounded-xl border border-white/20 py-2.5 text-xs font-bold text-paper/70 hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteIncidentAction}
                className="flex-1 rounded-xl bg-[#0C7C74] py-2.5 text-xs font-bold text-white hover:bg-[#096660] transition cursor-pointer"
              >
                Confirm & Dispatch ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
