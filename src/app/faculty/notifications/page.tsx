"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFacultyData } from "@/lib/facultyStore";
import { FacultyNotification, FacultyNotificationPriority } from "@/types/faculty";
import {
  Bell,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Megaphone,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCheck,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function FacultyNotificationsPage() {
  const router = useRouter();
  const {
    myNotifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useFacultyData();

  const [activeCategory, setActiveCategory] = useState<
    "ALL" | "UNREAD" | "URGENT" | "MESSAGES" | "NOTICES" | "SCHEDULE"
  >("ALL");

  const filteredNotifications = useMemo(() => {
    return myNotifications.filter((n) => {
      if (activeCategory === "UNREAD" && n.readAt) return false;
      if (activeCategory === "URGENT" && n.priority !== "URGENT") return false;
      if (activeCategory === "MESSAGES" && n.type !== "MESSAGE") return false;
      if (activeCategory === "NOTICES" && n.type !== "NOTICE") return false;
      if (activeCategory === "SCHEDULE" && n.type !== "SCHEDULE") return false;
      return true;
    });
  }, [myNotifications, activeCategory]);

  const getPriorityBadge = (priority: FacultyNotificationPriority) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "IMPORTANT":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
      case "NORMAL":
        return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
      case "LOW":
        return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  const getTypeIcon = (type: FacultyNotification["type"]) => {
    switch (type) {
      case "MESSAGE":
        return <MessageSquare className="w-4 h-4 text-violet-500" />;
      case "SCHEDULE":
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case "NOTICE":
        return <Megaphone className="w-4 h-4 text-indigo-500" />;
      case "SYSTEM":
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
    }
  };

  const handleNotificationClick = (notif: FacultyNotification) => {
    if (!notif.readAt) {
      markNotificationRead(notif.notificationId);
    }
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Faculty Notification Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time schedule alerts, HOD communications, and official campus circulars with deduplication protection.
          </p>
        </div>

        {unreadNotificationsCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-fit"
          >
            <CheckCheck className="w-4 h-4 text-indigo-500" />
            <span>Mark All as Read ({unreadNotificationsCount})</span>
          </button>
        )}
      </div>

      {/* Collision Prevention Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-center justify-between text-indigo-950 dark:text-indigo-200">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong>Zero Collision Guarantee:</strong> Every notification uses deterministic keys to eliminate duplicate alert spam.
          </span>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
          Active
        </span>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: "ALL", label: "All Alerts" },
            { id: "UNREAD", label: `Unread (${unreadNotificationsCount})` },
            { id: "URGENT", label: "Urgent" },
            { id: "MESSAGES", label: "Messages" },
            { id: "NOTICES", label: "Notices" },
            { id: "SCHEDULE", label: "Schedule" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === tab.id
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => {
            const isRead = !!notif.readAt;
            return (
              <div
                key={notif.notificationId}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all ${
                  !isRead
                    ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 ring-1 ring-indigo-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {notif.title}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md border ${getPriorityBadge(
                          notif.priority
                        )}`}
                      >
                        {notif.priority}
                      </span>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5">
                      <span>Sender: {notif.senderName}</span>
                      <span>•</span>
                      <span>
                        {new Date(notif.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 flex items-center gap-2 justify-end">
                  {!isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(notif.notificationId);
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2.5 py-1"
                    >
                      Mark Read
                    </button>
                  )}
                  {notif.actionUrl && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              You're all caught up!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              No notifications currently match this filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
