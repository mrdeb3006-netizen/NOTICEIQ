"use client";

import React from "react";
import Link from "next/link";
import {
  Inbox,
  Zap,
  Target,
  Calendar,
  Sparkles,
  Building,
  GraduationCap,
  School,
  ArrowRight,
  Clock,
  ShieldCheck,
  User,
  CheckCircle2,
  Megaphone,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";

export default function StudentDashboardPage() {
  const { currentStudent, getStudentNotices } = useStudentAuth();
  const matchedNotices = getStudentNotices();

  const isCollege = currentStudent?.institutionType === "college" || !!currentStudent?.email;

  const dashboardCards = [
    {
      title: "Notices & Circulars",
      icon: <Inbox className="w-6 h-6 text-indigo-600" />,
      bgIcon: "bg-indigo-50",
      description: "Official notices and academic circulars stream.",
      subtext: "Filtered specifically for your batch & department.",
      status: "Live Active",
      href: "/student/notices",
    },
    {
      title: "My Actions",
      icon: <Zap className="w-6 h-6 text-violet-600" />,
      bgIcon: "bg-violet-50",
      description: "Your personalized actions will appear here.",
      subtext: "Extracted step-by-step tasks and deadlines.",
      status: "Coming in Step 5",
      href: "/student/actions",
    },
    {
      title: "Priority Matrix",
      icon: <Target className="w-6 h-6 text-sky-600" />,
      bgIcon: "bg-sky-50",
      description: "Your priorities will appear here.",
      subtext: "Categorized by Urgent & Important Eisenhower matrix.",
      status: "Coming in Step 5",
      href: "/student/matrix",
    },
    {
      title: "Schedule",
      icon: <Calendar className="w-6 h-6 text-emerald-600" />,
      bgIcon: "bg-emerald-50",
      description: "Your schedule will appear here.",
      subtext: `Adaptive daily timetable based on your ${currentStudent?.preferredStartTime || "6 PM"} – ${currentStudent?.preferredEndTime || "10 PM"} preference.`,
      status: "Coming in Step 6",
      href: "/student/schedule",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-indigo-900 via-indigo-800 to-violet-950 text-white shadow-xl shadow-indigo-900/15 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/15">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Student Workspace</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome, {currentStudent?.name || "Student"} 👋
          </h2>

          <div className="flex items-center gap-2 text-xs text-indigo-200 flex-wrap">
            <span className="font-semibold text-white">
              {currentStudent?.institutionName || "Future Institute of Engineering and Management"}
            </span>
            <span>•</span>
            <span>
              {isCollege
                ? `${currentStudent?.department || "CSE"} • ${currentStudent?.year || "1st Year"} • Section ${currentStudent?.section || "A"}`
                : `${currentStudent?.className || "Class 10"} • Section ${currentStudent?.section || "B"}`}
            </span>
            <span>•</span>
            <span className="font-mono">Roll #{currentStudent?.rollNumber || "23"}</span>
          </div>
        </div>
      </section>

      {/* Matching Notices for You Section (Step 4 Live Feed) */}
      <section className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <span>Official Circulars for You</span>
            </h3>
            <p className="text-xs text-slate-500">
              Notices targeted to {isCollege ? `${currentStudent?.department} • ${currentStudent?.year} • Section ${currentStudent?.section}` : `${currentStudent?.className} • Section ${currentStudent?.section}`}.
            </p>
          </div>

          <Link
            href="/student/inbox"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
          >
            <span>View All in Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {matchedNotices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedNotices.slice(0, 2).map((notice) => (
              <div
                key={notice.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {notice.category}
                    </span>
                    {!notice.isRead && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        New
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {notice.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  {notice.deadline ? (
                    <span className="flex items-center gap-1 font-semibold text-amber-800 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{notice.deadline}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">No deadline</span>
                  )}

                  <Link
                    href="/student/inbox"
                    className="text-indigo-600 font-bold text-xs flex items-center gap-1 hover:underline"
                  >
                    <span>Open in Inbox</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 text-center text-xs text-slate-500">
            No notices currently published for your cohort.
          </div>
        )}
      </section>

      {/* 4 Main Placeholder Sections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Student Workflows & Priorities
          </h3>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            Autonomous Student Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {dashboardCards.map((card, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 text-left group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${card.bgIcon} transition-transform group-hover:scale-105`}>
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                    {card.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs font-medium text-slate-700 mt-1">
                    {card.description}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {card.subtext}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Auto-extracted for you</span>
                <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Student Focus & Preferences Summary */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Personal Preferences
            </h3>
            <p className="text-xs text-slate-500">
              Your customized study schedule and academic focus areas.
            </p>
          </div>

          <Link
            href="/student/profile"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Edit Preferences →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Focus Areas</span>
            <div className="flex flex-wrap gap-1 pt-1">
              {currentStudent?.interests && currentStudent.interests.length > 0 ? (
                currentStudent.interests.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No focus areas set</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Study Hours</span>
            <p className="text-xs font-bold text-slate-800">
              {currentStudent?.preferredStartTime && currentStudent?.preferredEndTime
                ? `${currentStudent.preferredStartTime} – ${currentStudent.preferredEndTime}`
                : "6 PM – 10 PM"}
            </p>
            <span className="text-[10px] text-slate-400">Peak concentration block</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Allocation</span>
            <p className="text-xs font-bold text-slate-800">
              {currentStudent?.availableDailyHours || "2 hours / day"}
            </p>
            <span className="text-[10px] text-slate-400">Available execution window</span>
          </div>
        </div>
      </section>
    </div>
  );
}
