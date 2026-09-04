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
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos(null);
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex flex-col select-none cursor-pointer group py-1 px-2 rounded-lg transition-all duration-300 ${className}`}
    >
      {/* Dynamic Cursor Reactive Iridescent Shimmer Aura */}
      {isHovered && mousePos && (
        <div
          className="absolute pointer-events-none transition-all duration-300 -inset-1 rounded-xl blur-lg opacity-50"
          style={{
            background: `radial-gradient(circle 50px at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.35) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)`,
          }}
        />
      )}

      {/* Official Minimalist Transparent Wordmark (Never turns solid white) */}
      <span
        className={`font-bold uppercase transition-all duration-300 ${sizeClasses[size]} relative z-10`}
        style={
          isHovered && mousePos
            ? {
                background: `radial-gradient(circle 80px at ${mousePos.x}px ${mousePos.y}px, rgba(165, 180, 252, 0.9) 0%, rgba(192, 132, 252, 0.75) 35%, rgba(226, 232, 240, 0.6) 70%, rgba(255, 255, 255, 0.35) 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }
            : {
                background:
                  "linear-gradient(135deg, rgba(241, 245, 249, 0.8) 0%, rgba(148, 163, 184, 0.55) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }
        }
      >
        NOTICE<span className="font-light text-indigo-400/80">IQ</span>
      </span>

      {subtext && (
        <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-slate-500 group-hover:text-indigo-400/80 transition-colors duration-200 mt-0.5">
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
