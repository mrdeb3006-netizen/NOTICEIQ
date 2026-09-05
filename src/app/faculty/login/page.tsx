"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/ui/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useFacultyData, DEMO_FACULTY_MEMBERS } from "@/lib/facultyStore";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  Info,
  CheckCircle2,
  Building2,
} from "lucide-react";

export default function FacultyLoginPage() {
  const router = useRouter();
  const { switchFacultyPersona } = useFacultyData();

  const [email, setEmail] = useState("arindam.sen@futurecollege.ac.in");
  const [password, setPassword] = useState("FacultySecure2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"FACULTY" | "HOD">("FACULTY");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fast 1-click login for demo personas
  const handleDirectLogin = (facultyId: string) => {
    setIsSubmitting(true);
    switchFacultyPersona(facultyId);
    setTimeout(() => {
      router.push("/faculty/dashboard");
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please provide your faculty ID / official email and password.");
      return;
    }

    setIsSubmitting(true);

    // Check if entered email matches HOD or regular faculty
    const matched = DEMO_FACULTY_MEMBERS.find(
      (f) =>
        f.email.toLowerCase() === email.trim().toLowerCase() ||
        f.facultyId.toLowerCase() === email.trim().toLowerCase()
    );

    if (matched) {
      switchFacultyPersona(matched.id);
    } else {
      // If user toggled HOD, switch to Dr. Ananya, otherwise Prof. Arindam
      switchFacultyPersona(selectedRole === "HOD" ? "fac-ananya" : "fac-arindam");
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/faculty/dashboard");
    }, 350);
  };

  return (
    <AuthCard
      title="Faculty & HOD Portal"
      subtitle="Publish academic notices, coordinate class schedules, and review student action insights."
      roleBadge={{
        label: "Faculty Workspace",
        icon: <BookOpen className="w-3.5 h-3.5 text-indigo-400" />,
        colorScheme: "indigo",
      }}
      backHref="/"
      backLabel="Back to NoticeIQ Home"
      footer={
        <div className="space-y-1.5 text-slate-400 text-xs text-center">
          <p>
            Need new faculty credentials or department re-assignment?{" "}
            <Link
              href="/institution/dashboard"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Contact Campus Administration
            </Link>
          </p>
        </div>
      }
    >
      {/* Institution Header Badge */}
      <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              Future Institute of Engineering & Management
            </span>
            <span className="text-[11px] text-indigo-300">
              Department of Computer Science & Engineering
            </span>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Verified
        </span>
      </div>

      {/* 1-Click Fast Login Personas */}
      <div className="space-y-2 text-left pt-1">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
          Quick Demo Login Personas
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Persona 1: Prof. Arindam (Faculty) */}
          <button
            type="button"
            onClick={() => handleDirectLogin("fac-arindam")}
            className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/50 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Faculty
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <span className="text-xs font-bold text-white block">
              Prof. Arindam Sen
            </span>
            <span className="text-[11px] text-slate-400 block">
              Assistant Professor • CSE
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              Assigned: CSE 1st Year (A & B)
            </span>
          </button>

          {/* Persona 2: Dr. Ananya (HOD) */}
          <button
            type="button"
            onClick={() => handleDirectLogin("fac-ananya")}
            className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/50 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                HOD Role
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <span className="text-xs font-bold text-white block">
              Dr. Ananya Sen
            </span>
            <span className="text-[11px] text-slate-400 block">
              Head of Department • CSE
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              Elevated Department Workspace
            </span>
          </button>
        </div>
      </div>

      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0e131f] px-2 text-slate-500 text-[10px] font-bold">
            Or Login with Credentials
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs text-left">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
        {/* Role Toggle */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Select Role / Designation
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedRole("FACULTY");
                setEmail("arindam.sen@futurecollege.ac.in");
              }}
              className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                selectedRole === "FACULTY"
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30"
                  : "bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Faculty</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole("HOD");
                setEmail("ananya.sen@futurecollege.ac.in");
              }}
              className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                selectedRole === "HOD"
                  ? "bg-amber-600 text-white border-amber-500 shadow-sm shadow-amber-600/30"
                  : "bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Head of Dept (HOD)</span>
            </button>
          </div>
        </div>

        <Input
          label="Faculty ID or Official Email"
          type="text"
          placeholder="e.g. CSE-F-102 or arindam.sen@futurecollege.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-slate-200 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          required
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Remember session</span>
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Password recovery link sent to your registered campus email.");
            }}
            className="text-slate-400 hover:text-indigo-400 font-medium transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full justify-center shadow-lg shadow-indigo-600/25"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Access Faculty Portal
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
