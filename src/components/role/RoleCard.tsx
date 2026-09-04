import React from "react";
import Link from "next/link";
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
      className={`group relative bg-white border rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        popular
          ? "border-indigo-400/80 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-400/30"
          : "border-slate-200 hover:border-slate-300 shadow-sm shadow-slate-200/50"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-semibold tracking-wide uppercase shadow-sm">
          Most Popular
        </div>
      )}

      <div className="space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="text-4xl p-2.5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform inline-block">
            {emoji}
          </div>
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            {tagline}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5 flex items-center gap-2">
            {title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {description}
          </p>
        </div>

        {/* Feature bullets */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action button */}
      <div className="pt-6 mt-6 border-t border-slate-100">
        <Button
          href={href}
          variant={popular ? "primary" : "outline"}
          size="md"
          className="w-full justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
