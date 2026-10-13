"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function CandidateApplicationsPage() {
  const { candidateSession, mockData, isHydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !candidateSession) {
      router.replace("/candidate/login");
    }
  }, [isHydrated, candidateSession, router]);

  if (!isHydrated || !candidateSession) return <FullPageLoader />;

  const myApplications = mockData.applications.filter(
    (app) => app.candidateId === candidateSession.id
  );

  const getJob = (jobId: string) => mockData.jobs.find((j) => j.id === jobId);

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          My Applications
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track the status of your job applications
        </p>
      </div>

      {/* Applications list */}
      {myApplications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="You haven't applied to any jobs yet. Browse available positions and apply!"
          action={
            <Button onClick={() => router.push("/jobs")} variant="primary">
              Browse Jobs
            </Button>
          }
        />
      ) : (
        <div className="space-y-3 stagger-children">
          {myApplications.map((app) => {
            const job = getJob(app.jobId);
            if (!job) return null;

            return (
              <Card key={app.id} hover={false}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base">
                        {job.title}
                      </h3>
                      <Badge variant={app.status as "applied" | "shortlisted" | "rejected"}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {job.company} • {job.location}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Applied on {new Date(app.appliedDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Match</p>
                      <p
                        className={`text-lg font-bold ${
                          app.matchScore >= 80
                            ? "text-emerald-600"
                            : app.matchScore >= 60
                              ? "text-amber-500"
                              : "text-red-400"
                        }`}
                      >
                        {app.matchScore}%
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick apply link */}
      <div className="mt-8 text-center">
        <Link
          href="/jobs"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          ← Browse Jobs
        </Link>
      </div>
    </div>
  );
}
