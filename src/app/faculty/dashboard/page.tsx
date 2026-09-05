"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFacultyData } from "@/lib/facultyStore";
import {
  Calendar,
  Clock,
  MessageSquare,
  Megaphone,
  PlusCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Send,
  Award,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function FacultyDashboardPage() {
  const {
    currentFaculty,
    todaySchedule,
    upcomingClass,
    unreadMessagesCount,
    myMessages,
    notices,
    mySentNotices,
    isHOD,
    toggleMessageRead,
  } = useFacultyData();

  // Quick message modal state
  const [quickMessageSuccess, setQuickMessageSuccess] = useState<string | null>(null);

  // Active notices published recently
  const activeNotices = notices.filter((n) => n.status === "published").slice(0, 3);

  // Recent 3 communications
  const recentMessages = myMessages.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. GREETING & STATUS BANNER
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                  isHOD
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                }`}
              >
                {isHOD ? "HOD Dedicated Workspace" : "Faculty Workspace"}
              </span>
              <span className="text-slate-400 text-xs">
                {currentFaculty.institutionId === "inst-future-01"
                  ? "Future Institute of Engineering & Management"
                  : "Campus Portal"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good Morning, {currentFaculty.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-indigo-300">
                {currentFaculty.designation}
              </span>
              <span className="text-slate-500">•</span>
              <span>{currentFaculty.department}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">ID: {currentFaculty.facultyId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-white/5 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 w-fit shrink-0">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-medium text-slate-200">
              Saturday, September 5, 2026
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TODAY'S METRIC CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Classes Today */}
        <Link
          href="/faculty/schedule"
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Today's Schedule
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {todaySchedule.length}{" "}
            <span className="text-xs font-semibold text-slate-400">Classes</span>
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1 group-hover:underline flex items-center gap-1">
            <span>View day plan</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        {/* Unread Messages */}
        <Link
          href="/faculty/messages"
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Messages
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {unreadMessagesCount}{" "}
            <span className="text-xs font-semibold text-slate-400">Unread</span>
          </div>
          <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium mt-1 group-hover:underline flex items-center gap-1">
            <span>{isHOD ? "Dept messages" : "HOD & Faculty"}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        {/* Active Notices */}
        <Link
          href="/faculty/notices"
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Active Notices
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {activeNotices.length}{" "}
            <span className="text-xs font-semibold text-slate-400">Campus</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 group-hover:underline flex items-center gap-1">
            <span>Notice inbox</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        {/* Upcoming Class */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Next Up
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {upcomingClass?.startTime || "11:00 AM"}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {upcomingClass ? upcomingClass.subject : "No classes left"}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {upcomingClass
              ? `${upcomingClass.room} • ${upcomingClass.department} ${upcomingClass.year} (${upcomingClass.section})`
              : "All done for today"}
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. HOD COORDINATION PANEL (Conditional if HOD)
      ───────────────────────────────────────────────────────────── */}
      {isHOD && (
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/25 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                HOD Department Coordination Center
              </h2>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              CSE Department Head Privileges
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            As Head of Department, you can broadcast urgent instructions to all Computer Science faculty members and publish department-wide student circulars.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <Link
              href="/faculty/messages"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast to CSE Faculty</span>
            </Link>
            <Link
              href="/faculty/notices/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-500/30 text-amber-800 dark:text-amber-200 font-bold text-xs hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Create Department Notice</span>
            </Link>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. MAIN TWO-COLUMN SECTION: SCHEDULE + RECENT COMMUNICATIONS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Schedule + Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Today's Teaching Schedule
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {todaySchedule.length} lectures & labs scheduled for today
                </p>
              </div>
              <Link
                href="/faculty/schedule"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Full Schedule</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      item.isUpcoming
                        ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 ring-1 ring-indigo-500/20"
                        : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-center shrink-0 w-24 sm:w-28 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          {item.timeSlot}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          {item.classType}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.subject}
                          </span>
                          {item.isUpcoming && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-indigo-600 text-white shadow-2xs">
                              Next Class
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.department} • {item.year} • Section {item.section} &nbsp;·&nbsp;{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {item.room}
                          </span>
                        </p>
                        {item.topic && (
                          <p className="text-[11px] text-slate-400 italic mt-0.5">
                            Topic: {item.topic}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="text-[11px] font-semibold text-slate-500 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {item.classType} Session
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs">
                  No classes scheduled for today. You are all caught up!
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Faculty Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/faculty/notices/create"
                className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-500 flex items-center gap-3 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-indigo-600 transition-colors">
                    Create Notice
                  </span>
                  <span className="text-[10px] text-slate-500">
                    To assigned classes
                  </span>
                </div>
              </Link>

              <Link
                href="/faculty/messages"
                className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 hover:border-violet-500 flex items-center gap-3 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-violet-600 transition-colors">
                    Send Message
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Direct class update
                  </span>
                </div>
              </Link>

              <Link
                href="/faculty/schedule"
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-500 flex items-center gap-3 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 transition-colors">
                    Weekly Schedule
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Timetable & rooms
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Recent Communications + Important Notices */}
        <div className="space-y-6">
          {/* Recent Communications */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Recent Communications
              </h2>
              <Link
                href="/faculty/messages"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentMessages.length > 0 ? (
                recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      !msg.isRead && msg.senderId !== currentFaculty.id
                        ? "bg-amber-500/5 border-amber-500/30"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {msg.senderRole}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      {msg.title}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {msg.content}
                    </p>
                    <div className="flex items-center justify-between pt-1.5 text-[10px]">
                      <span className="text-slate-400">From: {msg.senderName}</span>
                      {!msg.isRead && msg.senderId !== currentFaculty.id && (
                        <button
                          type="button"
                          onClick={() => toggleMessageRead(msg.id, true)}
                          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No new messages. You are all caught up!
                </div>
              )}
            </div>
          </div>

          {/* Important Notices */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Important Campus Notices
              </h2>
              <Link
                href="/faculty/notices"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {activeNotices.map((n) => (
                <Link
                  key={n.id}
                  href="/faculty/notices"
                  className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 block transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      {n.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {n.publicationDate || n.date}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block line-clamp-1">
                    {n.title}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {n.content}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
