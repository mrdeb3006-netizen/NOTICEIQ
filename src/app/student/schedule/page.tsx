"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  Check,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";
import { ScheduleItem } from "@/types/student";

export default function StudentSchedulePage() {
  const {
    currentStudent,
    isLoaded,
    getStudentSchedule,
    setScheduleItemStatus,
    taskVersion,
  } = useStudentAuth();

  const [activeTab, setActiveTab] = useState<"today" | "week" | "month">("today");

  const scheduleResult = useMemo(() => {
    return getStudentSchedule(30);
  }, [getStudentSchedule, currentStudent, taskVersion]);

  const todayPlan = scheduleResult.dailyPlans[0] || null;
  const weekPlans = scheduleResult.dailyPlans.slice(0, 7);
  const monthPlans = scheduleResult.dailyPlans.slice(0, 30);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  if (!isLoaded) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading your schedule...</p>
      </div>
    );
  }

  const renderScheduleItemList = (items: ScheduleItem[]) => {
    if (!items || items.length === 0) {
      return (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1">
          <p className="text-sm font-semibold text-slate-800">No scheduled tasks</p>
          <p className="text-xs text-slate-400">You are all clear for this time.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item) => {
          const isCompleted = item.status === "COMPLETED";

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl bg-white border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isCompleted
                  ? "border-slate-200 bg-slate-50/60 opacity-60"
                  : "border-slate-200/90 hover:border-indigo-300 shadow-xs"
              }`}
            >
              {/* Left: Time & Title */}
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    {item.startTime} — {item.endTime}
                  </span>

                  {item.deadline && (
                    <span className="text-amber-800 text-[11px] font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Due: {item.deadline}
                    </span>
                  )}
                </div>

                <h3
                  className={`text-sm font-bold text-slate-900 ${
                    isCompleted ? "line-through text-slate-400" : ""
                  }`}
                >
                  {item.taskTitle}
                </h3>

                {item.whyScheduledHere && !isCompleted && (
                  <p className="text-xs text-slate-500 font-normal">
                    {item.whyScheduledHere}
                  </p>
                )}
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setScheduleItemStatus(
                      item.id,
                      item.taskId,
                      isCompleted ? "PLANNED" : "COMPLETED"
                    )
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isCompleted
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isCompleted ? "Completed" : "Mark done"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            When to work on your tasks, aligned with your available hours.
          </p>
        </div>

        <Link
          href="/student/profile"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
          <span>Study Preferences</span>
        </Link>
      </div>

      {/* Tabs: Today | Week | Month */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("today")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "today"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Today
        </button>

        <button
          onClick={() => setActiveTab("week")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "week"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Week
        </button>

        <button
          onClick={() => setActiveTab("month")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "month"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Month
        </button>
      </div>

      {/* VIEW: TODAY */}
      {activeTab === "today" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              {todayFormatted}
            </h2>
            <span className="text-xs text-slate-400">
              {todayPlan?.items?.length || 0} scheduled
            </span>
          </div>

          {renderScheduleItemList(todayPlan?.items || [])}
        </div>
      )}

      {/* VIEW: WEEK */}
      {activeTab === "week" && (
        <div className="space-y-6">
          {weekPlans.map((plan) => (
            <div key={plan.date} className="space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">
                  {new Date(plan.date + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-[11px] text-slate-400">
                  {plan.items.length} tasks
                </span>
              </div>

              {renderScheduleItemList(plan.items)}
            </div>
          ))}
        </div>
      )}

      {/* VIEW: MONTH */}
      {activeTab === "month" && (
        <div className="space-y-6">
          {monthPlans
            .filter((p) => p.items.length > 0)
            .map((plan) => (
              <div key={plan.date} className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">
                    {new Date(plan.date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {plan.items.length} tasks
                  </span>
                </div>

                {renderScheduleItemList(plan.items)}
              </div>
            ))}
          {monthPlans.filter((p) => p.items.length > 0).length === 0 && (
            <div className="p-12 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1">
              <p className="text-sm font-semibold text-slate-800">No tasks scheduled this month</p>
              <p className="text-xs text-slate-400">All planned tasks have been completed.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
