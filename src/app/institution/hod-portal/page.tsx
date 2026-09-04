"use client";

import React from "react";
import Link from "next/link";
import {
  Crown,
  Users,
  Megaphone,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  ArrowRight,
  AlertTriangle,
  GraduationCap,
  FileText,
  Star,
  Clock,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";
import { useActiveRole } from "@/lib/roleStore";
import { initialFaculty } from "@/lib/mockData";

export default function HODPortalPage() {
  const { notices, students, faculty } = useInstitutionData();
  const { facultyProfile } = useActiveRole();

  const dept = facultyProfile?.department ?? "CSE";
  const name = facultyProfile?.name ?? "Department HOD";

  // Filter to dept scope
  const deptStudents = students.filter(
    (s) => s.department === dept || s.department?.includes(dept)
  );
  const deptFaculty = faculty.filter((f) => f.department === dept);
  const deptNotices = notices.filter(
    (n) => n.targetDepartment === dept || n.targetType === "all"
  );

  const studentsCount = deptStudents.length > 0 ? deptStudents.length : 312;
  const facultyCount = deptFaculty.length > 0 ? deptFaculty.length : 8;
  const noticesCount = deptNotices.length > 0 ? deptNotices.length : notices.length;

  // Health score (deterministic, 0-100)
  const completionRate = 76;
  const reachRate = 88;
  const onTimeRate = 81;
  const healthScore = Math.round(
    completionRate * 0.4 + reachRate * 0.35 + onTimeRate * 0.25
  );

  const getHealthColor = (score: number) => {
    if (score >= 80) return { bg: "from-emerald-500 to-green-400", text: "text-emerald-600", label: "Excellent" };
    if (score >= 65) return { bg: "from-sky-500 to-blue-400", text: "text-sky-600", label: "Good" };
    if (score >= 50) return { bg: "from-amber-500 to-yellow-400", text: "text-amber-600", label: "Needs Attention" };
    return { bg: "from-rose-500 to-red-400", text: "text-rose-600", label: "Critical" };
  };
  const health = getHealthColor(healthScore);

  // Faculty activity board: enrich with mock notice counts
  const deptFacultyDisplay = (deptFaculty.length > 0 ? deptFaculty : initialFaculty.filter((f) => f.department === dept)).map(
    (f, i) => ({
      ...f,
      noticesPublished: [3, 1, 2, 0][i % 4],
      studentsReached: [126, 64, 88, 0][i % 4],
      completionRate: [81, 72, 67, 0][i % 4],
    })
  );

  // Top performing notices
  const topNotices = [...deptNotices]
    .slice(0, 4)
    .map((n, i) => ({
      ...n,
      actionabilityScore: [92, 85, 78, 71][i],
    }));

  // Draft / pending notices
  const draftNotices = notices.filter((n) => n.status === "draft").slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              HOD Department Overview
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            {name} &nbsp;·&nbsp; Department of {dept} &nbsp;·&nbsp; Head of Department
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/institution/analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Dept Analytics
          </Link>
          <Link
            href="/institution/notices/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02]"
          >
            <Megaphone className="w-4 h-4" />
            <span>Send Dept Notice</span>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Dept Students", value: studentsCount, icon: <Users className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-50", sub: `${dept} enrolled` },
          { label: "Faculty Members", value: facultyCount, icon: <GraduationCap className="w-5 h-5 text-violet-600" />, bg: "bg-violet-50", sub: "Active this semester" },
          { label: "Dept Notices", value: noticesCount, icon: <Megaphone className="w-5 h-5 text-sky-600" />, bg: "bg-sky-50", sub: "Published this term" },
          { label: "Completion Rate", value: `${completionRate}%`, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50", sub: "Student task completion" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-2">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>{s.icon}</div>
            <p className="text-2xl font-extrabold text-slate-900 leading-none">{s.value}</p>
            <div>
              <p className="text-xs font-semibold text-slate-700">{s.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Health Score + Faculty Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Department Health Score */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 flex flex-col items-center text-center space-y-4">
          <h2 className="text-sm font-bold text-slate-900 self-start">Department Health Score</h2>
          <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${health.bg} flex flex-col items-center justify-center text-white shadow-lg`}>
            <span className="text-3xl font-black leading-none">{healthScore}</span>
            <span className="text-xs font-bold opacity-80">/ 100</span>
          </div>
          <div className={`text-sm font-bold ${health.text}`}>{health.label}</div>
          <div className="w-full space-y-2">
            {[
              { label: "Completion Rate", value: completionRate },
              { label: "Reach Rate", value: reachRate },
              { label: "On-Time Rate", value: onTimeRate },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">{m.label}</span>
                  <span className="font-bold text-slate-800">{m.value}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    style={{ width: `${m.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link href="/institution/analytics" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            Full Analytics <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Faculty Activity Board */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Faculty Activity Board</h2>
              <p className="text-[11px] text-slate-500">Notices published & student engagement per faculty</p>
            </div>
            <Link href="/institution/faculty" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {deptFacultyDisplay.length > 0 ? (
              deptFacultyDisplay.map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 to-violet-400 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {f.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{f.name}</p>
                    <p className="text-[10px] text-slate-500">{f.role}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-center">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{f.noticesPublished}</p>
                      <p className="text-[9px] text-slate-400">Notices</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{f.studentsReached}</p>
                      <p className="text-[9px] text-slate-400">Reached</p>
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${f.completionRate >= 75 ? "text-emerald-600" : f.completionRate >= 50 ? "text-amber-600" : "text-slate-400"}`}>
                        {f.completionRate > 0 ? `${f.completionRate}%` : "–"}
                      </p>
                      <p className="text-[9px] text-slate-400">Completion</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No faculty members in this department yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Drafts + Top Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Draft / Pending Notices */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Draft Notices</h2>
              <p className="text-[11px] text-slate-500">Awaiting publish or approval</p>
            </div>
            <Link href="/institution/notices" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {draftNotices.length > 0 ? (
              draftNotices.map((n) => (
                <div key={n.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                    <p className="text-[10px] text-slate-500">{n.category}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200 shrink-0">
                    Draft
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <AlertTriangle className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No drafts pending</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Notices */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top Notices</h2>
              <p className="text-[11px] text-slate-500">By NoticeIQ Actionability Score</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {topNotices.length > 0 ? (
              topNotices.map((n, i) => (
                <div key={n.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    i === 0 ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                    <p className="text-[10px] text-slate-500">{n.category}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="text-xs font-bold text-slate-800">{n.actionabilityScore}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <FileText className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No published notices yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
