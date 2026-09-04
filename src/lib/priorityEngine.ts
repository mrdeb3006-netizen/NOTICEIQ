import { Notice, NoticeAiDependency } from "@/types/institution";
import {
  StudentProfile,
  NoticeRelevance,
  NoticeRelevanceLevel,
  PriorityTask,
  TaskQuadrant,
  TaskStatus,
  TaskPriorityResult,
  TaskDependencies,
} from "@/types/student";

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

export const PRIORITY_WEIGHTS = {
  urgency: 0.35,
  importance: 0.30,
  consequence: 0.20,
  relevance: 0.15,
};

export const PRIORITY_THRESHOLD = 60;

export const QUADRANT_CONFIG: Record<
  TaskQuadrant,
  {
    label: string;
    actionTitle: string;
    description: string;
    badgeColor: string;
    textColor: string;
    borderColor: string;
    bgColor: string;
    lightBg: string;
    dotColor: string;
    icon: string;
  }
> = {
  Q1: {
    label: "Q1 — DO FIRST",
    actionTitle: "DO FIRST",
    description: "Urgent & Important — Critical deadlines & high-consequence requirements",
    badgeColor: "bg-rose-600 text-white",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    bgColor: "bg-rose-50",
    lightBg: "bg-rose-50/50",
    dotColor: "bg-rose-600",
    icon: "🔴",
  },
  Q2: {
    label: "Q2 — SCHEDULE",
    actionTitle: "SCHEDULE",
    description: "Not Urgent & Important — Proactive academic planning, applications & study",
    badgeColor: "bg-amber-600 text-white",
    textColor: "text-amber-800",
    borderColor: "border-amber-200",
    bgColor: "bg-amber-50",
    lightBg: "bg-amber-50/50",
    dotColor: "bg-amber-500",
    icon: "🟡",
  },
  Q3: {
    label: "Q3 — HANDLE / DELEGATE",
    actionTitle: "HANDLE / DELEGATE",
    description: "Urgent & Not Important — Time-sensitive routine queries & quick tasks",
    badgeColor: "bg-sky-600 text-white",
    textColor: "text-sky-800",
    borderColor: "border-sky-200",
    bgColor: "bg-sky-50",
    lightBg: "bg-sky-50/50",
    dotColor: "bg-sky-500",
    icon: "🔵",
  },
  Q4: {
    label: "Q4 — LATER",
    actionTitle: "LATER",
    description: "Not Urgent & Not Important — Optional club events & general campus reading",
    badgeColor: "bg-slate-600 text-white",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
    bgColor: "bg-slate-50",
    lightBg: "bg-slate-50/50",
    dotColor: "bg-slate-400",
    icon: "⚪",
  },
};

// ============================================================================
// DATE & DEADLINE PARSING
// ============================================================================

export function parseFlexibleDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Try standard ISO or direct date parse
  const direct = new Date(trimmed);
  if (!isNaN(direct.getTime())) {
    return direct;
  }

  // Handle formats like "10 Sep 2026", "September 10, 2026", "10-09-2026"
  const cleaned = trimmed.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
  const fallback = new Date(cleaned);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
}

export interface UrgencyCalculationResult {
  score: number;
  label: string;
  isOverdue: boolean;
  daysRemaining: number | null;
  reason: string;
}

/**
 * Calculates urgency primarily from deadline proximity dynamically.
 * DO NOT hardcode today's date — uses currentDate dynamically.
 */
export function calculateUrgency(
  deadlineStr?: string | null,
  customNow?: Date
): UrgencyCalculationResult {
  if (!deadlineStr) {
    return {
      score: 20,
      label: "No deadline",
      isOverdue: false,
      daysRemaining: null,
      reason: "• Important but no immediate deadline.",
    };
  }

  const deadlineDate = parseFlexibleDate(deadlineStr);
  if (!deadlineDate) {
    return {
      score: 25,
      label: deadlineStr,
      isOverdue: false,
      daysRemaining: null,
      reason: `Deadline listed as "${deadlineStr}".`,
    };
  }

  const now = customNow || new Date();
  
  // Normalize to start of day for clean calendar diffs
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetStart = new Date(
    deadlineDate.getFullYear(),
    deadlineDate.getMonth(),
    deadlineDate.getDate()
  ).getTime();

  const diffMs = targetStart - todayStart;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Past deadline / Overdue
    const daysOverdue = Math.abs(diffDays);
    const score = Math.min(100, Math.max(95, 100 - daysOverdue * 0.5));
    return {
      score,
      label: `Deadline passed (${daysOverdue}d ago)`,
      isOverdue: true,
      daysRemaining: diffDays,
      reason: `⚠ OVERDUE: Action deadline passed ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} ago. Needs urgent attention.`,
    };
  }

  if (diffDays === 0) {
    // Deadline today: 90–100
    return {
      score: 95,
      label: "Due today",
      isOverdue: false,
      daysRemaining: 0,
      reason: "• Deadline is TODAY — immediate action required.",
    };
  }

  if (diffDays === 1) {
    // Deadline tomorrow: 85–99
    return {
      score: 90,
      label: "Due tomorrow",
      isOverdue: false,
      daysRemaining: 1,
      reason: "• Deadline is TOMORROW — high urgency.",
    };
  }

  if (diffDays <= 3) {
    // Deadline within 3 days: 70–90
    return {
      score: 80,
      label: `Due in ${diffDays} days`,
      isOverdue: false,
      daysRemaining: diffDays,
      reason: `• Deadline is approaching in ${diffDays} days.`,
    };
  }

  if (diffDays <= 7) {
    // Deadline within 7 days: 55–75
    return {
      score: 65,
      label: `Due in ${diffDays} days`,
      isOverdue: false,
      daysRemaining: diffDays,
      reason: `• Deadline is this week (${diffDays} days remaining).`,
    };
  }

  if (diffDays <= 14) {
    // Deadline within 14 days: 35–60
    return {
      score: 45,
      label: `Due in ${diffDays} days`,
      isOverdue: false,
      daysRemaining: diffDays,
      reason: `• Deadline is within two weeks (${diffDays} days remaining).`,
    };
  }

  // Deadline more than 14 days away: 10–40
  return {
    score: 25,
    label: `Due in ${diffDays} days`,
    isOverdue: false,
    daysRemaining: diffDays,
    reason: `• Deadline is several weeks away (${diffDays} days remaining).`,
  };
}

// ============================================================================
// IMPORTANCE SCORE
// ============================================================================

export interface ImportanceCalculationResult {
  score: number;
  reason: string;
}

/**
 * Calculates importance based on notice meaning, category, consequences,
 * and academic necessity.
 */
export function calculateImportance(
  notice: Notice,
  taskTitle: string,
  _taskDesc?: string
): ImportanceCalculationResult {
  let score = 50;
  const reasons: string[] = [];

  const cat = (notice.category || "").toLowerCase();
  const noticeType = (notice.aiNoticeType || notice.aiAnalysis?.notice_type || "").toLowerCase();
  const fullText = `${notice.title} ${notice.content} ${notice.aiSummary || ""}`.toLowerCase();
  const taskLower = taskTitle.toLowerCase();

  // 1. High Importance Categories & Notice Types
  if (cat.includes("scholarship") || noticeType.includes("scholarship")) {
    score = 88;
    reasons.push("Critical financial & scholarship process");
  } else if (cat.includes("exam") || noticeType.includes("examination")) {
    score = 92;
    reasons.push("Mandatory academic examination & clearance");
  } else if (cat.includes("placement") || noticeType.includes("placement")) {
    score = 85;
    reasons.push("High-priority career placement opportunity");
  } else if (cat.includes("academic") || noticeType.includes("academic")) {
    score = 75;
    reasons.push("Core academic submission requirement");
  } else if (cat.includes("assignment") || noticeType.includes("assignment")) {
    score = 72;
    reasons.push("Graded coursework assignment");
  } else if (cat.includes("administration")) {
    score = 45;
    reasons.push("Institutional administrative update");
  } else if (cat.includes("club") || cat.includes("event")) {
    score = 35;
    reasons.push("Co-curricular event / club activity");
  } else {
    score = 40;
    reasons.push("General campus notice");
  }

  // 2. Keyword & Task-level importance adjustments
  if (
    fullText.includes("mandatory") ||
    fullText.includes("compulsory") ||
    fullText.includes("required for all") ||
    fullText.includes("admit card") ||
    fullText.includes("biometric")
  ) {
    score = Math.min(100, score + 10);
    reasons.push("Mandatory compliance required by institution");
  }

  if (
    taskLower.includes("submit") ||
    taskLower.includes("application") ||
    taskLower.includes("certificate") ||
    taskLower.includes("registration")
  ) {
    score = Math.min(100, score + 5);
  }

  // 3. Optional signals reduce importance
  if (
    fullText.includes("attendance is optional") ||
    fullText.includes("voluntary") ||
    fullText.includes("open to all interested")
  ) {
    score = Math.max(20, score - 20);
    reasons.push("Optional participation indicated");
  }

  return {
    score: Math.min(100, Math.max(10, Math.round(score))),
    reason: reasons[0] || "Standard institutional action",
  };
}

// ============================================================================
// CONSEQUENCE SCORE
// ============================================================================

export interface ConsequenceCalculationResult {
  score: number;
  reason: string | null;
}

/**
 * Calculates consequence score from AI-extracted consequences.
 * If no consequence stated, uses neutral default (45) without inventing reasons.
 */
export function calculateConsequenceScore(notice: Notice): ConsequenceCalculationResult {
  const consequences = notice.aiAnalysis?.consequences || notice.aiConsequences || [];
  
  if (consequences.length === 0) {
    return {
      score: 45,
      reason: null, // No consequence stated: do not invent one
    };
  }

  const consequenceText = consequences.join(" ").toLowerCase();

  if (
    consequenceText.includes("loss of scholarship") ||
    consequenceText.includes("not be considered for the scholarship") ||
    consequenceText.includes("debarred") ||
    consequenceText.includes("admit card will only be generated") ||
    consequenceText.includes("cannot appear") ||
    consequenceText.includes("admission canceled")
  ) {
    return {
      score: 92,
      reason: consequences[0] || "Missing this deadline impacts scholarship/exam eligibility.",
    };
  }

  if (
    consequenceText.includes("late submission") ||
    consequenceText.includes("will not be considered") ||
    consequenceText.includes("rejected") ||
    consequenceText.includes("penalty")
  ) {
    return {
      score: 80,
      reason: consequences[0] || "Late submissions will be rejected.",
    };
  }

  if (consequenceText.includes("optional") || consequenceText.includes("latency")) {
    return {
      score: 25,
      reason: consequences[0] || "Low consequence impact.",
    };
  }

  return {
    score: 65,
    reason: consequences[0],
  };
}

// ============================================================================
// RELEVANCE SCORE
// ============================================================================

export function calculateRelevanceScore(
  relevance: NoticeRelevanceLevel,
  rawScore?: number
): number {
  switch (relevance) {
    case "HIGH":
      return rawScore ? Math.min(100, Math.max(90, rawScore)) : 95;
    case "MEDIUM":
      return rawScore ? Math.min(89, Math.max(60, rawScore)) : 75;
    case "LOW":
      return 35;
    case "NOT_RELEVANT":
    default:
      return 0;
  }
}

// ============================================================================
// CORE PRIORITY CALCULATION ENGINE
// ============================================================================

/**
 * Calculates priority using:
 * 1. Urgency (35%)
 * 2. Importance (30%)
 * 3. Consequence (20%)
 * 4. Relevance (15%)
 * 5. Deadline
 * 6. Dependencies
 *
 * Deterministic and rule-based. Returns scores between 0 and 100.
 */
export function calculateTaskPriority(
  task: {
    title: string;
    description?: string;
    deadline?: string | null;
  },
  notice: Notice,
  relevance: NoticeRelevance,
  _student: StudentProfile,
  dependenciesContext?: {
    isBlocked?: boolean;
    blockedByTitle?: string;
    isPrerequisite?: boolean;
    blocksTitle?: string;
    prerequisiteCompleted?: boolean;
  },
  customNow?: Date
): TaskPriorityResult {
  // 1. Urgency Score (0-100)
  const taskDeadline = task.deadline !== undefined ? task.deadline : (notice.deadline || notice.aiDates?.deadline);
  const urgencyRes = calculateUrgency(taskDeadline, customNow);
  let urgencyScore = urgencyRes.score;

  // 2. Importance Score (0-100)
  const importanceRes = calculateImportance(notice, task.title, task.description);
  let importanceScore = importanceRes.score;

  // 3. Consequence Score (0-100)
  const consequenceRes = calculateConsequenceScore(notice);
  const consequenceScore = consequenceRes.score;

  // 4. Relevance Score (0-100)
  const relevanceScore = calculateRelevanceScore(relevance.relevance, relevance.score);

  // 5. Dependency Adjustment
  if (dependenciesContext?.isPrerequisite && !dependenciesContext.prerequisiteCompleted) {
    // A prerequisite blocking another task gets a priority boost
    urgencyScore = Math.min(100, urgencyScore + 5);
    importanceScore = Math.min(100, importanceScore + 5);
  }

  // 6. Weighted Priority Score Formula
  const rawPriorityScore =
    urgencyScore * PRIORITY_WEIGHTS.urgency +
    importanceScore * PRIORITY_WEIGHTS.importance +
    consequenceScore * PRIORITY_WEIGHTS.consequence +
    relevanceScore * PRIORITY_WEIGHTS.relevance;

  const priorityScore = Math.min(100, Math.max(0, Math.round(rawPriorityScore)));

  // 7. Quadrant Calculation using PRIORITY_THRESHOLD (60)
  let quadrant: TaskQuadrant = "Q4";
  if (urgencyScore >= PRIORITY_THRESHOLD && importanceScore >= PRIORITY_THRESHOLD) {
    quadrant = "Q1"; // Q1 — DO FIRST
  } else if (urgencyScore < PRIORITY_THRESHOLD && importanceScore >= PRIORITY_THRESHOLD) {
    quadrant = "Q2"; // Q2 — SCHEDULE
  } else if (urgencyScore >= PRIORITY_THRESHOLD && importanceScore < PRIORITY_THRESHOLD) {
    quadrant = "Q3"; // Q3 — HANDLE / DELEGATE
  } else {
    quadrant = "Q4"; // Q4 — LATER
  }

  // 8. Explainable Reasons List
  const reasons: string[] = [];

  // Urgency reason
  reasons.push(urgencyRes.reason);

  // Consequence reason
  if (consequenceRes.reason) {
    reasons.push(`• Consequence: ${consequenceRes.reason}`);
  } else if (importanceScore >= PRIORITY_THRESHOLD) {
    reasons.push(`• Important academic requirement: ${importanceRes.reason}`);
  }

  // Relevance reason
  if (relevance.relevance === "HIGH") {
    reasons.push("• This task directly matches your student profile and cohort.");
  } else if (relevance.relevance === "MEDIUM") {
    reasons.push("• This task is potentially relevant based on your program.");
  }

  // Dependency reason
  if (dependenciesContext?.isBlocked && dependenciesContext.blockedByTitle) {
    reasons.push(
      `⚠ BLOCKING PREREQUISITE: "${dependenciesContext.blockedByTitle}" must be completed first.`
    );
  } else if (dependenciesContext?.prerequisiteCompleted && dependenciesContext.blockedByTitle) {
    reasons.push(`✓ Prerequisite "${dependenciesContext.blockedByTitle}" has been completed.`);
  } else if (dependenciesContext?.isPrerequisite && dependenciesContext.blocksTitle) {
    reasons.push(`⚡ Required prerequisite for "${dependenciesContext.blocksTitle}".`);
  }

  // 9. Recommended Action Text
  let recommendedAction = "";
  if (quadrant === "Q1") {
    if (dependenciesContext?.isBlocked) {
      recommendedAction = `Complete prerequisite "${dependenciesContext.blockedByTitle}" first, then submit this immediately.`;
    } else if (urgencyRes.isOverdue) {
      recommendedAction = "Take immediate action to resolve this overdue requirement.";
    } else {
      recommendedAction = "Execute and submit this task today to meet the pending deadline.";
    }
  } else if (quadrant === "Q2") {
    recommendedAction = "Block dedicated study time on your calendar for this week.";
  } else if (quadrant === "Q3") {
    recommendedAction = "Address this quick task or seek assistance during office hours.";
  } else {
    recommendedAction = "Review at your leisure when core priorities are completed.";
  }

  return {
    quadrant,
    urgencyScore: Math.round(urgencyScore),
    importanceScore: Math.round(importanceScore),
    consequenceScore: Math.round(consequenceScore),
    relevanceScore: Math.round(relevanceScore),
    priorityScore,
    reasons,
    recommendedAction,
    isOverdue: urgencyRes.isOverdue,
  };
}

// ============================================================================
// STUDENT TASK GENERATION & DEPENDENCY GRAPH RESOLVER
// ============================================================================

/**
 * Generates and prioritizes all active tasks for a given student from their notices.
 * Resolves dependency chains dynamically.
 * Filters out tasks from NOT_RELEVANT notices.
 */
export function generateStudentPriorityTasks(
  student: StudentProfile,
  noticesWithRelevance: Array<Notice & { relevance: NoticeRelevance }>,
  completedTaskIds: string[] = [],
  customNow?: Date
): PriorityTask[] {
  const priorityTasks: PriorityTask[] = [];

  // Filter only relevant notices (HIGH and confirmed MEDIUM)
  const relevantNotices = noticesWithRelevance.filter(
    (n) => n.relevance.relevance === "HIGH" || n.relevance.relevance === "MEDIUM"
  );

  // 1. First pass: Collect all raw tasks and build dependency lookups
  relevantNotices.forEach((notice) => {
    const rawTasks = notice.relevance.personalizedTasks || [];
    const dependencies: NoticeAiDependency[] =
      notice.aiAnalysis?.dependencies || notice.aiDependencies || [];

    rawTasks.forEach((t, idx) => {
      const taskId = t.id || `task_${notice.id}_${student.id}_${idx + 1}`;
      const isCompleted = completedTaskIds.includes(taskId);
      const status: TaskStatus = isCompleted ? "COMPLETED" : "TODO";

      // Detect dependencies for this task
      let blockedByTitle: string | undefined;
      let blockedByTaskId: string | undefined;
      let isBlocked = false;
      let prerequisiteCompleted = false;

      // Check if this task is blocked by another task
      const depMatch = dependencies.find(
        (d) =>
          normalizeTaskName(d.blocked_task) === normalizeTaskName(t.title) ||
          normalizeTaskName(d.blocked_task) === normalizeTaskName(t.sourceTask || "") ||
          t.title.toLowerCase().includes(d.blocked_task.toLowerCase())
      );

      if (depMatch) {
        blockedByTitle = depMatch.required_task;
        // Find matching task object in notice
        const reqTask = rawTasks.find(
          (rt) =>
            normalizeTaskName(rt.title) === normalizeTaskName(depMatch.required_task) ||
            normalizeTaskName(rt.sourceTask || "") === normalizeTaskName(depMatch.required_task) ||
            rt.title.toLowerCase().includes(depMatch.required_task.toLowerCase())
        );
        if (reqTask) {
          blockedByTaskId = reqTask.id;
          const reqCompleted = completedTaskIds.includes(reqTask.id);
          prerequisiteCompleted = reqCompleted;
          isBlocked = !reqCompleted;
        } else {
          isBlocked = true;
        }
      }

      // Check if this task blocks other tasks
      const blocksMatch = dependencies.filter(
        (d) =>
          normalizeTaskName(d.required_task) === normalizeTaskName(t.title) ||
          normalizeTaskName(d.required_task) === normalizeTaskName(t.sourceTask || "") ||
          t.title.toLowerCase().includes(d.required_task.toLowerCase())
      );

      const isPrerequisiteForOthers = blocksMatch.length > 0;
      const blocksTaskTitles = blocksMatch.map((b) => b.blocked_task);

      const taskDeps: TaskDependencies = {
        blockedByTaskId,
        blockedByTaskTitle: blockedByTitle,
        isBlocked,
        blocksTaskTitles,
        isPrerequisiteForOthers,
        prerequisiteCompleted,
      };

      // 2. Calculate priority scores
      const priorityResult = calculateTaskPriority(
        {
          title: t.title,
          description: t.description,
          deadline: t.deadline || notice.deadline,
        },
        notice,
        notice.relevance,
        student,
        {
          isBlocked,
          blockedByTitle,
          isPrerequisite: isPrerequisiteForOthers,
          blocksTitle: blocksTaskTitles[0],
          prerequisiteCompleted,
        },
        customNow
      );

      priorityTasks.push({
        id: taskId,
        studentId: student.id,
        noticeId: notice.id,
        noticeTitle: notice.title,
        noticeCategory: notice.category,
        title: t.title,
        description: t.description,
        deadline: t.deadline || notice.deadline || null,
        estimatedMinutes: t.estimatedMinutes || 30,
        urgencyScore: priorityResult.urgencyScore,
        importanceScore: priorityResult.importanceScore,
        consequenceScore: priorityResult.consequenceScore,
        relevanceScore: priorityResult.relevanceScore,
        priorityScore: priorityResult.priorityScore,
        quadrant: priorityResult.quadrant,
        priorityReasons: priorityResult.reasons,
        recommendedAction: priorityResult.recommendedAction,
        dependencies: taskDeps,
        status,
        createdAt: notice.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: isCompleted ? new Date().toISOString() : null,
        aiQuadrant: priorityResult.quadrant,
        studentQuadrantOverride: null,
      });
    });
  });

  return sortPriorityTasks(priorityTasks);
}

/**
 * Helper to normalize task names for dependency matching
 */
function normalizeTaskName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^students must /i, "")
    .replace(/^students should /i, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Inside each quadrant, sort tasks by:
 * 1. Blocking dependency (prerequisites that block other tasks come first)
 * 2. Deadline proximity (earlier deadlines / overdue first)
 * 3. Priority score (descending)
 */
export function sortPriorityTasks(tasks: PriorityTask[]): PriorityTask[] {
  return [...tasks].sort((a, b) => {
    // 1. Active blocking prerequisites come before blocked tasks
    const aIsPrereq = a.dependencies?.isPrerequisiteForOthers && a.status !== "COMPLETED";
    const bIsPrereq = b.dependencies?.isPrerequisiteForOthers && b.status !== "COMPLETED";
    if (aIsPrereq && !bIsPrereq) return -1;
    if (!aIsPrereq && bIsPrereq) return 1;

    // Blocked tasks sort after unblocked tasks
    if (a.dependencies?.isBlocked && !b.dependencies?.isBlocked) return 1;
    if (!a.dependencies?.isBlocked && b.dependencies?.isBlocked) return -1;

    // 2. Deadline proximity
    const aDate = parseFlexibleDate(a.deadline);
    const bDate = parseFlexibleDate(b.deadline);

    if (aDate && bDate) {
      const diff = aDate.getTime() - bDate.getTime();
      if (diff !== 0) return diff;
    } else if (aDate && !bDate) {
      return -1;
    } else if (!aDate && bDate) {
      return 1;
    }

    // 3. Priority score (descending)
    return b.priorityScore - a.priorityScore;
  });
}
