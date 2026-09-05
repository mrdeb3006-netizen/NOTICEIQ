"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFacultyData } from "@/lib/facultyStore";
import { NoticeCategory } from "@/types/institution";
import {
  Megaphone,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Paperclip,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  HelpCircle,
  Award,
  BookOpen,
} from "lucide-react";

export default function FacultyNoticeCreatePage() {
  const router = useRouter();
  const { currentFaculty, isHOD, publishFacultyNotice } = useFacultyData();

  // Form State
  const [title, setTitle] = useState("Internal Assessment Assignment Submission");
  const [category, setCategory] = useState<NoticeCategory>("Assignment");
  const [deadline, setDeadline] = useState("2026-09-12");
  const [content, setContent] = useState(
    "All students of CSE 1st Year Section A are required to complete the Data Structures Internal Assessment Problem Set 1 covering Linked Lists, Stacks, and Queues. Submit your handwritten solutions along with verified lab test case outputs to Room 208 before the deadline. Late submissions will result in a 20% marks deduction."
  );

  // Audience Targeting
  const assignedOptions = currentFaculty.assignedSections.map(
    (sec) => `${sec.department} • ${sec.year} • Section ${sec.section}`
  );

  const [selectedTarget, setSelectedTarget] = useState<string>(
    assignedOptions[0] || "CSE • 1st Year • Section A"
  );
  const [departmentWideTarget, setDepartmentWideTarget] = useState(false);

  // Attachment state
  const [attachmentName, setAttachmentName] = useState<string | undefined>("DS_Assignment_1_ProblemSet.pdf");
  const [attachmentType, setAttachmentType] = useState<"pdf" | "image" | "doc">("pdf");
  const [attachmentSize, setAttachmentSize] = useState<string | undefined>("1.4 MB");

  // NoticeIQ AI Analysis State
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiTasks, setAiTasks] = useState<
    Array<{ title: string; description?: string; deadline?: string | null; estimated_minutes?: number | null }>
  >([
    {
      title: "Solve Problem Set 1",
      description: "Implement linked list, stack and queue exercises.",
      deadline: "2026-09-10",
      estimated_minutes: 90,
    },
    {
      title: "Verify Test Case Outputs",
      description: "Run code against sample test cases in Computing Lab 3.",
      deadline: "2026-09-11",
      estimated_minutes: 45,
    },
    {
      title: "Submit Solutions in Room 208",
      description: "Hand over physical write-up to Prof. Arindam Sen.",
      deadline: "2026-09-12",
      estimated_minutes: 15,
    },
  ]);
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Trigger NoticeIQ AI Notice Understanding Engine
  const handleAnalyzeWithAi = async () => {
    if (!content.trim()) return;
    setIsAnalyzingAi(true);

    try {
      const res = await fetch("/api/analyze-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          content,
          deadline,
          targetGroup: selectedTarget,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setAiSummary(data.analysis.summary || null);
          if (data.analysis.tasks && data.analysis.tasks.length > 0) {
            setAiTasks(data.analysis.tasks);
          }
          setAiAnalysisComplete(true);
        }
      }
    } catch (err) {
      console.error("AI Notice analysis error:", err);
      // Fallback analysis remains active
      setAiSummary("Notice requires submission of internal assessment assignment before September 12.");
      setAiAnalysisComplete(true);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsPublishing(true);

    const targetLabel =
      isHOD && departmentWideTarget
        ? "CSE • All Years • Department-wide"
        : selectedTarget;

    // Parse target parts
    const parts = targetLabel.split("•").map((s) => s.trim());
    const dept = parts[0] || "CSE";
    const yr = parts[1] || "1st Year";
    const sec = parts[2]?.replace("Section", "").trim() || "A";

    publishFacultyNotice({
      title,
      category,
      content,
      targetType: "section",
      targetGroup: targetLabel,
      targetDepartment: dept,
      targetYear: yr,
      targetSection: sec,
      deadline,
      attachmentName,
      attachmentType,
      attachmentSize,
      aiSummary: aiSummary || undefined,
      aiTasks: aiTasks,
    });

    setPublishSuccess(true);

    setTimeout(() => {
      setIsPublishing(false);
      router.push("/faculty/sent");
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Create Course & Student Notice
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Publish targeted circulars and assignments. Powered by the NoticeIQ Action Intelligence pipeline.
          </p>
        </div>

        <Link
          href="/faculty/notices"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          Cancel
        </Link>
      </div>

      {publishSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <strong className="block text-slate-900 dark:text-white">
              Notice Successfully Published!
            </strong>
            <span>
              Circular dispatched to {selectedTarget}. NoticeIQ AI is scheduling student action items.
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handlePublish} className="space-y-6">
        {/* Card 1: Targeting & Authorization */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Authorized Target Audience
              </h2>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {currentFaculty.role === "HOD" ? "HOD Full Department Access" : "Faculty Class Restriction"}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Target Cohort / Section
              </label>

              {isHOD ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={departmentWideTarget}
                        onChange={(e) => setDepartmentWideTarget(e.target.checked)}
                        className="rounded border-slate-700 text-amber-600 focus:ring-amber-500"
                      />
                      <span>Broadcast to All CSE Years (Department-wide)</span>
                    </label>
                  </div>

                  {!departmentWideTarget && (
                    <select
                      value={selectedTarget}
                      onChange={(e) => setSelectedTarget(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="CSE • 1st Year • Section A">CSE • 1st Year • Section A (64 Students)</option>
                      <option value="CSE • 1st Year • Section B">CSE • 1st Year • Section B (62 Students)</option>
                      <option value="CSE • 2nd Year • Section A">CSE • 2nd Year • Section A (65 Students)</option>
                      <option value="CSE • 3rd Year • Section A">CSE • 3rd Year • Section A (60 Students)</option>
                      <option value="CSE • 4th Year • Section A">CSE • 4th Year • Section A (58 Students)</option>
                    </select>
                  )}
                </div>
              ) : (
                <div>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    {assignedOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt} (Assigned to {currentFaculty.name})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>
                      Targeting is securely restricted to your assigned teaching classes ({currentFaculty.assignedClasses.join(", ")}).
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Notice Content & Details */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Notice Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Notice Title / Topic
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mid-Term Internal Assessment Submission"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Assignment">Assignment</option>
                <option value="Academic">Academic</option>
                <option value="Examination">Examination</option>
                <option value="Event">Event / Workshop</option>
                <option value="General">General Announcement</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Submission / Action Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Attachment File
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={attachmentName || ""}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="e.g. Assignment_Sheet.pdf"
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => alert("Upload simulation: attached document.")}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Notice Full Body / Content
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide complete instructions, document requirements, and instructions for students..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Card 3: NoticeIQ AI Pipeline Integration */}
        <div className="p-5 sm:p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                NoticeIQ AI Understanding Engine
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAnalyzeWithAi}
              disabled={isAnalyzingAi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzingAi ? "Analyzing..." : "Re-Analyze with AI"}</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            NoticeIQ parses your circular and extracts actionable student tasks. When published, these tasks automatically populate the eligible students' <strong>Priority Matrix</strong> and <strong>Smart Daily Schedule</strong>.
          </p>

          {/* AI Extracted Tasks Preview */}
          {aiTasks.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Extracted Student Action Items ({aiTasks.length})
              </span>
              <div className="space-y-2">
                {aiTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {task.deadline && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                          Due: {task.deadline}
                        </span>
                      )}
                      {task.estimated_minutes && (
                        <span className="text-[10px] text-slate-400 block">
                          ~{task.estimated_minutes} min focus
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/faculty/notices"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPublishing}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Megaphone className="w-4 h-4" />
            <span>{isPublishing ? "Broadcasting..." : "Publish & Dispatch to Students"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
