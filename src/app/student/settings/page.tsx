"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Settings, Bell, Lock, ShieldCheck, CheckCircle2, Save, User } from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";

export default function StudentSettingsPage() {
  const {
    currentStudent,
    getStudentNotificationPreferences,
    updateStudentNotificationPreferences,
    updateStudentPreferences,
  } = useStudentAuth();

  const [prefs, setPrefs] = useState(() => getStudentNotificationPreferences());
  const [prefStartTime, setPrefStartTime] = useState(currentStudent?.preferredStartTime || "18:00");
  const [prefEndTime, setPrefEndTime] = useState(currentStudent?.preferredEndTime || "22:00");
  const [availableDailyHours, setAvailableDailyHours] = useState(
    currentStudent?.availableDailyHours || "2 hours"
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentNotificationPreferences(prefs);
    if (currentStudent) {
      updateStudentPreferences({
        interests: currentStudent.interests || [],
        preferredStartTime: prefStartTime,
        preferredEndTime: prefEndTime,
        availableDailyHours: availableDailyHours,
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Account & Notification Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your study schedule, quiet hours, and smart reminder preferences.
          </p>
        </div>

        <Link
          href="/student/settings/notifications"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200/60"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Detailed Notifications →</span>
        </Link>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Preferences saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        {/* 1. Study Schedule Preferences */}
        <div className="space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Daily Study Availability
              </h3>
            </div>
            <span className="text-[11px] font-bold text-indigo-600">Adaptive Planning</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Preferred Start
              </label>
              <input
                type="text"
                value={prefStartTime}
                onChange={(e) => setPrefStartTime(e.target.value)}
                placeholder="18:00 or 6 PM"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Preferred End
              </label>
              <input
                type="text"
                value={prefEndTime}
                onChange={(e) => setPrefEndTime(e.target.value)}
                placeholder="22:00 or 10 PM"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Daily Available Time
              </label>
              <input
                type="text"
                value={availableDailyHours}
                onChange={(e) => setAvailableDailyHours(e.target.value)}
                placeholder="2 hours"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Notifications Quick Toggles */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Smart Reminder Channels
              </h3>
            </div>
            <Link
              href="/student/settings/notifications"
              className="text-[11px] font-bold text-indigo-600 hover:underline"
            >
              Quiet Hours & Advanced →
            </Link>
          </div>

          <div className="space-y-3">
            <label className="flex items-start justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
              <div>
                <strong className="block text-xs text-slate-900">Deadline countdown reminders</strong>
                <span className="text-[11px] text-slate-500">
                  Receive alerts at 7d, 3d, 1d, and day-of for approaching action deadlines.
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.deadlineReminders}
                onChange={() =>
                  setPrefs((prev) => ({ ...prev, deadlineReminders: !prev.deadlineReminders }))
                }
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-start justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
              <div>
                <strong className="block text-xs text-slate-900">Scheduled task start alerts</strong>
                <span className="text-[11px] text-slate-500">
                  Get notified 15 minutes before your planned study time block.
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.scheduledTaskReminders}
                onChange={() =>
                  setPrefs((prev) => ({
                    ...prev,
                    scheduledTaskReminders: !prev.scheduledTaskReminders,
                  }))
                }
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-start justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
              <div>
                <strong className="block text-xs text-slate-900">Notice updates & broadcasts</strong>
                <span className="text-[11px] text-slate-500">
                  Notify when newly published circulars apply to you or details change.
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.noticeUpdates}
                onChange={() =>
                  setPrefs((prev) => ({ ...prev, noticeUpdates: !prev.noticeUpdates }))
                }
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-start justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
              <div>
                <strong className="block text-xs text-slate-900">Prerequisite & dependency alerts</strong>
                <span className="text-[11px] text-slate-500">
                  Notify when an important action is blocked by an unfinished prerequisite document.
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.dependencyAlerts}
                onChange={() =>
                  setPrefs((prev) => ({ ...prev, dependencyAlerts: !prev.dependencyAlerts }))
                }
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* 3. Campus Sync Status */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase">Campus Sync Status</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified by {currentStudent?.institutionName || "Institution"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">{currentStudent?.name}</span>
              <span className="text-[11px] text-slate-500">
                {currentStudent?.email || currentStudent?.studentId} • Roll #{currentStudent?.rollNumber}
              </span>
            </div>
            <Link
              href="/student/profile"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              View Full Profile →
            </Link>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
