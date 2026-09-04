"use client";

import React from "react";
import { ShieldOff } from "lucide-react";
import { useActiveRole, type InstitutionRole } from "@/lib/roleStore";

interface RoleGuardProps {
  allowedRoles: InstitutionRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function AccessDeniedCard() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
        <ShieldOff className="w-7 h-7 text-slate-400" />
      </div>
      <p className="text-sm font-bold text-slate-700 mb-1">
        Restricted Access
      </p>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
        This section is available to Institution Admins only. Switch your role
        or contact your administrator for access.
      </p>
    </div>
  );
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
}) => {
  const { role } = useActiveRole();

  if (!allowedRoles.includes(role)) {
    return <>{fallback ?? <AccessDeniedCard />}</>;
  }

  return <>{children}</>;
};
