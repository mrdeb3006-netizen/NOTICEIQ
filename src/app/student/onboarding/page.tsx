"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Building,
  GraduationCap,
  School,
  Lock,
  Sparkles,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Tag,
  BookOpen,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";
import { BrandWordmark } from "@/components/ui/BrandWordmark";

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { currentStudent, updateStudentPreferences, isLoaded } = useStudentAuth();

  const [interests, setInterests] = useState<string[]>(
    currentStudent?.interests || ["Programming", "AI & Machine Learning", "Web Development"]
  );
  const [preferredHours, setPreferredHours] = useState(
    currentStudent?.preferredStartTime && currentStudent?.preferredEndTime
      ? `${currentStudent.preferredStartTime} – ${currentStudent.preferredEndTime}`
      : "6 PM – 10 PM"
  );
  const [dailyTime, setDailyTime] = useState(currentStudent?.availableDailyHours || "2 hours");
  const [customInterest, setCustomInterest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const addCustomInterest = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customInterest.trim()) {
      e.preventDefault();
      if (!interests.includes(customInterest.trim())) {
        setInterests([...interests, customInterest.trim()]);
      }
      setCustomInterest("");
    }
  };

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parts = preferredHours.split("–").map((s) => s.trim());
    const startTime = parts[0] || "6 PM";
    const endTime = parts[1] || "10 PM";

    updateStudentPreferences({
      interests,
      preferredStartTime: startTime,
      preferredEndTime: endTime,
      availableDailyHours: dailyTime,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/student/dashboard");
    }, 500);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white text-xs">
        Loading student profile...
      </div>
    );
  }

  const isCollege = currentStudent?.institutionType === "college" || !!currentStudent?.email;

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Top Wordmark */}
        <div className="flex items-center justify-between px-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Profile Personalization</span>
          </div>
          <BrandWordmark size="sm" />
        </div>

        {/* Card */}
        <div className="glass-card-static rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative space-y-6">
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {/* Heading */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Complete your NoticeIQ profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Confirm your verified institution details and configure your personal study preferences.
            </p>
          </div>

          <form onSubmit={handleCompleteSetup} className="space-y-6 text-left">
            {/* 1. Institution-Provided Data (LOCKED) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Institution-Verified Credentials
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Locked by Campus
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Student Full Name</span>
                  <p className="text-xs font-bold text-white">{currentStudent?.name || "Debendra Bera"}</p>
                </div>

                {/* Institution Name */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Institution</span>
                  <p className="text-xs font-bold text-white truncate">{currentStudent?.institutionName || "Future Institute"}</p>
                </div>

                {/* Dept / Class */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    {isCollege ? "Department & Year" : "Class"}
                  </span>
                  <p className="text-xs font-bold text-white">
                    {isCollege
                      ? `${currentStudent?.department || "CSE"} • ${currentStudent?.year || "1st Year"}`
                      : currentStudent?.className || "Class 10"}
                  </p>
                </div>

                {/* Section & Roll No */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Section & Roll Number</span>
                  <p className="text-xs font-bold text-white">
                    Section {currentStudent?.section || "A"} • Roll #{currentStudent?.rollNumber || "23"}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Personal Preferences (EDITABLE) */}
            <div className="space-y-4 pt-2 border-t border-white/[0.08]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Personal Study Preferences
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  NoticeIQ uses these preferences to calculate deadline urgency and schedule daily priority blocks.
                </p>
              </div>

              {/* Interests / Focus Areas */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Areas of Focus / Academic Interests
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {interestPresets.map((tag) => {
                    const selected = interests.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          selected
                            ? "bg-indigo-600 text-white shadow-xs border border-indigo-400/40"
                            : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/10 hover:bg-white/[0.08]"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {tag}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  placeholder="Type custom interest and press Enter..."
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={addCustomInterest}
                  className="w-full glass-input text-white text-xs rounded-xl py-2 px-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Preferred Study Hours */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Preferred Study / Work Hours
                  </label>
                  <select
                    value={preferredHours}
                    onChange={(e) => setPreferredHours(e.target.value)}
                    className="w-full glass-input text-white text-xs rounded-xl py-2.5 px-3 outline-none"
                  >
                    <option value="6 PM – 10 PM" className="bg-[#090d16]">Evening (6 PM – 10 PM)</option>
                    <option value="4 PM – 8 PM" className="bg-[#090d16]">Late Afternoon (4 PM – 8 PM)</option>
                    <option value="8 PM – 12 AM" className="bg-[#090d16]">Night (8 PM – 12 AM)</option>
                    <option value="6 AM – 9 AM" className="bg-[#090d16]">Early Morning (6 AM – 9 AM)</option>
                    <option value="Flexible Hours" className="bg-[#090d16]">Flexible / All Day</option>
                  </select>
                </div>

                {/* Available Daily Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Typical Available Time Per Day
                  </label>
                  <select
                    value={dailyTime}
                    onChange={(e) => setDailyTime(e.target.value)}
                    className="w-full glass-input text-white text-xs rounded-xl py-2.5 px-3 outline-none"
                  >
                    <option value="1 hour" className="bg-[#090d16]">1 hour / day</option>
                    <option value="2 hours" className="bg-[#090d16]">2 hours / day (Recommended)</option>
                    <option value="3 hours" className="bg-[#090d16]">3 hours / day</option>
                    <option value="4+ hours" className="bg-[#090d16]">4+ hours / day</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full glass-btn-primary py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving Profile...</span>
                ) : (
                  <>
                    <span>Complete Setup & Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
