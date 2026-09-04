import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export interface AuthCardProps {
  title: string;
  subtitle?: string;
  roleBadge?: {
    label: string;
    icon?: React.ReactNode;
    colorScheme?: "indigo" | "emerald" | "amber" | "violet";
  };
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  roleBadge,
  backHref = "/get-started",
  backLabel = "Back to role selection",
  children,
  footer,
  maxWidth = "md",
}) => {
  const maxWidthClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
  };

  const badgeColors = {
    indigo: "bg-indigo-50/80 text-indigo-700 border-indigo-200/80",
    violet: "bg-violet-50/80 text-violet-700 border-violet-200/80",
    emerald: "bg-emerald-50/80 text-emerald-700 border-emerald-200/80",
    amber: "bg-amber-50/80 text-amber-700 border-amber-200/80",
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className={`w-full ${maxWidthClasses[maxWidth]} relative z-10 space-y-6`}>
        {/* Top Header / Brand & Back link with Glass Pill */}
        <div className="flex items-center justify-between px-1">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-md border border-white/70 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all shadow-xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{backLabel}</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-md border border-white/70 shadow-xs group hover:bg-white/80 transition-all"
          >
            <span className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
              N
            </span>
            <span className="text-xs font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              Notice<span className="text-indigo-600">IQ</span>
            </span>
          </Link>
        </div>

        {/* Elevated Frosted Glass Main Card */}
        <div className="glass-card-static rounded-3xl p-7 sm:p-9 relative">
          {/* Subtle inner top rim light */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          {/* Role Badge & Header */}
          <div className="text-center space-y-2 mb-7">
            {roleBadge && (
              <div className="inline-flex items-center gap-1.5 mb-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs ${
                    badgeColors[roleBadge.colorScheme || "indigo"]
                  }`}
                >
                  {roleBadge.icon}
                  {roleBadge.label}
                </span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form / Content */}
          <div className="space-y-6">{children}</div>

          {/* Card Footer */}
          {footer && (
            <div className="mt-8 pt-6 border-t border-slate-200/50 text-center text-xs text-slate-500">
              {footer}
            </div>
          )}
        </div>

        {/* Security / System status footer with glass badge */}
        <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <div className="px-3.5 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>NoticeIQ Secure Portal • Encrypted & Institution-Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
