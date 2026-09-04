"use client";

import { useEffect, useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type InstitutionRole = "admin" | "faculty" | "hod";

export interface FacultyRoleProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  roleTitle: string;
}

interface RoleState {
  role: InstitutionRole;
  facultyProfile: FacultyRoleProfile | null;
}

const STORAGE_KEY_ROLE = "noticeiq_active_role";
const STORAGE_KEY_PROFILE = "noticeiq_role_profile";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors
  }
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useActiveRole() {
  const [roleState, setRoleState] = useState<RoleState>({
    role: "admin",
    facultyProfile: null,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    const savedRole = getStored<InstitutionRole>(STORAGE_KEY_ROLE, "admin");
    const savedProfile = getStored<FacultyRoleProfile | null>(
      STORAGE_KEY_PROFILE,
      null
    );
    setRoleState({ role: savedRole, facultyProfile: savedProfile });
  }, []);

  const setRole = useCallback(
    (newRole: InstitutionRole, profile?: FacultyRoleProfile) => {
      const newProfile = newRole === "admin" ? null : (profile ?? null);
      setRoleState({ role: newRole, facultyProfile: newProfile });
      saveStored(STORAGE_KEY_ROLE, newRole);
      saveStored(STORAGE_KEY_PROFILE, newProfile);
    },
    []
  );

  return {
    role: roleState.role,
    facultyProfile: roleState.facultyProfile,
    setRole,
    isAdmin: roleState.role === "admin",
    isFaculty: roleState.role === "faculty",
    isHOD: roleState.role === "hod",
    isInstitutionStaff:
      roleState.role === "faculty" || roleState.role === "hod",
  };
}
