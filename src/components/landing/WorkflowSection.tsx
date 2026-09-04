import React from "react";
import {
  FileText,
  BrainCircuit,
  UserCheck,
  ListOrdered,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  Sparkles,
} from "lucide-react";

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      step: "01",
      label: "NOTICE",
      tagline: "Central Ingestion",
      description: "Incoming school & college announcements, circulars and syllabus notices.",
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      accent: "bg-indigo-50/70 border-indigo-200/80 text-indigo-700",
    },
    {
      step: "02",
      label: "UNDERSTAND",
      tagline: "AI Analysis",
      description: "Extract core deliverables, eligibility criteria, and hard submission dates.",
      icon: <BrainCircuit className="w-5 h-5 text-violet-600" />,
      accent: "bg-violet-50/70 border-violet-200/80 text-violet-700",
    },
    {
      step: "03",
      label: "PERSONALIZE",
      tagline: "Student Matching",
      description: "Filter out noise to isolate what specifically applies to your branch, year, and course.",
      icon: <UserCheck className="w-5 h-5 text-sky-600" />,
      accent: "bg-sky-50/70 border-sky-200/80 text-sky-700",
    },
    {
      step: "04",
      label: "PRIORITIZE",
      tagline: "Urgency Sorting",
      description: "Smart sequencing based on impending deadlines and active workload.",
      icon: <ListOrdered className="w-5 h-5 text-amber-600" />,
      accent: "bg-amber-50/70 border-amber-200/80 text-amber-700",
    },
    {
      step: "05",
      label: "ACT",
      tagline: "Execute & Achieve",
      description: "Converts notifications into scheduled, executable daily tasks and reminders.",
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      accent: "bg-emerald-50/70 border-emerald-200/80 text-emerald-700",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 backdrop-blur-md text-indigo-700 text-xs font-semibold border border-white/90 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Intelligent Workflow Engine
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            The NoticeIQ Workflow
          </h2>

          <p className="text-base text-slate-600 leading-relaxed">
            How NoticeIQ transforms messy institutional communication into clear daily action steps.
          </p>
        </div>

        {/* 5-Step Visual Flow Cards with Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((item, index) => (
            <div key={item.label} className="flex flex-col items-center relative group">
              {/* Glass Card */}
              <div className="w-full h-full glass-card rounded-2xl p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      STEP {item.step}
                    </span>
                    <div className="p-2 rounded-xl bg-white/80 backdrop-blur-md border border-white shadow-xs group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-slate-900 mb-0.5">
                      {item.label}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600">
                      {item.tagline}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Direction Indicator */}
              {index < steps.length - 1 && (
                <>
                  {/* Desktop Right Arrow */}
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/90 backdrop-blur-md border border-white items-center justify-center text-slate-500 shadow-xs">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  {/* Mobile Down Arrow */}
                  <div className="flex md:hidden my-2 items-center justify-center text-slate-400">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Required Explanatory Glass Callout Banner */}
        <div className="mt-16 max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl glass-card-static text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent opacity-60" />
          <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
            “Students receive dozens of notices, announcements and deadlines.
            <br className="hidden sm:inline" />
            <span className="font-bold text-indigo-900">
              NoticeIQ turns that information into clear, personalized actions.
            </span>”
          </p>
        </div>
      </div>
    </section>
  );
};
