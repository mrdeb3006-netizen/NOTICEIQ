"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  Target,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  Megaphone,
  Filter,
  Layers,
  Sparkles,
  Trash2,
  Lock,
} from "lucide-react";
import { useStudentAuth, NoticeWithRelevance } from "@/lib/studentStore";
import { PriorityTask, TaskQuadrant, TaskStatus } from "@/types/student";
import { PriorityBadge } from "@/components/student/PriorityBadge";
import { TaskCard } from "@/components/student/TaskCard";
import { AddTaskModal } from "@/components/student/AddTaskModal";
import { NoticeModal } from "@/components/student/NoticeModal";

type TabType = "ALL" | "FOCUS_NOW" | "PERSONAL" | "NOTICE" | "COMPLETED";

export default function StudentActionsPage() {
  const {
    currentStudent,
    getStudentPriorityTasks,
    getStudentNoticesWithRelevance,
    toggleTaskComplete,
    addPersonalTask,
    updateTask,
    deletePersonalTask,
    removeAiTask,
    resetTaskQuadrantOverride,
    setTaskStatus,
  } = useStudentAuth();

  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [selectedQuadrantFilter, setSelectedQuadrantFilter] = useState<"ALL" | TaskQuadrant>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PriorityTask | null>(null);
  const [selectedNoticeForModal, setSelectedNoticeForModal] = useState<NoticeWithRelevance | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<PriorityTask | null>(null);

  const priorityTasks = getStudentPriorityTasks();
  const allNotices = getStudentNoticesWithRelevance();

  const activeTasks = priorityTasks.filter((t) => t.status !== "COMPLETED");
  const completedTasks = priorityTasks.filter((t) => t.status === "COMPLETED");
  const personalTasks = priorityTasks.filter((t) => t.taskType === "PERSONAL" && t.status !== "COMPLETED");
  const noticeTasks = priorityTasks.filter((t) => t.taskType === "AI_GENERATED" && t.status !== "COMPLETED");
  const focusNowTasks = priorityTasks.filter(
    (t) => (t.finalQuadrant === "Q1" || t.finalQuadrant === "Q2") && t.status !== "COMPLETED"
  );

  // Overridden tasks count
  const overriddenTasks = priorityTasks.filter(
    (t) => !!t.studentQuadrantOverride && t.studentQuadrantOverride !== t.aiQuadrant
  );

  // Search and Tab Filtering
  const filteredTasks = priorityTasks.filter((task) => {
    // 1. Tab filter
    if (activeTab === "FOCUS_NOW") {
      if (task.status === "COMPLETED" || (task.finalQuadrant !== "Q1" && task.finalQuadrant !== "Q2")) {
        return false;
      }
    } else if (activeTab === "PERSONAL") {
      if (task.taskType !== "PERSONAL" || task.status === "COMPLETED") return false;
    } else if (activeTab === "NOTICE") {
      if (task.taskType !== "AI_GENERATED" || task.status === "COMPLETED") return false;
    } else if (activeTab === "COMPLETED") {
      if (task.status !== "COMPLETED") return false;
    } else {
      // "ALL" tab shows active tasks
      if (task.status === "COMPLETED") return false;
    }

    // 2. Quadrant chip filter
    if (selectedQuadrantFilter !== "ALL") {
      if ((task.finalQuadrant || task.quadrant) !== selectedQuadrantFilter) return false;
    }

    // 3. Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description ? task.description.toLowerCase().includes(q) : false;
      const matchNotice = task.noticeTitle ? task.noticeTitle.toLowerCase().includes(q) : false;
      const matchNote = task.privateNote ? task.privateNote.toLowerCase().includes(q) : false;
      return matchTitle || matchDesc || matchNotice || matchNote;
    }

    return true;
  });

  const handleOpenNotice = (noticeId: string) => {
    const found = allNotices.find((n) => n.id === noticeId);
    if (found) setSelectedNoticeForModal(found);
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

  const isCollege =
    currentStudent?.institutionType === "college" ||
    !!currentStudent?.department ||
    !!currentStudent?.email;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-600/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                My Actions
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Unified workspace for institutional actions and personal goals.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setIsAddTaskModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Task</span>
          </button>

          <Link
            href="/student/priority"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all"
          >
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Priority Matrix</span>
          </Link>
        </div>
      </div>

      {/* Summary Stat Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-tr from-violet-950 via-indigo-950 to-slate-950 text-white shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 block">
              NoticeIQ Adaptive Task Engine
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              {completedTasks.length} of {priorityTasks.length} Actions Completed
            </h3>
            <p className="text-xs text-violet-200">
              AI Recommends. You Control. NoticeIQ Adapts.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            {overriddenTasks.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                ✨ My Decisions: You prioritized {overriddenTasks.length} action{overriddenTasks.length > 1 ? "s" : ""}
              </span>
            )}
            <div className="w-48 bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${
                    priorityTasks.length > 0
                      ? (completedTasks.length / priorityTasks.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Main Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/80 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Actions ({activeTasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("FOCUS_NOW")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "FOCUS_NOW"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <span>🔥 Focus Now ({focusNowTasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("PERSONAL")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "PERSONAL"
                ? "bg-purple-600 text-white shadow-2xs"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>👤 Personal Tasks ({personalTasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("NOTICE")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "NOTICE"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>📢 Notice Actions ({noticeTasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "COMPLETED"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>✓ Completed ({completedTasks.length})</span>
          </button>
        </div>

        {/* Search & Quadrant Filter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Quadrant Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 hidden sm:inline">
              Quadrant:
            </span>
            {(["ALL", "Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setSelectedQuadrantFilter(q)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedQuadrantFilter === q
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {q === "ALL" ? "All Quadrants" : q}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-72 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search my actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Task List Workspace */}
      <div className="space-y-3.5">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
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
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              No tasks found
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? "No tasks match your search criteria. Try a different keyword."
                : "No actions under this category. Tap '+ Add Task' to add personal goals."}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setIsAddTaskModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Personal Task</span>
            </button>
          </div>
        )}
      </div>

      {/* Trust & Transparency Banner (Section 29) */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          NoticeIQ provides recommendations based on deadlines, importance, consequences and context.
        </p>
        <p className="text-[11px] text-slate-400">
          You always have the final say. Student decisions are never silently overwritten.
        </p>
      </div>

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
        availableTasksForDependency={priorityTasks}
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

      {/* Notice Detail Modal */}
      <NoticeModal
        notice={selectedNoticeForModal}
        onClose={() => setSelectedNoticeForModal(null)}
      />
    </div>
  );
}
