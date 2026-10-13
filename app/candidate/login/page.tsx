"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function CandidateLoginPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <CandidateLoginContent />
    </Suspense>
  );
}

function CandidateLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  const { loginCandidateByEmail } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    // Simulate login delay
    setTimeout(() => {
      const candidate = loginCandidateByEmail(email.trim(), password);
      if (!candidate) {
        setError("No account found with this email. Please sign up first.");
        setLoading(false);
        return;
      }

      if (jobId) {
        router.push(`/apply?job=${jobId}`);
      } else {
        router.push("/candidate/applications");
      }
    }, 500);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10 gradient-hero-subtle">
      <div className="w-full max-w-sm animate-scale-in">
        <Card hover={false} className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Candidate Login
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Login
            </Button>
          </form>

          {/* Sign Up link */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href={jobId ? `/candidate/signup?job=${jobId}` : "/candidate/signup"}
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Job context hint */}
          {jobId && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-center text-slate-400">
                You&apos;ll be redirected to the job application after login
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
