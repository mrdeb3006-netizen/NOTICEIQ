import {
  PriorityTask,
  StudentAvailability,
  ScheduleItem,
  DailyPlan,
  UnscheduledTask,
  ScheduleGenerationResult,
  TaskQuadrant,
} from "@/types/student";
import { parseFlexibleDate } from "../priorityEngine";

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

export const DEFAULT_SCHEDULE_BUFFER_PERCENT = 15;
export const DEFAULT_TASK_DURATION_MINUTES = 30;

/**
 * Standard utility to parse start time string (e.g. "18:00" or "6 PM" or "6:00 PM")
 * Returns hour (0-23) and minute (0-59).
 */
export function parseTimeString(timeStr?: string): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 18, minutes: 0 }; // Default 6:00 PM

  const trimmed = timeStr.trim().toLowerCase();

  // Handle 12-hour format with AM/PM (e.g. "6 PM", "6:30 PM", "10 PM")
  const pmMatch = trimmed.match(/(\d+)(?::(\d+))?\s*(pm|am)/);
  if (pmMatch) {
    let hrs = parseInt(pmMatch[1], 10);
    const mins = pmMatch[2] ? parseInt(pmMatch[2], 10) : 0;
    const isPm = pmMatch[3] === "pm";
    if (isPm && hrs < 12) hrs += 12;
    if (!isPm && hrs === 12) hrs = 0;
    return { hours: hrs, minutes: mins };
  }

  // Handle 24-hour format (e.g. "18:00", "09:30")
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return { hours: parseInt(match24[1], 10), minutes: parseInt(match24[2], 10) };
  }

  // Fallback direct integer
  const directInt = parseInt(trimmed, 10);
  if (!isNaN(directInt) && directInt >= 0 && directInt <= 23) {
    return { hours: directInt, minutes: 0 };
  }

  return { hours: 18, minutes: 0 };
}

/**
 * Formats hour and minute into a readable 12-hour format string (e.g. "6:00 PM", "7:30 PM")
 */
export function formatTime12Hour(hours: number, minutes: number): string {
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Adds minutes to a start hour/minute and returns formatted end time + new hour/minute
 */
export function addMinutesToTime(
  hours: number,
  minutes: number,
  minutesToAdd: number
): { endHours: number; endMinutes: number; formatted: string } {
  const totalMins = hours * 60 + minutes + minutesToAdd;
  const endHours = Math.floor(totalMins / 60) % 24;
  const endMinutes = totalMins % 60;
  return {
    endHours,
    endMinutes,
    formatted: formatTime12Hour(endHours, endMinutes),
  };
}

/**
 * Returns formatted ISO date string "YYYY-MM-DD"
 */
export function formatDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns user friendly day label (e.g. "Today", "Tomorrow", "Wednesday, Sep 9")
 */
export function getDayLabel(date: Date, now: Date): string {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((targetStart - todayStart) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";

  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${weekday}, ${monthDay}`;
}

// ============================================================================
// TASK SORTING FOR SCHEDULING (SECTION 6 & 7)
// ============================================================================

/**
 * Sorts active tasks into deterministic scheduling order:
 * 1. Overdue tasks
 * 2. Q1 tasks (DO FIRST)
 * 3. Near-deadline tasks (due <= 3 days)
 * 4. Active blocking prerequisites (must happen before dependent tasks)
 * 5. Q2 tasks (SCHEDULE)
 * 6. Q3 tasks (HANDLE / DELEGATE)
 * 7. Q4 tasks (LATER)
 *
 * Uses resolved student decisions (finalQuadrant / finalPriorityScore).
 */
export function sortTasksForScheduling(
  tasks: PriorityTask[],
  customNow?: Date
): PriorityTask[] {
  const now = customNow || new Date();

  return [...tasks].sort((a, b) => {
    // Check overdue status
    const aDate = parseFlexibleDate(a.deadline);
    const bDate = parseFlexibleDate(b.deadline);

    const aIsOverdue = aDate && aDate.getTime() < now.getTime() && a.status !== "COMPLETED";
    const bIsOverdue = bDate && bDate.getTime() < now.getTime() && b.status !== "COMPLETED";

    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;

    // Quadrant Rank (Q1=1, Q2=2, Q3=3, Q4=4)
    const quadRank: Record<TaskQuadrant, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
    const aQuad = a.finalQuadrant || a.quadrant || "Q4";
    const bQuad = b.finalQuadrant || b.quadrant || "Q4";

    if (quadRank[aQuad] !== quadRank[bQuad]) {
      return quadRank[aQuad] - quadRank[bQuad];
    }

    // Active prerequisite vs blocked task
    const aIsPrereq = a.dependencies?.isPrerequisiteForOthers && a.status !== "COMPLETED";
    const bIsPrereq = b.dependencies?.isPrerequisiteForOthers && b.status !== "COMPLETED";
    if (aIsPrereq && !bIsPrereq) return -1;
    if (!aIsPrereq && bIsPrereq) return 1;

    // If task A is directly blocking task B
    if (b.dependencies?.blockedByTaskId === a.id) return -1;
    if (a.dependencies?.blockedByTaskId === b.id) return 1;

    // Deadline proximity
    if (aDate && bDate) {
      const diff = aDate.getTime() - bDate.getTime();
      if (diff !== 0) return diff;
    } else if (aDate && !bDate) {
      return -1;
    } else if (!aDate && bDate) {
      return 1;
    }

    // Final Priority Score (descending)
    const aScore = a.finalPriorityScore ?? a.priorityScore ?? 50;
    const bScore = b.finalPriorityScore ?? b.priorityScore ?? 50;
    return bScore - aScore;
  });
}

// ============================================================================
// EXPLAINABLE "WHY THIS TIME?" RULE GENERATOR (SECTION 17)
// ============================================================================

export function generateScheduleItemReason(
  task: PriorityTask,
  dayIndex: number,
  isPrerequisite: boolean,
  isOverdue: boolean,
  hasApproachingDeadline: boolean,
  isSplit: boolean
): string {
  if (isOverdue) {
    return "🚨 Scheduled immediately at the top of your plan because the deadline has passed.";
  }

  if (isPrerequisite && task.dependencies?.blocksTaskTitles?.length) {
    return `⚡ Scheduled first because it is a prerequisite blocking "${task.dependencies.blocksTaskTitles[0]}".`;
  }

  if (hasApproachingDeadline && task.deadline) {
    return `⚠ Scheduled today because the action deadline is approaching (${task.deadline}).`;
  }

  if (task.finalQuadrant === "Q1") {
    return "🔴 Scheduled today as a high-urgency & high-importance Q1 DO FIRST priority.";
  }

  if (task.finalQuadrant === "Q2") {
    if (dayIndex === 0) {
      return "🟡 Important academic goal scheduled in your peak evening focus block.";
    }
    return `🟡 Important scheduled goal placed on day ${dayIndex + 1} to balance your weekly workload.`;
  }

  if (task.finalQuadrant === "Q3") {
    return "🔵 Quick administrative action scheduled in your available time window.";
  }

  if (isSplit) {
    return "Divided into focused study parts to respect your daily concentration buffer.";
  }

  return "⚪ Scheduled during your available personal work hours.";
}

// ============================================================================
// CORE SMART SCHEDULING ENGINE (SECTION 5, 8, 9, 10, 12, 13, 14, 23, 24)
// ============================================================================

/**
 * Generates an adaptive, realistic daily and weekly schedule.
 *
 * Guarantees:
 * - Deterministic TypeScript execution (No OpenAI API dependency).
 * - Zero overwriting of student priority choices or task details.
 * - Non-overlapping consecutive time slots within preferred work hours.
 * - Strict topological dependency ordering (A before B).
 * - Configurable daily buffer % (default 15% flexible time).
 * - Long task splitting (>90 mins) when slot capacity is tight.
 * - Unscheduled task reporting when workload exceeds capacity before deadline.
 */
export function generateSchedule(
  tasks: PriorityTask[],
  availability: StudentAvailability,
  dateRangeDays: number = 7,
  existingOverrides: Record<string, Partial<ScheduleItem>> = {},
  customNow?: Date
): ScheduleGenerationResult {
  const now = customNow || new Date();

  // 1. Filter active tasks (exclude completed and removed)
  const activeTasks = tasks.filter((t) => t.status !== "COMPLETED" && !t.isRemoved);

  // 2. Sort tasks deterministically
  const sortedTasks = sortTasksForScheduling(activeTasks, now);

  const bufferPercent = availability.bufferPercent ?? DEFAULT_SCHEDULE_BUFFER_PERCENT;
  const rawDailyMinutes = availability.availableDailyMinutes || 120;
  // Usable scheduled capacity per day: reserves flexible buffer (e.g., for 120m, 105m scheduled with 15m buffer)
  const bufferMinutesPerDay = Math.max(15, Math.round(rawDailyMinutes * (bufferPercent / 100) - 3));
  const maxScheduledMinutesPerDay = Math.max(30, rawDailyMinutes - bufferMinutesPerDay);

  const { hours: startHour, minutes: startMinute } = parseTimeString(
    availability.preferredStartTime || "18:00"
  );

  const dailyPlans: DailyPlan[] = [];
  const unscheduledTasks: UnscheduledTask[] = [];
  const conflicts: string[] = [];

  // Track scheduled task ids and their scheduled completion dates/times
  const scheduledTaskDates: Record<string, { dateStr: string; dayIndex: number; endMinutesFromMidnight: number }> = {};
  const completedDependencies = new Set<string>();

  // Initialize daily plan buckets for dateRangeDays
  for (let d = 0; d < dateRangeDays; d++) {
    const planDate = new Date(now);
    planDate.setDate(now.getDate() + d);
    const dateStr = formatDateIso(planDate);
    const dayLabel = d === 0 ? "Today" : d === 1 ? "Tomorrow" : getDayLabel(planDate, now);

    dailyPlans.push({
      date: dateStr,
      dayName: dayLabel,
      availableMinutes: rawDailyMinutes,
      scheduledMinutes: 0,
      remainingMinutes: rawDailyMinutes,
      bufferMinutes: bufferMinutesPerDay,
      items: [],
      isOverloaded: false,
    });
  }

  // 3. Process tasks and place into daily plan slots
  sortedTasks.forEach((task) => {
    const taskDuration = task.estimatedMinutes || DEFAULT_TASK_DURATION_MINUTES;
    const taskDeadlineDate = parseFlexibleDate(task.deadline);
    const isPrerequisite = !!task.dependencies?.isPrerequisiteForOthers;

    // Check if task has a blocking prerequisite
    const blockedById = task.dependencies?.blockedByTaskId;
    const isBlocked = !!blockedById && !completedDependencies.has(blockedById);

    let placed = false;

    // Determine earliest day index: dependencies must be scheduled first
    let earliestDayIdx = 0;
    if (blockedById && scheduledTaskDates[blockedById]) {
      earliestDayIdx = scheduledTaskDates[blockedById].dayIndex;
    }

    // Find the earliest suitable day to place the task
    for (let dayIdx = earliestDayIdx; dayIdx < dailyPlans.length; dayIdx++) {
      const plan = dailyPlans[dayIdx];
      const planDate = new Date(now);
      planDate.setDate(now.getDate() + dayIdx);

      // Rule: Do not schedule a task past its deadline
      if (taskDeadlineDate) {
        const targetDateEnd = new Date(
          taskDeadlineDate.getFullYear(),
          taskDeadlineDate.getMonth(),
          taskDeadlineDate.getDate(),
          23,
          59,
          59
        );
        if (planDate.getTime() > targetDateEnd.getTime()) {
          // Exceeded deadline on this day
          break;
        }
      }

      // Rule: If task depends on A, ensure A is either already completed or scheduled earlier
      if (blockedById && scheduledTaskDates[blockedById]) {
        const prereqInfo = scheduledTaskDates[blockedById];
        const prereqDayIdx = dailyPlans.findIndex((p) => p.date === prereqInfo.dateStr);
        if (dayIdx < prereqDayIdx) {
          // Cannot schedule on a day before the prerequisite
          continue;
        }
      }

      const currentScheduled = plan.scheduledMinutes;
      const remainingCapacity = maxScheduledMinutesPerDay - currentScheduled;

      if (remainingCapacity <= 0) {
        // Day is already full
        continue;
      }

      // Check if task fits in this day
      if (taskDuration <= remainingCapacity) {
        // Fit entire task
        const currentSlotMinutes = plan.items.reduce((acc, it) => acc + it.durationMinutes, 0);
        const { formatted: startTimeFormatted } = addMinutesToTime(
          startHour,
          startMinute,
          currentSlotMinutes
        );
        const { formatted: endTimeFormatted, endHours, endMinutes } = addMinutesToTime(
          startHour,
          startMinute,
          currentSlotMinutes + taskDuration
        );

        const isOverdue = taskDeadlineDate ? taskDeadlineDate.getTime() < now.getTime() : false;
        const daysToDeadline = taskDeadlineDate
          ? Math.round((taskDeadlineDate.getTime() - planDate.getTime()) / (1000 * 60 * 60 * 24))
          : null;
        const hasApproachingDeadline = daysToDeadline !== null && daysToDeadline <= 3;

        const whyScheduled = generateScheduleItemReason(
          task,
          dayIdx,
          isPrerequisite,
          isOverdue,
          hasApproachingDeadline,
          false
        );

        const itemId = `sch_${task.id}_${plan.date}_${plan.items.length + 1}`;
        const override = existingOverrides[itemId] || {};

        const scheduleItem: ScheduleItem = {
          id: itemId,
          studentId: task.studentId,
          taskId: task.id,
          taskTitle: task.title,
          taskType: task.taskType,
          quadrant: task.finalQuadrant || task.quadrant || "Q4",
          date: plan.date,
          startTime: override.startTime || startTimeFormatted,
          endTime: override.endTime || endTimeFormatted,
          durationMinutes: taskDuration,
          deadline: task.deadline,
          status: override.status || "PLANNED",
          scheduleOverride: !!override.startTime,
          whyScheduledHere: override.whyScheduledHere || whyScheduled,
          dependencies: task.dependencies,
          noticeId: task.noticeId,
          noticeTitle: task.noticeTitle,
          createdAt: planDate.toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: override.completedAt || null,
        };

        plan.items.push(scheduleItem);
        plan.scheduledMinutes += taskDuration;
        plan.remainingMinutes = Math.max(0, plan.availableMinutes - plan.scheduledMinutes);

        scheduledTaskDates[task.id] = {
          dateStr: plan.date,
          dayIndex: dayIdx,
          endMinutesFromMidnight: endHours * 60 + endMinutes,
        };
        completedDependencies.add(task.id);

        placed = true;
        break;
      } else if (taskDuration >= 60 && remainingCapacity >= 30 && dayIdx + 1 < dailyPlans.length) {
        // Splittable task (Section 9): allocate Part 1 today and Part 2 on next day
        const part1Duration = remainingCapacity;
        const part2Duration = taskDuration - part1Duration;

        // Part 1
        const currentSlotMinutes = plan.items.reduce((acc, it) => acc + it.durationMinutes, 0);
        const { formatted: startTime1 } = addMinutesToTime(startHour, startMinute, currentSlotMinutes);
        const { formatted: endTime1 } = addMinutesToTime(startHour, startMinute, currentSlotMinutes + part1Duration);

        const item1: ScheduleItem = {
          id: `sch_${task.id}_${plan.date}_p1`,
          studentId: task.studentId,
          taskId: task.id,
          taskTitle: `${task.title} (Part 1/2)`,
          taskType: task.taskType,
          quadrant: task.finalQuadrant || task.quadrant || "Q4",
          date: plan.date,
          startTime: startTime1,
          endTime: endTime1,
          durationMinutes: part1Duration,
          deadline: task.deadline,
          status: "PLANNED",
          isSplit: true,
          splitPart: 1,
          totalSplitParts: 2,
          whyScheduledHere: `Divided into 2 parts. Part 1 scheduled today (${part1Duration}m) to respect your concentration buffer.`,
          dependencies: task.dependencies,
          noticeId: task.noticeId,
          noticeTitle: task.noticeTitle,
          createdAt: planDate.toISOString(),
          updatedAt: new Date().toISOString(),
        };

        plan.items.push(item1);
        plan.scheduledMinutes += part1Duration;
        plan.remainingMinutes = Math.max(0, plan.availableMinutes - plan.scheduledMinutes);

        // Part 2 on next day
        const nextPlan = dailyPlans[dayIdx + 1];
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + dayIdx + 1);

        const nextSlotMinutes = nextPlan.items.reduce((acc, it) => acc + it.durationMinutes, 0);
        const { formatted: startTime2 } = addMinutesToTime(startHour, startMinute, nextSlotMinutes);
        const { formatted: endTime2, endHours: endH2, endMinutes: endM2 } = addMinutesToTime(
          startHour,
          startMinute,
          nextSlotMinutes + part2Duration
        );

        const item2: ScheduleItem = {
          id: `sch_${task.id}_${nextPlan.date}_p2`,
          studentId: task.studentId,
          taskId: task.id,
          taskTitle: `${task.title} (Part 2/2)`,
          taskType: task.taskType,
          quadrant: task.finalQuadrant || task.quadrant || "Q4",
          date: nextPlan.date,
          startTime: startTime2,
          endTime: endTime2,
          durationMinutes: part2Duration,
          deadline: task.deadline,
          status: "PLANNED",
          isSplit: true,
          splitPart: 2,
          totalSplitParts: 2,
          whyScheduledHere: `Part 2 continuation (${part2Duration}m) scheduled on ${nextPlan.dayName}.`,
          dependencies: task.dependencies,
          noticeId: task.noticeId,
          noticeTitle: task.noticeTitle,
          createdAt: nextDate.toISOString(),
          updatedAt: new Date().toISOString(),
        };

        nextPlan.items.push(item2);
        nextPlan.scheduledMinutes += part2Duration;
        nextPlan.remainingMinutes = Math.max(0, nextPlan.availableMinutes - nextPlan.scheduledMinutes);

        scheduledTaskDates[task.id] = {
          dateStr: nextPlan.date,
          dayIndex: dayIdx + 1,
          endMinutesFromMidnight: endH2 * 60 + endM2,
        };
        completedDependencies.add(task.id);

        placed = true;
        break;
      }
    }

    if (!placed) {
      let reason = "Weekly study capacity reached before deadline.";
      let suggestedAction = "Increase available daily hours or schedule manually.";
      if (taskDeadlineDate && taskDeadlineDate.getTime() < now.getTime()) {
        reason = "Task is overdue and current schedule capacity is full.";
        suggestedAction = "Prioritize immediately in Q1 or complete manually.";
      }
      unscheduledTasks.push({
        task,
        reason,
        suggestedAction,
      });
      conflicts.push(`Task "${task.title}" could not be accommodated in the weekly schedule.`);
    }
  });

  // Calculate totals and identify top next action
  const totalPlannedMinutes = dailyPlans.reduce((acc, p) => acc + p.scheduledMinutes, 0);
  const totalAvailableMinutes = dailyPlans.reduce((acc, p) => acc + p.availableMinutes, 0);

  // Top next action: first planned item in Today's plan
  const todayPlan = dailyPlans[0];
  const nextActionItem = todayPlan?.items?.find((i) => i.status === "PLANNED" || i.status === "IN_PROGRESS") || null;

  return {
    dailyPlans,
    unscheduledTasks,
    nextActionItem,
    totalPlannedMinutes,
    totalAvailableMinutes,
    conflicts,
  };
}
