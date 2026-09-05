"use client";

import React from "react";
import Link from "next/link";
import { useFacultyData } from "@/lib/facultyStore";
import { FacultyRoleSwitcher } from "./FacultyRoleSwitcher";
import {
  Menu,
  Bell,
  Plus,
  Calendar,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const FacultyHeader: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { unreadNotificationsCount } = useFacultyData();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left side: Mobile menu toggle + Date */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="hidden sm:inline">Saturday, September 5, 2026</span>
          <span className="sm:hidden">Sep 5, 2026</span>
        </div>
      </div>

      {/* Right side: Quick Action + Notification + Persona Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Create Notice Button */}
        <Link
          href="/faculty/notices/create"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Notice</span>
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/faculty/notifications"
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </Link>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Faculty / HOD Persona Switcher */}
        <FacultyRoleSwitcher />
      </div>
    </header>
  );
};
