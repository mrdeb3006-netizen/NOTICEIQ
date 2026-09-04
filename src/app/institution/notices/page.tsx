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
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";

export default function NoticesListPage() {
  const { notices } = useInstitutionData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.targetGroup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Published Notices
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
              {notices.length} Circulars
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official institutional circulars, scholarship updates, and examination schedules.
          </p>
        </div>

        <Link
          href="/institution/notices/create"
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Notice</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search circulars by title or target group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-xs"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs outline-none focus:border-indigo-500 transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Notices List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map((notice) => (
            <div
              key={notice.id}
              className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">
                    {notice.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {notice.status}
                  </span>
                  {notice.category && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                      {notice.category}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  {notice.content}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                  <span>Target: <strong className="text-slate-800">{notice.targetGroup}</strong></span>
                  <span>•</span>
                  <span>Audience: <strong className="text-slate-800">{notice.recipientsCount.toLocaleString()} students</strong></span>
                  <span>•</span>
                  <span>Date: {notice.date}</span>
                  {notice.deadline && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Deadline: {notice.deadline}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/institution/notices/create"
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit</span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Megaphone className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No circulars match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
