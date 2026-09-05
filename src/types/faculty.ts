import { NoticeCategory, NoticePriorityHint } from "./institution";

export type FacultyDesignation =
  | "Professor"
  | "Associate Professor"
  | "Assistant Professor"
  | "Lecturer"
  | "Lab Instructor"
  | "Class Coordinator"
  | "Faculty Coordinator"
  | "Head of Department";

export type FacultyRole = "FACULTY" | "HOD";

export interface AssignedClassInfo {
  department: string;
  year: string;
  section: string;
  subject: string;
  studentCount?: number;
}

export interface FacultyMember {
  id: string;
  institutionId: string;
  facultyId: string; // e.g. "CSE-F-102"
  name: string;
  email: string;
  department: string; // e.g. "Computer Science & Engineering"
  designation: FacultyDesignation;
  role: FacultyRole;
  subjects: string[];
  assignedClasses: string[]; // e.g. ["CSE 1st Year A", "CSE 1st Year B"]
  assignedSections: AssignedClassInfo[];
  avatar?: string;
  phone?: string;
  officeRoom?: string;
  joinedDate: string;
  status: "active" | "invited" | "inactive";
}

export type ClassType = "Lecture" | "Lab" | "Tutorial";

export interface FacultyScheduleItem {
  id: string;
  facultyId: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  date?: string; // e.g. "2026-09-05"
  timeSlot: string; // e.g. "09:00 – 10:00"
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "10:00"
  subject: string; // e.g. "Data Structures"
  department: string; // e.g. "CSE"
  year: string; // e.g. "1st Year"
  section: string; // e.g. "A"
  room: string; // e.g. "Room 204"
  classType: ClassType;
  isUpcoming?: boolean;
  topic?: string;
}

export type MessageRecipientType = "STUDENT_CLASS" | "DEPARTMENT_FACULTY" | "INDIVIDUAL_STUDENTS";

export interface FacultyMessage {
  id: string;
  institutionId: string;
  departmentId: string;
  senderId: string;
  senderName: string;
  senderRole: FacultyRole;
  senderDesignation: FacultyDesignation;
  recipientType: MessageRecipientType;
  targetDepartment: string;
  targetYear?: string;
  targetSection?: string;
  targetGroupLabel: string; // e.g. "CSE • 1st Year • Section A" or "All CSE Faculty"
  title: string;
  content: string;
  priority: "URGENT" | "IMPORTANT" | "NORMAL" | "LOW";
  category?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string;
}

export type FacultyNotificationPriority = "URGENT" | "IMPORTANT" | "NORMAL" | "LOW";

export type FacultyNotificationType = "MESSAGE" | "NOTICE" | "SCHEDULE" | "SYSTEM";

export interface FacultyNotification {
  notificationId: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderRole: string; // "HOD" | "INSTITUTION" | "FACULTY"
  type: FacultyNotificationType;
  title: string;
  message: string;
  priority: FacultyNotificationPriority;
  createdAt: string;
  readAt?: string | null;
  relatedNoticeId?: string;
  relatedMessageId?: string;
  relatedScheduleId?: string;
  deduplicationKey: string;
  actionUrl?: string;
  badgeLabel?: string;
}

export interface FacultySentNoticeStats {
  noticeId: string;
  title: string;
  targetAudience: string;
  publicationDate: string;
  deadline?: string;
  status: "published" | "draft" | "archived" | "scheduled";
  studentsReached: number;
  readCount: number;
  actionsGenerated: number;
  actionsCompleted: number;
  completionRate: number; // percentage e.g. 78
}
