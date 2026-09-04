"use client";

import React from "react";
import {
  X,
  FileText,
  Clock,
  Sparkles,
  Check,
  AlertTriangle,
  FileCheck,
  Download,
} from "lucide-react";
import { NoticeWithRelevance } from "@/lib/studentStore";

interface NoticeModalProps {
  notice: NoticeWithRelevance | null;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ notice, onClose }) => {
  if (!notice) return null;

  const isRelevant =
    notice.relevance.relevance === "HIGH" || notice.relevance.relevance === "MEDIUM";

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
                Official Student Circular
              </h3>
              <span className="text-[10px] text-slate-400">
                Source Document Details
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
          {/* Relevance Banner */}
          <div
            className={`p-4 rounded-2xl border space-y-2 ${
              notice.relevance.relevance === "HIGH"
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : notice.relevance.relevance === "MEDIUM"
                ? "bg-amber-50/70 border-amber-200 text-amber-950"
                : "bg-slate-100 border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>
                  {notice.relevance.relevance === "HIGH" && "🟢 Highly Relevant to You"}
                  {notice.relevance.relevance === "MEDIUM" && "🟡 Possibly Relevant"}
                  {notice.relevance.relevance === "LOW" && "⚪ Low Relevance"}
                  {notice.relevance.relevance === "NOT_RELEVANT" && "⚪ Not Applicable to Your Cohort"}
                </span>
              </span>

              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200/80 text-slate-700">
                Match: {notice.relevance.score}/100
              </span>
            </div>

            {notice.relevance.reasons && notice.relevance.reasons.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-200/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                  {notice.relevance.reasons.slice(0, 4).map((r, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded-lg bg-white/80 border border-slate-200/60 flex items-start gap-1.5 font-medium text-[11px]"
                    >
                      <span className="shrink-0 mt-0.5">
                        {r.startsWith("✓") ? (
                          <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                        ) : r.startsWith("✕") ? (
                          <X className="w-3 h-3 text-rose-500 stroke-[2.5]" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-500 stroke-[2.5]" />
                        )}
                      </span>
                      <span className="leading-tight text-slate-800">
                        {r.replace(/^[✓✕⚠]\s*/, "")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {notice.category}
              </span>
              <span className="text-[11px] text-slate-400">
                Published: {notice.date || notice.publicationDate}
              </span>
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
              {notice.title}
            </h2>
          </div>

          {/* Action Deadline Banner */}
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

          {/* Original Content */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Official Notice Content
            </span>
            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200/70 font-sans">
              {notice.content}
            </div>
          </div>

          {/* Documents Required */}
          {notice.aiAnalysis?.documents_required &&
            notice.aiAnalysis.documents_required.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Required Documents</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {notice.aiAnalysis.documents_required.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2 text-slate-800 font-medium text-[11px]"
                    >
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Attachment */}
          {notice.attachmentName && (
            <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900 truncate">
                  {notice.attachmentName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => alert(`Downloading: ${notice.attachmentName}`)}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Target: {notice.targetGroup}
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
