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

import {
  calculateNoticeRelevance,
  getCachedRelevance,
  setCachedRelevance,
  invalidateStudentRelevanceCache,
} from "./relevanceEngine";
import { generateStudentPriorityTasks } from "./priorityEngine";
import { NoticeRelevance, PriorityTask } from "@/types/student";

export type NoticeWithRelevance = Notice & {
  isRead: boolean;
  relevance: NoticeRelevance;
};


export function useStudentAuth() {
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [allStudents, setAllStudents] = useState<StudentProfile[]>(initialStudentProfiles);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Default to Debendra Bera if no student is active, to allow direct inspection
    const stored = getStoredStudent() || initialStudentProfiles[0];
    const storedProfiles = getStoredAllProfiles();
    setCurrentStudent(stored);
    setAllStudents(storedProfiles);
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

  // 4b. Switch persona quickly for testing
  const switchStudentPersona = (studentId: string) => {
    const profiles = getStoredAllProfiles();
    const target = profiles.find((p) => p.id === studentId);
    if (target) {
      setCurrentStudent(target);
      setStoredStudent(target);
      return target;
    }
    return null;
  };

  // 5. Update preferences on onboarding or profile page (institution fields are immutable)
  const updateStudentPreferences = (preferences: {
    interests: string[];
    preferredStartTime: string;
    preferredEndTime: string;
    availableDailyHours: string;
  }) => {
    if (!currentStudent) return;

    // Student can only update their personal preferences, NOT institution credentials
    const updated: StudentProfile = {
      ...currentStudent,
      interests: preferences.interests,
      preferredStartTime: preferences.preferredStartTime,
      preferredEndTime: preferences.preferredEndTime,
      availableDailyHours: preferences.availableDailyHours,
      onboardingCompleted: true,
    };

    setCurrentStudent(updated);
    setStoredStudent(updated);

    // Invalidate cached relevance for this student so recalculation happens fresh
    invalidateStudentRelevanceCache(updated.id);

    // Also update in all profiles list
    const all = getStoredAllProfiles();
    const nextAll = all.map((p) => (p.id === updated.id ? updated : p));
    setStoredAllProfiles(nextAll);
    setAllStudents(nextAll);

    return updated;
  };

  // 6. Get all notices with calculated NoticeRelevance
  const getStudentNoticesWithRelevance = (
    studentOverride?: StudentProfile | null
  ): NoticeWithRelevance[] => {
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

    const publishedNotices = allNotices.filter((n) => n.status === "published");

    return publishedNotices.map((notice) => {
      // Check cache first
      let relevance = getCachedRelevance(notice.id, targetStudent.id);
      if (!relevance) {
        relevance = calculateNoticeRelevance(notice, targetStudent);
        setCachedRelevance(relevance);
      }

      return {
        ...notice,
        isRead: readNoticeIds.includes(notice.id),
        relevance,
      };
    });
  };

  // Legacy compatibility helper
  const getStudentNotices = (studentOverride?: StudentProfile | null): Array<Notice & { isRead: boolean }> => {
    const withRel = getStudentNoticesWithRelevance(studentOverride);
    return withRel.filter((n) => n.relevance.relevance !== "NOT_RELEVANT");
  };

  // 7. Completed tasks state
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentStudent) return;
    try {
      const stored = localStorage.getItem(`noticeiq_completed_tasks_${currentStudent.id}`);
      if (stored) {
        setCompletedTaskIds(JSON.parse(stored));
      } else {
        setCompletedTaskIds([]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentStudent?.id]);

  const toggleTaskComplete = (taskId: string) => {
    if (!currentStudent || typeof window === "undefined") return;
    try {
      const key = `noticeiq_completed_tasks_${currentStudent.id}`;
      const stored = localStorage.getItem(key);
      const currentCompleted: string[] = stored ? JSON.parse(stored) : [];
      let nextCompleted: string[] = [];
      if (currentCompleted.includes(taskId)) {
        nextCompleted = currentCompleted.filter((id) => id !== taskId);
      } else {
        nextCompleted = [...currentCompleted, taskId];
      }
      localStorage.setItem(key, JSON.stringify(nextCompleted));
      setCompletedTaskIds(nextCompleted);
    } catch (e) {
      console.error(e);
    }
  };

  const resetTaskCompletions = () => {
    if (!currentStudent || typeof window === "undefined") return;
    try {
      const key = `noticeiq_completed_tasks_${currentStudent.id}`;
      localStorage.removeItem(key);
      setCompletedTaskIds([]);
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Get Prioritized Tasks (Step 7 Priority Engine)
  const getStudentPriorityTasks = (studentOverride?: StudentProfile | null): PriorityTask[] => {
    const targetStudent = studentOverride !== undefined ? studentOverride : currentStudent;
    if (!targetStudent) return [];

    let activeCompleted = completedTaskIds;
    if (typeof window !== "undefined" && targetStudent.id !== currentStudent?.id) {
      try {
        const stored = localStorage.getItem(`noticeiq_completed_tasks_${targetStudent.id}`);
        if (stored) activeCompleted = JSON.parse(stored);
        else activeCompleted = [];
      } catch {
        activeCompleted = [];
      }
    }

    const noticesWithRel = getStudentNoticesWithRelevance(targetStudent);
    return generateStudentPriorityTasks(targetStudent, noticesWithRel, activeCompleted);
  };

  // 9. Mark notice as read
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

  // 10. Logout
  const logoutStudent = () => {
    setCurrentStudent(null);
    setStoredStudent(null);
  };

  return {
    currentStudent,
    allStudents,
    isLoaded,
    completedTaskIds,
    verifyCollegeDomain,
    verifyCollegeOtp,
    verifySchoolStudent,
    loginStudent,
    switchStudentPersona,
    updateStudentPreferences,
    getStudentNoticesWithRelevance,
    getStudentNotices,
    getStudentPriorityTasks,
    toggleTaskComplete,
    resetTaskCompletions,
    markNoticeAsRead,
    logoutStudent,
  };
}



