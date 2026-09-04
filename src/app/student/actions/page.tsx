"use client";

import React from "react";
import Link from "next/link";
import { Zap, Sparkles, ArrowRight } from "lucide-react";

export default function StudentActionsPage() {
  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-6 max-w-xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
        <Zap className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span>Coming in Step 5</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Personalized Student Action Plan</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Step-by-step tasks extracted directly from your circulars with automated deadline countdowns and document checklist trackers.
        </p>
      </div>

      <Link
        href="/student/dashboard"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20"
      >
        <span>Back to Dashboard</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
