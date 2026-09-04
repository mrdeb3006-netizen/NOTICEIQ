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
  const { currentStudent } = useStudentAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const studentName = currentStudent?.name?.split(" ")[0] || "Student";
  const displayTitle = title || `Welcome, ${studentName} 👋`;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile menu button + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70 shadow-xs transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              {displayTitle}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Notifications & Student Avatar */}
        <div className="flex items-center gap-3">
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
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95">
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
            <div className="hidden sm:block text-left">
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
