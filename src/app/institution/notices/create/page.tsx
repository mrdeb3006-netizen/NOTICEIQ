"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  Users,
  Target,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Building,
  School,
  Save,
  Send,
  HelpCircle,
} from "lucide-react";
import {
  NoticeCategory,
  NoticePriorityHint,
  NoticeTargetType,
} from "@/types/institution";
import { useInstitutionData } from "@/lib/institutionStore";

export default function CreateNoticePage() {
  const router = useRouter();
  const { institution, students, groups, publishNotice, saveDraftNotice } =
    useInstitutionData();
  const isCollege = institution.type === "college";

  // Form State
  const [title, setTitle] = useState(
    "Scholarship Application — Academic Year 2026"
  );
  const [category, setCategory] = useState<NoticeCategory>("Scholarship");
  const [priorityHint, setPriorityHint] = useState<NoticePriorityHint>("high");
  const [content, setContent] = useState(
    `All eligible first-year students are requested to complete the scholarship application process by September 10, 2026.

Students must submit the following documents:
1. Aadhaar Card
2. Previous Semester Marksheet
3. Income Certificate
4. Bank Account Details

Students who do not complete the process before the deadline may not be considered for the scholarship.

For assistance, contact the Student Welfare Office.`
  );

  // File Upload State
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: "pdf" | "image";
  } | null>({
    name: "Scholarship_Guidelines_2026.pdf",
    size: "1.4 MB",
    type: "pdf",
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dates & Schedule
  const [publicationDate, setPublicationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [hasDeadline, setHasDeadline] = useState(true);
  const [deadline, setDeadline] = useState("2026-09-10");
  const [eventDate, setEventDate] = useState("2026-09-10");
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("04:00 PM");
  const [venue, setVenue] = useState("Student Welfare Office, Admin Block Room 104");

  // Target Audience State
  const [targetType, setTargetType] = useState<NoticeTargetType>("section");
  const [targetDepartment, setTargetDepartment] = useState("CSE");
  const [targetYear, setTargetYear] = useState("1st Year");
  const [targetClass, setTargetClass] = useState("10");
  const [targetSection, setTargetSection] = useState("A");
  const [targetGroupId, setTargetGroupId] = useState(
    groups[0]?.id || "grp-001"
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([
    students[0]?.id || "stu-001",
    students[1]?.id || "stu-002",
  ]);
  const [studentSearch, setStudentSearch] = useState("");

  // Modals & Submissions
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedNoticeId, setPublishedNoticeId] = useState<string | null>(
    null
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Calculate dynamic recipient count and label
  const getAudienceSummary = () => {
    switch (targetType) {
      case "all":
        return {
          label: "All Students",
          count: isCollege ? 2430 : 1200,
          description: "All enrolled students across all branches and batches.",
        };
      case "department":
        return {
          label: `${targetDepartment} • All Years`,
          count: 620,
          description: `All students in ${targetDepartment} department.`,
        };
      case "year":
        return {
          label: isCollege
            ? `${targetDepartment} • ${targetYear}`
            : `Class ${targetClass}`,
          count: 240,
          description: isCollege
            ? `All ${targetYear} students in ${targetDepartment}.`
            : `All students in Class ${targetClass}.`,
        };
      case "section":
        return {
          label: isCollege
            ? `${targetDepartment} • ${targetYear} • Section ${targetSection}`
            : `Class ${targetClass} • Section ${targetSection}`,
          count: 486,
          description: `Targeted specifically to Section ${targetSection}.`,
        };
      case "group": {
        const found = groups.find((g) => g.id === targetGroupId);
        return {
          label: found ? found.name : "Custom Group",
          count: found ? found.studentCount : 128,
          description: found?.description || "Registered student cohort group.",
        };
      }
      case "selected":
        return {
          label: `${selectedStudentIds.length} Individual Students`,
          count: selectedStudentIds.length,
          description: "Direct targeted dispatch to individually selected students.",
        };
      default:
        return {
          label: "All Students",
          count: 2430,
          description: "All students will receive this circular.",
        };
    }
  };

  const audienceSummary = getAudienceSummary();

  // File Upload Simulator
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith("image/");
      setAttachedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: isImg ? "image" : "pdf",
      });
    }
  };

  // Student list filtering for "Selected Students"
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.studentId && s.studentId.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Save Draft Handler
  const handleSaveDraft = () => {
    const draftNotice = saveDraftNotice({
      title: title || "Untitled Draft Notice",
      category,
      priorityHint,
      content,
      targetType,
      targetGroup: audienceSummary.label,
      targetDepartment: isCollege ? targetDepartment : undefined,
      targetYear: isCollege ? targetYear : undefined,
      targetClass: !isCollege ? targetClass : undefined,
      targetSection,
      targetGroupId: targetType === "group" ? targetGroupId : undefined,
      selectedStudentIds: targetType === "selected" ? selectedStudentIds : undefined,
      deadline: hasDeadline && deadline ? deadline : undefined,
      eventDate,
      startTime,
      endTime,
      venue,
      attachmentName: attachedFile?.name,
      attachmentType: attachedFile?.type,
      attachmentSize: attachedFile?.size,
      recipientsCount: audienceSummary.count,
    });

    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 3000);
  };

  // Pre-Publish Review Trigger
  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Please provide a notice title.");
      return;
    }
    if (!content.trim()) {
      setFormError("Please enter the notice content.");
      return;
    }
    if (targetType === "selected" && selectedStudentIds.length === 0) {
      setFormError("Please select at least one student for individual targeting.");
      return;
    }

    setShowReviewModal(true);
  };

  // Execute Final Publish
  const handleFinalPublish = () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);
    setShowReviewModal(false);

    setTimeout(() => {
      const formattedDeadline = hasDeadline && deadline ? deadline : "No deadline specified";

      const published = publishNotice({
        title,
        category,
        priorityHint,
        content,
        targetType,
        targetGroup: audienceSummary.label,
        targetDepartment: isCollege ? targetDepartment : undefined,
        targetYear: isCollege ? targetYear : undefined,
        targetClass: !isCollege ? targetClass : undefined,
        targetSection,
        targetGroupId: targetType === "group" ? targetGroupId : undefined,
        selectedStudentIds: targetType === "selected" ? selectedStudentIds : undefined,
        deadline: formattedDeadline,
        eventDate: eventDate || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        venue: venue || undefined,
        attachmentName: attachedFile?.name,
        attachmentType: attachedFile?.type,
        attachmentSize: attachedFile?.size,
        recipientsCount: audienceSummary.count,
      });

      setPublishedNoticeId(published.id);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  // Reset form for creating another notice
  const handleCreateAnother = () => {
    setTitle("");
    setContent("");
    setAttachedFile(null);
    setHasDeadline(false);
    setDeadline("");
    setIsSuccess(false);
    setPublishedNoticeId(null);
  };

  // Success State View
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Circular Broadcast Live
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Notice Published Successfully
            </h1>
            <p className="text-sm font-semibold text-indigo-600 max-w-md mx-auto">
              &ldquo;{title}&rdquo;
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-md mx-auto text-left space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Published to:</span>
              <span className="font-bold text-slate-900">
                {audienceSummary.label}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Recipients Count:</span>
              <span className="font-bold text-indigo-600">
                {audienceSummary.count} students
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Submission Deadline:</span>
              <span className="font-bold text-slate-900">
                {hasDeadline && deadline ? deadline : "No deadline specified"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 text-left flex items-start gap-2.5 max-w-md mx-auto">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Targeted students can now see this circular in their student inbox and campus notices stream.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {publishedNoticeId && (
              <Link
                href={`/institution/notices/${publishedNoticeId}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>View Notice</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleCreateAnother}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              + Create Another Notice
            </button>

            <Link
              href="/institution/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Toast Notification for Draft */}
      {draftSavedToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Notice saved to Drafts repository.</span>
        </div>
      )}

      {/* Top Breadcrumbs & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/institution/notices"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Notices</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-indigo-600">Create</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Create Notice
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Share important information with the right students.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200/80 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Notice</span>
          </button>

          <button
            type="button"
            onClick={handleOpenReview}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/25 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Review & Publish</span>
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Authoring Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* =================================================================== */}
        {/* LEFT / MAIN COLUMN: CONTENT, CATEGORY & DATES                       */}
        {/* =================================================================== */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Notice Information */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>1. Basic Notice Information</span>
            </h2>

            {/* Notice Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Notice Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Scholarship Application — Academic Year 2026"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-xs"
                required
              />
            </div>

            {/* Category & Priority Hint Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Notice Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all"
                >
                  <option value="Academic">Academic</option>
                  <option value="Examination">Examination</option>
                  <option value="Scholarship">Scholarship</option>
                  <option value="Event">Event</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Administration">Administration</option>
                  <option value="Placement">Placement</option>
                  <option value="Club / Activity">Club / Activity</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Priority Hint (Optional)</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    Institution Guideline
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["low", "medium", "high"] as NoticePriorityHint[]).map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriorityHint(p)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl capitalize transition-all border ${
                          priorityHint === p
                            ? p === "high"
                              ? "bg-rose-50 text-rose-700 border-rose-300 shadow-xs"
                              : p === "medium"
                              ? "bg-amber-50 text-amber-700 border-amber-300 shadow-xs"
                              : "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> This is only an optional hint from the institution. The final student priority will be determined personalized by NoticeIQ&apos;s AI priority engine.
              </span>
            </p>
          </div>

          {/* 2. Notice Content & Attachments */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <span>2. Notice Content & Attachments</span>
            </h2>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Notice Content <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type or paste the full announcement, required document checklist, eligibility criteria..."
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs leading-relaxed placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-xs font-sans resize-y"
                required
              />
            </div>

            {/* File Upload Zone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Attach Official Circular Document (Optional)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />

              {!attachedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/30 text-center cursor-pointer transition-all group"
                >
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 mx-auto mb-2 transition-colors" />
                  <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">
                    Click to upload document or image
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Supports PDF, PNG, JPG, JPEG (Max 15MB)
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                      {attachedFile.type === "pdf" ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {attachedFile.name}
                      </p>
                      <p className="text-[10px] text-indigo-600">
                        {attachedFile.size} • {attachedFile.type.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3. Important Dates & Schedule */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>3. Important Dates & Schedule</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Publication Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Publication Date
                </label>
                <input
                  type="date"
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Deadline Toggle & Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Action Deadline
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDeadline}
                      onChange={(e) => setHasDeadline(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>Has Deadline</span>
                  </label>
                </div>

                {hasDeadline ? (
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-500 transition-all"
                  />
                ) : (
                  <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs italic">
                    No deadline specified
                  </div>
                )}
              </div>

              {/* Optional Event / Start / End Time */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Event / Session Date (Optional)
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Venue */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Venue / Location (Optional)
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Student Welfare Office, Room 104"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT / SIDEBAR COLUMN: TARGET AUDIENCE & SUMMARY                   */}
        {/* =================================================================== */}
        <div className="space-y-6">
          {/* Target Audience Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Target Audience</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Who should receive this notice?
              </p>
            </div>

            {/* Target Mode Selector */}
            <div className="space-y-2">
              {[
                { id: "all", label: "All Students", desc: "Campus-wide broadcast" },
                {
                  id: "department",
                  label: isCollege ? "Specific Department" : "Specific Stream",
                  desc: isCollege ? "e.g. CSE, ECE, ME" : "Science, Commerce, Arts",
                },
                {
                  id: "year",
                  label: isCollege ? "Specific Year" : "Specific Class",
                  desc: isCollege ? "1st, 2nd, 3rd, 4th Year" : "Class 5 to 12",
                },
                {
                  id: "section",
                  label: "Specific Section",
                  desc: "e.g. Section A, Section B",
                },
                {
                  id: "group",
                  label: "Specific Group",
                  desc: "Target saved cohort groups",
                },
                {
                  id: "selected",
                  label: "Selected Students",
                  desc: "Pick individual students",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setTargetType(opt.id as NoticeTargetType)}
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    targetType === opt.id
                      ? "bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs"
                      : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/70 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === opt.id}
                    onChange={() => {}}
                    className="mt-0.5 text-indigo-600 focus:ring-0"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[11px] text-slate-500">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Department Selection */}
            {(targetType === "department" ||
              targetType === "year" ||
              targetType === "section") &&
              isCollege && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800">
                    Department
                  </label>
                  <select
                    value={targetDepartment}
                    onChange={(e) => setTargetDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="CSE">CSE (Computer Science & Engg)</option>
                    <option value="ECE">ECE (Electronics & Comm)</option>
                    <option value="EE">EE (Electrical Engg)</option>
                    <option value="ME">ME (Mechanical Engg)</option>
                    <option value="Civil">Civil Engineering</option>
                    <option value="Other">Other / Interdisciplinary</option>
                  </select>
                </div>
              )}

            {/* Year / Class Selection */}
            {(targetType === "year" || targetType === "section") && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  {isCollege ? "Academic Year" : "Class"}
                </label>
                {isCollege ? (
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                ) : (
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-500"
                  >
                    {[5, 6, 7, 8, 9, 10, 11, 12].map((cls) => (
                      <option key={cls} value={cls.toString()}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Section Selection */}
            {targetType === "section" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Section
                </label>
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="All">All Sections</option>
                </select>
              </div>
            )}

            {/* Specific Group Selector */}
            {targetType === "group" && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  Select Cohort Group
                </label>
                <select
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-500"
                >
                  {groups.map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      {grp.name} ({grp.studentCount} students)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selected Students List Selector */}
            {targetType === "selected" && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {selectedStudentIds.length} students selected
                  </span>
                  {selectedStudentIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedStudentIds([])}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search student name, email or ID"
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                  {filteredStudents.map((s) => {
                    const isSelected = selectedStudentIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? "bg-indigo-100/70 text-indigo-950 font-semibold"
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudentSelection(s.id)}
                            className="rounded text-indigo-600 focus:ring-0"
                          />
                          <span className="truncate">{s.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-600 shrink-0 ml-1">
                          {s.rollNumber || s.section}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Audience Summary Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  Target Audience Summary
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                  {audienceSummary.count} students
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900">
                {audienceSummary.label}
              </p>
              <p className="text-[11px] text-slate-600 leading-tight">
                {audienceSummary.description} This notice will be visible only to students matching this criteria.
              </p>
            </div>
          </div>

          {/* Quick Publish CTA Bar */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <button
              type="button"
              onClick={handleOpenReview}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Send className="w-4 h-4" />
              <span>Review & Publish Notice</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Student-Facing Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. STUDENT-FACING PREVIEW MODAL                                       */}
      {/* ===================================================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold tracking-tight">
                  Student-Facing Notice Preview
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Student Notice View */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-left">
              {/* Institution Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs">
                    {institution.type === "college" ? "🏛️" : "🏫"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {institution.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Official Institutional Circular
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {category}
                </span>
              </div>

              {/* Title & Target */}
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Target: {audienceSummary.label}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {title || "Untitled Notice"}
                </h3>
              </div>

              {/* Deadline & Venue Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>
                    Deadline:{" "}
                    {hasDeadline && deadline
                      ? deadline
                      : "No deadline specified"}
                  </span>
                </div>
                {venue && (
                  <p className="text-[11px] text-amber-800 ml-6">
                    Venue: {venue}
                  </p>
                )}
              </div>

              {/* Formatted Content */}
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                {content || "No notice content provided."}
              </div>

              {/* Attachment Preview if exists */}
              {attachedFile && (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">
                      {attachedFile.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {attachedFile.size}
                  </span>
                </div>
              )}

              {/* Contact Information */}
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Issued by: {institution.adminName || "Academic Office"}</span>
                <span>Date: {publicationDate}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 italic">
                NoticeIQ Student View
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. REVIEW BEFORE PUBLISHING MODAL                                     */}
      {/* ===================================================================== */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Review Notice Before Publishing
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left max-h-[70vh] overflow-y-auto">
              <div className="space-y-3 divide-y divide-slate-100 text-xs">
                <div className="flex items-start justify-between gap-4 pb-2">
                  <span className="text-slate-400 font-medium shrink-0">Title:</span>
                  <span className="font-bold text-slate-900 text-right">{title}</span>
                </div>

                <div className="flex items-center justify-between gap-4 py-2">
                  <span className="text-slate-400 font-medium">Category:</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[11px]">
                    {category}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-2">
                  <span className="text-slate-400 font-medium">Deadline:</span>
                  <span className="font-bold text-slate-900">
                    {hasDeadline && deadline ? deadline : "No deadline specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-2">
                  <span className="text-slate-400 font-medium">Audience:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {audienceSummary.label}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-2">
                  <span className="text-slate-400 font-medium">Recipients:</span>
                  <span className="font-bold text-emerald-600">
                    {audienceSummary.count} students
                  </span>
                </div>

                <div className="pt-3 space-y-1">
                  <span className="text-slate-400 font-medium block">
                    Content Snippet:
                  </span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] leading-relaxed line-clamp-4">
                    {content}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-bold text-xs transition-colors"
              >
                ← Edit Notice
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. FINAL CONFIRMATION DIALOG                                          */}
      {/* ===================================================================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Megaphone className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                Publish this notice?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                This notice will be delivered to all {audienceSummary.count} students in the selected audience ({audienceSummary.label}).
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalPublish}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Publishing...</span>
                ) : (
                  <>
                    <span>Publish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
