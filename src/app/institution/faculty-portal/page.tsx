"use client";

import React from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Users,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Sparkles,
  Eye,
  FileText,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";
import { useActiveRole } from "@/lib/roleStore";

export default function FacultyPortalPage() {
  const { notices, students } = useInstitutionData();
  const { facultyProfile } = useActiveRole();

  const dept = facultyProfile?.department ?? "CSE";
  const name = facultyProfile?.name ?? "Faculty";

  // Filter notices published by this faculty member (by email match)
  const myNotices = notices.filter(
    (n) =>
      n.createdBy === facultyProfile?.email ||
      // fallback for demo: show first 3 notices as "mine"
      notices.indexOf(n) < 3
  );

  // Dept students
  const deptStudents = students.filter(
    (s) => s.department === dept || s.department?.includes(dept)
  );

  const totalStudentsReached = deptStudents.length > 0 ? deptStudents.length : 126;

  const statCards = [
    {
      label: "My Notices Published",
      value: myNotices.length > 0 ? myNotices.length : 3,
      icon: <Megaphone className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50",
      change: "This semester",
    },
    {
      label: "Students Reached",
      value: totalStudentsReached,
      icon: <Users className="w-5 h-5 text-violet-600" />,
      bg: "bg-violet-50",
      change: `${dept} department`,
    },
    {
      label: "Actions Generated",
      value: myNotices.length * 48 || 144,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50",
      change: "From my notices",
    },
    {
      label: "Avg Completion Rate",
      value: "78%",
      icon: <TrendingUp className="w-5 h-5 text-sky-600" />,
      bg: "bg-sky-50",
      change: "On-time student tasks",
    },
  ];

  const recentMyNotices = myNotices.slice(0, 5);

  // Mock dept notices feed (department announcements not by me)
  const deptFeed = notices
    .filter((n) => n.createdBy !== facultyProfile?.email)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-violet-600" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              My Faculty Workspace
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            {name} &nbsp;·&nbsp; Department of {dept} &nbsp;·&nbsp;{" "}
            {facultyProfile?.roleTitle ?? "Faculty"}
          </p>
        </div>

        <Link
          href="/institution/notices/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Publish a Course Notice</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-2"
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              {s.icon}
            </div>
            <p className="text-2xl font-extrabold text-slate-900 leading-none">
              {s.value}
            </p>
            <div>
              <p className="text-xs font-semibold text-slate-700">{s.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Published Notices */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                My Published Notices
              </h2>
              <p className="text-[11px] text-slate-500">
                Notices you have authored and published
              </p>
            </div>
            <Link
              href="/institution/notices"
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentMyNotices.length > 0 ? (
              recentMyNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {notice.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {notice.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {notice.recipientsCount} students
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        notice.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {notice.status}
                    </span>
                    <Link
                      href={`/institution/notices/${notice.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">
                  No notices yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Publish your first course notice to see it here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Department Announcements Feed */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="px-5 pt-5 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Dept Announcements
            </h2>
            <p className="text-[11px] text-slate-500">
              Recent notices in {dept}
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {deptFeed.length > 0 ? (
              deptFeed.map((notice) => (
                <div key={notice.id} className="px-5 py-3 space-y-1">
                  <p className="text-[11px] font-bold text-slate-800 truncate">
                    {notice.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                      {notice.category}
                    </span>
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notice.publicationDate).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short" }
                      )}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400">No dept announcements</p>
              </div>
            )}
          </div>

          {/* Prompt card */}
          <div className="p-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[11px] font-bold text-indigo-700">
                  AI Notice Drafting
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                NoticeIQ AI automatically summarises your notices, extracts
                student tasks, and routes them with smart deadlines.
              </p>
              <Link
                href="/institution/notices/create"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Start writing <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Performance Strip */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              My Notice Performance
            </h2>
            <p className="text-[11px] text-slate-500">
              Aggregated stats from my published notices
            </p>
          </div>
          <Link
            href="/institution/analytics"
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <BarChart3 className="w-3.5 h-3.5" /> Full Analytics
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Avg Reach Rate", value: "91%", color: "text-emerald-600", subtext: "of targeted students" },
            { label: "Avg Relevance", value: "74%", color: "text-indigo-600", subtext: "found notices relevant" },
            { label: "Action Conversion", value: "68%", color: "text-violet-600", subtext: "students took action" },
            { label: "On-Time Rate", value: "82%", color: "text-sky-600", subtext: "tasks done before deadline" },
          ].map((m) => (
            <div key={m.label} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className={`text-xl font-extrabold ${m.color}`}>{m.value}</p>
              <p className="text-[11px] font-semibold text-slate-700 mt-1">{m.label}</p>
              <p className="text-[10px] text-slate-400">{m.subtext}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
