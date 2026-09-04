"use client";

import { useEffect, useState } from "react";
import {
  Institution,
  Student,
  Faculty,
  Group,
  Notice,
  NoticeAiAnalysis,
  NoticeAiAnalysisStatus,
  InstitutionType,
} from "@/types/institution";
import {
  defaultInstitution,
  initialStudents,
  initialFaculty,
  initialGroups,
  initialNotices,
} from "./mockData";

const STORAGE_KEYS = {
  INSTITUTION: "noticeiq_institution",
  STUDENTS: "noticeiq_students",
  FACULTY: "noticeiq_faculty",
  GROUPS: "noticeiq_groups",
  NOTICES: "noticeiq_notices",
};

// Safe helper for localStorage
function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Failed to persist to localStorage", err);
  }
}

export function useInstitutionData() {
  const [institution, setInstitution] = useState<Institution>(defaultInstitution);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [faculty, setFaculty] = useState<Faculty[]>(initialFaculty);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setInstitution(getStoredItem(STORAGE_KEYS.INSTITUTION, defaultInstitution));
    setStudents(getStoredItem(STORAGE_KEYS.STUDENTS, initialStudents));
    setFaculty(getStoredItem(STORAGE_KEYS.FACULTY, initialFaculty));
    setGroups(getStoredItem(STORAGE_KEYS.GROUPS, initialGroups));
    setNotices(getStoredItem(STORAGE_KEYS.NOTICES, initialNotices));
    setIsLoaded(true);
  }, []);

  const updateInstitution = (updated: Partial<Institution>) => {
    setInstitution((prev) => {
      const next = { ...prev, ...updated };
      setStoredItem(STORAGE_KEYS.INSTITUTION, next);
      return next;
    });
  };

  const addStudent = (newStudent: Omit<Student, "id" | "institutionId" | "joinedDate">) => {
    const student: Student = {
      ...newStudent,
      id: `stu-${Date.now()}`,
      institutionId: institution.id,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setStudents((prev) => {
      const next = [student, ...prev];
      setStoredItem(STORAGE_KEYS.STUDENTS, next);
      return next;
    });
    return student;
  };

  const addMultipleStudents = (newStudents: Array<Omit<Student, "id" | "institutionId" | "joinedDate">>) => {
    const formatted = newStudents.map((s, idx) => ({
      ...s,
      id: `stu-${Date.now()}-${idx}`,
      institutionId: institution.id,
      joinedDate: new Date().toISOString().split("T")[0],
    }));
    setStudents((prev) => {
      const next = [...formatted, ...prev];
      setStoredItem(STORAGE_KEYS.STUDENTS, next);
      return next;
    });
    return formatted.length;
  };

  const addFacultyMember = (newFaculty: Omit<Faculty, "id" | "institutionId" | "joinedDate">) => {
    const member: Faculty = {
      ...newFaculty,
      id: `fac-${Date.now()}`,
      institutionId: institution.id,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setFaculty((prev) => {
      const next = [member, ...prev];
      setStoredItem(STORAGE_KEYS.FACULTY, next);
      return next;
    });
    return member;
  };

  const addGroup = (newGroup: Omit<Group, "id" | "institutionId" | "createdAt">) => {
    const group: Group = {
      ...newGroup,
      id: `grp-${Date.now()}`,
      institutionId: institution.id,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setGroups((prev) => {
      const next = [group, ...prev];
      setStoredItem(STORAGE_KEYS.GROUPS, next);
      return next;
    });
    return group;
  };

  const publishNotice = (newNotice: Omit<Notice, "id" | "institutionId" | "createdAt" | "status" | "publicationDate"> & { publicationDate?: string; deadline?: string }) => {
    const pubDate = newNotice.publicationDate || new Date().toISOString().split("T")[0];
    const notice: Notice = {
      ...newNotice,
      id: `not-${Date.now()}`,
      institutionId: institution.id,
      publicationDate: pubDate,
      date: pubDate,
      status: "published",
      createdBy: newNotice.createdBy || institution.adminName || "Admin",
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      recipientsCount: newNotice.recipientsCount || newNotice.recipientCount || 486,
      recipientCount: newNotice.recipientsCount || newNotice.recipientCount || 486,
    };

    setNotices((prev) => {
      const next = [notice, ...prev];
      setStoredItem(STORAGE_KEYS.NOTICES, next);
      return next;
    });

    return notice;
  };

  const saveDraftNotice = (draftData: Partial<Notice>) => {
    const notice: Notice = {
      id: draftData.id || `not-draft-${Date.now()}`,
      institutionId: institution.id,
      title: draftData.title || "Untitled Draft Notice",
      category: draftData.category || "General",
      content: draftData.content || "",
      targetType: draftData.targetType || "all",
      targetGroup: draftData.targetGroup || "All Students",
      targetDepartment: draftData.targetDepartment,
      targetYear: draftData.targetYear,
      targetClass: draftData.targetClass,
      targetSection: draftData.targetSection,
      targetGroupId: draftData.targetGroupId,
      selectedStudentIds: draftData.selectedStudentIds,
      publicationDate: new Date().toISOString().split("T")[0],
      date: new Date().toISOString().split("T")[0],
      deadline: draftData.deadline,
      eventDate: draftData.eventDate,
      startTime: draftData.startTime,
      endTime: draftData.endTime,
      venue: draftData.venue,
      status: "draft",
      recipientsCount: draftData.recipientsCount || 0,
      recipientCount: draftData.recipientsCount || 0,
      createdBy: draftData.createdBy || institution.adminName || "Admin",
      createdAt: new Date().toISOString(),
      attachmentName: draftData.attachmentName,
      attachmentType: draftData.attachmentType,
      attachmentSize: draftData.attachmentSize,
    };

    setNotices((prev) => {
      const existingIdx = prev.findIndex((n) => n.id === notice.id);
      let next: Notice[];
      if (existingIdx >= 0) {
        next = [...prev];
        next[existingIdx] = notice;
      } else {
        next = [notice, ...prev];
      }
      setStoredItem(STORAGE_KEYS.NOTICES, next);
      return next;
    });

    return notice;
  };

  const archiveNotice = (id: string) => {
    setNotices((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, status: "archived" as const } : n
      );
      setStoredItem(STORAGE_KEYS.NOTICES, next);
      return next;
    });
  };

  const updateNoticeAiAnalysis = (
    noticeId: string,
    analysis: NoticeAiAnalysis,
    status: NoticeAiAnalysisStatus = "ANALYZED"
  ) => {
    setNotices((prev) => {
      const next = prev.map((n) => {
        if (n.id !== noticeId) return n;
        return {
          ...n,
          aiAnalysisStatus: status,
          aiAnalysis: analysis,
          aiSummary: analysis.summary,
          aiNoticeType: analysis.notice_type,
          aiAudience: analysis.audience,
          aiDates: analysis.dates,
          aiRequirements: analysis.requirements,
          aiDocuments: analysis.documents_required,
          aiTasks: analysis.tasks,
          aiConsequences: analysis.consequences,
          aiDependencies: analysis.dependencies,
          aiImportantPoints: analysis.important_points,
          aiConfidence: analysis.confidence,
          aiAnalyzedAt: new Date().toISOString(),
        };
      });
      setStoredItem(STORAGE_KEYS.NOTICES, next);
      return next;
    });
  };

  const approveNoticeAiAnalysis = (noticeId: string) => {
    setNotices((prev) => {
      const next = prev.map((n) => {
        if (n.id !== noticeId) return n;
        return {
          ...n,
          aiAnalysisStatus: "APPROVED" as const,
          aiApprovedAt: new Date().toISOString(),
        };
      });
      setStoredItem(STORAGE_KEYS.NOTICES, next);
      return next;
    });
  };

  return {
    institution,
    students,
    faculty,
    groups,
    notices,
    isLoaded,
    updateInstitution,
    addStudent,
    addMultipleStudents,
    addFacultyMember,
    addGroup,
    publishNotice,
    saveDraftNotice,
    archiveNotice,
    updateNoticeAiAnalysis,
    approveNoticeAiAnalysis,
  };
}


