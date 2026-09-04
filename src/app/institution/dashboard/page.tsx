"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Megaphone,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Calendar,
  Eye,
  Edit2,
  MoreVertical,
  Plus,
  ExternalLink,
  ShieldCheck,
  Building,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";

export default function InstitutionDashboardPage() {
  const { institution, students, faculty, notices } = useInstitutionData();
  const [selectedNotice, setSelectedNotice] = useState<null | {
    title: string;
    targetGroup: string;
    deadline?: string;
    date: string;
    status: string;
    recipientsCount: number;
    content: string;
    category?: string;
  }>(null);

  const stats = [
    {
      title: "Students",
      value: students.length > 8 ? students.length.toLocaleString() : "2,430",
      change: "12 new this month",
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      bgIcon: "bg-indigo-50",
      accent: "text-indigo-600",
      helper: "Active enrolled directory",
    },
    {
      title: "Faculty",
      value: faculty.length > 5 ? faculty.length.toLocaleString() : "86",
      change: "Across 6 departments",
      icon: <GraduationCap className="w-5 h-5 text-violet-600" />,
      bgIcon: "bg-violet-50",
      accent: "text-violet-600",
      helper: "Authorized publishers",
    },
    {
      title: "Notices Published",
      value: notices.length > 3 ? notices.length.toLocaleString() : "42",
      change: "3 active this week",
      icon: <Megaphone className="w-5 h-5 text-sky-600" />,
      bgIcon: "bg-sky-50",
      accent: "text-sky-600",
      helper: "AI action routing live",
    },
    {
      title: "Actions Generated",
      value: "1,284",
      change: "94% on-time completion",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bgIcon: "bg-emerald-50",
      accent: "text-emerald-600",
      helper: "Student priority tasks",
    },
  ];

  const quickActions = [
    {
      title: "Publish Notice",
      description: "Create and send a notice to students.",
      icon: <Megaphone className="w-5 h-5 text-indigo-600" />,
      href: "/institution/notices/create",
      cta: "Create Notice",
      color: "border-indigo-200/80 hover:border-indigo-400 bg-white",
    },
    {
      title: "Manage Students",
      description: "Add or manage student accounts.",
      icon: <Users className="w-5 h-5 text-violet-600" />,
      href: "/institution/students",
      cta: "View Directory",
      color: "border-violet-200/80 hover:border-violet-400 bg-white",
    },
    {
      title: "Manage Faculty",
      description: "Manage faculty members and permissions.",
      icon: <GraduationCap className="w-5 h-5 text-sky-600" />,
      href: "/institution/faculty",
      cta: "View Faculty",
      color: "border-sky-200/80 hover:border-sky-400 bg-white",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Overview Statistics
          </h2>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            Demo Analytics Data
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl ${stat.bgIcon} transition-transform group-hover:scale-105`}>
                  {stat.icon}
                </div>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-semibold text-slate-600">
                    {stat.change}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                {stat.helper}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={`p-6 rounded-2xl border ${action.color} shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group`}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  {action.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-xs font-bold text-indigo-600 gap-1 pt-2 border-t border-slate-100 group-hover:translate-x-0.5 transition-transform">
                <span>{action.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Notices */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Notices
            </h2>
            <p className="text-xs text-slate-500">
              Active campus circulars and delivery status.
            </p>
          </div>

          <Link
            href="/institution/notices"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            View all notices →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {notice.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase">
                    {notice.status}
                  </span>
                  {notice.category && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                      {notice.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  <span>Target: <strong className="text-slate-700 font-semibold">{notice.targetGroup}</strong></span>
                  <span>•</span>
                  <span>Recipients: <strong className="text-slate-700 font-semibold">{notice.recipientsCount.toLocaleString()} students</strong></span>
                  {notice.deadline && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Deadline: {notice.deadline}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedNotice(notice)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>

                <Link
                  href="/institution/notices/create"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Empty State / Highlight Callout Card (UX requirement 13) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-indigo-900 via-indigo-800 to-violet-900 text-white shadow-xl shadow-indigo-900/10 relative overflow-hidden">
        {/* Specular highlights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI Notice Transformer</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Ready to connect your students?
          </h3>

          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-normal">
            Publish your first notice and NoticeIQ will transform it into personalized student actions, automatic deadline reminders, and adaptive daily priority feeds.
          </p>

          <div className="pt-2">
            <Link
              href="/institution/notices/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-lg transition-transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>+ Publish First Notice</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Notice Details Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-600 uppercase">
                  {selectedNotice.category || "Notice Details"}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedNotice.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
              {selectedNotice.content}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target Group</span>
                <strong className="text-slate-900">{selectedNotice.targetGroup}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Recipients</span>
                <strong className="text-slate-900">{selectedNotice.recipientsCount.toLocaleString()} Students</strong>
              </div>
            </div>

            {selectedNotice.deadline && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Action Deadline: <strong>{selectedNotice.deadline}</strong></span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
