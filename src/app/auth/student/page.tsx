"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/ui/AuthCard";
import {
  GraduationCap,
  Mail,
  IdCard,
  Building,
  School,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Send,
  Info,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";
import { Institution } from "@/types/institution";
import { StudentProfile } from "@/types/student";

export default function StudentLoginPage() {
  const router = useRouter();
  const { verifyCollegeDomain, verifyCollegeOtp, verifySchoolStudent, loginStudent } = useStudentAuth();

  // Mode: "college" | "school"
  const [authMode, setAuthMode] = useState<"college" | "school">("college");

  // Flow step for College: 1 = Email, 2 = Domain Recognized / Send OTP, 3 = Enter OTP, 4 = Student Found / Unmatched
  const [collegeStep, setCollegeStep] = useState<1 | 2 | 3 | 4>(1);

  // College State
  const [collegeEmail, setCollegeEmail] = useState("debendra@futurecollege.ac.in");
  const [matchedCollege, setMatchedCollege] = useState<Institution | null>(null);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [verifiedCollegeStudent, setVerifiedCollegeStudent] = useState<StudentProfile | null>(null);
  const [isUnmatchedCollegeEmail, setIsUnmatchedCollegeEmail] = useState(false);
  const [requestAccessSent, setRequestAccessSent] = useState(false);

  // Flow step for School: 1 = Form, 2 = Student Recognized
  const [schoolStep, setSchoolStep] = useState<1 | 2>(1);

  // School State
  const [studentId, setStudentId] = useState("SCH202600154");
  const [schoolPassword, setSchoolPassword] = useState("123456");
  const [showSchoolPassword, setShowSchoolPassword] = useState(false);
  const [verifiedSchoolStudent, setVerifiedSchoolStudent] = useState<StudentProfile | null>(null);

  // General state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpResent, setOtpResent] = useState(false);

  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // ---------------------------------------------------------------------------
  // COLLEGE FLOW HANDLERS
  // ---------------------------------------------------------------------------

  // Step 1: Check Domain
  const handleCheckDomain = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = verifyCollegeDomain(collegeEmail);
    if (!result.valid) {
      setErrorMessage(result.error || "⚠ This email domain is not registered with NoticeIQ.");
      return;
    }

    setMatchedCollege(result.institution || null);
    setCollegeStep(2);
  };

  // Step 2: Send OTP
  const handleSendOtp = () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsSubmitting(false);
      setCollegeStep(3);
    }, 500);
  };

  // Step 3: Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length < 6) {
      setErrorMessage("Please enter all 6 digits of your verification code.");
      return;
    }

    if (!matchedCollege) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const result = verifyCollegeOtp(collegeEmail, enteredOtp, matchedCollege);
      if (!result.success) {
        setErrorMessage(result.error || "Incorrect verification code.");
        return;
      }

      if (result.studentFound && result.student) {
        setVerifiedCollegeStudent(result.student);
        loginStudent(result.student);
        setCollegeStep(4);
      } else {
        setIsUnmatchedCollegeEmail(true);
        setCollegeStep(4);
      }
    }, 600);
  };

  // ---------------------------------------------------------------------------
  // SCHOOL FLOW HANDLERS
  // ---------------------------------------------------------------------------
  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentId.trim()) {
      setErrorMessage("Please enter your Student ID.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const result = verifySchoolStudent(studentId, schoolPassword);
      if (!result.success || !result.student) {
        setErrorMessage(result.error || "⚠ Student ID not found. Please check your ID or contact your school.");
        return;
      }

      setVerifiedSchoolStudent(result.student);
      loginStudent(result.student);
      setSchoolStep(2);
    }, 600);
  };

  // Reset to Tab switch
  const switchMode = (mode: "college" | "school") => {
    setAuthMode(mode);
    setCollegeStep(1);
    setSchoolStep(1);
    setErrorMessage(null);
    setVerifiedCollegeStudent(null);
    setVerifiedSchoolStudent(null);
    setIsUnmatchedCollegeEmail(false);
    setRequestAccessSent(false);
    setOtpDigits(["", "", "", "", "", ""]);
  };

  return (
    <AuthCard
      title="Welcome to NoticeIQ"
      subtitle="Sign in to access your personalized student action plan."
      roleBadge={{
        label: "Student Access Portal",
        icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />,
        colorScheme: "indigo",
      }}
      backHref="/"
      backLabel="Back to Home"
      footer={
        <p>
          First time on NoticeIQ? Your institution automatically configures your student profile on first sign-in.
        </p>
      }
    >
      {/* Mode Switcher Tabs */}
      <div className="flex p-1 bg-white/[0.04] backdrop-blur-md rounded-2xl border border-white/[0.08] shadow-xs">
        <button
          type="button"
          onClick={() => switchMode("college")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
            authMode === "college"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>🎓 College Student</span>
        </button>

        <button
          type="button"
          onClick={() => switchMode("school")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
            authMode === "school"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <School className="w-3.5 h-3.5" />
          <span>🏫 School Student</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 text-left animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. COLLEGE STUDENT AUTH FLOW                                              */}
      {/* ========================================================================= */}
      {authMode === "college" && (
        <div className="space-y-5">
          {/* Step 1: College Email Input */}
          {collegeStep === 1 && (
            <form onSubmit={handleCheckDomain} className="space-y-4 text-left">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  College Student Login
                </span>
                <p className="text-xs text-slate-400">
                  Use your official college email address.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Official College Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    className="w-full glass-input text-white text-sm rounded-xl py-2.5 pl-10 pr-3.5 outline-none transition-all shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Use the email address provided by your college (e.g. <code>debendra@futurecollege.ac.in</code>).
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full glass-btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-transform shadow-lg shadow-indigo-600/30"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Domain Recognized & Send OTP */}
          {collegeStep === 2 && matchedCollege && (
            <div className="space-y-5 text-left animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Institution recognized</span>
                </div>

                <div className="space-y-1 pt-1 border-t border-emerald-500/20 text-xs">
                  <p className="text-slate-300">
                    Institution: <strong className="text-white block">{matchedCollege.name}</strong>
                  </p>
                  <p className="text-slate-300 font-mono text-[11px] pt-1">
                    Email: <span className="text-emerald-300">{collegeEmail}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCollegeStep(1)}
                  className="px-4 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] border border-white/10"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSubmitting}
                  className="flex-1 glass-btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {isSubmitting ? (
                    <span>Sending Code...</span>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: OTP Screen */}
          {collegeStep === 3 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 text-center animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-white">
                  Verify your email
                </h3>
                <p className="text-xs text-slate-300">
                  We sent a verification code to <strong className="text-indigo-300">{collegeEmail}</strong>.
                </p>
              </div>

              {/* Demo Hint Banner */}
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center justify-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Demo OTP code: <strong>123456</strong></span>
              </div>

              {/* 6 Digit OTP Inputs */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 py-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold text-white glass-input rounded-xl border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all shadow-xs"
                  />
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full glass-btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? <span>Verifying...</span> : <span>Verify</span>}
                </button>

                <div className="flex items-center justify-between text-xs px-1">
                  <button
                    type="button"
                    onClick={() => setCollegeStep(1)}
                    className="text-slate-400 hover:text-white"
                  >
                    ← Edit email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpResent(true);
                      setTimeout(() => setOtpResent(false), 2000);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {otpResent ? "Code resent!" : "Resend code"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Step 4: Existing Student Found OR Unmatched Email */}
          {collegeStep === 4 && (
            <div className="space-y-5 animate-in fade-in">
              {verifiedCollegeStudent ? (
                /* Existing Student Record Found */
                <div className="space-y-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Student account found ✓</span>
                  </div>

                  {/* Student Summary Card */}
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow-md">
                        {verifiedCollegeStudent.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">
                          {verifiedCollegeStudent.name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {verifiedCollegeStudent.institutionName}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-300">
                      <span>{verifiedCollegeStudent.department} • {verifiedCollegeStudent.year} • Sec {verifiedCollegeStudent.section}</span>
                      <span className="font-mono text-slate-400">Roll: {verifiedCollegeStudent.rollNumber}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/student/onboarding")}
                    className="w-full glass-btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <span>Complete Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Unmatched College Email */
                <div className="space-y-4 text-left">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                    <strong className="text-amber-100 block font-semibold">Email Verified — Roster Record Pending</strong>
                    <p className="text-slate-300">
                      Your college email is verified, but we couldn&apos;t find your student record in the active semester database.
                    </p>
                  </div>

                  {requestAccessSent ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Access request sent to your institution administrator.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setRequestAccessSent(true)}
                        className="w-full glass-btn-primary py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5"
                      >
                        <span>Request Access from Institution</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => alert(`Please contact ${matchedCollege?.adminEmail || "your college administration"} to register your student roll number.`)}
                        className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 border border-white/10"
                      >
                        Contact Institution
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setCollegeStep(1)}
                    className="text-xs text-slate-400 hover:text-white block mx-auto text-center"
                  >
                    ← Try another email
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SCHOOL STUDENT AUTH FLOW                                               */}
      {/* ========================================================================= */}
      {authMode === "school" && (
        <div className="space-y-5">
          {schoolStep === 1 && (
            <form onSubmit={handleSchoolSubmit} className="space-y-4 text-left">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  School Student Login
                </span>
                <p className="text-xs text-slate-400">
                  Use your school-provided Student ID & PIN.
                </p>
              </div>

              {/* Student ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Student ID <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCH202600154"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    className="w-full glass-input text-white text-sm font-mono uppercase rounded-xl py-2.5 pl-10 pr-3.5 outline-none transition-all shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Demo Student ID: <code>SCH202600154</code> (Aarav Sen, Class 10)
                </p>
              </div>

              {/* Password / PIN */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Password / PIN <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showSchoolPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={schoolPassword}
                    onChange={(e) => setSchoolPassword(e.target.value)}
                    className="w-full glass-input text-white text-sm rounded-xl py-2.5 pl-10 pr-10 outline-none transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSchoolPassword(!showSchoolPassword)}
                    className="absolute right-3 text-slate-400 hover:text-white"
                    tabIndex={-1}
                  >
                    {showSchoolPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Use the Student ID and initial login credentials provided by your school.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full glass-btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying ID...</span>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* School Step 2: Student Recognized */}
          {schoolStep === 2 && verifiedSchoolStudent && (
            <div className="space-y-4 text-left animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ Student ID recognized</span>
              </div>

              {/* School Student Summary Card */}
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center shadow-md">
                    {verifiedSchoolStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      {verifiedSchoolStudent.name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {verifiedSchoolStudent.institutionName}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-300">
                  <span>{verifiedSchoolStudent.className} • Section {verifiedSchoolStudent.section}</span>
                  <span className="font-mono text-slate-400">Roll: {verifiedSchoolStudent.rollNumber}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/student/onboarding")}
                className="w-full glass-btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <span>Continue to Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </AuthCard>
  );
}
