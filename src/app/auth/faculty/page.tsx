"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/ui/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Zap,
  Info,
} from "lucide-react";

export default function FacultyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ananya.sen@futurecollege.ac.in");
  const [password, setPassword] = useState("FacultySecure2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDirectFacultyAccess = () => {
    router.push("/faculty/dashboard");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please provide your faculty email and password.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/faculty/dashboard");
    }, 400);
  };

  return (
    <AuthCard
      title="Faculty Login"
      subtitle="Publish course notices, set assignment deadlines, and monitor student task completion."
      roleBadge={{
        label: "Faculty Portal",
        icon: <BookOpen className="w-3.5 h-3.5 text-indigo-400" />,
        colorScheme: "indigo",
      }}
      backHref="/"
      backLabel="Back to Home"
      footer={
        <div className="space-y-1">
          <p>
            Need faculty access credentials? Contact your campus institution administrator.
          </p>
        </div>
      }
    >
      {/* ========================================================================= */}
      {/* MVP AUTHENTICATION DISCLAIMER BANNER                                      */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-left text-xs space-y-1 shadow-xs">
        <div className="flex items-center gap-2 text-amber-300 font-bold">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>NoticeIQ MVP Demo Mode</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Direct 1-click access is active below for rapid prototyping and evaluation. Full multi-factor authentication, email domain verification, and SSO will work properly in the main project.
        </p>
      </div>

      {/* Direct Demo Access CTA */}
      <div className="p-3.5 rounded-2xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-between text-left">
        <div>
          <span className="text-xs font-bold text-white block">
            🚀 Direct Faculty Demo Access
          </span>
          <span className="text-[10px] text-violet-300">
            Dr. Ananya Sen (HOD • Computer Science)
          </span>
        </div>
        <button
          type="button"
          onClick={handleDirectFacultyAccess}
          className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 flex items-center gap-1 transition-all"
        >
          <span>Enter Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {submittedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-white">Access Granted</p>
            <p className="text-emerald-200">{submittedMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Institution Email"
          type="email"
          placeholder="prof.williams@institution.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          error={error || undefined}
          helperText="Use the email address registered with your academic department"
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
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
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
            <span>Remember me</span>
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Password reset will be enabled in backend authentication step.");
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
            className="w-full justify-center shadow-lg shadow-indigo-500/25"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Login to Faculty Portal
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
