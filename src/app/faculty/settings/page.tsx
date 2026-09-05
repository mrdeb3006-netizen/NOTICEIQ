"use client";

import React, { useState } from "react";
import { useFacultyData } from "@/lib/facultyStore";
import {
  Settings,
  Bell,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Volume2,
  Moon,
  Save,
} from "lucide-react";

export default function FacultySettingsPage() {
  const { currentFaculty } = useFacultyData();

  const [leadTime, setLeadTime] = useState("15");
  const [hodAlerts, setHodAlerts] = useState(true);
  const [scheduleReminders, setScheduleReminders] = useState(true);
  const [studentQueries, setStudentQueries] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Faculty Workspace Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure notification alerts, schedule lead times, and communication delivery channels.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Faculty settings successfully saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Schedule Alerts */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Schedule & Class Reminders
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Upcoming Class Alerts
                </span>
                <span className="text-slate-500">
                  Receive a desktop alert before your scheduled lecture or laboratory begins.
                </span>
              </div>
              <input
                type="checkbox"
                checked={scheduleReminders}
                onChange={(e) => setScheduleReminders(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Reminder Lead Time
              </label>
              <select
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="10">10 minutes before class</option>
                <option value="15">15 minutes before class (Default)</option>
                <option value="30">30 minutes before class</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Communication Channels */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Communication & Circular Alerts
            </h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Priority HOD Announcements
                </span>
                <span className="text-slate-500">
                  High-priority broadcast notifications from the Head of Department.
                </span>
              </div>
              <input
                type="checkbox"
                checked={hodAlerts}
                onChange={(e) => setHodAlerts(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Class Acknowledgment Reports
                </span>
                <span className="text-slate-500">
                  Summary notifications when over 80% of students acknowledge a dispatched assignment.
                </span>
              </div>
              <input
                type="checkbox"
                checked={studentQueries}
                onChange={(e) => setStudentQueries(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Security Summary */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Institutional Security & SSO
            </h2>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Your faculty session is cryptographically bound to{" "}
            <strong className="text-slate-700 dark:text-slate-300">{currentFaculty.email}</strong>. Department authorization is granted by Future Institute of Engineering and Management under Supabase RLS security policies.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
