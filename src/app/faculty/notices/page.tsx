"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useFacultyData } from "@/lib/facultyStore";
import { Notice, NoticeCategory } from "@/types/institution";
import {
  Megaphone,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Paperclip,
  CheckCircle2,
  X,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Eye,
  Tag,
  Building2,
  Award,
  BookOpen,
} from "lucide-react";

export default function FacultyNoticesPage() {
  const { notices, currentFaculty, isHOD } = useFacultyData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [activeNoticeModal, setActiveNoticeModal] = useState<Notice | null>(null);

  const filterTabs = [
    "All",
    "Important",
    "From HOD",
    "From Institution",
    "From Faculty",
    "Academic",
    "Examination",
    "Assignment",
    "Department",
  ];

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      // Tab filter
      if (selectedFilter === "Important") {
        const isImp = n.priorityHint === "high" || n.category === "Examination" || n.category === "Academic";
        if (!isImp) return false;
      } else if (selectedFilter === "From HOD") {
        if (n.source !== "HOD" && !n.createdBy?.toLowerCase().includes("ananya") && !n.authorRole?.toLowerCase().includes("hod")) {
          return false;
        }
      } else if (selectedFilter === "From Institution") {
        if (n.source === "FACULTY" || n.source === "HOD") return false;
      } else if (selectedFilter === "From Faculty") {
        if (n.source !== "FACULTY" && !n.authorRole?.toLowerCase().includes("professor")) return false;
      } else if (selectedFilter === "Academic") {
        if (n.category !== "Academic") return false;
      } else if (selectedFilter === "Examination") {
        if (n.category !== "Examination") return false;
      } else if (selectedFilter === "Assignment") {
        if (n.category !== "Assignment") return false;
      } else if (selectedFilter === "Department") {
        const isDept = n.targetDepartment === "CSE" || n.targetGroup?.includes("CSE");
        if (!isDept) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchContent = n.content.toLowerCase().includes(q);
        const matchCategory = n.category.toLowerCase().includes(q);
        const matchTarget = n.targetGroup.toLowerCase().includes(q);
        const matchAuthor = (n.authorName || n.createdBy || "").toLowerCase().includes(q);
        return matchTitle || matchContent || matchCategory || matchTarget || matchAuthor;
      }

      return true;
    });
  }, [notices, selectedFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Faculty Notice Inbox
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Institutional announcements, departmental circulars, academic notices, and HOD notifications.
          </p>
        </div>

        <Link
          href="/faculty/notices/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Notice</span>
        </Link>
      </div>

      {/* Controls: Search and Filter Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circulars by keyword, sender, or audience..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <span className="text-xs text-slate-400 font-semibold">
            Showing {filteredNotices.length} circulars
          </span>
        </div>

        {/* Scrollable Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedFilter === tab
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      {filteredNotices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotices.map((notice) => {
            const isFromHOD =
              notice.source === "HOD" ||
              notice.createdBy?.toLowerCase().includes("ananya") ||
              notice.authorRole?.toLowerCase().includes("hod");
            const isFromFaculty =
              notice.source === "FACULTY" ||
              notice.authorRole?.toLowerCase().includes("professor");

            return (
              <div
                key={notice.id}
                onClick={() => setActiveNoticeModal(notice)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Category & Source Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                      {notice.category}
                    </span>

                    {isFromHOD ? (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>HOD Circular</span>
                      </span>
                    ) : isFromFaculty ? (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Faculty Notice</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400">
                        {notice.publicationDate || notice.date}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {notice.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mt-2 leading-relaxed">
                    {notice.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="truncate">
                      <strong>Target:</strong> {notice.targetGroup}
                    </span>
                    {notice.attachmentName && (
                      <span className="flex items-center gap-1 text-indigo-500 font-semibold shrink-0">
                        <Paperclip className="w-3 h-3" />
                        <span>Doc</span>
                      </span>
                    )}
                  </div>
                  {notice.deadline && (
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>Deadline: {notice.deadline}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No notices available
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            No campus notices match your active filter or search query.
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          NOTICE DETAIL MODAL
      ───────────────────────────────────────────────────────────── */}
      {activeNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setActiveNoticeModal(null)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {activeNoticeModal.category}
                  </span>
                  {activeNoticeModal.source && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      Source: {activeNoticeModal.source}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {activeNoticeModal.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveNoticeModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Target Audience
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {activeNoticeModal.targetGroup}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Publication Date
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {activeNoticeModal.publicationDate || activeNoticeModal.date}
                </span>
              </div>
              {activeNoticeModal.deadline && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Action Deadline
                  </span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {activeNoticeModal.deadline}
                  </span>
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="py-2 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {activeNoticeModal.content}
            </div>

            {/* Extracted Tasks (if any) */}
            {activeNoticeModal.aiTasks && activeNoticeModal.aiTasks.length > 0 && (
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>NoticeIQ Extracted Student Action Tasks</span>
                </div>
                <div className="space-y-1.5">
                  {activeNoticeModal.aiTasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {t.title}
                      </span>
                      {t.deadline && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Due: {t.deadline}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveNoticeModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
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
