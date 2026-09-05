"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  Lock,
  Edit2,
  Trash2,
  X,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useStudentAuth, NoticeWithRelevance } from "@/lib/studentStore";
import { PriorityTask, TaskStatus, StudentImportance } from "@/types/student";
import { AddTaskModal } from "@/components/student/AddTaskModal";
import { NoticeModal } from "@/components/student/NoticeModal";

type TabType = "TODAY" | "UPCOMING" | "COMPLETED" | "ALL";

export default function StudentWorkPage() {
  const {
    currentStudent,
    getStudentPriorityTasks,
    getStudentNoticesWithRelevance,
    toggleTaskComplete,
    addPersonalTask,
    updateTask,
    deletePersonalTask,
    setTaskImportanceOverride,
    resetTaskQuadrantOverride,
  } = useStudentAuth();

  const [activeTab, setActiveTab] = useState<TabType>("TODAY");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<PriorityTask | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedNoticeForModal, setSelectedNoticeForModal] = useState<NoticeWithRelevance | null>(null);

  // Note editing state in drawer
  const [editedNote, setEditedNote] = useState("");
  const [noteSavedToast, setNoteSavedToast] = useState(false);

  const priorityTasks = getStudentPriorityTasks();
  const allNotices = getStudentNoticesWithRelevance();

  // Helper to categorize task timing
  const getTaskTimingCategory = (task: PriorityTask): "TODAY" | "UPCOMING" | "OVERDUE" => {
    if (!task.deadline) return "UPCOMING";
    const dLower = task.deadline.toLowerCase();
    if (dLower.includes("today") || dLower.includes("sept 5") || dLower.includes("september 5")) {
      return "TODAY";
    }
    if (dLower.includes("tomorrow") || dLower.includes("sept 6") || dLower.includes("september 6")) {
      return "TODAY";
    }
    return "UPCOMING";
  };

  // Helper for natural status badge
  const getStatusBadge = (task: PriorityTask) => {
    if (task.status === "COMPLETED") {
      return {
        label: "Completed",
        className: "bg-slate-100 text-slate-500 border-slate-200",
      };
    }
    const timing = getTaskTimingCategory(task);
    if (timing === "TODAY") {
      return {
        label: "Due today",
        className: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
      };
    }
    return {
      label: task.deadline ? `Due ${task.deadline}` : "Upcoming",
      className: "bg-slate-100 text-slate-600 border-slate-200",
    };
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return priorityTasks.filter((task) => {
      // 1. Tab filter
      if (activeTab === "COMPLETED") {
        if (task.status !== "COMPLETED") return false;
      } else if (activeTab === "TODAY") {
        if (task.status === "COMPLETED") return false;
        // Show Q1 or due today / tomorrow
        const timing = getTaskTimingCategory(task);
        const isUrgent = (task.finalQuadrant || task.quadrant) === "Q1";
        if (timing !== "TODAY" && !isUrgent) return false;
      } else if (activeTab === "UPCOMING") {
        if (task.status === "COMPLETED") return false;
        const timing = getTaskTimingCategory(task);
        const isUrgent = (task.finalQuadrant || task.quadrant) === "Q1";
        if (timing === "TODAY" || isUrgent) return false;
      } else {
        // ALL tab shows all active
        if (task.status === "COMPLETED") return false;
      }

      // 2. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchNotice = task.noticeTitle?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchNotice;
      }

      return true;
    });
  }, [priorityTasks, activeTab, searchQuery]);

  const activeCount = priorityTasks.filter((t) => t.status !== "COMPLETED").length;
  const completedCount = priorityTasks.filter((t) => t.status === "COMPLETED").length;

  const handleOpenTaskDetails = (task: PriorityTask) => {
    setSelectedTask(task);
    setEditedNote(task.privateNote || "");
  };

  const handleSaveNote = () => {
    if (!selectedTask) return;
    updateTask(selectedTask.id, { privateNote: editedNote });
    setSelectedTask({ ...selectedTask, privateNote: editedNote });
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 2000);
  };

  const handlePriorityChange = (level: StudentImportance) => {
    if (!selectedTask) return;
    setTaskImportanceOverride(selectedTask.id, level);
    setSelectedTask({ ...selectedTask, studentImportanceOverride: level });
  };

  const handleResetPriority = () => {
    if (!selectedTask) return;
    resetTaskQuadrantOverride(selectedTask.id);
    setSelectedTask({
      ...selectedTask,
      studentImportanceOverride: null,
      studentQuadrantOverride: null,
    });
  };

  const handleOpenSourceNotice = (noticeId?: string) => {
    if (!noticeId) return;
    const found = allNotices.find((n) => n.id === noticeId);
    if (found) {
      setSelectedNoticeForModal(found);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Work
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your single unified task center. Intelligently ordered for you.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddTaskModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 w-fit">
          {(
            [
              { id: "TODAY", label: "Today" },
              { id: "UPCOMING", label: "Upcoming" },
              { id: "COMPLETED", label: `Completed (${completedCount})` },
              { id: "ALL", label: `All Active (${activeCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search work..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isCompleted = task.status === "COMPLETED";
            const badge = getStatusBadge(task);
            const isUrgent = (task.finalQuadrant || task.quadrant) === "Q1";

            return (
              <div
                key={task.id}
                onClick={() => handleOpenTaskDetails(task)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCompleted
                    ? "bg-slate-50/60 border-slate-200/80 opacity-70"
                    : isUrgent && activeTab === "TODAY"
                    ? "bg-white border-rose-200 shadow-xs hover:border-rose-300"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task.id);
                    }}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      isCompleted
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 hover:border-indigo-600 bg-white"
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isCompleted ? "line-through text-slate-400" : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-slate-500">
                      {task.noticeTitle ? (
                        <span className="truncate max-w-[200px]">
                          {task.noticeTitle}
                        </span>
                      ) : (
                        <span>Personal Goal</span>
                      )}

                      {task.dependencies?.isBlocked && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 font-semibold">
                            Needed: {task.dependencies.blockedByTaskTitle || "Prerequisite"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-400">
            <Zap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">
              No tasks in this view
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You are all caught up for {activeTab.toLowerCase()}!
            </p>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TASK DETAILS DRAWER / MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSelectedTask(null)}
          />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 overflow-y-auto space-y-6 z-10 animate-in slide-in-from-right duration-200 text-left">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block mb-1">
                  {selectedTask.taskType === "PERSONAL" ? "Personal Task" : "Notice Action Item"}
                </span>
                <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                  {selectedTask.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Completion & Timing */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Status</span>
                <button
                  type="button"
                  onClick={() => {
                    toggleTaskComplete(selectedTask.id);
                    setSelectedTask({
                      ...selectedTask,
                      status: selectedTask.status === "COMPLETED" ? "TODO" : "COMPLETED",
                    });
                  }}
                  className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                    selectedTask.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-indigo-100 text-indigo-800"
                  }`}
                >
                  {selectedTask.status === "COMPLETED" ? "✓ Completed" : "Mark as Completed"}
                </button>
              </div>

              {selectedTask.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Deadline</span>
                  <span className="font-bold text-slate-800">{selectedTask.deadline}</span>
                </div>
              )}

              {selectedTask.estimatedMinutes && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Estimated Time</span>
                  <span className="text-slate-700">~{selectedTask.estimatedMinutes} minutes</span>
                </div>
              )}
            </div>

            {/* What needs to be done */}
            {selectedTask.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900">What needs to be done</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                  {selectedTask.description}
                </p>
              </div>
            )}

            {/* Dependency in Natural Language */}
            {selectedTask.dependencies?.isBlocked && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Sequential Dependency</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Complete <strong>{selectedTask.dependencies.blockedByTaskTitle}</strong> first because this task depends on it.
                </p>
              </div>
            )}

            {/* Source Notice Link */}
            {selectedTask.noticeTitle && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900">Source Circular</h4>
                <button
                  type="button"
                  onClick={() => handleOpenSourceNotice(selectedTask.noticeId)}
                  className="w-full p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 hover:border-indigo-300 text-left flex items-center justify-between text-xs text-indigo-900 transition-colors"
                >
                  <span className="font-semibold truncate">{selectedTask.noticeTitle}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />
                </button>
              </div>
            )}

            {/* Student Control Layer (Simple Priority Override) */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Priority</h4>
                  <p className="text-[10px] text-slate-400">
                    NoticeIQ recommended order • You can adjust anytime
                  </p>
                </div>

                <select
                  value={selectedTask.studentImportanceOverride || "NORMAL"}
                  onChange={(e) => handlePriorityChange(e.target.value as StudentImportance)}
                  className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {selectedTask.studentImportanceOverride && (
                <button
                  type="button"
                  onClick={handleResetPriority}
                  className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to NoticeIQ recommendation</span>
                </button>
              )}
            </div>

            {/* Private Personal Notes */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-900">Private Personal Notes</h4>
                </div>
                {noteSavedToast && (
                  <span className="text-[10px] font-bold text-emerald-600">Saved!</span>
                )}
              </div>

              <textarea
                rows={3}
                placeholder="Add private thoughts, e.g. 'Friend is helping after 6 PM'..."
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Actions for Personal Tasks */}
            {selectedTask.taskType === "PERSONAL" && (
              <div className="border-t border-slate-100 pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    deletePersonalTask(selectedTask.id);
                    setSelectedTask(null);
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Personal Task</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
