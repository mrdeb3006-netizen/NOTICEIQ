"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  FacultyMember,
  FacultyScheduleItem,
  FacultyMessage,
  FacultyNotification,
  FacultyRole,
  FacultySentNoticeStats,
} from "@/types/faculty";
import { Notice } from "@/types/institution";
import { initialNotices } from "./mockData";

// ─────────────────────────────────────────────────────────────
// Storage Keys
// ─────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  CURRENT_FACULTY: "noticeiq_current_faculty",
  SCHEDULE: "noticeiq_faculty_schedule",
  MESSAGES: "noticeiq_faculty_messages",
  NOTIFICATIONS: "noticeiq_faculty_notifications",
  NOTICES: "noticeiq_notices",
  STUDENT_PROFILES: "noticeiq_student_profiles",
};

// ─────────────────────────────────────────────────────────────
// Demo Faculty Personas
// ─────────────────────────────────────────────────────────────
export const DEMO_FACULTY_MEMBERS: FacultyMember[] = [
  {
    id: "fac-arindam",
    institutionId: "inst-future-01",
    facultyId: "CSE-F-102",
    name: "Prof. Arindam Sen",
    email: "arindam.sen@futurecollege.ac.in",
    department: "Computer Science & Engineering",
    designation: "Assistant Professor",
    role: "FACULTY",
    subjects: ["Data Structures", "Java Programming"],
    assignedClasses: ["CSE 1st Year A", "CSE 1st Year B"],
    assignedSections: [
      {
        department: "CSE",
        year: "1st Year",
        section: "A",
        subject: "Data Structures",
        studentCount: 64,
      },
      {
        department: "CSE",
        year: "1st Year",
        section: "B",
        subject: "Java Programming",
        studentCount: 62,
      },
    ],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98300 98765",
    officeRoom: "Room 208, Academic Block A",
    joinedDate: "2021-08-15",
    status: "active",
  },
  {
    id: "fac-ananya",
    institutionId: "inst-future-01",
    facultyId: "CSE-HOD-001",
    name: "Dr. Ananya Sen",
    email: "ananya.sen@futurecollege.ac.in",
    department: "Computer Science & Engineering",
    designation: "Head of Department",
    role: "HOD",
    subjects: ["Advanced Algorithms", "Department Governance"],
    assignedClasses: [
      "CSE 1st Year A",
      "CSE 1st Year B",
      "CSE 2nd Year A",
      "CSE 3rd Year A",
      "CSE 4th Year A",
    ],
    assignedSections: [
      {
        department: "CSE",
        year: "1st Year",
        section: "A",
        subject: "Advanced Algorithms",
        studentCount: 64,
      },
      {
        department: "CSE",
        year: "All Years",
        section: "Department-wide",
        subject: "Department Governance",
        studentCount: 256,
      },
    ],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98301 22334",
    officeRoom: "HOD Office, CSE Block, 1st Floor",
    joinedDate: "2019-07-10",
    status: "active",
  },
];

// ─────────────────────────────────────────────────────────────
// Initial Demo Schedules
// ─────────────────────────────────────────────────────────────
export const INITIAL_FACULTY_SCHEDULES: FacultyScheduleItem[] = [
  // Prof. Arindam - Today (Saturday / Day 1)
  {
    id: "sch-arindam-01",
    facultyId: "fac-arindam",
    dayOfWeek: "Saturday",
    date: "2026-09-05",
    timeSlot: "09:00 – 10:00",
    startTime: "09:00",
    endTime: "10:00",
    subject: "Data Structures",
    department: "CSE",
    year: "1st Year",
    section: "A",
    room: "Room 204",
    classType: "Lecture",
    isUpcoming: false,
    topic: "Binary Trees & BST Traversals",
  },
  {
    id: "sch-arindam-02",
    facultyId: "fac-arindam",
    dayOfWeek: "Saturday",
    date: "2026-09-05",
    timeSlot: "11:00 – 12:00",
    startTime: "11:00",
    endTime: "12:00",
    subject: "Java Programming",
    department: "CSE",
    year: "1st Year",
    section: "B",
    room: "Room 301",
    classType: "Lecture",
    isUpcoming: true,
    topic: "Exception Handling & Collections Framework",
  },
  {
    id: "sch-arindam-03",
    facultyId: "fac-arindam",
    dayOfWeek: "Saturday",
    date: "2026-09-05",
    timeSlot: "14:00 – 16:00",
    startTime: "14:00",
    endTime: "16:00",
    subject: "Data Structures Lab",
    department: "CSE",
    year: "1st Year",
    section: "A",
    room: "Computing Lab 3",
    classType: "Lab",
    isUpcoming: true,
    topic: "Implementation of Linked Lists in C/C++",
  },
  {
    id: "sch-arindam-04",
    facultyId: "fac-arindam",
    dayOfWeek: "Saturday",
    date: "2026-09-05",
    timeSlot: "16:30 – 17:30",
    startTime: "16:30",
    endTime: "17:30",
    subject: "Tutorial & Mentoring",
    department: "CSE",
    year: "1st Year",
    section: "A & B",
    room: "Room 208",
    classType: "Tutorial",
    isUpcoming: true,
    topic: "Doubts Resolution for Mid-Term IA",
  },

  // Prof. Arindam - Tomorrow (Sunday / Next Day)
  {
    id: "sch-arindam-05",
    facultyId: "fac-arindam",
    dayOfWeek: "Monday",
    date: "2026-09-07",
    timeSlot: "10:00 – 11:00",
    startTime: "10:00",
    endTime: "11:00",
    subject: "Data Structures",
    department: "CSE",
    year: "1st Year",
    section: "A",
    room: "Room 204",
    classType: "Lecture",
    isUpcoming: false,
    topic: "AVL Trees and Rotations",
  },
  {
    id: "sch-arindam-06",
    facultyId: "fac-arindam",
    dayOfWeek: "Monday",
    date: "2026-09-07",
    timeSlot: "13:00 – 15:00",
    startTime: "13:00",
    endTime: "15:00",
    subject: "Java Programming Lab",
    department: "CSE",
    year: "1st Year",
    section: "B",
    room: "Software Lab 2",
    classType: "Lab",
    isUpcoming: false,
    topic: "File I/O and Streams",
  },

  // Dr. Ananya (HOD) - Today
  {
    id: "sch-ananya-01",
    facultyId: "fac-ananya",
    dayOfWeek: "Saturday",
    date: "2026-09-05",
    timeSlot: "10:00 – 11:30",
    startTime: "10:00",
    endTime: "11:30",
    subject: "Advanced Algorithms",
    department: "CSE",
    year: "3rd Year",
    section: "A",
    room: "Room 402",
    classType: "Lecture",
    isUpcoming: true,
    topic: "Approximation Algorithms & NP-Completeness",
  },
  {
    id: "sch-ananya-02",
    facultyId: "fac-ananya",
    dayOfWeek: "Saturday",
    date: "2026-09-05",
    timeSlot: "14:30 – 16:00",
    startTime: "14:30",
    endTime: "16:00",
    subject: "Department Faculty Coordination",
    department: "CSE",
    year: "All",
    section: "Faculty",
    room: "Conference Hall 1",
    classType: "Tutorial",
    isUpcoming: true,
    topic: "Curriculum Review & NBA Accreditation Readiness",
  },
];

// ─────────────────────────────────────────────────────────────
// Initial Demo Messages
// ─────────────────────────────────────────────────────────────
export const INITIAL_FACULTY_MESSAGES: FacultyMessage[] = [
  {
    id: "msg-hod-01",
    institutionId: "inst-future-01",
    departmentId: "CSE",
    senderId: "fac-ananya",
    senderName: "Dr. Ananya Sen",
    senderRole: "HOD",
    senderDesignation: "Head of Department",
    recipientType: "DEPARTMENT_FACULTY",
    targetDepartment: "CSE",
    targetGroupLabel: "All CSE Faculty",
    title: "Internal Assessment Marks Submission",
    content:
      "All CSE faculty members are requested to submit internal assessment marks and lab attendance sheets by September 15 for 1st year cohorts.",
    priority: "IMPORTANT",
    category: "Academic Administration",
    createdAt: "2026-09-04T10:30:00Z",
    isRead: false,
  },
  {
    id: "msg-admin-01",
    institutionId: "inst-future-01",
    departmentId: "ALL",
    senderId: "inst-admin",
    senderName: "Dr. Alok Verma (Dean Academics)",
    senderRole: "HOD",
    senderDesignation: "Professor",
    recipientType: "DEPARTMENT_FACULTY",
    targetDepartment: "ALL",
    targetGroupLabel: "All Engineering Faculty",
    title: "Mid-Term Examination Schedule Finalization",
    content:
      "The draft schedule for Mid-Term Examination 2026 has been uploaded to the Academic Portal. Please review your departmental slots.",
    priority: "NORMAL",
    category: "Examination",
    createdAt: "2026-09-03T14:15:00Z",
    isRead: true,
    readAt: "2026-09-04T08:20:00Z",
  },
  {
    id: "msg-arindam-stu-01",
    institutionId: "inst-future-01",
    departmentId: "CSE",
    senderId: "fac-arindam",
    senderName: "Prof. Arindam Sen",
    senderRole: "FACULTY",
    senderDesignation: "Assistant Professor",
    recipientType: "STUDENT_CLASS",
    targetDepartment: "CSE",
    targetYear: "1st Year",
    targetSection: "A",
    targetGroupLabel: "CSE • 1st Year • Section A",
    title: "Lab Notebook Reminder",
    content: "Please bring your spiral-bound lab notebooks for today's 2 PM Data Structures session in Computing Lab 3.",
    priority: "NORMAL",
    category: "Class Communication",
    createdAt: "2026-09-05T07:45:00Z",
    isRead: true,
  },
];

// ─────────────────────────────────────────────────────────────
// Initial Demo Notifications
// ─────────────────────────────────────────────────────────────
export const INITIAL_FACULTY_NOTIFICATIONS: FacultyNotification[] = [
  {
    notificationId: "notif-fac-01",
    recipientId: "fac-arindam",
    senderId: "fac-ananya",
    senderName: "Dr. Ananya Sen (HOD)",
    senderRole: "HOD",
    type: "MESSAGE",
    title: "HOD Instruction: Internal Assessment Marks",
    message: "Please submit internal assessment marks and lab attendance sheets by September 15.",
    priority: "IMPORTANT",
    createdAt: "2026-09-04T10:30:00Z",
    readAt: null,
    relatedMessageId: "msg-hod-01",
    deduplicationKey: "fac-arindam_msg_msg-hod-01",
    actionUrl: "/faculty/messages",
    badgeLabel: "HOD",
  },
  {
    notificationId: "notif-fac-02",
    recipientId: "fac-arindam",
    senderId: "system",
    senderName: "NoticeIQ Schedule",
    senderRole: "SYSTEM",
    type: "SCHEDULE",
    title: "Upcoming Class: Java Programming (11:00 AM)",
    message: "Your lecture for CSE 1st Year Section B starts in Room 301.",
    priority: "NORMAL",
    createdAt: "2026-09-05T08:30:00Z",
    readAt: null,
    relatedScheduleId: "sch-arindam-02",
    deduplicationKey: "fac-arindam_sched_sch-arindam-02_2026-09-05",
    actionUrl: "/faculty/schedule",
    badgeLabel: "Schedule",
  },
  {
    notificationId: "notif-fac-03",
    recipientId: "fac-arindam",
    senderId: "inst-admin",
    senderName: "Institution Admin",
    senderRole: "INSTITUTION",
    type: "NOTICE",
    title: "Institution Notice: Faculty Research Grants 2026",
    message: "Applications for AICTE and State Research Grants are now open through October 10.",
    priority: "LOW",
    createdAt: "2026-09-02T12:00:00Z",
    readAt: "2026-09-03T09:15:00Z",
    relatedNoticeId: "not-001",
    deduplicationKey: "fac-arindam_notice_not-001",
    actionUrl: "/faculty/notices",
    badgeLabel: "Circular",
  },
];

// ─────────────────────────────────────────────────────────────
// Safe LocalStorage Helpers
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
  } catch (err) {
    console.error("Failed to save to localStorage:", key, err);
  }
}

// ─────────────────────────────────────────────────────────────
// Faculty Hook
// ─────────────────────────────────────────────────────────────
export function useFacultyData() {
  const [currentFaculty, setCurrentFaculty] = useState<FacultyMember>(
    DEMO_FACULTY_MEMBERS[0]
  );
  const [allFaculty, setAllFaculty] = useState<FacultyMember[]>(
    DEMO_FACULTY_MEMBERS
  );
  const [scheduleItems, setScheduleItems] = useState<FacultyScheduleItem[]>(
    INITIAL_FACULTY_SCHEDULES
  );
  const [messages, setMessages] = useState<FacultyMessage[]>(
    INITIAL_FACULTY_MESSAGES
  );
  const [notifications, setNotifications] = useState<FacultyNotification[]>(
    INITIAL_FACULTY_NOTIFICATIONS
  );
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate on mount
  useEffect(() => {
    const storedFaculty = getStored<FacultyMember>(
      STORAGE_KEYS.CURRENT_FACULTY,
      DEMO_FACULTY_MEMBERS[0]
    );
    const storedSchedule = getStored<FacultyScheduleItem[]>(
      STORAGE_KEYS.SCHEDULE,
      INITIAL_FACULTY_SCHEDULES
    );
    const storedMessages = getStored<FacultyMessage[]>(
      STORAGE_KEYS.MESSAGES,
      INITIAL_FACULTY_MESSAGES
    );
    const storedNotifications = getStored<FacultyNotification[]>(
      STORAGE_KEYS.NOTIFICATIONS,
      INITIAL_FACULTY_NOTIFICATIONS
    );
    const storedNotices = getStored<Notice[]>(
      STORAGE_KEYS.NOTICES,
      initialNotices
    );

    setCurrentFaculty(storedFaculty);
    setScheduleItems(storedSchedule);
    setMessages(storedMessages);
    setNotifications(storedNotifications);
    setNotices(storedNotices);
    setIsLoaded(true);
  }, []);

  // Switch between Prof. Arindam (Faculty) and Dr. Ananya (HOD)
  const switchFacultyPersona = useCallback((facultyId: string) => {
    const target = DEMO_FACULTY_MEMBERS.find((f) => f.id === facultyId);
    if (target) {
      setCurrentFaculty(target);
      saveStored(STORAGE_KEYS.CURRENT_FACULTY, target);
      return target;
    }
    return null;
  }, []);

  // Filter schedule for current faculty
  const mySchedule = useMemo(() => {
    return scheduleItems.filter((s) => s.facultyId === currentFaculty.id);
  }, [scheduleItems, currentFaculty.id]);

  // Today's schedule
  const todaySchedule = useMemo(() => {
    return mySchedule.filter(
      (s) => s.dayOfWeek === "Saturday" || s.date === "2026-09-05"
    );
  }, [mySchedule]);

  // Upcoming class
  const upcomingClass = useMemo(() => {
    return todaySchedule.find((s) => s.isUpcoming) || todaySchedule[0] || null;
  }, [todaySchedule]);

  // Messages accessible to current faculty
  const myMessages = useMemo(() => {
    return messages.filter((m) => {
      // Sent by me
      if (m.senderId === currentFaculty.id) return true;
      // Directed to department faculty
      if (
        m.recipientType === "DEPARTMENT_FACULTY" &&
        (m.targetDepartment === currentFaculty.department ||
          m.targetDepartment === "CSE" ||
          m.targetDepartment === "ALL")
      ) {
        return true;
      }
      // HOD sees all department communications
      if (currentFaculty.role === "HOD") return true;
      return false;
    });
  }, [messages, currentFaculty]);

  // Unread messages count
  const unreadMessagesCount = useMemo(() => {
    return myMessages.filter((m) => !m.isRead && m.senderId !== currentFaculty.id).length;
  }, [myMessages, currentFaculty.id]);

  // Mark message as read / unread
  const toggleMessageRead = useCallback(
    (messageId: string, forceRead?: boolean) => {
      setMessages((prev) => {
        const next = prev.map((m) => {
          if (m.id === messageId) {
            const nextRead = forceRead !== undefined ? forceRead : !m.isRead;
            return {
              ...m,
              isRead: nextRead,
              readAt: nextRead ? new Date().toISOString() : undefined,
            };
          }
          return m;
        });
        saveStored(STORAGE_KEYS.MESSAGES, next);
        return next;
      });
    },
    []
  );

  // Send a new short message
  const sendMessage = useCallback(
    (newMessage: {
      recipientType: "STUDENT_CLASS" | "DEPARTMENT_FACULTY" | "INDIVIDUAL_STUDENTS";
      targetDepartment: string;
      targetYear?: string;
      targetSection?: string;
      targetGroupLabel: string;
      title: string;
      content: string;
      priority?: "URGENT" | "IMPORTANT" | "NORMAL" | "LOW";
      category?: string;
    }) => {
      const msg: FacultyMessage = {
        id: `msg-${Date.now()}`,
        institutionId: currentFaculty.institutionId,
        departmentId: currentFaculty.department,
        senderId: currentFaculty.id,
        senderName: currentFaculty.name,
        senderRole: currentFaculty.role,
        senderDesignation: currentFaculty.designation,
        recipientType: newMessage.recipientType,
        targetDepartment: newMessage.targetDepartment,
        targetYear: newMessage.targetYear,
        targetSection: newMessage.targetSection,
        targetGroupLabel: newMessage.targetGroupLabel,
        title: newMessage.title,
        content: newMessage.content,
        priority: newMessage.priority || "NORMAL",
        category: newMessage.category || "Class Communication",
        createdAt: new Date().toISOString(),
        isRead: true, // sender has read their own message
      };

      setMessages((prev) => {
        const next = [msg, ...prev];
        saveStored(STORAGE_KEYS.MESSAGES, next);
        return next;
      });

      // If HOD sent to department faculty, generate deduplicated notification for faculty
      if (
        currentFaculty.role === "HOD" &&
        newMessage.recipientType === "DEPARTMENT_FACULTY"
      ) {
        const dedupKey = `fac-arindam_msg_${msg.id}`;
        const facultyNotif: FacultyNotification = {
          notificationId: `notif-${Date.now()}`,
          recipientId: "fac-arindam",
          senderId: currentFaculty.id,
          senderName: `${currentFaculty.name} (${currentFaculty.designation})`,
          senderRole: "HOD",
          type: "MESSAGE",
          title: `HOD Message: ${msg.title}`,
          message: msg.content,
          priority: msg.priority || "IMPORTANT",
          createdAt: new Date().toISOString(),
          readAt: null,
          relatedMessageId: msg.id,
          deduplicationKey: dedupKey,
          actionUrl: "/faculty/messages",
          badgeLabel: "HOD",
        };

        setNotifications((prev) => {
          // Check collision
          if (prev.some((n) => n.deduplicationKey === dedupKey)) return prev;
          const next = [facultyNotif, ...prev];
          saveStored(STORAGE_KEYS.NOTIFICATIONS, next);
          return next;
        });
      }

      return msg;
    },
    [currentFaculty]
  );

  // Faculty Notifications
  const myNotifications = useMemo(() => {
    return notifications.filter(
      (n) => n.recipientId === currentFaculty.id || n.recipientId === "all"
    );
  }, [notifications, currentFaculty.id]);

  const unreadNotificationsCount = useMemo(() => {
    return myNotifications.filter((n) => !n.readAt).length;
  }, [myNotifications]);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) =>
        n.notificationId === notificationId
          ? { ...n, readAt: new Date().toISOString() }
          : n
      );
      saveStored(STORAGE_KEYS.NOTIFICATIONS, next);
      return next;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({
        ...n,
        readAt: n.readAt || new Date().toISOString(),
      }));
      saveStored(STORAGE_KEYS.NOTIFICATIONS, next);
      return next;
    });
  }, []);

  // Publish Notice directly into NoticeIQ shared notice system
  const publishFacultyNotice = useCallback(
    (newNoticeData: {
      title: string;
      category: Notice["category"];
      content: string;
      targetType: Notice["targetType"];
      targetGroup: string;
      targetDepartment?: string;
      targetYear?: string;
      targetSection?: string;
      deadline?: string;
      attachmentName?: string;
      attachmentType?: "pdf" | "image" | "doc";
      attachmentSize?: string;
      aiSummary?: string;
      aiTasks?: Notice["aiTasks"];
      aiRequirements?: string[];
      aiDocuments?: string[];
    }) => {
      const todayIso = new Date().toISOString().split("T")[0];
      const createdNotice: Notice = {
        id: `not-${Date.now()}`,
        institutionId: currentFaculty.institutionId,
        title: newNoticeData.title,
        category: newNoticeData.category,
        content: newNoticeData.content,
        targetType: newNoticeData.targetType,
        targetGroup: newNoticeData.targetGroup,
        targetDepartment: newNoticeData.targetDepartment || currentFaculty.department,
        targetYear: newNoticeData.targetYear,
        targetSection: newNoticeData.targetSection,
        publicationDate: todayIso,
        date: todayIso,
        deadline: newNoticeData.deadline,
        status: "published",
        createdBy: currentFaculty.email,
        source: currentFaculty.role === "HOD" ? "HOD" : "FACULTY",
        authorName: currentFaculty.name,
        authorRole: currentFaculty.designation,
        authorDepartment: currentFaculty.department,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        recipientsCount: 64,
        recipientCount: 64,
        attachmentName: newNoticeData.attachmentName,
        attachmentType: newNoticeData.attachmentType,
        attachmentSize: newNoticeData.attachmentSize,
        aiSummary: newNoticeData.aiSummary,
        aiTasks: newNoticeData.aiTasks,
        aiRequirements: newNoticeData.aiRequirements,
        aiDocuments: newNoticeData.aiDocuments,
        aiAnalysisStatus: newNoticeData.aiTasks?.length ? "APPROVED" : "NOT_ANALYZED",
      };

      // 1. Update local state
      setNotices((prev) => {
        const next = [createdNotice, ...prev];
        saveStored(STORAGE_KEYS.NOTICES, next);
        return next;
      });

      // 2. Also ensure synced to window localStorage for studentStore and institutionStore
      if (typeof window !== "undefined") {
        try {
          const currentList = getStored<Notice[]>(STORAGE_KEYS.NOTICES, initialNotices);
          const nextList = [createdNotice, ...currentList.filter((n) => n.id !== createdNotice.id)];
          saveStored(STORAGE_KEYS.NOTICES, nextList);
        } catch (err) {
          console.error("Failed to sync notice with global store:", err);
        }
      }

      return createdNotice;
    },
    [currentFaculty]
  );

  // Sent Notices by current faculty
  const mySentNotices = useMemo(() => {
    return notices.filter(
      (n) =>
        n.createdBy === currentFaculty.email ||
        n.authorName === currentFaculty.name ||
        (currentFaculty.role === "FACULTY" && n.source === "FACULTY") ||
        (currentFaculty.role === "HOD" && n.source === "HOD")
    );
  }, [notices, currentFaculty]);

  // Aggregate sent notices stats
  const sentNoticesStats: FacultySentNoticeStats[] = useMemo(() => {
    return mySentNotices.map((n, idx) => {
      // Calculate realistic engagement statistics
      const baseReach = n.recipientsCount || 64;
      const readRatio = 0.88 - idx * 0.05;
      const readCount = Math.round(baseReach * Math.max(0.6, readRatio));
      const tasksGenerated = (n.aiTasks?.length || 2) * readCount;
      const completionRate = Math.round(75 + ((idx * 7) % 20));
      const actionsCompleted = Math.round((tasksGenerated * completionRate) / 100);

      return {
        noticeId: n.id,
        title: n.title,
        targetAudience: n.targetGroup,
        publicationDate: n.publicationDate || n.date || "2026-09-05",
        deadline: n.deadline,
        status: n.status,
        studentsReached: baseReach,
        readCount,
        actionsGenerated: tasksGenerated,
        actionsCompleted,
        completionRate,
      };
    });
  }, [mySentNotices]);

  return {
    isLoaded,
    currentFaculty,
    allFaculty,
    switchFacultyPersona,
    isHOD: currentFaculty.role === "HOD",
    isFaculty: currentFaculty.role === "FACULTY",

    // Schedule
    mySchedule,
    todaySchedule,
    upcomingClass,

    // Messages
    myMessages,
    unreadMessagesCount,
    toggleMessageRead,
    sendMessage,

    // Notifications
    myNotifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,

    // Notices
    notices,
    mySentNotices,
    sentNoticesStats,
    publishFacultyNotice,
  };
}
