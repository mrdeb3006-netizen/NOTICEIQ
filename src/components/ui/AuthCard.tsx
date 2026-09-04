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
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    violet: "bg-violet-50 text-violet-700 border-violet-200/80",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    amber: "bg-amber-50 text-amber-700 border-amber-200/80",
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-subtle-glow pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className={`w-full ${maxWidthClasses[maxWidth]} relative z-10 space-y-6`}>
        {/* Top Header / Brand & Back link */}
        <div className="flex items-center justify-between px-1">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{backLabel}</span>
          </Link>

          <Link href="/" className="inline-flex items-center gap-1.5 group">
            <span className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
              N
            </span>
            <span className="text-xs font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              Notice<span className="text-indigo-600">IQ</span>
            </span>
          </Link>
        </div>

        {/* Elevated Main Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 p-7 sm:p-9 transition-all">
          {/* Role Badge & Header */}
          <div className="text-center space-y-2 mb-7">
            {roleBadge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mb-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    badgeColors[roleBadge.colorScheme || "indigo"]
                  }`}
                >
                  {roleBadge.icon}
                  {roleBadge.label}
                </span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form / Content */}
          <div className="space-y-6">{children}</div>

          {/* Card Footer */}
          {footer && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
              {footer}
            </div>
          )}
        </div>

        {/* Security / System status footer */}
        <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>NoticeIQ Secure Portal • Encrypted & Institution-Verified</span>
        </div>
      </div>
    </div>
  );
};
