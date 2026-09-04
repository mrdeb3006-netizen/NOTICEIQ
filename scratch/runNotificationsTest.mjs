function parseTimeString(timeStr) {
  if (!timeStr) return { hours: 18, minutes: 0 };
  const trimmed = timeStr.trim().toLowerCase();
  const pmMatch = trimmed.match(/(\d+)(?::(\d+))?\s*(pm|am)/);
  if (pmMatch) {
    let hrs = parseInt(pmMatch[1], 10);
    const mins = pmMatch[2] ? parseInt(pmMatch[2], 10) : 0;
    const isPm = pmMatch[3] === "pm";
    if (isPm && hrs < 12) hrs += 12;
    if (!isPm && hrs === 12) hrs = 0;
    return { hours: hrs, minutes: mins };
  }
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return { hours: parseInt(match24[1], 10), minutes: parseInt(match24[2], 10) };
  }
  return { hours: 18, minutes: 0 };
}

function formatDateIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseFlexibleDate(deadlineStr) {
  if (!deadlineStr) return null;
  const direct = new Date(deadlineStr);
  if (!isNaN(direct.getTime())) return direct;
  return null;
}

const DEFAULT_NOTIFICATION_PREFERENCES = {
  studentId: "default",
  deadlineReminders: true,
  scheduledTaskReminders: true,
  noticeUpdates: true,
  dependencyAlerts: true,
  importantAlerts: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
};

function generateNoticeNotifications(noticesWithRel, student, preferences, now = new Date()) {
  if (!preferences.noticeUpdates && !preferences.importantAlerts) return [];
  const notifications = [];

  noticesWithRel.forEach((notice) => {
    if (notice.relevance.relevance === "NOT_RELEVANT") return;

    const noticeCreatedDate = new Date(notice.createdAt);
    const noticeUpdatedDate = notice.updatedAt ? new Date(notice.updatedAt) : noticeCreatedDate;

    const isUpdated =
      notice.updatedAt &&
      noticeUpdatedDate.getTime() - noticeCreatedDate.getTime() > 1000 * 60 * 2;

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
      const dedupKey = `${student.id}_notice_received_${notice.id}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: student.id,
        type: "NOTICE_RECEIVED",
        title: "📢 New Relevant Notice",
        message: `"${notice.title}" requires your attention.`,
        noticeId: notice.id,
        priority: notice.relevance.relevance === "HIGH" ? "HIGH" : "LOW",
        isRead: false,
        createdAt: noticeCreatedDate.toISOString(),
        actionUrl: `/student/actions`,
        deduplicationKey: dedupKey,
        badgeLabel: "Relevant",
      });
    }
  });

  return notifications;
}

function generateDeadlineNotifications(tasks, preferences, now = new Date()) {
  if (!preferences.deadlineReminders) return [];
  const notifications = [];
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
      const dedupKey = `${task.studentId}_overdue_${task.id}_${nowDateStr}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: task.studentId,
        type: "TASK_OVERDUE",
        title: "🚨 Task Overdue",
        message: `"${task.title}" was due on ${task.deadline}. Complete or reschedule as soon as possible.`,
        taskId: task.id,
        priority: "HIGH",
        isRead: false,
        createdAt: now.toISOString(),
        actionUrl: `/student/actions/${task.id}`,
        deduplicationKey: dedupKey,
        badgeLabel: "Overdue",
      });
    } else if (diffDays === 0) {
      const dedupKey = `${task.studentId}_due_today_${task.id}_${nowDateStr}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: task.studentId,
        type: "DEADLINE_APPROACHING",
        title: "🔴 Due Today",
        message: `"${task.title}" is due today.`,
        taskId: task.id,
        priority: "HIGH",
        isRead: false,
        createdAt: now.toISOString(),
        actionUrl: `/student/actions/${task.id}`,
        deduplicationKey: dedupKey,
        badgeLabel: "Today",
      });
    } else if (diffDays === 1) {
      const dedupKey = `${task.studentId}_due_tomorrow_${task.id}_${nowDateStr}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: task.studentId,
        type: "DEADLINE_APPROACHING",
        title: isQ1 ? "🔴 Critical Deadline Tomorrow" : "⚠ Deadline Tomorrow",
        message: `"${task.title}" is due tomorrow.`,
        taskId: task.id,
        priority: isQ1 ? "HIGH" : "MEDIUM",
        isRead: false,
        createdAt: now.toISOString(),
        actionUrl: `/student/actions/${task.id}`,
        deduplicationKey: dedupKey,
        badgeLabel: "Tomorrow",
      });
    } else if (diffDays <= 3) {
      const dedupKey = `${task.studentId}_due_3d_${task.id}_${nowDateStr}`;
      notifications.push({
        id: `notif_${dedupKey}`,
        studentId: task.studentId,
        type: "DEADLINE_APPROACHING",
        title: "⚠ Deadline Approaching",
        message: `"${task.title}" is due in ${diffDays} days (${task.deadline}).`,
        taskId: task.id,
        priority: isQ1 ? "HIGH" : "MEDIUM",
        isRead: false,
        createdAt: now.toISOString(),
        actionUrl: `/student/actions/${task.id}`,
        deduplicationKey: dedupKey,
        badgeLabel: `${diffDays} Days Left`,
      });
    }
  });

  return notifications;
}

function generateDependencyNotifications(tasks, preferences, now = new Date()) {
  if (!preferences.dependencyAlerts && !preferences.importantAlerts) return [];
  const notifications = [];
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

function generateScheduleNotifications(scheduleResult, preferences, reminderMinutesBefore = 15, now = new Date()) {
  if (!preferences.scheduledTaskReminders) return [];
  const notifications = [];
  const todayPlan = scheduleResult.dailyPlans[0];
  if (!todayPlan) return [];

  const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();

  todayPlan.items.forEach((item) => {
    if (item.status === "COMPLETED" || item.status === "SKIPPED") return;

    const { hours, minutes } = parseTimeString(item.startTime);
    const slotStartMinutes = hours * 60 + minutes;

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

function generateScheduleConflictNotifications(scheduleResult, studentId, preferences, now = new Date()) {
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
      message: `Your current task workload exceeds available study hours this week.`,
      priority: "MEDIUM",
      isRead: false,
      createdAt: now.toISOString(),
      actionUrl: `/student/schedule`,
      deduplicationKey: dedupKey,
      badgeLabel: "Conflict",
    },
  ];
}

function syncAndDeduplicateAllNotifications(
  student,
  noticesWithRel,
  tasks,
  scheduleResult,
  existingNotifications,
  preferences = DEFAULT_NOTIFICATION_PREFERENCES,
  now = new Date()
) {
  const noticeNotifs = generateNoticeNotifications(noticesWithRel, student, preferences, now);
  const deadlineNotifs = generateDeadlineNotifications(tasks, preferences, now);
  const dependencyNotifs = generateDependencyNotifications(tasks, preferences, now);
  const scheduleNotifs = generateScheduleNotifications(scheduleResult, preferences, 15, now);
  const conflictNotifs = generateScheduleConflictNotifications(scheduleResult, student.id, preferences, now);

  const incomingAll = [
    ...noticeNotifs,
    ...deadlineNotifs,
    ...dependencyNotifs,
    ...scheduleNotifs,
    ...conflictNotifs,
  ];

  const existingMap = new Map();
  existingNotifications
    .filter((n) => n.studentId === student.id)
    .forEach((n) => existingMap.set(n.deduplicationKey, n));

  incomingAll.forEach((incoming) => {
    const existing = existingMap.get(incoming.deduplicationKey);
    if (existing) {
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

  const priorityRank = { HIGH: 1, MEDIUM: 2, LOW: 3 };

  return Array.from(existingMap.values()).sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    if (priorityRank[a.priority] !== priorityRank[b.priority]) {
      return priorityRank[a.priority] - priorityRank[b.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

console.log("================================================================================");
console.log("🧪 NOTICEIQ STEP 10: SMART NOTIFICATIONS + REMINDER ENGINE TEST SUITE");
console.log("================================================================================");

let allPassed = true;
function assert(desc, condition) {
  if (condition) {
    console.log(`✅ [PASS] ${desc}`);
  } else {
    console.error(`❌ [FAIL] ${desc}`);
    allPassed = false;
  }
}

const fixedNow = new Date(2026, 8, 8, 17, 45, 0); // 5:45 PM Local Time (15 mins before 6:00 PM)

const studentDebendra = {
  id: "std_debendra",
  institutionId: "inst_fiem",
  institutionName: "FIEM",
  institutionType: "college",
  name: "Debendra Bera",
  email: "debendra.bera@fiem.edu.in",
  department: "CSE",
  year: "1st Year",
  section: "A",
  rollNumber: "23",
  status: "active",
  accessType: "COLLEGE_EMAIL",
  interests: ["Coding"],
  preferredStartTime: "18:00",
  preferredEndTime: "22:00",
  availableDailyHours: "2 hours",
  onboardingCompleted: true,
  joinedDate: "2026-09-01",
};

const studentPriya = {
  id: "std_priya",
  institutionId: "inst_fiem",
  institutionName: "FIEM",
  institutionType: "college",
  name: "Priya Sharma",
  email: "priya.sharma@fiem.edu.in",
  department: "ECE",
  year: "3rd Year",
  section: "B",
  rollNumber: "45",
  status: "active",
  accessType: "COLLEGE_EMAIL",
  interests: ["Robotics"],
  preferredStartTime: "19:00",
  preferredEndTime: "22:00",
  availableDailyHours: "2 hours",
  onboardingCompleted: true,
  joinedDate: "2026-09-01",
};

// ============================================================================
// TEST 1: Relevant Notice Notification (Section 8 & 42 TEST 1)
// ============================================================================
console.log("\n--- TEST 1: Relevant Notice Notification (Excluding NOT_RELEVANT) ---");

const noticesWithRel = [
  {
    id: "not_scholarship_cse",
    title: "CSE Merit Scholarship 2026",
    content: "Full scholarship for 1st Year CSE",
    createdAt: "2026-09-08T10:00:00Z",
    status: "published",
    relevance: {
      id: "rel_1",
      noticeId: "not_scholarship_cse",
      studentId: "std_debendra",
      relevance: "HIGH",
      score: 95,
      reasons: ["Targeted for CSE 1st Year"],
      matchedCriteria: ["CSE", "1st Year"],
      unmatchedCriteria: [],
      createdAt: "2026-09-08T10:00:00Z",
      updatedAt: "2026-09-08T10:00:00Z",
    },
  },
  {
    id: "not_ece_only",
    title: "ECE Final Year Robotics Lab",
    content: "For ECE 4th year only",
    createdAt: "2026-09-08T10:00:00Z",
    status: "published",
    relevance: {
      id: "rel_2",
      noticeId: "not_ece_only",
      studentId: "std_debendra",
      relevance: "NOT_RELEVANT",
      score: 10,
      reasons: ["Requires ECE 4th year"],
      matchedCriteria: [],
      unmatchedCriteria: ["Department mismatch"],
      createdAt: "2026-09-08T10:00:00Z",
      updatedAt: "2026-09-08T10:00:00Z",
    },
  },
];

const noticeNotifs = generateNoticeNotifications(noticesWithRel, studentDebendra, DEFAULT_NOTIFICATION_PREFERENCES, fixedNow);
assert("Relevant notice generates NOTICE_RECEIVED notification", noticeNotifs.some(n => n.type === "NOTICE_RECEIVED" && n.noticeId === "not_scholarship_cse"));
assert("NOT_RELEVANT notice is strictly excluded from generating alerts", !noticeNotifs.some(n => n.noticeId === "not_ece_only"));

// ============================================================================
// TEST 2 & 3: Deadline Reminders & Overdue Detection (Section 9, 10, 13, 42 TEST 2 & 3)
// ============================================================================
console.log("\n--- TEST 2 & 3: Deadline Approaching & Overdue Reminders ---");

const testTasks = [
  {
    id: "task_tomorrow_due",
    studentId: "std_debendra",
    title: "Submit Scholarship Application",
    deadline: "2026-09-09", // Tomorrow
    estimatedMinutes: 30,
    finalQuadrant: "Q1",
    status: "TODO",
  },
  {
    id: "task_overdue",
    studentId: "std_debendra",
    title: "Submit Registration Slip",
    deadline: "2026-09-05", // Overdue (past)
    estimatedMinutes: 20,
    finalQuadrant: "Q1",
    status: "TODO",
  },
  {
    id: "task_future_10d",
    studentId: "std_debendra",
    title: "Prepare Term Paper",
    deadline: "2026-09-25", // 17 days away
    estimatedMinutes: 60,
    finalQuadrant: "Q2",
    status: "TODO",
  },
];

const deadlineNotifs = generateDeadlineNotifications(testTasks, DEFAULT_NOTIFICATION_PREFERENCES, fixedNow);
assert("Task due tomorrow generates DEADLINE_APPROACHING alert", deadlineNotifs.some(n => n.type === "DEADLINE_APPROACHING" && n.taskId === "task_tomorrow_due"));
assert("Overdue task generates TASK_OVERDUE alert with HIGH priority", deadlineNotifs.some(n => n.type === "TASK_OVERDUE" && n.taskId === "task_overdue" && n.priority === "HIGH"));
assert("Far future task (>7 days) does not generate immediate urgent spam", !deadlineNotifs.some(n => n.taskId === "task_future_10d"));

// ============================================================================
// TEST 4: Scheduled Task Starting Soon Reminder (Section 12 & 42 TEST 4)
// ============================================================================
console.log("\n--- TEST 4: Scheduled Task 15-Minute Reminder ---");

const mockScheduleResult = {
  dailyPlans: [
    {
      date: "2026-09-08",
      dayName: "Today",
      availableMinutes: 120,
      scheduledMinutes: 60,
      remainingMinutes: 60,
      bufferMinutes: 18,
      items: [
        {
          id: "sch_item_income",
          studentId: "std_debendra",
          taskId: "task_income",
          taskTitle: "Obtain Income Certificate",
          startTime: "18:00", // 6:00 PM (15 mins from fixedNow: 17:45)
          endTime: "18:30",
          durationMinutes: 30,
          quadrant: "Q1",
          status: "PLANNED",
          whyScheduledHere: "Q1 prerequisite",
          date: "2026-09-08",
        },
      ],
    },
  ],
  unscheduledTasks: [],
  nextActionItem: null,
  totalPlannedMinutes: 60,
  totalAvailableMinutes: 120,
  conflicts: [],
};

const scheduleNotifs = generateScheduleNotifications(mockScheduleResult, DEFAULT_NOTIFICATION_PREFERENCES, 15, fixedNow);
assert("Scheduled task triggers SCHEDULED_TASK reminder 15 mins before start", scheduleNotifs.some(n => n.type === "SCHEDULED_TASK" && n.taskId === "task_income"));

// ============================================================================
// TEST 5 & 6: Dependency Blocked & Completion Resolution (Section 14 & 42 TEST 5 & 6)
// ============================================================================
console.log("\n--- TEST 5 & 6: Dependency Blocked and Auto-Resolution ---");

const blockedTasks = [
  {
    id: "task_prereq_income",
    studentId: "std_debendra",
    title: "Obtain Income Certificate",
    status: "TODO", // Incomplete
    dependencies: { isPrerequisiteForOthers: true, blocksTaskTitles: ["Scholarship Application"] },
  },
  {
    id: "task_scholarship_app",
    studentId: "std_debendra",
    title: "Complete Scholarship Application",
    finalQuadrant: "Q1",
    status: "TODO",
    dependencies: { blockedByTaskId: "task_prereq_income", blockedByTaskTitle: "Obtain Income Certificate" },
  },
];

const depNotifsIncomplete = generateDependencyNotifications(blockedTasks, DEFAULT_NOTIFICATION_PREFERENCES, fixedNow);
assert("Blocked task generates DEPENDENCY_BLOCKED notification when prerequisite is incomplete", depNotifsIncomplete.some(n => n.type === "DEPENDENCY_BLOCKED" && n.taskId === "task_scholarship_app"));

// Mark prerequisite complete
const completedBlockedTasks = [
  { ...blockedTasks[0], status: "COMPLETED" },
  blockedTasks[1],
];
const depNotifsComplete = generateDependencyNotifications(completedBlockedTasks, DEFAULT_NOTIFICATION_PREFERENCES, fixedNow);
assert("DEPENDENCY_BLOCKED alert disappears once prerequisite is completed", !depNotifsComplete.some(n => n.taskId === "task_scholarship_app"));

// ============================================================================
// TEST 7: Notice Updated & Recalculation (Section 15, 35, 42 TEST 7)
// ============================================================================
console.log("\n--- TEST 7: Notice Updated Notification ---");

const updatedNotices = [
  {
    id: "not_scholarship_cse",
    title: "CSE Merit Scholarship 2026",
    content: "Updated deadline to Sept 15",
    createdAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-08T12:00:00Z", // Updated later
    status: "published",
    relevance: {
      id: "rel_1",
      noticeId: "not_scholarship_cse",
      studentId: "std_debendra",
      relevance: "HIGH",
      score: 95,
      reasons: ["Targeted for CSE 1st Year"],
      matchedCriteria: ["CSE", "1st Year"],
      unmatchedCriteria: [],
      createdAt: "2026-09-01T10:00:00Z",
      updatedAt: "2026-09-08T12:00:00Z",
    },
  },
];

const updateNotifs = generateNoticeNotifications(updatedNotices, studentDebendra, DEFAULT_NOTIFICATION_PREFERENCES, fixedNow);
assert("Updated notice generates NOTICE_UPDATED notification", updateNotifs.some(n => n.type === "NOTICE_UPDATED" && n.noticeId === "not_scholarship_cse"));

// ============================================================================
// TEST 8: Schedule Conflict Detection (Section 17 & 42 TEST 8)
// ============================================================================
console.log("\n--- TEST 8: Schedule Conflict & Overload Alert ---");

const conflictSchedule = {
  ...mockScheduleResult,
  conflicts: ["Task Preparation exceeded weekly capacity before deadline"],
};
const conflictNotifs = generateScheduleConflictNotifications(conflictSchedule, "std_debendra", DEFAULT_NOTIFICATION_PREFERENCES, fixedNow);
assert("Workload/schedule conflict generates SCHEDULE_CONFLICT notification", conflictNotifs.some(n => n.type === "SCHEDULE_CONFLICT"));

// ============================================================================
// TEST 9 & 10: Deduplication, Read State & Mark All Read (Section 6, 7, 21, 42 TEST 9 & 10)
// ============================================================================
console.log("\n--- TEST 9 & 10: Deduplication & Read State Preservation ---");

// Initial sync
const syncedInitial = syncAndDeduplicateAllNotifications(
  studentDebendra,
  noticesWithRel,
  testTasks,
  mockScheduleResult,
  [],
  DEFAULT_NOTIFICATION_PREFERENCES,
  fixedNow
);

const unreadCount1 = syncedInitial.filter(n => !n.isRead).length;
console.log(`Initial synced notifications (${syncedInitial.length} total, ${unreadCount1} unread)`);
assert("Initial notifications synced successfully", syncedInitial.length >= 3);

// Mark one as read
const firstId = syncedInitial[0].id;
const afterMarkOne = syncedInitial.map(n => n.id === firstId ? { ...n, isRead: true, readAt: fixedNow.toISOString() } : n);
const unreadCount2 = afterMarkOne.filter(n => !n.isRead).length;
assert("Marking notification as read decreases unread count by 1", unreadCount2 === unreadCount1 - 1);

// Sync again with updated list (verify read state is strictly preserved and NO duplicates are created)
const syncedAgain = syncAndDeduplicateAllNotifications(
  studentDebendra,
  noticesWithRel,
  testTasks,
  mockScheduleResult,
  afterMarkOne,
  DEFAULT_NOTIFICATION_PREFERENCES,
  fixedNow
);

const itemPreserved = syncedAgain.find(n => n.id === firstId);
assert("Deduplication prevents creating duplicate notification instances", syncedAgain.length === syncedInitial.length);
assert("Read state is preserved across sync executions", itemPreserved?.isRead === true);

// Mark all as read
const afterMarkAll = syncedAgain.map(n => ({ ...n, isRead: true }));
const unreadCountAll = afterMarkAll.filter(n => !n.isRead).length;
assert("Mark all as read reduces unread count to 0", unreadCountAll === 0);

// ============================================================================
// TEST 11: Notification Preferences & Disabling Channels (Section 24 & 42 TEST 11)
// ============================================================================
console.log("\n--- TEST 11: Notification Preferences (Disabling Deadline Alerts) ---");

const disabledPrefs = {
  ...DEFAULT_NOTIFICATION_PREFERENCES,
  deadlineReminders: false, // Turn OFF
};

const notifsWithDisabled = syncAndDeduplicateAllNotifications(
  studentDebendra,
  noticesWithRel,
  testTasks,
  mockScheduleResult,
  [],
  disabledPrefs,
  fixedNow
);

assert("Disabling deadline reminders stops future deadline notification generation", !notifsWithDisabled.some(n => n.type === "DEADLINE_APPROACHING" || n.type === "TASK_OVERDUE"));

// ============================================================================
// TEST 12: Multi-Tenant Student Isolation (Section 30 & 42 TEST 12)
// ============================================================================
console.log("\n--- TEST 12: Multi-Tenant Student Isolation ---");

// Synced for Debendra vs Priya
const debendraNotifs = syncAndDeduplicateAllNotifications(
  studentDebendra,
  noticesWithRel,
  testTasks,
  mockScheduleResult,
  [],
  DEFAULT_NOTIFICATION_PREFERENCES,
  fixedNow
);

const priyaNotifs = syncAndDeduplicateAllNotifications(
  studentPriya,
  [], // Priya has no relevant notices
  [], // Priya has no tasks yet
  { dailyPlans: [], unscheduledTasks: [], conflicts: [], nextActionItem: null },
  debendraNotifs, // Pass Debendra's notifications to test isolation filter
  DEFAULT_NOTIFICATION_PREFERENCES,
  fixedNow
);

assert("Debendra notifications are exclusively owned by std_debendra", debendraNotifs.every(n => n.studentId === "std_debendra"));
assert("Priya cannot see Debendra's notifications in her feed", priyaNotifs.every(n => n.studentId === "std_priya"));
assert("Priya's notification count is isolated (0 notifications)", priyaNotifs.length === 0);

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n================================================================================");
if (allPassed) {
  console.log("🎉 ALL STEP 10 SMART NOTIFICATIONS & REMINDER TESTS PASSED (12/12 PASS)!");
} else {
  console.error("❌ ERRORS DETECTED.");
  process.exit(1);
}
console.log("================================================================================");
