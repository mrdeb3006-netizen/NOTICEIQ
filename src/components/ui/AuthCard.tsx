import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BrandWordmark } from "./BrandWordmark";

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
  backHref = "/",
  backLabel = "Back to Home",
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
    indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className={`w-full ${maxWidthClasses[maxWidth]} relative z-10 space-y-6`}>
        {/* Top Header / Brand Wordmark & Back link */}
        <div className="flex items-center justify-between px-1">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all shadow-xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{backLabel}</span>
          </Link>

          <BrandWordmark size="sm" />
        </div>

        {/* Elevated Dark Frosted Glass Main Card */}
        <div className="glass-card-static rounded-3xl p-7 sm:p-9 relative">
          {/* Subtle top rim light */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

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

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed font-normal">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form / Content */}
          <div className="space-y-6">{children}</div>

          {/* Card Footer */}
          {footer && (
            <div className="mt-8 pt-6 border-t border-white/[0.08] text-center text-xs text-slate-400">
              {footer}
            </div>
          )}
        </div>

        {/* Security status footer */}
        <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <div className="px-3.5 py-1 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.07] shadow-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>NoticeIQ Secure Portal • Encrypted & Institution-Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
