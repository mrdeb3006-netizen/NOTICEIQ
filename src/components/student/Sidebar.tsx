"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Zap,
  Target,
  Calendar,
  Bell,
  FileText,
  BarChart2,
  User,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const StudentSidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const { currentStudent, logoutStudent, getUnreadNotificationCount } = useStudentAuth();
  const unreadCount = getUnreadNotificationCount();

  const navItems = [
    {
      label: "Overview",
      href: "/student/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      activeOnRoot: true,
    },
    {
      label: "Notices",
      href: "/student/notices",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "My Work",
      href: "/student/work",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      label: "Schedule",
      href: "/student/schedule",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      label: "Insights",
      href: "/student/insights",
      icon: <BarChart2 className="w-4 h-4" />,
    },
    {
      label: "Profile",
      href: "/student/profile",
      icon: <User className="w-4 h-4" />,
      activeOnRoot: false,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between h-full select-none text-slate-300">
      <div className="p-5 space-y-6">
        {/* Brand & Portal Header */}
        <div className="flex items-center justify-between">
          <Link href="/student/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/25 ring-1 ring-white/10">
              N
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight text-white leading-tight">
                NOTICE<span className="text-indigo-400">IQ</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Student Workspace
              </span>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Student Institution Pill (Dark) */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-sm shrink-0 shadow-xs">
            {currentStudent?.institutionType === "college" || currentStudent?.email ? "🎓" : "🏫"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {currentStudent?.institutionName || "Future Institute"}
            </p>
            <p className="text-[10px] font-semibold text-indigo-400 truncate">
              {currentStudent?.department || currentStudent?.className || "Student"} • Sec {currentStudent?.section || "A"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            Workspace Menu
          </div>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/student/priority" && pathname === "/student/matrix");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Bar (Dark) */}
      <div className="p-4 border-t border-slate-850/80 bg-slate-900/50 space-y-3">
        <Link
          href="/student/profile"
          className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xs hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-1 ring-white/10">
              {currentStudent?.name ? currentStudent.name.charAt(0) : "S"}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate">
                {currentStudent?.name || "Debendra Bera"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Roll #{currentStudent?.rollNumber || "23"}
              </p>
            </div>
          </div>
        </Link>

        <div className="flex items-center justify-between px-1 text-xs">
          <Link
            href="/"
            className="text-[11px] font-semibold text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            <span>NoticeIQ Home</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <Link
            href="/auth/student"
            onClick={logoutStudent}
            className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};
