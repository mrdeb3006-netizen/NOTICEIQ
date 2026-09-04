"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Settings, Bell, Lock, ShieldCheck, CheckCircle2, Save, User } from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";

export default function StudentSettingsPage() {
  const { currentStudent } = useStudentAuth();
  const [notifyNotices, setNotifyNotices] = useState(true);
  const [notifyDaily, setNotifyDaily] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
          Account & Notification Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage how NoticeIQ notifies you about urgent circulars and upcoming tasks.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Notification settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        {/* Notifications */}
        <div className="space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Alerts & Reminders
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyNotices}
                onChange={(e) => setNotifyNotices(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <strong className="block text-xs text-slate-900">New circular broadcast alerts</strong>
                <span className="text-[11px] text-slate-500">
                  Notify me immediately when high-priority academic or scholarship circulars match my profile.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyDaily}
                onChange={(e) => setNotifyDaily(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <strong className="block text-xs text-slate-900">Daily morning action digest</strong>
                <span className="text-[11px] text-slate-500">
                  Receive a concise summary of today&apos;s urgent deadlines and planned study blocks.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Institutional Credentials status */}
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
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
