"use client";

import React from "react";
import { useFacultyData } from "@/lib/facultyStore";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Award,
  ShieldCheck,
  Calendar,
  Lock,
  CheckCircle2,
} from "lucide-react";

export default function FacultyProfilePage() {
  const { currentFaculty, isHOD } = useFacultyData();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Faculty Profile & Academic Credentials
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Official institutional profile, assigned courses, and department authorizations.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {/* Profile Summary Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              {currentFaculty.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {currentFaculty.name}
                </h2>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    isHOD
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                      : "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30"
                  }`}
                >
                  {currentFaculty.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {currentFaculty.designation}
                </span>{" "}
                • {currentFaculty.department}
              </p>
              <span className="text-[11px] text-slate-400">
                Official Faculty ID: <strong className="text-slate-700 dark:text-slate-300">{currentFaculty.facultyId}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span>Campus Admin Verified</span>
          </div>
        </div>

        {/* Institution-Controlled Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Institution-controlled parameters (Designation, Faculty ID, Department, and Assigned Sections) are managed by Campus Administration and cannot be freely modified.
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Institution Name
            </span>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              Future Institute of Engineering and Management
            </span>
            <span className="text-slate-500">Affiliated to MAKAUT • NAAC Accredited</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Department
            </span>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              {currentFaculty.department}
            </span>
            <span className="text-slate-500">Academic Block A</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Official Email
            </span>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              {currentFaculty.email}
            </span>
            <span className="text-slate-500">Domain-verified Google Workspace Account</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Office Location
            </span>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              {currentFaculty.officeRoom || "Academic Block A, Room 208"}
            </span>
            <span className="text-slate-500">Office Hours: 4:30 PM – 5:30 PM</span>
          </div>
        </div>

        {/* Assigned Subjects */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Assigned Teaching Subjects
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentFaculty.subjects.map((sub, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Classes & Sections */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Authorized Classes & Student Cohorts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentFaculty.assignedSections.map((sec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {sec.department} • {sec.year} • Section {sec.section}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Subject: {sec.subject}
                  </span>
                </div>
                {sec.studentCount && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {sec.studentCount} Students
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
