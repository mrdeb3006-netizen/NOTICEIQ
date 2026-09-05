"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";

export default function StudentInsightsPage() {
  const {
    currentStudent,
    getStudentPriorityTasks,
    completedTaskIds,
    getStudentNoticesWithRelevance,
  } = useStudentAuth();

  const notices = getStudentNoticesWithRelevance();
  const allTasks = useMemo(() => getStudentPriorityTasks(), [getStudentPriorityTasks]);

  const {
    totalTasks,
    completedTasks,
    completionRate,
    personalTasksCount,
    institutionTasksCount,
  } = useMemo(() => {
    let completed = 0;
    let personal = 0;
    let institution = 0;

    allTasks.forEach((t) => {
      if (completedTaskIds.includes(t.id)) completed++;
      if (t.taskType === "PERSONAL") personal++;
      else institution++;
    });

    const rate = allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 100;

    return {
      totalTasks: allTasks.length,
      completedTasks: completed,
      completionRate: rate,
      personalTasksCount: personal,
      institutionTasksCount: institution,
    };
  }, [allTasks, completedTaskIds]);

  const relevantNoticesCount = useMemo(() => {
    return notices.filter(
      (n) => n.relevance.relevance === "HIGH" || n.relevance.relevance === "MEDIUM"
    ).length;
  }, [notices]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-left">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Insights
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your task completion patterns and academic notice activity.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Completed Work</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{completedTasks}</span>
            <span className="text-xs text-slate-400">/ {totalTasks} total</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {completionRate}% overall completion rate
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Notices Processed</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{notices.length}</span>
            <span className="text-xs text-slate-400">received</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {relevantNoticesCount} identified as relevant to you
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Study Cadence</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {currentStudent?.availableDailyHours || "2h"}
            </span>
            <span className="text-xs text-slate-400">allocated daily</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Preferred: {currentStudent?.preferredStartTime || "6 PM"} –{" "}
            {currentStudent?.preferredEndTime || "10 PM"}
          </p>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Workload Distribution</h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Institution Notice Tasks</span>
              <span className="font-bold text-slate-900">{institutionTasksCount}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{
                  width: `${
                    totalTasks > 0 ? (institutionTasksCount / totalTasks) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Personal Tasks</span>
              <span className="font-bold text-slate-900">{personalTasksCount}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${
                    totalTasks > 0 ? (personalTasksCount / totalTasks) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reflection Note */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-slate-900">How NoticeIQ helps you stay on track</p>
          <p className="text-slate-500 leading-relaxed">
            Tasks extracted from college notices are automatically scheduled within your preferred study hours.
            Overriding priority or rescheduling tasks directly teaches NoticeIQ your personal working preferences.
          </p>
        </div>
      </div>
    </div>
  );
}
