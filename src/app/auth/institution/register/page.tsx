"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/ui/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  Mail,
  User,
  School,
  ArrowRight,
  CheckCircle2,
  Info,
} from "lucide-react";

export default function InstitutionRegisterPage() {
  const [institutionName, setInstitutionName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [institutionType, setInstitutionType] = useState("college");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <AuthCard
      title="Register Institution"
      subtitle="Connect your university, college, or school with NoticeIQ's AI action network."
      roleBadge={{
        label: "Institution Onboarding",
        icon: <Building2 className="w-3.5 h-3.5 text-indigo-600" />,
        colorScheme: "indigo",
      }}
      backHref="/auth/institution"
      backLabel="Back to Institution Login"
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href="/auth/institution"
            className="font-bold text-indigo-600 hover:text-indigo-700"
          >
            Login here
          </Link>
        </p>
      }
    >
      {isSubmitted ? (
        <div className="p-6 rounded-3xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-emerald-950">
              Registration Request Received
            </h2>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
              We have staged onboarding for <strong>{institutionName || "your institution"}</strong>.
              Full database persistence and workspace configuration will activate in Step 2.
            </p>
          </div>
          <Button
            href="/auth/institution"
            variant="outline"
            size="sm"
            className="bg-white/80"
          >
            Return to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 backdrop-blur-md border border-indigo-200/50 flex items-start gap-2.5 text-xs text-indigo-900 shadow-xs">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Institution onboarding allows batch notice broadcast, faculty permissions, and student sync.
            </span>
          </div>

          <Input
            label="Institution / University Name"
            type="text"
            placeholder="e.g. Stanford University or Lincoln High"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            leftIcon={<School className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Admin Full Name"
              type="text"
              placeholder="Dr. Jane Smith"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Institution Type
              </label>
              <select
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value)}
                className="w-full bg-white/70 backdrop-blur-md text-slate-900 text-sm rounded-xl border border-white/80 hover:border-indigo-200 focus:border-indigo-500 focus:bg-white/90 focus:ring-3 focus:ring-indigo-500/15 py-2.5 px-3.5 outline-none transition-all shadow-xs"
              >
                <option value="college">College / University</option>
                <option value="school">High School / K-12</option>
                <option value="academy">Academy / Institute</option>
              </select>
            </div>
          </div>

          <Input
            label="Official Work Email"
            type="email"
            placeholder="admin.office@institution.edu"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="Must be an official institutional email for domain verification"
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center shadow-lg shadow-indigo-500/20"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Institution Details
            </Button>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
