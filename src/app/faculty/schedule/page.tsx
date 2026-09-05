"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFacultyData } from "@/lib/facultyStore";
import { FacultyScheduleItem, ClassType } from "@/types/faculty";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Plus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  Filter,
} from "lucide-react";

export default function FacultySchedulePage() {
  const { currentFaculty, mySchedule, todaySchedule } = useFacultyData();
  const [viewMode, setViewMode] = useState<"TODAY" | "TOMORROW" | "WEEK">("TODAY");

  // Tomorrow schedule (Monday for demo)
  const tomorrowSchedule = mySchedule.filter(
    (s) => s.dayOfWeek === "Monday" || s.date === "2026-09-07"
  );

  // Weekly schedule
  const displayedSchedule =
    viewMode === "TODAY"
      ? todaySchedule
      : viewMode === "TOMORROW"
      ? tomorrowSchedule
      : mySchedule;

  const upcomingClass = todaySchedule.find((s) => s.isUpcoming) || todaySchedule[0];

  const getClassTypeColor = (type: ClassType) => {
    switch (type) {
      case "Lab":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/40";
      case "Lecture":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300/40";
      case "Tutorial":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/40";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Teaching Schedule
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {currentFaculty.name} • {currentFaculty.department} • Academic Year 2026–27
          </p>
        </div>

        {/* View Switcher: Today / Tomorrow / This Week */}
        <div className="p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800 flex items-center gap-1 w-fit">
          <button
            type="button"
            onClick={() => setViewMode("TODAY")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "TODAY"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Today (Saturday)
          </button>
          <button
            type="button"
            onClick={() => setViewMode("TOMORROW")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "TOMORROW"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Next Day (Monday)
          </button>
          <button
            type="button"
            onClick={() => setViewMode("WEEK")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "WEEK"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Upcoming Class Highlight Banner (if in TODAY mode) */}
      {viewMode === "TODAY" && upcomingClass && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/90 to-slate-900 border border-indigo-500/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-indigo-950/30">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500 text-white shadow-2xs">
                  Next Upcoming Class
                </span>
                <span className="text-xs text-indigo-200 font-semibold">
                  Starts at {upcomingClass.startTime}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold mt-1">
                {upcomingClass.subject}
              </h2>
              <p className="text-xs text-indigo-200/90 flex items-center gap-2 mt-0.5">
                <span>{upcomingClass.room}</span>
                <span>•</span>
                <span>{upcomingClass.department} • {upcomingClass.year} • Section {upcomingClass.section}</span>
                <span>•</span>
                <span className="italic">{upcomingClass.topic}</span>
              </p>
            </div>
          </div>

          <Link
            href="/faculty/messages"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all w-fit shrink-0"
          >
            Message this class
          </Link>
        </div>
      )}

      {/* Classes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {viewMode === "TODAY"
              ? "Classes Scheduled Today"
              : viewMode === "TOMORROW"
              ? "Classes Scheduled for Next Session"
              : "All Classes Scheduled for Current Week"}
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {displayedSchedule.length} session{displayedSchedule.length !== 1 ? "s" : ""}
          </span>
        </div>

        {displayedSchedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedSchedule.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-xs ${
                  item.isUpcoming && viewMode === "TODAY"
                    ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* Card Header: Time & Class Type */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {item.timeSlot}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {viewMode === "WEEK" && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {item.dayOfWeek}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getClassTypeColor(
                        item.classType
                      )}`}
                    >
                      {item.classType}
                    </span>
                  </div>
                </div>

                {/* Subject & Details */}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
                  {item.subject}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {item.department} • {item.year} • Section {item.section}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.room}
                    </span>
                  </div>
                </div>

                {/* Topic / Unit */}
                {item.topic && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-700 dark:text-slate-300">Topic:</strong> {item.topic}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No classes scheduled
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You do not have any teaching sessions scheduled for this period.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
