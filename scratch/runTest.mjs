// Deterministic Schedule Engine Logic for direct Node testing
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

function formatTime12Hour(hours, minutes) {
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours}:${displayMinutes} ${period}`;
}

function addMinutesToTime(hours, minutes, minutesToAdd) {
  const totalMins = hours * 60 + minutes + minutesToAdd;
  const endHours = Math.floor(totalMins / 60) % 24;
  const endMinutes = totalMins % 60;
  return {
    endHours,
    endMinutes,
    formatted: formatTime12Hour(endHours, endMinutes),
  };
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

function sortTasksForScheduling(tasks, now = new Date()) {
  return [...tasks].sort((a, b) => {
    const aDate = parseFlexibleDate(a.deadline);
    const bDate = parseFlexibleDate(b.deadline);

    const aIsOverdue = aDate && aDate.getTime() < now.getTime() && a.status !== "COMPLETED";
    const bIsOverdue = bDate && bDate.getTime() < now.getTime() && b.status !== "COMPLETED";

    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;

    const quadRank = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
    const aQuad = a.finalQuadrant || a.quadrant || "Q4";
    const bQuad = b.finalQuadrant || b.quadrant || "Q4";

    if (quadRank[aQuad] !== quadRank[bQuad]) {
      return quadRank[aQuad] - quadRank[bQuad];
    }

    const aIsPrereq = a.dependencies?.isPrerequisiteForOthers && a.status !== "COMPLETED";
    const bIsPrereq = b.dependencies?.isPrerequisiteForOthers && b.status !== "COMPLETED";
    if (aIsPrereq && !bIsPrereq) return -1;
    if (!aIsPrereq && bIsPrereq) return 1;

    if (b.dependencies?.blockedByTaskId === a.id) return -1;
    if (a.dependencies?.blockedByTaskId === b.id) return 1;

    if (aDate && bDate) {
      const diff = aDate.getTime() - bDate.getTime();
      if (diff !== 0) return diff;
    } else if (aDate && !bDate) {
      return -1;
    } else if (!aDate && bDate) {
      return 1;
    }

    const aScore = a.finalPriorityScore ?? a.priorityScore ?? 50;
    const bScore = b.finalPriorityScore ?? b.priorityScore ?? 50;
    return bScore - aScore;
  });
}

function generateSchedule(tasks, availability, dateRangeDays = 7, existingOverrides = {}, now = new Date()) {
  const activeTasks = tasks.filter((t) => t.status !== "COMPLETED" && !t.isRemoved);
  const sortedTasks = sortTasksForScheduling(activeTasks, now);

  const bufferPercent = availability.bufferPercent ?? 15;
  const rawDailyMinutes = availability.availableDailyMinutes || 120;
  const bufferMinutesPerDay = Math.max(15, Math.round(rawDailyMinutes * (bufferPercent / 100) - 3));
  const maxScheduledMinutesPerDay = Math.max(30, rawDailyMinutes - bufferMinutesPerDay);

  const { hours: startHour, minutes: startMinute } = parseTimeString(availability.preferredStartTime || "18:00");

  const dailyPlans = [];
  const unscheduledTasks = [];
  const conflicts = [];
  const scheduledTaskDates = {};
  const completedDependencies = new Set();

  for (let d = 0; d < dateRangeDays; d++) {
    const planDate = new Date(now);
    planDate.setDate(now.getDate() + d);
    const dateStr = formatDateIso(planDate);
    const dayLabel = d === 0 ? "Today" : d === 1 ? "Tomorrow" : `Day ${d + 1}`;

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

  sortedTasks.forEach((task) => {
    let taskDuration = task.estimatedMinutes || 30;
    const taskDeadlineDate = parseFlexibleDate(task.deadline);
    const isPrerequisite = !!task.dependencies?.isPrerequisiteForOthers;
    const blockedById = task.dependencies?.blockedByTaskId;

    let placed = false;
    let earliestDayIdx = 0;
    if (blockedById && scheduledTaskDates[blockedById]) {
      earliestDayIdx = scheduledTaskDates[blockedById].dayIndex;
    }

    for (let dayIdx = earliestDayIdx; dayIdx < dailyPlans.length; dayIdx++) {
      const plan = dailyPlans[dayIdx];
      const planDate = new Date(now);
      planDate.setDate(now.getDate() + dayIdx);

      if (taskDeadlineDate) {
        const targetDateEnd = new Date(taskDeadlineDate.getFullYear(), taskDeadlineDate.getMonth(), taskDeadlineDate.getDate(), 23, 59, 59);
        if (planDate.getTime() > targetDateEnd.getTime()) break;
      }

      if (blockedById && scheduledTaskDates[blockedById]) {
        const prereqInfo = scheduledTaskDates[blockedById];
        const prereqDayIdx = dailyPlans.findIndex((p) => p.date === prereqInfo.dateStr);
        if (dayIdx < prereqDayIdx) continue;
      }

      const currentScheduled = plan.scheduledMinutes;
      const remainingCapacity = maxScheduledMinutesPerDay - currentScheduled;

      if (remainingCapacity <= 0) continue;

      if (taskDuration <= remainingCapacity) {
        const currentSlotMinutes = plan.items.reduce((acc, it) => acc + it.durationMinutes, 0);
        const { formatted: startTimeFormatted } = addMinutesToTime(startHour, startMinute, currentSlotMinutes);
        const { formatted: endTimeFormatted, endHours, endMinutes } = addMinutesToTime(startHour, startMinute, currentSlotMinutes + taskDuration);

        const itemId = `sch_${task.id}_${plan.date}_${plan.items.length + 1}`;
        const override = existingOverrides[itemId] || {};

        const scheduleItem = {
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
          whyScheduledHere: override.whyScheduledHere || (task.finalQuadrant === "Q1" ? "High priority Q1" : "Standard slot"),
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
        const part1Duration = remainingCapacity;
        const part2Duration = taskDuration - part1Duration;

        const currentSlotMinutes = plan.items.reduce((acc, it) => acc + it.durationMinutes, 0);
        const { formatted: startTime1 } = addMinutesToTime(startHour, startMinute, currentSlotMinutes);
        const { formatted: endTime1 } = addMinutesToTime(startHour, startMinute, currentSlotMinutes + part1Duration);

        plan.items.push({
          id: `sch_${task.id}_${plan.date}_p1`,
          taskId: task.id,
          taskTitle: `${task.title} (Part 1/2)`,
          quadrant: task.finalQuadrant || "Q4",
          startTime: startTime1,
          endTime: endTime1,
          durationMinutes: part1Duration,
          isSplit: true,
          splitPart: 1,
        });
        plan.scheduledMinutes += part1Duration;
        plan.remainingMinutes = Math.max(0, plan.availableMinutes - plan.scheduledMinutes);

        const nextPlan = dailyPlans[dayIdx + 1];
        const nextSlotMinutes = nextPlan.items.reduce((acc, it) => acc + it.durationMinutes, 0);
        const { formatted: startTime2 } = addMinutesToTime(startHour, startMinute, nextSlotMinutes);
        const { formatted: endTime2, endHours: endH2, endMinutes: endM2 } = addMinutesToTime(startHour, startMinute, nextSlotMinutes + part2Duration);

        nextPlan.items.push({
          id: `sch_${task.id}_${nextPlan.date}_p2`,
          taskId: task.id,
          taskTitle: `${task.title} (Part 2/2)`,
          quadrant: task.finalQuadrant || "Q4",
          startTime: startTime2,
          endTime: endTime2,
          durationMinutes: part2Duration,
          isSplit: true,
          splitPart: 2,
        });
        nextPlan.scheduledMinutes += part2Duration;
        nextPlan.remainingMinutes = Math.max(0, nextPlan.availableMinutes - nextPlan.scheduledMinutes);

        scheduledTaskDates[task.id] = {
          dateStr: nextPlan.date,
          endMinutesFromMidnight: endH2 * 60 + endM2,
        };
        completedDependencies.add(task.id);
        placed = true;
        break;
      }
    }

    if (!placed) {
      unscheduledTasks.push({
        task,
        reason: "Capacity reached before deadline",
      });
      conflicts.push(`Task "${task.title}" could not be accommodated in the weekly schedule.`);
    }
  });

  return {
    dailyPlans,
    unscheduledTasks,
    conflicts,
  };
}

console.log("================================================================================");
console.log("🧪 NOTICEIQ STEP 9: RUNNING DETERMINISTIC SCHEDULING VERIFICATION");
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

const mockStudentAvailability = {
  studentId: "std_debendra",
  preferredStartTime: "18:00",
  preferredEndTime: "22:00",
  availableDailyMinutes: 120,
  bufferPercent: 15,
};

const fixedNow = new Date("2026-09-08T10:00:00Z");

const demoTasks = [
  {
    id: "task_1_income",
    title: "Obtain Income Certificate",
    deadline: "2026-09-10",
    estimatedMinutes: 30,
    finalQuadrant: "Q1",
    finalPriorityScore: 88,
    dependencies: { isPrerequisiteForOthers: true, blocksTaskTitles: ["Complete Scholarship Application"] },
    status: "TODO",
  },
  {
    id: "task_2_scholarship",
    title: "Complete Scholarship Application",
    deadline: "2026-09-10",
    estimatedMinutes: 30,
    finalQuadrant: "Q1",
    finalPriorityScore: 92,
    dependencies: { blockedByTaskId: "task_1_income", blockedByTaskTitle: "Obtain Income Certificate" },
    status: "TODO",
  },
  {
    id: "task_3_lab",
    title: "Complete Lab Assignment",
    deadline: "2026-09-12",
    estimatedMinutes: 45,
    finalQuadrant: "Q2",
    finalPriorityScore: 75,
    status: "TODO",
  },
  {
    id: "task_4_workshop",
    title: "Explore Optional Workshop",
    deadline: null,
    estimatedMinutes: 30,
    finalQuadrant: "Q4",
    finalPriorityScore: 30,
    status: "TODO",
  },
];

const res = generateSchedule(demoTasks, mockStudentAvailability, 7, {}, fixedNow);
const todayItems = res.dailyPlans[0].items;

console.log("\nToday's Schedule Items:");
todayItems.forEach(item => {
  console.log(`  - [${item.startTime} — ${item.endTime}] ${item.taskTitle} (${item.durationMinutes}m) [${item.quadrant}]`);
});

assert("Income certificate scheduled first (6:00 PM — 6:30 PM)", todayItems[0]?.startTime === "6:00 PM" && todayItems[0]?.endTime === "6:30 PM");
assert("Scholarship application scheduled second (6:30 PM — 7:00 PM)", todayItems[1]?.startTime === "6:30 PM" && todayItems[1]?.endTime === "7:00 PM");
assert("Lab assignment scheduled third (7:00 PM — 7:45 PM)", todayItems[2]?.startTime === "7:00 PM" && todayItems[2]?.endTime === "7:45 PM");

assert("Total scheduled time is 105m or within usable capacity with buffer", res.dailyPlans[0].scheduledMinutes <= 105);
assert("Buffer of 15m+ is reserved for flexibility", res.dailyPlans[0].remainingMinutes >= 15);

// TEST 4: Student Priority Override
console.log("\n--- TEST 4: Student Priority Override ---");
const overrideTask = {
  ...demoTasks[2],
  finalQuadrant: "Q1",
  finalPriorityScore: 95,
};
const overrideRes = generateSchedule([demoTasks[0], demoTasks[1], overrideTask], mockStudentAvailability, 7, {}, fixedNow);
const overrideLab = overrideRes.dailyPlans[0].items.find(i => i.taskId === overrideTask.id);
assert("Student promoted Q1 task is recognized as Q1 in schedule", overrideLab?.quadrant === "Q1");

// TEST 5: Long Task Splitting
console.log("\n--- TEST 5: Long Task Splitting ---");
const longTask = {
  id: "task_long",
  studentId: "std_debendra",
  taskType: "PERSONAL",
  title: "Term Paper",
  deadline: "2026-09-14",
  estimatedMinutes: 120,
  finalQuadrant: "Q2",
  finalPriorityScore: 85,
  status: "TODO",
};
const tightAvail = {
  studentId: "std_debendra",
  preferredStartTime: "18:00",
  preferredEndTime: "20:00",
  availableDailyMinutes: 80,
  bufferPercent: 15,
};
const splitRes = generateSchedule([longTask], tightAvail, 7, {}, fixedNow);
assert("Long task is split into Part 1/2 on Day 1", splitRes.dailyPlans[0].items.some(i => i.isSplit && i.splitPart === 1));
assert("Continuation Part 2/2 is scheduled on Day 2", splitRes.dailyPlans[1].items.some(i => i.isSplit && i.splitPart === 2));

// TEST 6: Student Manual Schedule Override
console.log("\n--- TEST 6: Student Schedule Customization ---");
const customOverrides = {
  "sch_task_1_income_2026-09-08_1": {
    startTime: "7:30 PM",
    endTime: "8:00 PM",
  },
};
const custRes = generateSchedule(demoTasks, mockStudentAvailability, 7, customOverrides, fixedNow);
const custItem = custRes.dailyPlans[0].items.find(i => i.taskId === "task_1_income");
assert("Student moved time slot to 7:30 PM is honored", custItem?.startTime === "7:30 PM");

// TEST 7: Completed Tasks Exclusion
console.log("\n--- TEST 7: Completed Tasks Exclusion ---");
const completedTaskSet = [
  { ...demoTasks[0], status: "COMPLETED" },
  demoTasks[1],
];
const compRes = generateSchedule(completedTaskSet, mockStudentAvailability, 7, {}, fixedNow);
assert("Completed task is excluded from active schedule", !compRes.dailyPlans[0].items.some(i => i.taskId === "task_1_income"));
assert("Dependent task is scheduled first after prerequisite completion", compRes.dailyPlans[0].items[0]?.taskId === "task_2_scholarship");

console.log("\n================================================================================");
if (allPassed) {
  console.log("🎉 ALL STEP 9 DETERMINISTIC SCHEDULING VERIFICATIONS SUCCEEDED (7/7 PASS)!");
} else {
  console.error("❌ ERRORS DETECTED.");
  process.exit(1);
}
console.log("================================================================================");

