"use client";

import React, { useState } from "react";
import { AuthCard } from "@/components/ui/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Mail,
  IdCard,
  Building,
  School,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function StudentLoginPage() {
  const [authMode, setAuthMode] = useState<"college" | "school">("college");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCollegeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!collegeEmail.trim()) {
      setError("Please enter your official college email address.");
      return;
    }
    if (!collegeEmail.includes("@")) {
      setError("Please enter a valid email format (e.g. student@college.edu).");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedMessage(
        `Verification code sent to ${collegeEmail}. NoticeIQ is ready for Step 2 authentication.`
      );
    }, 600);
  };

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentId.trim()) {
      setError("Please enter the Student ID provided by your school.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedMessage(
        `Student ID '${studentId}' verified. Ready for Step 2 authentication flow.`
      );
    }, 600);
  };

  return (
    <AuthCard
      title="Student Login"
      subtitle="Access your personalized notices, extracted action items, and adaptive schedules."
      roleBadge={{
        label: "Student Portal",
        icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />,
        colorScheme: "indigo",
      }}
      backHref="/"
      backLabel="Back to Home"
      footer={
        <div className="space-y-1">
          <p>
            First time using NoticeIQ? Your institution will automatically link your profile on first login.
          </p>
        </div>
      }
    >
      {/* Mode Switcher Dark Glass Tabs */}
      <div className="flex p-1 bg-white/[0.04] backdrop-blur-md rounded-2xl border border-white/[0.08] shadow-xs">
        <button
          type="button"
          onClick={() => {
            setAuthMode("college");
            setError(null);
            setSubmittedMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
            authMode === "college"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>College Student</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMode("school");
            setError(null);
            setSubmittedMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
            authMode === "school"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <School className="w-3.5 h-3.5" />
          <span>School Student</span>
        </button>
      </div>

      {submittedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-white">Sign-in Link Ready</p>
            <p className="text-emerald-200">{submittedMessage}</p>
          </div>
        </div>
      )}

      {/* Option 1: College Student */}
      {authMode === "college" && (
        <form onSubmit={handleCollegeSubmit} className="space-y-5">
          <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-300">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>COLLEGE STUDENT</span>
            </div>
            <p className="text-xs text-slate-400">
              Use your official college email
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="College Email"
              type="email"
              placeholder="student@college.edu"
              value={collegeEmail}
              onChange={(e) => setCollegeEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              error={error || undefined}
              helperText="Must be your institution-provided .edu or college domain email"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center shadow-lg shadow-indigo-500/25"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          </div>
        </form>
      )}

      {/* Option 2: School Student */}
      {authMode === "school" && (
        <form onSubmit={handleSchoolSubmit} className="space-y-5">
          <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-300">
              <School className="w-3.5 h-3.5 text-indigo-400" />
              <span>SCHOOL STUDENT</span>
            </div>
            <p className="text-xs text-slate-400">
              Use the student ID provided by your school
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Student ID"
              type="text"
              placeholder="e.g. SCH-2025-8841"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              leftIcon={<IdCard className="w-4 h-4" />}
              error={error || undefined}
              helperText="Enter the unique registration code or roll number issued by your school"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center shadow-lg shadow-indigo-500/25"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          </div>
        </form>
      )}

      {/* Overview of both options note */}
      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-[11px] text-slate-500">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Single Sign-On & ID sync enabled
        </span>
        <button
          type="button"
          onClick={() => {
            setAuthMode(authMode === "college" ? "school" : "college");
            setError(null);
            setSubmittedMessage(null);
          }}
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Switch to {authMode === "college" ? "School Student" : "College Student"} →
        </button>
      </div>
    </AuthCard>
  );
}
