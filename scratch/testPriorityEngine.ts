import { initialStudentProfiles, initialNotices } from "../src/lib/mockData";
import { calculateNoticeRelevance } from "../src/lib/relevanceEngine";
import {
  calculateUrgency,
  calculateImportance,
  calculateConsequenceScore,
  calculateRelevanceScore,
  calculateTaskPriority,
  generateStudentPriorityTasks,
  PRIORITY_WEIGHTS,
  PRIORITY_THRESHOLD,
} from "../src/lib/priorityEngine";

console.log("================================================================================");
console.log("NOTICEIQ — STEP 7: PRIORITY INTELLIGENCE ENGINE TEST SUITE");
console.log("================================================================================\n");

// Fixed evaluation date: September 5, 2026
const EVAL_DATE = new Date("2026-09-05T10:00:00Z");

const debendra = initialStudentProfiles.find((s) => s.id === "stu-debendra")!;
const eceStudent = initialStudentProfiles.find((s) => s.id === "stu-ece-demo")!;

console.log(`👤 Active Student 1: ${debendra.name} (${debendra.department}, ${debendra.year}, Sec ${debendra.section})`);
console.log(`👤 Active Student 2: ${eceStudent.name} (${eceStudent.department}, ${eceStudent.year}, Sec ${eceStudent.section})\n`);

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✕ FAIL: ${testName}`);
    if (detail) console.error(`    Detail: ${detail}`);
  }
}

// -----------------------------------------------------------------------------
// TEST 1: URGENCY SCORE CALCULATION
// -----------------------------------------------------------------------------
console.log("--- TEST 1: Urgency Score Calculation ---");

const urgToday = calculateUrgency("2026-09-05", EVAL_DATE);
assert(urgToday.score >= 90 && urgToday.score <= 100, "Urgency score for today is 90-100", `Score: ${urgToday.score}`);

const urgTomorrow = calculateUrgency("2026-09-06", EVAL_DATE);
assert(urgTomorrow.score >= 85 && urgTomorrow.score <= 99, "Urgency score for tomorrow is 85-99", `Score: ${urgTomorrow.score}`);

const urg3Days = calculateUrgency("2026-09-08", EVAL_DATE);
assert(urg3Days.score >= 70 && urg3Days.score <= 90, "Urgency score for within 3 days is 70-90", `Score: ${urg3Days.score}`);

const urg7Days = calculateUrgency("2026-09-10", EVAL_DATE);
assert(urg7Days.score >= 55 && urg7Days.score <= 75, "Urgency score for within 7 days is 55-75", `Score: ${urg7Days.score}`);

const urg14Days = calculateUrgency("2026-09-18", EVAL_DATE);
assert(urg14Days.score >= 35 && urg14Days.score <= 60, "Urgency score for within 14 days is 35-60", `Score: ${urg14Days.score}`);

const urgOverdue = calculateUrgency("2026-08-30", EVAL_DATE);
assert(urgOverdue.isOverdue === true && urgOverdue.score >= 95, "Urgency score for overdue deadline is >= 95 and marked overdue", `Score: ${urgOverdue.score}, Overdue: ${urgOverdue.isOverdue}`);

const urgNoDeadline = calculateUrgency(null, EVAL_DATE);
assert(urgNoDeadline.score <= 25 && urgNoDeadline.isOverdue === false, "No deadline urgency is low (<=25)", `Score: ${urgNoDeadline.score}`);

// -----------------------------------------------------------------------------
// TEST 2: IMPORTANCE & CONSEQUENCE CALCULATIONS
// -----------------------------------------------------------------------------
console.log("\n--- TEST 2: Importance & Consequence Scores ---");

const scholarshipNotice = initialNotices.find((n) => n.id === "not-001")!;
const impScholarship = calculateImportance(scholarshipNotice, "Complete scholarship application");
assert(impScholarship.score >= 80, "Scholarship notice importance is >= 80", `Score: ${impScholarship.score}`);

const conScholarship = calculateConsequenceScore(scholarshipNotice);
assert(conScholarship.score >= 85, "Scholarship loss consequence score is >= 85", `Score: ${conScholarship.score}`);

const wifiNotice = initialNotices.find((n) => n.id === "not-004")!;
const conWifi = calculateConsequenceScore(wifiNotice);
assert(conWifi.score <= 50, "Maintenance notice consequence is neutral/low (<=50)", `Score: ${conWifi.score}`);

// -----------------------------------------------------------------------------
// TEST 3: RELEVANCE INTEGRATION
// -----------------------------------------------------------------------------
console.log("\n--- TEST 3: Relevance Integration ---");

const relDebendraScholarship = calculateNoticeRelevance(scholarshipNotice, debendra);
assert(relDebendraScholarship.relevance === "HIGH", "Debendra relevance for CSE scholarship is HIGH", `Relevance: ${relDebendraScholarship.relevance}`);
const relScoreDebendra = calculateRelevanceScore(relDebendraScholarship.relevance, relDebendraScholarship.score);
assert(relScoreDebendra >= 90, "Relevance score for HIGH is >= 90", `Score: ${relScoreDebendra}`);

const relEceScholarship = calculateNoticeRelevance(scholarshipNotice, eceStudent);
assert(relEceScholarship.relevance === "NOT_RELEVANT", "ECE Student relevance for CSE scholarship is NOT_RELEVANT", `Relevance: ${relEceScholarship.relevance}`);
const relScoreEce = calculateRelevanceScore(relEceScholarship.relevance, relEceScholarship.score);
assert(relScoreEce === 0, "Relevance score for NOT_RELEVANT is 0", `Score: ${relScoreEce}`);

// -----------------------------------------------------------------------------
// TEST 4: FULL TASK PRIORITY & DEPENDENCY RESOLUTION (DEBENDRA BERA)
// -----------------------------------------------------------------------------
console.log("\n--- TEST 4: Task Priority & Dependency Resolution for Debendra Bera ---");

const debendraNoticesWithRel = initialNotices
  .filter((n) => n.status === "published")
  .map((notice) => ({
    ...notice,
    isRead: false,
    relevance: calculateNoticeRelevance(notice, debendra),
  }));

const debendraTasksInitial = generateStudentPriorityTasks(debendra, debendraNoticesWithRel, [], EVAL_DATE);

console.log(`Generated ${debendraTasksInitial.length} prioritized tasks for Debendra Bera:`);
debendraTasksInitial.forEach((t, i) => {
  console.log(`  ${i + 1}. [${t.quadrant}] Score: ${t.priorityScore} | ${t.title} | Deadline: ${t.deadline || "None"} | Blocked: ${t.dependencies?.isBlocked ? "YES" : "NO"} | Prereq: ${t.dependencies?.isPrerequisiteForOthers ? "YES" : "NO"}`);
});

const prereqTask = debendraTasksInitial.find((t) => t.title.toLowerCase().includes("income certificate"))!;
const blockedTask = debendraTasksInitial.find((t) => t.title.toLowerCase().includes("complete scholarship application"))!;

assert(!!prereqTask, "Prerequisite task (Obtain income certificate) was generated");
assert(!!blockedTask, "Blocked task (Complete scholarship application) was generated");
assert(prereqTask.dependencies?.isPrerequisiteForOthers === true, "Obtain income certificate is flagged as isPrerequisiteForOthers");
assert(blockedTask.dependencies?.isBlocked === true, "Complete scholarship application is flagged as isBlocked = true");
assert(blockedTask.dependencies?.blockedByTaskTitle?.toLowerCase().includes("income certificate") === true, "Complete scholarship application has blockedByTaskTitle pointing to Income Certificate");

// Prerequisite task should sort before or be in Q1
assert(prereqTask.quadrant === "Q1", "Obtain income certificate is in Q1 (DO FIRST)", `Quadrant: ${prereqTask.quadrant}`);
assert(prereqTask.priorityReasons.length > 0, "Task has explainable reasons populated", `Reasons: ${JSON.stringify(prereqTask.priorityReasons)}`);

// -----------------------------------------------------------------------------
// TEST 5: COMPLETING PREREQUISITE UNBLOCKS DEPENDENT TASK
// -----------------------------------------------------------------------------
console.log("\n--- TEST 5: Dynamic Recalculation on Prerequisite Completion ---");

const completedIds = [prereqTask.id];
const debendraTasksAfterCompletion = generateStudentPriorityTasks(
  debendra,
  debendraNoticesWithRel,
  completedIds,
  EVAL_DATE
);

const completedPrereq = debendraTasksAfterCompletion.find((t) => t.id === prereqTask.id)!;
const unblockedTask = debendraTasksAfterCompletion.find((t) => t.title.toLowerCase().includes("complete scholarship application"))!;

assert(completedPrereq.status === "COMPLETED", "Obtain income certificate is now COMPLETED");
assert(unblockedTask.dependencies?.isBlocked === false, "Complete scholarship application is now UNBLOCKED (isBlocked: false)");
assert(unblockedTask.dependencies?.prerequisiteCompleted === true, "Complete scholarship application has prerequisiteCompleted: true");
assert(unblockedTask.priorityReasons.some((r) => r.includes("Prerequisite") && r.includes("completed")), "Unblocked task includes reason: Prerequisite completed");

// -----------------------------------------------------------------------------
// TEST 6: NON-RELEVANT PERSONA ISOLATION (DEMO STUDENT ECE)
// -----------------------------------------------------------------------------
console.log("\n--- TEST 6: Non-Relevant Persona Isolation for Demo Student ECE ---");

const eceNoticesWithRel = initialNotices
  .filter((n) => n.status === "published")
  .map((notice) => ({
    ...notice,
    isRead: false,
    relevance: calculateNoticeRelevance(notice, eceStudent),
  }));

const eceTasks = generateStudentPriorityTasks(eceStudent, eceNoticesWithRel, [], EVAL_DATE);

console.log(`Generated ${eceTasks.length} prioritized tasks for Demo Student ECE.`);

const hasCseScholarshipTasks = eceTasks.some((t) => t.noticeId === "not-001");
assert(!hasCseScholarshipTasks, "ECE Student has 0 tasks from CSE-specific scholarship notice not-001");

// -----------------------------------------------------------------------------
// TEST 7: NO DEADLINE HANDLING
// -----------------------------------------------------------------------------
console.log("\n--- TEST 7: No-Deadline Task Handling ---");

const testTaskNoDeadline = {
  title: "Prepare Resume and Academic Portfolio",
  description: "Gather past certificates and draft CV.",
  deadline: null,
};

const noticeAcademic = initialNotices.find((n) => n.id === "not-006")!;
const priorityNoDeadline = calculateTaskPriority(
  testTaskNoDeadline,
  noticeAcademic,
  calculateNoticeRelevance(noticeAcademic, debendra),
  debendra,
  undefined,
  EVAL_DATE
);

assert(priorityNoDeadline.urgencyScore <= 30, "No-deadline task urgency is low (<=30)", `Urgency: ${priorityNoDeadline.urgencyScore}`);
assert(priorityNoDeadline.quadrant === "Q2" || priorityNoDeadline.quadrant === "Q4", "No-deadline task is routed to Q2 or Q4", `Quadrant: ${priorityNoDeadline.quadrant}`);
assert(priorityNoDeadline.reasons.some((r) => r.toLowerCase().includes("no immediate deadline")), "Explainable reason explains lack of immediate deadline");

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n================================================================================");
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log("================================================================================");

if (passedTests === totalTests) {
  console.log("🎉 ALL TESTS PASSED! Step 7 Priority Intelligence Engine is working perfectly.");
} else {
  console.error("❌ Some tests failed. Please inspect errors above.");
  process.exit(1);
}
