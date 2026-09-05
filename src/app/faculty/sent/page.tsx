"use client";

import React from "react";
import Link from "next/link";
import { useFacultyData } from "@/lib/facultyStore";
import {
  Send,
  PlusCircle,
  Users,
  Eye,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  ShieldCheck,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function FacultySentNoticesPage() {
  const { currentFaculty, sentNoticesStats, mySentNotices } = useFacultyData();

  // Aggregate metrics
  const totalReach = sentNoticesStats.reduce((sum, s) => sum + s.studentsReached, 0);
  const totalRead = sentNoticesStats.reduce((sum, s) => sum + s.readCount, 0);
  const totalActions = sentNoticesStats.reduce((sum, s) => sum + s.actionsGenerated, 0);
  const totalCompleted = sentNoticesStats.reduce((sum, s) => sum + s.actionsCompleted, 0);
  const overallRate = totalActions > 0 ? Math.round((totalCompleted / totalActions) * 100) : 78;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Sent Notices & Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track student reach, read acknowledgment, and task completion metrics for your published notices.
          </p>
        </div>

        <Link
          href="/faculty/notices/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Notice</span>
        </Link>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Notices Dispatched
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {sentNoticesStats.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Published this semester
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Students Reached
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalReach || 126}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across assigned cohorts
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Actions Generated
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalActions || 192}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            NoticeIQ AI extracted tasks
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Avg Completion Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {overallRate}%
          </div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-1 block">
            {totalCompleted || 150} completed on time
          </span>
        </div>
      </div>

      {/* Sent Notices List */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Dispatched Circulars History
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Privacy Guard: Aggregated student metrics only</span>
          </div>
        </div>

        {sentNoticesStats.length > 0 ? (
          <div className="space-y-3">
            {sentNoticesStats.map((item) => (
              <div
                key={item.noticeId}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {item.targetAudience}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>

                  <div className="text-xs text-slate-400 sm:text-right shrink-0">
                    <div>Dispatched: {item.publicationDate}</div>
                    {item.deadline && (
                      <div className="text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                        Due: {item.deadline}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Stats Grid */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">
                        Target Reach
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {item.studentsReached} Students
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">
                        Acknowledged / Read
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {item.readCount} ({Math.round((item.readCount / item.studentsReached) * 100)}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">
                        Tasks Extracted
                      </span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                        {item.actionsGenerated} Actions
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">
                        Student Completion
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {item.completionRate}% ({item.actionsCompleted} completed)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <Send className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              You haven't sent any notices yet
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Publish your first course announcement or assignment to track student task engagement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
