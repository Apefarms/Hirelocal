import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium mb-1.5 transition-colors ${
            error
              ? "text-red-600 dark:text-red-400 font-semibold"
              : "text-slate-700 dark:text-slate-300"
          }`}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all duration-200 focus:outline-none ${
          error
            ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/30 bg-red-50/30 dark:bg-red-950/20"
            : "border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Textarea variant
   ═══════════════════════════════════════════ */

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium mb-1.5 transition-colors ${
            error
              ? "text-red-600 dark:text-red-400 font-semibold"
              : "text-slate-700 dark:text-slate-300"
          }`}
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all duration-200 focus:outline-none resize-y min-h-[80px] ${
          error
            ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/30 bg-red-50/30 dark:bg-red-950/20"
            : "border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}
