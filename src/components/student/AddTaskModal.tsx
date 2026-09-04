"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  Lock,
  Sparkles,
  Link as LinkIcon,
  Tag,
} from "lucide-react";
import { PriorityTask, StudentImportance } from "@/types/student";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description?: string;
    deadline?: string;
    estimatedMinutes?: number;
    studentImportanceOverride?: StudentImportance | null;
    privateNote?: string;
    useNoteForAI?: boolean;
    blockedByTaskId?: string;
    blockedByTaskTitle?: string;
  }) => void;
  existingTask?: PriorityTask | null;
  availableTasksForDependency?: PriorityTask[];
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingTask,
  availableTasksForDependency = [],
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [importance, setImportance] = useState<StudentImportance>("MEDIUM");
  const [privateNote, setPrivateNote] = useState("");
  const [useNoteForAI, setUseNoteForAI] = useState(true);
  const [blockedByTaskId, setBlockedByTaskId] = useState<string>("");
  const [error, setError] = useState("");

  const isEditing = !!existingTask;
  const isAiTask = existingTask?.taskType === "AI_GENERATED";

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || "");
      setDeadline(existingTask.deadline || "");
      setEstimatedMinutes(existingTask.estimatedMinutes || 30);
      setImportance(existingTask.studentImportanceOverride || "MEDIUM");
      setPrivateNote(existingTask.privateNote || "");
      setUseNoteForAI(existingTask.useNoteForAI !== undefined ? existingTask.useNoteForAI : true);
      setBlockedByTaskId(existingTask.dependencies?.blockedByTaskId || "");
    } else {
      setTitle("");
      setDescription("");
      setDeadline("");
      setEstimatedMinutes(30);
      setImportance("MEDIUM");
      setPrivateNote("");
      setUseNoteForAI(true);
      setBlockedByTaskId("");
    }
    setError("");
  }, [existingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    let blockedByTaskTitle: string | undefined;
    if (blockedByTaskId) {
      const depTask = availableTasksForDependency.find((t) => t.id === blockedByTaskId);
      blockedByTaskTitle = depTask ? depTask.title : undefined;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      deadline: deadline.trim() || undefined,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      studentImportanceOverride: importance,
      privateNote: privateNote.trim() || undefined,
      useNoteForAI,
      blockedByTaskId: blockedByTaskId || undefined,
      blockedByTaskTitle,
    });

    onClose();
  };

  // Filter out the current task from dependency dropdown to prevent cyclic dependency
  const filteredDependencyOptions = availableTasksForDependency.filter(
    (t) => !existingTask || t.id !== existingTask.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              {isEditing ? <FileText className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? (isAiTask ? "Edit Action Representation" : "Edit Personal Task") : "Add Personal Task"}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAiTask
                  ? "Changes will customize your action without modifying the original institution notice."
                  : "Personal tasks are prioritized using the exact same intelligence engine."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Buy folder for scholarship documents"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Provide additional details or checklists..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium resize-none"
            />
          </div>

          {/* Grid: Deadline & Estimated Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Deadline</span>
              </label>
              <input
                type="text"
                placeholder="e.g. September 6, 2026 or Tomorrow"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Estimated Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Estimated Time (Minutes)</span>
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium font-mono"
              />
            </div>
          </div>

          {/* Importance Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Importance Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["LOW", "MEDIUM", "HIGH"] as StudentImportance[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setImportance(level)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    importance === level
                      ? level === "HIGH"
                        ? "bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20"
                        : level === "MEDIUM"
                        ? "bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-500/20"
                        : "bg-slate-100 text-slate-800 border-slate-300 ring-2 ring-slate-500/20"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {level === "HIGH" ? "🔴 High" : level === "MEDIUM" ? "🟡 Medium" : "⚪ Low"}
                </button>
              ))}
            </div>
          </div>

          {/* Depends on (Dependencies) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Depends on (Prerequisite Task)</span>
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              value={blockedByTaskId}
              onChange={(e) => setBlockedByTaskId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
            >
              <option value="">-- None (No prerequisite required) --</option>
              {filteredDependencyOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.taskType === "PERSONAL" ? "Personal" : "Notice"})
                </option>
              ))}
            </select>
          </div>

          {/* Private Student Notes & AI Context */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Private Notes & Context</span>
              </label>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                🔒 Student-Only (Private)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Only you can see this note. Administrators and faculty cannot view it.
            </p>
            <textarea
              rows={2}
              placeholder="e.g. I already have Aadhaar and marksheet. Only income certificate is pending."
              value={privateNote}
              onChange={(e) => setPrivateNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-indigo-50/30 border border-indigo-100 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium resize-none"
            />

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={useNoteForAI}
                onChange={(e) => setUseNoteForAI(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Use this note for intelligent NoticeIQ recommendations</span>
              </span>
            </label>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              {isEditing ? <FileText className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isEditing ? "Save Changes" : "Add Task"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
