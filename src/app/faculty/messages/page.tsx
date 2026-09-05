"use client";

import React, { useState, useMemo } from "react";
import { useFacultyData } from "@/lib/facultyStore";
import { FacultyMessage } from "@/types/faculty";
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  User,
  Award,
  BookOpen,
  X,
  AlertCircle,
  Mail,
  MailOpen,
  ChevronDown,
} from "lucide-react";

export default function FacultyMessagesPage() {
  const {
    currentFaculty,
    myMessages,
    isHOD,
    toggleMessageRead,
    sendMessage,
  } = useFacultyData();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "UNREAD" | "HOD" | "FACULTY" | "STUDENT">("ALL");
  const [activeMessage, setActiveMessage] = useState<FacultyMessage | null>(null);

  // Compose Modal State
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipientCategory, setRecipientCategory] = useState<"STUDENT_CLASS" | "DEPARTMENT_FACULTY">(
    isHOD ? "DEPARTMENT_FACULTY" : "STUDENT_CLASS"
  );
  const [selectedTargetSection, setSelectedTargetSection] = useState(
    currentFaculty.assignedSections[0]
      ? `${currentFaculty.assignedSections[0].department} • ${currentFaculty.assignedSections[0].year} • Section ${currentFaculty.assignedSections[0].section}`
      : "CSE • 1st Year • Section A"
  );
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messagePriority, setMessagePriority] = useState<"URGENT" | "IMPORTANT" | "NORMAL" | "LOW">("NORMAL");
  const [composeSuccess, setComposeSuccess] = useState<string | null>(null);

  // Filter & Search
  const filteredMessages = useMemo(() => {
    return myMessages.filter((msg) => {
      // Filter tab
      if (filterType === "UNREAD" && msg.isRead) return false;
      if (filterType === "HOD" && msg.senderRole !== "HOD") return false;
      if (filterType === "FACULTY" && msg.senderRole !== "FACULTY") return false;
      if (filterType === "STUDENT" && msg.recipientType !== "STUDENT_CLASS") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = msg.title.toLowerCase().includes(q);
        const matchContent = msg.content.toLowerCase().includes(q);
        const matchSender = msg.senderName.toLowerCase().includes(q);
        const matchTarget = msg.targetGroupLabel.toLowerCase().includes(q);
        return matchTitle || matchContent || matchSender || matchTarget;
      }

      return true;
    });
  }, [myMessages, filterType, searchQuery]);

  const handleOpenMessage = (msg: FacultyMessage) => {
    setActiveMessage(msg);
    if (!msg.isRead) {
      toggleMessageRead(msg.id, true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTitle.trim() || !messageContent.trim()) return;

    sendMessage({
      recipientType: recipientCategory,
      targetDepartment: currentFaculty.department,
      targetGroupLabel:
        recipientCategory === "DEPARTMENT_FACULTY"
          ? "All CSE Department Faculty"
          : selectedTargetSection,
      title: messageTitle,
      content: messageContent,
      priority: messagePriority,
      category: recipientCategory === "DEPARTMENT_FACULTY" ? "Faculty Coordination" : "Class Message",
    });

    setComposeSuccess("Message successfully transmitted!");
    setMessageTitle("");
    setMessageContent("");
    setTimeout(() => {
      setComposeSuccess(null);
      setComposeOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Faculty Communication
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Internal academic communication, HOD instructions, and direct class announcements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setComposeOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Send Message</span>
        </button>
      </div>

      {/* Distinction Info Callout */}
      <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-950 dark:text-indigo-200">
        <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>NoticeIQ Communication Distinction:</strong> <em>Messages</em> are lightweight, immediate updates (e.g. room shifts, lab preparation, or reminders). For official circulars, examination guidelines, and assignments that trigger student priority tasks, use the{" "}
          <strong className="underline decoration-indigo-400">Notice Creator</strong>.
        </p>
      </div>

      {/* Controls: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by subject, sender, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/80">
          {(["ALL", "UNREAD", "HOD", "FACULTY", "STUDENT"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === tab
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab === "ALL"
                ? "All Messages"
                : tab === "UNREAD"
                ? "Unread"
                : tab === "HOD"
                ? "From HOD"
                : tab === "FACULTY"
                ? "Faculty"
                : "To Class"}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List & Reader Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Message Threads List (2 Cols on desktop) */}
        <div className="lg:col-span-2 space-y-2.5">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => {
              const isSelected = activeMessage?.id === msg.id;
              const isIncoming = msg.senderId !== currentFaculty.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500"
                      : !msg.isRead && isIncoming
                      ? "bg-amber-500/5 dark:bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                          msg.senderRole === "HOD"
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {msg.senderRole}
                      </span>
                      {msg.priority === "URGENT" && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400">
                          Urgent
                        </span>
                      )}
                      {!msg.isRead && isIncoming && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {msg.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {msg.content}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="truncate">By: {msg.senderName}</span>
                    <span className="text-slate-500 shrink-0 font-medium">
                      Target: {msg.targetGroupLabel}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              No messages found for this filter.
            </div>
          )}
        </div>

        {/* Message Reader Pane (3 Cols on desktop) */}
        <div className="lg:col-span-3">
          {activeMessage ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              {/* Message Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      activeMessage.senderRole === "HOD"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                    }`}
                  >
                    {activeMessage.senderRole} Communication
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleMessageRead(activeMessage.id)}
                      className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-medium"
                    >
                      {activeMessage.isRead ? (
                        <>
                          <MailOpen className="w-3.5 h-3.5" />
                          <span>Mark Unread</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          <span>Mark Read</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {activeMessage.title}
                </h2>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                  <p>
                    <strong>From:</strong> {activeMessage.senderName} ({activeMessage.senderDesignation})
                  </p>
                  <p>
                    <strong>Target:</strong> {activeMessage.targetGroupLabel}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(activeMessage.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Message Content */}
              <div className="py-2 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {activeMessage.content}
              </div>

              {/* Footer action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  NoticeIQ Instant Messaging Protocol
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMessageTitle(`Re: ${activeMessage.title}`);
                    setComposeOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
              <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Select a message
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose a conversation from the left to read its full message content and reply.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COMPOSE MESSAGE MODAL
      ───────────────────────────────────────────────────────────── */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setComposeOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Send Fast Message
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {composeSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{composeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-4 text-left">
              {/* Recipient Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Recipient Audience
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRecipientCategory("STUDENT_CLASS")}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      recipientCategory === "STUDENT_CLASS"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent"
                    }`}
                  >
                    Assigned Class Section
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isHOD) {
                        alert("Broadcast to department faculty is reserved for HOD role.");
                        return;
                      }
                      setRecipientCategory("DEPARTMENT_FACULTY");
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      recipientCategory === "DEPARTMENT_FACULTY"
                        ? "bg-amber-600 text-white border-amber-500"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent"
                    } ${!isHOD ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    Department Faculty (HOD)
                  </button>
                </div>
              </div>

              {/* Target Section (if student class) */}
              {recipientCategory === "STUDENT_CLASS" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Select Authorized Class
                  </label>
                  <select
                    value={selectedTargetSection}
                    onChange={(e) => setSelectedTargetSection(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {currentFaculty.assignedSections.map((sec, idx) => (
                      <option
                        key={idx}
                        value={`${sec.department} • ${sec.year} • Section ${sec.section}`}
                      >
                        {sec.department} • {sec.year} • Section {sec.section} ({sec.subject})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Subject / Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow's tutorial moved to Room 302"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your brief message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(["NORMAL", "IMPORTANT", "URGENT"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setMessagePriority(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        messagePriority === p
                          ? p === "URGENT"
                            ? "bg-rose-600 text-white border-rose-500"
                            : p === "IMPORTANT"
                            ? "bg-amber-600 text-white border-amber-500"
                            : "bg-indigo-600 text-white border-indigo-500"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setComposeOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
                >
                  Dispatch Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
