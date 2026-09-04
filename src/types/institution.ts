export type InstitutionType = "school" | "college";

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  location: string;
  website: string;
  logo?: string;
  emailDomain?: string; // e.g. "@futurecollege.ac.in" for colleges
  studentIdPrefix?: string; // e.g. "SCH2026" for schools
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  status: "active" | "pending" | "suspended";
  createdAt: string;
}

export interface Student {
  id: string;
  institutionId: string;
  name: string;
  email?: string;
  studentId?: string;
  department?: string; // CSE, ECE, IT, etc. for colleges
  class?: string; // Grade 9, 10, 11, 12 for schools
  year?: string; // 1st, 2nd, 3rd, 4th
  section: string; // A, B, C
  rollNumber: string;
  status: "active" | "pending" | "inactive";
  joinedDate: string;
}

export interface Faculty {
  id: string;
  institutionId: string;
  name: string;
  email: string;
  department: string;
  role: string; // Professor, Assistant Professor, HOD, Dean, Teacher
  status: "active" | "invited" | "inactive";
  joinedDate: string;
}

export interface Group {
  id: string;
  institutionId: string;
  name: string;
  department?: string;
  year?: string;
  section?: string;
  studentCount: number;
  description?: string;
  createdAt: string;
}

export type NoticeCategory =
  | "Academic"
  | "Examination"
  | "Scholarship"
  | "Event"
  | "Assignment"
  | "Administration"
  | "Placement"
  | "Club / Activity"
  | "General";

export type NoticePriorityHint = "low" | "medium" | "high";

export type NoticeTargetType =
  | "all"
  | "department"
  | "year"
  | "section"
  | "group"
  | "selected";

export type NoticeAiAnalysisStatus =
  | "NOT_ANALYZED"
  | "ANALYZING"
  | "ANALYZED"
  | "APPROVED"
  | "FAILED";

export interface NoticeAiAudience {
  departments: string[];
  years: string[];
  classes: string[];
  sections: string[];
}

export interface NoticeAiDates {
  publication_date: string | null;
  deadline: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

export interface NoticeAiTask {
  id?: string;
  title: string;
  description?: string;
  deadline?: string | null;
  estimated_minutes?: number | null;
}

export interface NoticeAiDependency {
  blocked_task: string;
  required_task: string;
}

export interface NoticeAiAnalysis {
  summary: string;
  notice_type:
    | "ACADEMIC"
    | "EXAMINATION"
    | "SCHOLARSHIP"
    | "ASSIGNMENT"
    | "EVENT"
    | "ADMINISTRATION"
    | "PLACEMENT"
    | "CLUB_ACTIVITY"
    | "GENERAL";
  audience: NoticeAiAudience;
  dates: NoticeAiDates;
  requirements: string[];
  documents_required: string[];
  tasks: NoticeAiTask[];
  consequences: string[];
  dependencies: NoticeAiDependency[];
  important_points: string[];
  confidence: number;
}

export interface Notice {
  id: string;
  institutionId: string;
  title: string;
  category: NoticeCategory;
  priorityHint?: NoticePriorityHint;
  content: string;
  
  // Attachments
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: "pdf" | "image" | "doc";
  attachmentSize?: string;

  // Dates & Schedule
  publicationDate: string;
  date?: string; // alias for publicationDate backwards compatibility
  deadline?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;

  // Targeting & Audience
  targetType: NoticeTargetType;
  targetGroup: string; // Display label (e.g. "CSE • 1st Year • Section A" or "All Students")
  targetDepartment?: string;
  targetYear?: string;
  targetClass?: string;
  targetSection?: string;
  targetGroupId?: string;
  targetGroupName?: string;
  selectedStudentIds?: string[];
  recipientsCount: number;
  recipientCount?: number; // alias

  // Lifecycle
  status: "published" | "draft" | "archived" | "scheduled";
  createdBy?: string;
  createdAt: string;
  publishedAt?: string;

  // AI Notice Understanding Engine Fields (Step 5)
  aiAnalysisStatus?: NoticeAiAnalysisStatus;
  aiAnalysis?: NoticeAiAnalysis;
  aiSummary?: string;
  aiNoticeType?: string;
  aiAudience?: NoticeAiAudience;
  aiDates?: NoticeAiDates;
  aiRequirements?: string[];
  aiDocuments?: string[];
  aiTasks?: NoticeAiTask[];
  aiConsequences?: string[];
  aiDependencies?: NoticeAiDependency[];
  aiImportantPoints?: string[];
  aiConfidence?: number;
  aiAnalyzedAt?: string;
  aiApprovedAt?: string;
}


