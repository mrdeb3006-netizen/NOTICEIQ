import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { RolePortalsSection } from "@/components/landing/RolePortalsSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <RolePortalsSection />
        <WorkflowSection />
        <FeatureGrid />
      </main>
      <Footer />
    </div>
  );
}
