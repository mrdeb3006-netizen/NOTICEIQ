import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      className = "",
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 tracking-wide uppercase"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative rounded-xl shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            required={required}
            className={`w-full bg-white/70 backdrop-blur-md text-slate-900 placeholder:text-slate-400 text-sm rounded-xl border transition-all duration-150
              ${leftIcon ? "pl-10" : "pl-3.5"}
              ${rightIcon ? "pr-10" : "pr-3.5"}
              py-2.5
              ${
                error
                  ? "border-rose-300/90 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/40"
                  : "border-white/80 hover:border-indigo-200 focus:border-indigo-500 focus:bg-white/90 focus:ring-3 focus:ring-indigo-500/15"
              }
              disabled:bg-slate-100/50 disabled:text-slate-400 disabled:cursor-not-allowed
              outline-none
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
