"use client";

import React, { useState } from "react";
import {
  Settings,
  Building,
  ShieldCheck,
  Mail,
  Bell,
  Lock,
  CheckCircle2,
  Save,
  Globe,
  MapPin,
  Sparkles,
  School,
  GraduationCap,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";

export default function InstitutionSettingsPage() {
  const { institution, updateInstitution } = useInstitutionData();

  const [activeTab, setActiveTab] = useState<"profile" | "access" | "faculty" | "notifications" | "security">("profile");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form State
  const [name, setName] = useState(institution?.name || "Future Institute of Engineering and Management");
  const [type, setType] = useState(institution?.type || "college");
  const [location, setLocation] = useState(institution?.location || "Kolkata, West Bengal");
  const [website, setWebsite] = useState(institution?.website || "https://futurecollege.ac.in");

  // Student Access State
  const [emailDomain, setEmailDomain] = useState(institution?.emailDomain || "@futurecollege.ac.in");
  const [studentIdPrefix, setStudentIdPrefix] = useState(institution?.studentIdPrefix || "SCH2026");

  // Faculty State
  const [allowFacultyNoticeCreation, setAllowFacultyNoticeCreation] = useState(true);
  const [requireHODApproval, setRequireHODApproval] = useState(false);

  // Notification State
  const [emailBroadcasts, setEmailBroadcasts] = useState(true);
  const [dailyAdminDigest, setDailyAdminDigest] = useState(true);

  // Security State
  const [adminName, setAdminName] = useState(institution?.adminName || "Dr. Alok Verma");
  const [adminEmail, setAdminEmail] = useState(institution?.adminEmail || "admin@futurecollege.ac.in");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    updateInstitution({
      name,
      type: type as "school" | "college",
      location,
      website,
      emailDomain: type === "college" ? emailDomain : undefined,
      studentIdPrefix: type === "school" ? studentIdPrefix : undefined,
      adminName,
      adminEmail,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const isCollege = type === "college";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
          Institution Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure campus profile, student access rules, and administrative security.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Workspace settings updated and saved successfully!</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full lg:w-56 space-y-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
              activeTab === "profile"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Institution Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("access")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
              activeTab === "access"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Student Access</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("faculty")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
              activeTab === "faculty"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Faculty Access</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
              activeTab === "notifications"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
              activeTab === "security"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security</span>
          </button>
        </div>

        {/* Content Pane */}
        <div className="flex-1">
          <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-left">
            {/* 1. Profile Section */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Institution Profile
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Basic information visible across student and faculty circulars.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Institution Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as "college" | "school")}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none"
                    >
                      <option value="college">College / University</option>
                      <option value="school">School / K-12</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Official Website
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* 2. Student Access Section */}
            {activeTab === "access" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Student Access & Verification Rules
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    How students authenticate and join this NoticeIQ workspace.
                  </p>
                </div>

                {isCollege ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        Registered Email Domain
                      </label>
                      <input
                        type="text"
                        value={emailDomain}
                        onChange={(e) => setEmailDomain(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-indigo-500"
                      />
                      <p className="text-[11px] text-slate-500">
                        Only emails ending with this domain are eligible for instant student login.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Student authentication mode: <strong>Email OTP verification active</strong>.</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        Student ID Prefix
                      </label>
                      <input
                        type="text"
                        value={studentIdPrefix}
                        onChange={(e) => setStudentIdPrefix(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase text-slate-900 outline-none focus:border-indigo-500"
                      />
                      <p className="text-[11px] text-slate-500">
                        Roll ID generator uses this prefix for school students.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Student authentication mode: <strong>School Student ID + initial password active</strong>.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Faculty Access Section */}
            {activeTab === "faculty" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Faculty Permissions & Circular Publishing
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define what academic staff can broadcast to student cohorts.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowFacultyNoticeCreation}
                      onChange={(e) => setAllowFacultyNoticeCreation(e.target.checked)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <strong className="block text-xs text-slate-900">Allow direct notice publishing</strong>
                      <span className="text-[11px] text-slate-500">
                        Verified faculty can broadcast circulars directly to their departmental classes.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireHODApproval}
                      onChange={(e) => setRequireHODApproval(e.target.checked)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <strong className="block text-xs text-slate-900">Require HOD approval for campus-wide notices</strong>
                      <span className="text-[11px] text-slate-500">
                        Notices targeting &apos;All Students&apos; require administrative or Head of Department sign-off.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* 4. Notifications Section */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Notification & Broadcast Preferences
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage digest alerts and emergency campus announcements.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailBroadcasts}
                      onChange={(e) => setEmailBroadcasts(e.target.checked)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <strong className="block text-xs text-slate-900">Email notice alerts</strong>
                      <span className="text-[11px] text-slate-500">
                        Send immediate email summaries when high-priority academic notices are published.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dailyAdminDigest}
                      onChange={(e) => setDailyAdminDigest(e.target.checked)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <strong className="block text-xs text-slate-900">Daily administration summary</strong>
                      <span className="text-[11px] text-slate-500">
                        Receive a daily morning report of student engagement, task completion, and active circulars.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* 5. Security Section */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Administrator Security & Credentials
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Primary workspace administrator account information.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Administrator Name
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 block font-semibold">Password Authentication</strong>
                    <span className="text-[11px] text-slate-500">Last updated 15 days ago</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Password update dialogue ready.")}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* Save Button Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-transform hover:scale-[1.02]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
