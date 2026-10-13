"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function HRSignupPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <HRSignupContent />
    </Suspense>
  );
}

function HRSignupContent() {
  const router = useRouter();
  const { signupHR } = useSession();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Full name is required");
      return;
    }
    if (!company.trim()) {
      setError("Company name is required");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!email.trim()) {
      setError("Work email is required");
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
      const result = signupHR(
        name.trim(),
        company.trim(),
        phone.replace(/\D/g, ""),
        email.trim(),
        password
      );

      if (typeof result === "string") {
        setError(result);
        setLoading(false);
        return;
      }

      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-10 gradient-hero-subtle">
        <div className="w-full max-w-md animate-scale-in">
          <Card hover={false} className="p-6 sm:p-8 text-center shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center text-3xl shadow-sm">
              ⏳
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              HR Account Request Submitted!
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Thank you, <strong className="text-slate-900 dark:text-white">{name}</strong>. Your HR registration request for <strong className="text-slate-900 dark:text-white">{company}</strong> has been submitted to the Admin for assignment.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2 mb-6 text-left">
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5">
                <span className="text-slate-400">Company Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{company}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5">
                <span className="text-slate-400">Contact Person:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5">
                <span className="text-slate-400">Work Email:</span>
                <span>{email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5">
                <span className="text-slate-400">Mobile Number:</span>
                <span>{phone}</span>
              </div>
              <div className="flex justify-between pt-0.5 items-center">
                <span className="text-slate-400">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                  Pending Admin Assignment
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              You will be able to log in to post jobs once the Administrator verifies and assigns your account.
            </p>

            <div className="space-y-2.5">
              <Button fullWidth size="lg" onClick={() => router.push("/hr/login")}>
                Go to HR Login →
              </Button>
              <Button fullWidth size="md" variant="ghost" onClick={() => router.push("/")}>
                Return to Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10 gradient-hero-subtle">
      <div className="w-full max-w-sm animate-scale-in">
        <Card hover={false} className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent-50 dark:bg-accent-900/40 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Create HR Account
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sign up to post jobs & hire top local talent
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Rajesh Khanna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Input
              label="Company Name"
              type="text"
              placeholder="FastTrack Logistics"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
            />
            <Input
              label="Work Email"
              type="email"
              placeholder="rajesh@fasttrack.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

            <Button type="submit" variant="accent" fullWidth size="lg" loading={loading}>
              Create HR Account
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an HR account?{" "}
              <Link
                href="/hr/login"
                className="font-semibold text-accent-600 hover:text-accent-700 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
