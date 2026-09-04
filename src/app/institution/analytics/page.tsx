"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Campus Analytics & Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
              Preview Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time student notice engagement, read rates, and deadline completion tracking.
          </p>
        </div>
      </div>

      {/* Feature Teaser Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Notice Open Rate</span>
          <p className="text-2xl font-extrabold text-slate-900">89.4%</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +4.2% from last month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">On-Time Submissions</span>
          <p className="text-2xl font-extrabold text-slate-900">94.1%</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Highest in CSE Year 1
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Avg. Acknowledgment Time</span>
          <p className="text-2xl font-extrabold text-slate-900">3.4 hrs</p>
          <span className="text-[11px] text-slate-500">
            Automated mobile notification
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Active Students Today</span>
          <p className="text-2xl font-extrabold text-slate-900">1,890</p>
          <span className="text-[11px] text-indigo-600 font-semibold">
            78% daily active rate
          </span>
        </div>
      </div>

      {/* Analytics Chart Mockup Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <BarChart3 className="w-7 h-7" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-slate-900">
            Advanced Analytics Engine — Coming Soon
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Cohort segmentation trends, deadline completion heatmaps, and automatic drop-off alerts will be fully configurable in upcoming NoticeIQ releases.
          </p>
        </div>

        <Link
          href="/institution/dashboard"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
