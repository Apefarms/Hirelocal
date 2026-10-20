"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function HRLoginPage() {
  const router = useRouter();
  const { loginHR, hrSession, isHydrated } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isHydrated && hrSession) {
      router.replace("/hr/dashboard");
    }
  }, [isHydrated, hrSession, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = loginHR(email.trim(), password);
      if (result === "rejected") {
        setError("Your HR account access has been revoked by the Administrator.");
        setLoading(false);
        return;
      }
      if (!result) {
        setError("Invalid credentials or no HR account found with this email.");
        setLoading(false);
        return;
      }
      router.push("/hr/dashboard");
    }, 500);
  };

  if (!isHydrated) return <FullPageLoader />;

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
              HR Login
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sign in to manage your job postings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="hr@company.com"
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
              Sign In
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an HR account?{" "}
              <Link
                href="/hr/signup"
                className="font-semibold text-accent-600 hover:text-accent-700 transition-colors"
              >
                Create HR Account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
