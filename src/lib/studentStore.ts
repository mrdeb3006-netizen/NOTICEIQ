"use client";

import { useEffect, useState } from "react";
import { StudentProfile, StudentAccessType } from "@/types/student";
import { Institution, Notice } from "@/types/institution";
import {
  registeredInstitutions,
  initialStudentProfiles,
  initialNotices,
  DEMO_OTP,
} from "./mockData";

const CURRENT_STUDENT_KEY = "noticeiq_current_student";
const ALL_STUDENT_PROFILES_KEY = "noticeiq_student_profiles";

function getStoredStudent(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(CURRENT_STUDENT_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function getStoredAllProfiles(): StudentProfile[] {
  if (typeof window === "undefined") return initialStudentProfiles;
  try {
    const data = localStorage.getItem(ALL_STUDENT_PROFILES_KEY);
    return data ? JSON.parse(data) : initialStudentProfiles;
  } catch {
    return initialStudentProfiles;
  }
}

function setStoredStudent(student: StudentProfile | null): void {
  if (typeof window === "undefined") return;
  try {
    if (student) {
      localStorage.setItem(CURRENT_STUDENT_KEY, JSON.stringify(student));
    } else {
      localStorage.removeItem(CURRENT_STUDENT_KEY);
    }
  } catch (err) {
    console.error("Failed to store current student", err);
  }
}

function setStoredAllProfiles(profiles: StudentProfile[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ALL_STUDENT_PROFILES_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error("Failed to store all student profiles", err);
  }
}

export function useStudentAuth() {
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Default to Debendra Bera if no student is active, to allow direct inspection
    const stored = getStoredStudent() || initialStudentProfiles[0];
    setCurrentStudent(stored);
    setIsLoaded(true);
  }, []);

  // 1. Domain verification for college email
  const verifyCollegeDomain = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      return {
        valid: false,
        error: "Please enter a valid email address.",
      };
    }

    const domainPart = `@${trimmed.split("@")[1]}`;
    
    // Check registered institutions in state or mock data
    let institutionsList = registeredInstitutions;
    if (typeof window !== "undefined") {
      try {
        const storedInst = localStorage.getItem("noticeiq_institution");
        if (storedInst) {
          const parsed = JSON.parse(storedInst);
          if (parsed && !institutionsList.some((i) => i.id === parsed.id)) {
            institutionsList = [parsed, ...institutionsList];
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    const matchedInst = institutionsList.find(
      (inst) =>
        inst.type === "college" &&
        inst.emailDomain &&
        inst.emailDomain.toLowerCase() === domainPart
    );

    if (!matchedInst) {
      return {
        valid: false,
        error: "⚠ This email domain is not registered with NoticeIQ.",
      };
    }

    return {
      valid: true,
      institution: matchedInst,
    };
  };

  // 2. OTP Verification for College Student
  const verifyCollegeOtp = (email: string, otp: string, matchedInstitution: Institution) => {
    if (otp.trim() !== DEMO_OTP) {
      return {
        success: false,
        error: "Incorrect verification code. Use demo code: 123456",
      };
    }

    const allProfiles = getStoredAllProfiles();
    const existing = allProfiles.find(
      (p) => p.email && p.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existing) {
      return {
        success: true,
        studentFound: true,
        student: existing,
      };
    }

    // Email is verified domain, but not pre-enrolled in directory
    return {
      success: true,
      studentFound: false,
      institution: matchedInstitution,
      email: email.trim(),
    };
  };

  // 3. School Student ID & PIN verification
  const verifySchoolStudent = (studentId: string, _password?: string) => {
    const trimmedId = studentId.trim().toUpperCase();
    const allProfiles = getStoredAllProfiles();

    const existing = allProfiles.find(
      (p) => p.studentId && p.studentId.toUpperCase() === trimmedId
    );

    if (!existing) {
      return {
        success: false,
        error: "⚠ Student ID not found. Please check your ID or contact your school.",
      };
    }

    return {
      success: true,
      student: existing,
    };
  };

  // 4. Set current logged in student
  const loginStudent = (student: StudentProfile) => {
    setCurrentStudent(student);
    setStoredStudent(student);
  };

  // 5. Update preferences on onboarding or profile page
  const updateStudentPreferences = (preferences: {
    interests: string[];
    preferredStartTime: string;
    preferredEndTime: string;
    availableDailyHours: string;
  }) => {
    if (!currentStudent) return;

    const updated: StudentProfile = {
      ...currentStudent,
      ...preferences,
      onboardingCompleted: true,
    };

    setCurrentStudent(updated);
    setStoredStudent(updated);

    // Also update in all profiles list
    const all = getStoredAllProfiles();
    const nextAll = all.map((p) => (p.id === updated.id ? updated : p));
    setStoredAllProfiles(nextAll);

    return updated;
  };

  // 6. Get targeted notices matching the student
  const getStudentNotices = (studentOverride?: StudentProfile | null): Array<Notice & { isRead: boolean }> => {
    const targetStudent = studentOverride !== undefined ? studentOverride : currentStudent;
    if (!targetStudent) return [];

    let allNotices: Notice[] = initialNotices;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("noticeiq_notices");
        if (stored) {
          allNotices = JSON.parse(stored);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Read notices cache
    let readNoticeIds: string[] = [];
    if (typeof window !== "undefined") {
      try {
        const storedRead = localStorage.getItem(`noticeiq_read_notices_${targetStudent.id}`);
        if (storedRead) {
          readNoticeIds = JSON.parse(storedRead);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Filter published notices that target this student
    const matched = allNotices.filter((notice) => {
      if (notice.status !== "published") return false;

      // 1. All students broadcast
      if (notice.targetType === "all" || notice.targetGroup === "All Students") {
        return true;
      }

      // 2. Selected students
      if (notice.targetType === "selected" && notice.selectedStudentIds) {
        return notice.selectedStudentIds.includes(targetStudent.id);
      }

      // 3. College student matching
      if (targetStudent.type === "college") {
        const studentDept = targetStudent.department?.toUpperCase();
        const studentYear = targetStudent.year?.toUpperCase();
        const studentSec = targetStudent.section?.toUpperCase();

        const noticeDept = notice.targetDepartment?.toUpperCase();
        const noticeYear = notice.targetYear?.toUpperCase();
        const noticeSec = notice.targetSection?.toUpperCase();

        if (notice.targetType === "department" && noticeDept) {
          return studentDept === noticeDept;
        }

        if (notice.targetType === "year") {
          const deptMatch = !noticeDept || studentDept === noticeDept;
          const yearMatch = !noticeYear || studentYear?.includes(noticeYear) || noticeYear?.includes(studentYear || "");
          return deptMatch && yearMatch;
        }

        if (notice.targetType === "section") {
          const deptMatch = !noticeDept || studentDept === noticeDept;
          const yearMatch = !noticeYear || studentYear?.includes(noticeYear) || noticeYear?.includes(studentYear || "");
          const secMatch = !noticeSec || studentSec === noticeSec || noticeSec === "ALL";
          return deptMatch && yearMatch && secMatch;
        }

        // Target group string matching fallback
        const tg = notice.targetGroup.toUpperCase();
        if (studentDept && tg.includes(studentDept)) {
          if (studentYear && (tg.includes("ALL YEARS") || tg.includes(studentYear))) {
            return true;
          }
        }
      }

      // 4. School student matching
      if (targetStudent.type === "school") {
        const studentClass = targetStudent.class?.toUpperCase();
        const studentSec = targetStudent.section?.toUpperCase();

        const noticeClass = notice.targetClass?.toUpperCase();
        const noticeSec = notice.targetSection?.toUpperCase();

        if (noticeClass && studentClass?.includes(noticeClass)) {
          if (!noticeSec || noticeSec === "ALL" || studentSec === noticeSec) {
            return true;
          }
        }

        const tg = notice.targetGroup.toUpperCase();
        if (studentClass && tg.includes(studentClass)) {
          return true;
        }
      }

      return false;
    });

    return matched.map((n) => ({
      ...n,
      isRead: readNoticeIds.includes(n.id),
    }));
  };

  // 7. Mark notice as read
  const markNoticeAsRead = (noticeId: string) => {
    if (!currentStudent || typeof window === "undefined") return;
    try {
      const key = `noticeiq_read_notices_${currentStudent.id}`;
      const storedRead = localStorage.getItem(key);
      const readNoticeIds: string[] = storedRead ? JSON.parse(storedRead) : [];
      if (!readNoticeIds.includes(noticeId)) {
        const next = [...readNoticeIds, noticeId];
        localStorage.setItem(key, JSON.stringify(next));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Logout
  const logoutStudent = () => {
    setCurrentStudent(null);
    setStoredStudent(null);
  };

  return {
    currentStudent,
    isLoaded,
    verifyCollegeDomain,
    verifyCollegeOtp,
    verifySchoolStudent,
    loginStudent,
    updateStudentPreferences,
    getStudentNotices,
    markNoticeAsRead,
    logoutStudent,
  };
}

