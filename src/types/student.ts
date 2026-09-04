import { Notice } from "./institution";

export type StudentAccessType = "COLLEGE_EMAIL" | "SCHOOL_STUDENT_ID";

export interface StudentProfile {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionType: "college" | "school";
  type?: "college" | "school"; // alias
  name: string;
  email?: string;
  studentId?: string;
  department?: string; // CSE, IT, ECE for college
  className?: string; // Class 10, 11, 12 for school
  class?: string; // alias
  year?: string; // 1st Year, 2nd Year for college
  section: string; // A, B, C
  rollNumber: string;
  status: "active" | "pending" | "inactive";
  accessType: StudentAccessType;
  
  // Student Personal Preferences (Editable by student)
  interests: string[];
  preferredStartTime: string; // e.g. "6 PM"
  preferredEndTime: string; // e.g. "10 PM"
  availableDailyHours: string; // e.g. "2 hours"
  onboardingCompleted: boolean;
  joinedDate: string;
}

export interface StudentAccessRecord {
  studentId: string;
  institutionId: string;
  accessType: StudentAccessType;
  verified: boolean;
  verifiedAt: string;
}

export type NoticeRelevanceLevel = "HIGH" | "MEDIUM" | "LOW" | "NOT_RELEVANT";

export interface PersonalizedAction {
  id: string;
  noticeId: string;
  noticeTitle: string;
  title: string;
  description?: string;
  deadline?: string | null;
  estimatedMinutes?: number | null;
  status: "pending" | "completed";
  sourceTask?: string;
}

export interface NoticeRelevance {
  id: string;
  noticeId: string;
  studentId: string;
  relevance: NoticeRelevanceLevel;
  score: number; // 0 to 100
  reasons: string[];
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  personalizedSummary?: string;
  personalizedTasks?: PersonalizedAction[];
  eligibilityStatus?: "CONFIRMED" | "NEEDS_REVIEW" | "INELIGIBLE";
  isStale?: boolean;
  analyzedByAi?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeWithRelevance extends Notice {
  relevance: NoticeRelevance;
}

// ============================================================================
// STEP 7 & 8: PRIORITY INTELLIGENCE ENGINE & STUDENT CONTROL TYPES
// ============================================================================

export type TaskQuadrant = "Q1" | "Q2" | "Q3" | "Q4";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

export type TaskType = "AI_GENERATED" | "PERSONAL";

export type StudentImportance = "LOW" | "MEDIUM" | "HIGH";

export interface TaskDependencies {
  blockedByTaskId?: string;
  blockedByTaskTitle?: string;
  isBlocked: boolean;
  blocksTaskTitles?: string[];
  isPrerequisiteForOthers?: boolean;
  prerequisiteCompleted?: boolean;
}

export interface TaskContextSuggestion {
  suggestion: string;
  reason: string;
  suggestedQuadrant?: TaskQuadrant;
  confidence?: number;
  applied?: boolean;
  createdAt: string;
}

export interface PriorityTask {
  id: string;
  studentId: string;
  noticeId?: string; // Optional for personal tasks
  noticeTitle?: string;
  noticeCategory?: string;

  taskType: TaskType;

  title: string;
  description?: string;

  deadline?: string | null;
  estimatedMinutes?: number | null;

  // AI Calculated Scores & Reasons (Step 7)
  urgencyScore: number; // 0 to 100 (alias for aiUrgencyScore)
  importanceScore: number; // 0 to 100
  consequenceScore: number; // 0 to 100
  relevanceScore: number; // 0 to 100
  priorityScore: number; // 0 to 100 (weighted sum)
  quadrant: TaskQuadrant; // Backwards compatible alias for finalQuadrant

  aiUrgencyScore: number;
  aiImportanceScore: number;
  aiConsequenceScore: number;
  aiRelevanceScore: number;
  aiPriorityScore: number;
  aiQuadrant: TaskQuadrant;
  aiPriorityReasons: string[];

  // Student Control Layer & Overrides (Step 8)
  studentImportanceOverride?: StudentImportance | null;
  studentPriorityOverride?: number | null;
  studentQuadrantOverride?: TaskQuadrant | null;

  // Final Resolved State (Student decision > AI recommendation)
  finalPriorityScore: number;
  finalQuadrant: TaskQuadrant;

  priorityReasons: string[];
  recommendedAction: string;

  // Private Student Notes & AI Context
  privateNote?: string;
  useNoteForAI?: boolean;
  aiContextSuggestion?: TaskContextSuggestion | null;

  // Lifecycle & Dependency State
  dependencies?: TaskDependencies;
  status: TaskStatus;
  isRemoved?: boolean; // If student removed an AI-generated notice action from their checklist

  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface TaskPriorityResult {
  quadrant: TaskQuadrant;
  urgencyScore: number;
  importanceScore: number;
  consequenceScore: number;
  relevanceScore: number;
  priorityScore: number;
  reasons: string[];
  recommendedAction: string;
  isOverdue: boolean;
}

// ============================================================================
// STEP 9: SMART SCHEDULING & ACTION PLAN ENGINE TYPES
// ============================================================================

export type ScheduleItemStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";

export interface StudentAvailability {
  studentId: string;
  preferredStartTime: string; // e.g. "18:00" or "6 PM"
  preferredEndTime: string;   // e.g. "22:00" or "10 PM"
  availableDailyMinutes: number; // e.g. 120
  bufferPercent?: number; // default 15%
  daysAvailable?: string[]; // e.g. ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
}

export interface ScheduleItem {
  id: string;
  studentId: string;
  taskId: string;
  taskTitle: string;
  taskType: TaskType;
  quadrant: TaskQuadrant;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "18:00" or "6:00 PM"
  endTime: string;   // "18:30" or "6:30 PM"
  durationMinutes: number;
  deadline?: string | null;
  status: ScheduleItemStatus;
  scheduleOverride?: boolean; // If student manually customized or moved this slot
  whyScheduledHere: string;   // Explainable rule-based reason
  isSplit?: boolean;
  splitPart?: number;
  totalSplitParts?: number;
  dependencies?: TaskDependencies;
  noticeId?: string;
  noticeTitle?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface DailyPlan {
  date: string; // "YYYY-MM-DD"
  dayName: string; // "Today", "Monday", "Tomorrow", etc.
  availableMinutes: number;
  scheduledMinutes: number;
  remainingMinutes: number;
  bufferMinutes: number;
  items: ScheduleItem[];
  isOverloaded?: boolean;
}

export interface UnscheduledTask {
  task: PriorityTask;
  reason: string;
  suggestedAction: string;
}

export interface ScheduleGenerationResult {
  dailyPlans: DailyPlan[];
  unscheduledTasks: UnscheduledTask[];
  nextActionItem: ScheduleItem | null;
  totalPlannedMinutes: number;
  totalAvailableMinutes: number;
  conflicts: string[];
}

// ============================================================================
// STEP 10: SMART NOTIFICATIONS & REMINDER ENGINE TYPES
// ============================================================================

export type NotificationType =
  | "NOTICE_RECEIVED"
  | "DEADLINE_APPROACHING"
  | "TASK_DUE_SOON"
  | "TASK_OVERDUE"
  | "SCHEDULED_TASK"
  | "DEPENDENCY_BLOCKED"
  | "PRIORITY_CHANGED"
  | "NOTICE_UPDATED"
  | "SCHEDULE_CONFLICT"
  | "PLAN_UPDATED"
  | "TASK_COMPLETED"
  | "SYSTEM";

export type NotificationPriority = "HIGH" | "MEDIUM" | "LOW";

export interface StudentNotification {
  id: string;
  studentId: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  noticeId?: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  actionUrl: string;
  deduplicationKey: string;
  badgeLabel?: string;
  meta?: Record<string, unknown>;
}

export interface StudentNotificationPreferences {
  studentId: string;
  deadlineReminders: boolean;
  scheduledTaskReminders: boolean;
  noticeUpdates: boolean;
  dependencyAlerts: boolean;
  importantAlerts: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "07:00"
}
