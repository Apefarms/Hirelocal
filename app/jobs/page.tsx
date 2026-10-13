"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function BrowseJobsPage() {
  const router = useRouter();
  const { mockData, candidateSession, isHydrated } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  if (!isHydrated) return <FullPageLoader />;

  // Filter jobs based on search terms
  const filteredJobs = mockData.jobs.filter((job) => {
    const matchesSearch =
      !searchQuery.trim() ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some((req) =>
        req.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesLocation =
      !locationQuery.trim() ||
      job.location.toLowerCase().includes(locationQuery.toLowerCase());

    const matchesTag =
      !selectedTag ||
      job.requirements.some((req) => req.toLowerCase() === selectedTag.toLowerCase());

    return matchesSearch && matchesLocation && matchesTag;
  });

  // Extract top requirement tags across all jobs
  const allTags = Array.from(
    new Set(mockData.jobs.flatMap((j) => j.requirements || []))
  ).slice(0, 10);

  const isApplied = (jobId: string) => {
    return candidateSession?.appliedJobIds?.includes(jobId);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Explore Hyperlocal Jobs
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Find openings near you and apply with 1-click
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-card p-4 sm:p-5 mb-6 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by job title, skill, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="sm:w-64">
          <Input
            type="text"
            placeholder="Location (e.g. Mumbai, Sri City)"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
          />
        </div>

        {(searchQuery || locationQuery || selectedTag) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery("");
              setLocationQuery("");
              setSelectedTag(null);
            }}
            className="text-xs shrink-0"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Popular Tags / Filters */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Popular:</span>
          {allTags.map((tag) => {
            const active = selectedTag?.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(active ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  active
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Job Feed */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Available Positions ({filteredJobs.length})
        </h2>
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Try adjusting your search keywords or location filters."
          action={
            <Button
              onClick={() => {
                setSearchQuery("");
                setLocationQuery("");
                setSelectedTag(null);
              }}
              variant="secondary"
            >
              Reset Search Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const applied = isApplied(job.id);

            return (
              <Card key={job.id} hover={true} className="p-5 sm:p-6 transition-all border border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl">
                        {job.title}
                      </h3>
                      <Badge variant="info" className="text-xs">
                        {job.salary}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
                      {job.company} • <span className="text-slate-500">{job.location}</span>
                    </p>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Requirements / Tags */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.requirements.map((req) => (
                          <Badge key={req} variant="neutral">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {job.extraMessage && (
                      <div className="mt-2.5 flex items-start gap-1.5 text-xs text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 px-2.5 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/40">
                        <span className="shrink-0">📢</span>
                        <p className="line-clamp-1 font-medium">
                          <span className="font-bold">HR Note:</span> {job.extraMessage}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400">
                      Posted {job.postedDate}
                    </p>

                    {applied ? (
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-semibold text-xs border border-emerald-200/60 dark:border-emerald-800">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Applied
                      </div>
                    ) : (
                      <Button
                        onClick={() => router.push(`/apply?job=${job.id}`)}
                        variant="primary"
                        size="md"
                      >
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
