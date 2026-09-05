"use client";

import React from "react";
import {
  X,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Building,
  Download,
  ListTodo,
} from "lucide-react";
import { NoticeWithRelevance, useStudentAuth } from "@/lib/studentStore";

interface NoticeModalProps {
  notice: NoticeWithRelevance | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ notice, isOpen = true, onClose }) => {
  const { completedTaskIds, toggleTaskComplete } = useStudentAuth();

  if (!isOpen || !notice) return null;

  const isRelevant =
    notice.relevance.relevance === "HIGH" || notice.relevance.relevance === "MEDIUM";

  const extractedActions: string[] =
    notice.aiAnalysis?.tasks?.map((t) => t.title) ||
    notice.aiAnalysis?.requirements ||
    [];

  const noticeIssuer =
    notice.authorName || notice.authorRole || notice.targetGroup || "Official Institution Notice";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm shadow-xs">
              🏛️
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 truncate">
                {noticeIssuer}
              </h3>
              <span className="text-[10px] text-slate-400">
                Notice details & student actions
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Simple Clean Relevance Badge */}
          {isRelevant && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {notice.relevance.relevance === "HIGH"
                  ? "Relevant to you"
                  : "Possibly relevant"}
              </span>
            </div>
          )}

          {/* Title & Issuer / Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-slate-500">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {notice.category}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Calendar className="w-3 h-3 text-slate-400" />
                Published: {notice.date || notice.publicationDate}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {notice.title}
            </h2>
          </div>

          {/* Action Deadline Banner if present */}
          {notice.deadline && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Official Deadline</span>
              </div>
              <span className="font-extrabold text-amber-950">
                {notice.deadline}
              </span>
            </div>
          )}

          {/* ORIGINAL NOTICE SECTION */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Original Notice
            </span>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-200/70 font-sans">
              {notice.content}
            </div>
          </div>

          {/* AI ACTIONS INSIDE A NOTICE */}
          {extractedActions.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">
                  NoticeIQ found actions for you
                </span>
              </div>

              <div className="space-y-2">
                {extractedActions.map((action: string, idx: number) => {
                  const taskId = `${notice.id}-action-${idx}`;
                  const completed = completedTaskIds.includes(taskId);

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleTaskComplete(taskId)}
                      className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                        completed
                          ? "bg-slate-50/80 border-slate-200/60 opacity-60"
                          : "bg-white border-slate-200/80 hover:border-indigo-200 shadow-xs"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none"
                      />
                      <span
                        className={`text-xs font-medium text-slate-800 ${
                          completed ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {action}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attachment */}
          {notice.attachmentName && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900 truncate">
                  {notice.attachmentName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => alert(`Downloading: ${notice.attachmentName}`)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View Document</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Target Audience: {notice.targetGroup || "All Students"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

