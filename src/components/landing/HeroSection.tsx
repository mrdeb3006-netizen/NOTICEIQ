import React from "react";
import { Button } from "../ui/Button";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Layers,
} from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Top Product Glass Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-xl border border-white/90 shadow-sm shadow-indigo-950/5 mb-8 hover:border-indigo-300 hover:bg-white/90 transition-all">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            NOTICEIQ
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI Student Productivity
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          From Information to{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
            Action.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          AI-powered action management for students, schools and colleges.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-16">
          <Button
            href="/get-started"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-8 shadow-lg shadow-indigo-500/25"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Get Started
          </Button>
          <Button
            href="#how-it-works"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-7"
            leftIcon={<Layers className="w-4 h-4 text-slate-500" />}
          >
            See How It Works
          </Button>
        </div>

        {/* Visual Teaser Preview Card: Glassmorphic Intelligent Engine */}
        <div className="max-w-3xl mx-auto glass-card-static rounded-3xl p-5 sm:p-7 text-left transition-all hover:shadow-2xl hover:shadow-indigo-500/10 relative overflow-hidden group">
          {/* Subtle top shine */}
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />

          <div className="flex items-center justify-between pb-4 border-b border-slate-200/50">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-xs" />
              <span className="ml-2 text-xs font-semibold text-slate-500">
                NoticeIQ Intelligent Engine
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 backdrop-blur-md">
              <CheckCircle2 className="w-3 h-3" /> Live Demo Mode
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {/* Left: Raw Notice Simulation Glass Panel */}
            <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/70 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Incoming Raw Notice
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Academic Office</span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-snug">
                “Final Semester Project submissions and lab clearances must be completed before Friday 5 PM. Late submissions attract penalties.”
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Clock className="w-3 h-3 text-slate-400" /> 230 students notified
              </div>
            </div>

            {/* Right: Personalized Action Items Generated Glass Panel */}
            <div className="p-4 rounded-2xl bg-indigo-50/40 backdrop-blur-md border border-indigo-200/50 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Your Personalized Actions
                </span>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                  Priority 1
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-800 bg-white/80 backdrop-blur-md p-2.5 rounded-xl border border-white shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">Lab Clearance Sign-off</span>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-indigo-500" /> Due by Thursday, 2:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-800 bg-white/80 backdrop-blur-md p-2.5 rounded-xl border border-white shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">Upload Project Report PDF</span>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-indigo-500" /> Due by Friday, 4:30 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
