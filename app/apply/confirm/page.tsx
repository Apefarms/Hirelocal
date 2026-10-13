"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function ConfirmApplyPage() {
  const router = useRouter();
  const {
    candidateSession,
    candidateFormData,
    applyingToJobId,
    mockData,
    applyToJob,
    isHydrated,
  } = useSession();

  const [applying, setApplying] = useState(false);

  const job = applyingToJobId
    ? mockData.jobs.find((j) => j.id === applyingToJobId)
    : null;

  useEffect(() => {
    if (isHydrated && !candidateSession) {
      router.replace("/candidate/login");
      return;
    }
    if (isHydrated && (!candidateFormData || !applyingToJobId)) {
      router.replace("/apply");
    }
  }, [isHydrated, candidateSession, candidateFormData, applyingToJobId, router]);

  const handleApply = () => {
    if (!applyingToJobId || !candidateFormData) return;
    setApplying(true);

    setTimeout(() => {
      applyToJob(applyingToJobId, candidateFormData);
      router.push("/apply/success");
    }, 800);
  };

  if (!isHydrated || !candidateSession || !candidateFormData || !job) {
    return <FullPageLoader />;
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6 sm:py-10">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
        Confirm Application
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Review your details before applying
      </p>

      <div className="space-y-4">
        {/* Job Card */}
        <Card hover={false} className="border-l-4 border-l-primary-500">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">
            Applying to
          </p>
          <h2 className="font-bold text-slate-800 dark:text-white">
            {job.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {job.company} • {job.location}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.requirements.map((r) => (
              <Badge key={r} variant="info">
                {r}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Candidate Info Card */}
        <Card hover={false}>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">
            Your Profile
          </p>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-slate-400 w-20 shrink-0 font-medium">Name</span>
              <span className="text-slate-800 dark:text-white">{candidateFormData.name}</span>
            </div>
            {candidateFormData.phone && (
              <div className="flex items-start gap-2">
                <span className="text-slate-400 w-20 shrink-0 font-medium">Phone</span>
                <span className="text-slate-800 dark:text-white">{candidateFormData.phone}</span>
              </div>
            )}
            {candidateFormData.email && (
              <div className="flex items-start gap-2">
                <span className="text-slate-400 w-20 shrink-0 font-medium">Email</span>
                <span className="text-slate-800 dark:text-white">{candidateFormData.email}</span>
              </div>
            )}
            {candidateFormData.education && (
              <div className="flex items-start gap-2">
                <span className="text-slate-400 w-20 shrink-0 font-medium">Education</span>
                <span className="text-slate-800 dark:text-white">{candidateFormData.education}</span>
              </div>
            )}
            {candidateFormData.experience && (
              <div className="flex items-start gap-2">
                <span className="text-slate-400 w-20 shrink-0 font-medium">Experience</span>
                <span className="text-slate-800 dark:text-white">{candidateFormData.experience}</span>
              </div>
            )}
            {candidateFormData.skills.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-slate-400 w-20 shrink-0 font-medium">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {candidateFormData.skills.map((s) => (
                    <Badge key={s} variant="neutral">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 w-20 shrink-0 font-medium">Resume</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-800 dark:text-white font-medium">
                  {candidateFormData.resumeDeliveryChoice === "uploaded" && candidateFormData.uploadedResumePath
                    ? `📄 Uploaded Resume (${candidateFormData.uploadedResumeName || "Attached file"})`
                    : "⚡ Generated ATS Resume"}
                </span>
                {candidateFormData.uploadedResumePath && (
                  <a
                    href={candidateFormData.uploadedResumePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:text-primary-700 underline font-semibold"
                  >
                    View file ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Apply Button */}
      <div className="mt-6 space-y-3">
        <Button fullWidth size="lg" onClick={handleApply} loading={applying}>
          🚀 Apply Now
        </Button>
        <Button
          fullWidth
          size="lg"
          variant="ghost"
          onClick={() => router.back()}
        >
          ← Go Back
        </Button>
      </div>
    </div>
  );
}
