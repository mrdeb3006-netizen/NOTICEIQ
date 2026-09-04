"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  School,
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Globe,
  MapPin,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Info,
  Check,
} from "lucide-react";
import { BrandWordmark } from "@/components/ui/BrandWordmark";
import { InstitutionType } from "@/types/institution";

export default function InstitutionRegisterPage() {
  const router = useRouter();

  // Multi-step state: 1 = Details, 2 = Admin, 3 = Access Setup, 4 = Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Institution Details
  const [name, setName] = useState("Future Institute of Engineering and Management");
  const [type, setType] = useState<InstitutionType>("college");
  const [location, setLocation] = useState("Kolkata, West Bengal");
  const [website, setWebsite] = useState("https://futurecollege.ac.in");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step 2: Admin Account
  const [adminName, setAdminName] = useState("Dr. Alok Verma");
  const [adminEmail, setAdminEmail] = useState("admin@futurecollege.ac.in");
  const [password, setPassword] = useState("AdminSecure2026!");
  const [confirmPassword, setConfirmPassword] = useState("AdminSecure2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("+91 98300 12345");
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Step 3: Student Access Setup
  const [emailDomain, setEmailDomain] = useState("@futurecollege.ac.in");
  const [studentIdPrefix, setStudentIdPrefix] = useState("SCH2026");

  // Flow State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Logo upload simulator
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 Validation
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please enter the institution name.");
      return;
    }
    if (!location.trim()) {
      setError("Please enter the institution location.");
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Validation
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!adminName.trim() || !adminEmail.trim()) {
      setError("Please provide administrator name and official email.");
      return;
    }
    if (!adminEmail.includes("@")) {
      setError("Please enter a valid administrator email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!isAuthorized) {
      setError("You must confirm that you are authorized to create this institution workspace.");
      return;
    }

    // Auto-sync domain if still default
    if (type === "college" && emailDomain === "@futurecollege.ac.in") {
      const parts = adminEmail.split("@");
      if (parts[1]) {
        setEmailDomain(`@${parts[1]}`);
      }
    }

    setCurrentStep(3);
  };

  // Step 3 Final Submission
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (type === "college" && !emailDomain.trim()) {
      setError("Please specify the institution email domain (e.g. @college.edu).");
      return;
    }
    if (type === "school" && !studentIdPrefix.trim()) {
      setError("Please specify the Student ID prefix (e.g. SCH).");
      return;
    }

    setIsSubmitting(true);

    const newInstitution = {
      id: `inst-${Date.now()}`,
      name,
      type,
      location,
      website: website || "https://example.edu",
      logo: logoPreview || (type === "college" ? "🏛️" : "🏫"),
      emailDomain: type === "college" ? (emailDomain.startsWith("@") ? emailDomain : `@${emailDomain}`) : undefined,
      studentIdPrefix: type === "school" ? studentIdPrefix.toUpperCase() : undefined,
      adminName,
      adminEmail,
      adminPhone: phone,
      status: "active" as const,
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      localStorage.setItem("noticeiq_institution", JSON.stringify(newInstitution));
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(4);
    }, 700);
  };

  // Direct 1-Click Demo Bypass for MVP Evaluation
  const handleDirectDemoSetup = () => {
    const demoInstitution = {
      id: "inst-future-college",
      name: "Future Institute of Engineering and Management",
      type: "college" as const,
      location: "Kolkata, West Bengal",
      website: "https://futurecollege.ac.in",
      logo: "🏛️",
      emailDomain: "@futurecollege.ac.in",
      adminName: "Dr. Alok Verma",
      adminEmail: "admin@futurecollege.ac.in",
      adminPhone: "+91 98300 12345",
      status: "active" as const,
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      localStorage.setItem("noticeiq_institution", JSON.stringify(demoInstitution));
    } catch (err) {
      console.error(err);
    }

    router.push("/institution/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden bg-[#090d16]">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between px-2">
          <Link
            href="/auth/institution"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all shadow-xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Login</span>
          </Link>

          <BrandWordmark size="sm" />
        </div>

        {/* Main Card */}
        <div className="glass-card-static rounded-3xl p-6 sm:p-10 relative border border-white/10 shadow-2xl">
          {/* Top specular rim light */}
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {/* ========================================================================= */}
          {/* MVP DISCLAIMER BANNER & DIRECT ACCESS                                     */}
          {/* ========================================================================= */}
          {currentStep !== 4 && (
            <div className="mb-6 space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-left text-xs space-y-1 shadow-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>NoticeIQ MVP Demo Mode</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Full DNS record verification, domain authentication, and automated KYC will work properly in the main project. You can complete the 3-step form below or skip directly to the dashboard.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-900/30 border border-indigo-500/30 flex items-center justify-between text-left">
                <div>
                  <span className="text-xs font-bold text-white block">
                    🚀 Instant Demo Workspace Setup
                  </span>
                  <span className="text-[10px] text-indigo-300">
                    Pre-configures Future Institute workspace & jumps to Dashboard
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDirectDemoSetup}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1 transition-all shrink-0 ml-2"
                >
                  <span>Skip to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {currentStep !== 4 && (
            <div className="mb-8">
              {/* Step indicator pill */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Step {currentStep} of 3
                </span>
              </div>

              <div className="text-center space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Create your Institution
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Set up your school&apos;s or college&apos;s NoticeIQ workspace.
                </p>
              </div>

              {/* Step Progress Bar */}
              <div className="grid grid-cols-3 gap-2 mt-6 max-w-md mx-auto">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentStep >= 1 ? "bg-indigo-500 shadow-xs shadow-indigo-500/50" : "bg-white/10"
                  }`}
                />
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentStep >= 2 ? "bg-indigo-500 shadow-xs shadow-indigo-500/50" : "bg-white/10"
                  }`}
                />
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentStep >= 3 ? "bg-indigo-500 shadow-xs shadow-indigo-500/50" : "bg-white/10"
                  }`}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Info className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: INSTITUTION DETAILS                                               */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="border-b border-white/[0.08] pb-4 mb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Step 1 — Institution Details
                </h2>
              </div>

              {/* Institution Name */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Institution Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Future Institute of Engineering and Management"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input text-white text-sm rounded-xl py-2.5 px-3.5 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Institution Type Selector */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Institution Type <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType("college")}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      type === "college"
                        ? "bg-indigo-600/20 border-indigo-500/60 shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-500/40"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20 text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                        type === "college"
                          ? "border-indigo-400 bg-indigo-600"
                          : "border-slate-500"
                      }`}
                    >
                      {type === "college" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                        <GraduationCap className="w-4 h-4 text-indigo-400" />
                        College / University
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        Undergraduate & postgraduate degree programs with official domain SSO.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType("school")}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      type === "school"
                        ? "bg-indigo-600/20 border-indigo-500/60 shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-500/40"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20 text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                        type === "school"
                          ? "border-indigo-400 bg-indigo-600"
                          : "border-slate-500"
                      }`}
                    >
                      {type === "school" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                        <School className="w-4 h-4 text-indigo-400" />
                        School / K-12
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        Primary, middle & high school campuses using unique Student ID codes.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Institution Location */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Institution Location <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Kolkata, West Bengal"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full glass-input text-white text-sm rounded-xl py-2.5 pl-10 pr-3.5 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Institution Website */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Institution Website
                </label>
                <div className="relative flex items-center">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://example.edu"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full glass-input text-white text-sm rounded-xl py-2.5 pl-10 pr-3.5 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Institution Logo Upload */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Institution Logo
                </label>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 hover:border-indigo-400/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span>{type === "college" ? "🏛️" : "🏫"}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10 transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, SVG up to 2MB (or use default icon)</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
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

          {/* ========================================================================= */}
          {/* STEP 2: ADMIN ACCOUNT                                                     */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5">
              <div className="border-b border-white/[0.08] pb-4 mb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Step 2 — Administrator Account
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Administrator Name */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                    Administrator Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Dr. Alok Verma"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full glass-input text-white text-sm rounded-xl py-2.5 pl-10 pr-3.5 outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Administrator Email */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                    Administrator Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="admin@futurecollege.ac.in"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full glass-input text-white text-sm rounded-xl py-2.5 pl-10 pr-3.5 outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full glass-input text-white text-sm rounded-xl py-2.5 pl-10 pr-10 outline-none transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full glass-input text-white text-sm rounded-xl py-2.5 pl-10 pr-3.5 outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="+91 98300 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full glass-input text-white text-sm rounded-xl py-2.5 pl-10 pr-3.5 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Authorization Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={isAuthorized}
                  onChange={(e) => setIsAuthorized(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs text-slate-300 leading-snug">
                  I confirm that I am authorized to create this institution workspace on behalf of{" "}
                  <strong className="text-white">{name}</strong>.
                </span>
              </label>

              {/* Admin note */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs flex items-center gap-2 text-left">
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>The administrator will manage students, faculty, notices and institution settings.</span>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-transform shadow-lg shadow-indigo-600/30"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: STUDENT ACCESS SETUP                                              */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-5">
              <div className="border-b border-white/[0.08] pb-4 mb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Step 3 — Student Access Setup
                </h2>
              </div>

              {type === "college" ? (
                /* ----------------- COLLEGE ACCESS SETUP ----------------- */
                <div className="space-y-4 text-left">
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-400" />
                      College Student Access
                    </h3>
                    <p className="text-xs text-indigo-200">
                      Students can join using their official college email address.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                      Institution Email Domain <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="@futurecollege.ac.in"
                        value={emailDomain}
                        onChange={(e) => setEmailDomain(e.target.value)}
                        className="w-full glass-input text-white text-sm rounded-xl py-2.5 pl-10 pr-3.5 outline-none transition-all shadow-xs"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Only students and faculty with emails matching this domain will be verified.
                    </p>
                  </div>

                  {/* Live Email Preview Box */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Live Login Preview
                    </span>
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/10 text-emerald-400 flex items-center justify-between">
                        <span>student{emailDomain.startsWith("@") ? emailDomain : `@${emailDomain}`}</span>
                        <span className="text-[10px] text-emerald-300 font-sans uppercase px-2 py-0.5 rounded bg-emerald-500/20">Student SSO</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/10 text-indigo-300 flex items-center justify-between">
                        <span>faculty{emailDomain.startsWith("@") ? emailDomain : `@${emailDomain}`}</span>
                        <span className="text-[10px] text-indigo-300 font-sans uppercase px-2 py-0.5 rounded bg-indigo-500/20">Faculty SSO</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Notice */}
                  <div className="flex items-center gap-2 text-xs text-slate-300 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Student account verification: <strong>Email OTP verification</strong> enabled.</span>
                  </div>
                </div>
              ) : (
                /* ----------------- SCHOOL ACCESS SETUP ----------------- */
                <div className="space-y-4 text-left">
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <School className="w-4 h-4 text-indigo-400" />
                      School Student Access
                    </h3>
                    <p className="text-xs text-indigo-200">
                      School students will use unique student IDs provided by the school.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
                      Student ID Prefix <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="SCH"
                      value={studentIdPrefix}
                      onChange={(e) => setStudentIdPrefix(e.target.value.toUpperCase())}
                      className="w-full glass-input text-white text-sm rounded-xl py-2.5 px-3.5 uppercase font-mono tracking-wider outline-none transition-all shadow-xs"
                    />
                    <p className="text-[11px] text-slate-400">
                      Prefix used for generating roll codes and student logins.
                    </p>
                  </div>

                  {/* Live Student ID Preview */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Example Student ID Sequence
                    </span>
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/10 text-emerald-400 flex items-center justify-between">
                        <span>{studentIdPrefix || "SCH"}20260001</span>
                        <span className="text-[10px] text-slate-400 font-sans">Roll #01</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/10 text-emerald-400 flex items-center justify-between">
                        <span>{studentIdPrefix || "SCH"}20260002</span>
                        <span className="text-[10px] text-slate-400 font-sans">Roll #02</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/10 text-emerald-400 flex items-center justify-between">
                        <span>{studentIdPrefix || "SCH"}20260003</span>
                        <span className="text-[10px] text-slate-400 font-sans">Roll #03</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Notice */}
                  <div className="flex items-center gap-2 text-xs text-slate-300 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Student account verification: <strong>School-provided Student ID + initial password/PIN</strong>.</span>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 glass-btn-primary py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-transform shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Creating Workspace...</span>
                  ) : (
                    <>
                      <span>Create Institution</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* SUCCESS SCREEN                                                            */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 py-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Institution workspace created!
                </h1>
                <p className="text-sm text-slate-300 max-w-sm mx-auto">
                  Your NoticeIQ workspace is ready.
                </p>
              </div>

              {/* Institution Workspace Summary Card */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-3 max-w-md mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <span className="text-xs text-slate-400">Institution</span>
                  <span className="text-xs font-bold text-white text-right max-w-[240px] truncate">{name}</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <span className="text-xs text-slate-400">Type</span>
                  <span className="text-xs font-bold text-indigo-300 uppercase">
                    {type === "college" ? "College / University" : "School / K-12"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Student Access</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {type === "college"
                      ? emailDomain.startsWith("@") ? emailDomain : `@${emailDomain}`
                      : `${studentIdPrefix || "SCH"} [Prefix]`}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => router.push("/institution/dashboard")}
                  className="w-full glass-btn-primary py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-transform shadow-lg shadow-indigo-600/30"
                >
                  <span>Go to Institution Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="w-full px-4 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>View Setup Guide</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Setup Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card-static rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/15 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>NoticeIQ Setup Guide</span>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg bg-white/[0.05]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-left text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <strong className="text-white block font-semibold">1. Connect Student Directory</strong>
                <p className="text-slate-400">Import student roster or let students join automatically using their registered domain.</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <strong className="text-white block font-semibold">2. Invite Faculty Members</strong>
                <p className="text-slate-400">Add department professors to let them draft circulars and track read receipts.</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <strong className="text-white block font-semibold">3. Publish First Notice</strong>
                <p className="text-slate-400">NoticeIQ transforms your circulars into automated student action items & schedules.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowGuideModal(false);
                router.push("/institution/dashboard");
              }}
              className="w-full glass-btn-primary py-2.5 rounded-xl text-xs font-bold text-white"
            >
              Continue to Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
