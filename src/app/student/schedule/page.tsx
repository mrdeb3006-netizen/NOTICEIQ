"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Zap,
  Target,
  ChevronRight,
  Shield,
  Layers,
  ChevronDown,
  Info,
  Play,
  RotateCcw,
  Sliders,
  MoveRight,
  X,
  PlusCircle,
  ExternalLink,
  Flame,
  Check,
  Pause,
  Timer,
  FileText,
  User,
  Trash2,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";
import {
  ScheduleItem,
  DailyPlan,
  UnscheduledTask,
  TaskQuadrant,
  ScheduleItemStatus,
} from "@/types/student";

// Helper color and label mappings for Priority Quadrants
const QUADRANT_CONFIG: Record<
  TaskQuadrant,
  {
    label: string;
    sublabel: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    dotColor: string;
    accentBg: string;
  }
> = {
  Q1: {
    label: "Q1 — DO FIRST",
    sublabel: "Urgent & Important",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200",
    dotColor: "bg-rose-500",
    accentBg: "from-rose-500/10 to-transparent",
  },
  Q2: {
    label: "Q2 — SCHEDULE",
    sublabel: "Important, Not Urgent",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    dotColor: "bg-amber-500",
    accentBg: "from-amber-500/10 to-transparent",
  },
  Q3: {
    label: "Q3 — DELEGATE",
    sublabel: "Urgent, Low Consequence",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-700",
    badgeBorder: "border-sky-200",
    dotColor: "bg-sky-500",
    accentBg: "from-sky-500/10 to-transparent",
  },
  Q4: {
    label: "Q4 — LATER",
    sublabel: "Low Priority",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-600",
    badgeBorder: "border-slate-200",
    dotColor: "bg-slate-400",
    accentBg: "from-slate-500/10 to-transparent",
  },
};

function StudentScheduleContent() {
  const searchParams = useSearchParams();
  const initialView = (searchParams.get("view") as "today" | "week" | "upcoming") || "today";

  const {
    currentStudent,
    isLoaded,
    getStudentSchedule,
    getStudentAvailability,
    updateScheduleItem,
    removeScheduleItem,
    setScheduleItemStatus,
    regenerateStudentPlan,
    toggleTaskComplete,
    taskVersion,
  } = useStudentAuth();

  const [activeView, setActiveView] = useState<"today" | "week" | "upcoming">(initialView);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // Modals & Drawers
  const [selectedFocusItem, setSelectedFocusItem] = useState<ScheduleItem | null>(null);
  const [itemToMove, setItemToMove] = useState<ScheduleItem | null>(null);
  const [moveStartTime, setMoveStartTime] = useState("18:00");
  const [moveDuration, setMoveDuration] = useState(30);
  const [itemToRemove, setItemToRemove] = useState<ScheduleItem | null>(null);
  const [showUnscheduledDrawer, setShowUnscheduledDrawer] = useState(false);

  // Focus Mode State
  const [focusActive, setFocusActive] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(0);

  // Read schedule from store
  const availability = useMemo(() => {
    return getStudentAvailability();
  }, [getStudentAvailability, currentStudent]);

  const scheduleResult = useMemo(() => {
    return getStudentSchedule(7);
  }, [getStudentSchedule, currentStudent, taskVersion]);

  const todayPlan = scheduleResult.dailyPlans[0] || null;
  const upcomingPlans = scheduleResult.dailyPlans.slice(1);
  const unscheduledTasks = scheduleResult.unscheduledTasks;
  const nextAction = scheduleResult.nextActionItem;

  // Format today's date
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Generation sequence animation
  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setGenerationStep(1);

    const steps = [
      "Analyzing your priorities...",
      "Checking deadlines...",
      "Checking dependencies...",
      "Finding available time...",
      "Building your plan...",
      "Plan ready!",
    ];

    let current = 1;
    const interval = setInterval(() => {
      current++;
      if (current <= steps.length) {
        setGenerationStep(current);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          regenerateStudentPlan(7);
          setIsGenerating(false);
          setGenerationStep(0);
        }, 400);
      }
    }, 280);
  };

  // Focus timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (focusActive) {
      interval = setInterval(() => {
        setFocusSeconds((sec) => sec + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusActive]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Calculate today's quadrant breakdown
  const todayQuadrantCounts = useMemo(() => {
    const counts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    todayPlan?.items?.forEach((it) => {
      if (counts[it.quadrant] !== undefined) {
        counts[it.quadrant]++;
      }
    });
    return counts;
  }, [todayPlan]);

  // Approaching deadline count
  const deadlineApproachingCount = useMemo(() => {
    let count = 0;
    todayPlan?.items?.forEach((it) => {
      if (it.deadline) count++;
    });
    return count;
  }, [todayPlan]);

  if (!isLoaded) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading your smart schedule...</p>
      </div>
    );
  }

  // Zero available time state
  if (availability.availableDailyMinutes <= 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">No available work time is configured</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            NoticeIQ needs your preferred study hours to generate an intelligent daily plan without overloading you.
          </p>
        </div>
        <Link
          href="/student/settings"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20"
        >
          <Sliders className="w-4 h-4" />
          <span>Set Availability in Settings</span>
        </Link>
      </div>
    );
  }

  const allScheduledCount = scheduleResult.dailyPlans.reduce((acc, p) => acc + p.items.length, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Header & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Smart Action Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Smart Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Turn your priorities into a realistic, actionable daily and weekly plan.
          </p>
        </div>

        {/* Action Buttons & Preferences */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{allScheduledCount > 0 ? "Regenerate Plan" : "Generate My Plan"}</span>
          </button>

          <Link
            href="/student/settings"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors shadow-xs"
            title="Edit work hours and study buffer"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">
              {availability.preferredStartTime}–{availability.preferredEndTime} (
              {Math.round(availability.availableDailyMinutes / 60)}h/day)
            </span>
            <span className="sm:hidden">Hours</span>
          </Link>
        </div>
      </div>

      {/* Plan Generation Progress Banner (if generating) */}
      {isGenerating && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-violet-900 text-white shadow-lg space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
              Building Your Optimal Schedule
            </span>
            <span className="text-indigo-200 text-[11px] font-mono">Step {generationStep} of 6</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(generationStep / 6) * 100}%` }}
            />
          </div>
          <p className="text-xs text-indigo-100 font-medium">
            {generationStep === 1 && "Analyzing Q1–Q4 priority weights & student overrides..."}
            {generationStep === 2 && "Checking task deadlines & approaching due dates..."}
            {generationStep === 3 && "Verifying prerequisite & topological dependency chains..."}
            {generationStep === 4 && "Allocating non-overlapping slots inside preferred hours..."}
            {generationStep === 5 && "Balancing 15% flexible buffer for stress-free execution..."}
            {generationStep >= 6 && "✓ Plan verified & ready!"}
          </p>
        </div>
      )}

      {/* 2. Top Next Action Hero Card */}
      {nextAction && (
        <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/50">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
                  YOUR NEXT ACTION
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-bold">
                  {nextAction.startTime} — {nextAction.endTime} • {nextAction.durationMinutes} min
                </span>
                {nextAction.taskType === "PERSONAL" ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                    <User className="w-2.5 h-2.5" /> Personal
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold flex items-center gap-1">
                    <FileText className="w-2.5 h-2.5" /> Notice Action
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {nextAction.taskTitle}
                </h3>
                {nextAction.noticeTitle && (
                  <p className="text-xs text-indigo-200/80 font-medium mt-0.5">
                    From: {nextAction.noticeTitle}
                  </p>
                )}
              </div>

              {/* Explainable Why This Time */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-indigo-100 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Why scheduled now: </span>
                  <span className="text-indigo-200">{nextAction.whyScheduledHere}</span>
                </div>
              </div>

              {/* Blocking dependencies notice */}
              {nextAction.dependencies?.blocksTaskTitles?.length ? (
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Blocks: {nextAction.dependencies.blocksTaskTitles.join(", ")}</span>
                </div>
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row md:flex-col items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setSelectedFocusItem(nextAction);
                  setFocusActive(true);
                  setFocusSeconds(0);
                }}
                className="flex-1 md:flex-none w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Focus</span>
              </button>

              <button
                onClick={() => {
                  setScheduleItemStatus(nextAction.id, nextAction.taskId, "COMPLETED");
                }}
                className="flex-1 md:flex-none w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Daily Capacity Breakdown Bar & Summary */}
      {todayPlan && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Today&apos;s Capacity & Allocation
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                {Math.floor(todayPlan.availableMinutes / 60)}h{" "}
                {todayPlan.availableMinutes % 60 > 0 ? `${todayPlan.availableMinutes % 60}m` : ""}{" "}
                Available Work Window
              </h2>
            </div>

            {/* Metrics Chips */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>{todayPlan.scheduledMinutes}m Scheduled</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{todayPlan.bufferMinutes}m Flexible Buffer (15%)</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5">
                <span>{todayPlan.remainingMinutes}m Flexible</span>
              </div>
            </div>
          </div>

          {/* Progress Breakdown Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
              <div
                className="bg-indigo-600 h-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (todayPlan.scheduledMinutes / (todayPlan.availableMinutes || 1)) * 100
                  )}%`,
                }}
                title={`Scheduled: ${todayPlan.scheduledMinutes}m`}
              />
              <div
                className="bg-emerald-400 h-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (todayPlan.bufferMinutes / (todayPlan.availableMinutes || 1)) * 100
                  )}%`,
                }}
                title={`Flexible Buffer: ${todayPlan.bufferMinutes}m`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>{availability.preferredStartTime} (Start)</span>
              <span className="text-slate-400">
                Quadrant tasks today: 🔴 {todayQuadrantCounts.Q1} • 🟡 {todayQuadrantCounts.Q2} • 🔵{" "}
                {todayQuadrantCounts.Q3}
              </span>
              <span>{availability.preferredEndTime} (End)</span>
            </div>
          </div>

          {/* Conflict Warnings if any */}
          {scheduleResult.conflicts.length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Workload note:</strong> Some lower-priority tasks could not fit into your
                  current available study hours this week.
                </span>
              </div>
              <button
                onClick={() => setShowUnscheduledDrawer(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-200/60 hover:bg-amber-200 font-bold text-amber-900 text-[11px] shrink-0"
              >
                View Unscheduled ({unscheduledTasks.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveView("today")}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-colors ${
              activeView === "today"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            TODAY ({todayPlan?.items?.length || 0})
          </button>

          <button
            onClick={() => setActiveView("upcoming")}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-colors ${
              activeView === "upcoming"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            UPCOMING (Next 7 Days)
          </button>

          <button
            onClick={() => setActiveView("week")}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-colors ${
              activeView === "week"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            WEEK VIEW
          </button>
        </div>

        {unscheduledTasks.length > 0 && (
          <button
            onClick={() => setShowUnscheduledDrawer(true)}
            className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
          >
            <span>Unscheduled</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
              {unscheduledTasks.length}
            </span>
          </button>
        )}
      </div>

      {/* 5. VIEW 1: TODAY TIMELINE VIEW */}
      {activeView === "today" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">
              Today — {todayFormatted}
            </h2>
            <span className="text-xs font-bold text-slate-500">
              Available: {Math.floor(availability.availableDailyMinutes / 60)}h{" "}
              {availability.availableDailyMinutes % 60 > 0
                ? `${availability.availableDailyMinutes % 60}m`
                : ""}
            </span>
          </div>

          {todayPlan?.items && todayPlan.items.length > 0 ? (
            <div className="space-y-4 relative before:absolute before:left-4 sm:before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
              {todayPlan.items.map((item, idx) => {
                const quadConfig = QUADRANT_CONFIG[item.quadrant] || QUADRANT_CONFIG.Q4;
                const isCompleted = item.status === "COMPLETED";
                const isSkipped = item.status === "SKIPPED";
                const isInProgress = item.status === "IN_PROGRESS";

                return (
                  <div
                    key={item.id}
                    className={`relative pl-10 sm:pl-14 transition-all ${
                      isCompleted ? "opacity-60" : ""
                    }`}
                  >
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute left-2 sm:left-4 top-5 w-4 h-4 rounded-full border-2 border-white shadow-xs z-10 flex items-center justify-center ${
                        isCompleted
                          ? "bg-emerald-500"
                          : isInProgress
                          ? "bg-indigo-600 ring-4 ring-indigo-100 animate-pulse"
                          : quadConfig.dotColor
                      }`}
                    >
                      {isCompleted && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>

                    {/* Schedule Card */}
                    <div
                      className={`p-5 rounded-3xl bg-white border transition-all hover:shadow-md ${
                        item.scheduleOverride
                          ? "border-indigo-300 ring-2 ring-indigo-50"
                          : "border-slate-200/90"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2.5 flex-1">
                          {/* Card Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${quadConfig.badgeBg} ${quadConfig.badgeText} ${quadConfig.badgeBorder}`}
                            >
                              {quadConfig.label}
                            </span>

                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {item.startTime} — {item.endTime} ({item.durationMinutes} min)
                            </span>

                            {item.scheduleOverride && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                                ✍ Customized Time
                              </span>
                            )}

                            {item.isSplit && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                                Part {item.splitPart}/{item.totalSplitParts}
                              </span>
                            )}

                            {item.taskType === "PERSONAL" ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                👤 Personal
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                                📢 Notice Action
                              </span>
                            )}
                          </div>

                          {/* Task Title */}
                          <div>
                            <h3
                              className={`text-base font-extrabold text-slate-900 ${
                                isCompleted ? "line-through text-slate-400" : ""
                              }`}
                            >
                              {item.taskTitle}
                            </h3>
                            {item.noticeTitle && (
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Source: {item.noticeTitle}
                              </p>
                            )}
                          </div>

                          {/* Deadline info */}
                          {item.deadline && (
                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>Deadline: {item.deadline}</span>
                            </div>
                          )}

                          {/* Dependency notices */}
                          {item.dependencies?.blocksTaskTitles?.length ? (
                            <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-800 font-semibold flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>⚠ Blocks: {item.dependencies.blocksTaskTitles.join(", ")}</span>
                            </div>
                          ) : null}

                          {/* Why Scheduled Here Callout */}
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-700">Why this time? </span>
                              <span>{item.whyScheduledHere}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Controls & Actions */}
                        <div className="flex sm:flex-col items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                          <button
                            onClick={() =>
                              setScheduleItemStatus(
                                item.id,
                                item.taskId,
                                isCompleted ? "PLANNED" : "COMPLETED"
                              )
                            }
                            className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                              isCompleted
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isCompleted ? "Reopen" : "Complete"}</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedFocusItem(item);
                              setFocusActive(true);
                              setFocusSeconds(0);
                            }}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Focus</span>
                          </button>

                          <div className="flex items-center gap-1 w-full">
                            <button
                              onClick={() => {
                                setItemToMove(item);
                                setMoveStartTime(item.startTime);
                                setMoveDuration(item.durationMinutes);
                              }}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors text-center"
                              title="Move to a custom time"
                            >
                              Move
                            </button>

                            <button
                              onClick={() => setItemToRemove(item)}
                              className="py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-semibold transition-colors"
                              title="Remove from schedule (keeps task in My Actions)"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <Link
                            href={`/student/actions/${item.taskId}`}
                            className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 inline-flex items-center gap-1 mt-1"
                          >
                            <span>Open Details</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Buffer & Flexible Time End Block */}
              <div className="relative pl-10 sm:pl-14">
                <div className="absolute left-2 sm:left-4 top-3 w-4 h-4 rounded-full border-2 border-white bg-emerald-400 shadow-xs z-10" />
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-dashed border-emerald-300 text-emerald-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold">Flexible buffer & catch-up time</span>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        {todayPlan.remainingMinutes} minutes remaining in your scheduled evening window.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-white px-2 py-1 rounded-lg border border-emerald-200">
                    +{todayPlan.remainingMinutes}m Free
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-slate-200/90 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">You&apos;re all clear for today!</h3>
                <p className="text-xs text-slate-500">
                  New actions from your institution notices or personal tasks will be scheduled here.
                </p>
              </div>
              <Link
                href="/student/actions"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                <span>Browse My Actions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 6. VIEW 2: UPCOMING (NEXT 7 DAYS) */}
      {activeView === "upcoming" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Next 7 Days Action Plan</h2>
            <span className="text-xs font-semibold text-slate-500">
              Total planned: {scheduleResult.totalPlannedMinutes} mins
            </span>
          </div>

          <div className="space-y-6">
            {scheduleResult.dailyPlans.map((plan, dayIdx) => (
              <div
                key={plan.date}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900">{plan.dayName}</h3>
                    <span className="text-xs text-slate-400 font-mono">({plan.date})</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-600">
                      {plan.scheduledMinutes}m planned
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-600 font-medium">
                      {plan.remainingMinutes}m flexible
                    </span>
                  </div>
                </div>

                {plan.items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {plan.items.map((item) => {
                      const quadConfig = QUADRANT_CONFIG[item.quadrant] || QUADRANT_CONFIG.Q4;
                      const isCompleted = item.status === "COMPLETED";

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-2xl border bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all flex flex-col justify-between gap-3 ${
                            isCompleted ? "opacity-60 line-through" : ""
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${quadConfig.badgeBg} ${quadConfig.badgeText} ${quadConfig.badgeBorder}`}
                              >
                                {quadConfig.label}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                {item.startTime} — {item.endTime}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-slate-900">{item.taskTitle}</p>
                            {item.deadline && (
                              <p className="text-[11px] text-slate-500">Due: {item.deadline}</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-400 font-medium">
                              {item.durationMinutes} mins
                            </span>
                            <Link
                              href={`/student/actions/${item.taskId}`}
                              className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                            >
                              <span>View</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    No tasks scheduled. Full {plan.availableMinutes}m available for study or rest.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. VIEW 3: WEEK VIEW (MON - SUN GRID) */}
      {activeView === "week" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Weekly Schedule Grid</h2>
            <span className="text-xs text-slate-500 font-semibold">
              Monday through Sunday breakdown
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {scheduleResult.dailyPlans.map((plan) => (
              <div
                key={plan.date}
                className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between min-h-[320px] space-y-3"
              >
                <div>
                  <div className="border-b border-slate-100 pb-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                      {plan.dayName.split(",")[0]}
                    </span>
                    <p className="text-xs font-bold text-slate-900">{plan.date.slice(5)}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {plan.scheduledMinutes}m / {plan.availableMinutes}m
                    </p>
                  </div>

                  <div className="space-y-2">
                    {plan.items.map((item) => {
                      const quad = QUADRANT_CONFIG[item.quadrant] || QUADRANT_CONFIG.Q4;
                      return (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left space-y-1"
                        >
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${quad.dotColor}`} />
                            <span className="text-[10px] font-bold text-slate-600 truncate">
                              {item.startTime}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-tight">
                            {item.taskTitle}
                          </p>
                          <span className="text-[9px] text-slate-400 block font-mono">
                            {item.durationMinutes}m
                          </span>
                        </div>
                      );
                    })}

                    {plan.items.length === 0 && (
                      <p className="text-[11px] text-slate-300 italic text-center py-8">Free Day</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
                  {plan.remainingMinutes}m Flex
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. MOVE TIME SLOT MODAL */}
      {itemToMove && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Custom Time Slot</h3>
              <button
                onClick={() => setItemToMove(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Manually set when you want to work on: <strong>{itemToMove.taskTitle}</strong>. Your
              decision will be preserved during future plan regenerations.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Start Time (e.g. 19:30 or 7:30 PM)
                </label>
                <input
                  type="text"
                  value={moveStartTime}
                  onChange={(e) => setMoveStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="10"
                  max="240"
                  value={moveDuration}
                  onChange={(e) => setMoveDuration(parseInt(e.target.value, 10) || 30)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setItemToMove(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateScheduleItem(itemToMove.id, {
                    startTime: moveStartTime,
                    durationMinutes: moveDuration,
                    whyScheduledHere: `Student manually scheduled to ${moveStartTime}.`,
                  });
                  setItemToMove(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
              >
                Save Custom Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. REMOVE FROM SCHEDULE MODAL */}
      {itemToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Remove from Schedule?</h3>
                <p className="text-xs text-slate-500">
                  This action remains safe in <strong>My Actions</strong> and will only be removed from
                  your active calendar timeline.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700">
              {itemToRemove.taskTitle}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setItemToRemove(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeScheduleItem(itemToRemove.id);
                  setItemToRemove(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                Remove Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. FOCUS SESSION MODAL */}
      {selectedFocusItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-150">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
              <Timer className="w-4 h-4 text-indigo-600" />
              <span>Deep Focus Session</span>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">{selectedFocusItem.taskTitle}</h2>
              {selectedFocusItem.noticeTitle && (
                <p className="text-xs text-slate-500 mt-1">From: {selectedFocusItem.noticeTitle}</p>
              )}
            </div>

            {/* Stopwatch Visual */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-2">
              <span className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight">
                {formatTimer(focusSeconds)}
              </span>
              <p className="text-xs text-indigo-300 font-medium">
                Allocated: {selectedFocusItem.durationMinutes} minutes
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setFocusActive(!focusActive)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                {focusActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{focusActive ? "Pause" : "Resume"}</span>
              </button>

              <button
                onClick={() => {
                  setScheduleItemStatus(
                    selectedFocusItem.id,
                    selectedFocusItem.taskId,
                    "COMPLETED"
                  );
                  setSelectedFocusItem(null);
                  setFocusActive(false);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Mark Task Completed</span>
              </button>

              <button
                onClick={() => {
                  setSelectedFocusItem(null);
                  setFocusActive(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. UNSCHEDULED TASKS DRAWER */}
      {showUnscheduledDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full p-6 shadow-2xl flex flex-col justify-between space-y-6 animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Unscheduled Tasks</h3>
                  <p className="text-xs text-slate-500">
                    Tasks that could not fit within this week&apos;s available study hours.
                  </p>
                </div>
                <button
                  onClick={() => setShowUnscheduledDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {unscheduledTasks.map((item) => (
                  <div
                    key={item.task.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {item.task.finalQuadrant || item.task.quadrant}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {item.task.estimatedMinutes || 30} mins
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{item.task.title}</h4>
                    <p className="text-[11px] text-rose-600 font-medium">{item.reason}</p>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <Link
                        href={`/student/actions/${item.task.id}`}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Open Task
                      </Link>

                      <button
                        onClick={() => {
                          // Manually insert into today's schedule
                          updateScheduleItem(`sch_${item.task.id}_today_manual`, {
                            taskId: item.task.id,
                            taskTitle: item.task.title,
                            taskType: item.task.taskType,
                            quadrant: item.task.finalQuadrant || "Q4",
                            date: todayPlan?.date || new Date().toISOString().slice(0, 10),
                            startTime: "21:00",
                            endTime: "21:30",
                            durationMinutes: 30,
                            status: "PLANNED",
                            whyScheduledHere: "Student scheduled manually over study capacity.",
                          });
                          setShowUnscheduledDrawer(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px]"
                      >
                        Schedule Manually
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowUnscheduledDrawer(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading your smart schedule...</p>
        </div>
      }
    >
      <StudentScheduleContent />
    </Suspense>
  );
}
