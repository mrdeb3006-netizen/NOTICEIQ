"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  FileText,
  ShieldAlert,
  Trash2,
  Sliders,
  Check,
  ArrowRight,
  ExternalLink,
  Flame,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";
import {
  StudentNotification,
  NotificationPriority,
  NotificationType,
} from "@/types/student";
import { formatRelativeTime } from "@/lib/notifications/reminderEngine";

function NotificationsContent() {
  const {
    currentStudent,
    isLoaded,
    getStudentNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useStudentAuth();

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "important">("all");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const allNotifications = useMemo(() => {
    return getStudentNotifications();
  }, [getStudentNotifications, currentStudent]);

  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => !n.isRead).length;
  }, [allNotifications]);

  const importantCount = useMemo(() => {
    return allNotifications.filter((n) => n.priority === "HIGH").length;
  }, [allNotifications]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((notif) => {
      // Tab filter
      if (activeTab === "unread" && notif.isRead) return false;
      if (activeTab === "important" && notif.priority !== "HIGH") return false;

      // Type filter
      if (selectedType !== "ALL") {
        if (selectedType === "DEADLINES" && notif.type !== "DEADLINE_APPROACHING" && notif.type !== "TASK_DUE_SOON" && notif.type !== "TASK_OVERDUE") {
          return false;
        }
        if (selectedType === "SCHEDULE" && notif.type !== "SCHEDULED_TASK" && notif.type !== "SCHEDULE_CONFLICT" && notif.type !== "PLAN_UPDATED") {
          return false;
        }
        if (selectedType === "NOTICES" && notif.type !== "NOTICE_RECEIVED" && notif.type !== "NOTICE_UPDATED") {
          return false;
        }
        if (selectedType === "DEPENDENCIES" && notif.type !== "DEPENDENCY_BLOCKED") {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = notif.title.toLowerCase().includes(query);
        const matchMsg = notif.message.toLowerCase().includes(query);
        if (!matchTitle && !matchMsg) return false;
      }

      return true;
    });
  }, [allNotifications, activeTab, selectedType, searchQuery]);

  if (!isLoaded) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading your notifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold">
            <Bell className="w-3.5 h-3.5 text-indigo-600" />
            <span>Smart Reminder Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Smart alerts, deadline countdowns, and schedule reminders.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllNotificationsAsRead()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors border border-indigo-200/60"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}

          <Link
            href="/student/settings/notifications"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Preferences</span>
          </Link>
        </div>
      </div>

      {/* 2. Tabs & Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Main Tabs */}
        <div className="flex items-center gap-2 border-b sm:border-b-0 border-slate-200 pb-2 sm:pb-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
              {allNotifications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("unread")}
            className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === "unread"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("important")}
            className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === "important"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Important</span>
            {importantCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                {importantCount}
              </span>
            )}
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="DEADLINES">Deadlines & Overdue</option>
            <option value="SCHEDULE">Schedule Reminders</option>
            <option value="NOTICES">Notices</option>
            <option value="DEPENDENCIES">Prerequisites & Blocked</option>
          </select>
        </div>
      </div>

      {/* 3. Notification List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => {
            const isHigh = notif.priority === "HIGH";
            const isMed = notif.priority === "MEDIUM";

            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !notif.isRead
                    ? "bg-white border-indigo-200 ring-2 ring-indigo-50/70"
                    : "bg-slate-50/70 border-slate-200 opacity-85"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Icon Indicator */}
                  <div
                    className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center mt-0.5 ${
                      notif.type === "TASK_OVERDUE"
                        ? "bg-rose-100 text-rose-700"
                        : notif.type === "DEADLINE_APPROACHING"
                        ? "bg-amber-100 text-amber-800"
                        : notif.type === "SCHEDULED_TASK"
                        ? "bg-indigo-100 text-indigo-700"
                        : notif.type === "DEPENDENCY_BLOCKED"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : notif.type === "NOTICE_RECEIVED" || notif.type === "NOTICE_UPDATED"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {notif.type === "TASK_OVERDUE" ? (
                      <AlertOctagon className="w-5 h-5 text-rose-600" />
                    ) : notif.type === "DEADLINE_APPROACHING" ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : notif.type === "SCHEDULED_TASK" ? (
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    ) : notif.type === "DEPENDENCY_BLOCKED" ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ) : notif.type === "NOTICE_RECEIVED" || notif.type === "NOTICE_UPDATED" ? (
                      <FileText className="w-5 h-5 text-sky-600" />
                    ) : (
                      <Bell className="w-5 h-5 text-slate-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider ${
                          isHigh
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : isMed
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {notif.priority}
                      </span>

                      {notif.badgeLabel && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                          {notif.badgeLabel}
                        </span>
                      )}

                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      )}

                      <span className="text-[11px] text-slate-400 font-medium ml-auto sm:ml-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-extrabold text-slate-900 leading-snug ${
                        !notif.isRead ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {notif.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Link
                    href={notif.actionUrl}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <span>
                      {notif.type.includes("SCHEDULE")
                        ? "View Schedule"
                        : notif.type.includes("NOTICE")
                        ? "View Notice"
                        : "View Task"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-1">
                    {!notif.isRead && (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-3xl bg-white border border-slate-200/90 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">You&apos;re all caught up!</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Important updates, upcoming deadlines, and schedule reminders will appear here.
              </p>
            </div>
            <Link
              href="/student/actions"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
            >
              <span>Explore My Actions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentNotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading notifications...</p>
        </div>
      }
    >
      <NotificationsContent />
    </Suspense>
  );
}
