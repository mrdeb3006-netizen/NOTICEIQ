"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Target,
  FileText,
  Download,
  Archive,
  Edit2,
  CheckCircle2,
  Building,
  Sparkles,
  Share2,
  AlertCircle,
  Megaphone,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";

export default function NoticeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { notices, institution, archiveNotice } = useInstitutionData();

  const notice = notices.find((n) => n.id === unwrappedParams.id) || notices[0];

  if (!notice) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Notice Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested circular could not be located in your institution repository.
        </p>
        <Link
          href="/institution/notices"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notices</span>
        </Link>
      </div>
    );
  }

  const isPublished = notice.status === "published";
  const isDraft = notice.status === "draft";
  const isArchived = notice.status === "archived";

  const handleArchive = () => {
    archiveNotice(notice.id);
    router.push("/institution/notices");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/institution/notices"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Notices</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold text-slate-500 truncate max-w-xs">
            {notice.title}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {!isArchived && (
            <button
              type="button"
              onClick={handleArchive}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive Notice</span>
            </button>
          )}

          <Link
            href="/institution/notices/create"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit / Reuse</span>
          </Link>
        </div>
      </div>

      {/* Main Notice Display Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
        {/* Header Section */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isPublished
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : isDraft
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {notice.status}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {notice.category || "General"}
              </span>

              {notice.priorityHint && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
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
            </div>

            <span className="text-xs font-medium text-slate-400">
              Published on: {notice.publicationDate || notice.date}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {notice.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Issuer: {notice.createdBy || institution.adminName}</span>
            <span>•</span>
            <span>{institution.name}</span>
          </div>
        </div>

        {/* Audience & Delivery Metadata Highlights */}
        <div className="p-6 sm:p-8 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              Target Audience
            </span>
            <p className="text-xs font-bold text-slate-900">
              {notice.targetGroup}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Recipients
            </span>
            <p className="text-xs font-bold text-emerald-700">
              {notice.recipientsCount || notice.recipientCount || 0} students
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Deadline
            </span>
            <p className="text-xs font-bold text-amber-900">
              {notice.deadline || "No deadline specified"}
            </p>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Official Notice Announcement
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-6 rounded-2xl border border-slate-200/70 font-sans">
              {notice.content}
            </div>
          </div>

          {/* Event / Venue if present */}
          {(notice.eventDate || notice.venue) && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-4 text-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-indigo-950">
                  {notice.venue ? `Location: ${notice.venue}` : "Scheduled Session"}
                </p>
                <p className="text-[11px] text-indigo-700">
                  {notice.eventDate && `Date: ${notice.eventDate}`}{" "}
                  {notice.startTime && `• ${notice.startTime} - ${notice.endTime}`}
                </p>
              </div>
            </div>
          )}

          {/* Attachment Preview Card */}
          {notice.attachmentName && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Attached Circular Document
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {notice.attachmentName}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {notice.attachmentSize || "1.4 MB"} • Verified Official PDF
                    </p>
                  </div>
                </div>

                <a
                  href={`#download-${notice.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Downloading circular: ${notice.attachmentName}`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
