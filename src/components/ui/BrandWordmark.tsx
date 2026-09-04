"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";

interface BrandWordmarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
  subtext?: boolean;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  size = "md",
  href = "/",
  className = "",
  subtext = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>("translate3d(0, 0, 0)");

  // Subtle physics micro-reaction to cursor without changing any text color
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Micro-tilt physics (subtle 2px max movement)
    setTransformStyle(`translate3d(${x * 0.08}px, ${y * 0.08}px, 0)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle("translate3d(0, 0, 0)");
  };

  const sizeClasses = {
    sm: "text-base tracking-[0.2em]",
    md: "text-lg tracking-[0.22em]",
    lg: "text-2xl tracking-[0.25em]",
    xl: "text-4xl tracking-[0.28em]",
  };

  const content = (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: "transform 0.15s cubic-bezier(0.2, 0, 0, 1)",
      }}
      className={`relative inline-flex flex-col select-none cursor-pointer py-1 px-2 rounded-lg will-change-transform ${className}`}
    >
      {/* Official Minimalist Transparent Wordmark — Completely Stable Text Color */}
      <span className={`font-bold uppercase ${sizeClasses[size]} select-none`}>
        <span className="text-slate-300/80">NOTICE</span>
        <span className="font-light text-indigo-400/90 ml-0.5">IQ</span>
      </span>

      {subtext && (
        <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-slate-500 mt-0.5">
          Action Platform
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};
