"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Search,
  Clock,
  Calendar,
  Building,
  FileText,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  X,
  Filter,
  Download,
  AlertCircle,
  Megaphone,
  Check,
  AlertTriangle,
  Zap,
  ListTodo,
  FileCheck,
  ShieldAlert,
  HelpCircle,
  Lock,
} from "lucide-react";
import { useStudentAuth, NoticeWithRelevance } from "@/lib/studentStore";

export default function StudentInboxPage() {
  const { currentStudent, getStudentNoticesWithRelevance, markNoticeAsRead } =
    useStudentAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"relevant" | "all" | "other">(
    "relevant"
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedNotice, setSelectedNotice] =
    useState<NoticeWithRelevance | null>(null);

  const allNotices = getStudentNoticesWithRelevance();

  // Filter based on tab, search term, and category
  const filteredNotices = allNotices.filter((n) => {
    // 1. Tab filtering
    if (activeTab === "relevant") {
      if (
        n.relevance.relevance === "NOT_RELEVANT" ||
        n.relevance.relevance === "LOW"
      ) {
        return false;
      }
    } else if (activeTab === "other") {
      if (
        n.relevance.relevance !== "NOT_RELEVANT" &&
        n.relevance.relevance !== "LOW"
      ) {
        return false;
      }
    }

    // 2. Search filtering
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.relevance.reasons || []).some((r) =>
        r.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // 3. Category filtering
    const matchesCategory =
      categoryFilter === "all" || n.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const relevantCount = allNotices.filter(
    (n) =>
      n.relevance.relevance === "HIGH" || n.relevance.relevance === "MEDIUM"
  ).length;

  const otherCount = allNotices.filter(
    (n) =>
      n.relevance.relevance === "NOT_RELEVANT" ||
      n.relevance.relevance === "LOW"
  ).length;

  const unreadRelevantCount = allNotices.filter(
    (n) =>
      !n.isRead &&
      (n.relevance.relevance === "HIGH" || n.relevance.relevance === "MEDIUM")
  ).length;

  const handleOpenNotice = (notice: NoticeWithRelevance) => {
    setSelectedNotice(notice);
    markNoticeAsRead(notice.id);
  };

  // Badge styler for relevance levels
  const getRelevanceBadge = (level: string, score: number) => {
    switch (level) {
      case "HIGH":
        return {
          label: `🟢 Relevant to you`,
          sublabel: `Matched ${score}%`,
          className:
            "bg-emerald-50 text-emerald-800 border-emerald-200/90 shadow-xs",
          dotColor: "bg-emerald-500",
        };
      case "MEDIUM":
        return {
          label: `🟡 Possibly Relevant`,
          sublabel: `Review Eligibility`,
          className: "bg-amber-50 text-amber-800 border-amber-200/90 shadow-xs",
          dotColor: "bg-amber-500",
        };
      case "LOW":
        return {
          label: `⚪ Low Relevance`,
          sublabel: `Partial match`,
          className: "bg-slate-100 text-slate-700 border-slate-200",
          dotColor: "bg-slate-400",
        };
      case "NOT_RELEVANT":
      default:
        return {
          label: `⚪ Not Relevant to you`,
          sublabel: `Different cohort`,
          className: "bg-slate-100 text-slate-600 border-slate-200",
          dotColor: "bg-slate-400",
        };
    }
  };

  const isCollege =
    currentStudent?.institutionType === "college" ||
    !!currentStudent?.department ||
    !!currentStudent?.email;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Personalized Notice Inbox
            </h1>
            {unreadRelevantCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {unreadRelevantCount} Unread
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                All Caught Up
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personalized relevance scoring tailored specifically for{" "}
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

        <Link
          href="/student/actions"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>My Actions</span>
        </Link>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="space-y-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("relevant")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "relevant"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <span>🟢 Relevant for You</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === "relevant"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {relevantCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("other")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "other"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <span>⚪ Other / Not Relevant</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === "other"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {otherCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "all"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <span>📋 All Published Notices</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {allNotices.length}
            </span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, criteria reasons, or contents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs outline-none focus:border-indigo-500 transition-all font-medium"
            >
              <option value="all">All Categories</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Academic">Academic</option>
              <option value="Examination">Examination</option>
              <option value="Event">Event</option>
              <option value="Administration">Administration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notices Stream */}
      <div className="space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const relBadge = getRelevanceBadge(
              notice.relevance.relevance,
              notice.relevance.score
            );
            const isRelevant =
              notice.relevance.relevance === "HIGH" ||
              notice.relevance.relevance === "MEDIUM";
            const isNotRelevant = notice.relevance.relevance === "NOT_RELEVANT";
            const taskCount = notice.relevance.personalizedTasks?.length || 0;

            return (
              <div
                key={notice.id}
                onClick={() => handleOpenNotice(notice)}
                className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                  isRelevant
                    ? !notice.isRead
                      ? "bg-white border-indigo-300 shadow-md shadow-indigo-600/5 hover:border-indigo-500"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                    : "bg-slate-50/70 border-slate-200/90 opacity-80 hover:opacity-100 hover:bg-white"
                }`}
              >
                {/* Left accent border */}
                {isRelevant && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-600 to-violet-600" />
                )}

                <div className="flex flex-col gap-4">
                  {/* Top Metadata Row: Relevance Badge + Target Info + Category */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Relevance Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 ${relBadge.className}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${relBadge.dotColor}`}
                        />
                        <span>{relBadge.label}</span>
                      </span>

                      {/* Category */}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        {notice.category}
                      </span>

                      {/* New Notice indicator */}
                      {!notice.isRead && isRelevant && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-medium text-slate-400">
                      {notice.date || notice.publicationDate}
                    </span>
                  </div>

                  {/* Title & Content Description */}
                  <div className="space-y-1.5">
                    <h3
                      className={`text-base font-bold transition-colors leading-snug ${
                        isRelevant
                          ? "text-slate-900 group-hover:text-indigo-600"
                          : "text-slate-700"
                      }`}
                    >
                      {notice.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>

                  {/* Reasons Preview Pill Box */}
                  {notice.relevance.reasons &&
                    notice.relevance.reasons.length > 0 && (
                      <div
                        className={`p-3 rounded-2xl text-xs space-y-1 border ${
                          isRelevant
                            ? "bg-slate-50 border-slate-100 text-slate-700"
                            : "bg-slate-100/80 border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Relevance Assessment:
                        </span>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                          {notice.relevance.reasons.slice(0, 3).map((r, idx) => (
                            <span
                              key={idx}
                              className={`font-medium ${
                                r.startsWith("✓")
                                  ? "text-emerald-700"
                                  : r.startsWith("✕")
                                  ? "text-rose-600"
                                  : "text-amber-700"
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Bottom Footer: Target Group + Tasks Detected + Action Button */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-3 text-slate-500 text-[11px] flex-wrap">
                      <span className="font-semibold text-slate-700">
                        Target: {notice.targetGroup}
                      </span>
                      {taskCount > 0 && isRelevant && (
                        <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-100 font-bold flex items-center gap-1">
                          <ListTodo className="w-3 h-3 text-violet-600" />
                          <span>{taskCount} Actions Detected</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {notice.deadline && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{notice.deadline}</span>
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold transition-all ${
                          isRelevant
                            ? "text-indigo-600 group-hover:translate-x-1"
                            : "text-slate-500"
                        }`}
                      >
                        <span>{isRelevant ? "View Notice" : "View Anyway"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              No circulars found in this tab
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === "relevant"
                ? "No notices currently published match your active department & year profile."
                : "No circulars matched the current search filters."}
            </p>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* NOTICE DETAIL & PERSONALIZATION MODAL                                 */}
      {/* ===================================================================== */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm shadow-xs">
                  {currentStudent?.type === "college" ? "🏛️" : "🏫"}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {currentStudent?.institutionName}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Official Student Circular
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Relevance Banner */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  selectedNotice.relevance.relevance === "HIGH"
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : selectedNotice.relevance.relevance === "MEDIUM"
                    ? "bg-amber-50/70 border-amber-200 text-amber-950"
                    : "bg-slate-100 border-slate-200 text-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>
                      {selectedNotice.relevance.relevance === "HIGH" &&
                        "🟢 Highly Relevant to You"}
                      {selectedNotice.relevance.relevance === "MEDIUM" &&
                        "🟡 Possibly Relevant — Review Eligibility"}
                      {selectedNotice.relevance.relevance === "LOW" &&
                        "⚪ Low Relevance"}
                      {selectedNotice.relevance.relevance === "NOT_RELEVANT" &&
                        "⚪ Notice Does Not Apply to Your Cohort"}
                    </span>
                  </span>

                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200/80 text-slate-700">
                    Match Score: {selectedNotice.relevance.score}/100
                  </span>
                </div>

                {/* Human-Readable Reasons Checklist */}
                <div className="space-y-1.5 pt-1 border-t border-slate-200/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Why this notice {selectedNotice.relevance.relevance === "NOT_RELEVANT" ? "does not apply" : "is relevant"} to you:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {selectedNotice.relevance.reasons.map((reason, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white/80 border border-slate-200/60 flex items-start gap-2 font-medium"
                      >
                        <span className="shrink-0 mt-0.5">
                          {reason.startsWith("✓") ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          ) : reason.startsWith("✕") ? (
                            <X className="w-3.5 h-3.5 text-rose-500 stroke-[2.5]" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                          )}
                        </span>
                        <span className="text-[11px] leading-tight text-slate-800">
                          {reason.replace(/^[✓✕⚠]\s*/, "")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {selectedNotice.category}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Published: {selectedNotice.date || selectedNotice.publicationDate}
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                  {selectedNotice.title}
                </h2>
              </div>

              {/* Action Deadline Banner if present */}
              {selectedNotice.deadline && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Action Deadline</span>
                  </div>
                  <span className="font-extrabold text-amber-950">
                    {selectedNotice.deadline}
                  </span>
                </div>
              )}

              {/* ============================================================= */}
              {/* PERSONALIZED ACTIONS (Only for relevant students)             */}
              {/* ============================================================= */}
              {selectedNotice.relevance.relevance !== "NOT_RELEVANT" ? (
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Your Personalized Action Checklist</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold">
                      Derived from NoticeIQ Engine
                    </span>
                  </div>

                  {selectedNotice.relevance.personalizedTasks &&
                  selectedNotice.relevance.personalizedTasks.length > 0 ? (
                    <div className="space-y-2">
                      {selectedNotice.relevance.personalizedTasks.map(
                        (task, idx) => (
                          <div
                            key={task.id || idx}
                            className="p-3 rounded-xl bg-white border border-indigo-100 shadow-xs flex items-start gap-3 justify-between"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="text-xs font-bold text-slate-900">
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {task.deadline && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                                Due: {task.deadline}
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No specific actions extracted for this circular.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <span className="font-bold block text-slate-800">
                    ℹ️ Notice Not Actionable For Your Cohort
                  </span>
                  <p>
                    Because this notice targets {selectedNotice.targetGroup}, no personal action items were generated in your student tasks.
                  </p>
                </div>
              )}

              {/* Required Documents Checklist */}
              {selectedNotice.aiAnalysis?.documents_required &&
                selectedNotice.aiAnalysis.documents_required.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Required Documents Checklist</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {selectedNotice.aiAnalysis.documents_required.map(
                        (doc, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-slate-800 font-medium"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{doc}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Original Announcement Text (Unmodified) */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Original Announcement Text (Official)
                </span>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200/70 font-sans">
                  {selectedNotice.content}
                </div>
              </div>

              {/* Attachment if present */}
              {selectedNotice.attachmentName && (
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {selectedNotice.attachmentName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      alert(`Downloading: ${selectedNotice.attachmentName}`)
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                Target: {selectedNotice.targetGroup}
              </span>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
