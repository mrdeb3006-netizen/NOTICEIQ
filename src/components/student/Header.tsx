"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Menu,
  Sparkles,
  User,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
  subtitle?: string;
}

export const StudentHeader: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  title,
  subtitle = "Your personalized priority feed and action schedule.",
}) => {
  const { currentStudent, allStudents, switchStudentPersona } = useStudentAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const studentName = currentStudent?.name?.split(" ")[0] || "Student";
  const displayTitle = title || `Welcome, ${studentName} 👋`;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile menu button + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70 shadow-xs transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2 truncate">
              {displayTitle}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Persona Switcher & Notifications & Student Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Persona Switcher Dropdown (Step 6 Test Rig) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="Switch demo student to test different relevance scenarios"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="hidden md:inline text-[11px] uppercase tracking-wider text-indigo-700">Persona:</span>
              <span className="truncate max-w-[110px] sm:max-w-[140px] text-xs">
                {currentStudent?.name || "Student"}
              </span>
              <span className="text-[10px] font-mono text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                {currentStudent?.department ? (currentStudent.department.includes("CSE") || currentStudent.department.includes("Computer") ? "CSE" : "ECE") : "SCH"}
              </span>
            </button>

            {showPersonaMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPersonaMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 text-left">
                  <div className="px-2 py-1 border-b border-slate-100">
                    <span className="font-extrabold text-[11px] text-slate-900 uppercase tracking-wider block">
                      🧪 Test Student Personas
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Switch persona to test relevance engine responses
                    </span>
                  </div>

                  <div className="space-y-1">
                    {allStudents.map((stu) => {
                      const isSelected = stu.id === currentStudent?.id;
                      const deptShort = stu.department
                        ? stu.department.includes("Computer") || stu.department.includes("CSE")
                          ? "CSE"
                          : "ECE"
                        : stu.className || "School";

                      return (
                        <button
                          key={stu.id}
                          type="button"
                          onClick={() => {
                            switchStudentPersona(stu.id);
                            setShowPersonaMenu(false);
                          }}
                          className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? "bg-indigo-600 text-white font-bold shadow-xs"
                              : "hover:bg-slate-50 text-slate-700 font-medium"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-xs truncate">{stu.name}</p>
                            <p
                              className={`text-[10px] truncate ${
                                isSelected ? "text-indigo-200" : "text-slate-400"
                              }`}
                            >
                              {deptShort} • {stu.year || "Class"} • Sec {stu.section}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-bold">
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-900">Student Alerts</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-bold">
                      2 updates
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-left">
                      <span className="font-bold text-slate-900 block text-xs">Scholarship Application</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">Deadline approaching in 6 days for 1st Year CSE.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-left">
                      <span className="font-bold text-slate-900 block text-xs">Coding Club Orientation</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">Registration is open for Hackathon 2026.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Student Avatar */}
          <Link
            href="/student/profile"
            className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {currentStudent?.name ? currentStudent.name.charAt(0) : "S"}
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
                {currentStudent?.name || "Student"}
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                Sec {currentStudent?.section || "A"} • Roll {currentStudent?.rollNumber || "23"}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
