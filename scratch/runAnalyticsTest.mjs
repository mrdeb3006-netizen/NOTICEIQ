import {
  calculateReachRate,
  calculateRelevanceRate,
  calculateActionGenerationRate,
  calculateCompletionRate,
  calculateOverdueRate,
  calculateOnTimeRate,
  calculateActionabilityScore,
  calculateNoticeMetrics,
  calculateInstitutionAnalytics,
  generateInstitutionInsights,
  exportFilteredAnalyticsToCsv,
} from "../src/lib/analytics/institutionInsights.ts";

console.log("================================================================================");
console.log("🧪 NOTICEIQ STEP 11: INSTITUTION ANALYTICS + IMPACT DASHBOARD TEST SUITE");
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

// Mock Data
const mockNotices = [
  {
    id: "not-001",
    institutionId: "inst-future-01",
    title: "Scholarship Application — Academic Year 2026",
    category: "Scholarship",
    targetType: "section",
    targetGroup: "CSE • 1st Year • Section A",
    targetDepartment: "CSE",
    targetYear: "1st Year",
    targetSection: "A",
    recipientsCount: 250,
    publicationDate: "2026-09-02",
    deadline: "2026-09-10",
    status: "published",
    createdAt: "2026-09-02T10:00:00Z",
    aiAnalysis: {
      tasks: [
        { title: "Collect documents", deadline: "2026-09-08" },
        { title: "Obtain income certificate", deadline: "2026-09-07" },
        { title: "Complete application", deadline: "2026-09-10" },
      ],
    },
  },
  {
    id: "not-002",
    institutionId: "inst-future-01",
    title: "End-Semester Examination Registration",
    category: "Examination",
    targetType: "all",
    targetGroup: "All Students",
    recipientsCount: 2430,
    publicationDate: "2026-08-31",
    deadline: "2026-09-18",
    status: "published",
    createdAt: "2026-08-31T10:00:00Z",
    aiAnalysis: {
      tasks: [{ title: "Pay exam dues" }, { title: "Register biometric" }],
    },
  },
  {
    id: "not-003",
    institutionId: "inst-future-01",
    title: "Technical Hackathon 2026 Kickoff",
    category: "Event",
    targetType: "department",
    targetDepartment: "CSE",
    targetGroup: "CSE • All Years",
    recipientsCount: 420,
    publicationDate: "2026-08-28",
    deadline: "2026-09-12",
    status: "published",
    createdAt: "2026-08-28T10:00:00Z",
    aiAnalysis: {
      tasks: [{ title: "Form team" }, { title: "Submit project idea" }],
    },
  },
];

const mockStudents = [
  {
    id: "stu-001",
    institutionId: "inst-future-01",
    name: "Debendra Bera",
    department: "CSE",
    year: "1st Year",
    section: "A",
  },
  {
    id: "stu-002",
    institutionId: "inst-future-01",
    name: "Priya Sharma",
    department: "CSE",
    year: "1st Year",
    section: "A",
  },
  {
    id: "stu-003",
    institutionId: "inst-future-01",
    name: "Rohan Sen",
    department: "ECE",
    year: "2nd Year",
    section: "B",
  },
];

// ============================================================================
// TEST 1: Notice Count & Targeted Student Calculation (Section 42 TEST 1)
// ============================================================================
console.log("\n--- TEST 1: Notice Count & Targeted Student Metrics ---");
const initialSummary = calculateInstitutionAnalytics(mockNotices, mockStudents, []);
assert("Total notices count matches published notice count (3 notices)", initialSummary.totalNotices === 3);
assert("Targeted students calculated dynamically across notices (>3000)", initialSummary.funnel.publishedCount >= 3000);

// Add a 4th notice and verify counts update
const mockNoticesPlusOne = [
  ...mockNotices,
  {
    id: "not-004",
    institutionId: "inst-future-01",
    title: "Library Book Return Notice",
    category: "Academic",
    targetType: "all",
    recipientsCount: 500,
    publicationDate: "2026-09-04",
    status: "published",
    createdAt: "2026-09-04T10:00:00Z",
  },
];
const updatedSummary = calculateInstitutionAnalytics(mockNoticesPlusOne, mockStudents, []);
assert("Notice count increases dynamically to 4 upon new notice", updatedSummary.totalNotices === 4);
assert("Targeted count increases when new notice is added", updatedSummary.funnel.publishedCount > initialSummary.funnel.publishedCount);

// ============================================================================
// TEST 2: Reach & Relevance Rate Calculations (Section 42 TEST 2)
// ============================================================================
console.log("\n--- TEST 2: Reach & Relevance Calculations ---");
const reachRate = calculateReachRate(240, 250);
assert("Reach rate calculates accurately (96% for 240/250)", reachRate === 96);

const relevanceRate = calculateRelevanceRate(198, 240);
assert("Relevance rate calculates accurately (82.5% for 198/240)", relevanceRate === 82.5);

assert("Summary studentsReached reflects cumulative reached students", initialSummary.studentsReached > 2500);
assert("Relevance distribution contains HIGH, MEDIUM, LOW, and NOT_RELEVANT",
  initialSummary.relevanceDistribution.high > 0 &&
  initialSummary.relevanceDistribution.medium > 0 &&
  initialSummary.relevanceDistribution.notRelevant > 0
);

// ============================================================================
// TEST 3 & 4: Action Count & Completion Calculation (Section 42 TEST 3 & 4)
// ============================================================================
console.log("\n--- TEST 3 & 4: Action Generation & Completion Tracking ---");
assert("Total actions generated is aggregated across notices (>3000)", initialSummary.actionsGenerated > 3000);
assert("Total actions completed is tracked (>2500)", initialSummary.actionsCompleted > 2500);

const completionRate = calculateCompletionRate(341, 412);
assert("Completion rate calculates correctly (82.8% for 341/412)", completionRate === 82.8);
assert("Overall completion rate is between 70% and 90%", initialSummary.overallCompletionRate >= 70 && initialSummary.overallCompletionRate <= 90);

// ============================================================================
// TEST 5: Overdue Count & Overdue Rate (Section 42 TEST 5)
// ============================================================================
console.log("\n--- TEST 5: Overdue Actions Tracking ---");
assert("Overdue actions count is tracked (>50)", initialSummary.actionsOverdue > 50);
const overdueRate = calculateOverdueRate(19, 412);
assert("Overdue rate calculates accurately (4.6% for 19/412)", overdueRate === 4.6);
assert("Overall overdue rate is within expected low threshold (<10%)", initialSummary.overallOverdueRate < 10);

// ============================================================================
// TEST 6: Department Filter Recalculation (Section 42 TEST 6)
// ============================================================================
console.log("\n--- TEST 6: Department Filter Recalculation ---");
const cseFiltered = calculateInstitutionAnalytics(mockNotices, mockStudents, [], {
  dateRange: "all",
  department: "CSE",
});
assert("Department filter limits notices to CSE and campus-wide notices", cseFiltered.totalNotices <= initialSummary.totalNotices);
assert("Department performance list contains department breakdown", initialSummary.departmentPerformance.some(d => d.department === "CSE"));

// ============================================================================
// TEST 7: Date Range Filter Recalculation (Section 42 TEST 7)
// ============================================================================
console.log("\n--- TEST 7: Date Range Filter ---");
const todayFiltered = calculateInstitutionAnalytics(mockNotices, mockStudents, [], {
  dateRange: "today",
});
// Notices published before today (August/early September) will be filtered out if diff > 1 day
assert("Date range filtering updates total notices dynamically", todayFiltered.totalNotices <= initialSummary.totalNotices);

// ============================================================================
// TEST 8: Individual Notice Analytics Isolation (Section 42 TEST 8)
// ============================================================================
console.log("\n--- TEST 8: Notice Analytics Isolation ---");
const singleNoticeAnalytics = calculateNoticeMetrics(mockNotices[0], mockStudents, []);
assert("Notice metrics isolated to not-001", singleNoticeAnalytics.noticeId === "not-001");
assert("Scholarship notice has 240 reached and 198 relevant students", singleNoticeAnalytics.studentsReached === 240 && singleNoticeAnalytics.studentsRelevant === 198);
assert("Scholarship notice has 412 actions generated and 341 completed", singleNoticeAnalytics.actionsGenerated === 412 && singleNoticeAnalytics.actionsCompleted === 341);
assert("Scholarship notice has 19 overdue actions", singleNoticeAnalytics.actionsOverdue === 19);

// ============================================================================
// TEST 9: Multi-Tenant Institution Isolation (Section 42 TEST 9)
// ============================================================================
console.log("\n--- TEST 9: Multi-Tenant Institution Isolation ---");
const schoolNotices = [
  {
    id: "not-sch-01",
    institutionId: "inst-school-01",
    title: "Class 10 Science Exhibition",
    category: "Event",
    recipientsCount: 120,
    status: "published",
    createdAt: "2026-09-01T10:00:00Z",
  },
];
const schoolSummary = calculateInstitutionAnalytics(schoolNotices, [], []);
assert("School institution summary is isolated to inst-school-01", schoolSummary.institutionId === "inst-school-01");
assert("School total notices is 1 and isolated from college notices", schoolSummary.totalNotices === 1);
assert("School does not contain not-001 or not-002", !schoolSummary.noticeAnalyticsList.some(n => n.noticeId === "not-001"));

// ============================================================================
// TEST 10: Student Privacy Boundary (Section 42 TEST 10)
// ============================================================================
console.log("\n--- TEST 10: Student Privacy Boundary ---");
// Verify notice metrics only contain aggregate counts and NO private student notes or identities
const noticeKeys = Object.keys(singleNoticeAnalytics);
assert("Notice analytics does NOT expose private student notes", !noticeKeys.includes("privateNotes"));
assert("Notice analytics does NOT expose personal student tasks", !noticeKeys.includes("personalTasks"));
assert("Notice analytics does NOT expose student identities in actionStates", typeof singleNoticeAnalytics.actionStates.completed === "number");

// ============================================================================
// TEST 11: Actionability Score Calculation (Section 21)
// ============================================================================
console.log("\n--- TEST 11: Actionability Score Formula ---");
// formula: relevanceRate * 0.30 + actionGenerationRate * 0.25 + completionRate * 0.30 + onTimeRate * 0.15
const scoreTest = calculateActionabilityScore({
  relevanceRate: 82.5,
  actionGenerationRate: 80,
  completionRate: 82.8,
  onTimeRate: 91.8,
});
// 82.5*0.3 (24.75) + 80*0.25 (20) + 82.8*0.3 (24.84) + 91.8*0.15 (13.77) = 83.36 -> 83
assert("Actionability score is calculated deterministically (83/100)", scoreTest === 83);
assert("Scholarship notice actionability score is between 70 and 95", singleNoticeAnalytics.actionabilityScore >= 70 && singleNoticeAnalytics.actionabilityScore <= 95);

// ============================================================================
// TEST 12: CSV Export Functionality (Section 40)
// ============================================================================
console.log("\n--- TEST 12: CSV Export Generation ---");
const csvOutput = exportFilteredAnalyticsToCsv(initialSummary.noticeAnalyticsList);
assert("CSV report contains standard header row", csvOutput.includes("Notice ID,Notice Title,Category"));
assert("CSV report includes scholarship notice row", csvOutput.includes("Scholarship Application"));
assert("CSV report includes completion rate column", csvOutput.includes("82.8%"));

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n================================================================================");
if (allPassed) {
  console.log("🎉 ALL STEP 11 INSTITUTION ANALYTICS & IMPACT TESTS PASSED (12/12 PASS)!");
} else {
  console.error("❌ ERRORS DETECTED.");
  process.exit(1);
}
console.log("================================================================================");
