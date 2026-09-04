"use client";

import React, { useState } from "react";
import {
  User,
  ShieldCheck,
  Lock,
  Sparkles,
  Clock,
  Calendar,
  Edit2,
  CheckCircle2,
  Building,
  GraduationCap,
  School,
  X,
  Mail,
  IdCard,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";

export default function StudentProfilePage() {
  const { currentStudent, updateStudentPreferences } = useStudentAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [interests, setInterests] = useState<string[]>(
    currentStudent?.interests || ["Programming", "AI & Machine Learning", "Web Development"]
  );
  const [preferredHours, setPreferredHours] = useState(
    currentStudent?.preferredStartTime && currentStudent?.preferredEndTime
      ? `${currentStudent.preferredStartTime} – ${currentStudent.preferredEndTime}`
      : "6 PM – 10 PM"
  );
  const [dailyTime, setDailyTime] = useState(currentStudent?.availableDailyHours || "2 hours");
  const [saveToast, setSaveToast] = useState(false);

  const interestPresets = [
    "Programming",
    "AI & Machine Learning",
    "Web Development",
    "Competitive Coding",
    "Robotics",
    "Mathematics",
    "UI/UX Design",
    "Cybersecurity",
    "Data Science",
  ];

  const toggleInterest = (tag: string) => {
    if (interests.includes(tag)) {
      setInterests(interests.filter((t) => t !== tag));
    } else {
      setInterests([...interests, tag]);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();

    const parts = preferredHours.split("–").map((s) => s.trim());
    const startTime = parts[0] || "6 PM";
    const endTime = parts[1] || "10 PM";

    updateStudentPreferences({
      interests,
      preferredStartTime: startTime,
      preferredEndTime: endTime,
      availableDailyHours: dailyTime,
    });

    setShowEditModal(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const isCollege = currentStudent?.institutionType === "college" || !!currentStudent?.email;

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Page Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Student Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional credentials and personal AI optimization parameters.
          </p>
        </div>
      </div>

      {saveToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Personal study preferences updated successfully!</span>
        </div>
      )}

      {/* 1. Verified Institutional Information Card (READ-ONLY) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
              {currentStudent?.name ? currentStudent.name.charAt(0) : "S"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {currentStudent?.name || "Debendra Bera"}
              </h2>
              <p className="text-xs text-slate-500">
                {currentStudent?.institutionName || "Future Institute of Engineering and Management"}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold self-start sm:self-auto border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Institution-Controlled Records</span>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Institution</span>
            <p className="text-xs font-bold text-slate-900 truncate">
              {currentStudent?.institutionName}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {isCollege ? "Official College Email" : "Student ID"}
            </span>
            <p className="text-xs font-mono font-bold text-indigo-600 truncate">
              {isCollege ? currentStudent?.email : currentStudent?.studentId}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {isCollege ? "Department & Stream" : "Class"}
            </span>
            <p className="text-xs font-bold text-slate-900">
              {isCollege ? currentStudent?.department : currentStudent?.className}
            </p>
          </div>

          {isCollege && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Academic Year</span>
              <p className="text-xs font-bold text-slate-900">
                {currentStudent?.year || "1st Year"}
              </p>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Section Cohort</span>
            <p className="text-xs font-bold text-slate-900">
              Section {currentStudent?.section || "A"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Roll Number</span>
            <p className="text-xs font-mono font-bold text-slate-900">
              {currentStudent?.rollNumber || "23"}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Institutional credentials are synchronized directly with your campus registrar. To update these details, contact your institution administrator.
          </span>
        </div>
      </div>

      {/* 2. Personal Preferences Card (EDITABLE) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Personal Preferences
            </h3>
            <p className="text-xs text-slate-500">
              Used by NoticeIQ to personalize your task schedules and focus recommendations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Preferences</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Focus areas */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase block">
              Areas of Focus & Academic Interests
            </span>
            <div className="flex flex-wrap gap-2">
              {currentStudent?.interests && currentStudent.interests.length > 0 ? (
                currentStudent.interests.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No focus areas configured yet.</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-600" />
                Preferred Working Hours
              </span>
              <p className="text-sm font-bold text-slate-900">
                {currentStudent?.preferredStartTime && currentStudent?.preferredEndTime
                  ? `${currentStudent.preferredStartTime} – ${currentStudent.preferredEndTime}`
                  : "6 PM – 10 PM"}
              </p>
              <p className="text-[11px] text-slate-500">Task reminders align to this window</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-600" />
                Available Daily Time
              </span>
              <p className="text-sm font-bold text-slate-900">
                {currentStudent?.availableDailyHours || "2 hours / day"}
              </p>
              <p className="text-[11px] text-slate-500">Maximum daily allocated task load</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Preferences Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Personal Preferences
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-5 text-left">
              {/* Interests */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Select Focus Areas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {interestPresets.map((tag) => {
                    const selected = interests.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          selected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hours */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Preferred Study / Work Hours
                </label>
                <select
                  value={preferredHours}
                  onChange={(e) => setPreferredHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none"
                >
                  <option value="6 PM – 10 PM">Evening (6 PM – 10 PM)</option>
                  <option value="4 PM – 8 PM">Late Afternoon (4 PM – 8 PM)</option>
                  <option value="8 PM – 12 AM">Night (8 PM – 12 AM)</option>
                  <option value="6 AM – 9 AM">Early Morning (6 AM – 9 AM)</option>
                  <option value="Flexible Hours">Flexible / All Day</option>
                </select>
              </div>

              {/* Time */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Available Daily Time
                </label>
                <select
                  value={dailyTime}
                  onChange={(e) => setDailyTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none"
                >
                  <option value="1 hour">1 hour / day</option>
                  <option value="2 hours">2 hours / day (Recommended)</option>
                  <option value="3 hours">3 hours / day</option>
                  <option value="4+ hours">4+ hours / day</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm shadow-indigo-600/30"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
