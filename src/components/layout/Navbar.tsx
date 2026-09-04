"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { Sparkles, Menu, X, ArrowRight, Layers, Compass, ShieldCheck } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-white/65 border-b border-white/80 shadow-xs shadow-indigo-950/5 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo with glass container */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus:outline-none group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 border border-white/40 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 fill-white/20" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
              Notice<span className="text-indigo-600">IQ</span>
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 leading-none mt-0.5">
              Action Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links with Glass Pills */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-xs text-sm font-medium text-slate-600">
          <Link
            href="/#how-it-works"
            className="px-3.5 py-1.5 rounded-full hover:bg-white/80 hover:text-indigo-600 transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>How It Works</span>
          </Link>
          <Link
            href="/#features"
            className="px-3.5 py-1.5 rounded-full hover:bg-white/80 hover:text-indigo-600 transition-all flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>Features</span>
          </Link>
          <Link
            href="/get-started"
            className="px-3.5 py-1.5 rounded-full hover:bg-white/80 hover:text-indigo-600 transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Portals</span>
          </Link>
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            href="/get-started"
            variant="primary"
            size="sm"
            className="shadow-md shadow-indigo-500/20"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            href="/get-started"
            variant="primary"
            size="sm"
            className="text-xs px-3 py-1.5 shadow-xs"
          >
            Get Started
          </Button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white/60 backdrop-blur-md border border-white/70 hover:bg-white/90 focus:outline-none shadow-xs"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu with Frosted Glass */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/80 bg-white/80 backdrop-blur-2xl px-4 py-5 space-y-3 shadow-xl shadow-indigo-950/5 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl hover:bg-white/80 border border-transparent hover:border-white/80 flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>How It Works</span>
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl hover:bg-white/80 border border-transparent hover:border-white/80 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Features</span>
            </Link>
            <Link
              href="/get-started"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl hover:bg-white/80 border border-transparent hover:border-white/80 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Role Selection</span>
            </Link>
          </nav>
          <div className="pt-2 border-t border-slate-200/50 flex flex-col gap-2">
            <Button
              href="/get-started"
              variant="primary"
              size="md"
              className="w-full justify-center shadow-md shadow-indigo-500/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
