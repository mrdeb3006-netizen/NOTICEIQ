"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Zap,
  Check,
  ArrowRight,
  Sparkles,
  Lock,
  User,
  Megaphone,
  Edit3,
  Trash2,
  ExternalLink,
  Play,
  RotateCcw,
} from "lucide-react";
import { PriorityTask, TaskStatus } from "@/types/student";
import { PriorityBadge } from "./PriorityBadge";
import { QUADRANT_CONFIG } from "@/lib/priorityEngine";

interface TaskCardProps {
  task: PriorityTask;
  onToggleComplete?: (taskId: string) => void;
  onViewNotice?: (noticeId: string) => void;
  onEdit?: (task: PriorityTask) => void;
  onDelete?: (task: PriorityTask) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onResetOverride?: (taskId: string) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onViewNotice,
  onEdit,
  onDelete,
  onStatusChange,
  onResetOverride,
  compact = false,
}) => {
  const [showReasons, setShowReasons] = useState(false);
  const isCompleted = task.status === "COMPLETED";
  const isInProgress = task.status === "IN_PROGRESS";
  const config = QUADRANT_CONFIG[task.finalQuadrant || task.quadrant] || QUADRANT_CONFIG.Q4;

  const isBlocked = task.dependencies?.isBlocked;
  const isPrereq = task.dependencies?.isPrerequisiteForOthers;
  const prereqDone = task.dependencies?.prerequisiteCompleted;
  const isPersonal = task.taskType === "PERSONAL";
  const hasOverride = !!task.studentQuadrantOverride && task.studentQuadrantOverride !== task.aiQuadrant;

  return (
    <div
      className={`rounded-3xl border transition-all text-left group relative ${
        isCompleted
          ? "bg-slate-50 border-slate-200 opacity-70"
          : isBlocked
          ? "bg-amber-50/30 border-amber-200/90 shadow-xs hover:border-amber-300"
          : `${config.bgColor}/30 ${config.borderColor} shadow-xs hover:shadow-md hover:border-indigo-300`
      } ${compact ? "p-4 space-y-3" : "p-5 space-y-4"}`}
    >
      {/* Top Header: Badge, Source Tag & Override Indicator */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Active Quadrant Badge */}
          <PriorityBadge quadrant={task.finalQuadrant || task.quadrant} size={compact ? "sm" : "md"} />

          {/* Source Distinction Badge */}
          {isPersonal ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
              <User className="w-3 h-3 text-purple-600" />
              <span>👤 Personal Task</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
              <Megaphone className="w-3 h-3 text-indigo-600" />
              <span>📢 From Notice</span>
            </span>
          )}

          {/* Override Indicator (AI -> Student) */}
          {hasOverride && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              <span>AI: {task.aiQuadrant}</span>
              <ArrowRight className="w-2.5 h-2.5 text-amber-700" />
              <span className="text-rose-700">You: {task.studentQuadrantOverride}</span>
            </span>
          )}

          {/* Notice Category if AI generated */}
          {task.noticeCategory && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
              {task.noticeCategory}
            </span>
          )}

          {/* Status Badge */}
          {isInProgress && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>IN PROGRESS</span>
            </span>
          )}

          {isBlocked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              <span>BLOCKED</span>
            </span>
          )}

          {isPrereq && !isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-200">
              <Zap className="w-3 h-3 text-indigo-700" />
              <span>PREREQUISITE</span>
            </span>
          )}

          {task.privateNote && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
              title={task.privateNote}
            >
              <Lock className="w-2.5 h-2.5 text-indigo-600" />
              <span>Note</span>
            </span>
          )}
        </div>

        {/* Action Controls: Edit, Remove, & Priority Score */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all text-xs"
              title="Edit task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all text-xs"
              title={isPersonal ? "Delete personal task" : "Remove from My Actions"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Score:</span>
            <span className="text-xs font-black text-slate-900 font-mono">
              {task.finalPriorityScore ?? task.priorityScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Main Title & Action Row */}
      <div className="flex items-start gap-3 justify-between">
        <div className="space-y-1.5 min-w-0 flex-1">
          <Link
            href={`/student/actions/${task.id}`}
            className={`font-bold text-slate-900 leading-snug tracking-tight hover:text-indigo-600 transition-colors block ${
              compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
            } ${isCompleted ? "line-through text-slate-500" : ""}`}
          >
            {task.title}
          </Link>

          {task.description && !compact && (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Private Note Snippet */}
          {task.privateNote && !compact && (
            <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium leading-relaxed italic">
                "{task.privateNote}"
              </p>
            </div>
          )}
        </div>

        {/* Complete & Status Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isCompleted && onStatusChange && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, isInProgress ? "TODO" : "IN_PROGRESS")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs ${
                isInProgress
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-white text-slate-600 border border-slate-300 hover:border-blue-600 hover:text-blue-600"
              }`}
              title={isInProgress ? "Pause / Move to Todo" : "Start working on this"}
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">{isInProgress ? "In Progress" : "Start"}</span>
            </button>
          )}

          {onToggleComplete && (
            <button
              type="button"
              onClick={() => onToggleComplete(task.id)}
              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                isCompleted
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-white text-slate-700 border border-slate-300 hover:border-emerald-600 hover:text-emerald-600"
              }`}
              title={isCompleted ? "Mark incomplete" : "Mark completed"}
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isCompleted ? "Done" : "Complete"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dependency Warning Banners */}
      {isBlocked && task.dependencies?.blockedByTaskTitle && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>⚠ Blocked by: "{task.dependencies.blockedByTaskTitle}"</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed pl-5">
            This prerequisite must be completed first before executing this action.
          </p>
        </div>
      )}

      {prereqDone && task.dependencies?.blockedByTaskTitle && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-[11px] font-semibold">
            ✓ Prerequisite completed: "{task.dependencies.blockedByTaskTitle}"
          </span>
        </div>
      )}

      {isPrereq && !isCompleted && task.dependencies?.blocksTaskTitles && (
        <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-[11px] font-semibold">
            ⚡ Prerequisite: Must be completed before{" "}
            {task.dependencies.blocksTaskTitles.map((t) => `"${t}"`).join(", ")}
          </span>
        </div>
      )}

      {/* AI Context Suggestion Banner if present */}
      {task.aiContextSuggestion && !task.aiContextSuggestion.applied && (
        <div className="p-3 rounded-2xl bg-violet-50 border border-violet-200 text-violet-950 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-violet-900">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
            <span>🤖 NoticeIQ Suggestion</span>
          </div>
          <p className="text-[11px] text-violet-800 leading-relaxed">
            "{task.aiContextSuggestion.suggestion}"
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/student/actions/${task.id}`}
              className="text-[11px] font-bold text-violet-700 hover:underline flex items-center gap-1"
            >
              <span>Review in Task Details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Meta Footer: Source Notice & Deadline Countdown */}
      <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        {/* Source Notice or Personal Badge */}
        <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
          {isPersonal ? (
            <span className="text-[11px] font-medium text-purple-700 flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>Created directly by you</span>
            </span>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-medium truncate">
                Source:{" "}
                {onViewNotice && task.noticeId ? (
                  <button
                    type="button"
                    onClick={() => onViewNotice(task.noticeId!)}
                    className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline"
                  >
                    {task.noticeTitle}
                  </button>
                ) : (
                  <span className="text-slate-700 font-semibold">{task.noticeTitle}</span>
                )}
              </span>
            </>
          )}
        </div>

        {/* Deadline Status & Details Link */}
        <div className="flex items-center gap-2 shrink-0">
          {task.deadline ? (
            <span
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${
                task.urgencyScore >= 95
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : task.urgencyScore >= 80
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{task.deadline}</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">No deadline</span>
          )}

          {task.estimatedMinutes && (
            <span className="text-[10px] font-semibold text-slate-400">
              ~{task.estimatedMinutes}m
            </span>
          )}

          <Link
            href={`/student/actions/${task.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
            title="Open task details"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Explainable "Why this priority?" Section */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowReasons(!showReasons)}
          className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <span>Why {task.finalQuadrant || task.quadrant}?</span>
          {showReasons ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showReasons && (
          <div className="mt-2.5 p-4 rounded-2xl bg-white border border-slate-200/90 text-xs space-y-2.5 shadow-sm animate-in fade-in duration-200">
            {/* Transparency breakdown: AI vs Student */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-500">AI Recommendation: </span>
                <strong className="text-slate-900">{task.aiQuadrant}</strong>
              </div>
              <div>
                <span className="text-slate-500">Your Decision: </span>
                <strong className={hasOverride ? "text-rose-600" : "text-slate-900"}>
                  {task.studentQuadrantOverride || task.aiQuadrant}
                </strong>
              </div>
              {hasOverride && onResetOverride && (
                <button
                  type="button"
                  onClick={() => onResetOverride(task.id)}
                  className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset to AI</span>
                </button>
              )}
            </div>

            {hasOverride && (
              <p className="text-[11px] text-amber-900 font-semibold">
                • You manually moved this task from {task.aiQuadrant} to {task.studentQuadrantOverride}. Your decision takes precedence.
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-medium text-slate-600 py-1">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Urgency (35%)</span>
                <span className="font-bold text-slate-800 text-xs">{task.aiUrgencyScore ?? task.urgencyScore}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Importance (30%)</span>
                <span className="font-bold text-slate-800 text-xs">{task.aiImportanceScore ?? task.importanceScore}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Consequence (20%)</span>
                <span className="font-bold text-slate-800 text-xs">{task.aiConsequenceScore ?? task.consequenceScore}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Relevance (15%)</span>
                <span className="font-bold text-slate-800 text-xs">{task.aiRelevanceScore ?? task.relevanceScore}</span>
              </div>
            </div>

            <ul className="space-y-1 text-[11px] text-slate-600 pt-1">
              {(task.aiPriorityReasons || task.priorityReasons || []).map((reason, rIdx) => (
                <li key={rIdx} className="flex items-start gap-1.5">
                  <span className="text-slate-400 leading-tight">•</span>
                  <span className="leading-snug">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
