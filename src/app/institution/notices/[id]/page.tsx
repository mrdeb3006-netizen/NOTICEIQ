"use client";

import React, { useState, useEffect, use } from "react";
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
  AlertCircle,
  Megaphone,
  Bot,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  FileCheck,
  ListTodo,
  ShieldAlert,
  GitCommit,
  CheckSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";
import { NoticeAiAnalysis, NoticeAiTask } from "@/types/institution";

export default function NoticeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const {
    notices,
    institution,
    archiveNotice,
    updateNoticeAiAnalysis,
    approveNoticeAiAnalysis,
  } = useInstitutionData();

  const notice = notices.find((n) => n.id === unwrappedParams.id) || notices[0];

  // AI Loading state machine
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Review & Edit Mode
  const [isEditingAi, setIsEditingAi] = useState(false);
  const [editableAnalysis, setEditableAnalysis] =
    useState<NoticeAiAnalysis | null>(null);

  // Re-analysis Confirmation Modal
  const [showReanalyzeModal, setShowReanalyzeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (notice?.aiAnalysis) {
      setEditableAnalysis(notice.aiAnalysis);
    }
  }, [notice]);

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

  const aiAnalysis = notice.aiAnalysis || editableAnalysis;
  const isAiAnalyzed =
    notice.aiAnalysisStatus === "ANALYZED" ||
    notice.aiAnalysisStatus === "APPROVED" ||
    !!notice.aiAnalysis;
  const isAiApproved = notice.aiAnalysisStatus === "APPROVED";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trigger Live OpenAI Analysis via Server API
  const handleRunAiAnalysis = async () => {
    setAnalysisError(null);
    setIsAnalyzing(true);
    setAnalysisStep(1);

    // Multi-stage realistic loading sequence
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 700);

    try {
      const response = await fetch("/api/analyze-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notice.title,
          category: notice.category,
          content: notice.content,
          deadline: notice.deadline,
          targetGroup: notice.targetGroup,
          venue: notice.venue,
          eventDate: notice.eventDate,
        }),
      });

      clearInterval(stepInterval);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to analyze notice with OpenAI. Please check your API configuration."
        );
      }

      setAnalysisStep(5);
      const parsedAnalysis: NoticeAiAnalysis = data.analysis;

      setTimeout(() => {
        updateNoticeAiAnalysis(notice.id, parsedAnalysis, "ANALYZED");
        setEditableAnalysis(parsedAnalysis);
        setIsAnalyzing(false);
        setAnalysisStep(0);
        showToast("✓ Notice analyzed successfully by NoticeIQ Engine");
      }, 500);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setAnalysisStep(0);
      const errorMsg =
        err instanceof Error ? err.message : "AI analysis could not be completed.";
      setAnalysisError(errorMsg);
    }
  };

  // Re-Analyze Trigger
  const handleConfirmReanalyze = () => {
    setShowReanalyzeModal(false);
    handleRunAiAnalysis();
  };

  // Approve AI Analysis
  const handleApproveAnalysis = () => {
    if (editableAnalysis) {
      updateNoticeAiAnalysis(notice.id, editableAnalysis, "APPROVED");
    } else {
      approveNoticeAiAnalysis(notice.id);
    }
    setIsEditingAi(false);
    showToast("✓ AI Analysis Approved & Structured Data Saved");
  };

  // Save Edits Made by Admin
  const handleSaveEditedAnalysis = () => {
    if (editableAnalysis) {
      updateNoticeAiAnalysis(
        notice.id,
        editableAnalysis,
        isAiApproved ? "APPROVED" : "ANALYZED"
      );
      setIsEditingAi(false);
      showToast("✓ Changes saved to notice analysis");
    }
  };

  // Archive notice
  const handleArchive = () => {
    archiveNotice(notice.id);
    router.push("/institution/notices");
  };

  // Helper for confidence badge
  const getConfidenceBadge = (score: number = 0.92) => {
    if (score >= 0.85) {
      return {
        label: `High Confidence (${Math.round(score * 100)}%)`,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    if (score >= 0.65) {
      return {
        label: `Medium Confidence (${Math.round(score * 100)}%)`,
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    return {
      label: `Needs Review (${Math.round(score * 100)}%)`,
      className: "bg-rose-50 text-rose-700 border-rose-200",
    };
  };

  const confidenceBadge = getConfidenceBadge(aiAnalysis?.confidence);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation & Action Controls */}
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
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Notice</span>
          </Link>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. ORIGINAL NOTICE CARD                                               */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100 text-left">
        {/* Notice Header */}
        <div className="p-6 sm:p-8 space-y-3">
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
                  {notice.priorityHint} Priority (Guideline)
                </span>
              )}
            </div>

            <span className="text-xs font-medium text-slate-400">
              Published on: {notice.publicationDate || notice.date}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {notice.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Issuer: {notice.createdBy || institution.adminName || "Academic Office"}</span>
            <span>•</span>
            <span>{institution.name}</span>
          </div>
        </div>

        {/* Metadata Summary Banner */}
        <div className="p-5 sm:p-6 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              Target Audience
            </span>
            <p className="text-xs font-bold text-slate-900 truncate">
              {notice.targetGroup}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Recipients
            </span>
            <p className="text-xs font-bold text-emerald-700">
              {notice.recipientsCount || notice.recipientCount || 0} students
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Deadline
            </span>
            <p className="text-xs font-bold text-amber-900 truncate">
              {notice.deadline || "No deadline specified"}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Original Announcement Text
          </h2>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70 font-sans">
            {notice.content}
          </div>

          {notice.attachmentName && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900 truncate">
                  {notice.attachmentName}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {notice.attachmentSize || "1.4 MB"}
                </span>
              </div>
              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Downloading: ${notice.attachmentName}`);
                }}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. NOTICEIQ AI UNDERSTANDING ENGINE SECTION                           */}
      {/* ===================================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-indigo-200/90 shadow-lg text-left space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <Bot className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                🤖 NoticeIQ AI Understanding Engine
              </h2>

              {isAiApproved ? (
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  AI_APPROVED
                </span>
              ) : isAiAnalyzed ? (
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI_ANALYZED
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                  NOT_ANALYZED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Extracts deadlines, student tasks, required documents, consequences, and prerequisite dependencies using OpenAI.
            </p>
          </div>

          {/* AI Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isAiAnalyzed && !isAnalyzing && (
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>🤖 Analyze with NoticeIQ</span>
              </button>
            )}

            {isAiAnalyzed && !isAnalyzing && (
              <>
                {!isEditingAi ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingAi(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Review & Edit</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveEditedAnalysis}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Edits</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowReanalyzeModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-analyze</span>
                </button>

                {!isAiApproved && (
                  <button
                    type="button"
                    onClick={handleApproveAnalysis}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve AI Analysis</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Error Display */}
        {analysisError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>AI analysis couldn&apos;t be completed.</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              {analysisError}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => setAnalysisError(null)}
                className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-800 font-semibold text-xs hover:bg-rose-100/50"
              >
                View Original Notice
              </button>
            </div>
          </div>
        )}

        {/* Loading Progress State */}
        {isAnalyzing && (
          <div className="p-8 rounded-3xl bg-indigo-50/50 border border-indigo-100 text-center space-y-5 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 animate-pulse">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                NoticeIQ AI Parsing Engine Active
              </h3>
              <p className="text-xs font-semibold text-indigo-700">
                {analysisStep === 1 && "Reading notice text & metadata..."}
                {analysisStep === 2 && "Identifying important dates & deadlines..."}
                {analysisStep === 3 && "Extracting actionable items & required documents..."}
                {analysisStep === 4 && "Detecting consequences & prerequisites..."}
                {analysisStep >= 5 && "✓ Analysis Complete! Rendering structured insights..."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-xs mx-auto h-2 rounded-full bg-indigo-200/70 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${(analysisStep / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Initial Prompt when Not Analyzed */}
        {!isAiAnalyzed && !isAnalyzing && !analysisError && (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                Notice has not been analyzed with AI yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Click the button above to execute OpenAI structured extraction for this circular.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunAiAnalysis}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Notice Now</span>
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* 3. STRUCTURED AI RESULTS VIEW                                       */}
        {/* =================================================================== */}
        {isAiAnalyzed && !isAnalyzing && aiAnalysis && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top AI Telemetry Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">AI Confidence:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${confidenceBadge.className}`}
                >
                  {confidenceBadge.label}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <span>Notice Type: <strong>{aiAnalysis.notice_type}</strong></span>
                <span>•</span>
                <span>
                  Targeted Depts: <strong>{aiAnalysis.audience?.departments?.join(", ") || "All"}</strong>
                </span>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Summary
                </span>
                {isEditingAi && (
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    Editing Mode
                  </span>
                )}
              </div>

              {isEditingAi ? (
                <textarea
                  rows={3}
                  value={editableAnalysis?.summary || ""}
                  onChange={(e) =>
                    setEditableAnalysis((prev) =>
                      prev ? { ...prev, summary: e.target.value } : null
                    )
                  }
                  className="w-full p-3 rounded-xl bg-white border border-indigo-200 text-slate-900 text-xs leading-relaxed focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              ) : (
                <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                  {aiAnalysis.summary}
                </p>
              )}
            </div>

            {/* Dates & Required Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Important Dates */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Important Dates Detected
                </span>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
                    <span className="font-bold text-amber-900">🔴 Action Deadline</span>
                    {isEditingAi ? (
                      <input
                        type="text"
                        value={editableAnalysis?.dates?.deadline || ""}
                        onChange={(e) =>
                          setEditableAnalysis((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  dates: { ...prev.dates, deadline: e.target.value },
                                }
                              : null
                          )
                        }
                        className="px-2 py-1 rounded bg-white border border-amber-300 text-xs font-bold text-amber-950"
                      />
                    ) : (
                      <span className="font-bold text-amber-950">
                        {aiAnalysis.dates?.deadline || "No deadline specified"}
                      </span>
                    )}
                  </div>

                  {aiAnalysis.dates?.event_date && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-700">
                      <span>Event / Session Date:</span>
                      <span className="font-semibold">{aiAnalysis.dates.event_date}</span>
                    </div>
                  )}

                  {aiAnalysis.dates?.start_time && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-700">
                      <span>Time:</span>
                      <span className="font-semibold">
                        {aiAnalysis.dates.start_time} - {aiAnalysis.dates.end_time || ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Required Documents */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Required Documents Checklist
                </span>

                {aiAnalysis.documents_required &&
                aiAnalysis.documents_required.length > 0 ? (
                  <div className="space-y-1.5">
                    {aiAnalysis.documents_required.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2 text-emerald-950 font-medium"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-xs">
                    No specific physical documents required.
                  </p>
                )}
              </div>
            </div>

            {/* Actions Detected / Tasks */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                Actions Detected ({aiAnalysis.tasks?.length || 0} Tasks)
              </span>

              <div className="space-y-2">
                {aiAnalysis.tasks && aiAnalysis.tasks.length > 0 ? (
                  aiAnalysis.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 justify-between"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{task.title}</p>
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
                  ))
                ) : (
                  <p className="text-slate-400 italic">No actionable tasks detected.</p>
                )}
              </div>
            </div>

            {/* Consequences & Dependencies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Consequence Box */}
              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2.5">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Consequence of Non-Compliance
                </span>

                {aiAnalysis.consequences && aiAnalysis.consequences.length > 0 ? (
                  <div className="space-y-1.5">
                    {aiAnalysis.consequences.map((cons, idx) => (
                      <p
                        key={idx}
                        className="text-rose-950 font-medium leading-relaxed bg-white/70 p-3 rounded-xl border border-rose-200/60"
                      >
                        ⚠️ {cons}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    No punitive consequence explicitly stated.
                  </p>
                )}
              </div>

              {/* Dependency Flow */}
              <div className="p-5 rounded-2xl bg-violet-50/50 border border-violet-200 space-y-2.5">
                <span className="text-[10px] font-bold text-violet-800 uppercase tracking-wider flex items-center gap-1.5">
                  <GitCommit className="w-3.5 h-3.5 text-violet-600" />
                  Prerequisite Dependencies
                </span>

                {aiAnalysis.dependencies && aiAnalysis.dependencies.length > 0 ? (
                  <div className="space-y-2">
                    {aiAnalysis.dependencies.map((dep, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/80 border border-violet-200 text-center space-y-1"
                      >
                        <span className="font-bold text-violet-900 block text-xs">
                          {dep.required_task}
                        </span>
                        <div className="text-slate-400 font-mono text-xs">↓</div>
                        <span className="font-bold text-indigo-900 block text-xs">
                          {dep.blocked_task}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    All tasks can be executed independently.
                  </p>
                )}
              </div>
            </div>

            {/* Important Points Checklist */}
            {aiAnalysis.important_points && aiAnalysis.important_points.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Important Factual Points (For Student Notice View)
                </span>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 font-medium">
                  {aiAnalysis.important_points.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bottom Review & Approval Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold">
                  {isAiApproved ? "✓ AI Analysis Approved" : "Human-in-the-Loop Review"}
                </p>
                <p className="text-[11px] text-slate-300">
                  {isAiApproved
                    ? `Approved on ${notice.aiApprovedAt ? new Date(notice.aiApprovedAt).toLocaleDateString() : "today"}. Verified for Step 5.`
                    : "Review extracted data and click 'Approve AI Analysis' to confirm."}
                </p>
              </div>

              {!isAiApproved && (
                <button
                  type="button"
                  onClick={handleApproveAnalysis}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve AI Analysis</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 4. RE-ANALYZE CONFIRMATION MODAL                                      */}
      {/* ===================================================================== */}
      {showReanalyzeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                Re-analyze this notice?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Previous analysis and custom edits will be replaced after confirmation.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReanalyzeModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReanalyze}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all"
              >
                Re-analyze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
