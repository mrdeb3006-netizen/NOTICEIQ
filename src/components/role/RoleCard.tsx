import React from "react";
import { Button } from "../ui/Button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export interface RoleCardProps {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  description: string;
  href: string;
  features: string[];
  popular?: boolean;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  id,
  title,
  emoji,
  tagline,
  description,
  href,
  features,
  popular,
}) => {
  return (
    <div
      className={`glass-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden group ${
        popular
          ? "border-indigo-500/40 shadow-2xl shadow-indigo-500/10 ring-1 ring-indigo-500/30"
          : ""
      }`}
    >
      {/* Top rim shine */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-lg shadow-indigo-500/30 border border-white/20">
          Most Popular
        </div>
      )}

      <div className="space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="text-4xl p-3 rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/[0.08] shadow-xs group-hover:scale-105 transition-transform inline-block">
            {emoji}
          </div>
          <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
            {tagline}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-white mb-1.5 flex items-center gap-2">
            {title}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed font-normal">
            {description}
          </p>
        </div>

        {/* Feature bullets */}
        <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
          {features.map((feat, idx) => (
            <div key={`${id}-feature-${idx}`} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action button */}
      <div className="pt-6 mt-6 border-t border-white/[0.06]">
        <Button
          href={href}
          variant={popular ? "primary" : "secondary"}
          size="md"
          className="w-full justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors shadow-xs"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
