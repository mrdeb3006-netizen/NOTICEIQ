"use client";

import React, { useState } from "react";
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
  ExternalLink,
  X,
  Shield,
  BookOpen,
  Crown,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";
import { useActiveRole, type InstitutionRole } from "@/lib/roleStore";
import { DEMO_ROLE_PROFILES } from "@/lib/mockData";

interface SidebarProps {
  onCloseMobile?: () => void;
}

// ─── Role Meta ──────────────────────────────────────────────
const ROLE_META: Record<
  InstitutionRole,
  { label: string; colorClass: string; icon: React.ReactNode }
> = {
  admin: {
    label: "Institution Admin",
    colorClass: "text-indigo-600 bg-indigo-50 border-indigo-200",
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  hod: {
    label: "Head of Department",
    colorClass: "text-amber-700 bg-amber-50 border-amber-200",
    icon: <Crown className="w-3.5 h-3.5" />,
  },
  faculty: {
    label: "Faculty",
    colorClass: "text-violet-700 bg-violet-50 border-violet-200",
    icon: <BookOpen className="w-3.5 h-3.5" />,
  },
};

// ─── Nav Items per role ──────────────────────────────────────
const ALL_NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/institution/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    roles: ["admin", "faculty", "hod"] as InstitutionRole[],
  },
  {
    key: "notices",
    label: "Notices",
    href: "/institution/notices",
    icon: <Megaphone className="w-4 h-4" />,
    badge: "notices",
    roles: ["admin", "faculty", "hod"] as InstitutionRole[],
    subItem: {
      label: "+ Create Notice",
      href: "/institution/notices/create",
    },
  },
  {
    key: "my-workspace",
    label: "My Workspace",
    href: "/institution/faculty-portal",
    icon: <Briefcase className="w-4 h-4" />,
    roles: ["faculty"] as InstitutionRole[],
  },
  {
    key: "dept-overview",
    label: "Dept Overview",
    href: "/institution/hod-portal",
    icon: <Briefcase className="w-4 h-4" />,
    roles: ["hod"] as InstitutionRole[],
  },
  {
    key: "students",
    label: "Students",
    href: "/institution/students",
    icon: <Users className="w-4 h-4" />,
    badge: "students",
    roles: ["admin", "hod"] as InstitutionRole[],
  },
  {
    key: "faculty",
    label: "Faculty",
    href: "/institution/faculty",
    icon: <GraduationCap className="w-4 h-4" />,
    badge: "faculty",
    roles: ["admin", "hod"] as InstitutionRole[],
  },
  {
    key: "groups",
    label: "Groups",
    href: "/institution/groups",
    icon: <Target className="w-4 h-4" />,
    roles: ["admin"] as InstitutionRole[],
  },
  {
    key: "analytics",
    label: "Analytics",
    href: "/institution/analytics",
    icon: <BarChart3 className="w-4 h-4" />,
    roles: ["admin", "faculty", "hod"] as InstitutionRole[],
  },
  {
    key: "settings",
    label: "Settings",
    href: "/institution/settings",
    icon: <Settings className="w-4 h-4" />,
    roles: ["admin", "faculty", "hod"] as InstitutionRole[],
  },
];

// ─── Role Switcher demo options ──────────────────────────────
const DEMO_ROLES: {
  role: InstitutionRole;
  name: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  {
    role: "admin",
    name: "Dr. Alok Verma",
    sub: "Institution Admin",
    color: "indigo",
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  {
    role: "hod",
    name: "Dr. Ananya Sen",
    sub: "HOD • CSE",
    color: "amber",
    icon: <Crown className="w-3.5 h-3.5" />,
  },
  {
    role: "faculty",
    name: "Prof. Sourav Das",
    sub: "Faculty • CSE",
    color: "violet",
    icon: <BookOpen className="w-3.5 h-3.5" />,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const { institution, students, faculty, notices } = useInstitutionData();
  const { role, facultyProfile, setRole } = useActiveRole();
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const roleMeta = ROLE_META[role];

  const badges: Record<string, string> = {
    notices:
      notices.length > 3 ? notices.length.toLocaleString() : "42",
    students:
      students.length > 8 ? students.length.toLocaleString() : "2.4k",
    faculty:
      faculty.length > 5 ? faculty.length.toLocaleString() : "86",
  };

  const visibleNav = ALL_NAV_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  const displayName =
    role === "admin"
      ? institution?.adminName || "Administrator"
      : facultyProfile?.name || "Staff Member";

  const displayEmail =
    role === "admin"
      ? institution?.adminEmail || "admin@futurecollege.ac.in"
      : facultyProfile?.email || "faculty@futurecollege.ac.in";

  const displayInitials =
    displayName
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD";

  const handleRoleSwitch = (newRole: InstitutionRole) => {
    if (newRole === "admin") {
      setRole("admin");
    } else if (newRole === "hod") {
      setRole("hod", DEMO_ROLE_PROFILES.hod);
    } else {
      setRole("faculty", DEMO_ROLE_PROFILES.faculty);
    }
    setRoleSwitcherOpen(false);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between h-full select-none">
      <div className="p-5 space-y-5 flex-1 overflow-y-auto">
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
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {role === "admin"
                  ? "Admin Console"
                  : role === "hod"
                  ? "HOD Portal"
                  : "Faculty Portal"}
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

        {/* Active Role Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${roleMeta.colorClass}`}
        >
          {roleMeta.icon}
          <div className="min-w-0 flex-1">
            <p className="font-bold leading-none truncate">{roleMeta.label}</p>
            {facultyProfile?.department && (
              <p className="text-[10px] font-medium mt-0.5 opacity-75 truncate">
                Dept: {facultyProfile.department}
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Navigation
          </div>
          {visibleNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/institution/dashboard" &&
                pathname.startsWith(item.href) &&
                !pathname.includes("notices/create"));
            const isCreateActive =
              pathname === "/institution/notices/create";
            const badgeValue = item.badge ? badges[item.badge] : null;

            return (
              <div key={item.key} className="space-y-0.5">
                <Link
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
                        isActive
                          ? "text-white"
                          : "text-slate-500 group-hover:text-indigo-600"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {badgeValue && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-indigo-700/60 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                      }`}
                    >
                      {badgeValue}
                    </span>
                  )}
                </Link>

                {/* Create Notice sub-item */}
                {item.subItem && (
                  <Link
                    href={item.subItem.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-1.5 ml-7 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      isCreateActive
                        ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60"
                        : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {item.subItem.label}
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-100/70 text-indigo-700 font-semibold">
                      New
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Role Switcher / Logout */}
      <div className="p-4 border-t border-slate-200/90 bg-slate-50/50 space-y-3 shrink-0">
        {/* Role Switcher (Demo) */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Switch Role (Demo)
            </span>
            {roleSwitcherOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {roleSwitcherOpen && (
            <div className="border-t border-slate-100 p-2 space-y-1">
              {DEMO_ROLES.map((dr) => (
                <button
                  key={dr.role}
                  onClick={() => handleRoleSwitch(dr.role)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all text-xs ${
                    role === dr.role
                      ? "bg-indigo-50 border border-indigo-200 text-indigo-700"
                      : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      dr.color === "indigo"
                        ? "bg-indigo-100 text-indigo-600"
                        : dr.color === "amber"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-violet-100 text-violet-600"
                    }`}
                  >
                    {dr.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">{dr.name}</p>
                    <p className="text-[10px] opacity-70">{dr.sub}</p>
                  </div>
                  {role === dr.role && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Profile */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {displayInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {displayEmail}
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
