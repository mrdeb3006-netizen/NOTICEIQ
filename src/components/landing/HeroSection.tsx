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
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Top Product Minimalist Dark Glass Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] shadow-lg shadow-black/40 mb-8 hover:border-indigo-500/40 hover:bg-white/[0.07] transition-all">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            NOTICEIQ
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI Student Productivity
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          From Information to{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            Action.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          AI-powered action management for students, schools and colleges.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-16">
          <Button
            href="/get-started"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-8 shadow-xl shadow-indigo-500/25"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Get Started
          </Button>
          <Button
            href="#how-it-works"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto px-7"
            leftIcon={<Layers className="w-4 h-4 text-slate-400" />}
          >
            See How It Works
          </Button>
        </div>

        {/* Minimalist Dark Glass Preview Board */}
        <div className="max-w-3xl mx-auto glass-card-static rounded-3xl p-5 sm:p-7 text-left transition-all hover:border-indigo-500/30 relative overflow-hidden group">
          {/* Top specular glow rim */}
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-xs" />
              <span className="ml-2 text-xs font-semibold text-slate-400">
                NoticeIQ Intelligent Engine
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
              <CheckCircle2 className="w-3 h-3" /> Live Engine Preview
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {/* Left: Raw Notice Simulation Dark Glass Panel */}
            <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Incoming Raw Notice
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Academic Office</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                “Final Semester Project submissions and lab clearances must be completed before Friday 5 PM. Late submissions attract penalties.”
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Clock className="w-3 h-3 text-slate-400" /> 230 students notified
              </div>
            </div>

            {/* Right: Personalized Action Items Generated Dark Glass Panel */}
            <div className="p-4 rounded-2xl bg-indigo-500/[0.08] backdrop-blur-md border border-indigo-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Your Personalized Actions
                </span>
                <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  Priority 1
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-200 bg-white/[0.04] backdrop-blur-md p-2.5 rounded-xl border border-white/[0.08] shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Lab Clearance Sign-off</span>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-indigo-400" /> Due by Thursday, 2:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-200 bg-white/[0.04] backdrop-blur-md p-2.5 rounded-xl border border-white/[0.08] shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Upload Project Report PDF</span>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-indigo-400" /> Due by Friday, 4:30 PM
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
