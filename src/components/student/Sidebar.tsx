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
      label: "Inbox",
      href: "/student/inbox",
      icon: <Inbox className="w-4 h-4" />,
    },
    {
      label: "My Actions",
      href: "/student/actions",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      label: "Priority Matrix",
      href: "/student/priority",
      icon: <Target className="w-4 h-4" />,
      badge: "Q1–Q4",
    },
    {
      label: "Schedule",
      href: "/student/schedule",
      icon: <Calendar className="w-4 h-4" />,
      badge: "Smart",
    },
    {
      label: "Notifications",
      href: "/student/notifications",
      icon: <Bell className="w-4 h-4" />,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
    },
    {
      label: "Notices",
      href: "/student/notices",
      icon: <FileText className="w-4 h-4" />,
      comingSoon: true,
    },
    {
      label: "Insights",
      href: "/student/insights",
      icon: <BarChart2 className="w-4 h-4" />,
      comingSoon: true,
    },
    {
      label: "Profile",
      href: "/student/profile",
      icon: <User className="w-4 h-4" />,
      activeOnRoot: false,
    },
    {
      label: "Settings",
      href: "/student/settings",
      icon: <Settings className="w-4 h-4" />,
      activeOnRoot: false,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between h-full select-none">
      <div className="p-5 space-y-6">
        {/* Brand & Portal Header */}
        <div className="flex items-center justify-between">
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/20">
              N
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                NOTICE<span className="text-indigo-600">IQ</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Student Workspace
              </span>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Student Institution Pill */}
        <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-indigo-200/70 flex items-center justify-center text-sm shrink-0 shadow-xs">
            {currentStudent?.institutionType === "college" || currentStudent?.email ? "🎓" : "🏫"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {currentStudent?.institutionName || "Future Institute"}
            </p>
            <p className="text-[10px] font-medium text-indigo-600 truncate">
              {currentStudent?.department || currentStudent?.className || "Student"} • Sec {currentStudent?.section || "A"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-600"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                      isActive
                        ? "bg-indigo-700/80 text-white"
                        : "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.comingSoon && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isActive
                        ? "bg-indigo-700/60 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Bar */}
      <div className="p-4 border-t border-slate-200/90 bg-slate-50/50 space-y-3">
        <Link
          href="/student/profile"
          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-xs hover:border-indigo-300 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {currentStudent?.name ? currentStudent.name.charAt(0) : "S"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentStudent?.name || "Debendra Bera"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                Roll #{currentStudent?.rollNumber || "23"}
              </p>
            </div>
          </div>
        </Link>

        <div className="flex items-center justify-between px-1 text-xs">
          <Link
            href="/"
            className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
          >
            <span>NoticeIQ Home</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <Link
            href="/auth/student"
            onClick={logoutStudent}
            className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};
