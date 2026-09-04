"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
} from "lucide-react";
import { useStudentAuth, NoticeWithRelevance } from "@/lib/studentStore";
import { PriorityBadge } from "@/components/student/PriorityBadge";
import { NoticeModal } from "@/components/student/NoticeModal";

export default function StudentActionsPage() {
  const {
    currentStudent,
    getStudentPriorityTasks,
    getStudentNoticesWithRelevance,
    toggleTaskComplete,
  } = useStudentAuth();

  const [selectedNoticeForModal, setSelectedNoticeForModal] =
    useState<NoticeWithRelevance | null>(null);

  const priorityTasks = getStudentPriorityTasks();
  const allNotices = getStudentNoticesWithRelevance();

  const activeTasks = priorityTasks.filter((t) => t.status !== "COMPLETED");
  const completedTasks = priorityTasks.filter((t) => t.status === "COMPLETED");

  const handleOpenNotice = (noticeId: string) => {
    const found = allNotices.find((n) => n.id === noticeId);
    if (found) setSelectedNoticeForModal(found);
  };

  const isCollege =
    currentStudent?.institutionType === "college" ||
    !!currentStudent?.department ||
    !!currentStudent?.email;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-600/20">
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Personalized Action Plan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200">
              {priorityTasks.length} Actions Detected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Actionable tasks extracted and prioritized for{" "}
            <span className="font-bold text-slate-800">
              {currentStudent?.name}
            </span>{" "}
            (
            <span className="font-semibold text-indigo-600">
              {isCollege
                ? `${currentStudent?.department || "CSE"} • ${
                    currentStudent?.year || "1st Year"
                  } • Sec ${currentStudent?.section || "A"}`
                : `${currentStudent?.className || "Class 10"} • Sec ${
                    currentStudent?.section || "B"
                  }`}
            </span>
            ).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/student/priority"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Priority Matrix</span>
          </Link>
          <Link
            href="/student/inbox"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors"
          >
            <span>Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Summary Stat Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-tr from-violet-900 via-indigo-900 to-slate-950 text-white shadow-lg space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 block">
              NoticeIQ Action & Priority Engine
            </span>
            <h3 className="text-base font-bold text-white">
              {completedTasks.length} of {priorityTasks.length} Tasks Completed
            </h3>
            <p className="text-xs text-violet-200">
              Ranked dynamically by urgency, importance, and prerequisite dependencies.
            </p>
          </div>

          <div className="w-full sm:w-48 bg-white/10 rounded-full h-2.5 overflow-hidden">
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

      {/* Actions List */}
      <div className="space-y-3">
        {priorityTasks.length > 0 ? (
          priorityTasks.map((task) => {
            const isDone = task.status === "COMPLETED";
            const isBlocked = task.dependencies?.isBlocked;
            return (
              <div
                key={task.id}
                onClick={() => toggleTaskComplete(task.id)}
                className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-left group ${
                  isDone
                    ? "bg-slate-50 border-slate-200 opacity-60"
                    : isBlocked
                    ? "bg-amber-50/40 border-amber-200 shadow-xs"
                    : "bg-white border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task.id);
                    }}
                    className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : "border-2 border-slate-300 text-transparent hover:border-indigo-600"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <PriorityBadge quadrant={task.quadrant} size="sm" />
                      
                      {task.noticeCategory && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {task.noticeCategory}
                        </span>
                      )}

                      {isBlocked && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          <span>Prerequisite Required</span>
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 font-medium truncate max-w-xs">
                        From: {task.noticeTitle}
                      </span>
                    </div>

                    <p
                      className={`text-sm font-bold ${
                        isDone
                          ? "line-through text-slate-500"
                          : "text-slate-900 group-hover:text-indigo-600 transition-colors"
                      }`}
                    >
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {isBlocked && task.dependencies?.blockedByTaskTitle && (
                      <p className="text-[11px] text-amber-800 font-semibold pt-1">
                        ⚠ Blocked by: "{task.dependencies.blockedByTaskTitle}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Metadata */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {task.deadline && (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{task.deadline}</span>
                    </span>
                  )}
                  {task.estimatedMinutes && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      ~{task.estimatedMinutes} mins
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              No actions detected
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no actionable tasks extracted from notices applicable to your cohort.
            </p>
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      <NoticeModal
        notice={selectedNoticeForModal}
        onClose={() => setSelectedNoticeForModal(null)}
      />
    </div>
  );
}
