"use client";

import React from "react";
import { TaskQuadrant } from "@/types/student";
import { QUADRANT_CONFIG } from "@/lib/priorityEngine";

interface PriorityBadgeProps {
  quadrant: TaskQuadrant;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  quadrant,
  size = "md",
  showDescription = false,
  className = "",
}) => {
  const config = QUADRANT_CONFIG[quadrant] || QUADRANT_CONFIG.Q4;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm",
  };

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-xl font-extrabold tracking-wide border shadow-2xs transition-all ${
          sizeClasses[size]
        } ${
          quadrant === "Q1"
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : quadrant === "Q2"
            ? "bg-amber-50 text-amber-800 border-amber-200"
            : quadrant === "Q3"
            ? "bg-sky-50 text-sky-800 border-sky-200"
            : "bg-slate-100 text-slate-700 border-slate-200"
        }`}
      >
        <span className="text-[10px] sm:text-xs">{config.icon}</span>
        <span>{config.label}</span>
      </span>

      {showDescription && (
        <span className="text-[11px] text-slate-500 font-normal">
          {config.description}
        </span>
      )}
    </div>
  );
};
