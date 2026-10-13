import React from "react";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-700" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
      </div>
    </div>
  );
}

export function BrandLoadingOverlay({
  message = "Loading...",
  subtext = "HireLocal • Hyperlocal Job Portal",
  fullScreen = true,
}: {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`${
        fullScreen
          ? "fixed inset-0 z-[100] bg-white/85 dark:bg-slate-950/85 backdrop-blur-md"
          : "w-full py-16 flex-1 bg-transparent"
      } flex flex-col items-center justify-center animate-fade-in transition-all select-none`}
      aria-live="polite"
      aria-busy="true"
    >
      {/* Top shimmering progress bar for fullscreen loading */}
      {fullScreen && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden z-[101]">
          <div className="h-full w-full bg-gradient-to-r from-primary-600 via-accent-500 to-primary-400 animate-progress-shimmer" />
        </div>
      )}

      {/* Brand Icon + Glowing Ripple */}
      <div className="relative mb-4 flex items-center justify-center">
        {/* Soft background ambient glow */}
        <div className="absolute -inset-4 rounded-3xl bg-primary-600/15 dark:bg-primary-500/25 blur-xl animate-pulse-soft pointer-events-none" />

        {/* Central Logo Badge */}
        <div className="relative w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-xl shadow-primary-600/35 animate-logo-glow">
          <svg className="w-9 h-9 text-white" viewBox="0 0 32 32" fill="none">
            <path
              d="M10 22V10h3v4.5h6V10h3v12h-3v-5h-6v5h-3z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Brand Text & Indicator */}
      <div className="text-center space-y-2 px-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          HireLocal
        </h2>

        {/* Three bouncing brand dots */}
        <div className="flex items-center justify-center gap-1.5 py-0.5">
          <span
            className="w-2 h-2 rounded-full bg-primary-600 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-primary-600 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-primary-600 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>

        {subtext && (
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

export function FullPageLoader({ subtext }: { subtext?: string }) {
  return (
    <BrandLoadingOverlay
      fullScreen={true}
      message="Loading..."
      subtext={subtext || "HireLocal • Connecting you to local jobs"}
    />
  );
}
