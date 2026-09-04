"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { AuthCard } from "@/components/ui/AuthCard";

export default function AuthInstitutionRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/institution/register");
  }, [router]);

  return (
    <AuthCard
      title="Create your Institution"
      subtitle="Setting up your NoticeIQ workspace..."
      roleBadge={{
        label: "Institution Onboarding",
        icon: <Building2 className="w-3.5 h-3.5 text-indigo-400" />,
        colorScheme: "indigo",
      }}
      backHref="/auth/institution"
      backLabel="Back to Institution Login"
    >
      <div className="text-center py-6 space-y-4">
        <p className="text-xs text-slate-300">
          Redirecting to the multi-step workspace registration wizard...
        </p>
        <Link
          href="/institution/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          <span>Continue to Registration</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </AuthCard>
  );
}
