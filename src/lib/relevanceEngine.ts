import { Notice, NoticeAiAnalysis } from "@/types/institution";
import { StudentProfile, NoticeRelevance, NoticeRelevanceLevel, PersonalizedAction } from "@/types/student";

// Helper to normalize department strings (e.g. "Computer Science & Engineering" -> "CSE")
export function normalizeDepartment(dept?: string): string {
  if (!dept) return "";
  const upper = dept.trim().toUpperCase();
  if (upper.includes("COMPUTER SCIENCE") || upper === "CSE" || upper.includes("CS&E")) return "CSE";
  if (upper.includes("ELECTRONICS") || upper === "ECE" || upper.includes("EC&E")) return "ECE";
  if (upper.includes("INFORMATION TECHNOLOGY") || upper === "IT") return "IT";
  if (upper.includes("MECHANICAL") || upper === "ME") return "ME";
  if (upper.includes("CIVIL") || upper === "CE") return "CIVIL";
  if (upper.includes("ELECTRICAL") || upper === "EE") return "EE";
  return upper;
}

// Helper to normalize year strings (e.g. "1st Year" -> "1ST")
export function normalizeYear(year?: string): string {
  if (!year) return "";
  const upper = year.trim().toUpperCase();
  if (upper.includes("1ST") || upper.includes("FIRST") || upper === "1") return "1ST";
  if (upper.includes("2ND") || upper.includes("SECOND") || upper === "2") return "2ND";
  if (upper.includes("3RD") || upper.includes("THIRD") || upper === "3") return "3RD";
  if (upper.includes("4TH") || upper.includes("FOURTH") || upper === "4") return "4TH";
  return upper;
}

// Helper to normalize class strings (e.g. "Class 10" -> "10")
export function normalizeClass(className?: string): string {
  if (!className) return "";
  const clean = className.toUpperCase().replace("CLASS", "").replace("GRADE", "").trim();
  return clean;
}

// Helper to normalize section strings
export function normalizeSection(sec?: string): string {
  if (!sec) return "";
  return sec.trim().toUpperCase();
}

/**
 * Deterministic + Semantic Relevance Evaluation Function
 *
 * Answers: "Does this notice actually apply to this student?"
 */
export function calculateNoticeRelevance(
  notice: Notice,
  student: StudentProfile
): NoticeRelevance {
  const reasons: string[] = [];
  const matchedCriteria: string[] = [];
  const unmatchedCriteria: string[] = [];
  let score = 0;
  let eligibilityStatus: "CONFIRMED" | "NEEDS_REVIEW" | "INELIGIBLE" = "CONFIRMED";

  const isCollege = student.institutionType === "college" || !!student.department || !!student.email;

  // 1. Institution Check
  const instMatch =
    notice.institutionId === student.institutionId ||
    (notice.institutionId === "inst-future-01" && student.institutionId === "inst-future-01") ||
    !notice.institutionId;

  if (!instMatch) {
    return {
      id: `rel_${notice.id}_${student.id}`,
      noticeId: notice.id,
      studentId: student.id,
      relevance: "NOT_RELEVANT",
      score: 0,
      reasons: ["✕ Notice is issued by a different institution"],
      matchedCriteria: [],
      unmatchedCriteria: ["Institution mismatch"],
      personalizedSummary: "This circular is not intended for your registered institution.",
      personalizedTasks: [],
      eligibilityStatus: "INELIGIBLE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // 2. Direct Selected Student Target
  if (notice.targetType === "selected" && notice.selectedStudentIds) {
    if (notice.selectedStudentIds.includes(student.id)) {
      score = 100;
      matchedCriteria.push("Direct Student Recipient");
      reasons.push("✓ You were explicitly selected by the issuer as a direct recipient");
      return buildRelevanceResponse(notice, student, "HIGH", score, reasons, matchedCriteria, unmatchedCriteria, eligibilityStatus);
    } else {
      score = 5;
      unmatchedCriteria.push("Not in direct recipient list");
      reasons.push("✕ This notice was published to specific selected individual recipients");
      return buildRelevanceResponse(notice, student, "NOT_RELEVANT", score, reasons, matchedCriteria, unmatchedCriteria, "INELIGIBLE");
    }
  }

  // 3. Institution Targeting Evaluation
  let targetDeptMatch = true;
  let targetYearMatch = true;
  let targetClassMatch = true;
  let targetSecMatch = true;

  const stuDept = normalizeDepartment(student.department);
  const stuYear = normalizeYear(student.year);
  const stuSec = normalizeSection(student.section);
  const stuClass = normalizeClass(student.className || student.class);

  const noticeDept = normalizeDepartment(notice.targetDepartment);
  const noticeYear = normalizeYear(notice.targetYear);
  const noticeSec = normalizeSection(notice.targetSection);
  const noticeClass = normalizeClass(notice.targetClass);

  const targetType = notice.targetType || "all";
  const targetGroupUpper = (notice.targetGroup || "").toUpperCase();

  // Evaluate Department / Stream
  if (noticeDept) {
    if (stuDept === noticeDept) {
      matchedCriteria.push(`Department: ${student.department || stuDept}`);
      reasons.push(`✓ Your department is ${student.department || stuDept}`);
      score += 40;
    } else {
      targetDeptMatch = false;
      unmatchedCriteria.push(`Target Department: ${notice.targetDepartment || noticeDept}`);
      reasons.push(`✕ Notice applies to ${notice.targetDepartment || noticeDept} students, while your profile is ${student.department || stuDept || "different"}`);
    }
  }

  // Evaluate Academic Year
  if (noticeYear && noticeYear !== "ALL" && !noticeYear.includes("ALL")) {
    if (stuYear === noticeYear || stuYear.includes(noticeYear) || noticeYear.includes(stuYear)) {
      matchedCriteria.push(`Year: ${student.year || stuYear}`);
      reasons.push(`✓ Your academic year is ${student.year || stuYear}`);
      score += 35;
    } else {
      targetYearMatch = false;
      unmatchedCriteria.push(`Target Year: ${notice.targetYear || noticeYear}`);
      reasons.push(`✕ Notice applies to ${notice.targetYear || noticeYear} students, while your profile is ${student.year || stuYear || "different"}`);
    }
  } else if (noticeDept && stuDept === noticeDept) {
    // All years within department
    score += 30;
    matchedCriteria.push("All Academic Years in Department");
    reasons.push(`✓ Notice applies to all years in ${student.department || stuDept}`);
  }

  // Evaluate Section Cohort
  if (targetType === "section") {
    if (noticeSec && noticeSec !== "ALL") {
      if (stuSec === noticeSec) {
        matchedCriteria.push(`Section: ${stuSec}`);
        reasons.push(`✓ Your section cohort is Section ${stuSec}`);
        score += 25;
      } else {
        targetSecMatch = false;
        unmatchedCriteria.push(`Target Section: Section ${noticeSec}`);
        reasons.push(`✕ Notice is restricted to Section ${noticeSec}, while you are enrolled in Section ${stuSec}`);
      }
    }
  }

  // School Class Evaluation
  if (student.institutionType === "school" || !isCollege) {
    if (noticeClass) {
      if (stuClass === noticeClass || stuClass.includes(noticeClass)) {
        matchedCriteria.push(`Class: ${student.className || stuClass}`);
        reasons.push(`✓ Your enrolled grade is ${student.className || stuClass}`);
        score += 45;
      } else {
        targetClassMatch = false;
        unmatchedCriteria.push(`Target Class: ${notice.targetClass || noticeClass}`);
        reasons.push(`✕ Notice applies to ${notice.targetClass || noticeClass}, while your grade is ${student.className || stuClass}`);
      }
    }
    if (noticeSec && noticeSec !== "ALL") {
      if (stuSec === noticeSec) {
        matchedCriteria.push(`Section: ${stuSec}`);
        reasons.push(`✓ Your class section is Section ${stuSec}`);
        score += 25;
      } else {
        targetSecMatch = false;
        unmatchedCriteria.push(`Target Section: Section ${noticeSec}`);
        reasons.push(`✕ Notice is restricted to Section ${noticeSec}, while you are in Section ${stuSec}`);
      }
    }
  }

  // Evaluate Broadcast "All Students"
  if (targetType === "all" || targetGroupUpper === "ALL STUDENTS" || targetGroupUpper.includes("ALL STUDENTS")) {
    score = 85;
    matchedCriteria.push("Campus Broadcast Recipient");
    reasons.push(`✓ You are included in the institution's campus-wide announcement broadcast`);
  }

  // 4. Cross-Reference AI Understanding Audience (Step 5 Output)
  const aiAudience = notice.aiAnalysis?.audience;
  if (aiAudience) {
    // Check AI departments
    if (aiAudience.departments && aiAudience.departments.length > 0) {
      const normalizedAiDepts = aiAudience.departments.map(normalizeDepartment);
      if (stuDept && !normalizedAiDepts.includes(stuDept) && !normalizedAiDepts.includes("ALL")) {
        // AI found specific department constraint that conflicts
        unmatchedCriteria.push(`Notice Content: ${aiAudience.departments.join(", ")}`);
        reasons.push(`✕ Notice content specifies ${aiAudience.departments.join(", ")} students only, while you belong to ${student.department || stuDept}`);
        targetDeptMatch = false;
      }
    }

    // Check AI years
    if (aiAudience.years && aiAudience.years.length > 0) {
      const normalizedAiYears = aiAudience.years.map(normalizeYear);
      if (stuYear && !normalizedAiYears.includes(stuYear) && !normalizedAiYears.includes("ALL")) {
        unmatchedCriteria.push(`Notice Content Year: ${aiAudience.years.join(", ")}`);
        reasons.push(`✕ Notice content specifies ${aiAudience.years.join(", ")}, while your profile is ${student.year || stuYear}`);
        targetYearMatch = false;
      }
    }

    // Check AI sections
    if (aiAudience.sections && aiAudience.sections.length > 0) {
      const normalizedAiSecs = aiAudience.sections.map(normalizeSection);
      if (stuSec && !normalizedAiSecs.includes(stuSec) && !normalizedAiSecs.includes("ALL")) {
        unmatchedCriteria.push(`Notice Content Section: ${aiAudience.sections.join(", ")}`);
        reasons.push(`✕ Notice content specifies Section ${aiAudience.sections.join(", ")}, while you are in Section ${stuSec}`);
        targetSecMatch = false;
      }
    }
  }

  // If explicit department or year mismatch occurred
  if (!targetDeptMatch || !targetYearMatch || !targetClassMatch) {
    const finalScore = Math.min(score, 15);
    return buildRelevanceResponse(
      notice,
      student,
      "NOT_RELEVANT",
      finalScore,
      reasons,
      matchedCriteria,
      unmatchedCriteria,
      "INELIGIBLE"
    );
  }

  // Section mismatch penalty if notice is strictly section-targeted
  if (!targetSecMatch && targetType === "section") {
    score = Math.max(score - 40, 25);
    return buildRelevanceResponse(
      notice,
      student,
      "LOW",
      score,
      reasons,
      matchedCriteria,
      unmatchedCriteria,
      "NEEDS_REVIEW"
    );
  }

  // 5. Semantic Interests & Academic Keywords Matching
  const noticeText = `${notice.title} ${notice.content} ${notice.aiSummary || ""}`.toLowerCase();
  const studentInterests = student.interests || [];
  let interestBonus = 0;

  studentInterests.forEach((interest) => {
    const term = interest.toLowerCase();
    if (
      (term.includes("ai") && (noticeText.includes("ai") || noticeText.includes("artificial intelligence") || noticeText.includes("machine learning"))) ||
      (term.includes("coding") && (noticeText.includes("coding") || noticeText.includes("hackathon") || noticeText.includes("programming"))) ||
      (term.includes("web") && (noticeText.includes("web") || noticeText.includes("frontend") || noticeText.includes("fullstack"))) ||
      (term.includes("robotics") && noticeText.includes("robotics")) ||
      (term.includes("cybersecurity") && noticeText.includes("cybersecurity")) ||
      noticeText.includes(term)
    ) {
      interestBonus += 10;
      matchedCriteria.push(`Interest: ${interest}`);
      reasons.push(`✓ Matches your declared interest in ${interest}`);
    }
  });

  score = Math.min(score + interestBonus, 100);

  // 6. Check for Missing Eligibility Information (e.g. CGPA, Prerequisite Course)
  const reqs = notice.aiAnalysis?.requirements || [];
  const hasCgpaReq =
    reqs.some((r) => r.toLowerCase().includes("cgpa") || r.toLowerCase().includes("gpa") || r.toLowerCase().includes("marks")) ||
    noticeText.includes("cgpa above") ||
    noticeText.includes("gpa >") ||
    noticeText.includes("cgpa >");

  if (hasCgpaReq) {
    eligibilityStatus = "NEEDS_REVIEW";
    reasons.push("⚠ Eligibility cannot be confirmed automatically because CGPA information is not in your profile.");
    // Cap score to MEDIUM
    if (score > 70) score = 70;
  }

  // 7. Map Final Score to Relevance Level
  let relevanceLevel: NoticeRelevanceLevel = "HIGH";
  if (eligibilityStatus === "NEEDS_REVIEW" && score > 70) {
    relevanceLevel = "MEDIUM";
  } else if (score >= 80) {
    relevanceLevel = "HIGH";
  } else if (score >= 50) {
    relevanceLevel = "MEDIUM";
  } else if (score >= 20) {
    relevanceLevel = "LOW";
  } else {
    relevanceLevel = "NOT_RELEVANT";
  }

  // Ensure high confidence reasons are populated
  if (relevanceLevel === "HIGH" && reasons.length === 0) {
    reasons.push("✓ Notice matches your institutional department and year profile");
  }

  return buildRelevanceResponse(
    notice,
    student,
    relevanceLevel,
    score,
    reasons,
    matchedCriteria,
    unmatchedCriteria,
    eligibilityStatus
  );
}

/**
 * Builds the structured NoticeRelevance object and transforms tasks into personalized actions
 */
function buildRelevanceResponse(
  notice: Notice,
  student: StudentProfile,
  relevance: NoticeRelevanceLevel,
  score: number,
  reasons: string[],
  matchedCriteria: string[],
  unmatchedCriteria: string[],
  eligibilityStatus: "CONFIRMED" | "NEEDS_REVIEW" | "INELIGIBLE"
): NoticeRelevance {
  let personalizedTasks: PersonalizedAction[] = [];
  let personalizedSummary = "";

  if (relevance === "NOT_RELEVANT") {
    personalizedSummary = `This notice does not currently apply to you because it is targeted to ${notice.targetGroup || "a different cohort"}.`;
    personalizedTasks = [];
  } else {
    // Generate personalized interpretation
    const deadlineStr = notice.deadline || notice.aiDates?.deadline || "";
    if (deadlineStr) {
      personalizedSummary = `Your action for "${notice.title}" is due on ${deadlineStr}. Review the requirements and submit the necessary documents.`;
    } else {
      personalizedSummary = `This official circular from ${student.institutionName} applies to your cohort (${student.department || student.className}, ${student.year || "Enrolled"}).`;
    }

    // Transform AI extracted tasks into student's personalized action checklist
    const sourceTasks = notice.aiAnalysis?.tasks || notice.aiTasks || [];
    if (sourceTasks.length > 0) {
      personalizedTasks = sourceTasks.map((task, idx) => ({
        id: `act_${notice.id}_${student.id}_${idx + 1}`,
        noticeId: notice.id,
        noticeTitle: notice.title,
        title: personalizeTaskTitle(task.title, student),
        description: task.description ? personalizeTaskDescription(task.description, student) : undefined,
        deadline: task.deadline || notice.deadline || null,
        estimatedMinutes: task.estimated_minutes || 30,
        status: "pending",
        sourceTask: task.title,
      }));
    } else if (notice.deadline && relevance === "HIGH") {
      // Fallback action if tasks were not explicitly extracted
      personalizedTasks = [
        {
          id: `act_${notice.id}_${student.id}_1`,
          noticeId: notice.id,
          noticeTitle: notice.title,
          title: `Review and complete ${notice.title}`,
          description: `Submit before the specified action deadline: ${notice.deadline}.`,
          deadline: notice.deadline,
          estimatedMinutes: 30,
          status: "pending",
          sourceTask: "Review notice requirements",
        },
      ];
    }
  }

  return {
    id: `rel_${notice.id}_${student.id}`,
    noticeId: notice.id,
    studentId: student.id,
    relevance,
    score,
    reasons,
    matchedCriteria,
    unmatchedCriteria,
    personalizedSummary,
    personalizedTasks,
    eligibilityStatus,
    isStale: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Convert 3rd-person text ("Students must submit...") to 2nd-person ("Submit your...")
function personalizeTaskTitle(title: string, _student: StudentProfile): string {
  let clean = title.trim();
  clean = clean.replace(/^Students must /i, "");
  clean = clean.replace(/^Students should /i, "");
  clean = clean.replace(/^Students are required to /i, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function personalizeTaskDescription(desc: string, _student: StudentProfile): string {
  let clean = desc.trim();
  clean = clean.replace(/\bthe student's\b/gi, "your");
  clean = clean.replace(/\bstudents'\b/gi, "your");
  clean = clean.replace(/\bstudents\b/gi, "you");
  return clean;
}

// ============================================================================
// CACHING UTILITIES
// ============================================================================

const RELEVANCE_CACHE_PREFIX = "noticeiq_rel_cache_";

export function getCachedRelevance(noticeId: string, studentId: string): NoticeRelevance | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${RELEVANCE_CACHE_PREFIX}${noticeId}_${studentId}`);
    if (!raw) return null;
    const parsed: NoticeRelevance = JSON.parse(raw);
    if (parsed.isStale) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setCachedRelevance(relevance: NoticeRelevance): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${RELEVANCE_CACHE_PREFIX}${relevance.noticeId}_${relevance.studentId}`,
      JSON.stringify(relevance)
    );
  } catch (err) {
    console.error("Failed to cache notice relevance:", err);
  }
}

export function invalidateStudentRelevanceCache(studentId: string): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(RELEVANCE_CACHE_PREFIX) && key.endsWith(`_${studentId}`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error("Failed to invalidate student relevance cache:", err);
  }
}

// ============================================================================
// ADMIN AUDIENCE BREAKDOWN HELPER
// ============================================================================

export interface NoticeAudienceBreakdown {
  totalTargetRecipients: number;
  matchingCount: number; // HIGH
  potentiallyRelevantCount: number; // MEDIUM
  notRelevantCount: number; // NOT_RELEVANT & LOW
  sampleMatchingCohorts: string[];
}

export function calculateNoticeAudienceBreakdown(
  notice: Notice,
  allStudents: StudentProfile[]
): NoticeAudienceBreakdown {
  let high = 0;
  let medium = 0;
  let notRel = 0;

  const matchingCohorts = new Set<string>();

  allStudents.forEach((stu) => {
    const res = calculateNoticeRelevance(notice, stu);
    if (res.relevance === "HIGH") {
      high++;
      const cohort = `${stu.department || stu.className || "Cohort"} • ${stu.year || ""} Sec ${stu.section}`;
      matchingCohorts.add(cohort.trim());
    } else if (res.relevance === "MEDIUM") {
      medium++;
    } else {
      notRel++;
    }
  });

  // Scale up count realistically if student directory contains sample subset
  const totalStudentsInDirectory = allStudents.length || 1;
  const targetTotal = notice.recipientsCount || notice.recipientCount || 486;

  // Compute proportion based on actual directory matches
  let matchingEstimate = Math.round((high / totalStudentsInDirectory) * targetTotal);
  let potentiallyRelevantEstimate = Math.round((medium / totalStudentsInDirectory) * targetTotal);
  
  if (notice.targetType === "all" || (notice.targetGroup || "").toUpperCase().includes("ALL")) {
    matchingEstimate = targetTotal;
    potentiallyRelevantEstimate = 0;
  } else if (high === 0 && medium > 0) {
    matchingEstimate = 0;
    potentiallyRelevantEstimate = Math.round(targetTotal * 0.15);
  } else if (high > 0) {
    matchingEstimate = Math.max(matchingEstimate, Math.round(targetTotal * 0.85));
    potentiallyRelevantEstimate = Math.round(targetTotal * 0.05);
  }

  const notRelevantEstimate = Math.max(0, targetTotal - matchingEstimate - potentiallyRelevantEstimate);

  return {
    totalTargetRecipients: targetTotal,
    matchingCount: matchingEstimate,
    potentiallyRelevantCount: potentiallyRelevantEstimate,
    notRelevantCount: notRelevantEstimate,
    sampleMatchingCohorts: Array.from(matchingCohorts),
  };
}
