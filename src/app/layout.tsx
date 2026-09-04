import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NoticeIQ — From Information to Action",
  description:
    "AI-powered action management platform for students, schools and colleges. Turn announcements and notices into personalized, actionable task schedules.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-slate-50/90 text-slate-900 antialiased font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
        {/* Ambient Glassmorphism Mesh Orbs */}
        <div className="mesh-glow-container">
          <div className="mesh-orb-1" />
          <div className="mesh-orb-2" />
          <div className="mesh-orb-3" />
        </div>

        {/* App Content Layer */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
