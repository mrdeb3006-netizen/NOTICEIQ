import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "white";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  href?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      href,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-xl active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5",
      md: "text-sm px-5 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5 font-semibold",
    };

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white hover:brightness-105 border border-white/25 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 focus-visible:ring-indigo-500",
      secondary:
        "bg-white/60 backdrop-blur-md text-slate-800 hover:bg-white/85 border border-white/80 shadow-xs focus-visible:ring-slate-400",
      outline:
        "bg-white/50 backdrop-blur-md text-slate-700 border border-white/80 hover:bg-white/80 hover:border-slate-300 shadow-xs focus-visible:ring-slate-300",
      ghost:
        "text-slate-600 hover:text-slate-900 hover:bg-white/50 backdrop-blur-xs focus-visible:ring-slate-300",
      white:
        "bg-white/90 backdrop-blur-md text-indigo-600 hover:bg-white border border-white shadow-sm focus-visible:ring-white",
    };

    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

    if (href) {
      return (
        <Link href={href} className={combinedClassName}>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClassName}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
