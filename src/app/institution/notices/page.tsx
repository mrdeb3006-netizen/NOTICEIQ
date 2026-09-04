"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  Eye,
  Edit2,
  Users,
  Sparkles,
  Archive,
  Calendar,
  AlertCircle,
  FileText,
  Filter,
  ArrowRight,
  MoreVertical,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";
import { NoticeCategory } from "@/types/institution";

export default function NoticesListPage() {
  const { notices, archiveNotice } = useInstitutionData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft" | "archived"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  // Filter Notices
  const filtered = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.targetGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || n.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" || n.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const publishedCount = notices.filter((n) => n.status === "published").length;
  const draftCount = notices.filter((n) => n.status === "draft").length;
  const archivedCount = notices.filter((n) => n.status === "archived").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Notices
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {notices.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish, schedule, and track official institutional circulars and student announcements.
          </p>
        </div>

        <Link
          href="/institution/notices/create"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Notice</span>
        </Link>
      </div>

      {/* Filter and Status Tab Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 border-b border-slate-100">
          {[
            { id: "all", label: "All Notices", count: notices.length },
            { id: "published", label: "Published", count: publishedCount },
            { id: "draft", label: "Drafts", count: draftCount },
            { id: "archived", label: "Archived", count: archivedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setStatusFilter(
                  tab.id as "all" | "published" | "draft" | "archived"
                )
              }
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                statusFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === tab.id
                    ? "bg-indigo-700 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notices by title, cohort group, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs outline-none focus:border-indigo-500 transition-all font-medium"
            >
              <option value="all">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Examination">Examination</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Event">Event</option>
              <option value="Assignment">Assignment</option>
              <option value="Administration">Administration</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notices List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map((notice) => {
            const isDraft = notice.status === "draft";
            const isArchived = notice.status === "archived";
            const isPublished = notice.status === "published";

            return (
              <div
                key={notice.id}
                className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-left group"
              >
                {/* Notice Core Info */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPublished
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isDraft
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {notice.status}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {notice.category || "General"}
                    </span>

                    {notice.priorityHint && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          notice.priorityHint === "high"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : notice.priorityHint === "medium"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {notice.priorityHint} Priority
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400">
                      {notice.date || notice.publicationDate}
                    </span>
                  </div>

                  <div>
                    <Link
                      href={`/institution/notices/${notice.id}`}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block group-hover:translate-x-0.5 transition-transform"
                    >
                      {notice.title}
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>

                  {/* Metadata Indicators: Target, Deadline & Recipients */}
                  <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Target: {notice.targetGroup}</span>
                    </span>

                    {notice.deadline && (
                      <span className="flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Deadline: {notice.deadline}</span>
                      </span>
                    )}

                    <span className="text-[11px] text-slate-600">
                      {notice.recipientsCount || notice.recipientCount || 0} Recipients
                    </span>

                    {notice.attachmentName && (
                      <span className="flex items-center gap-1 text-[11px] text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded-md">
                        <FileText className="w-3 h-3" />
                        <span>{notice.attachmentName}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
                  <Link
                    href={`/institution/notices/${notice.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>

                  {isDraft && (
                    <Link
                      href="/institution/notices/create"
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Continue Editing</span>
                    </Link>
                  )}

                  {!isArchived && (
                    <button
                      type="button"
                      onClick={() => archiveNotice(notice.id)}
                      title="Archive this notice"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Megaphone className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No notices found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search query or status filter, or create a new circular.
            </p>
            <Link
              href="/institution/notices/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Notice</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
