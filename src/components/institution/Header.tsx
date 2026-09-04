"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Menu,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  User,
  Shield,
  X,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  title = "Good Morning, Admin 👋",
  subtitle = "Manage your institution's information and student communication.",
}) => {
  const { institution } = useInstitutionData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Scholarship Notice Delivered",
      time: "10m ago",
      desc: "486 CSE 1st year students received automated action items.",
      unread: true,
      type: "success",
    },
    {
      id: "n2",
      title: "New Student SSO Sync",
      time: "1h ago",
      desc: "12 new accounts verified via @futurecollege.ac.in",
      unread: true,
      type: "info",
    },
    {
      id: "n3",
      title: "Upcoming Exam Circular Due",
      time: "1d ago",
      desc: "Reminder to schedule end-semester registration circular.",
      unread: false,
      type: "reminder",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & Page Headings */}
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
              {title}
            </h1>
            <p className="text-xs text-slate-600 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick Action, Notifications & Admin Avatar */}
        <div className="flex items-center gap-3">
          {/* Quick Notice CTA button */}
          <Link
            href="/institution/notices/create"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Notice</span>
          </Link>

          {/* Notifications Dropdown Container */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          n.unread
                            ? "bg-indigo-50/40 border-indigo-100"
                            : "bg-slate-50/50 border-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-slate-600 text-[10px]">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{n.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 text-center">
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-slate-600 hover:text-slate-700 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Admin Avatar Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {institution?.adminName ? institution.adminName.charAt(0) : "A"}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-900 leading-none truncate max-w-[130px]">
                {institution?.adminName || "Admin"}
              </span>
              <span className="text-[10px] font-medium text-slate-600">
                Workspace Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
