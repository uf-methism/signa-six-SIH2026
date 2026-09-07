import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import {
  Zap,
  Shield,
  Compass,
  Sparkles,
  MapPin,
  Clock,
  PhoneCall,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  Layers,
  Activity,
  HeartHandshake,
  Navigation,
  ChevronRight,
  Radio,
  UserCheck,
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { user, loginAsJudge, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");

  // 3D Parallax Tilt effect for Hero Card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleLaunchJudgeDemo = () => {
    loginAsJudge();
    setLocation("/app");
  };

  const openSignIn = () => {
    setAuthModalTab("signin");
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalTab("signup");
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f6f3ed] text-ink selection:bg-teal/20 selection:text-teal font-sans relative overflow-x-hidden">
      {/* Background Cartographic Signals & Wash */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-radial from-teal/15 via-teal/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[400px] left-[-100px] w-[600px] h-[600px] bg-radial from-amber/15 via-amber/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#f6f3ed]/85 border-b border-ink/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-2xl bg-teal flex items-center justify-center text-paper shadow-md transition group-hover:scale-105">
              <Compass size={22} className="transition group-hover:rotate-45" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-ember border-2 border-paper" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-ink block leading-none">
                DISHA
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-teal">
                Travel Guardian
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 backdrop-blur-md shadow-xs">
            <Link
              href="/app"
              className="px-3 py-1.5 text-xs font-bold text-ink/70 hover:text-teal transition rounded-full hover:bg-ink/5"
            >
              Explore App
            </Link>
            <Link
              href="/map"
              className="px-3 py-1.5 text-xs font-bold text-ink/70 hover:text-teal transition rounded-full hover:bg-ink/5"
            >
              Safety Map
            </Link>
            <Link
              href="/guides"
              className="px-3 py-1.5 text-xs font-bold text-ink/70 hover:text-teal transition rounded-full hover:bg-ink/5"
            >
              Verified Guides
            </Link>
            <Link
              href="/disaster"
              className="px-3 py-1.5 text-xs font-bold text-ink/70 hover:text-teal transition rounded-full hover:bg-ink/5"
            >
              Disaster Network
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 rounded-full bg-teal/10 border border-teal/20 px-3.5 py-2 text-xs font-extrabold text-teal hover:bg-teal/20 transition"
                >
                  <UserCheck size={14} />
                  <span>{user.isJudge ? "Judge Session Active" : user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs font-bold text-ink/50 hover:text-ember px-2 py-1 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={openSignIn}
                  className="hidden sm:inline-flex text-xs font-extrabold text-ink/80 hover:text-teal px-3 py-2 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={handleLaunchJudgeDemo}
                  className="inline-flex items-center gap-2 rounded-full bg-teal px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#09635d] transition active:scale-95"
                >
                  <Zap size={14} className="fill-white" />
                  <span>1-Tap SIH Judge Demo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-teal">
              <Sparkles size={14} /> Smart India Hackathon 2026 Prototype • Jaipur Context
            </div>

            {/* Editorial Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink leading-[1.1]">
              Explore Intelligently. <br />
              <span className="italic font-normal text-teal">Plan Only What You Need.</span> <br />
              Keep Safety One Tap Away.
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-ink/70 font-medium max-w-2xl leading-relaxed">
              Disha is your context-aware travel companion—balancing iconic landmarks with authentic
              hidden gems, dynamic AI day planning, and a deterministic offline-ready 1-tap emergency Safety Center.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={handleLaunchJudgeDemo}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-teal px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-teal/20 transition hover:bg-[#09635d] hover:shadow-2xl active:scale-98 group"
              >
                <Zap size={18} className="fill-white" />
                <span>Launch SIH Judge Demo (1-Tap Instant Login)</span>
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </button>

              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-ink/20 bg-white/80 px-6 py-4 text-sm font-extrabold text-ink transition hover:border-teal hover:bg-white active:scale-98"
              >
                <span>Explore Platform Features</span>
                <ChevronRight size={16} />
              </a>
            </div>

            {/* Proof Points Bar */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-ink/10 text-left">
              <div>
                <span className="font-display text-xl font-bold text-ink block">91/100</span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                  Amber Fort Score
                </span>
              </div>
              <div>
                <span className="font-display text-xl font-bold text-teal block">1-Tap SOS</span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                  Offline Ready
                </span>
              </div>
              <div>
                <span className="font-display text-xl font-bold text-amber block">0.6s AI</span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                  Plan Recalculation
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive 3D Parallax Card Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              style={{ rotateX, rotateY }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative rounded-3xl border border-ink/15 bg-white/80 p-6 shadow-2xl backdrop-blur-md space-y-4"
            >
              {/* Card Header Notch */}
              <div className="flex items-center justify-between pb-3 border-b border-ink/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal animate-ping" />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal">
                    Jaipur Live Signal Context
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-ember/10 border border-ember/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-ember animate-pulse">
                  <Radio size={10} /> Live SOS Ready
                </div>
              </div>

              {/* Mockup Item 1: Amber Fort */}
              <div className="rounded-2xl border border-ink/10 bg-[#f6f3ed] p-4 flex items-start justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-teal/15 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-teal">
                      Must Visit
                    </span>
                    <span className="text-[10px] font-semibold text-ink/50">800m away</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink">Amber Fort & Palace</h3>
                  <p className="text-xs text-ink/60 font-medium mt-0.5">
                    Good right now • Golden hour light in 45m
                  </p>
                </div>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber text-ink font-extrabold text-sm shadow-xs">
                  91
                </div>
              </div>

              {/* Mockup Item 2: Panna Meena Stepwell */}
              <div className="rounded-2xl border border-teal/30 bg-teal/5 p-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-amber/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-ink">
                      Hidden Gem
                    </span>
                    <span className="text-[10px] font-extrabold text-teal">Lower Crowds</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-ink">Panna Meena Stepwell</h3>
                  <p className="text-xs text-ink/60 font-medium mt-0.5">
                    Geometric symmetry • Ideal for quiet walking
                  </p>
                </div>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white border border-teal/30 text-teal font-extrabold text-xs">
                  84
                </div>
              </div>

              {/* Mockup Emergency SOS Strip */}
              <div className="rounded-2xl bg-ember p-4 text-white flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-extrabold text-white">
                    SOS
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider">
                      Deterministic Safety Center
                    </h4>
                    <p className="text-[11px] text-white/80 font-medium">
                      Press & hold to broadcast location
                    </p>
                  </div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-ember">
                  1-Tap
                </div>
              </div>

              {/* Compass notch signature */}
              <div className="compass-ticks">
                <span />
                <span />
                <span />
                <span />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Dual-Pillar Value Proposition */}
      <section id="features" className="py-20 bg-white border-y border-ink/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal">
              Dual-Pillar Architecture
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink">
              Discovery & Safety in One Integrated Platform
            </h2>
            <p className="text-sm sm:text-base text-ink/60 font-medium">
              Designed according to Civic Calm principles—balancing tourist exploration with a quiet,
              dependable safety network.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1: Intelligent Discovery */}
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-ink/10 bg-[#f6f3ed] p-8 space-y-6 shadow-sm relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal/10 border border-teal/20 text-teal flex items-center justify-center">
                <Compass size={24} />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink">
                Intelligent Place Discovery & AI Planning
              </h3>
              <p className="text-sm text-ink/70 font-medium leading-relaxed">
                Beyond static lists. Disha evaluates live crowd density, time of day, weather, and
                uniqueness to score Jaipur destinations deterministically.
              </p>
              <ul className="space-y-3 pt-2">
                <li className="flex items-start gap-3 text-xs font-bold text-ink/80">
                  <CheckCircle2 size={16} className="text-teal shrink-0 mt-0.5" />
                  <span>
                    <strong>Popular vs. Hidden Gem Classifications:</strong> Distinct tags for iconic sites vs. tranquil local favorites.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-xs font-bold text-ink/80">
                  <CheckCircle2 size={16} className="text-teal shrink-0 mt-0.5" />
                  <span>
                    <strong>Explainable Discovery Score:</strong> Full transparency breakdown ($ Quality + Local Relevance + Uniqueness - Crowding $).
                  </span>
                </li>
                <li className="flex items-start gap-3 text-xs font-bold text-ink/80">
                  <CheckCircle2 size={16} className="text-teal shrink-0 mt-0.5" />
                  <span>
                    <strong>Flexible 5-Hour Day Planner:</strong> Chronological itinerary generation adapted to your available hours and weather.
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* Pillar 2: Unified Safety Network */}
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-ink/10 bg-[#f6f3ed] p-8 space-y-6 shadow-sm relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-ember/10 border border-ember/20 text-ember flex items-center justify-center">
                <Shield size={24} />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink">
                Unified Emergency & Disaster Safety Network
              </h3>
              <p className="text-sm text-ink/70 font-medium leading-relaxed">
                Safety without alarmism. A 1-tap SOS state machine, live trusted location sharing, and
                verified disaster shelter routing ready when plans change.
              </p>
              <ul className="space-y-3 pt-2">
                <li className="flex items-start gap-3 text-xs font-bold text-ink/80">
                  <CheckCircle2 size={16} className="text-ember shrink-0 mt-0.5" />
                  <span>
                    <strong>Deterministic 1-Tap SOS:</strong> Offline-ready press-and-hold trigger independent of AI or network latency.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-xs font-bold text-ink/80">
                  <CheckCircle2 size={16} className="text-ember shrink-0 mt-0.5" />
                  <span>
                    <strong>Real-Time Disaster Network:</strong> Nearest emergency shelter routing, active hazard alerts, and authority directives.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-xs font-bold text-ink/80">
                  <CheckCircle2 size={16} className="text-ember shrink-0 mt-0.5" />
                  <span>
                    <strong>Women's Safety & Audio Translation:</strong> Trusted Circle check-ins, safe-after-dark route guidance, and Hindi audio helpers.
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hackathon & Tech Stack Spotlight */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-ink/15 bg-gradient-to-br from-ink to-[#151a17] text-paper p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative Teal Glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-teal">
              <Zap size={14} /> SIH 2026 Technical Architecture
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-paper">
              Built for High Performance, Offline Resilience & Spatial Intelligence
            </h2>
            <p className="text-sm text-paper/70 font-medium leading-relaxed">
              Disha combines modern Web APIs, Google Maps GIS integration, and lightweight React state machines
              to ensure high responsiveness even in remote tourist zones.
            </p>

            {/* Grid of Tech Stack Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
                <span className="text-xs font-extrabold text-teal block">React 19 + Vite</span>
                <span className="text-[10px] text-paper/50 font-medium">Sub-second load times</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
                <span className="text-xs font-extrabold text-amber block">Google Maps SDK</span>
                <span className="text-[10px] text-paper/50 font-medium">Custom cartography</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
                <span className="text-xs font-extrabold text-teal block">Web Speech API</span>
                <span className="text-[10px] text-paper/50 font-medium">Hindi/English voice</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
                <span className="text-xs font-extrabold text-ember block">Deterministic SOS</span>
                <span className="text-[10px] text-paper/50 font-medium">Offline state machine</span>
              </div>
            </div>

            {/* Launch Demo CTA */}
            <div className="pt-6">
              <button
                onClick={handleLaunchJudgeDemo}
                className="inline-flex items-center gap-2 rounded-2xl bg-teal px-6 py-3.5 text-xs font-extrabold text-white shadow-lg transition hover:bg-[#09635d] active:scale-98"
              >
                <Zap size={16} className="fill-white" />
                <span>Launch SIH Judge Demo Account</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/10 py-10 bg-[#f6f3ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-teal flex items-center justify-center text-paper font-bold text-xs">
              D
            </div>
            <span className="font-display text-sm font-bold text-ink">
              DISHA — Smart India Hackathon 2026 (Team Signa Six)
            </span>
          </div>
          <div className="text-xs text-ink/50 font-medium">
            Civic Calm System • Qualified safety language (no false guarantees)
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
}
