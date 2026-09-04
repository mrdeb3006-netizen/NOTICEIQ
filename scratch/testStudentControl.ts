import {
  generateStudentPriorityTasks,
} from "../src/lib/priorityEngine";
import {
  initialStudentProfiles,
  initialNotices,
} from "../src/lib/mockData";
import { calculateNoticeRelevance } from "../src/lib/relevanceEngine";
import { PriorityTask, TaskQuadrant } from "../src/types/student";

console.log("================================================================================");
console.log("NOTICEIQ — STEP 8: STUDENT CONTROL & ADAPTIVE TASK MANAGEMENT TEST SUITE");
console.log("================================================================================\n");

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    if (details) console.log(`   └─ ${details}`);
    passedCount++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (details) console.error(`   └─ ${details}`);
    failedCount++;
  }
}

// Fixed baseline date for deterministic testing
const testNow = new Date("2026-09-04T10:00:00.000Z");

const debendra = initialStudentProfiles[0]; // Debendra Bera (stu-debendra)
const priya = initialStudentProfiles[4];    // Priya Sharma (stu-002)

// Compute relevance for all notices
const debendraNoticesWithRel = initialNotices.map((n) => ({
  ...n,
  relevance: calculateNoticeRelevance(n, debendra),
}));

// Find the AI task for scholarship application
const baselineTasks = generateStudentPriorityTasks(debendra, debendraNoticesWithRel, [], testNow);
const scholarshipTask = baselineTasks.find((t) => t.title.toLowerCase().includes("scholarship application")) || baselineTasks[0];
const scholarshipAiTaskId = scholarshipTask.id;

// ==============================================================================
// TEST 1: CREATE PERSONAL TASK & SAME PRIORITY ENGINE
// ==============================================================================
console.log("\n--- TEST 1: CREATE PERSONAL TASK ---");
const personalTask1: PriorityTask = {
  id: "pt_stu_debendra_buy_folder",
  studentId: debendra.id,
  taskType: "PERSONAL",
  title: "Buy folder for documents",
  description: "Buy from college store",
  deadline: "September 6, 2026",
  estimatedMinutes: 20,
  studentImportanceOverride: "MEDIUM",
  privateNote: "Buy it from the stationery shop near college.",
  useNoteForAI: true,
  status: "TODO",
  aiUrgencyScore: 0,
  aiImportanceScore: 0,
  aiConsequenceScore: 0,
  aiRelevanceScore: 0,
  aiPriorityScore: 0,
  aiQuadrant: "Q4",
  aiPriorityReasons: [],
  urgencyScore: 0,
  importanceScore: 0,
  consequenceScore: 0,
  relevanceScore: 0,
  priorityScore: 0,
  quadrant: "Q4",
  finalPriorityScore: 0,
  finalQuadrant: "Q4",
  priorityReasons: [],
  recommendedAction: "",
  createdAt: testNow.toISOString(),
  updatedAt: testNow.toISOString(),
};

const tasksTest1 = generateStudentPriorityTasks(
  debendra,
  debendraNoticesWithRel,
  [],
  testNow,
  {},
  [personalTask1]
);

const foundPersonal = tasksTest1.find((t) => t.id === "pt_stu_debendra_buy_folder");
assert(
  !!foundPersonal,
  "Personal task is integrated into unified task ecosystem",
  `Found task: "${foundPersonal?.title}" with TaskType: "${foundPersonal?.taskType}"`
);
assert(
  foundPersonal?.taskType === "PERSONAL" && (foundPersonal?.finalQuadrant === "Q1" || foundPersonal?.finalQuadrant === "Q2"),
  "Personal task passed through exact same priority engine with dynamic scoring",
  `Calculated Priority Score: ${foundPersonal?.finalPriorityScore}, Quadrant: ${foundPersonal?.finalQuadrant}`
);

// ==============================================================================
// TEST 2: EDIT TASK (TITLE, DEADLINE & RECALCULATE)
// ==============================================================================
console.log("\n--- TEST 2: EDIT TASK ---");
const editedPersonalTask: PriorityTask = {
  ...personalTask1,
  title: "Buy premium plastic folder for scholarship documents",
  deadline: "September 5, 2026", // Tomorrow relative to 2026-09-04
  studentImportanceOverride: "HIGH",
};

const tasksTest2 = generateStudentPriorityTasks(
  debendra,
  debendraNoticesWithRel,
  [],
  testNow,
  {},
  [editedPersonalTask]
);

const foundEdited = tasksTest2.find((t) => t.id === "pt_stu_debendra_buy_folder");
assert(
  foundEdited?.title === "Buy premium plastic folder for scholarship documents",
  "Task title edited successfully"
);
assert(
  foundEdited?.finalQuadrant === "Q1" && foundEdited?.urgencyScore >= 85,
  "Priority recalculated upon deadline/importance change (Moved to Q1)",
  `Urgency: ${foundEdited?.urgencyScore}, Final Quadrant: ${foundEdited?.finalQuadrant}`
);

// ==============================================================================
// TEST 3: PRIVATE NOTES (SECURITY & ISOLATION)
// ==============================================================================
console.log("\n--- TEST 3: PRIVATE NOTES ---");
const overrideWithNote = {
  [scholarshipAiTaskId]: {
    privateNote: "I already have Aadhaar and marksheet. Only income certificate is pending.",
    useNoteForAI: true,
  },
};

const tasksTest3 = generateStudentPriorityTasks(
  debendra,
  debendraNoticesWithRel,
  [],
  testNow,
  overrideWithNote,
  []
);

const foundWithNote = tasksTest3.find((t) => t.id === scholarshipAiTaskId);
assert(
  foundWithNote?.privateNote === "I already have Aadhaar and marksheet. Only income certificate is pending.",
  "Private note attached to student task representation"
);

// Check that notice object itself in institutional database is completely untouched
const originalNotice = initialNotices.find((n) => n.id === "not-001");
assert(
  originalNotice !== undefined && !("privateNote" in (originalNotice as any)),
  "Original institution notice remains untouched and contains NO student private note (Data Isolation)"
);

// ==============================================================================
// ==============================================================================
// TEST 4: STUDENT PRIORITY OVERRIDE (AI: Q2 -> Student: Q1)
// ==============================================================================
console.log("\n--- TEST 4: STUDENT PRIORITY OVERRIDE ---");
// Find a task where AI recommendation is Q2 (e.g. Fellowship or longer-deadline notice)
const q2AiTask = baselineTasks.find((t) => t.aiQuadrant === "Q2") || baselineTasks[0];
const targetQ2TaskId = q2AiTask.id;

const overridePriorityMap = {
  [targetQ2TaskId]: {
    studentQuadrantOverride: "Q1" as TaskQuadrant,
  },
};

const tasksTest4 = generateStudentPriorityTasks(
  debendra,
  debendraNoticesWithRel,
  [],
  testNow,
  overridePriorityMap,
  []
);

const overriddenTask = tasksTest4.find((t) => t.id === targetQ2TaskId);
assert(
  overriddenTask?.aiQuadrant === "Q2",
  "AI Recommendation remains preserved as Q2",
  `aiQuadrant: ${overriddenTask?.aiQuadrant}`
);
assert(
  overriddenTask?.studentQuadrantOverride === "Q1",
  "Student Quadrant Override stored as Q1",
  `studentQuadrantOverride: ${overriddenTask?.studentQuadrantOverride}`
);
assert(
  overriddenTask?.finalQuadrant === "Q1",
  "Final resolved Quadrant is Q1 (Student Decision Wins)",
  `finalQuadrant: ${overriddenTask?.finalQuadrant}`
);

// ==============================================================================
// TEST 5: RESET OVERRIDE TO AI RECOMMENDATION
// ==============================================================================
console.log("\n--- TEST 5: RESET OVERRIDE ---");
const resetOverrideMap = {
  [targetQ2TaskId]: {
    studentQuadrantOverride: null,
  },
};

const tasksTest5 = generateStudentPriorityTasks(
  debendra,
  debendraNoticesWithRel,
  [],
  testNow,
  resetOverrideMap,
  []
);

const resetTask = tasksTest5.find((t) => t.id === targetQ2TaskId);
assert(
  resetTask?.studentQuadrantOverride === null || resetTask?.studentQuadrantOverride === undefined,
  "Student override reset to null"
);
assert(
  resetTask?.finalQuadrant === resetTask?.aiQuadrant,
  "Final resolved Quadrant reverts cleanly back to AI Recommendation (Q2)",
  `finalQuadrant: ${resetTask?.finalQuadrant}, aiQuadrant: ${resetTask?.aiQuadrant}`
);

// ==============================================================================
// TEST 6: COMPLETE TASK & STATUS LIFECYCLE
// ==============================================================================
console.log("\n--- TEST 6: COMPLETE TASK ---");
const completedTimestamp = new Date("2026-09-04T12:00:00.000Z").toISOString();
const tasksTest6 = generateStudentPriorityTasks(
  debendra,
  debendraNoticesWithRel,
  [scholarshipAiTaskId],
  testNow,
  {
    [scholarshipAiTaskId]: {
      status: "COMPLETED",
      completedAt: completedTimestamp,
    },
  },
  []
);

const completedTask = tasksTest6.find((t) => t.id === scholarshipAiTaskId);
assert(
  completedTask?.status === "COMPLETED",
  "Task status updated to COMPLETED"
);
assert(
  completedTask?.completedAt === completedTimestamp,
  "Completion timestamp stored properly",
  `completedAt: ${completedTask?.completedAt}`
);

// ==============================================================================
// TEST 7: NOTICE DEADLINE CHANGES (AI ADAPTS, OVERRIDE PERSISTS)
// ==============================================================================
console.log("\n--- TEST 7: NOTICE DEADLINE CHANGE (AI ADAPTS, STUDENT REMAINS IN CONTROL) ---");
// Institution updates notice deadline from September 10 to September 25
const updatedNotice = {
  ...initialNotices[0],
  deadline: "September 25, 2026",
  relevance: calculateNoticeRelevance(
    { ...initialNotices[0], deadline: "September 25, 2026" },
    debendra
  ),
};

const tasksTest7 = generateStudentPriorityTasks(
  debendra,
  [updatedNotice],
  [],
  testNow,
  {
    [scholarshipAiTaskId]: {
      studentQuadrantOverride: "Q1", // Student manually chose Q1
    },
  },
  []
);

const taskAfterNoticeUpdate = tasksTest7.find((t) => t.id === scholarshipAiTaskId);
assert(
  taskAfterNoticeUpdate?.studentQuadrantOverride === "Q1",
  "Student override Q1 remains completely intact despite notice edit"
);
assert(
  taskAfterNoticeUpdate?.finalQuadrant === "Q1",
  "Final priority remains Q1 respecting student choice",
  `finalQuadrant: ${taskAfterNoticeUpdate?.finalQuadrant}`
);

// ==============================================================================
// TEST 8: STUDENT ISOLATION (LOGIN AS ANOTHER STUDENT)
// ==============================================================================
console.log("\n--- TEST 8: PERSONA DATA ISOLATION ---");
const priyaNoticesWithRel = initialNotices.map((n) => ({
  ...n,
  relevance: calculateNoticeRelevance(n, priya),
}));

// Priya has NO personal tasks and NO overrides from Debendra
const priyaTasks = generateStudentPriorityTasks(
  priya,
  priyaNoticesWithRel,
  [],
  testNow,
  {}, // Empty overrides for Priya
  []  // Empty personal tasks for Priya
);

const priyaHasDebendraPersonalTask = priyaTasks.some((t) => t.id === "pt_stu_debendra_buy_folder");
assert(
  !priyaHasDebendraPersonalTask,
  "Student B (Priya) CANNOT see Student A's (Debendra's) personal tasks"
);

const priyaScholarshipTask = priyaTasks.find((t) => t.noticeId === "not-001");
assert(
  !priyaScholarshipTask?.privateNote,
  "Student B (Priya) CANNOT see Student A's private notes"
);
assert(
  !priyaScholarshipTask?.studentQuadrantOverride,
  "Student B (Priya) CANNOT see or inherit Student A's priority overrides"
);

console.log("\n================================================================================");
console.log(`TEST SUMMARY: ${passedCount} Passed, ${failedCount} Failed`);
console.log("================================================================================");

if (failedCount > 0) {
  process.exit(1);
}
