"use client";

import React from "react";
import Link from "next/link";
import { Target, Sparkles, ArrowRight } from "lucide-react";

export default function StudentMatrixPage() {
  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-6 max-w-xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
        <Target className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Coming in Step 5</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Task Priority Matrix</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Eisenhower-inspired urgency ranking that automatically categorizes deadlines into Critical, High Priority, and Scheduled focus areas.
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
