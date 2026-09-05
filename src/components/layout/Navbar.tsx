"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandWordmark } from "../ui/BrandWordmark";
import { Button } from "../ui/Button";
import {
  Menu,
  X,
  Layers,
  Compass,
  GraduationCap,
  Building2,
  BookOpen,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#090d16]/80 border-b border-white/[0.08] shadow-lg shadow-black/20 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <BrandWordmark size="md" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.08] shadow-xs text-xs font-medium text-slate-300">
          <Link
            href="/#how-it-works"
            className="px-3.5 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-white transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>How It Works</span>
          </Link>
          <Link
            href="/#features"
            className="px-3.5 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-white transition-all flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>Features</span>
          </Link>
          <Link
            href="/#portals"
            className="px-3.5 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-white transition-all flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <span>Portals</span>
          </Link>
        </nav>

        {/* Direct Authentication Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/faculty/login"
            className="text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 transition-colors"
          >
            Faculty
          </Link>
          <Link
            href="/auth/institution"
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
          >
            Institution
          </Link>
          <Button
            href="/auth/student"
            variant="primary"
            size="sm"
            className="shadow-md shadow-indigo-500/20 text-xs px-3.5 py-1.5"
            leftIcon={<GraduationCap className="w-3.5 h-3.5" />}
          >
            Student Login
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            href="/auth/student"
            variant="primary"
            size="sm"
            className="text-xs px-3 py-1.5"
          >
            Student Login
          </Button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/[0.05] backdrop-blur-md border border-white/[0.1] hover:bg-white/[0.1] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu with Direct Auth Links */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#090d16]/95 backdrop-blur-2xl px-4 py-5 space-y-4 shadow-2xl shadow-black animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-200">
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] flex items-center gap-2.5 transition-colors"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>How It Works</span>
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] flex items-center gap-2.5 transition-colors"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Features</span>
            </Link>
            <Link
              href="/#portals"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] flex items-center gap-2.5 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Role Portals</span>
            </Link>
          </nav>

          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <Button
              href="/auth/student"
              variant="primary"
              size="md"
              className="w-full justify-center shadow-lg shadow-indigo-500/25"
              leftIcon={<GraduationCap className="w-4 h-4" />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Student Login
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                href="/auth/institution"
                variant="secondary"
                size="sm"
                className="w-full justify-center text-xs"
                leftIcon={<Building2 className="w-3.5 h-3.5" />}
                onClick={() => setMobileMenuOpen(false)}
              >
                Institution
              </Button>
              <Button
                href="/faculty/login"
                variant="secondary"
                size="sm"
                className="w-full justify-center text-xs"
                leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                onClick={() => setMobileMenuOpen(false)}
              >
                Faculty
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
