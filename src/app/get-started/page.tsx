import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RoleCard } from "@/components/role/RoleCard";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function GetStartedPage() {
  const roles = [
    {
      id: "student",
      title: "Student",
      emoji: "🎓",
      tagline: "Learner Portal",
      description: "Manage your notices, tasks and priorities.",
      href: "/auth/student",
      features: [
        "AI-extracted deadlines & actions",
        "Personalized task scheduler",
        "Adaptive daily priority feed",
      ],
      popular: true,
    },
    {
      id: "institution",
      title: "Institution",
      emoji: "🏫",
      tagline: "Admin Portal",
      description: "Connect your school or college with students.",
      href: "/auth/institution",
      features: [
        "Campus-wide notice dispatch",
        "Department & batch segmentation",
        "Engagement & delivery analytics",
      ],
      popular: false,
    },
    {
      id: "faculty",
      title: "Faculty",
      emoji: "👨‍🏫",
      tagline: "Staff Portal",
      description: "Create and publish notices for students.",
      href: "/auth/faculty",
      features: [
        "Course & lab announcement creator",
        "Direct assignment deadline broadcast",
        "Class acknowledgment tracker",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 md:py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link with Glass pill */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/50 backdrop-blur-md border border-white/80 shadow-xs text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Page Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md text-indigo-700 text-xs font-bold border border-white/90 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Role Selection
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              How will you use NoticeIQ?
            </h1>

            <p className="text-base text-slate-600 font-medium">
              Select your role to access your personalized portal and workflow dashboard.
            </p>
          </div>

          {/* 3 Large Glass Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {roles.map((role) => (
              <RoleCard key={role.id} {...role} />
            ))}
          </div>

          {/* Need help footer with glass container */}
          <div className="mt-14 text-center">
            <div className="inline-block px-5 py-2.5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/70 shadow-xs text-xs text-slate-600">
              Have questions regarding institution onboarding?{" "}
              <Link
                href="/auth/institution/register"
                className="font-bold text-indigo-600 hover:underline"
              >
                Register your institution
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
