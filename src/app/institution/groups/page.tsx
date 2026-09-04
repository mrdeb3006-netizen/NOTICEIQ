"use client";

import React, { useState } from "react";
import {
  Target,
  Plus,
  Users,
  Search,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  Send,
  MoreHorizontal,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";

export default function GroupsManagementPage() {
  const { institution, groups, addGroup } = useInstitutionData();

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [groupName, setGroupName] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [year, setYear] = useState("1st");
  const [section, setSection] = useState("A");
  const [description, setDescription] = useState("");
  const [estimatedCount, setEstimatedCount] = useState(64);

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    addGroup({
      name: groupName,
      department: department === "all" ? undefined : department,
      year: year === "all" ? undefined : year,
      section: section === "all" ? undefined : section,
      studentCount: estimatedCount,
      description: description || `Target segment for ${groupName}`,
    });

    setGroupName("");
    setDescription("");
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Target Groups & Cohorts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
              {groups.length} Active Groups
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize student cohorts for targeted circulars and instant personalized delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Group</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-slate-700">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Groups created here can be selected directly when publishing notices in Step 4. NoticeIQ automatically matches student profiles to groups and only routes tasks to relevant students.
        </p>
      </div>

      {/* Search Filter */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search target groups by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Groups Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-500" />
                  <span>{group.studentCount.toLocaleString()} Students</span>
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {group.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {group.description || "Active cohort for circular distribution."}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap pt-1">
                {group.department && (
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                    {group.department}
                  </span>
                )}
                {group.year && (
                  <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 font-semibold">
                    {group.year} Year
                  </span>
                )}
                {group.section && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    Sec {group.section}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Created {group.createdAt}</span>
              <button
                type="button"
                onClick={() => alert(`Group '${group.name}' ready for notice broadcast in Step 4.`)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Broadcast</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Create Target Group
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Group Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE • 1st Year • Section A"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Dept</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none"
                  >
                    <option value="all">All Depts</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none"
                  >
                    <option value="all">All Years</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none"
                  >
                    <option value="all">All</option>
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                    <option value="C">Sec C</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Description</label>
                <input
                  type="text"
                  placeholder="e.g. First year Computer Science Section A cohort"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Dynamic Recipient Preview */}
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-sky-900 font-semibold">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>Calculated Audience Size</span>
                </div>
                <span className="font-extrabold text-sky-700 text-sm">
                  {estimatedCount} Students
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm shadow-indigo-600/30"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
