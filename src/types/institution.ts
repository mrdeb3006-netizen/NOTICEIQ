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
  updatedAt?: string;

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

// ============================================================================
// STEP 11: INSTITUTION ANALYTICS & IMPACT DASHBOARD TYPES
// ============================================================================

export type AggregatedActionStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "OVERDUE"
  | "BLOCKED";

export interface NoticeAnalytics {
  noticeId: string;
  institutionId: string;
  noticeTitle: string;
  category: NoticeCategory;
  publicationDate: string;
  deadline?: string;
  targetAudience: string;
  targetDepartment?: string;
  targetYear?: string;
  targetSection?: string;
  status: "published" | "draft" | "archived" | "scheduled";

  // Audience & Reach
  studentsTargeted: number;
  studentsReached: number;
  studentsRelevant: number;
  studentsNotRelevant: number;
  relevanceBreakdown: {
    high: number;
    medium: number;
    low: number;
    notRelevant: number;
  };

  // Actions Generated & Completion
  actionsGenerated: number;
  actionsCompleted: number;
  actionsOverdue: number;
  actionsBlocked: number;
  actionsInProgress: number;
  actionsNotStarted: number;

  // Rates & Key Metrics
  completionRate: number; // completed / generated * 100
  overdueRate: number; // overdue / generated * 100
  onTimeRate: number; // on-time / completed * 100
  actionConversionRate: number; // students who completed >= 1 action / relevant students * 100
  actionabilityScore: number; // NoticeIQ 0-100 index

  // Action States & Breakdown
  actionStates: {
    completed: number;
    inProgress: number;
    notStarted: number;
    overdue: number;
    blocked: number;
  };

  // Deadline Outcome Breakdown
  deadlineOutcomes: {
    beforeDeadline: number;
    onDeadline: number;
    afterDeadline: number;
    overdue: number;
    upcoming: number;
  };

  updatedAt: string;
}

export interface CommunicationFunnelMetrics {
  publishedCount: number;
  deliveredCount: number;
  relevantCount: number;
  actionGeneratedCount: number;
  completedCount: number;

  publishedPct: number; // 100%
  deliveredPct: number;
  relevantPct: number;
  actionGeneratedPct: number;
  completedPct: number;
}

export interface DepartmentPerformance {
  department: string;
  notices: number;
  students: number;
  actions: number;
  completed: number;
  completionRate: number;
  overdue: number;
}

export interface YearClassPerformance {
  yearClass: string;
  notices: number;
  students: number;
  actions: number;
  completed: number;
  completionRate: number;
  overdue: number;
}

export interface SectionPerformance {
  section: string;
  notices: number;
  students: number;
  actions: number;
  completed: number;
  completionRate: number;
  overdue: number;
}

export interface CategoryPerformance {
  category: NoticeCategory;
  notices: number;
  studentsReached: number;
  actionsGenerated: number;
  completed: number;
  completionRate: number;
  overdue: number;
}

export interface DeadlineEffectiveness {
  beforeDeadlinePct: number;
  onDeadlinePct: number;
  afterDeadlinePct: number;
  overduePct: number;
}

export interface InstitutionInsightItem {
  id: string;
  type: "positive" | "warning" | "targeting" | "impact";
  title: string;
  message: string;
  badge: string;
}

export interface InstitutionAnalyticsSummary {
  institutionId: string;
  totalNotices: number;
  studentsReached: number;
  relevantNoticesCount: number;
  actionsGenerated: number;
  actionsCompleted: number;
  actionsOverdue: number;

  overallCompletionRate: number;
  overallOverdueRate: number;
  actionConversionRate: number;
  averageActionabilityScore: number;

  funnel: CommunicationFunnelMetrics;
  relevanceDistribution: {
    high: number;
    medium: number;
    low: number;
    notRelevant: number;
    highPct: number;
    mediumPct: number;
    lowPct: number;
    notRelevantPct: number;
  };

  departmentPerformance: DepartmentPerformance[];
  yearClassPerformance: YearClassPerformance[];
  sectionPerformance: SectionPerformance[];
  categoryPerformance: CategoryPerformance[];
  deadlineEffectiveness: DeadlineEffectiveness;

  insights: InstitutionInsightItem[];
  noticeAnalyticsList: NoticeAnalytics[];
}

export type DateRangePreset =
  | "today"
  | "7days"
  | "30days"
  | "90days"
  | "all"
  | "custom";

export interface AnalyticsFilterOptions {
  dateRange: DateRangePreset;
  startDate?: string;
  endDate?: string;
  department?: string;
  yearClass?: string;
  section?: string;
  category?: string;
  status?: string;
  searchQuery?: string;
}


