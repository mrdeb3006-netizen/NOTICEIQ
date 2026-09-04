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
      {/* Dynamic Cursor Reactive Glow Halo */}
      {isHovered && mousePos && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300 -inset-1 rounded-xl blur-md opacity-70"
          style={{
            background: `radial-gradient(circle 60px at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.35), transparent 70%)`,
          }}
        />
      )}

      {/* Main Official Minimalist Transparent Wordmark */}
      <span
        className={`font-semibold uppercase transition-all duration-200 ${sizeClasses[size]} relative z-10`}
        style={
          isHovered && mousePos
            ? {
                background: `radial-gradient(circle 90px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 1) 0%, rgba(199, 210, 254, 0.9) 30%, rgba(255, 255, 255, 0.45) 75%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
              }
            : {
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.55) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }
        }
      >
        NOTICE<span className="font-light text-indigo-300/80">IQ</span>
      </span>

      {subtext && (
        <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-slate-500 group-hover:text-indigo-300/70 transition-colors duration-200 mt-0.5">
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
