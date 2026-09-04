"use client";

import React, { use, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Target,
  CheckCircle2,
  AlertTriangle,
  Flame,
  BarChart3,
  Layers,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Percent,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";
import { calculateNoticeMetrics } from "@/lib/analytics/institutionInsights";
import { initialStudentProfiles } from "@/lib/mockData";

export default function NoticeDetailAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const { notices, students } = useInstitutionData();

  const notice = notices.find((n) => n.id === unwrappedParams.id) || notices[0];

  const metrics = useMemo(() => {
    if (!notice) return null;
    return calculateNoticeMetrics(notice, students, initialStudentProfiles);
  }, [notice, students]);

  if (!notice || !metrics) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Notice Not Found</h2>
        <Link
          href="/institution/analytics"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analytics</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <Link href="/institution/analytics" className="hover:text-indigo-600 transition-colors font-medium">
            Analytics
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href={`/institution/notices/${notice.id}`} className="hover:text-indigo-600 transition-colors font-medium">
            {notice.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Impact Analytics</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/institution/notices/${notice.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Circular</span>
          </Link>
        </div>
      </div>

      {/* Notice Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase">
                {notice.category}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase">
                {notice.status}
              </span>
              <span className="text-xs text-slate-400">
                Published {metrics.publicationDate}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {notice.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Target: <strong>{metrics.targetAudience}</strong>
              </span>
              {notice.deadline && (
                <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  Deadline: {notice.deadline}
                </span>
              )}
            </div>
          </div>

          {/* Actionability Badge */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-center space-y-1 shrink-0">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
              Actionability Score
            </span>
            <div className="text-3xl font-black text-indigo-700">
              {metrics.actionabilityScore} <span className="text-sm font-bold text-indigo-400">/ 100</span>
            </div>
            <span className="text-[10px] text-slate-500 block">NoticeIQ Effectiveness Index</span>
          </div>
        </div>
      </div>

      {/* Top 4 Performance Cards (Section 15) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reach Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Student Reach</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{metrics.studentsReached} students</p>
          <span className="text-[11px] text-slate-400 block">
            Targeted: {metrics.studentsTargeted} students
          </span>
        </div>

        {/* Relevance Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Relevance</span>
            <Target className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-sky-700">{metrics.studentsRelevant} relevant</p>
          <span className="text-[11px] text-slate-400 block">
            {metrics.relevanceBreakdown.high} High • {metrics.relevanceBreakdown.medium} Med • {metrics.relevanceBreakdown.low} Low
          </span>
        </div>

        {/* Actions Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Actions Generated</span>
            <CheckCircle2 className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-2xl font-black text-violet-700">{metrics.actionsGenerated} actions</p>
          <span className="text-[11px] text-slate-400 block">
            {metrics.actionsCompleted} completed • {metrics.actionsOverdue} overdue
          </span>
        </div>

        {/* Completion Rate Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{metrics.completionRate}%</p>
          <span className="text-[11px] text-slate-400 block">
            {metrics.actionConversionRate}% relevant students took action
          </span>
        </div>
      </div>

      {/* Notice-Specific Communication Funnel (Section 15) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Notice Communication Pipeline
            </h2>
            <p className="text-xs text-slate-500">Timeline and drop-off conversion for this circular</p>
          </div>
          <span className="text-xs font-bold text-slate-400">Notice-Level Funnel</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">1. Published</span>
            <p className="text-xl font-black text-slate-900">{metrics.studentsTargeted}</p>
            <span className="text-[10px] text-slate-400">Target cohort</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
            <span className="text-[11px] font-bold text-indigo-700 uppercase">2. Received</span>
            <p className="text-xl font-black text-indigo-800">{metrics.studentsReached}</p>
            <span className="text-[10px] text-indigo-600 font-medium">96% delivery</span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
            <span className="text-[11px] font-bold text-sky-700 uppercase">3. Relevant</span>
            <p className="text-xl font-black text-sky-800">{metrics.studentsRelevant}</p>
            <span className="text-[10px] text-sky-600 font-medium">Target match</span>
          </div>

          <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-1">
            <span className="text-[11px] font-bold text-violet-700 uppercase">4. Generated</span>
            <p className="text-xl font-black text-violet-800">{metrics.actionsGenerated}</p>
            <span className="text-[10px] text-violet-600 font-medium">Tasks routed</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">5. Completed</span>
            <p className="text-xl font-black text-emerald-800">{metrics.actionsCompleted}</p>
            <span className="text-[10px] text-emerald-600 font-medium">{metrics.completionRate}% rate</span>
          </div>
        </div>
      </div>

      {/* Student Action Status & Deadline Outcomes Grid (Section 16, 20) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Aggregated Student Action States (Section 16) (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Aggregated Student Action States
              </h3>
              <p className="text-xs text-slate-500">Live execution stages across relevant student cohorts</p>
            </div>
            <span className="text-xs font-bold text-slate-400">Task Status</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                COMPLETED
              </span>
              <span className="font-extrabold text-emerald-900">{metrics.actionStates.completed} actions</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-xs">
              <span className="font-bold text-sky-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                IN_PROGRESS
              </span>
              <span className="font-extrabold text-sky-900">{metrics.actionStates.inProgress} actions</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                NOT_STARTED
              </span>
              <span className="font-extrabold text-slate-800">{metrics.actionStates.notStarted} actions</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
              <span className="font-bold text-amber-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                OVERDUE
              </span>
              <span className="font-extrabold text-amber-900">{metrics.actionStates.overdue} actions</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs">
              <span className="font-bold text-rose-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                BLOCKED (Prerequisite Needed)
              </span>
              <span className="font-extrabold text-rose-900">{metrics.actionStates.blocked} actions</span>
            </div>
          </div>
        </div>

        {/* Deadline Outcomes & Missed Action Warning (Section 14, 20) (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-600" />
                Submission Timing Outcomes
              </h3>
              <p className="text-xs text-slate-500">Timing breakdown relative to deadline cutoff</p>
            </div>
            <span className="text-xs font-bold text-slate-400">Cutoff Tracking</span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="font-medium text-slate-700">Completed Before Deadline</span>
              <span className="font-bold text-emerald-700">{metrics.deadlineOutcomes.beforeDeadline} actions</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="font-medium text-slate-700">Completed On Deadline Day</span>
              <span className="font-bold text-sky-700">{metrics.deadlineOutcomes.onDeadline} actions</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="font-medium text-slate-700">Completed After Deadline (Late)</span>
              <span className="font-bold text-slate-700">{metrics.deadlineOutcomes.afterDeadline} actions</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-200">
              <span className="font-medium text-amber-900">Overdue (Uncompleted)</span>
              <span className="font-bold text-amber-800">{metrics.deadlineOutcomes.overdue} actions</span>
            </div>
          </div>

          {/* Missed Deadline Warning (Section 20) */}
          {metrics.actionsOverdue > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-extrabold">Missed Deadline Insight</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                <strong>{metrics.actionsOverdue} students</strong> have not completed the required action before the cutoff. An automated reminder can be dispatched via notice update.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Guarantee (Section 17, 18) */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Institutional Privacy Boundary</strong>: NoticeIQ analytics aggregates action outcomes in bulk. Private student notes, schedules, and individual student identities remain strictly protected.
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Privacy Assured
        </span>
      </div>
    </div>
  );
}
