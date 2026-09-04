import { Notice, NoticeAiDependency } from "@/types/institution";
import {
  StudentProfile,
  NoticeRelevance,
  NoticeRelevanceLevel,
  PriorityTask,
  TaskQuadrant,
  TaskStatus,
  StudentImportance,
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
// PERSONAL TASK PRIORITY CALCULATION
// ============================================================================

export function calculatePersonalTaskPriority(
  task: {
    title: string;
    description?: string;
    deadline?: string | null;
    studentImportanceOverride?: StudentImportance | null;
  },
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
  const urgencyRes = calculateUrgency(task.deadline, customNow);
  let urgencyScore = urgencyRes.score;

  // 2. Importance Score (0-100)
  let importanceScore = 60; // default medium
  let importanceReason = "Personal student goal";
  if (task.studentImportanceOverride === "HIGH") {
    importanceScore = 85;
    importanceReason = "Marked as HIGH importance by you";
  } else if (task.studentImportanceOverride === "LOW") {
    importanceScore = 35;
    importanceReason = "Marked as LOW importance by you";
  } else if (task.studentImportanceOverride === "MEDIUM") {
    importanceScore = 60;
    importanceReason = "Marked as MEDIUM importance by you";
  } else {
    // Heuristics on title
    const tLower = task.title.toLowerCase();
    if (
      tLower.includes("exam") ||
      tLower.includes("submit") ||
      tLower.includes("scholarship") ||
      tLower.includes("presentation") ||
      tLower.includes("interview") ||
      tLower.includes("project")
    ) {
      importanceScore = 80;
      importanceReason = "Critical personal deadline or academic milestone";
    }
  }

  // 3. Consequence Score (0-100)
  let consequenceScore = 50;
  if (importanceScore >= 80) consequenceScore = 75;
  else if (importanceScore <= 40) consequenceScore = 30;

  // 4. Relevance Score (100% since personal task)
  const relevanceScore = 100;

  // 5. Dependency adjustment
  if (dependenciesContext?.isPrerequisite && !dependenciesContext.prerequisiteCompleted) {
    urgencyScore = Math.min(100, urgencyScore + 5);
    importanceScore = Math.min(100, importanceScore + 5);
  }

  // 6. Weighted Priority Score
  const rawPriorityScore =
    urgencyScore * PRIORITY_WEIGHTS.urgency +
    importanceScore * PRIORITY_WEIGHTS.importance +
    consequenceScore * PRIORITY_WEIGHTS.consequence +
    relevanceScore * PRIORITY_WEIGHTS.relevance;

  const priorityScore = Math.min(100, Math.max(0, Math.round(rawPriorityScore)));

  // 7. Quadrant Calculation
  let quadrant: TaskQuadrant = "Q4";
  if (urgencyScore >= PRIORITY_THRESHOLD && importanceScore >= PRIORITY_THRESHOLD) {
    quadrant = "Q1";
  } else if (urgencyScore < PRIORITY_THRESHOLD && importanceScore >= PRIORITY_THRESHOLD) {
    quadrant = "Q2";
  } else if (urgencyScore >= PRIORITY_THRESHOLD && importanceScore < PRIORITY_THRESHOLD) {
    quadrant = "Q3";
  } else {
    quadrant = "Q4";
  }

  // 8. Explainable Reasons List
  const reasons: string[] = [];
  reasons.push(urgencyRes.reason);
  reasons.push(`• ${importanceReason}.`);
  reasons.push("• Personal task created directly by you.");

  if (dependenciesContext?.isBlocked && dependenciesContext.blockedByTitle) {
    reasons.push(`⚠ BLOCKING PREREQUISITE: "${dependenciesContext.blockedByTitle}" must be completed first.`);
  } else if (dependenciesContext?.prerequisiteCompleted && dependenciesContext.blockedByTitle) {
    reasons.push(`✓ Prerequisite "${dependenciesContext.blockedByTitle}" has been completed.`);
  } else if (dependenciesContext?.isPrerequisite && dependenciesContext.blocksTitle) {
    reasons.push(`⚡ Required prerequisite for "${dependenciesContext.blocksTitle}".`);
  }

  let recommendedAction = "";
  if (quadrant === "Q1") {
    recommendedAction = "High urgency & importance — complete today.";
  } else if (quadrant === "Q2") {
    recommendedAction = "Important goal — schedule time in your study block.";
  } else if (quadrant === "Q3") {
    recommendedAction = "Handle quickly or take care of during free time.";
  } else {
    recommendedAction = "Complete at your leisure.";
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
// STUDENT TASK GENERATION & DEPENDENCY GRAPH RESOLVER (STEP 7 & STEP 8)
// ============================================================================

/**
 * Generates and prioritizes all active tasks for a given student.
 * Combines AI-generated notice tasks and Personal tasks.
 * Applies student overrides, private notes, and custom titles.
 * Resolves dependency chains dynamically.
 */
export function generateStudentPriorityTasks(
  student: StudentProfile,
  noticesWithRelevance: Array<Notice & { relevance: NoticeRelevance }>,
  completedTaskIds: string[] = [],
  customNow?: Date,
  customOverridesMap: Record<string, Partial<PriorityTask>> = {},
  personalTasksList: PriorityTask[] = []
): PriorityTask[] {
  const priorityTasks: PriorityTask[] = [];

  // Filter only relevant notices (HIGH and confirmed MEDIUM)
  const relevantNotices = noticesWithRelevance.filter(
    (n) => n.relevance.relevance === "HIGH" || n.relevance.relevance === "MEDIUM"
  );

  // 1. Process AI-Generated Notice Tasks
  relevantNotices.forEach((notice) => {
    const rawTasks = notice.relevance.personalizedTasks || [];
    const dependencies: NoticeAiDependency[] =
      notice.aiAnalysis?.dependencies || notice.aiDependencies || [];

    rawTasks.forEach((t, idx) => {
      const taskId = t.id || `task_${notice.id}_${student.id}_${idx + 1}`;
      const override = customOverridesMap[taskId] || {};

      // If student chose "Remove from My Actions"
      if (override.isRemoved) {
        return;
      }

      const effectiveTitle = override.title || t.title;
      const effectiveDescription = override.description !== undefined ? override.description : t.description;
      const effectiveDeadline = override.deadline !== undefined ? override.deadline : (t.deadline || notice.deadline);
      const effectiveEstimatedMinutes = override.estimatedMinutes || t.estimatedMinutes || 30;

      const isCompleted = completedTaskIds.includes(taskId) || override.status === "COMPLETED";
      const status: TaskStatus = isCompleted ? "COMPLETED" : (override.status || "TODO");

      // Dependency lookup
      let blockedByTitle: string | undefined = override.dependencies?.blockedByTaskTitle;
      let blockedByTaskId: string | undefined = override.dependencies?.blockedByTaskId;
      let isBlocked = false;
      let prerequisiteCompleted = false;

      const depMatch = dependencies.find(
        (d) =>
          normalizeTaskName(d.blocked_task) === normalizeTaskName(effectiveTitle) ||
          normalizeTaskName(d.blocked_task) === normalizeTaskName(t.title) ||
          normalizeTaskName(d.blocked_task) === normalizeTaskName(t.sourceTask || "") ||
          effectiveTitle.toLowerCase().includes(d.blocked_task.toLowerCase())
      );

      if (depMatch) {
        blockedByTitle = depMatch.required_task;
        const reqTask = rawTasks.find(
          (rt) =>
            normalizeTaskName(rt.title) === normalizeTaskName(depMatch.required_task) ||
            normalizeTaskName(rt.sourceTask || "") === normalizeTaskName(depMatch.required_task) ||
            rt.title.toLowerCase().includes(depMatch.required_task.toLowerCase())
        );
        if (reqTask) {
          blockedByTaskId = reqTask.id;
          const reqCompleted = completedTaskIds.includes(reqTask.id) || customOverridesMap[reqTask.id]?.status === "COMPLETED";
          prerequisiteCompleted = reqCompleted;
          isBlocked = !reqCompleted;
        } else {
          isBlocked = true;
        }
      }

      // Check if this task blocks others
      const blocksMatch = dependencies.filter(
        (d) =>
          normalizeTaskName(d.required_task) === normalizeTaskName(effectiveTitle) ||
          normalizeTaskName(d.required_task) === normalizeTaskName(t.title) ||
          normalizeTaskName(d.required_task) === normalizeTaskName(t.sourceTask || "") ||
          effectiveTitle.toLowerCase().includes(d.required_task.toLowerCase())
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

      // Calculate AI Recommendation
      const aiPriorityResult = calculateTaskPriority(
        {
          title: effectiveTitle,
          description: effectiveDescription,
          deadline: effectiveDeadline,
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

      // Student Overrides (Student decision > AI recommendation)
      const studentQuadrantOverride = override.studentQuadrantOverride !== undefined ? override.studentQuadrantOverride : null;
      const studentPriorityOverride = override.studentPriorityOverride !== undefined ? override.studentPriorityOverride : null;
      const studentImportanceOverride = override.studentImportanceOverride !== undefined ? override.studentImportanceOverride : null;

      const finalQuadrant = studentQuadrantOverride || aiPriorityResult.quadrant;
      const finalPriorityScore =
        studentPriorityOverride !== null && studentPriorityOverride !== undefined
          ? studentPriorityOverride
          : aiPriorityResult.priorityScore;

      priorityTasks.push({
        id: taskId,
        studentId: student.id,
        noticeId: notice.id,
        noticeTitle: notice.title,
        noticeCategory: notice.category,
        taskType: "AI_GENERATED",
        title: effectiveTitle,
        description: effectiveDescription,
        deadline: effectiveDeadline || null,
        estimatedMinutes: effectiveEstimatedMinutes,
        
        // AI Calculated values
        aiUrgencyScore: aiPriorityResult.urgencyScore,
        aiImportanceScore: aiPriorityResult.importanceScore,
        aiConsequenceScore: aiPriorityResult.consequenceScore,
        aiRelevanceScore: aiPriorityResult.relevanceScore,
        aiPriorityScore: aiPriorityResult.priorityScore,
        aiQuadrant: aiPriorityResult.quadrant,
        aiPriorityReasons: aiPriorityResult.reasons,

        // Student Overrides
        studentImportanceOverride,
        studentPriorityOverride,
        studentQuadrantOverride,

        // Final Resolved
        finalPriorityScore,
        finalQuadrant,

        // Aliases for compatibility
        urgencyScore: aiPriorityResult.urgencyScore,
        importanceScore: aiPriorityResult.importanceScore,
        consequenceScore: aiPriorityResult.consequenceScore,
        relevanceScore: aiPriorityResult.relevanceScore,
        priorityScore: finalPriorityScore,
        quadrant: finalQuadrant,

        priorityReasons: aiPriorityResult.reasons,
        recommendedAction: aiPriorityResult.recommendedAction,

        // Private Notes & AI Context
        privateNote: override.privateNote,
        useNoteForAI: override.useNoteForAI !== undefined ? override.useNoteForAI : true,
        aiContextSuggestion: override.aiContextSuggestion || null,

        dependencies: taskDeps,
        status,
        isRemoved: false,
        createdAt: notice.createdAt || new Date().toISOString(),
        updatedAt: override.updatedAt || new Date().toISOString(),
        completedAt: isCompleted ? (override.completedAt || new Date().toISOString()) : null,
      });
    });
  });

  // 2. Process Personal Tasks (Created Directly by Student)
  personalTasksList.forEach((pt) => {
    if (pt.isRemoved) return;

    const isCompleted = completedTaskIds.includes(pt.id) || pt.status === "COMPLETED";
    const status: TaskStatus = isCompleted ? "COMPLETED" : (pt.status || "TODO");

    // Evaluate Personal Task Priority
    const aiPriorityResult = calculatePersonalTaskPriority(
      {
        title: pt.title,
        description: pt.description,
        deadline: pt.deadline,
        studentImportanceOverride: pt.studentImportanceOverride,
      },
      student,
      {
        isBlocked: pt.dependencies?.isBlocked,
        blockedByTitle: pt.dependencies?.blockedByTaskTitle,
        isPrerequisite: pt.dependencies?.isPrerequisiteForOthers,
        blocksTitle: pt.dependencies?.blocksTaskTitles?.[0],
        prerequisiteCompleted: pt.dependencies?.prerequisiteCompleted,
      },
      customNow
    );

    const studentQuadrantOverride = pt.studentQuadrantOverride !== undefined ? pt.studentQuadrantOverride : null;
    const studentPriorityOverride = pt.studentPriorityOverride !== undefined ? pt.studentPriorityOverride : null;

    const finalQuadrant = studentQuadrantOverride || aiPriorityResult.quadrant;
    const finalPriorityScore =
      studentPriorityOverride !== null && studentPriorityOverride !== undefined
        ? studentPriorityOverride
        : aiPriorityResult.priorityScore;

    priorityTasks.push({
      ...pt,
      taskType: "PERSONAL",
      status,
      aiUrgencyScore: aiPriorityResult.urgencyScore,
      aiImportanceScore: aiPriorityResult.importanceScore,
      aiConsequenceScore: aiPriorityResult.consequenceScore,
      aiRelevanceScore: 100,
      aiPriorityScore: aiPriorityResult.priorityScore,
      aiQuadrant: aiPriorityResult.quadrant,
      aiPriorityReasons: aiPriorityResult.reasons,

      finalPriorityScore,
      finalQuadrant,

      urgencyScore: aiPriorityResult.urgencyScore,
      importanceScore: aiPriorityResult.importanceScore,
      consequenceScore: aiPriorityResult.consequenceScore,
      relevanceScore: 100,
      priorityScore: finalPriorityScore,
      quadrant: finalQuadrant,

      priorityReasons: aiPriorityResult.reasons,
      recommendedAction: aiPriorityResult.recommendedAction,
      completedAt: isCompleted ? (pt.completedAt || new Date().toISOString()) : null,
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
    return b.finalPriorityScore - a.finalPriorityScore;
  });
}

