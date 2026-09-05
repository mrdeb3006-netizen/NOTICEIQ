"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { FacultySidebar } from "@/components/faculty/Sidebar";
import { FacultyHeader } from "@/components/faculty/Header";

export default function FacultyRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login page, render full screen without dashboard shell
  const isLoginPage = pathname === "/faculty/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-40">
        <FacultySidebar />
      </div>

      {/* Mobile Slide Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-slate-900 h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            <FacultySidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <FacultyHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
