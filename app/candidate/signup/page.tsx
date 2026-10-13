"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function CandidateSignupPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <CandidateSignupContent />
    </Suspense>
  );
}

function CandidateSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  const { signupCandidate } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Full name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result = signupCandidate(
        name.trim(),
        email.trim(),
        phone.replace(/\D/g, ""),
        password
      );

      if (typeof result === "string") {
        // Error message returned
        setError(result);
        setLoading(false);
        return;
      }

      // Signup successful
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Create Account
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sign up to start applying for jobs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Input
              label="Email"
              type="email"
              placeholder="rahul@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href={jobId ? `/candidate/login?job=${jobId}` : "/candidate/login"}
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Login
              </Link>
            </p>
          </div>

          {/* Job context hint */}
          {jobId && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-center text-slate-400">
                You&apos;ll be redirected to the job application after signup
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
