"use client";

import React, { useState } from "react";
import { useFacultyData, DEMO_FACULTY_MEMBERS } from "@/lib/facultyStore";
import { UserCheck, ChevronDown, Award, BookOpen } from "lucide-react";

export const FacultyRoleSwitcher: React.FC = () => {
  const { currentFaculty, switchFacultyPersona } = useFacultyData();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all text-left"
        title="Switch Faculty Persona (Demo)"
      >
        <div className="w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
          {currentFaculty.role === "HOD" ? (
            <Award className="w-4 h-4 text-amber-500" />
          ) : (
            <BookOpen className="w-4 h-4 text-indigo-500" />
          )}
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
              {currentFaculty.name}
            </span>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                currentFaculty.role === "HOD"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300/40"
                  : "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-300/40"
              }`}
            >
              {currentFaculty.role}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
            {currentFaculty.designation} • {currentFaculty.department.includes("Computer") ? "CSE" : currentFaculty.department}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Switch Faculty Persona
              </span>
              <p className="text-[10px] text-slate-500">
                Test permissions & dashboard view for different roles
              </p>
            </div>

            <div className="space-y-1">
              {DEMO_FACULTY_MEMBERS.map((fac) => {
                const isSelected = fac.id === currentFaculty.id;
                return (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => {
                      switchFacultyPersona(fac.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        fac.role === "HOD"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300"
                      }`}
                    >
                      {fac.role === "HOD" ? <Award className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {fac.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            fac.role === "HOD"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                              : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                          }`}
                        >
                          {fac.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {fac.designation}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        ID: {fac.facultyId} • {fac.subjects.join(", ")}
                      </p>
                    </div>
                    {isSelected && (
                      <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
