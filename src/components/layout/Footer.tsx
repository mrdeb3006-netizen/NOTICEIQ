import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#090d16]/80 backdrop-blur-2xl mt-auto relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs border border-white/20">
              <Sparkles className="w-3.5 h-3.5 fill-white/20" />
            </div>
            <span className="text-sm font-extrabold text-white tracking-tight">
              Notice<span className="text-indigo-400">IQ</span>
            </span>
            <span className="text-xs text-slate-500 ml-2">
              — From Information to Action.
            </span>
          </div>

          {/* Quick Access Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
            <Link href="/auth/student" className="hover:text-indigo-400 transition-colors">
              Student Portal
            </Link>
            <Link href="/auth/institution" className="hover:text-indigo-400 transition-colors">
              Institution Portal
            </Link>
            <Link href="/auth/faculty" className="hover:text-indigo-400 transition-colors">
              Faculty Portal
            </Link>
            <Link href="/get-started" className="hover:text-indigo-400 transition-colors">
              Get Started
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-500 font-normal">
            © {new Date().getFullYear()} NoticeIQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
