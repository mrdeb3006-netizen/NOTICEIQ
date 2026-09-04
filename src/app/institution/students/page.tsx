"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Mail,
  GraduationCap,
  School,
  X,
  FileSpreadsheet,
  Check,
  Building,
  MoreHorizontal,
  Info,
} from "lucide-react";
import { useInstitutionData } from "@/lib/institutionStore";
import { Student } from "@/types/institution";

export default function StudentsManagementPage() {
  const { institution, students, addStudent, addMultipleStudents } = useInstitutionData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  // Add Student Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [newDept, setNewDept] = useState("CSE");
  const [newClass, setNewClass] = useState("Class 10");
  const [newYear, setNewYear] = useState("1st");
  const [newSection, setNewSection] = useState("A");
  const [newRoll, setNewRoll] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // CSV Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isSimulatingImport, setIsSimulatingImport] = useState(false);
  const [importPreviewReady, setImportPreviewReady] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Institution mode
  const isCollege = institution?.type === "college";
  const registeredDomain = institution?.emailDomain || "@futurecollege.ac.in";
  const studentPrefix = institution?.studentIdPrefix || "SCH2026";

  // Real-time Email Domain Verification
  const isEmailValidDomain =
    newEmail.trim() !== "" &&
    newEmail.toLowerCase().endsWith(registeredDomain.toLowerCase().replace(/^@/, "@"));

  // Filtering Logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      selectedDept === "all" ||
      (isCollege ? s.department === selectedDept : s.class === selectedDept);

    const matchesYear = selectedYear === "all" || s.year === selectedYear;
    const matchesSection = selectedSection === "all" || s.section === selectedSection;
    const matchesStatus = selectedStatus === "all" || s.status === selectedStatus;

    return matchesSearch && matchesDept && matchesYear && matchesSection && matchesStatus;
  });

  // Handle Add Student Submit
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newName.trim()) {
      setFormError("Student full name is required.");
      return;
    }

    if (isCollege) {
      if (!newEmail.trim()) {
        setFormError("Official college email is required.");
        return;
      }
      if (!isEmailValidDomain) {
        setFormError(`Email must end with registered domain: ${registeredDomain}`);
        return;
      }
    } else {
      if (!newStudentId.trim()) {
        setFormError("Student ID is required.");
        return;
      }
    }

    addStudent({
      name: newName,
      email: isCollege ? newEmail : undefined,
      studentId: isCollege ? undefined : newStudentId,
      department: isCollege ? newDept : undefined,
      class: isCollege ? undefined : newClass,
      year: isCollege ? newYear : undefined,
      section: newSection,
      rollNumber: newRoll || `${isCollege ? newDept : "SCH"}-${Math.floor(100 + Math.random() * 900)}`,
      status: "active",
    });

    // Reset and close
    setNewName("");
    setNewEmail("");
    setNewStudentId("");
    setNewRoll("");
    setShowAddModal(false);
  };

  // Handle CSV Simulation
  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setIsSimulatingImport(true);
      setTimeout(() => {
        setIsSimulatingImport(false);
        setImportPreviewReady(true);
      }, 600);
    }
  };

  const handleConfirmImport = () => {
    // Generate simulated imported records
    const simulated = [
      {
        name: "Arjun Chakraborty",
        email: `arjun.c${registeredDomain}`,
        studentId: `${studentPrefix}0099`,
        department: "CSE",
        class: "Class 10",
        year: "1st",
        section: "A",
        rollNumber: "CSE-26-101",
        status: "active" as const,
      },
      {
        name: "Ishita Ganguly",
        email: `ishita.g${registeredDomain}`,
        studentId: `${studentPrefix}0100`,
        department: "IT",
        class: "Class 10",
        year: "1st",
        section: "B",
        rollNumber: "IT-26-102",
        status: "active" as const,
      },
    ];

    addMultipleStudents(simulated);
    setImportSuccess("Successfully imported 98 students into your institution workspace!");
    setTimeout(() => {
      setImportSuccess(null);
      setShowImportModal(false);
      setImportPreviewReady(false);
      setImportFile(null);
    }, 1500);
  };

  // CSV Template download simulator
  const handleDownloadTemplate = () => {
    const csvContent = isCollege
      ? "Name,Email,Department,Year,Section,RollNumber\nJohn Doe,john@futurecollege.ac.in,CSE,1st,A,CSE-26-001"
      : "Name,StudentID,Class,Section,RollNumber\nJohn Doe,SCH20260001,Class 10,A,101";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `NoticeIQ_Student_Template_${isCollege ? "College" : "School"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Students Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {students.length.toLocaleString()} Total Students
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage enrolled student accounts, department cohorts, and access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Student</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Students</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setExportNotice(true);
              setTimeout(() => setExportNotice(false), 2000);
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Exporting student directory (CSV) for {institution?.name}...</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search students by name, email, roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-xs"
            />
          </div>

          {/* Department / Class Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs outline-none focus:border-indigo-500 transition-all"
            >
              <option value="all">All {isCollege ? "Departments" : "Classes"}</option>
              {isCollege ? (
                <>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                </>
              ) : (
                <>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </>
              )}
            </select>
          </div>

          {/* Year / Section Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs outline-none focus:border-indigo-500 transition-all"
            >
              <option value="all">All Years</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs outline-none focus:border-indigo-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">{isCollege ? "College Email" : "Student ID"}</th>
                <th className="px-5 py-3.5">{isCollege ? "Department" : "Class"}</th>
                {isCollege && <th className="px-5 py-3.5">Year</th>}
                <th className="px-5 py-3.5">Section</th>
                <th className="px-5 py-3.5">Roll Number</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{student.name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-700">
                      {isCollege ? (
                        <span className="text-indigo-600">{student.email || "—"}</span>
                      ) : (
                        <span className="text-slate-800 font-bold">{student.studentId || "—"}</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {isCollege ? student.department : student.class}
                    </td>

                    {isCollege && (
                      <td className="px-5 py-3.5 text-slate-600">
                        {student.year ? `${student.year} Year` : "—"}
                      </td>
                    )}

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {student.section}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                      {student.rollNumber}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          student.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : student.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            student.status === "active"
                              ? "bg-emerald-500"
                              : student.status === "pending"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {student.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Viewing details for ${student.name}`)}
                        className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <p className="font-semibold text-sm text-slate-600">No students found matching your filters.</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing search terms or adding new students.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Summary */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          <span className="text-[11px] text-slate-400">Demo student dataset active</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD STUDENT MODAL                                                         */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Add New Student ({isCollege ? "College" : "School"})
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-4 text-left">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Student Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Debendra Bera"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* College Email with Live Domain Validation */}
              {isCollege ? (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    College Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={`e.g. debendra${registeredDomain}`}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-indigo-500 transition-all"
                  />

                  {/* Validation Feedback */}
                  {newEmail.length > 3 && (
                    <div className="pt-1">
                      {isEmailValidDomain ? (
                        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ✓ Institution email verified ({registeredDomain})
                        </p>
                      ) : (
                        <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          ⚠️ Use an email belonging to registered domain: <strong>{registeredDomain}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* School Student ID */
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Student ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCH20260088"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:border-indigo-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-500">
                    Student ID must be unique within this institution.
                  </p>
                </div>
              )}

              {/* Department/Class & Section */}
              <div className="grid grid-cols-2 gap-3">
                {isCollege ? (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none"
                    >
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="ME">ME</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Class</label>
                    <select
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none"
                    >
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>
                )}

                {isCollege ? (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Year</label>
                    <select
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none"
                    >
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Section</label>
                    <select
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Section & Roll Number for College */}
              {isCollege && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Section</label>
                    <select
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Roll Number</label>
                    <input
                      type="text"
                      placeholder="CSE-26-009"
                      value={newRoll}
                      onChange={(e) => setNewRoll(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm shadow-indigo-600/30"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMPORT STUDENTS CSV MODAL                                                 */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Upload Student List (CSV)
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {importSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-900">Import Complete</h4>
                <p className="text-xs text-emerald-700">{importSuccess}</p>
              </div>
            ) : (
              <>
                {/* Example format table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Accepted Format Structure
                    </span>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download CSV Template</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 overflow-x-auto">
                    {isCollege
                      ? "Name | Email | Department | Year | Section"
                      : "Name | Student ID | Class | Section | Roll Number"}
                  </div>
                </div>

                {/* Upload Box */}
                {!importPreviewReady ? (
                  <label className="p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors flex flex-col items-center justify-center cursor-pointer text-center space-y-2 bg-slate-50/50">
                    <Upload className="w-8 h-8 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-900">
                      {isSimulatingImport ? "Analyzing CSV format..." : "Click to select CSV student file"}
                    </span>
                    <p className="text-[11px] text-slate-500">Supports .csv, .xlsx up to 5MB</p>
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleSimulateUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  /* Validation Preview */
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Preview Imported Students</span>
                        <span className="text-[11px] text-slate-500">{importFile?.name || "students_batch.csv"}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>✓ 98 valid records</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>⚠️ 2 need attention</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                    >
                      Import Students (98 Records)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
