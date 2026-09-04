import {
  StudentNotification,
  StudentNotificationPreferences,
  NotificationPriority,
  NotificationType,
  PriorityTask,
  NoticeWithRelevance,
  StudentProfile,
  ScheduleGenerationResult,
  ScheduleItem,
} from "@/types/student";
import { parseFlexibleDate } from "../priorityEngine";
import { parseTimeString, formatDateIso } from "../scheduling/scheduleEngine";

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

export const DEFAULT_SCHEDULE_REMINDER_MINUTES = 15;

export const DEFAULT_NOTIFICATION_PREFERENCES: StudentNotificationPreferences = {
  studentId: "default",
  deadlineReminders: true,
  scheduledTaskReminders: true,
  noticeUpdates: true,
  dependencyAlerts: true,
  importantAlerts: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
};

// ============================================================================
// TIME & QUIET HOURS HELPERS
// ============================================================================

/**
 * Checks if a given time falls within the student's configured Quiet Hours.
 * Critical/HIGH priority notifications may still display in notification center,
 * but routine notification alerts are throttled.
 */
export function isQuietHours(
  preferences: StudentNotificationPreferences,
  now: Date = new Date()
): boolean {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const { hours: startH, minutes: startM } = parseTimeString(preferences.quietHoursStart || "22:00");
  const { hours: endH, minutes: endM } = parseTimeString(preferences.quietHoursEnd || "07:00");

  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  if (startTotal > endTotal) {
    // Over midnight (e.g. 22:00 to 07:00)
    return currentMinutes >= startTotal || currentMinutes < endTotal;
  } else {
    // Same day (e.g. 13:00 to 15:00)
    return currentMinutes >= startTotal && currentMinutes < endTotal;
  }
}

/**
 * Formats a relative timestamp (e.g. "Just now", "15m ago", "2h ago", "Yesterday")
 */
export function formatRelativeTime(isoDateStr: string, now: Date = new Date()): string {
  if (!isoDateStr) return "Just now";
  const date = new Date(isoDateStr);
  if (isNaN(date.getTime())) return "Recently";

  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 45) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ============================================================================
// REMINDER GENERATOR ENGINES (SECTION 8, 9, 10, 11, 12, 13, 14, 15, 16, 17)
// ============================================================================

/**
 * 1. Generate NOTICE_RECEIVED & NOTICE_UPDATED notifications
 */
export function generateNoticeNotifications(
  noticesWithRel: NoticeWithRelevance[],
  student: StudentProfile,
  preferences: StudentNotificationPreferences,
  now: Date = new Date()
): StudentNotification[] {
  if (!preferences.noticeUpdates && !preferences.importantAlerts) return [];

  const notifications: StudentNotification[] = [];

  noticesWithRel.forEach((notice) => {
    // Only generate for relevant notices (strictly exclude NOT_RELEVANT)
    if (notice.relevance.relevance === "NOT_RELEVANT") return;

    const noticeCreatedDate = new Date(notice.createdAt);
    const noticeUpdatedDate = notice.updatedAt ? new Date(notice.updatedAt) : noticeCreatedDate;

    // Check if updated after initial publishing
    const isUpdated =
      notice.updatedAt &&
      noticeUpdatedDate.getTime() - noticeCreatedDate.getTime() > 1000 * 60 * 2; // > 2 mins difference

    if (isUpdated && preferences.noticeUpdates) {
      const dedupKey = `${student.id}_notice_updated_${notice.id}_${formatDateIso(noticeUpdatedDate)}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: student.id,
        type: "NOTICE_UPDATED",
        title: "📢 Notice Updated",
        message: `"${notice.title}" has been updated with revised information or deadlines.`,
        noticeId: notice.id,
        priority: notice.relevance.relevance === "HIGH" ? "HIGH" : "MEDIUM",
        isRead: false,
        createdAt: noticeUpdatedDate.toISOString(),
        actionUrl: `/student/actions`,
        deduplicationKey: dedupKey,
        badgeLabel: "Updated",
      });
    } else {
      // Notice Received
      const dedupKey = `${student.id}_notice_received_${notice.id}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: student.id,
        type: "NOTICE_RECEIVED",
        title: "📢 New Relevant Notice",
        message: `"${notice.title}" requires your attention (${notice.relevance.reasons[0] || "Targeted to your profile"}).`,
        noticeId: notice.id,
        priority: notice.relevance.relevance === "HIGH" ? "HIGH" : "LOW",
        isRead: false,
        createdAt: noticeCreatedDate.toISOString(),
        actionUrl: `/student/actions`,
        deduplicationKey: dedupKey,
        badgeLabel: notice.relevance.relevance === "HIGH" ? "High Match" : "Relevant",
      });
    }
  });

  return notifications;
}

/**
 * 2. Generate DEADLINE_APPROACHING & TASK_OVERDUE notifications
 */
export function generateDeadlineNotifications(
  tasks: PriorityTask[],
  preferences: StudentNotificationPreferences,
  now: Date = new Date()
): StudentNotification[] {
  if (!preferences.deadlineReminders) return [];

  const notifications: StudentNotification[] = [];
  const nowDateStr = formatDateIso(now);

  tasks.forEach((task) => {
    if (task.status === "COMPLETED" || task.isRemoved) return;
    if (!task.deadline) return;

    const deadlineDate = parseFlexibleDate(task.deadline);
    if (!deadlineDate) return;

    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetMidnight = new Date(
      deadlineDate.getFullYear(),
      deadlineDate.getMonth(),
      deadlineDate.getDate()
    ).getTime();

    const diffDays = Math.round((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
    const isQ1 = task.finalQuadrant === "Q1";

    if (diffDays < 0) {
      // OVERDUE
      const dedupKey = `${task.studentId}_overdue_${task.id}_${nowDateStr}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: task.studentId,
        type: "TASK_OVERDUE",
        title: "🚨 Task Overdue",
        message: `"${task.title}" was due on ${task.deadline}. Complete or reschedule this action as soon as possible.`,
        taskId: task.id,
        noticeId: task.noticeId,
        priority: "HIGH",
        isRead: false,
        createdAt: now.toISOString(),
        actionUrl: `/student/actions/${task.id}`,
        deduplicationKey: dedupKey,
        badgeLabel: "Overdue",
      });
    } else if (diffDays === 0) {
      // Due Today
      const dedupKey = `${task.studentId}_due_today_${task.id}_${nowDateStr}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: task.studentId,
        type: "DEADLINE_APPROACHING",
        title: "🔴 Due Today",
        message: `"${task.title}" is due today (${task.deadline}). Prioritize this action to avoid missing the cutoff.`,
        taskId: task.id,
        noticeId: task.noticeId,
        priority: "HIGH",
        isRead: false,
        createdAt: now.toISOString(),
        actionUrl: `/student/actions/${task.id}`,
        deduplicationKey: dedupKey,
        badgeLabel: "Today",
      });
    } else if (diffDays === 1) {
      // Due Tomorrow
      const dedupKey = `${task.studentId}_due_tomorrow_${task.id}_${nowDateStr}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: task.studentId,
        type: "DEADLINE_APPROACHING",
        title: isQ1 ? "🔴 Critical Deadline Tomorrow" : "⚠ Deadline Tomorrow",
        message: `"${task.title}" is due tomorrow (${task.deadline}).`,
        taskId: task.id,
        noticeId: task.noticeId,
        priority: isQ1 ? "HIGH" : "MEDIUM",
        isRead: false,
        createdAt: now.toISOString(),
        actionUrl: `/student/actions/${task.id}`,
        deduplicationKey: dedupKey,
        badgeLabel: "Tomorrow",
      });
    } else if (diffDays <= 3) {
      // 2–3 Days
      const dedupKey = `${task.studentId}_due_3d_${task.id}_${nowDateStr}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: task.studentId,
        type: "DEADLINE_APPROACHING",
        title: "⚠ Deadline Approaching",
        message: `"${task.title}" is due in ${diffDays} days (${task.deadline}).`,
        taskId: task.id,
        noticeId: task.noticeId,
        priority: isQ1 ? "HIGH" : "MEDIUM",
        isRead: false,
        createdAt: now.toISOString(),
        actionUrl: `/student/actions/${task.id}`,
        deduplicationKey: dedupKey,
        badgeLabel: `${diffDays} Days Left`,
      });
    } else if (diffDays <= 7 && (task.finalQuadrant === "Q1" || task.finalQuadrant === "Q2")) {
      // 4–7 Days (only for Q1 & Q2 tasks to prevent spam)
      const dedupKey = `${task.studentId}_due_7d_${task.id}_${nowDateStr}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: task.studentId,
        type: "TASK_DUE_SOON",
        title: "📅 Upcoming Deadline",
        message: `"${task.title}" is scheduled due next week on ${task.deadline}.`,
        taskId: task.id,
        noticeId: task.noticeId,
        priority: "LOW",
        isRead: false,
        createdAt: now.toISOString(),
        actionUrl: `/student/actions/${task.id}`,
        deduplicationKey: dedupKey,
        badgeLabel: "Upcoming",
      });
    }
  });

  return notifications;
}

/**
 * 3. Generate DEPENDENCY_BLOCKED notifications
 */
export function generateDependencyNotifications(
  tasks: PriorityTask[],
  preferences: StudentNotificationPreferences,
  now: Date = new Date()
): StudentNotification[] {
  if (!preferences.dependencyAlerts && !preferences.importantAlerts) return [];

  const notifications: StudentNotification[] = [];
  const completedIds = new Set(
    tasks.filter((t) => t.status === "COMPLETED").map((t) => t.id)
  );

  tasks.forEach((task) => {
    if (task.status === "COMPLETED" || task.isRemoved) return;

    const blockedById = task.dependencies?.blockedByTaskId;
    if (blockedById && !completedIds.has(blockedById)) {
      const prereqTask = tasks.find((t) => t.id === blockedById);
      const prereqTitle = prereqTask?.title || task.dependencies?.blockedByTaskTitle || "Prerequisite action";

      const dedupKey = `${task.studentId}_dependency_blocked_${task.id}_${blockedById}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: task.studentId,
        type: "DEPENDENCY_BLOCKED",
        title: "🔒 Action Blocked",
        message: `"${task.title}" cannot proceed until you complete "${prereqTitle}".`,
        taskId: task.id,
        noticeId: task.noticeId,
        priority: task.finalQuadrant === "Q1" ? "HIGH" : "MEDIUM",
        isRead: false,
        createdAt: now.toISOString(),
        actionUrl: `/student/actions/${blockedById}`,
        deduplicationKey: dedupKey,
        badgeLabel: "Prerequisite Required",
      });
    }
  });

  return notifications;
}

/**
 * 4. Generate SCHEDULED_TASK notifications
 */
export function generateScheduleNotifications(
  scheduleResult: ScheduleGenerationResult,
  preferences: StudentNotificationPreferences,
  reminderMinutesBefore: number = DEFAULT_SCHEDULE_REMINDER_MINUTES,
  now: Date = new Date()
): StudentNotification[] {
  if (!preferences.scheduledTaskReminders) return [];

  const notifications: StudentNotification[] = [];
  const todayPlan = scheduleResult.dailyPlans[0];
  if (!todayPlan) return [];

  const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();

  todayPlan.items.forEach((item) => {
    if (item.status === "COMPLETED" || item.status === "SKIPPED") return;

    const { hours, minutes } = parseTimeString(item.startTime);
    const slotStartMinutes = hours * 60 + minutes;

    // Trigger reminder within [slotStart - reminderMinutes, slotStart + 15m]
    const windowStart = slotStartMinutes - reminderMinutesBefore;
    const windowEnd = slotStartMinutes + 15;

    if (currentMinutesFromMidnight >= windowStart && currentMinutesFromMidnight <= windowEnd) {
      const dedupKey = `${item.studentId}_schedule_starting_soon_${item.id}_${item.date}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: item.studentId,
        type: "SCHEDULED_TASK",
        title: "🔔 Scheduled Action Starting Soon",
        message: `"${item.taskTitle}" is scheduled for ${item.startTime} today (${item.durationMinutes} min focus session).`,
        taskId: item.taskId,
        noticeId: item.noticeId,
        priority: "MEDIUM",
        isRead: false,
        createdAt: now.toISOString(),
        actionUrl: `/student/schedule`,
        deduplicationKey: dedupKey,
        badgeLabel: item.startTime,
      });
    }
  });

  return notifications;
}

/**
 * 5. Generate SCHEDULE_CONFLICT notifications
 */
export function generateScheduleConflictNotifications(
  scheduleResult: ScheduleGenerationResult,
  studentId: string,
  preferences: StudentNotificationPreferences,
  now: Date = new Date()
): StudentNotification[] {
  if (!preferences.scheduledTaskReminders || scheduleResult.conflicts.length === 0) {
    return [];
  }

  const nowDateStr = formatDateIso(now);
  const dedupKey = `${studentId}_schedule_conflict_${nowDateStr}`;

  return [
    {
      id: `notif_${dedupKey}`,
      studentId,
      type: "SCHEDULE_CONFLICT",
      title: "⚠ Schedule Capacity Overload",
      message: `Your current task workload exceeds available study hours this week. Review unscheduled tasks in your plan.`,
      priority: "MEDIUM",
      isRead: false,
      createdAt: now.toISOString(),
      actionUrl: `/student/schedule`,
      deduplicationKey: dedupKey,
      badgeLabel: "Conflict",
    },
  ];
}

// ============================================================================
// DEDUPLICATION & SYNC ENGINE (SECTION 21, 22)
// ============================================================================

/**
 * Deduplicates and syncs newly generated notifications with the student's existing notification history.
 *
 * Guarantees:
 * - Deterministic, non-spamming alerts using compound deduplicationKey.
 * - Preserves existing isRead and readAt states.
 * - Strict multi-tenant isolation by studentId.
 * - Sorts by Priority (HIGH > MEDIUM > LOW) and Timestamp (newest first).
 */
export function syncAndDeduplicateAllNotifications(
  student: StudentProfile,
  noticesWithRel: NoticeWithRelevance[],
  tasks: PriorityTask[],
  scheduleResult: ScheduleGenerationResult,
  existingNotifications: StudentNotification[],
  preferences: StudentNotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES,
  now: Date = new Date()
): StudentNotification[] {
  // 1. Gather all generated notifications from all sub-engines
  const noticeNotifs = generateNoticeNotifications(noticesWithRel, student, preferences, now);
  const deadlineNotifs = generateDeadlineNotifications(tasks, preferences, now);
  const dependencyNotifs = generateDependencyNotifications(tasks, preferences, now);
  const scheduleNotifs = generateScheduleNotifications(scheduleResult, preferences, DEFAULT_SCHEDULE_REMINDER_MINUTES, now);
  const conflictNotifs = generateScheduleConflictNotifications(scheduleResult, student.id, preferences, now);

  const incomingAll = [
    ...noticeNotifs,
    ...deadlineNotifs,
    ...dependencyNotifs,
    ...scheduleNotifs,
    ...conflictNotifs,
  ];

  // 2. Build map of existing notifications for this student
  const existingMap = new Map<string, StudentNotification>();
  existingNotifications
    .filter((n) => n.studentId === student.id)
    .forEach((n) => existingMap.set(n.deduplicationKey, n));

  // 3. Merge incoming while strictly preserving read states
  incomingAll.forEach((incoming) => {
    const existing = existingMap.get(incoming.deduplicationKey);
    if (existing) {
      // Update mutable fields but keep isRead & readAt intact
      existingMap.set(incoming.deduplicationKey, {
        ...existing,
        title: incoming.title,
        message: incoming.message,
        priority: incoming.priority,
        actionUrl: incoming.actionUrl,
        badgeLabel: incoming.badgeLabel,
      });
    } else {
      existingMap.set(incoming.deduplicationKey, incoming);
    }
  });

  // 4. Sort notifications deterministically: Unread first, then HIGH > MEDIUM > LOW, then Date
  const priorityRank: Record<NotificationPriority, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };

  return Array.from(existingMap.values()).sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1; // Unread first
    }
    if (priorityRank[a.priority] !== priorityRank[b.priority]) {
      return priorityRank[a.priority] - priorityRank[b.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
