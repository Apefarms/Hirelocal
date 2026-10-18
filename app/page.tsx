"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const { candidateSession, hrSession, isHydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (candidateSession) {
      router.replace("/jobs");
    } else if (hrSession) {
      router.replace("/hr/dashboard");
    }
  }, [candidateSession, hrSession, isHydrated, router]);

  if (!isHydrated) return <FullPageLoader />;
  if (candidateSession || hrSession) return <FullPageLoader />;

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8 gradient-hero-subtle relative overflow-hidden">
        <div className="max-w-lg w-full text-center relative z-10 animate-fade-in my-auto">
          {/* Brand icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 shadow-lg shadow-primary-500/30 mb-6">
            <span className="text-white font-black text-3xl select-none">S</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Find Local Jobs,{" "}
            <span className="text-primary-600">Fast</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
            This is the right time to Bridge your career with Hr to Get your Dream job ASAP!
          </p>

          <div className="mb-8">
            <Button onClick={() => router.push("/jobs")} variant="primary" size="lg" className="w-full sm:w-auto px-8 shadow-lg shadow-primary-500/20">
              Browse All Jobs →
            </Button>
          </div>

          {/* CTA Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            {/* Candidate CTA */}
            <Link href="/candidate/login" className="group block">
              <div className="glass-card p-5 text-center transition-all duration-300 group-hover:border-primary-300 group-hover:shadow-primary-100/50">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-slate-800 dark:text-white text-sm">
                  Candidate Sign In
                </h2>
              </div>
            </Link>

            {/* HR CTA */}
            <Link href="/hr/login" className="group block">
              <div className="glass-card p-5 text-center transition-all duration-300 group-hover:border-accent-300 group-hover:shadow-accent-100/50">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-accent-50 dark:bg-accent-900/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="font-semibold text-slate-800 dark:text-white text-sm">
                  HR Employer Sign In
                </h2>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer Attribution */}
        <footer className="w-full text-center relative z-10 pt-8 pb-3 mt-auto">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">
            Made by — <span className="font-semibold text-slate-800 dark:text-slate-200">APE Tech</span>
          </p>
        </footer>
      </section>
    </div>
  );
}
