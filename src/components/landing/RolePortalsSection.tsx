import React from "react";
import Link from "next/link";
import { RoleCard } from "../role/RoleCard";
import { Sparkles, ShieldCheck } from "lucide-react";

export const RolePortalsSection: React.FC = () => {
  const roles = [
    {
      id: "student",
      title: "Student Portal",
      emoji: "🎓",
      tagline: "Learners & Scholars",
      description: "Manage your notices, auto-extracted tasks and daily priorities.",
      href: "/auth/student",
      buttonLabel: "Student Login",
      features: [
        "AI-extracted deadlines & actions",
        "Personalized task scheduler",
        "Adaptive daily priority feed",
      ],
      popular: true,
    },
    {
      id: "institution",
      title: "Institution Portal",
      emoji: "🏫",
      tagline: "Colleges & Schools",
      description: "Connect your school or college with students and broadcast notices.",
      href: "/auth/institution",
      buttonLabel: "Institution Login",
      secondaryAction: {
        label: "Register New Institution",
        href: "/auth/institution/register",
      },
      features: [
        "Campus-wide notice dispatch",
        "Department & batch segmentation",
        "Engagement & delivery analytics",
      ],
      popular: false,
    },
    {
      id: "faculty",
      title: "Faculty Portal",
      emoji: "👨‍🏫",
      tagline: "Professors & Teachers",
      description: "Create and publish course circulars, assignments, and deadlines.",
      href: "/auth/faculty",
      buttonLabel: "Faculty Login",
      features: [
        "Course & lab announcement creator",
        "Direct assignment deadline broadcast",
        "Class acknowledgment tracker",
      ],
      popular: false,
    },
  ];

  return (
    <section id="portals" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/[0.04] backdrop-blur-md text-indigo-400 text-xs font-semibold border border-white/[0.08] shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            Access Portals
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Choose Your Access Portal
          </h2>

          <p className="text-base text-slate-400 leading-relaxed font-normal">
            Direct access for students, campus administrators, and academic faculty.
          </p>
        </div>

        {/* 3 Direct Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {roles.map((role) => (
            <RoleCard key={role.id} {...role} />
          ))}
        </div>

        {/* Institution Onboarding / Register link */}
        <div className="mt-14 text-center">
          <div className="inline-block px-5 py-2.5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] shadow-xs text-xs text-slate-400">
            Need to register a new school or university campus?{" "}
            <Link
              href="/auth/institution/register"
              className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
            >
              Register your institution →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
