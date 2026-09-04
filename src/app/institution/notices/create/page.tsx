"use client";

import React from "react";
import Link from "next/link";
import { Megaphone, Sparkles, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

export default function CreateNoticePage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6 text-center">
      <div className="flex justify-start">
        <Link
          href="/institution/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
          <Megaphone className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/60">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Notice Creation — Coming in Step 4</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Notice Authoring Engine
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            In Step 4, you will be able to upload PDF circulars, type raw announcements, and let NoticeIQ auto-extract deadlines, eligibility criteria, and student priority tasks.
          </p>
        </div>

        {/* Preview of Upcoming Capability */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 max-w-md mx-auto text-xs text-slate-600">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Step 4 Upcoming Highlights</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-500">
            <li>PDF Circular dropzone with OCR extraction</li>
            <li>Automatic target cohort resolution</li>
            <li>Student deadline calendar integration</li>
            <li>Read receipt & acknowledgment tracking</li>
          </ul>
        </div>

        <div className="pt-2">
          <Link
            href="/institution/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/25 transition-transform hover:scale-[1.02]"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
