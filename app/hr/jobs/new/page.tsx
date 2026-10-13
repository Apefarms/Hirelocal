"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function PostNewJobPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <PostNewJobContent />
    </Suspense>
  );
}

function PostNewJobContent() {
  const router = useRouter();
  const { hrSession, postJob, isHydrated } = useSession();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [extraMessage, setExtraMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isHydrated && !hrSession) {
      router.replace("/hr/login");
    }
  }, [isHydrated, hrSession, router]);

  if (!isHydrated || !hrSession) return <FullPageLoader />;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !requirements.includes(trimmed)) {
      setRequirements([...requirements, trimmed]);
      setTagInput("");
    }
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setRequirements(requirements.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Job Title is required");
      return;
    }
    if (!location.trim()) {
      setError("Job Location is required");
      return;
    }
    if (!description.trim()) {
      setError("Job Description is required");
      return;
    }

    setLoading(true);

    try {
      const newJob = await postJob({
        title: title.trim(),
        location: location.trim(),
        salary: salary.trim() || "Negotiable",
        description: description.trim(),
        requirements,
        extraMessage: extraMessage.trim() || undefined,
      });

      if (newJob) {
        router.push("/hr/dashboard");
      } else {
        setError("Failed to create job posting. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6 sm:py-10">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/hr/dashboard"
          className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <Card hover={false} className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Post a New Job
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Posting for <span className="font-semibold text-primary-600">{hrSession.company}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Job Title"
            type="text"
            placeholder="e.g. Accounts Executive, Warehouse Manager"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              type="text"
              placeholder="e.g. Andheri West, Mumbai"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              label="Salary Range"
              type="text"
              placeholder="e.g. ₹18,000 - ₹25,000/month"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Job Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe the job roles, day-to-day responsibilities, shift timings, and perks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Key Requirements & Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a skill (e.g. Tally ERP, GST, Excel) and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button type="button" variant="secondary" onClick={handleAddTag}>
                Add Skill
              </Button>
            </div>

            {/* Added requirements tags */}
            {requirements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                {requirements.map((req) => (
                  <Badge key={req} variant="info" className="gap-1 pr-1">
                    {req}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(req)}
                      className="ml-1 text-primary-400 hover:text-primary-700 focus:outline-none"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Message (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Message"
              value={extraMessage}
              onChange={(e) => setExtraMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/hr/dashboard")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="lg" loading={loading}>
              Post Job Now
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
