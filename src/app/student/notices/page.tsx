"use client";

import React, { useState } from "react";
import {
  FileText,
  Search,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useStudentAuth, NoticeWithRelevance } from "@/lib/studentStore";
import { NoticeModal } from "@/components/student/NoticeModal";

type FilterType = "all" | "unread" | "important" | "academic" | "administrative";

export default function StudentNoticesPage() {
  const { currentStudent, getStudentNoticesWithRelevance, markNoticeAsRead } =
    useStudentAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedNotice, setSelectedNotice] =
    useState<NoticeWithRelevance | null>(null);

  const allNotices = getStudentNoticesWithRelevance();

  const filteredNotices = allNotices.filter((n) => {
    // Search
    const sender = n.authorName || n.authorRole || n.targetGroup || "";
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Filters
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "important") {
      return (
        n.relevance.relevance === "HIGH" ||
        n.priorityHint === "high"
      );
    }
    if (activeFilter === "academic") {
      const cat = (n.category || "").toLowerCase();
      return cat.includes("academic") || cat.includes("exam") || cat.includes("course");
    }
    if (activeFilter === "administrative") {
      const cat = (n.category || "").toLowerCase();
      return (
        cat.includes("admin") ||
        cat.includes("welfare") ||
        cat.includes("scholarship") ||
        cat.includes("event")
      );
    }
    return true;
  });

  const handleOpenNotice = (notice: NoticeWithRelevance) => {
    setSelectedNotice(notice);
    markNoticeAsRead(notice.id);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-left">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Notices
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Official notices and circulars from {currentStudent?.institutionName || "your institution"}.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search notices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-indigo-500 transition-all shadow-xs"
        />
      </div>

      {/* Clean Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {(
          [
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "important", label: "Important" },
            { id: "academic", label: "Academic" },
            { id: "administrative", label: "Administrative" },
          ] as { id: FilterType; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors shrink-0 ${
              activeFilter === tab.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const isHighlyRelevant = notice.relevance.relevance === "HIGH";
            const isMediumRelevant = notice.relevance.relevance === "MEDIUM";

            return (
              <div
                key={notice.id}
                onClick={() => handleOpenNotice(notice)}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer space-y-2.5"
              >
                {/* Top row: Sender, Date, and Relevance Badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      {notice.authorName || notice.targetGroup || "Student Welfare Office"}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400">
                      {notice.date || notice.publicationDate}
                    </span>
                  </div>

                  {isHighlyRelevant && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Relevant to you
                    </span>
                  )}
                  {isMediumRelevant && !isHighlyRelevant && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                      Possibly relevant
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {notice.title}
                </h3>

                {/* Short preview */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                  {notice.content}
                </p>

                {/* Deadline if applicable */}
                {notice.deadline && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Deadline: {notice.deadline}</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-2xl bg-white border border-slate-200/80 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No notices found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or selecting a different filter.
            </p>
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <NoticeModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
        />
      )}
    </div>
  );
}

