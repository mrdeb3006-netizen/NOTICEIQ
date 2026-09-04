"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Calendar,
  Search,
  Download,
  RotateCcw,
  AlertTriangle,
  Flame,
  Target,
  ChevronRight,
  Layers,
  GraduationCap,
  Building,
  ShieldAlert,
  Percent,
  Info,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";
import {
  calculateInstitutionAnalytics,
  exportFilteredAnalyticsToCsv,
} from "@/lib/analytics/institutionInsights";
import { initialStudentProfiles } from "@/lib/mockData";
import {
  AnalyticsFilterOptions,
  DateRangePreset,
  NoticeCategory,
} from "@/types/institution";
import { useActiveRole } from "@/lib/roleStore";

export default function InstitutionAnalyticsPage() {
  const { notices, students, institution } = useInstitutionData();
  const { role, facultyProfile, isAdmin } = useActiveRole();

  // For HOD/Faculty: pre-lock dept filter to their department
  const defaultDept = !isAdmin && facultyProfile?.department ? facultyProfile.department : "all";

  // Filters State
  const [filters, setFilters] = useState<AnalyticsFilterOptions>({
    dateRange: "30days",
    department: defaultDept,
    yearClass: "all",
    section: "all",
    category: "all",
    status: "all",
    searchQuery: "",
  });

  // Cohort comparison tab: department | yearClass | section
  const [cohortTab, setCohortTab] = useState<"department" | "yearClass" | "section">("department");

  // Calculate dynamic analytics from source records
  const analytics = useMemo(() => {
    return calculateInstitutionAnalytics(notices, students, initialStudentProfiles, filters);
  }, [notices, students, filters]);

  // Handle CSV Export (Section 40)
  const handleExportCsv = () => {
    if (analytics.noticeAnalyticsList.length === 0) return;
    const csvContent = exportFilteredAnalyticsToCsv(analytics.noticeAnalyticsList);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `NoticeIQ_Analytics_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setFilters({
      dateRange: "30days",
      department: "all",
      yearClass: "all",
      section: "all",
      category: "all",
      status: "all",
      searchQuery: "",
    });
  };

  const isFiltered =
    filters.dateRange !== "30days" ||
    filters.department !== "all" ||
    filters.yearClass !== "all" ||
    filters.section !== "all" ||
    filters.category !== "all" ||
    filters.status !== "all" ||
    filters.searchQuery !== "";

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {isAdmin
                ? "Communication & Action Analytics"
                : role === "hod"
                ? `${facultyProfile?.department ?? "Dept"} Department Analytics`
                : "My Notice Analytics"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {isAdmin ? "Institution-Wide" : role === "hod" ? "Dept Scoped" : "My Notices"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? "Measure how institutional information turns into student action across cohorts."
              : role === "hod"
              ? `Analytics scoped to ${facultyProfile?.department ?? "your"} department notices and student actions.`
              : "Performance analytics for notices you have authored and published."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            disabled={analytics.noticeAnalyticsList.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Section 24, 25) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Multi-Dimensional Filters</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Showing {analytics.totalNotices} matching notices
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Date Range Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as DateRangePreset })}
              className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              disabled={!isAdmin && !!facultyProfile?.department}
              className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="all">All Departments</option>
              <option value="CSE">CSE (Computer Science)</option>
              <option value="ECE">ECE (Electronics)</option>
              <option value="IT">IT (Info Tech)</option>
              <option value="EEE">EEE (Electrical)</option>
              <option value="ME">ME (Mechanical)</option>
            </select>
          </div>

          {/* Year / Class Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">Year / Class</label>
            <select
              value={filters.yearClass}
              onChange={(e) => setFilters({ ...filters, yearClass: e.target.value })}
              className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          {/* Section Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">Section</label>
            <select
              value={filters.section}
              onChange={(e) => setFilters({ ...filters, section: e.target.value })}
              className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Categories</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Examination">Examination</option>
              <option value="Event">Events</option>
              <option value="Academic">Academic</option>
              <option value="Administration">Administration</option>
              <option value="Assignment">Assignment</option>
              <option value="Placement">Placement</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Notice Search */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Title or keyword..."
                value={filters.searchQuery || ""}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top 6 KPI Cards (Section 3) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Core Effectiveness Indicators
          </h2>
          <span className="text-[11px] text-slate-400">Deterministic Source Calculation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">1. Total Notices</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{analytics.totalNotices}</p>
            <span className="text-[10px] text-slate-400 font-medium">Published in period</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">2. Students Reached</span>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600">{analytics.studentsReached.toLocaleString()}</p>
            <span className="text-[10px] text-indigo-600/80 font-medium">Delivered to inboxes</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">3. Relevant Notices</span>
            <p className="text-2xl sm:text-3xl font-black text-sky-600">{analytics.relevantNoticesCount}</p>
            <span className="text-[10px] text-sky-600/80 font-medium">Matched profile criteria</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">4. Actions Generated</span>
            <p className="text-2xl sm:text-3xl font-black text-violet-600">{analytics.actionsGenerated.toLocaleString()}</p>
            <span className="text-[10px] text-violet-600/80 font-medium">Extracted action items</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">5. Actions Completed</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{analytics.actionsCompleted.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-600/80 font-medium">Executed by students</span>
          </div>

          <div className={`p-4 rounded-2xl bg-white border shadow-xs space-y-1 ${analytics.actionsOverdue > 0 ? "border-amber-300 bg-amber-50/20" : "border-slate-200/90"}`}>
            <span className="text-[11px] font-semibold text-slate-500">6. Overdue Actions</span>
            <p className={`text-2xl sm:text-3xl font-black ${analytics.actionsOverdue > 0 ? "text-amber-600" : "text-slate-900"}`}>{analytics.actionsOverdue}</p>
            <span className="text-[10px] text-amber-600/80 font-medium">Missed deadline cutoff</span>
          </div>
        </div>
      </section>

      {/* Main Visuals Grid: Communication Funnel & Metrics Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Communication Funnel (Section 5, 19) (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Institutional Communication Funnel
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full-funnel conversion from publication to tangible student action
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 w-fit">
              {analytics.overallCompletionRate}% Overall Completion
            </span>
          </div>

          {/* Stepper Funnel Bars */}
          <div className="space-y-4">
            {/* Stage 1: Published */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  1. Published
                </span>
                <span>{analytics.funnel.publishedCount.toLocaleString()} students ({analytics.funnel.publishedPct}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-slate-500 rounded-full transition-all duration-500" style={{ width: `${analytics.funnel.publishedPct}%` }} />
              </div>
            </div>

            {/* Stage 2: Delivered */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  2. Delivered / Reached
                </span>
                <span>{analytics.funnel.deliveredCount.toLocaleString()} students ({analytics.funnel.deliveredPct}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${analytics.funnel.deliveredPct}%` }} />
              </div>
            </div>

            {/* Stage 3: Relevant */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  3. Relevant to Audience
                </span>
                <span>{analytics.funnel.relevantCount.toLocaleString()} students ({analytics.funnel.relevantPct}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${analytics.funnel.relevantPct}%` }} />
              </div>
            </div>

            {/* Stage 4: Action Generated */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  4. Action Generated
                </span>
                <span>{analytics.funnel.actionGeneratedCount.toLocaleString()} actions ({analytics.funnel.actionGeneratedPct}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${analytics.funnel.actionGeneratedPct}%` }} />
              </div>
            </div>

            {/* Stage 5: Completed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  5. Action Completed
                </span>
                <span>{analytics.funnel.completedCount.toLocaleString()} actions ({analytics.funnel.completedPct}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${analytics.funnel.completedPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Conversion & Effectiveness Indices (Section 6, 7, 8, 21) (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Action Conversion Card (Section 6) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-sky-50/40 border border-indigo-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">NoticeIQ Metric</span>
              <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                Action Conversion
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {analytics.actionConversionRate}% of relevant students took action
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Formula: Students who completed at least one notice-generated action divided by students who received a relevant notice.
              </p>
            </div>
          </div>

          {/* Actionability Score Card (Section 21) */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Effectiveness Index</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                Actionability
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-600">{analytics.averageActionabilityScore}</span>
                <span className="text-sm font-bold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                NoticeIQ composite score based on relevance rate (30%), action generation (25%), completion (30%), and on-time completion (15%).
              </p>
            </div>
          </div>

          {/* Completion & Overdue Proportions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
              <span className="text-xs font-semibold text-slate-500">Overall Completion</span>
              <p className="text-2xl font-extrabold text-emerald-600">{analytics.overallCompletionRate}%</p>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analytics.overallCompletionRate}%` }} />
              </div>
            </div>

            <div className={`p-4 rounded-2xl bg-white border shadow-xs space-y-1.5 ${analytics.overallOverdueRate > 10 ? "border-rose-200 bg-rose-50/20" : "border-slate-200/90"}`}>
              <span className="text-xs font-semibold text-slate-500">Overdue Rate</span>
              <p className={`text-2xl font-extrabold ${analytics.overallOverdueRate > 10 ? "text-rose-600" : "text-amber-600"}`}>
                {analytics.overallOverdueRate}%
              </p>
              <span className="text-[10px] text-slate-400">Configurable alert threshold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Relevance Distribution & Audience Targeting (Section 9, 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Relevance Distribution (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-600" />
                Notice Relevance Analytics
              </h3>
              <p className="text-xs text-slate-500">Student cohort relevance classification across notices</p>
            </div>
            <span className="text-xs font-bold text-slate-400">Audience Fit</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* HIGH */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-700">HIGH Relevance</span>
                <span className="text-slate-700">{analytics.relevanceDistribution.high.toLocaleString()} ({analytics.relevanceDistribution.highPct}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analytics.relevanceDistribution.highPct}%` }} />
              </div>
            </div>

            {/* MEDIUM */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-sky-700">MEDIUM Relevance</span>
                <span className="text-slate-700">{analytics.relevanceDistribution.medium.toLocaleString()} ({analytics.relevanceDistribution.mediumPct}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${analytics.relevanceDistribution.mediumPct}%` }} />
              </div>
            </div>

            {/* LOW */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-700">LOW Relevance</span>
                <span className="text-slate-700">{analytics.relevanceDistribution.low.toLocaleString()} ({analytics.relevanceDistribution.lowPct}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${analytics.relevanceDistribution.lowPct}%` }} />
              </div>
            </div>

            {/* NOT RELEVANT */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">NOT RELEVANT</span>
                <span className="text-slate-700">{analytics.relevanceDistribution.notRelevant.toLocaleString()} ({analytics.relevanceDistribution.notRelevantPct}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: `${analytics.relevanceDistribution.notRelevantPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Audience Targeting Insights & Deadline Effectiveness (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-600" />
                Deadline Outcomes & Timing
              </h3>
              <p className="text-xs text-slate-500">Calculated completion timing relative to notice deadlines</p>
            </div>
            <span className="text-xs font-bold text-slate-400">Timeliness</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Before Deadline</span>
              <p className="text-2xl font-black text-emerald-800">{analytics.deadlineEffectiveness.beforeDeadlinePct}%</p>
              <span className="text-[10px] text-emerald-600 font-medium">Proactive action</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 text-center space-y-1">
              <span className="text-[10px] font-bold text-sky-700 uppercase">On Deadline</span>
              <p className="text-2xl font-black text-sky-800">{analytics.deadlineEffectiveness.onDeadlinePct}%</p>
              <span className="text-[10px] text-sky-600 font-medium">Same-day cutoff</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase">After Deadline</span>
              <p className="text-2xl font-black text-slate-700">{analytics.deadlineEffectiveness.afterDeadlinePct}%</p>
              <span className="text-[10px] text-slate-500 font-medium">Late submission</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Overdue</span>
              <p className="text-2xl font-black text-amber-800">{analytics.deadlineEffectiveness.overduePct}%</p>
              <span className="text-[10px] text-amber-600 font-medium">Missed entirely</span>
            </div>
          </div>

          {/* Missed Deadline Warning Insight (Section 20) */}
          {analytics.actionsOverdue > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">
                  {analytics.actionsOverdue} notice-related actions have not been completed by students.
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 shrink-0">
                Aggregate Insight
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notice Performance Table (Section 4) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Notice Performance Table
            </h2>
            <p className="text-xs text-slate-500">
              Detailed breakdown of reach, relevance, and action conversion for each circular
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {analytics.noticeAnalyticsList.length} notices
          </span>
        </div>

        {analytics.noticeAnalyticsList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No notices match your filter criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting the date range, department, or search term to see communication analytics.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 pl-6">Notice</th>
                    <th className="p-4">Target Audience</th>
                    <th className="p-4 text-center">Reached</th>
                    <th className="p-4 text-center">Relevant</th>
                    <th className="p-4 text-center">Actions</th>
                    <th className="p-4 text-center">Completed</th>
                    <th className="p-4 text-center">Overdue</th>
                    <th className="p-4 text-center">Completion</th>
                    <th className="p-4 text-center">Actionability</th>
                    <th className="p-4 pr-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {analytics.noticeAnalyticsList.map((notice) => (
                    <tr key={notice.noticeId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-slate-900 max-w-xs truncate" title={notice.noticeTitle}>
                          {notice.noticeTitle}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span>{notice.category}</span>
                          <span>•</span>
                          <span>{notice.publicationDate}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {notice.targetAudience}
                        </span>
                      </td>

                      <td className="p-4 text-center font-bold text-slate-800">
                        {notice.studentsReached}
                      </td>

                      <td className="p-4 text-center">
                        <span className="font-bold text-sky-700">{notice.studentsRelevant}</span>
                        <span className="text-[10px] text-slate-400 block">({notice.studentsNotRelevant} non-rel)</span>
                      </td>

                      <td className="p-4 text-center font-bold text-violet-700">
                        {notice.actionsGenerated}
                      </td>

                      <td className="p-4 text-center font-bold text-emerald-700">
                        {notice.actionsCompleted}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`font-bold ${notice.actionsOverdue > 0 ? "text-amber-600" : "text-slate-400"}`}>
                          {notice.actionsOverdue}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          {notice.completionRate}%
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {notice.actionabilityScore}/100
                        </span>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <Link
                          href={`/institution/notices/${notice.noticeId}/analytics`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold text-xs transition-colors"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Cohort Performance Breakdown Switcher (Section 11, 12) */}
      <section className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Cohort Action Performance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare completion and overdue rates across departments, years, and sections
            </p>
          </div>

          <div className="flex items-center rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setCohortTab("department")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cohortTab === "department" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Department
            </button>
            <button
              onClick={() => setCohortTab("yearClass")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cohortTab === "yearClass" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Year / Class
            </button>
            <button
              onClick={() => setCohortTab("section")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cohortTab === "section" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Section
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cohortTab === "department" &&
            analytics.departmentPerformance.map((dept) => (
              <div key={dept.department} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{dept.department}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {dept.completionRate}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Notices</span>
                    <span className="font-bold text-slate-800">{dept.notices}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Actions</span>
                    <span className="font-bold text-violet-700">{dept.actions}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Overdue</span>
                    <span className={`font-bold ${dept.overdue > 0 ? "text-amber-600" : "text-slate-400"}`}>{dept.overdue}</span>
                  </div>
                </div>
              </div>
            ))}

          {cohortTab === "yearClass" &&
            analytics.yearClassPerformance.map((yr) => (
              <div key={yr.yearClass} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{yr.yearClass}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {yr.completionRate}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Notices</span>
                    <span className="font-bold text-slate-800">{yr.notices}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Actions</span>
                    <span className="font-bold text-violet-700">{yr.actions}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Overdue</span>
                    <span className={`font-bold ${yr.overdue > 0 ? "text-amber-600" : "text-slate-400"}`}>{yr.overdue}</span>
                  </div>
                </div>
              </div>
            ))}

          {cohortTab === "section" &&
            analytics.sectionPerformance.map((sec) => (
              <div key={sec.section} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{sec.section}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {sec.completionRate}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Notices</span>
                    <span className="font-bold text-slate-800">{sec.notices}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Actions</span>
                    <span className="font-bold text-violet-700">{sec.actions}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Overdue</span>
                    <span className={`font-bold ${sec.overdue > 0 ? "text-amber-600" : "text-slate-400"}`}>{sec.overdue}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Notice Category Performance (Section 13) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">
            Notice Category Performance
          </h2>
          <span className="text-xs text-slate-400">Aggregated by Circular Domain</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.categoryPerformance.map((cat) => (
            <div key={cat.category} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{cat.category}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {cat.notices} notices
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Completion Rate</span>
                  <span className="font-bold text-emerald-700">{cat.completionRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cat.completionRate}%` }} />
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>{cat.studentsReached.toLocaleString()} reached</span>
                <span>{cat.actionsGenerated} actions</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NoticeIQ Explainable Insights (Section 22, 33) */}
      <section className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900">NoticeIQ Insights</h3>
            <p className="text-xs text-slate-500">Explainable deterministic observations derived from institutional communication flow</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.insights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">{insight.title}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    {insight.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Boundary Assurance (Section 17, 18) */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>NoticeIQ Privacy Guard</strong>: Institution analytics aggregates only circulars and institutional tasks. Student private notes, personal schedules, and individual profiles remain strictly private.
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Strict Multi-Tenant
        </span>
      </div>
    </div>
  );
}
