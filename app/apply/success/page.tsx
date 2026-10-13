"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ApplySuccessPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm text-center animate-scale-in">
        <Card hover={false} className="p-8">
          {/* Animated checkmark */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: 0,
                  animation: "checkmark 0.6s ease-out 0.2s both",
                }}
              />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Applied Successfully! 🎉
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Your application has been submitted. The HR team will review it and reach out if you&apos;re shortlisted.
          </p>

          <div className="space-y-3">
            <Link href="/candidate/applications">
              <Button fullWidth variant="primary">
                View My Applications
              </Button>
            </Link>
            <Link href="/">
              <Button fullWidth variant="secondary" className="mt-2">
                Browse More Jobs
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
