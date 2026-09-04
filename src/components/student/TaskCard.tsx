"use client";

import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Zap,
  Check,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PriorityTask } from "@/types/student";
import { PriorityBadge } from "./PriorityBadge";
import { QUADRANT_CONFIG } from "@/lib/priorityEngine";

interface TaskCardProps {
  task: PriorityTask;
  onToggleComplete?: (taskId: string) => void;
  onViewNotice?: (noticeId: string) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onViewNotice,
  compact = false,
}) => {
  const [showReasons, setShowReasons] = useState(false);
  const isCompleted = task.status === "COMPLETED";
  const config = QUADRANT_CONFIG[task.quadrant] || QUADRANT_CONFIG.Q4;

  const isBlocked = task.dependencies?.isBlocked;
  const isPrereq = task.dependencies?.isPrerequisiteForOthers;
  const prereqDone = task.dependencies?.prerequisiteCompleted;

  return (
    <div
      className={`rounded-2xl border transition-all text-left group relative ${
        isCompleted
          ? "bg-slate-50 border-slate-200/90 opacity-65"
          : isBlocked
          ? "bg-amber-50/30 border-amber-200/80 shadow-xs hover:border-amber-300"
          : `${config.bgColor}/30 ${config.borderColor} shadow-xs hover:shadow-md hover:border-indigo-300`
      } ${compact ? "p-4 space-y-2.5" : "p-5 space-y-4"}`}
    >
      {/* Top Header: Badge, Category & Priority Score */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge quadrant={task.quadrant} size={compact ? "sm" : "md"} />
          
          {task.noticeCategory && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
              {task.noticeCategory}
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
        </div>

        {/* Priority Score Meter */}
        <div className="flex items-center gap-1.5 shrink-0 bg-white px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Score:</span>
          <span className="text-xs font-black text-slate-900 font-mono">
            {task.priorityScore}/100
          </span>
        </div>
      </div>

      {/* Main Title & Action Row */}
      <div className="flex items-start gap-3 justify-between">
        <div className="space-y-1 min-w-0 flex-1">
          <h4
            className={`font-bold text-slate-900 leading-snug tracking-tight ${
              compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
            } ${isCompleted ? "line-through text-slate-500" : ""}`}
          >
            {task.title}
          </h4>

          {task.description && !compact && (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Complete Checkbox Button */}
        {onToggleComplete && (
          <button
            type="button"
            onClick={() => onToggleComplete(task.id)}
            className={`shrink-0 p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              isCompleted
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                : "bg-white text-slate-700 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600"
            }`}
            title={isCompleted ? "Mark incomplete" : "Mark completed"}
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isCompleted ? "Done" : "Complete"}</span>
          </button>
        )}
      </div>

      {/* Dependency Warning Banners */}
      {isBlocked && task.dependencies?.blockedByTaskTitle && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>⚠ Blocked by: "{task.dependencies.blockedByTaskTitle}"</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed pl-5">
            This task is required before completing this action. Complete the prerequisite first to proceed.
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

      {/* Meta Footer: Source Notice & Deadline Countdown */}
      <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        {/* Source Notice Link */}
        <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] font-medium truncate">
            Source:{" "}
            {onViewNotice ? (
              <button
                type="button"
                onClick={() => onViewNotice(task.noticeId)}
                className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline"
              >
                {task.noticeTitle}
              </button>
            ) : (
              <span className="text-slate-700 font-semibold">{task.noticeTitle}</span>
            )}
          </span>
        </div>

        {/* Deadline Status */}
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
        </div>
      </div>

      {/* Recommended Action Pill */}
      {task.recommendedAction && !compact && (
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center gap-2 text-xs text-slate-700 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-[11px]">
            <strong className="text-slate-900">Next Action:</strong> {task.recommendedAction}
          </span>
        </div>
      )}

      {/* Explainable "Why this priority?" Section */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowReasons(!showReasons)}
          className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <span>Why {task.quadrant}?</span>
          {showReasons ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showReasons && (
          <div className="mt-2.5 p-3.5 rounded-xl bg-white border border-slate-200/90 text-xs space-y-2 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 border-b border-slate-100 pb-1.5">
              <span>Priority Breakdown</span>
              <span className="font-mono text-indigo-600">{task.priorityScore}/100</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-medium text-slate-600 py-1">
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Urgency (35%)</span>
                <span className="font-bold text-slate-800 text-xs">{task.urgencyScore}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Importance (30%)</span>
                <span className="font-bold text-slate-800 text-xs">{task.importanceScore}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Consequence (20%)</span>
                <span className="font-bold text-slate-800 text-xs">{task.consequenceScore}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Relevance (15%)</span>
                <span className="font-bold text-slate-800 text-xs">{task.relevanceScore}</span>
              </div>
            </div>

            <ul className="space-y-1 text-[11px] text-slate-600 pt-1">
              {task.priorityReasons.map((reason, rIdx) => (
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
