"use client";

import { useEffect, useState, useCallback } from "react";
import {
  StudentProfile,
  StudentAccessType,
  NoticeRelevance,
  PriorityTask,
  TaskQuadrant,
  TaskStatus,
  StudentImportance,
  TaskContextSuggestion,
  StudentAvailability,
  ScheduleItem,
  DailyPlan,
  ScheduleItemStatus,
  ScheduleGenerationResult,
  StudentNotification,
  StudentNotificationPreferences,
} from "@/types/student";
import { Institution, Notice } from "@/types/institution";
import {
  registeredInstitutions,
  initialStudentProfiles,
  initialNotices,
  DEMO_OTP,
} from "./mockData";
import {
  calculateNoticeRelevance,
  getCachedRelevance,
  setCachedRelevance,
  invalidateStudentRelevanceCache,
} from "./relevanceEngine";
import { generateStudentPriorityTasks } from "./priorityEngine";
import { generateSchedule } from "./scheduling/scheduleEngine";
import {
  syncAndDeduplicateAllNotifications,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "./notifications/reminderEngine";

const CURRENT_STUDENT_KEY = "noticeiq_current_student";
const ALL_STUDENT_PROFILES_KEY = "noticeiq_student_profiles";

export type NoticeWithRelevance = Notice & {
  isRead: boolean;
  relevance: NoticeRelevance;
};

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

// Initial demo personal tasks
const defaultPersonalTasksMap: Record<string, PriorityTask[]> = {
  stu_1: [
    {
      id: "pt_stu_1_buy_folder",
      studentId: "stu_1",
      taskType: "PERSONAL",
      title: "Buy folder for documents",
      description: "Buy plastic document folder for scholarship hardcopy papers.",
      deadline: "September 6, 2026",
      estimatedMinutes: 20,
      studentImportanceOverride: "MEDIUM",
      privateNote: "Buy it from the stationery shop near college gate.",
      useNoteForAI: true,
      aiUrgencyScore: 65,
      aiImportanceScore: 60,
      aiConsequenceScore: 50,
      aiRelevanceScore: 100,
      aiPriorityScore: 66,
      aiQuadrant: "Q2",
      aiPriorityReasons: [
        "• Due in 2 days.",
        "• Marked as MEDIUM importance by you.",
        "• Personal task created directly by you.",
      ],
      urgencyScore: 65,
      importanceScore: 60,
      consequenceScore: 50,
      relevanceScore: 100,
      priorityScore: 66,
      quadrant: "Q2",
      finalPriorityScore: 66,
      finalQuadrant: "Q2",
      priorityReasons: [
        "• Due in 2 days.",
        "• Marked as MEDIUM importance by you.",
        "• Personal task created directly by you.",
      ],
      recommendedAction: "Important goal — schedule time in your study block.",
      status: "TODO",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

export function useStudentAuth() {
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [allStudents, setAllStudents] = useState<StudentProfile[]>(initialStudentProfiles);
  const [isLoaded, setIsLoaded] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [taskVersion, setTaskVersion] = useState(0); // Trigger re-renders when overrides or personal tasks change

  useEffect(() => {
    const stored = getStoredStudent() || initialStudentProfiles[0];
    const storedProfiles = getStoredAllProfiles();
    setCurrentStudent(stored);
    setAllStudents(storedProfiles);
    setIsLoaded(true);
  }, []);

  // Load completed tasks for current student
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

  // Helper to get personal tasks for a student
  const getStoredPersonalTasks = useCallback((studentId: string): PriorityTask[] => {
    if (typeof window === "undefined") return defaultPersonalTasksMap[studentId] || [];
    try {
      const key = `noticeiq_student_personal_tasks_${studentId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default demo personal tasks if available
      if (defaultPersonalTasksMap[studentId]) {
        localStorage.setItem(key, JSON.stringify(defaultPersonalTasksMap[studentId]));
        return defaultPersonalTasksMap[studentId];
      }
      return [];
    } catch {
      return defaultPersonalTasksMap[studentId] || [];
    }
  }, []);

  // Helper to save personal tasks for a student
  const setStoredPersonalTasks = useCallback((studentId: string, tasks: PriorityTask[]): void => {
    if (typeof window === "undefined") return;
    try {
      const key = `noticeiq_student_personal_tasks_${studentId}`;
      localStorage.setItem(key, JSON.stringify(tasks));
      setTaskVersion((v) => v + 1);
    } catch (err) {
      console.error("Failed to save personal tasks", err);
    }
  }, []);

  // Helper to get task overrides map for a student
  const getStoredOverridesMap = useCallback(
    (studentId: string): Record<string, Partial<PriorityTask>> => {
      if (typeof window === "undefined") return {};
      try {
        const key = `noticeiq_student_overrides_${studentId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    },
    []
  );

  // Helper to save task overrides map for a student
  const setStoredOverridesMap = useCallback(
    (studentId: string, map: Record<string, Partial<PriorityTask>>): void => {
      if (typeof window === "undefined") return;
      try {
        const key = `noticeiq_student_overrides_${studentId}`;
        localStorage.setItem(key, JSON.stringify(map));
        setTaskVersion((v) => v + 1);
      } catch (err) {
        console.error("Failed to save overrides map", err);
      }
    },
    []
  );

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
      interests: preferences.interests,
      preferredStartTime: preferences.preferredStartTime,
      preferredEndTime: preferences.preferredEndTime,
      availableDailyHours: preferences.availableDailyHours,
      onboardingCompleted: true,
    };

    setCurrentStudent(updated);
    setStoredStudent(updated);

    invalidateStudentRelevanceCache(updated.id);

    const all = getStoredAllProfiles();
    const nextAll = all.map((p) => (p.id === updated.id ? updated : p));
    setStoredAllProfiles(nextAll);
    setAllStudents(nextAll);

    return updated;
  };

  // 6. Get all notices with calculated NoticeRelevance
  const getStudentNoticesWithRelevance = useCallback(
    (studentOverride?: StudentProfile | null): NoticeWithRelevance[] => {
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
    },
    [currentStudent]
  );

  const getStudentNotices = (studentOverride?: StudentProfile | null): Array<Notice & { isRead: boolean }> => {
    const withRel = getStudentNoticesWithRelevance(studentOverride);
    return withRel.filter((n) => n.relevance.relevance !== "NOT_RELEVANT");
  };

  // 7. Toggle task complete
  const toggleTaskComplete = (taskId: string) => {
    if (!currentStudent || typeof window === "undefined") return;
    try {
      const key = `noticeiq_completed_tasks_${currentStudent.id}`;
      const stored = localStorage.getItem(key);
      const currentCompleted: string[] = stored ? JSON.parse(stored) : [];
      let nextCompleted: string[] = [];
      const isNowCompleted = !currentCompleted.includes(taskId);

      if (!isNowCompleted) {
        nextCompleted = currentCompleted.filter((id) => id !== taskId);
      } else {
        nextCompleted = [...currentCompleted, taskId];
      }
      localStorage.setItem(key, JSON.stringify(nextCompleted));
      setCompletedTaskIds(nextCompleted);

      // Also update status in override / personal task if needed
      if (taskId.startsWith("pt_")) {
        const personalTasks = getStoredPersonalTasks(currentStudent.id);
        const nextTasks = personalTasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: (isNowCompleted ? "COMPLETED" : "TODO") as TaskStatus,
                completedAt: isNowCompleted ? new Date().toISOString() : null,
                updatedAt: new Date().toISOString(),
              }
            : t
        );
        setStoredPersonalTasks(currentStudent.id, nextTasks);
      } else {
        const overrides = getStoredOverridesMap(currentStudent.id);
        overrides[taskId] = {
          ...overrides[taskId],
          status: isNowCompleted ? "COMPLETED" : "TODO",
          completedAt: isNowCompleted ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        };
        setStoredOverridesMap(currentStudent.id, overrides);
      }
      setTaskVersion((v) => v + 1);
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

      // Reset completed status in personal tasks
      const personalTasks = getStoredPersonalTasks(currentStudent.id);
      const nextPersonal = personalTasks.map((t) =>
        t.status === "COMPLETED" ? { ...t, status: "TODO" as TaskStatus, completedAt: null } : t
      );
      setStoredPersonalTasks(currentStudent.id, nextPersonal);

      // Reset in overrides
      const overrides = getStoredOverridesMap(currentStudent.id);
      Object.keys(overrides).forEach((id) => {
        if (overrides[id]?.status === "COMPLETED") {
          overrides[id].status = "TODO";
          overrides[id].completedAt = null;
        }
      });
      setStoredOverridesMap(currentStudent.id, overrides);

      setTaskVersion((v) => v + 1);
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Priority Tasks Engine (Step 7 + Step 8 Control Layer)
  const getStudentPriorityTasks = useCallback(
    (studentOverride?: StudentProfile | null): PriorityTask[] => {
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
      const overridesMap = getStoredOverridesMap(targetStudent.id);
      const personalTasks = getStoredPersonalTasks(targetStudent.id);

      return generateStudentPriorityTasks(
        targetStudent,
        noticesWithRel,
        activeCompleted,
        undefined,
        overridesMap,
        personalTasks
      );
    },
    [currentStudent, completedTaskIds, getStudentNoticesWithRelevance, getStoredOverridesMap, getStoredPersonalTasks, taskVersion]
  );

  // 9. Get Single Task By ID
  const getTaskById = useCallback(
    (taskId: string, studentOverride?: StudentProfile | null): PriorityTask | null => {
      const allTasks = getStudentPriorityTasks(studentOverride);
      return allTasks.find((t) => t.id === taskId) || null;
    },
    [getStudentPriorityTasks]
  );

  // 10. Add Personal Task
  const addPersonalTask = (data: {
    title: string;
    description?: string;
    deadline?: string;
    estimatedMinutes?: number;
    studentImportanceOverride?: StudentImportance | null;
    privateNote?: string;
    useNoteForAI?: boolean;
    blockedByTaskId?: string;
    blockedByTaskTitle?: string;
  }): PriorityTask => {
    if (!currentStudent) throw new Error("No authenticated student");

    const newId = `pt_${currentStudent.id}_${Date.now()}`;
    const personalTasks = getStoredPersonalTasks(currentStudent.id);

    const newTask: PriorityTask = {
      id: newId,
      studentId: currentStudent.id,
      taskType: "PERSONAL",
      title: data.title.trim(),
      description: data.description?.trim(),
      deadline: data.deadline?.trim() || null,
      estimatedMinutes: data.estimatedMinutes || 30,
      studentImportanceOverride: data.studentImportanceOverride || "MEDIUM",
      privateNote: data.privateNote?.trim(),
      useNoteForAI: data.useNoteForAI !== undefined ? data.useNoteForAI : true,
      dependencies: {
        blockedByTaskId: data.blockedByTaskId,
        blockedByTaskTitle: data.blockedByTaskTitle,
        isBlocked: !!data.blockedByTaskId,
        prerequisiteCompleted: false,
      },
      status: "TODO",
      aiUrgencyScore: 50,
      aiImportanceScore: 60,
      aiConsequenceScore: 50,
      aiRelevanceScore: 100,
      aiPriorityScore: 60,
      aiQuadrant: "Q2",
      aiPriorityReasons: ["Personal task created by you."],
      urgencyScore: 50,
      importanceScore: 60,
      consequenceScore: 50,
      relevanceScore: 100,
      priorityScore: 60,
      quadrant: "Q2",
      finalPriorityScore: 60,
      finalQuadrant: "Q2",
      priorityReasons: ["Personal task created by you."],
      recommendedAction: "Important goal — schedule time in your study block.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextList = [newTask, ...personalTasks];
    setStoredPersonalTasks(currentStudent.id, nextList);
    setTaskVersion((v) => v + 1);

    return newTask;
  };

  // 11. Update Task (Handles both AI-generated task representations and Personal tasks)
  const updateTask = (taskId: string, updates: Partial<PriorityTask>) => {
    if (!currentStudent) return;

    if (taskId.startsWith("pt_")) {
      // Personal task update
      const personalTasks = getStoredPersonalTasks(currentStudent.id);
      const nextList = personalTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : t
      );
      setStoredPersonalTasks(currentStudent.id, nextList);
    } else {
      // AI-generated task representation update (stored in student override without altering notice)
      const overrides = getStoredOverridesMap(currentStudent.id);
      overrides[taskId] = {
        ...overrides[taskId],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      setStoredOverridesMap(currentStudent.id, overrides);
    }
    setTaskVersion((v) => v + 1);
  };

  // 12. Delete Personal Task
  const deletePersonalTask = (taskId: string) => {
    if (!currentStudent) return;
    const personalTasks = getStoredPersonalTasks(currentStudent.id);
    const nextList = personalTasks.filter((t) => t.id !== taskId);
    setStoredPersonalTasks(currentStudent.id, nextList);
    setTaskVersion((v) => v + 1);
  };

  // 13. Remove AI Task from Student's Checklist
  const removeAiTask = (taskId: string) => {
    if (!currentStudent) return;
    const overrides = getStoredOverridesMap(currentStudent.id);
    overrides[taskId] = {
      ...overrides[taskId],
      isRemoved: true,
      updatedAt: new Date().toISOString(),
    };
    setStoredOverridesMap(currentStudent.id, overrides);
    setTaskVersion((v) => v + 1);
  };

  // 14. Priority Overrides (Section 10-13)
  const setTaskQuadrantOverride = (taskId: string, quadrant: TaskQuadrant | null) => {
    updateTask(taskId, { studentQuadrantOverride: quadrant });
  };

  const resetTaskQuadrantOverride = (taskId: string) => {
    updateTask(taskId, { studentQuadrantOverride: null });
  };

  const setTaskImportanceOverride = (taskId: string, importance: StudentImportance | null) => {
    updateTask(taskId, { studentImportanceOverride: importance });
  };

  // 15. Private Notes Management (Section 7-9 & 26)
  const updateTaskPrivateNote = (taskId: string, note: string, useNoteForAI: boolean = true) => {
    updateTask(taskId, { privateNote: note, useNoteForAI });
  };

  const applyAiContextSuggestion = (taskId: string, suggestion: TaskContextSuggestion) => {
    const updates: Partial<PriorityTask> = {
      aiContextSuggestion: {
        ...suggestion,
        applied: true,
      },
    };
    if (suggestion.suggestedQuadrant) {
      updates.studentQuadrantOverride = suggestion.suggestedQuadrant;
    }
    updateTask(taskId, updates);
  };

  // 16. Task Status (Section 22)
  const setTaskStatus = (taskId: string, status: TaskStatus) => {
    const isCompleted = status === "COMPLETED";
    if (!currentStudent) return;

    // Sync with completedTaskIds array
    const key = `noticeiq_completed_tasks_${currentStudent.id}`;
    const stored = localStorage.getItem(key);
    const currentCompleted: string[] = stored ? JSON.parse(stored) : [];
    let nextCompleted: string[] = [];

    if (isCompleted && !currentCompleted.includes(taskId)) {
      nextCompleted = [...currentCompleted, taskId];
    } else if (!isCompleted && currentCompleted.includes(taskId)) {
      nextCompleted = currentCompleted.filter((id) => id !== taskId);
    } else {
      nextCompleted = currentCompleted;
    }

    localStorage.setItem(key, JSON.stringify(nextCompleted));
    setCompletedTaskIds(nextCompleted);

    updateTask(taskId, {
      status,
      completedAt: isCompleted ? new Date().toISOString() : null,
    });
  };

  // 17. Mark notice as read
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

  // ============================================================================
  // STEP 9: SMART SCHEDULING METHODS
  // ============================================================================

  // Helper to parse student availability from profile
  const getStudentAvailability = useCallback(
    (studentOverride?: StudentProfile | null): StudentAvailability => {
      const target = studentOverride !== undefined ? studentOverride : currentStudent;
      if (!target) {
        return {
          studentId: "anon",
          preferredStartTime: "18:00",
          preferredEndTime: "22:00",
          availableDailyMinutes: 120,
          bufferPercent: 15,
        };
      }

      // Parse available daily hours (e.g. "2 hours" -> 120, "2.5 hours" -> 150)
      let dailyMins = 120;
      if (target.availableDailyHours) {
        const hrMatch = target.availableDailyHours.match(/([\d.]+)/);
        if (hrMatch) {
          const num = parseFloat(hrMatch[1]);
          dailyMins = Math.round(num * 60);
        }
      }

      return {
        studentId: target.id,
        preferredStartTime: target.preferredStartTime || "18:00",
        preferredEndTime: target.preferredEndTime || "22:00",
        availableDailyMinutes: dailyMins > 0 ? dailyMins : 120,
        bufferPercent: 15,
        daysAvailable: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      };
    },
    [currentStudent]
  );

  // Helper to get stored schedule overrides
  const getStoredScheduleOverrides = useCallback(
    (studentId: string): Record<string, Partial<ScheduleItem>> => {
      if (typeof window === "undefined") return {};
      try {
        const key = `noticeiq_student_schedule_overrides_${studentId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    },
    []
  );

  // Helper to save schedule overrides
  const setStoredScheduleOverrides = useCallback(
    (studentId: string, map: Record<string, Partial<ScheduleItem>>): void => {
      if (typeof window === "undefined") return;
      try {
        const key = `noticeiq_student_schedule_overrides_${studentId}`;
        localStorage.setItem(key, JSON.stringify(map));
        setTaskVersion((v) => v + 1);
      } catch (err) {
        console.error("Failed to save schedule overrides", err);
      }
    },
    []
  );

  // Get Generated Schedule
  const getStudentSchedule = useCallback(
    (
      dateRangeDays: number = 7,
      studentOverride?: StudentProfile | null
    ): ScheduleGenerationResult => {
      const target = studentOverride !== undefined ? studentOverride : currentStudent;
      if (!target) {
        return {
          dailyPlans: [],
          unscheduledTasks: [],
          nextActionItem: null,
          totalPlannedMinutes: 0,
          totalAvailableMinutes: 0,
          conflicts: [],
        };
      }

      const tasks = getStudentPriorityTasks(target);
      const availability = getStudentAvailability(target);
      const overrides = getStoredScheduleOverrides(target.id);

      return generateSchedule(tasks, availability, dateRangeDays, overrides);
    },
    [currentStudent, getStudentPriorityTasks, getStudentAvailability, getStoredScheduleOverrides, taskVersion]
  );

  // Update a schedule item (e.g. move time slot, adjust duration)
  const updateScheduleItem = (itemId: string, updates: Partial<ScheduleItem>) => {
    if (!currentStudent) return;
    const overrides = getStoredScheduleOverrides(currentStudent.id);
    overrides[itemId] = {
      ...overrides[itemId],
      ...updates,
      scheduleOverride: true,
      updatedAt: new Date().toISOString(),
    };
    setStoredScheduleOverrides(currentStudent.id, overrides);
  };

  // Remove an item from the schedule (does not delete task from My Actions)
  const removeScheduleItem = (itemId: string) => {
    if (!currentStudent) return;
    const overrides = getStoredScheduleOverrides(currentStudent.id);
    overrides[itemId] = {
      ...overrides[itemId],
      status: "SKIPPED",
      updatedAt: new Date().toISOString(),
    };
    setStoredScheduleOverrides(currentStudent.id, overrides);
  };

  // Set Schedule Item Status
  const setScheduleItemStatus = (
    itemId: string,
    taskId: string,
    status: ScheduleItemStatus
  ) => {
    if (!currentStudent) return;
    const isCompleted = status === "COMPLETED";

    // Update in schedule override
    updateScheduleItem(itemId, {
      status,
      completedAt: isCompleted ? new Date().toISOString() : null,
    });

    // If marked completed from schedule, mark the underlying task completed as well
    if (isCompleted) {
      toggleTaskComplete(taskId);
    }
  };

  // Regenerate schedule plan
  const regenerateStudentPlan = (dateRangeDays: number = 7): ScheduleGenerationResult => {
    setTaskVersion((v) => v + 1);
    return getStudentSchedule(dateRangeDays);
  };

  // ============================================================================
  // STEP 10: SMART NOTIFICATIONS & REMINDERS STORE
  // ============================================================================

  const getStoredNotifications = useCallback(
    (studentId: string): StudentNotification[] => {
      if (typeof window === "undefined") return [];
      try {
        const key = `noticeiq_student_notifications_${studentId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    },
    []
  );

  const setStoredNotifications = useCallback(
    (studentId: string, notifs: StudentNotification[]): void => {
      if (typeof window === "undefined") return;
      try {
        const key = `noticeiq_student_notifications_${studentId}`;
        localStorage.setItem(key, JSON.stringify(notifs));
        setTaskVersion((v) => v + 1);
      } catch (err) {
        console.error("Failed to save notifications", err);
      }
    },
    []
  );

  const getStudentNotificationPreferences = useCallback(
    (studentOverride?: StudentProfile | null): StudentNotificationPreferences => {
      const target = studentOverride !== undefined ? studentOverride : currentStudent;
      if (!target) return DEFAULT_NOTIFICATION_PREFERENCES;

      if (typeof window === "undefined") {
        return { ...DEFAULT_NOTIFICATION_PREFERENCES, studentId: target.id };
      }
      try {
        const key = `noticeiq_student_notif_prefs_${target.id}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        // Fallback default
      }
      return { ...DEFAULT_NOTIFICATION_PREFERENCES, studentId: target.id };
    },
    [currentStudent]
  );

  const updateStudentNotificationPreferences = useCallback(
    (preferences: Partial<StudentNotificationPreferences>): void => {
      if (!currentStudent || typeof window === "undefined") return;
      try {
        const current = getStudentNotificationPreferences(currentStudent);
        const updated = { ...current, ...preferences, studentId: currentStudent.id };
        const key = `noticeiq_student_notif_prefs_${currentStudent.id}`;
        localStorage.setItem(key, JSON.stringify(updated));
        setTaskVersion((v) => v + 1);
      } catch (err) {
        console.error("Failed to save notification preferences", err);
      }
    },
    [currentStudent, getStudentNotificationPreferences]
  );

  // Sync and get all notifications for student
  const getStudentNotifications = useCallback(
    (studentOverride?: StudentProfile | null): StudentNotification[] => {
      const target = studentOverride !== undefined ? studentOverride : currentStudent;
      if (!target) return [];

      const existing = getStoredNotifications(target.id);
      const noticesWithRel = getStudentNoticesWithRelevance(target);
      const tasks = getStudentPriorityTasks(target);
      const scheduleResult = getStudentSchedule(7, target);
      const prefs = getStudentNotificationPreferences(target);

      const synced = syncAndDeduplicateAllNotifications(
        target,
        noticesWithRel,
        tasks,
        scheduleResult,
        existing,
        prefs
      );

      // Persist if count or items changed
      if (JSON.stringify(synced) !== JSON.stringify(existing) && typeof window !== "undefined") {
        try {
          const key = `noticeiq_student_notifications_${target.id}`;
          localStorage.setItem(key, JSON.stringify(synced));
        } catch (e) {
          console.error("Failed to sync notifications", e);
        }
      }

      return synced;
    },
    [
      currentStudent,
      getStoredNotifications,
      getStudentNoticesWithRelevance,
      getStudentPriorityTasks,
      getStudentSchedule,
      getStudentNotificationPreferences,
      taskVersion,
    ]
  );

  const getUnreadNotificationCount = useCallback(
    (studentOverride?: StudentProfile | null): number => {
      const notifs = getStudentNotifications(studentOverride);
      return notifs.filter((n) => !n.isRead).length;
    },
    [getStudentNotifications]
  );

  const markNotificationAsRead = useCallback(
    (notificationId: string): void => {
      if (!currentStudent) return;
      const existing = getStoredNotifications(currentStudent.id);
      const updated = existing.map((n) =>
        n.id === notificationId || n.deduplicationKey === notificationId
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      );
      setStoredNotifications(currentStudent.id, updated);
    },
    [currentStudent, getStoredNotifications, setStoredNotifications]
  );

  const markAllNotificationsAsRead = useCallback((): void => {
    if (!currentStudent) return;
    const existing = getStoredNotifications(currentStudent.id);
    const updated = existing.map((n) => ({
      ...n,
      isRead: true,
      readAt: n.readAt || new Date().toISOString(),
    }));
    setStoredNotifications(currentStudent.id, updated);
  }, [currentStudent, getStoredNotifications, setStoredNotifications]);

  const deleteNotification = useCallback(
    (notificationId: string): void => {
      if (!currentStudent) return;
      const existing = getStoredNotifications(currentStudent.id);
      const updated = existing.filter(
        (n) => n.id !== notificationId && n.deduplicationKey !== notificationId
      );
      setStoredNotifications(currentStudent.id, updated);
    },
    [currentStudent, getStoredNotifications, setStoredNotifications]
  );

  // 18. Logout
  const logoutStudent = () => {
    setCurrentStudent(null);
    setStoredStudent(null);
  };

  return {
    currentStudent,
    allStudents,
    isLoaded,
    completedTaskIds,
    taskVersion,
    verifyCollegeDomain,
    verifyCollegeOtp,
    verifySchoolStudent,
    loginStudent,
    switchStudentPersona,
    updateStudentPreferences,
    getStudentNoticesWithRelevance,
    getStudentNotices,
    getStudentPriorityTasks,
    getTaskById,
    addPersonalTask,
    updateTask,
    deletePersonalTask,
    removeAiTask,
    setTaskQuadrantOverride,
    resetTaskQuadrantOverride,
    setTaskImportanceOverride,
    updateTaskPrivateNote,
    applyAiContextSuggestion,
    setTaskStatus,
    toggleTaskComplete,
    resetTaskCompletions,
    markNoticeAsRead,
    getStudentAvailability,
    getStudentSchedule,
    updateScheduleItem,
    removeScheduleItem,
    setScheduleItemStatus,
    regenerateStudentPlan,
    getStudentNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getStudentNotificationPreferences,
    updateStudentNotificationPreferences,
    logoutStudent,
  };
}
