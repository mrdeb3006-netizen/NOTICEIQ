import React from "react";
import Link from "next/link";
import { BrandWordmark } from "../ui/BrandWordmark";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#090d16]/80 backdrop-blur-2xl mt-auto relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2">
            <BrandWordmark size="sm" />
            <span className="text-xs text-slate-500 hidden sm:inline">
              — From Information to Action.
            </span>
          </div>

          {/* Quick Access Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
            <Link href="/auth/student" className="hover:text-indigo-400 transition-colors">
              Student Login
            </Link>
            <Link href="/auth/institution" className="hover:text-indigo-400 transition-colors">
              Institution Portal
            </Link>
            <Link href="/auth/faculty" className="hover:text-indigo-400 transition-colors">
              Faculty Portal
            </Link>
            <Link href="/institution/register" className="hover:text-indigo-400 transition-colors">
              Register Institution
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
