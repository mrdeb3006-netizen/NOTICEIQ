"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Zap,
  Target,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Megaphone,
  AlertTriangle,
  Check,
  Plus,
  User,
  Layers,
} from "lucide-react";
import { useStudentAuth, NoticeWithRelevance } from "@/lib/studentStore";
import { PriorityBadge } from "@/components/student/PriorityBadge";
import { NoticeModal } from "@/components/student/NoticeModal";
import { AddTaskModal } from "@/components/student/AddTaskModal";

export default function StudentDashboardPage() {
  const {
    currentStudent,
    getStudentNoticesWithRelevance,
    getStudentPriorityTasks,
    toggleTaskComplete,
    addPersonalTask,
  } = useStudentAuth();

  const [selectedNoticeForModal, setSelectedNoticeForModal] =
    useState<NoticeWithRelevance | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const allNoticesWithRel = getStudentNoticesWithRelevance();
  const allPriorityTasks = getStudentPriorityTasks();

  // Filter only relevant notices for the dashboard feed
  const relevantNotices = allNoticesWithRel.filter(
    (n) => n.relevance.relevance === "HIGH" || n.relevance.relevance === "MEDIUM"
  );

  // Active prioritized tasks (not completed)
  const activeTasks = allPriorityTasks.filter((t) => t.status !== "COMPLETED");
  const q1Tasks = activeTasks.filter((t) => (t.finalQuadrant || t.quadrant) === "Q1");
  const q2Tasks = activeTasks.filter((t) => (t.finalQuadrant || t.quadrant) === "Q2");
  const q3Tasks = activeTasks.filter((t) => (t.finalQuadrant || t.quadrant) === "Q3");
  const q4Tasks = activeTasks.filter((t) => (t.finalQuadrant || t.quadrant) === "Q4");

  // Top focus items (Q1 first, then Q2)
  const focusTodayTasks = [...q1Tasks, ...q2Tasks].slice(0, 3);
  const urgentCount = q1Tasks.length;

  // Manual overrides count
  const overriddenTasks = allPriorityTasks.filter(
    (t) => !!t.studentQuadrantOverride && t.studentQuadrantOverride !== t.aiQuadrant
  );

  const isCollege = currentStudent?.institutionType === "college" || !!currentStudent?.email;

  const handleOpenNotice = (noticeId: string) => {
    const found = allNoticesWithRel.find((n) => n.id === noticeId);
    if (found) {
      setSelectedNoticeForModal(found);
    }
  };

  const dashboardCards = [
    {
      title: "My Actions & Tasks",
      icon: <Zap className="w-6 h-6 text-violet-600" />,
      bgIcon: "bg-violet-50",
      description: "Manage notice actions and personal student goals.",
      subtext: `${activeTasks.length} total active tasks (${allPriorityTasks.filter((t) => t.taskType === "PERSONAL").length} personal).`,
      status: "Live Active",
      href: "/student/actions",
    },
    {
      title: "Priority Matrix",
      icon: <Target className="w-6 h-6 text-rose-600" />,
      bgIcon: "bg-rose-50",
      description: "Eisenhower 4-quadrant task prioritization (Q1–Q4).",
      subtext: `${q1Tasks.length} Q1 DO FIRST • ${q2Tasks.length} Q2 SCHEDULE active items.`,
      status: "Live Active",
      href: "/student/priority",
    },
    {
      title: "Notices & Circulars",
      icon: <Inbox className="w-6 h-6 text-indigo-600" />,
      bgIcon: "bg-indigo-50",
      description: "Official notices & personalized relevance scoring.",
      subtext: `${relevantNotices.length} relevant circulars matching your cohort profile.`,
      status: "Live Active",
      href: "/student/inbox",
    },
    {
      title: "Schedule",
      icon: <Calendar className="w-6 h-6 text-emerald-600" />,
      bgIcon: "bg-emerald-50",
      description: "Adaptive study calendar & time blocks.",
      subtext: `Target window: ${currentStudent?.preferredStartTime || "6 PM"} – ${currentStudent?.preferredEndTime || "10 PM"}.`,
      status: "Coming in Step 9",
      href: "/student/schedule",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Welcome Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-indigo-900 via-indigo-800 to-violet-950 text-white shadow-xl shadow-indigo-900/15 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Student Workspace</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome, {currentStudent?.name || "Student"} 👋
            </h2>

            <div className="flex items-center gap-2 text-xs text-indigo-200 flex-wrap">
              <span className="font-semibold text-white">
                {currentStudent?.institutionName || "Future Institute of Engineering and Management"}
              </span>
              <span>•</span>
              <span>
                {isCollege
                  ? `${currentStudent?.department || "CSE"} • ${currentStudent?.year || "1st Year"} • Section ${currentStudent?.section || "A"}`
                  : `${currentStudent?.className || "Class 10"} • Section ${currentStudent?.section || "B"}`}
              </span>
              <span>•</span>
              <span className="font-mono">Roll #{currentStudent?.rollNumber || "23"}</span>
            </div>
          </div>

          <div className="self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsAddTaskModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>+ Add Personal Task</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* FOCUS TODAY SECTION (Step 7 Priority Engine + Step 8 Student Control) */}
      {/* ===================================================================== */}
      <section className="space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                FOCUS TODAY
              </h3>
              <div className="flex items-center gap-1.5 ml-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                  Q1: {q1Tasks.length}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                  Q2: {q2Tasks.length}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {urgentCount > 0
                ? `${urgentCount} action${urgentCount > 1 ? "s" : ""} need your immediate attention.`
                : "Top priorities prioritized automatically from notices and your personal goals."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Link
              href="/student/actions"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
            >
              <span>My Actions ({activeTasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Override indicator if manual decisions exist */}
        {overriddenTasks.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-center justify-between gap-2">
            <span>
              ✨ <strong>My decisions:</strong> You have manually prioritized {overriddenTasks.length} action{overriddenTasks.length > 1 ? "s" : ""}.
            </span>
            <Link href="/student/actions" className="text-[11px] font-bold text-amber-900 hover:underline">
              View overrides →
            </Link>
          </div>
        )}

        {focusTodayTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {focusTodayTasks.map((task) => {
              const isBlocked = task.dependencies?.isBlocked;
              const isPrereq = task.dependencies?.isPrerequisiteForOthers;
              const isPersonal = task.taskType === "PERSONAL";
              const hasOverride = !!task.studentQuadrantOverride && task.studentQuadrantOverride !== task.aiQuadrant;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative group ${
                    (task.finalQuadrant || task.quadrant) === "Q1"
                      ? "bg-rose-50/40 border-rose-200 hover:border-rose-400 hover:shadow-md"
                      : "bg-amber-50/40 border-amber-200 hover:border-amber-400 hover:shadow-md"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <PriorityBadge quadrant={task.finalQuadrant || task.quadrant} size="sm" />

                      {isPersonal ? (
                        <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                          <User className="w-2.5 h-2.5" />
                          <span>Personal</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                          <Megaphone className="w-2.5 h-2.5" />
                          <span>Notice</span>
                        </span>
                      )}

                      {hasOverride && (
                        <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                          {task.studentQuadrantOverride}
                        </span>
                      )}

                      {isBlocked && (
                        <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>BLOCKED</span>
                        </span>
                      )}

                      {isPrereq && (
                        <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          <span>PREREQ</span>
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/student/actions/${task.id}`}
                      className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 hover:text-indigo-600 transition-colors block"
                    >
                      {task.title}
                    </Link>

                    {task.dependencies?.blockedByTaskTitle && isBlocked && (
                      <p className="text-[10px] text-amber-800 font-medium">
                        ⚠ Complete "{task.dependencies.blockedByTaskTitle}" first.
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    {task.deadline ? (
                      <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{task.deadline}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">No deadline</span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(task.id)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-emerald-600 hover:text-emerald-600 text-slate-700 text-[10px] font-extrabold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <Check className="w-3 h-3" />
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 text-center text-xs text-slate-500 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-800">All Focus Today actions are completed!</p>
            <p className="text-[11px]">Check your Priority Matrix for upcoming scheduled goals.</p>
          </div>
        )}
      </section>

      {/* Matching Notices for You Section (Step 6 Relevance Feed) */}
      <section className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <span>Personalized Relevant Circulars</span>
            </h3>
            <p className="text-xs text-slate-500">
              Notices scored as HIGH or MEDIUM relevance for {isCollege ? `${currentStudent?.department} • ${currentStudent?.year} • Section ${currentStudent?.section}` : `${currentStudent?.className} • Section ${currentStudent?.section}`}.
            </p>
          </div>

          <Link
            href="/student/inbox"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
          >
            <span>View All in Inbox ({relevantNotices.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {relevantNotices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantNotices.slice(0, 2).map((notice) => (
              <div
                key={notice.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          notice.relevance.relevance === "HIGH"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {notice.relevance.relevance === "HIGH"
                          ? `🟢 Relevant (${notice.relevance.score}%)`
                          : `🟡 Possibly Relevant (${notice.relevance.score}%)`}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {notice.category}
                      </span>
                    </div>

                    {!notice.isRead && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        New
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {notice.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  {notice.deadline ? (
                    <span className="flex items-center gap-1 font-semibold text-amber-800 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{notice.deadline}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">No deadline</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenNotice(notice.id)}
                    className="text-indigo-600 font-bold text-xs flex items-center gap-1 hover:underline"
                  >
                    <span>View Notice</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 text-center text-xs text-slate-500">
            No notices currently published match your active cohort profile.
          </div>
        )}
      </section>

      {/* 4 Main Workflow Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Student Workflows & Priorities
          </h3>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            Autonomous Student Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {dashboardCards.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 text-left group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${card.bgIcon} transition-transform group-hover:scale-105`}>
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                    {card.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs font-medium text-slate-700 mt-1">
                    {card.description}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {card.subtext}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Adaptive Prioritization</span>
                <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSave={(data) => {
          addPersonalTask(data);
        }}
        availableTasksForDependency={allPriorityTasks}
      />

      {/* Notice Detail Modal */}
      <NoticeModal
        notice={selectedNoticeForModal}
        onClose={() => setSelectedNoticeForModal(null)}
      />
    </div>
  );
}
