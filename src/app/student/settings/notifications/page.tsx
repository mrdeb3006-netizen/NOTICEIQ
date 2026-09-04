"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Clock,
  CheckCircle2,
  Save,
  ArrowLeft,
  Moon,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  FileText,
  Flame,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";
import { StudentNotificationPreferences } from "@/types/student";

export default function StudentNotificationSettingsPage() {
  const {
    currentStudent,
    getStudentNotificationPreferences,
    updateStudentNotificationPreferences,
  } = useStudentAuth();

  const [prefs, setPrefs] = useState<StudentNotificationPreferences>(() => {
    return getStudentNotificationPreferences();
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(getStudentNotificationPreferences());
  }, [getStudentNotificationPreferences, currentStudent]);

  const handleToggle = (key: keyof StudentNotificationPreferences) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentNotificationPreferences(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            href="/student/settings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Settings</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Notification Preferences
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Customize which reminders you receive and configure your quiet hours.
          </p>
        </div>

        <Link
          href="/student/notifications"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notification Center</span>
        </Link>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">Preferences saved successfully! Future reminders will adapt automatically.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Category Toggles */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Reminder Channels & Triggers
            </h3>
          </div>

          <div className="space-y-3">
            {/* Deadline Reminders */}
            <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer transition-all">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block text-xs font-bold text-slate-900">
                    Deadline Reminders
                  </strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block">
                    Receive smart countdown reminders at 7 days, 3 days, 1 day, and same-day for upcoming tasks.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.deadlineReminders}
                onChange={() => handleToggle("deadlineReminders")}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-1"
              />
            </label>

            {/* Scheduled Task Reminders */}
            <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer transition-all">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block text-xs font-bold text-slate-900">
                    Scheduled Task Alerts
                  </strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block">
                    Get starting soon reminders 15 minutes before your planned study time block.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.scheduledTaskReminders}
                onChange={() => handleToggle("scheduledTaskReminders")}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-1"
              />
            </label>

            {/* Notice Updates */}
            <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer transition-all">
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block text-xs font-bold text-slate-900">
                    Notice Updates & New Broadcasts
                  </strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block">
                    Alert me when newly published circulars apply to my profile or existing notice details change.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.noticeUpdates}
                onChange={() => handleToggle("noticeUpdates")}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-1"
              />
            </label>

            {/* Dependency Alerts */}
            <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer transition-all">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block text-xs font-bold text-slate-900">
                    Dependency & Prerequisite Alerts
                  </strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block">
                    Notify when an important action is blocked by an unfinished prerequisite document or certificate.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.dependencyAlerts}
                onChange={() => handleToggle("dependencyAlerts")}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-1"
              />
            </label>

            {/* Important Alerts */}
            <label className="flex items-start justify-between p-4 rounded-2xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer transition-all">
              <div className="flex items-start gap-3">
                <Flame className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block text-xs font-bold text-slate-900">
                    High Priority & Overdue Escalations
                  </strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block">
                    Ensure Q1 DO FIRST tasks and overdue actions always appear prominently at the top of your feed.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.importantAlerts}
                onChange={() => handleToggle("importantAlerts")}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-1"
              />
            </label>
          </div>
        </div>

        {/* 2. Quiet Hours */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Quiet Hours
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Night Silence</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            During quiet hours, routine reminders will be suppressed so you can sleep or rest peacefully.
            Critical overdue notices will remain accessible in your Notification Center.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Quiet Hours Start Time
              </label>
              <input
                type="text"
                value={prefs.quietHoursStart}
                onChange={(e) =>
                  setPrefs((prev) => ({ ...prev, quietHoursStart: e.target.value }))
                }
                placeholder="22:00 or 10:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Quiet Hours End Time
              </label>
              <input
                type="text"
                value={prefs.quietHoursEnd}
                onChange={(e) =>
                  setPrefs((prev) => ({ ...prev, quietHoursEnd: e.target.value }))
                }
                placeholder="07:00 or 7:00 AM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/student/settings"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
