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
      accent: "bg-indigo-50 border-indigo-200 text-indigo-700",
    },
    {
      step: "02",
      label: "UNDERSTAND",
      tagline: "AI Analysis",
      description: "Extract core deliverables, eligibility criteria, and hard submission dates.",
      icon: <BrainCircuit className="w-5 h-5 text-violet-600" />,
      accent: "bg-violet-50 border-violet-200 text-violet-700",
    },
    {
      step: "03",
      label: "PERSONALIZE",
      tagline: "Student Matching",
      description: "Filter out noise to isolate what specifically applies to your branch, year, and course.",
      icon: <UserCheck className="w-5 h-5 text-sky-600" />,
      accent: "bg-sky-50 border-sky-200 text-sky-700",
    },
    {
      step: "04",
      label: "PRIORITIZE",
      tagline: "Urgency Sorting",
      description: "Smart sequencing based on impending deadlines and active workload.",
      icon: <ListOrdered className="w-5 h-5 text-amber-600" />,
      accent: "bg-amber-50 border-amber-200 text-amber-700",
    },
    {
      step: "05",
      label: "ACT",
      tagline: "Execute & Achieve",
      description: "Converts notifications into scheduled, executable daily tasks and reminders.",
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      accent: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white border-y border-slate-200/80 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200/60">
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

        {/* 5-Step Visual Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((item, index) => (
            <div key={item.label} className="flex flex-col items-center relative group">
              {/* Card */}
              <div className="w-full h-full bg-slate-50 hover:bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      STEP {item.step}
                    </span>
                    <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-slate-900 mb-0.5">
                      {item.label}
                    </h3>
                    <p className="text-xs font-medium text-indigo-600">
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
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 shadow-xs">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  {/* Mobile Down Arrow */}
                  <div className="flex md:hidden my-2 items-center justify-center text-slate-300">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Required Explanatory Callout Banner */}
        <div className="mt-16 max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-slate-50 to-violet-50/80 border border-indigo-100 text-center space-y-2 shadow-sm">
          <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
            “Students receive dozens of notices, announcements and deadlines.
            <br className="hidden sm:inline" />
            <span className="font-semibold text-indigo-900">
              NoticeIQ turns that information into clear, personalized actions.
            </span>”
          </p>
        </div>
      </div>
    </section>
  );
};
