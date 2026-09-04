import React from "react";
import { Button } from "../ui/Button";
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Clock,
  Layers,
} from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background glow and subtle dot grid */}
      <div className="absolute inset-0 bg-subtle-glow pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Top Product Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs mb-8 hover:border-indigo-200 transition-colors">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            NOTICEIQ
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
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
            className="w-full sm:w-auto px-8"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Get Started
          </Button>
          <Button
            href="#how-it-works"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-7"
            leftIcon={<Layers className="w-4 h-4 text-slate-400" />}
          >
            See How It Works
          </Button>
        </div>

        {/* Visual Teaser Preview Card: Transforming Raw Notice into Action Tasks */}
        <div className="max-w-3xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-indigo-500/5 p-4 sm:p-6 text-left transition-all hover:shadow-2xl hover:shadow-indigo-500/10">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-semibold text-slate-400">
                NoticeIQ Intelligent Engine
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <CheckCircle2 className="w-3 h-3" /> Live Demo Mode
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {/* Left: Raw Notice Simulation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Incoming Raw Notice
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Academic Office</span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-snug">
                “Final Semester Project submissions and lab clearances must be completed before Friday 5 PM. Late submissions attract penalties.”
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" /> 230 students notified
              </div>
            </div>

            {/* Right: Personalized Action Items Generated */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Your Personalized Actions
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                  Priority 1
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-start gap-2 text-xs text-slate-800 bg-white p-2 rounded-lg border border-indigo-100/80 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">Lab Clearance Sign-off</span>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> Due by Thursday, 2:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-800 bg-white p-2 rounded-lg border border-indigo-100/80 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">Upload Project Report PDF</span>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> Due by Friday, 4:30 PM
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
