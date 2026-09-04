import React from "react";
import { BrainCircuit, Filter, Sparkles, Zap } from "lucide-react";

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      id: "ai-understanding",
      number: "01",
      title: "AI Notice Understanding",
      description: "Extract deadlines, requirements and actionable tasks from notices.",
      icon: <BrainCircuit className="w-6 h-6 text-indigo-400" />,
      badge: "Intelligent Extraction",
    },
    {
      id: "personalized-priorities",
      number: "02",
      title: "Personalized Priorities",
      description: "Identify what actually applies to each student.",
      icon: <Filter className="w-6 h-6 text-violet-400" />,
      badge: "Targeted Filtering",
    },
    {
      id: "adaptive-action-plan",
      number: "03",
      title: "Adaptive Action Plan",
      description: "Priorities and schedules adapt when students add or change tasks.",
      icon: <Zap className="w-6 h-6 text-sky-400" />,
      badge: "Dynamic Scheduling",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/[0.04] backdrop-blur-md text-indigo-400 text-xs font-semibold border border-white/[0.08] shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Core Capabilities
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Built for Student Clarity
          </h2>

          <p className="text-base text-slate-400 leading-relaxed font-normal">
            Eliminating information overload so students focus purely on execution.
          </p>
        </div>

        {/* 3 Dark Frosted Glass Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="glass-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Top Specular Rim */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="space-y-4">
                {/* Header with Icon and Number */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/[0.08] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {feature.number}
                  </span>
                </div>

                {/* Badge & Title */}
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-indigo-400 uppercase">
                    {feature.badge}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white mt-1">
                    {feature.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Autonomous Engine</span>
                <span className="group-hover:text-indigo-400 transition-colors font-semibold">
                  Learn more →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
