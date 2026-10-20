"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function HRDashboardPage() {
  const router = useRouter();
  const { hrSession, mockData, refetchData, isHydrated } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");

  useEffect(() => {
    if (isHydrated && !hrSession) {
      router.replace("/hr/login");
    } else if (isHydrated && hrSession) {
      refetchData();
    }
  }, [isHydrated, hrSession, router, refetchData]);

  const myJobs = useMemo(() => {
    if (!hrSession) return [];
    return mockData.jobs.filter((j) => hrSession.jobIds.includes(j.id));
  }, [mockData.jobs, hrSession]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(myJobs.map((j) => j.location.trim()))).filter(Boolean);
  }, [myJobs]);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return myJobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        (job.description && job.description.toLowerCase().includes(q)) ||
        job.requirements.some((r) => r.toLowerCase().includes(q));

      const matchesLocation =
        selectedLocation === "all" ||
        job.location.toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesLocation;
    });
  }, [myJobs, searchQuery, selectedLocation]);

  if (!isHydrated || !hrSession) return <FullPageLoader />;

  const getApplicantCount = (jobId: string) =>
    mockData.applications.filter((a) => a.jobId === jobId).length;

  const getStatusCounts = (jobId: string) => {
    const apps = mockData.applications.filter((a) => a.jobId === jobId);
    return {
      applied: apps.filter((a) => a.status === "applied").length,
      shortlisted: apps.filter((a) => a.status === "shortlisted").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
    };
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6 sm:py-10">
      {/* Revoked Access Banner */}
      {hrSession.status === "rejected" && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200 text-sm flex items-start gap-3 shadow-sm animate-fade-in">
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <h3 className="font-bold">Account Access Revoked</h3>
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5 leading-relaxed">
              Your HR account access has been revoked by the Administrator. You cannot post new jobs or modify listings. Please contact the administrator to restore your access.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              HR Dashboard
            </h1>
            {hrSession.status === "rejected" && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200">
                Access Revoked
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, {hrSession.name} • {hrSession.company}
          </p>
        </div>

        {hrSession.status !== "rejected" && (
          <Button
            onClick={() => router.push("/hr/jobs/new")}
            variant="primary"
            size="md"
            className="shrink-0 flex items-center gap-1.5 shadow-md shadow-primary-600/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post New Job
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card hover={false} className="text-center p-4">
          <p className="text-2xl font-bold text-primary-600">
            {myJobs.length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Active Jobs</p>
        </Card>
        <Card hover={false} className="text-center p-4">
          <p className="text-2xl font-bold text-accent-600">
            {myJobs.reduce((sum, j) => sum + getApplicantCount(j.id), 0)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Total Applicants</p>
        </Card>
        <Card hover={false} className="text-center p-4">
          <p className="text-2xl font-bold text-success">
            {myJobs.reduce((sum, j) => sum + getStatusCounts(j.id).shortlisted, 0)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Shortlisted</p>
        </Card>
      </div>

      {/* Job Cards Header & List */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          Your Job Postings
        </h2>
      </div>

      {/* Search & Filter Bar */}
      {myJobs.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search jobs by title, location, skill, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Clear search query"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Location Filter Dropdown */}
            {uniqueLocations.length > 1 && (
              <div className="sm:w-52">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 cursor-pointer"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Active Filter Indicators & Count */}
          {(searchQuery || selectedLocation !== "all") && (
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
              <span>
                Showing <strong>{filteredJobs.length}</strong> of <strong>{myJobs.length}</strong> jobs
                {selectedLocation !== "all" && (
                  <span className="ml-1 text-slate-600 dark:text-slate-300">
                    in &ldquo;{selectedLocation}&rdquo;
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLocation("all");
                }}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {myJobs.length === 0 ? (
        <EmptyState
          title="No jobs posted"
          description="You haven't posted any jobs yet. Create your first job listing to start receiving applications!"
          action={
            <Button
              onClick={() => router.push("/hr/jobs/new")}
              variant="accent"
              className="mt-2"
            >
              + Post Your First Job
            </Button>
          }
        />
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-10 px-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="font-semibold text-slate-800 dark:text-white text-base">
            No matching jobs found
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            No posted jobs match your current search or location filter. Try a different keyword or reset filters.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedLocation("all");
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {filteredJobs.map((job) => {
            const count = getApplicantCount(job.id);
            const statusCounts = getStatusCounts(job.id);

            return (
              <Card
                key={job.id}
                onClick={() => router.push(`/hr/jobs/${job.id}`)}
                className="group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-primary-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {job.location} • Posted{" "}
                      {new Date(job.postedDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.requirements.slice(0, 3).map((r) => (
                        <Badge key={r} variant="neutral">
                          {r}
                        </Badge>
                      ))}
                      {job.requirements.length > 3 && (
                        <Badge variant="neutral">
                          +{job.requirements.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-900/30">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                        {count}
                      </span>
                    </div>
                    {count > 0 && (
                      <div className="flex gap-2 mt-2 text-xs">
                        {statusCounts.shortlisted > 0 && (
                          <span className="text-emerald-600">{statusCounts.shortlisted} ✓</span>
                        )}
                        {statusCounts.rejected > 0 && (
                          <span className="text-red-400">{statusCounts.rejected} ✗</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow hint */}
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-slate-400 group-hover:text-primary-500 transition-colors">
                    View candidates →
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
