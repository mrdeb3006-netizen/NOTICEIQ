"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Sparkles,
  Zap,
  Check,
  Megaphone,
  User,
  Edit3,
  Trash2,
  RotateCcw,
  Tag,
  ShieldCheck,
  Play,
  Share2,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";
import {
  PriorityTask,
  TaskQuadrant,
  TaskStatus,
  StudentImportance,
  TaskContextSuggestion,
} from "@/types/student";
import { PriorityBadge } from "@/components/student/PriorityBadge";
import { NoticeModal } from "@/components/student/NoticeModal";
import { AddTaskModal } from "@/components/student/AddTaskModal";
import { QUADRANT_CONFIG } from "@/lib/priorityEngine";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const {
    currentStudent,
    getStudentPriorityTasks,
    getStudentNoticesWithRelevance,
    updateTask,
    deletePersonalTask,
    removeAiTask,
    setTaskQuadrantOverride,
    resetTaskQuadrantOverride,
    setTaskImportanceOverride,
    updateTaskPrivateNote,
    applyAiContextSuggestion,
    setTaskStatus,
    toggleTaskComplete,
  } = useStudentAuth();

  const allTasks = getStudentPriorityTasks();
  const allNotices = getStudentNoticesWithRelevance();

  const task = allTasks.find((t) => t.id === taskId);

  // Local state for private note editing
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [useNoteForAI, setUseNoteForAI] = useState(true);

  // Local state for AI suggestion loading
  const [isAnalyzingContext, setIsAnalyzingContext] = useState(false);
  const [contextAnalysisResult, setContextAnalysisResult] =
    useState<TaskContextSuggestion | null>(null);

  // Edit task modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Notice preview modal
  const [selectedNoticeForModal, setSelectedNoticeForModal] = useState<any>(null);

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setNoteContent(task.privateNote || "");
      setUseNoteForAI(task.useNoteForAI !== undefined ? task.useNoteForAI : true);
      if (task.aiContextSuggestion && !task.aiContextSuggestion.applied) {
        setContextAnalysisResult(task.aiContextSuggestion);
      }
    }
  }, [task?.id, task?.privateNote, task?.useNoteForAI, task?.aiContextSuggestion]);

  if (!task) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Task Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          This task may have been removed or completed.
        </p>
        <Link
          href="/student/actions"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Actions</span>
        </Link>
      </div>
    );
  }

  const isPersonal = task.taskType === "PERSONAL";
  const isCompleted = task.status === "COMPLETED";
  const isInProgress = task.status === "IN_PROGRESS";
  const hasOverride =
    !!task.studentQuadrantOverride && task.studentQuadrantOverride !== task.aiQuadrant;

  const sourceNotice = task.noticeId
    ? allNotices.find((n) => n.id === task.noticeId)
    : null;

  // Handle Saving Private Note
  const handleSaveNote = async () => {
    updateTaskPrivateNote(task.id, noteContent.trim(), useNoteForAI);
    setIsEditingNote(false);

    // If useNoteForAI is true and note is non-empty, trigger intelligent context analysis
    if (useNoteForAI && noteContent.trim().length > 3) {
      setIsAnalyzingContext(true);
      try {
        const res = await fetch("/api/analyze-task-context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: {
              title: task.title,
              description: task.description,
              quadrant: task.finalQuadrant,
              deadline: task.deadline,
            },
            privateNote: noteContent.trim(),
            studentContext: {
              department: currentStudent?.department,
              year: currentStudent?.year,
              preferredStartTime: currentStudent?.preferredStartTime,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const suggestionObj: TaskContextSuggestion = {
            suggestion: data.suggestion,
            reason: data.reason,
            suggestedQuadrant: data.suggestedQuadrant || undefined,
            confidence: data.confidence,
            applied: false,
            createdAt: new Date().toISOString(),
          };
          setContextAnalysisResult(suggestionObj);
          updateTask(task.id, { aiContextSuggestion: suggestionObj });
        }
      } catch (err) {
        console.error("Context analysis failed", err);
      } finally {
        setIsAnalyzingContext(false);
      }
    }
  };

  // Handle Apply AI Context Suggestion
  const handleApplySuggestion = () => {
    if (contextAnalysisResult) {
      applyAiContextSuggestion(task.id, contextAnalysisResult);
      setContextAnalysisResult(null);
    }
  };

  // Handle Ignore AI Context Suggestion
  const handleIgnoreSuggestion = () => {
    setContextAnalysisResult(null);
    updateTask(task.id, {
      aiContextSuggestion: {
        ...(task.aiContextSuggestion || contextAnalysisResult!),
        applied: true,
      },
    });
  };

  // Handle Deletion / Removal
  const handleDeleteTask = () => {
    if (isPersonal) {
      deletePersonalTask(task.id);
    } else {
      removeAiTask(task.id);
    }
    router.push("/student/actions");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 text-left">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/actions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Actions</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Edit Task</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-rose-600 text-xs font-bold hover:bg-rose-50 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isPersonal ? "Delete" : "Remove"}</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. TOP HEADER SECTION                                                 */}
      {/* ===================================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge quadrant={task.finalQuadrant || task.quadrant} size="lg" />

            {isPersonal ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>👤 Personal Task</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5" />
                <span>📢 From Notice</span>
              </span>
            )}

            {task.noticeCategory && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {task.noticeCategory}
              </span>
            )}

            {isInProgress && (
              <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" />
                <span>IN PROGRESS</span>
              </span>
            )}

            {isCompleted && (
              <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>COMPLETED</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted && (
              <button
                type="button"
                onClick={() =>
                  setTaskStatus(task.id, isInProgress ? "TODO" : "IN_PROGRESS")
                }
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                  isInProgress
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-slate-700 border border-slate-300 hover:border-blue-600"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isInProgress ? "In Progress" : "Start Task"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => toggleTaskComplete(task.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isCompleted
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-slate-900 text-white hover:bg-indigo-600"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isCompleted ? "✓ Completed" : "Mark Complete"}</span>
            </button>
          </div>
        </div>

        <div>
          <h1
            className={`text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug ${
              isCompleted ? "line-through text-slate-500" : ""
            }`}
          >
            {task.title}
          </h1>
          {task.description && (
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Deadline
            </span>
            <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{task.deadline || "No deadline"}</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Estimated Time
            </span>
            <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{task.estimatedMinutes || 30} minutes</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Importance
            </span>
            <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>{task.studentImportanceOverride || "MEDIUM"}</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Resolved Priority
            </span>
            <p className="font-bold text-indigo-700 font-mono mt-0.5">
              {task.finalPriorityScore ?? task.priorityScore}/100
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. AI RECOMMENDATION VS STUDENT PRIORITY OVERRIDE                    */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* AI Recommendation Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  AI RECOMMENDATION
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                Formula Score: {task.aiPriorityScore}/100
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <PriorityBadge quadrant={task.aiQuadrant} size="md" />
              <span className="text-xs text-slate-500 font-medium">
                {QUADRANT_CONFIG[task.aiQuadrant]?.actionTitle}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block">
                Why this recommendation?
              </span>
              <ul className="space-y-1 text-xs text-slate-600">
                {(task.aiPriorityReasons || task.priorityReasons || []).map(
                  (reason, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span>{reason}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {task.recommendedAction && (
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950">
              <strong className="text-indigo-900">Suggested Action: </strong>
              <span>{task.recommendedAction}</span>
            </div>
          )}
        </div>

        {/* Student Priority Control Card (Section 10-13) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">YOUR PRIORITY</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Student Decision Wins
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Select Quadrant Override:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(["Q1", "Q2", "Q3", "Q4"] as TaskQuadrant[]).map((q) => {
                  const isSelected = (task.studentQuadrantOverride || task.aiQuadrant) === q;
                  const isAiDefault = task.aiQuadrant === q;
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setTaskQuadrantOverride(task.id, q)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                        isSelected
                          ? q === "Q1"
                            ? "bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20 shadow-xs"
                            : q === "Q2"
                            ? "bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-500/20 shadow-xs"
                            : q === "Q3"
                            ? "bg-sky-50 text-sky-900 border-sky-300 ring-2 ring-sky-500/20 shadow-xs"
                            : "bg-slate-100 text-slate-800 border-slate-300 ring-2 ring-slate-500/20 shadow-xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{q === "Q1" ? "🔴" : q === "Q2" ? "🟡" : q === "Q3" ? "🔵" : "⚪"}</span>
                        <span>{q}</span>
                      </div>
                      {isAiDefault && (
                        <span className="text-[9px] font-medium text-slate-400">
                          (AI)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Override explanation & Reset button */}
            {hasOverride ? (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">
                    You chose {task.studentQuadrantOverride}
                  </span>
                  <button
                    type="button"
                    onClick={() => resetTaskQuadrantOverride(task.id)}
                    className="px-2 py-0.5 rounded-lg bg-white border border-amber-300 text-amber-800 text-[11px] font-bold hover:bg-amber-100 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to AI ({task.aiQuadrant})</span>
                  </button>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  You moved this task from {task.aiQuadrant} to {task.studentQuadrantOverride}. NoticeIQ preserves your decision.
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Currently using the AI recommendation ({task.aiQuadrant}). Tap any quadrant above if you wish to adjust it.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            🔒 NoticeIQ will never silently overwrite your manual priority choice.
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. PRIVATE NOTES & AI CONTEXT SECTION                                */}
      {/* ===================================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">PRIVATE NOTES & CONTEXT</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            🔒 Private to You
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Record personal reminders, document progress, or schedule constraints. These notes are completely private and never visible to administrators, faculty, or other students.
        </p>

        {isEditingNote ? (
          <div className="space-y-3">
            <textarea
              rows={3}
              placeholder="e.g. I already have Aadhaar and marksheet. Only income certificate is pending."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-indigo-50/30 border border-indigo-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium resize-none"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useNoteForAI}
                  onChange={(e) => setUseNoteForAI(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Use this note for intelligent NoticeIQ recommendations</span>
                </span>
              </label>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsEditingNote(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={isAnalyzingContext}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {isAnalyzingContext ? "Analyzing..." : "Save Note"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {task.privateNote ? (
              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-xs text-slate-800 space-y-2">
                <p className="leading-relaxed font-medium">"{task.privateNote}"</p>
                <div className="flex items-center justify-between pt-2 border-t border-indigo-100/60 text-[11px] text-slate-400">
                  <span>
                    {task.useNoteForAI
                      ? "✓ AI context analysis active"
                      : "✕ AI context analysis paused for this note"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingNote(true)}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Edit Note
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-500">No private note added yet.</p>
                <button
                  type="button"
                  onClick={() => setIsEditingNote(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-indigo-600 text-indigo-600 text-xs font-bold transition-all shadow-2xs"
                >
                  + Add Private Note
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI Context Suggestion Banner */}
        {contextAnalysisResult && !contextAnalysisResult.applied && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-violet-900">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>🤖 NoticeIQ Suggestion</span>
            </div>
            <p className="text-violet-950 font-semibold leading-relaxed">
              "{contextAnalysisResult.suggestion}"
            </p>
            <p className="text-[11px] text-violet-700 leading-relaxed">
              Reason: {contextAnalysisResult.reason}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleApplySuggestion}
                className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Apply Suggestion
              </button>
              <button
                type="button"
                onClick={handleIgnoreSuggestion}
                className="px-3 py-1.5 rounded-xl bg-white border border-violet-200 text-violet-700 text-xs font-bold hover:bg-violet-50 transition-colors"
              >
                Ignore
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 4. DEPENDENCIES SECTION                                               */}
      {/* ===================================================================== */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">DEPENDENCIES & PREREQUISITES</h3>
          </div>
        </div>

        {task.dependencies?.blockedByTaskTitle ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Prerequisite Required</span>
            </div>
            <p className="text-xs">
              This task depends on:{" "}
              <strong className="text-amber-950">"{task.dependencies.blockedByTaskTitle}"</strong>
            </p>
            <p className="text-[11px] text-amber-800">
              {task.dependencies.prerequisiteCompleted
                ? "✓ Prerequisite has already been completed."
                : "⚠ Must be completed first before executing this action."}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No blocking dependencies. This action can be completed independently.
          </p>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. SOURCE NOTICE SECTION (if AI generated)                            */}
      {/* ===================================================================== */}
      {!isPersonal && sourceNotice && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">SOURCE INSTITUTION NOTICE</h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNoticeForModal(sourceNotice)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              View Full Notice →
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <p className="font-bold text-slate-900">{sourceNotice.title}</p>
            <p className="text-slate-500 line-clamp-2">{sourceNotice.content}</p>
            <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400">
              <span>Category: {sourceNotice.category}</span>
              <span>•</span>
              <span>Deadline: {sourceNotice.deadline || "None"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Transparency Footnote */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          NoticeIQ provides recommendations based on deadlines, importance, consequences and context.
        </p>
        <p className="text-[11px] text-slate-400">
          You always have the final say. Student decisions are never silently overwritten.
        </p>
      </div>

      {/* Edit Task Modal */}
      <AddTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(data) => {
          updateTask(task.id, data);
        }}
        existingTask={task}
        availableTasksForDependency={allTasks}
      />

      {/* Delete / Remove Confirmation Modal */}
      {showDeleteConfirm && (
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
                  {isPersonal ? "Delete Personal Task?" : "Remove from My Actions?"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isPersonal
                    ? "This will permanently delete this task."
                    : "This removes this action from your checklist without modifying the institutional notice."}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium p-3 rounded-xl bg-slate-50 border border-slate-100">
              "{task.title}"
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                {isPersonal ? "Delete Task" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Original Notice Modal */}
      <NoticeModal
        notice={selectedNoticeForModal}
        onClose={() => setSelectedNoticeForModal(null)}
      />
    </div>
  );
}
