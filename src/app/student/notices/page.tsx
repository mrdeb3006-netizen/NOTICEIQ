"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Clock,
  Calendar,
  Building,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  X,
  Filter,
  Download,
  Megaphone,
  BookOpen,
} from "lucide-react";
import { useStudentAuth } from "@/lib/studentStore";
import { Notice } from "@/types/institution";

export default function StudentNoticesPage() {
  const { currentStudent, getStudentNotices, markNoticeAsRead } = useStudentAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedNotice, setSelectedNotice] = useState<(Notice & { isRead: boolean }) | null>(null);

  const matchedNotices = getStudentNotices();

  const filteredNotices = matchedNotices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenNotice = (notice: Notice & { isRead: boolean }) => {
    setSelectedNotice(notice);
    markNoticeAsRead(notice.id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Campus Circulars Repository
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {matchedNotices.length} Notices
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search and view all official notices, circular attachments, and examination schedules published by{" "}
            <span className="font-semibold text-slate-800">
              {currentStudent?.institutionName || "your campus"}
            </span>
            .
          </p>
        </div>

        <Link
          href="/student/inbox"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <span>View Inbox Stream</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Search & Category Filter */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search circulars by keyword, document name, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="w-full sm:w-52">
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
            <option value="Assignment">Assignment</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Grid of Circular Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => handleOpenNotice(notice)}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between text-left space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {notice.category}
                  </span>

                  <span className="text-[11px] text-slate-400">
                    {notice.date || notice.publicationDate}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {notice.content}
                </p>
              </div>

              {/* Bottom metadata */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {notice.deadline ? (
                  <span className="flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-[11px]">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>{notice.deadline}</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    General Announcement
                  </span>
                )}

                <span className="text-indigo-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Read Notice</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No circulars match your filters</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or category selection.
            </p>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* NOTICE READER MODAL                                                   */}
      {/* ===================================================================== */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm">
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedNotice.category}
                </span>

                <span className="text-[11px] text-slate-400">
                  {selectedNotice.date || selectedNotice.publicationDate}
                </span>
              </div>

              <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                {selectedNotice.title}
              </h2>

              {selectedNotice.deadline && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Action Deadline</span>
                  </div>
                  <span className="font-bold text-amber-950">
                    {selectedNotice.deadline}
                  </span>
                </div>
              )}

              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {selectedNotice.content}
              </div>

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
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Target: {selectedNotice.targetGroup}
              </span>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
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
