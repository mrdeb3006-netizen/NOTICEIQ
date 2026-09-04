"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Target,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  Layers,
  Check,
  Zap,
  Plus,
  Trash2,
} from "lucide-react";
import { useStudentAuth, NoticeWithRelevance } from "@/lib/studentStore";
import { PriorityTask, TaskQuadrant, TaskStatus } from "@/types/student";
import { PriorityBadge } from "@/components/student/PriorityBadge";
import { TaskCard } from "@/components/student/TaskCard";
import { NoticeModal } from "@/components/student/NoticeModal";
import { AddTaskModal } from "@/components/student/AddTaskModal";
import { QUADRANT_CONFIG } from "@/lib/priorityEngine";

export default function StudentPriorityMatrixPage() {
  const {
    currentStudent,
    getStudentPriorityTasks,
    getStudentNoticesWithRelevance,
    toggleTaskComplete,
    resetTaskCompletions,
    addPersonalTask,
    updateTask,
    deletePersonalTask,
    removeAiTask,
    resetTaskQuadrantOverride,
    setTaskStatus,
  } = useStudentAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuadrant, setSelectedQuadrant] = useState<"ALL" | TaskQuadrant | "COMPLETED">("ALL");
  const [selectedNoticeForModal, setSelectedNoticeForModal] = useState<NoticeWithRelevance | null>(null);

  // Modal states
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PriorityTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<PriorityTask | null>(null);

  const allPriorityTasks = getStudentPriorityTasks();
  const allNotices = getStudentNoticesWithRelevance();

  // Active tasks (not completed)
  const activeTasks = allPriorityTasks.filter((t) => t.status !== "COMPLETED");
  const completedTasks = allPriorityTasks.filter((t) => t.status === "COMPLETED");

  // Manual overrides
  const overriddenTasks = allPriorityTasks.filter(
    (t) => !!t.studentQuadrantOverride && t.studentQuadrantOverride !== t.aiQuadrant
  );

  // Filter tasks by search query
  const searchFilter = (task: PriorityTask) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(term) ||
      (task.noticeTitle && task.noticeTitle.toLowerCase().includes(term)) ||
      (task.description && task.description.toLowerCase().includes(term)) ||
      (task.privateNote && task.privateNote.toLowerCase().includes(term)) ||
      task.priorityReasons.some((r) => r.toLowerCase().includes(term))
    );
  };

  const filteredActiveTasks = activeTasks.filter(searchFilter);
  const filteredCompletedTasks = completedTasks.filter(searchFilter);

  // Group active tasks into Quadrants (based on finalQuadrant)
  const q1Tasks = filteredActiveTasks.filter((t) => (t.finalQuadrant || t.quadrant) === "Q1");
  const q2Tasks = filteredActiveTasks.filter((t) => (t.finalQuadrant || t.quadrant) === "Q2");
  const q3Tasks = filteredActiveTasks.filter((t) => (t.finalQuadrant || t.quadrant) === "Q3");
  const q4Tasks = filteredActiveTasks.filter((t) => (t.finalQuadrant || t.quadrant) === "Q4");

  // Check for any overdue tasks
  const overdueTasks = activeTasks.filter((t) => t.urgencyScore >= 98);

  const handleOpenNotice = (noticeId: string) => {
    const found = allNotices.find((n) => n.id === noticeId);
    if (found) {
      setSelectedNoticeForModal(found);
    }
  };

  const handleEditTask = (task: PriorityTask) => {
    setEditingTask(task);
    setIsAddTaskModalOpen(true);
  };

  const handleDeleteTask = (task: PriorityTask) => {
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (!taskToDelete) return;
    if (taskToDelete.taskType === "PERSONAL") {
      deletePersonalTask(taskToDelete.id);
    } else {
      removeAiTask(taskToDelete.id);
    }
    setTaskToDelete(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                My Priority Matrix
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Focus on what matters most. AI recommends, you control.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setIsAddTaskModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Task</span>
          </button>

          <Link
            href="/student/actions"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Action Checklist</span>
          </Link>

          <Link
            href="/student/inbox"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Notice Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Overdue Warning Banner if present */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-rose-900 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              ⚠ Attention: You have {overdueTasks.length} overdue task
              {overdueTasks.length > 1 ? "s" : ""} requiring immediate action.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-rose-700 underline">
            Review Q1 DO FIRST
          </span>
        </div>
      )}

      {/* Manual Decisions Indicator if overrides exist */}
      {overriddenTasks.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-sm">✨</span>
            <span>
              <strong>My decisions:</strong> You have manually prioritized {overriddenTasks.length} action{overriddenTasks.length > 1 ? "s" : ""}. NoticeIQ honors your decisions over AI estimates.
            </span>
          </div>
          <Link
            href="/student/actions"
            className="text-[11px] font-bold text-amber-900 hover:underline shrink-0"
          >
            View My Actions →
          </Link>
        </div>
      )}

      {/* Matrix Summary Stats & Controls Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelectedQuadrant("Q1")}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            selectedQuadrant === "Q1"
              ? "bg-rose-50/90 border-rose-300 ring-2 ring-rose-500/20 shadow-sm"
              : "bg-white border-slate-200/90 hover:border-rose-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-700">🔴 Q1 DO FIRST</span>
            <span className="text-lg font-black text-slate-900 font-mono">
              {q1Tasks.length}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 truncate">
            Urgent & Important
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedQuadrant("Q2")}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            selectedQuadrant === "Q2"
              ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20 shadow-sm"
              : "bg-white border-slate-200/90 hover:border-amber-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-800">🟡 Q2 SCHEDULE</span>
            <span className="text-lg font-black text-slate-900 font-mono">
              {q2Tasks.length}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 truncate">
            Not Urgent & Important
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedQuadrant("Q3")}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            selectedQuadrant === "Q3"
              ? "bg-sky-50/90 border-sky-300 ring-2 ring-sky-500/20 shadow-sm"
              : "bg-white border-slate-200/90 hover:border-sky-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-sky-800">🔵 Q3 DELEGATE</span>
            <span className="text-lg font-black text-slate-900 font-mono">
              {q3Tasks.length}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 truncate">
            Urgent & Routine
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedQuadrant("Q4")}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            selectedQuadrant === "Q4"
              ? "bg-slate-100 border-slate-300 ring-2 ring-slate-500/20 shadow-sm"
              : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700">⚪ Q4 LATER</span>
            <span className="text-lg font-black text-slate-900 font-mono">
              {q4Tasks.length}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 truncate">
            Not Urgent / Optional
          </p>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedQuadrant("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedQuadrant === "ALL"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            2 × 2 Matrix ({activeTasks.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedQuadrant("Q1")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedQuadrant === "Q1"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            Q1 Only ({q1Tasks.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedQuadrant("Q2")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedQuadrant === "Q2"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            Q2 Only ({q2Tasks.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedQuadrant("Q3")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedQuadrant === "Q3"
                ? "bg-sky-600 text-white shadow-2xs"
                : "bg-sky-50 text-sky-800 hover:bg-sky-100"
            }`}
          >
            Q3 Only ({q3Tasks.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedQuadrant("Q4")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedQuadrant === "Q4"
                ? "bg-slate-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Q4 Only ({q4Tasks.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedQuadrant("COMPLETED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedQuadrant === "COMPLETED"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            Completed ({completedTasks.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-64 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search priority tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2 × 2 EISENHOWER MATRIX VIEW                                         */}
      {/* ===================================================================== */}
      {selectedQuadrant === "ALL" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QUADRANT 1: DO FIRST */}
          <div className="p-5 rounded-3xl bg-white border-2 border-rose-200/90 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
                  <h3 className="text-sm font-black text-rose-800 tracking-tight">
                    Q1 — DO FIRST
                  </h3>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono">
                  {q1Tasks.length} {q1Tasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Critical deadlines, exam requirements, and prerequisite forms that demand immediate execution.
              </p>

              <div className="space-y-3 pt-1">
                {q1Tasks.length > 0 ? (
                  q1Tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={toggleTaskComplete}
                      onViewNotice={handleOpenNotice}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={setTaskStatus}
                      onResetOverride={resetTaskQuadrantOverride}
                    />
                  ))
                ) : (
                  <div className="p-8 rounded-2xl bg-rose-50/40 border border-dashed border-rose-200 text-center space-y-1 text-xs text-rose-700">
                    <CheckCircle2 className="w-6 h-6 text-rose-500 mx-auto" />
                    <p className="font-bold">No urgent Q1 items</p>
                    <p className="text-[11px] text-slate-500">
                      All high-priority urgent deadlines are currently resolved.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QUADRANT 2: SCHEDULE */}
          <div className="p-5 rounded-3xl bg-white border-2 border-amber-200/90 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-black text-amber-900 tracking-tight">
                    Q2 — SCHEDULE
                  </h3>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono">
                  {q2Tasks.length} {q2Tasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Important academic tasks, personal milestones, and long-range study goals. Schedule focused blocks.
              </p>

              <div className="space-y-3 pt-1">
                {q2Tasks.length > 0 ? (
                  q2Tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={toggleTaskComplete}
                      onViewNotice={handleOpenNotice}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={setTaskStatus}
                      onResetOverride={resetTaskQuadrantOverride}
                    />
                  ))
                ) : (
                  <div className="p-8 rounded-2xl bg-amber-50/40 border border-dashed border-amber-200 text-center space-y-1 text-xs text-amber-800">
                    <Clock className="w-6 h-6 text-amber-500 mx-auto" />
                    <p className="font-bold">No Q2 items pending</p>
                    <p className="text-[11px] text-slate-500">
                      You are completely on schedule with longer-term goals.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QUADRANT 3: HANDLE / DELEGATE */}
          <div className="p-5 rounded-3xl bg-white border-2 border-sky-200/90 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-500" />
                  <h3 className="text-sm font-black text-sky-900 tracking-tight">
                    Q3 — HANDLE / DELEGATE
                  </h3>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 font-mono">
                  {q3Tasks.length} {q3Tasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Time-sensitive quick tasks, administrative acknowledgments, and routine inquiries.
              </p>

              <div className="space-y-3 pt-1">
                {q3Tasks.length > 0 ? (
                  q3Tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={toggleTaskComplete}
                      onViewNotice={handleOpenNotice}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={setTaskStatus}
                      onResetOverride={resetTaskQuadrantOverride}
                    />
                  ))
                ) : (
                  <div className="p-8 rounded-2xl bg-sky-50/40 border border-dashed border-sky-200 text-center space-y-1 text-xs text-sky-800">
                    <Zap className="w-6 h-6 text-sky-500 mx-auto" />
                    <p className="font-bold">No routine Q3 items</p>
                    <p className="text-[11px] text-slate-500">
                      No rapid administrative actions pending.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QUADRANT 4: LATER */}
          <div className="p-5 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400" />
                  <h3 className="text-sm font-black text-slate-700 tracking-tight">
                    Q4 — LATER
                  </h3>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  {q4Tasks.length} {q4Tasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Optional club events, non-essential webinars, and general background announcements.
              </p>

              <div className="space-y-3 pt-1">
                {q4Tasks.length > 0 ? (
                  q4Tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={toggleTaskComplete}
                      onViewNotice={handleOpenNotice}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={setTaskStatus}
                      onResetOverride={resetTaskQuadrantOverride}
                    />
                  ))
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1 text-xs text-slate-600">
                    <Layers className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="font-bold">No Q4 items</p>
                    <p className="text-[11px] text-slate-400">
                      No low-priority or optional tasks detected.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : selectedQuadrant === "COMPLETED" ? (
        /* =================================================================== */
        /* COMPLETED HISTORY VIEW                                              */
        /* =================================================================== */
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Completed Actions History ({filteredCompletedTasks.length})
              </h3>
            </div>

            {completedTasks.length > 0 && (
              <button
                type="button"
                onClick={resetTaskCompletions}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Completed</span>
              </button>
            )}
          </div>

          {filteredCompletedTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompletedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleTaskComplete}
                  onViewNotice={handleOpenNotice}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={setTaskStatus}
                  onResetOverride={resetTaskQuadrantOverride}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                No completed tasks yet
              </p>
              <p className="text-[11px] text-slate-400">
                Check off items in Q1, Q2, Q3, or Q4 to see them here.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* =================================================================== */
        /* SINGLE QUADRANT FILTER VIEW                                         */
        /* =================================================================== */
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PriorityBadge quadrant={selectedQuadrant as TaskQuadrant} size="lg" />
              <span className="text-xs text-slate-500 font-medium">
                {QUADRANT_CONFIG[selectedQuadrant as TaskQuadrant]?.description}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedQuadrant("ALL")}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Back to 2 × 2 Matrix →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(selectedQuadrant === "Q1"
              ? q1Tasks
              : selectedQuadrant === "Q2"
              ? q2Tasks
              : selectedQuadrant === "Q3"
              ? q3Tasks
              : q4Tasks
            ).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskComplete}
                onViewNotice={handleOpenNotice}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={setTaskStatus}
                onResetOverride={resetTaskQuadrantOverride}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => {
          setIsAddTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={(data) => {
          if (editingTask) {
            updateTask(editingTask.id, data);
          } else {
            addPersonalTask(data);
          }
        }}
        existingTask={editingTask}
        availableTasksForDependency={allPriorityTasks}
      />

      {/* Delete / Remove Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-left animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {taskToDelete.taskType === "PERSONAL"
                    ? "Delete Personal Task?"
                    : "Remove from My Actions?"}
                </h3>
                <p className="text-xs text-slate-500">
                  {taskToDelete.taskType === "PERSONAL"
                    ? "This will permanently delete this task."
                    : "This removes this action from your checklist without modifying the institutional notice."}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium p-3 rounded-xl bg-slate-50 border border-slate-100">
              "{taskToDelete.title}"
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                {taskToDelete.taskType === "PERSONAL" ? "Delete Task" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Details Modal */}
      <NoticeModal
        notice={selectedNoticeForModal}
        onClose={() => setSelectedNoticeForModal(null)}
      />
    </div>
  );
}
