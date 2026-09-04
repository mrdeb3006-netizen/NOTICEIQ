import {
  generateSchedule,
  sortTasksForScheduling,
  formatTime12Hour,
  parseTimeString,
  addMinutesToTime,
} from "../src/lib/scheduling/scheduleEngine";
import {
  PriorityTask,
  StudentAvailability,
  ScheduleItem,
} from "../src/types/student";

console.log("================================================================================");
console.log("🧪 NOTICEIQ STEP 9: COMPREHENSIVE SMART SCHEDULING ENGINE TEST SUITE");
console.log("================================================================================");

let allPassed = true;
function assert(desc: string, condition: boolean) {
  if (condition) {
    console.log(`✅ [PASS] ${desc}`);
  } else {
    console.error(`❌ [FAIL] ${desc}`);
    allPassed = false;
  }
}

const mockStudentAvailability: StudentAvailability = {
  studentId: "std_debendra",
  preferredStartTime: "18:00",
  preferredEndTime: "22:00",
  availableDailyMinutes: 120, // 2 hours
  bufferPercent: 15, // 15% buffer -> 102 mins usable, 18 mins flexible
};

const fixedNow = new Date("2026-09-08T10:00:00Z");

// ============================================================================
// TEST 1: Sorting & Priority Determinism (Section 6, 7, 37)
// ============================================================================
console.log("\n--- TEST 1: Task Ordering & Priority Determinism ---");

const demoTasks: PriorityTask[] = [
  {
    id: "task_1_income",
    studentId: "std_debendra",
    taskType: "AI_GENERATED",
    title: "Obtain Income Certificate",
    deadline: "2026-09-10",
    estimatedMinutes: 30,
    urgencyScore: 80,
    importanceScore: 90,
    consequenceScore: 85,
    relevanceScore: 100,
    priorityScore: 88,
    quadrant: "Q1",
    aiUrgencyScore: 80,
    aiImportanceScore: 90,
    aiConsequenceScore: 85,
    aiRelevanceScore: 100,
    aiPriorityScore: 88,
    aiQuadrant: "Q1",
    aiPriorityReasons: ["Prerequisite for scholarship"],
    finalPriorityScore: 88,
    finalQuadrant: "Q1",
    priorityReasons: ["Prerequisite for scholarship"],
    recommendedAction: "DO FIRST",
    dependencies: {
      isPrerequisiteForOthers: true,
      blocksTaskTitles: ["Complete Scholarship Application"],
      isBlocked: false,
    },
    status: "TODO",
    createdAt: "2026-09-05",
    updatedAt: "2026-09-05",
  },
  {
    id: "task_2_scholarship",
    studentId: "std_debendra",
    taskType: "AI_GENERATED",
    title: "Complete Scholarship Application",
    deadline: "2026-09-10",
    estimatedMinutes: 30,
    urgencyScore: 85,
    importanceScore: 95,
    consequenceScore: 90,
    relevanceScore: 100,
    priorityScore: 92,
    quadrant: "Q1",
    aiUrgencyScore: 85,
    aiImportanceScore: 95,
    aiConsequenceScore: 90,
    aiRelevanceScore: 100,
    aiPriorityScore: 92,
    aiQuadrant: "Q1",
    aiPriorityReasons: ["High value scholarship"],
    finalPriorityScore: 92,
    finalQuadrant: "Q1",
    priorityReasons: ["High value scholarship"],
    recommendedAction: "DO FIRST",
    dependencies: {
      blockedByTaskId: "task_1_income",
      blockedByTaskTitle: "Obtain Income Certificate",
      isBlocked: true,
    },
    status: "TODO",
    createdAt: "2026-09-05",
    updatedAt: "2026-09-05",
  },
  {
    id: "task_3_lab",
    studentId: "std_debendra",
    taskType: "AI_GENERATED",
    title: "Complete Lab Assignment",
    deadline: "2026-09-12",
    estimatedMinutes: 45,
    urgencyScore: 60,
    importanceScore: 80,
    consequenceScore: 70,
    relevanceScore: 100,
    priorityScore: 75,
    quadrant: "Q2",
    aiUrgencyScore: 60,
    aiImportanceScore: 80,
    aiConsequenceScore: 70,
    aiRelevanceScore: 100,
    aiPriorityScore: 75,
    aiQuadrant: "Q2",
    aiPriorityReasons: ["Core academic submission"],
    finalPriorityScore: 75,
    finalQuadrant: "Q2",
    priorityReasons: ["Core academic submission"],
    recommendedAction: "SCHEDULE",
    status: "TODO",
    createdAt: "2026-09-05",
    updatedAt: "2026-09-05",
  },
  {
    id: "task_4_workshop",
    studentId: "std_debendra",
    taskType: "AI_GENERATED",
    title: "Explore Optional Workshop",
    deadline: null,
    estimatedMinutes: 30,
    urgencyScore: 20,
    importanceScore: 30,
    consequenceScore: 10,
    relevanceScore: 60,
    priorityScore: 30,
    quadrant: "Q4",
    aiUrgencyScore: 20,
    aiImportanceScore: 30,
    aiConsequenceScore: 10,
    aiRelevanceScore: 60,
    aiPriorityScore: 30,
    aiQuadrant: "Q4",
    aiPriorityReasons: ["Optional event"],
    finalPriorityScore: 30,
    finalQuadrant: "Q4",
    priorityReasons: ["Optional event"],
    recommendedAction: "LATER",
    status: "TODO",
    createdAt: "2026-09-05",
    updatedAt: "2026-09-05",
  },
  {
    id: "task_5_personal_folder",
    studentId: "std_debendra",
    taskType: "PERSONAL",
    title: "Buy document folder",
    deadline: "2026-09-09",
    estimatedMinutes: 15,
    urgencyScore: 70,
    importanceScore: 50,
    consequenceScore: 40,
    relevanceScore: 100,
    priorityScore: 65,
    quadrant: "Q3",
    aiUrgencyScore: 70,
    aiImportanceScore: 50,
    aiConsequenceScore: 40,
    aiRelevanceScore: 100,
    aiPriorityScore: 65,
    aiQuadrant: "Q3",
    aiPriorityReasons: ["Quick errand"],
    finalPriorityScore: 65,
    finalQuadrant: "Q3",
    priorityReasons: ["Quick errand"],
    recommendedAction: "DELEGATE / QUICK",
    status: "TODO",
    createdAt: "2026-09-05",
    updatedAt: "2026-09-05",
  },
];

const sorted = sortTasksForScheduling(demoTasks, fixedNow);
assert("Income Certificate (Prerequisite & Q1) comes before Scholarship Application", sorted[0].id === "task_1_income");
assert("Scholarship Application is second in sorted list", sorted[1].id === "task_2_scholarship");
assert("Q4 task is placed at the end of priority list", sorted[sorted.length - 1].id === "task_4_workshop");

// ============================================================================
// TEST 2: Schedule Generation & Non-overlapping Time Slots (Section 4, 13, 23, 37)
// ============================================================================
console.log("\n--- TEST 2: Schedule Generation & Non-Overlapping Slots ---");

const result = generateSchedule(demoTasks, mockStudentAvailability, 7, {}, fixedNow);

assert("Today's plan is generated", result.dailyPlans.length >= 7);
const todayItems = result.dailyPlans[0].items;
console.log(`Today's Scheduled Items (${todayItems.length}):`);
todayItems.forEach((it) => {
  console.log(`  - [${it.startTime} — ${it.endTime}] (${it.durationMinutes}m) ${it.taskTitle} [${it.quadrant}]`);
});

assert("Income Certificate scheduled first at 6:00 PM", todayItems[0]?.taskTitle === "Obtain Income Certificate");
assert("Income Certificate time slot is 6:00 PM — 6:30 PM", todayItems[0]?.startTime === "6:00 PM" && todayItems[0]?.endTime === "6:30 PM");

assert("Scholarship Application scheduled after Income Certificate at 6:30 PM", todayItems[1]?.taskTitle === "Complete Scholarship Application");
assert("Scholarship Application time slot is 6:30 PM — 7:00 PM", todayItems[1]?.startTime === "6:30 PM" && todayItems[1]?.endTime === "7:00 PM");

assert("Lab Assignment scheduled at 7:00 PM — 7:45 PM", todayItems[2]?.taskTitle === "Complete Lab Assignment" && todayItems[2]?.startTime === "7:00 PM");

// Verify non-overlapping times
let overlapDetected = false;
for (let i = 0; i < todayItems.length - 1; i++) {
  const currentEnd = todayItems[i].endTime;
  const nextStart = todayItems[i + 1].startTime;
  if (currentEnd !== nextStart) {
    overlapDetected = true;
  }
}
assert("All scheduled slots in Today are strictly sequential without overlaps", !overlapDetected);

// ============================================================================
// TEST 3: Capacity Protection & 15% Buffer (Section 12, 42)
// ============================================================================
console.log("\n--- TEST 3: Daily Capacity & 15% Flexible Buffer ---");

const totalTodayScheduled = result.dailyPlans[0].scheduledMinutes;
const rawCapacity = result.dailyPlans[0].availableMinutes;
const bufferMins = result.dailyPlans[0].bufferMinutes;
const remainingMins = result.dailyPlans[0].remainingMinutes;

console.log(`Available: ${rawCapacity}m | Scheduled: ${totalTodayScheduled}m | Buffer: ${bufferMins}m | Remaining: ${remainingMins}m`);

assert("Scheduled minutes do not exceed usable capacity (102 mins for 120m available)", totalTodayScheduled <= 102);
assert("Buffer time of at least 18 minutes is preserved for 120m day", bufferMins >= 18);
assert("Remaining capacity correctly tracks available free minutes", remainingMins === rawCapacity - totalTodayScheduled);

// ============================================================================
// TEST 4: Student Priority Override (Section 38)
// ============================================================================
console.log("\n--- TEST 4: Student Priority Override Preservation ---");

const overrideTask: PriorityTask = {
  ...demoTasks[2], // Lab assignment
  aiQuadrant: "Q2",
  studentQuadrantOverride: "Q1",
  finalQuadrant: "Q1", // Student override promoted to Q1
  finalPriorityScore: 95,
};

const tasksWithOverride = [demoTasks[0], demoTasks[1], overrideTask, demoTasks[3]];
const overrideSchedule = generateSchedule(tasksWithOverride, mockStudentAvailability, 7, {}, fixedNow);

const labItem = overrideSchedule.dailyPlans[0].items.find((i) => i.taskId === overrideTask.id);
assert("Lab Assignment is recognized with finalQuadrant Q1", labItem?.quadrant === "Q1");

// ============================================================================
// TEST 5: Task Splitting for Long Tasks (Section 9)
// ============================================================================
console.log("\n--- TEST 5: Long Task Splitting Across Days ---");

const longTask: PriorityTask = {
  id: "task_long_paper",
  studentId: "std_debendra",
  taskType: "PERSONAL",
  title: "Write Major Term Research Paper",
  deadline: "2026-09-14",
  estimatedMinutes: 120, // 120 min task
  urgencyScore: 70,
  importanceScore: 90,
  consequenceScore: 80,
  relevanceScore: 100,
  priorityScore: 85,
  quadrant: "Q2",
  aiUrgencyScore: 70,
  aiImportanceScore: 90,
  aiConsequenceScore: 80,
  aiRelevanceScore: 100,
  aiPriorityScore: 85,
  aiQuadrant: "Q2",
  aiPriorityReasons: ["Long paper"],
  finalPriorityScore: 85,
  finalQuadrant: "Q2",
  priorityReasons: ["Long paper"],
  recommendedAction: "SCHEDULE",
  status: "TODO",
  createdAt: "2026-09-05",
  updatedAt: "2026-09-05",
};

// Tight daily availability of 80 mins
const tightAvailability: StudentAvailability = {
  studentId: "std_debendra",
  preferredStartTime: "18:00",
  preferredEndTime: "20:00",
  availableDailyMinutes: 80,
  bufferPercent: 15, // usable 68m
};

const splitSchedule = generateSchedule([longTask], tightAvailability, 7, {}, fixedNow);
const day1Items = splitSchedule.dailyPlans[0].items;
const day2Items = splitSchedule.dailyPlans[1].items;

console.log(`Day 1 Items:`, day1Items.map((i) => `${i.taskTitle} (${i.durationMinutes}m)`));
console.log(`Day 2 Items:`, day2Items.map((i) => `${i.taskTitle} (${i.durationMinutes}m)`));

assert("Long task is split into Part 1/2 on Day 1", day1Items.some((i) => i.isSplit && i.splitPart === 1));
assert("Continuation Part 2/2 is scheduled on Day 2", day2Items.some((i) => i.isSplit && i.splitPart === 2));

// ============================================================================
// TEST 6: Student Schedule Customization & Override (Section 20)
// ============================================================================
console.log("\n--- TEST 6: Student Manual Schedule Overrides ---");

const customSlotOverrides: Record<string, Partial<ScheduleItem>> = {
  "sch_task_1_income_2026-09-08_1": {
    startTime: "7:30 PM",
    endTime: "8:00 PM",
    scheduleOverride: true,
  },
};

const customizedSchedule = generateSchedule(demoTasks, mockStudentAvailability, 7, customSlotOverrides, fixedNow);
const incomeCustomItem = customizedSchedule.dailyPlans[0].items.find((i) => i.taskId === "task_1_income");

assert("Student custom slot move to 7:30 PM is honored", incomeCustomItem?.startTime === "7:30 PM");
assert("scheduleOverride flag is marked true", incomeCustomItem?.scheduleOverride === true);

// ============================================================================
// TEST 7: Completed Tasks Handling (Section 39)
// ============================================================================
console.log("\n--- TEST 7: Completed Tasks Exclusion from Active Schedule ---");

const tasksWithCompleted = [
  {
    ...demoTasks[0],
    status: "COMPLETED" as const,
  },
  demoTasks[1],
];

const scheduleAfterCompletion = generateSchedule(tasksWithCompleted, mockStudentAvailability, 7, {}, fixedNow);
const scheduledIds = scheduleAfterCompletion.dailyPlans[0].items.map((i) => i.taskId);

assert("Completed task is excluded from active schedule generation", !scheduledIds.includes("task_1_income"));
assert("Dependent task is now scheduled immediately", scheduledIds[0] === "task_2_scholarship");

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n================================================================================");
if (allPassed) {
  console.log("🎉 ALL STEP 9 SCHEDULING ENGINE TESTS PASSED PERFECTLY!");
} else {
  console.error("❌ SOME TESTS FAILED. CHECK LOGS ABOVE.");
}
console.log("================================================================================");
