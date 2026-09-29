import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Compass, Home, MapPin, ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      <SEOHead
        title="Page Not Found (404) — Disha Hospitality Companion"
        description="The requested page could not be located on the Disha B2B Hospitality & Safety platform."
        canonicalPath="/404"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "404 Not Found", item: "/404" },
        ]}
      />

      {/* Decorative Gradient Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md">
            D
          </div>
          <span className="font-serif text-lg tracking-wide text-amber-100">DISHA</span>
        </Link>
        <Breadcrumbs items={[{ label: "404 Not Found" }]} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <Card className="w-full max-w-xl shadow-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md text-slate-100 overflow-hidden">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping opacity-75" />
                <div className="w-20 h-20 rounded-full bg-slate-800 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                  <Compass className="w-10 h-10 animate-spin-slow" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/20 uppercase">
                Location Unmapped
              </span>
              <h1 className="text-3xl font-serif font-bold text-slate-50 tracking-tight">
                404 — Page Not Found
              </h1>
              <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                The path or resort service you requested is not currently mapped within DISHA's Jaipur intelligence directory.
              </p>
            </div>

            {/* Quick Link Navigation Buttons */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <Link href="/">
                <Button variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-amber-300">
                  <Home className="w-4 h-4 mr-2.5 text-amber-400" />
                  <span>Platform Overview</span>
                </Button>
              </Link>

              <Link href="/app">
                <Button variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-amber-300">
                  <Compass className="w-4 h-4 mr-2.5 text-emerald-400" />
                  <span>Guest Experience App</span>
                </Button>
              </Link>

              <Link href="/map">
                <Button variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-amber-300">
                  <MapPin className="w-4 h-4 mr-2.5 text-sky-400" />
                  <span>Interactive Map</span>
                </Button>
              </Link>

              <Link href="/disaster">
                <Button variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-amber-300">
                  <ShieldAlert className="w-4 h-4 mr-2.5 text-rose-400" />
                  <span>Safety & Disaster Hub</span>
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <Link href="/app">
                <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-semibold shadow-lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Guest Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        DISHA B2B Hospitality Platform &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
}
