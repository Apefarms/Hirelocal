"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession, type Candidate, type Application } from "@/context/SessionContext";
import { Card } from "@/components/ui/Card";
import { Badge, MatchScoreBadge, ScoreBar } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

type SortOption = "score-desc" | "score-asc" | "name-asc";
type FilterOption = "all" | "applied" | "shortlisted" | "rejected";

export default function HRJobCandidatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = use(params);
  const router = useRouter();
  const { hrSession, mockData, updateApplicationStatus, refetchData, isHydrated } =
    useSession();

  const [sortBy, setSortBy] = useState<SortOption>("score-desc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingUploaded, setDownloadingUploaded] = useState(false);

  useEffect(() => {
    if (isHydrated && !hrSession) {
      router.replace("/hr/login");
    } else if (isHydrated && hrSession) {
      refetchData();
    }
  }, [isHydrated, hrSession, router, refetchData]);

  if (!isHydrated || !hrSession) return <FullPageLoader />;

  const job = mockData.jobs.find((j) => j.id === jobId);
  if (!job) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-10 text-center">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          Job not found
        </h2>
        <Button onClick={() => router.push("/hr/dashboard")} variant="secondary">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const applications = mockData.applications.filter(
    (a) => a.jobId === jobId
  );

  // Apply filters
  const filteredApps =
    filterBy === "all"
      ? applications
      : applications.filter((a) => a.status === filterBy);

  // Apply sort
  const sortedApps = [...filteredApps].sort((a, b) => {
    switch (sortBy) {
      case "score-desc":
        return b.matchScore - a.matchScore;
      case "score-asc":
        return a.matchScore - b.matchScore;
      case "name-asc": {
        const candA = mockData.candidates.find((c) => c.id === a.candidateId);
        const candB = mockData.candidates.find((c) => c.id === b.candidateId);
        return (candA?.name || "").localeCompare(candB?.name || "");
      }
      default:
        return 0;
    }
  });

  const getCandidate = (candidateId: string) =>
    mockData.candidates.find((c) => c.id === candidateId);

  const statusCounts = {
    all: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const hasRealUploadedResume = (cand?: Candidate | null) => {
    if (!cand) return false;
    const path = cand.resume || cand.resumeUrl || "";
    return Boolean(path && path.trim() !== "" && !path.startsWith("/resumes/"));
  };

  const downloadUploadedFile = async (fileUrl: string, candidateName: string) => {
    try {
      setDownloadingUploaded(true);
      if (fileUrl.startsWith("http")) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
        setDownloadingUploaded(false);
        return;
      }
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error("Failed to fetch file");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      const rawExt = fileUrl.includes(".") ? fileUrl.split(".").pop()?.split("?")[0] : "pdf";
      const cleanName = candidateName.replace(/[^a-zA-Z0-9_-]/g, "_").trim() || "Candidate";
      link.download = `${cleanName}_Resume.${rawExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading uploaded resume:", err);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileUrl.split("/").pop() || "resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloadingUploaded(false);
    }
  };

  const downloadCandidateResumePdf = async (candidate: Candidate, appItem?: Application) => {
    try {
      setDownloadingPdf(true);
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      let y = 18;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > 275) {
          doc.addPage();
          y = 16;
        }
      };

      const addSectionHeader = (title: string) => {
        checkPageBreak(12);
        y += 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 58, 138); // Navy Blue
        doc.text(title.toUpperCase(), margin, y);
        y += 1.5;
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.4);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
      };

      // Candidate Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text((candidate.name || "CANDIDATE RESUME").toUpperCase(), margin, y);
      y += 7;

      // Contact Details
      const contactParts = [
        candidate.phone ? `Phone: ${candidate.phone}` : "",
        candidate.email ? `Email: ${candidate.email}` : "",
      ].filter(Boolean);

      if (contactParts.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        doc.text(contactParts.join("   |   "), margin, y);
        y += 6;
      }

      if (job && appItem) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Application for: ${job.title} (${job.company})  •  Match Score: ${appItem.matchScore}%`, margin, y);
        y += 6;
      }

      // Skills
      if (candidate.skills && candidate.skills.length > 0) {
        addSectionHeader("Technical & Professional Skills");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        const skillsText = candidate.skills.join("  •  ");
        const splitSkills = doc.splitTextToSize(skillsText, contentWidth);
        checkPageBreak(splitSkills.length * 5);
        doc.text(splitSkills, margin, y);
        y += splitSkills.length * 5 + 2;
      }

      // Work Experience
      if (candidate.experience) {
        addSectionHeader("Work Experience");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        const expLines = candidate.experience.split("\n").filter(Boolean);
        expLines.forEach((line) => {
          const splitLine = doc.splitTextToSize(line, contentWidth);
          checkPageBreak(splitLine.length * 5);
          doc.text(splitLine, margin, y);
          y += splitLine.length * 5 + 1.5;
        });
        y += 2;
      }

      // Education
      if (candidate.education) {
        addSectionHeader("Education & Qualifications");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        const eduLines = candidate.education.split("\n").filter(Boolean);
        eduLines.forEach((line) => {
          const splitLine = doc.splitTextToSize(line, contentWidth);
          checkPageBreak(splitLine.length * 5);
          doc.text(splitLine, margin, y);
          y += splitLine.length * 5 + 1.5;
        });
        y += 2;
      }

      const filename = `${(candidate.name || "Candidate").replace(/[^a-zA-Z0-9_-]/g, "_")}_Resume.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Could not generate PDF download.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6 sm:py-10">
      {/* Back link */}
      <button
        onClick={() => router.push("/hr/dashboard")}
        className="text-sm text-slate-500 hover:text-primary-600 transition-colors mb-4 cursor-pointer"
      >
        ← Back to Dashboard
      </button>

      {/* Job header */}
      <Card hover={false} className="mb-6 border-l-4 border-l-accent-500">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          {job.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {job.company} • {job.location}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.requirements.map((r) => (
            <Badge key={r} variant="info">
              {r}
            </Badge>
          ))}
        </div>
        {job.extraMessage && (
          <div className="mt-3 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-200">
            <span className="text-sm shrink-0">📢</span>
            <div>
              <span className="font-bold">Candidate Note / Contact Message: </span>
              <span className="whitespace-pre-line">{job.extraMessage}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Filter/Sort bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {(
            [
              ["all", "All"],
              ["applied", "Applied"],
              ["shortlisted", "Shortlisted"],
              ["rejected", "Rejected"],
            ] as [FilterOption, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilterBy(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterBy === value
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {label} ({statusCounts[value]})
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer"
        >
          <option value="score-desc">Score: High → Low</option>
          <option value="score-asc">Score: Low → High</option>
          <option value="name-asc">Name: A → Z</option>
        </select>
      </div>

      {/* Candidate list */}
      {sortedApps.length === 0 ? (
        <EmptyState
          title={filterBy === "all" ? "No applicants yet" : `No ${filterBy} candidates`}
          description={
            filterBy === "all"
              ? "Candidates who apply to this job will appear here."
              : `No candidates have been ${filterBy} for this position.`
          }
        />
      ) : (
        <div className="space-y-3 stagger-children">
          {sortedApps.map((app: any) => {
            const foundCandidate = getCandidate(app.candidateId);
            const rawResume = foundCandidate?.resume || app.candidateResume || foundCandidate?.resumeUrl || app.candidateResumeUrl || "";
            const realResume = rawResume && !rawResume.startsWith("/resumes/") ? rawResume : "";

            const candidate: Candidate = {
              ...(foundCandidate || {}),
              id: app.candidateId,
              name: foundCandidate?.name || app.candidateName || "Candidate",
              phone: foundCandidate?.phone || app.candidatePhone || "",
              email: foundCandidate?.email || app.candidateEmail || "",
              password: foundCandidate?.password || "",
              education: foundCandidate?.education || app.candidateEducation || "",
              experience: foundCandidate?.experience || app.candidateExperience || "",
              skills: foundCandidate?.skills?.length ? foundCandidate.skills : (Array.isArray(app.candidateSkills) ? app.candidateSkills : []),
              resumeUrl: realResume,
              resume: realResume,
              appliedJobIds: foundCandidate?.appliedJobIds || [jobId],
            };

            return (
              <Card key={app.id} hover={false}>
                <div className="flex flex-col gap-3">
                  {/* Top row: name + score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                        {candidate.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
                          {candidate.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {candidate.phone} • {candidate.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={app.status as "applied" | "shortlisted" | "rejected"}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                      <MatchScoreBadge score={app.matchScore} />
                    </div>
                  </div>

                  {/* Score bar */}
                  <ScoreBar score={app.matchScore} />

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.slice(0, 6).map((skill: string) => {
                      const isMatch = job.requirements.some(
                        (r) => r.toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <span
                          key={skill}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            isMatch
                              ? "bg-primary-50 text-primary-700 border border-primary-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {isMatch && "✓ "}
                          {skill}
                        </span>
                      );
                    })}
                    {candidate.skills.length > 6 && (
                      <span className="px-2 py-0.5 rounded-full text-xs text-slate-400 bg-slate-50 border border-slate-200">
                        +{candidate.skills.length - 6} more
                      </span>
                    )}
                  </div>

                  {/* Education & Experience */}
                  {(candidate.education || candidate.experience) && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                      {candidate.education && (
                        <p>
                          <span className="font-medium text-slate-600 dark:text-slate-300">Education:</span>{" "}
                          {candidate.education}
                        </p>
                      )}
                      {candidate.experience && (
                        <p>
                          <span className="font-medium text-slate-600 dark:text-slate-300">Experience:</span>{" "}
                          {candidate.experience}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                    {app.status !== "shortlisted" && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() =>
                          updateApplicationStatus(app.id, "shortlisted")
                        }
                      >
                        ✓ Shortlist
                      </Button>
                    )}
                    {app.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          updateApplicationStatus(app.id, "rejected")
                        }
                      >
                        ✗ Reject
                      </Button>
                    )}
                    {(app.status === "shortlisted" || app.status === "rejected") && (
                      <span className="text-xs text-slate-400 ml-auto">
                        Status updated
                      </span>
                    )}
                    <button
                      type="button"
                      className="ml-auto inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold py-1.5 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setSelectedApp(app);
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Resume
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resume Preview Modal Popup */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => {
            setSelectedCandidate(null);
            setSelectedApp(null);
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Resume Preview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedCandidate.name} • Applicant for {job.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCandidate(null);
                  setSelectedApp(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                aria-label="Close preview"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body: ATS Resume Canvas */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-100/60 dark:bg-slate-950/40">
              {hasRealUploadedResume(selectedCandidate) && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        Uploaded Resume Document Attached
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {(selectedCandidate.resume || selectedCandidate.resumeUrl).split("/").pop()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={selectedCandidate.resume || selectedCandidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm inline-flex items-center gap-1 cursor-pointer"
                  >
                    View Original File ↗
                  </a>
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
                {/* Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
                        {selectedCandidate.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2">
                        {selectedCandidate.phone && <span>📞 {selectedCandidate.phone}</span>}
                        {selectedCandidate.email && <span>✉️ {selectedCandidate.email}</span>}
                      </div>
                    </div>

                    {selectedApp && (
                      <div className="shrink-0 text-right">
                        <MatchScoreBadge score={selectedApp.matchScore} />
                        <p className="text-[10px] text-slate-400 mt-1">Match Score</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2.5">
                      Skills & Proficiencies
                    </h2>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {selectedCandidate.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {selectedCandidate.experience && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2.5">
                      Work Experience
                    </h2>
                    <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed pt-0.5">
                      {selectedCandidate.experience}
                    </div>
                  </div>
                )}

                {/* Education */}
                {selectedCandidate.education && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2.5">
                      Education & Qualifications
                    </h2>
                    <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed pt-0.5">
                      {selectedCandidate.education}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedApp && selectedApp.status !== "shortlisted" && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      updateApplicationStatus(selectedApp.id, "shortlisted");
                      setSelectedApp({ ...selectedApp, status: "shortlisted" });
                    }}
                  >
                    ✓ Shortlist
                  </Button>
                )}
                {selectedApp && selectedApp.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      updateApplicationStatus(selectedApp.id, "rejected");
                      setSelectedApp({ ...selectedApp, status: "rejected" });
                    }}
                  >
                    ✗ Reject
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSelectedCandidate(null);
                    setSelectedApp(null);
                  }}
                >
                  Close
                </Button>
                {hasRealUploadedResume(selectedCandidate) && (
                  <button
                    type="button"
                    disabled={downloadingUploaded}
                    onClick={() => {
                      const resumePath = selectedCandidate.resume || selectedCandidate.resumeUrl;
                      if (resumePath) {
                        downloadUploadedFile(resumePath, selectedCandidate.name);
                      }
                    }}
                    className="px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {downloadingUploaded ? (
                      <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>📄</span>
                    )}
                    <span>Download Uploaded File</span>
                  </button>
                )}
                <Button
                  size="sm"
                  variant="primary"
                  loading={downloadingPdf}
                  onClick={() => downloadCandidateResumePdf(selectedCandidate, selectedApp || undefined)}
                  className="flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download ATS PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
