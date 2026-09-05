"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Megaphone,
  FileText,
  AlertCircle,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useStudentAuth, NoticeWithRelevance } from "@/lib/studentStore";
import { PriorityTask } from "@/types/student";
import { NoticeModal } from "@/components/student/NoticeModal";
import { AddTaskModal } from "@/components/student/AddTaskModal";

export default function StudentDashboardPage() {
  const {
    currentStudent,
    getStudentPriorityTasks,
    getStudentNoticesWithRelevance,
    toggleTaskComplete,
    addPersonalTask,
  } = useStudentAuth();

  const [selectedNoticeForModal, setSelectedNoticeForModal] = useState<NoticeWithRelevance | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const priorityTasks = getStudentPriorityTasks();
  const allNotices = getStudentNoticesWithRelevance();

  const studentFirstName = currentStudent?.name?.split(" ")[0] || "Student";

  // Helper to categorize task timing for Today's Work
  const isTaskForToday = (task: PriorityTask): boolean => {
    if (task.status === "COMPLETED") return false;
    if (!task.deadline) return (task.finalQuadrant || task.quadrant) === "Q1";
    const dLower = task.deadline.toLowerCase();
    if (dLower.includes("today") || dLower.includes("sept 5") || dLower.includes("september 5")) {
      return true;
    }
    if (dLower.includes("tomorrow") || dLower.includes("sept 6") || dLower.includes("september 6")) {
      return true;
    }
    // High urgency items prioritized for today
    return (task.finalQuadrant || task.quadrant) === "Q1";
  };

  // 1. TODAY'S WORK: Show only tasks that need attention today, ordered intelligently by priority
  const todaysWork = priorityTasks.filter(isTaskForToday).slice(0, 5);

  // If no specific tasks for today, show top active tasks
  const displayTasks =
    todaysWork.length > 0
      ? todaysWork
      : priorityTasks.filter((t) => t.status !== "COMPLETED").slice(0, 4);

  // Helper for natural status label
  const getTaskStatusLabel = (task: PriorityTask) => {
    if (task.deadline) {
      const dLower = task.deadline.toLowerCase();
      if (dLower.includes("today") || dLower.includes("sept 5") || dLower.includes("september 5")) {
        return { text: "Due today", className: "text-rose-600 font-bold" };
      }
      if (dLower.includes("tomorrow") || dLower.includes("sept 6") || dLower.includes("september 6")) {
        return { text: "Due tomorrow", className: "text-amber-600 font-bold" };
      }
      return { text: `Due ${task.deadline}`, className: "text-slate-500" };
    }
    return { text: "Upcoming", className: "text-slate-400" };
  };

  // 2. NOTICES: Show only a few recent and relevant notices
  const relevantNotices = allNotices
    .filter((n) => n.relevance.relevance !== "NOT_RELEVANT")
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. CLEAN HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Good morning, {studentFirstName} 👋
        </h1>
        <p className="text-sm text-slate-500 font-normal">
          Here's what needs your attention today.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TWO CORE SECTIONS: A) TODAY'S WORK  B) NOTICES
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* SECTION A: TODAY'S WORK (7 Cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                TODAY'S WORK
              </h2>
              {displayTasks.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {displayTasks.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddTaskModalOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add task</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {displayTasks.length > 0 ? (
              displayTasks.map((task) => {
                const status = getTaskStatusLabel(task);
                const isCompleted = task.status === "COMPLETED";

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs transition-all flex items-start gap-3.5 group"
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                        isCompleted
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 hover:border-indigo-600 bg-white"
                      }`}
                      aria-label="Toggle task completion"
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm font-bold block leading-snug transition-colors ${
                          isCompleted
                            ? "line-through text-slate-400"
                            : "text-slate-900 group-hover:text-indigo-900"
                        }`}
                      >
                        {task.title}
                      </span>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs">
                        <span className={status.className}>{status.text}</span>

                        {task.dependencies?.isBlocked && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-amber-700 text-[11px] font-medium">
                              Needed for {task.dependencies.blockedByTaskTitle || "next task"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/80 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">You're all caught up for today!</p>
                <p className="text-slate-400 mt-0.5">No pressing tasks currently due.</p>
              </div>
            )}
          </div>

          <div className="pt-1">
            <Link
              href="/student/work"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Go to My Work</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* SECTION B: NOTICES (5 Cols) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              NOTICES
            </h2>

            <Link
              href="/student/notices"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 transition-colors"
            >
              <span>View all notices</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {relevantNotices.length > 0 ? (
              relevantNotices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNoticeForModal(notice)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300/80 hover:shadow-xs transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Relevant to you
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {notice.publicationDate || notice.date}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {notice.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="truncate">
                      {notice.authorName || notice.createdBy || "Academic Office"}
                    </span>
                    {notice.deadline && (
                      <span className="text-rose-600 font-semibold text-[11px] shrink-0">
                        Deadline: {notice.deadline}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/80 text-slate-400 text-xs">
                No recent notices published for your batch.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Notice Reader Modal */}
      {selectedNoticeForModal && (
        <NoticeModal
          notice={selectedNoticeForModal}
          isOpen={true}
          onClose={() => setSelectedNoticeForModal(null)}
        />
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSave={(newTaskData) => {
          addPersonalTask(newTaskData);
          setIsAddTaskModalOpen(false);
        }}
      />
    </div>
  );
}
