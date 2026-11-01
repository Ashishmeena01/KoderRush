import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  KeyRound,
  Compass,
  Star,
  CheckCircle,
  Lock,
  Layers,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white relative overflow-hidden">
      {/* Generative SVG Canvas Accents (Inspired by Haikei & Godly) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,288L48,272C96,256,192,224,288,229.3C384,235,480,277,576,272C672,267,768,213,864,197.3C960,181,1056,203,1152,213.3L1200,218.7L1200,0L1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            fill="#f5f5f7"
          />
        </svg>
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Surrealist Category Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200/90 bg-neutral-50/80 backdrop-blur-sm text-xs font-medium text-neutral-800 mb-8 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-neutral-700" />
          <span>The Architecture of Student Sanctuaries</span>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-500 font-mono text-[11px]">SURREAL HORIZONS</span>
        </div>

        {/* Hero Title with Godly Design Minimalist Editorial Weight */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-neutral-900 max-w-4xl mx-auto leading-[1.08]">
          Find your sanctuary. <br />
          <span className="text-neutral-400 font-normal">Living redefined.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          A high-precision coliving and hostel management platform connecting verified students with luxury accommodations, daily nutritional meal plans, and real-time lease tracking.
        </p>

        {/* High-Converting CTA Button Pattern (Inspired by cta.gallery) */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          {user ? (
            <Link
              to={
                user.role === "admin"
                  ? "/dashboard/admin"
                  : user.role === "owner"
                  ? "/dashboard/owner"
                  : "/dashboard/resident"
              }
              className="w-full sm:w-auto"
            >
              <Button size="lg" className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-6 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                Enter Dashboard ({user.role.toUpperCase()})
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-6 text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/sign-in" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-sm font-medium border-neutral-300 hover:bg-neutral-50 rounded-xl"
                >
                  Explore Demo Roles
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Security & Verification Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Firebase Auth Token Verification</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-neutral-700" />
            <span>NeverGetHacked Security Architecture</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-500" />
            <span>Curated Hospitality Licenses</span>
          </div>
        </div>
      </section>

      {/* Featured Properties Showcase Preview */}
      <section className="py-16 bg-neutral-50/70 border-t border-b border-neutral-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500">
                CURATED INVENTORY
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">
                Sanctuaries Engineered for Growth
              </h2>
            </div>
            <Link to="/dashboard/resident">
              <Button variant="outline" className="text-xs mt-4 md:mt-0 border-neutral-300">
                View All Available Properties <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <Card className="overflow-hidden border border-neutral-200/90 hover:shadow-md transition-all group bg-white">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
                  alt="Zenith Sanctuary"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/95 px-2 py-0.5 rounded text-xs font-semibold shadow-sm flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.9
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-neutral-900">The Zenith Student Sanctuary</h3>
                  <span className="text-sm font-bold text-neutral-900">$650/mo</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Austin, TX • High-speed optic fiber, biometric entry, AC, and 3 daily meals included.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <Badge variant="secondary" className="text-[10px]">1 Gbps WiFi</Badge>
                  <Badge variant="secondary" className="text-[10px]">Chef Meals</Badge>
                  <Badge variant="secondary" className="text-[10px]">Biometric</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="overflow-hidden border border-neutral-200/90 hover:shadow-md transition-all group bg-white">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                  alt="Solace Heights"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/95 px-2 py-0.5 rounded text-xs font-semibold shadow-sm flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.8
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-neutral-900">Solace Heights Coliving</h3>
                  <span className="text-sm font-bold text-neutral-900">$580/mo</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Seattle, WA • Private balconies, quiet library zone, and daily housekeeping.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <Badge variant="secondary" className="text-[10px]">Balconies</Badge>
                  <Badge variant="secondary" className="text-[10px]">Housekeeping</Badge>
                  <Badge variant="secondary" className="text-[10px]">Quiet Study</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="overflow-hidden border border-neutral-200/90 hover:shadow-md transition-all group bg-white">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
                  alt="Urban Nest"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/95 px-2 py-0.5 rounded text-xs font-semibold shadow-sm flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.95
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-neutral-900">Urban Nest Women's Residency</h3>
                  <span className="text-sm font-bold text-neutral-900">$520/mo</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Boston, MA • 24/7 warden, doctor on call, turnstiles, and organic nutrition plan.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <Badge variant="secondary" className="text-[10px]">24/7 Security</Badge>
                  <Badge variant="secondary" className="text-[10px]">Doctor On Call</Badge>
                  <Badge variant="secondary" className="text-[10px]">Yoga Terrace</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* High-Impact CTA Section (cta.gallery style) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-neutral-950 text-white rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl border border-neutral-800">
          {/* Subtle ambient lighting accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-gradient-to-b from-neutral-800/40 to-transparent blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <Badge className="bg-neutral-800/80 text-neutral-200 border-neutral-700 text-xs px-3 py-1 font-mono tracking-wider">
              READY TO ELEVATE YOUR COLIVING EXPERIENCE?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Begin your semester with total peace of mind.
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-lg mx-auto">
              Join hundreds of verified residents and property managers using HostelHub for transparent room bookings, meal scheduling, and digital invoices.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/sign-up" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-neutral-950 hover:bg-neutral-100 font-semibold px-8 py-6 rounded-xl shadow-lg transition-all active:scale-[0.98] border border-white"
                >
                  Create Free Account
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/sign-in" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full sm:w-auto bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 font-medium px-8 py-6 rounded-xl transition-all active:scale-[0.98]"
                >
                  Sign In with Existing Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

