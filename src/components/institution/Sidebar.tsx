"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  GraduationCap,
  Target,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
} from "lucide-react";
import { BrandWordmark } from "@/components/ui/BrandWordmark";
import { useInstitutionData } from "@/lib/institutionStore";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const { institution } = useInstitutionData();

  const navItems = [
    {
      label: "Dashboard",
      href: "/institution/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Notices",
      href: "/institution/notices",
      icon: <Megaphone className="w-4 h-4" />,
      badge: "42",
    },
    {
      label: "Students",
      href: "/institution/students",
      icon: <Users className="w-4 h-4" />,
      badge: "2.4k",
    },
    {
      label: "Faculty",
      href: "/institution/faculty",
      icon: <GraduationCap className="w-4 h-4" />,
      badge: "86",
    },
    {
      label: "Groups",
      href: "/institution/groups",
      icon: <Target className="w-4 h-4" />,
    },
    {
      label: "Analytics",
      href: "/institution/analytics",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "/institution/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between h-full select-none">
      <div className="p-5 space-y-6">
        {/* Brand & Workspace Header */}
        <div className="flex items-center justify-between">
          <Link href="/institution/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/20">
              N
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                NOTICE<span className="text-indigo-600">IQ</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                Admin Console
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

        {/* Institution Badge Pill */}
        <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-indigo-200/70 flex items-center justify-center text-sm shrink-0 shadow-xs">
            {institution?.type === "college" ? "🏛️" : "🏫"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {institution?.name || "Future Institute"}
            </p>
            <p className="text-[10px] font-medium text-indigo-600 capitalize flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {institution?.type || "college"} • Active
            </p>
          </div>
        </div>

        {/* Main Navigation List */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Workspace Navigation
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/institution/dashboard" && pathname.startsWith(item.href));
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
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-indigo-700/60 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Account Area */}
      <div className="p-4 border-t border-slate-200/90 bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {institution?.adminName || "Administrator"}
              </p>
              <p className="text-[10px] text-slate-600 truncate">
                {institution?.adminEmail || "admin@futurecollege.ac.in"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-xs">
          <Link
            href="/"
            className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link
            href="/auth/institution"
            className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};
