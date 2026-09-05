"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useFacultyData } from "@/lib/facultyStore";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  Megaphone,
  PlusCircle,
  Bell,
  Send,
  User,
  Settings,
  LogOut,
  X,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Award,
} from "lucide-react";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const FacultySidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentFaculty, unreadMessagesCount, unreadNotificationsCount } = useFacultyData();

  const navItems = [
    {
      label: "Dashboard",
      href: "/faculty/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "My Schedule",
      href: "/faculty/schedule",
      icon: <CalendarDays className="w-4 h-4" />,
      badge: "Today",
    },
    {
      label: "Messages",
      href: "/faculty/messages",
      icon: <MessageSquare className="w-4 h-4" />,
      count: unreadMessagesCount,
    },
    {
      label: "Notices",
      href: "/faculty/notices",
      icon: <Megaphone className="w-4 h-4" />,
    },
    {
      label: "Create Notice",
      href: "/faculty/notices/create",
      icon: <PlusCircle className="w-4 h-4 text-emerald-500" />,
      highlight: true,
    },
    {
      label: "Notifications",
      href: "/faculty/notifications",
      icon: <Bell className="w-4 h-4" />,
      count: unreadNotificationsCount,
    },
    {
      label: "My Sent Notices",
      href: "/faculty/sent",
      icon: <Send className="w-4 h-4" />,
    },
    {
      label: "Profile",
      href: "/faculty/profile",
      icon: <User className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "/faculty/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleLogout = () => {
    router.push("/faculty/login");
  };

  return (
    <aside className="h-full flex flex-col justify-between bg-slate-900 border-r border-slate-800 text-slate-300 select-none">
      {/* Top Section */}
      <div>
        {/* Portal Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          <Link
            href="/faculty/dashboard"
            className="flex items-center gap-2.5 focus:outline-none"
            onClick={onCloseMobile}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/25">
              IQ
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  NOTICE<span className="text-indigo-400">IQ</span>
                </span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Faculty
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                Academic Portal
              </span>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Current Role Banner */}
        <div className="mx-3 mt-3.5 mb-2 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                currentFaculty.role === "HOD"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-indigo-500/20 text-indigo-400"
              }`}
            >
              {currentFaculty.role === "HOD" ? (
                <Award className="w-3.5 h-3.5" />
              ) : (
                <BookOpen className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white block truncate">
                {currentFaculty.name}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {currentFaculty.designation}
              </span>
            </div>
          </div>
          <span
            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
              currentFaculty.role === "HOD"
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                : "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30"
            }`}
          >
            {currentFaculty.role}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : item.highlight
                    ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-indigo-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === "number" && item.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                      {item.count}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Section with User Card & Logout */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">
              {currentFaculty.department}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              ID: {currentFaculty.facultyId}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Logout of Faculty Portal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="px-2 pt-1 flex items-center justify-between text-[10px] text-slate-500">
          <span>NoticeIQ Core v2.4</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </span>
        </div>
      </div>
    </aside>
  );
};
