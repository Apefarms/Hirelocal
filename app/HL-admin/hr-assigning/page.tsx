"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, type HRUser } from "@/context/SessionContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function HRAssigningPage() {
  const router = useRouter();
  const { mockData, assignHR, rejectHR, isHydrated, refetchData } = useSession();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [filterTab, setFilterTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [actionNotice, setActionNotice] = useState<{ message: string; type: "success" | "danger" } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hirelocal_admin_session");
    if (saved === "authenticated") {
      setIsAdminAuthenticated(true);
    } else {
      router.replace("/HL-admin");
    }
    setCheckingAuth(false);
  }, [router]);

  if (!isHydrated || checkingAuth || !isAdminAuthenticated) {
    return <FullPageLoader />;
  }

  const allHRs = mockData.hrUsers || [];
  const pendingHRs = allHRs.filter((h) => h.status === "pending");
  const approvedHRs = allHRs.filter((h) => h.status !== "pending" && h.status !== "rejected");
  const rejectedHRs = allHRs.filter((h) => h.status === "rejected");

  const displayedHRs =
    filterTab === "pending"
      ? pendingHRs
      : filterTab === "approved"
      ? approvedHRs
      : filterTab === "rejected"
      ? rejectedHRs
      : allHRs;

  const handleAssign = async (hr: HRUser) => {
    setProcessingId(hr.id);
    const ok = await assignHR(hr.id);
    setProcessingId(null);
    if (ok) {
      setActionNotice({
        message: `✔ Successfully assigned & approved HR account for ${hr.name} (${hr.company}). HR can now log in and post jobs.`,
        type: "success",
      });
      if (refetchData) refetchData();
    }
  };

  const handleReject = async (hr: HRUser) => {
    setProcessingId(hr.id);
    const ok = await rejectHR(hr.id);
    setProcessingId(null);
    if (ok) {
      setActionNotice({
        message: `HR registration request for ${hr.company} (${hr.name}) has been rejected.`,
        type: "danger",
      });
      if (refetchData) refetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/HL-admin" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors">
              <span>← Back to Dashboard</span>
            </Link>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                🛡️
              </span>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                HR Assigning Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>ADMIN</span>
            </div>
            <Link href="/HL-admin">
              <Button size="sm" variant="secondary" className="text-xs">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                HR Account Assigning & Verification
              </h1>
              {pendingHRs.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-sm animate-pulse">
                  {pendingHRs.length} Pending
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Review details entered by employers on the &quot;Create HR Account&quot; page. Assign accounts to grant job posting permissions, or reject unauthorized requests.
            </p>
          </div>
        </div>

        {/* Action Notice Banner */}
        {actionNotice && (
          <div
            className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in ${
              actionNotice.type === "success"
                ? "bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
                : "bg-red-50 border border-red-300 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200"
            }`}
          >
            <span>{actionNotice.message}</span>
            <button
              onClick={() => setActionNotice(null)}
              className="text-xs font-bold underline hover:opacity-75 cursor-pointer ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setFilterTab("pending")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              filterTab === "pending"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>Pending Requests</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              filterTab === "pending" ? "bg-amber-700 text-white" : "bg-amber-100 text-amber-800"
            }`}>
              {pendingHRs.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab("approved")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              filterTab === "approved"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>Assigned / Approved HRs</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              filterTab === "approved" ? "bg-emerald-800 text-white" : "bg-emerald-100 text-emerald-800"
            }`}>
              {approvedHRs.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab("rejected")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              filterTab === "rejected"
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>Rejected Requests</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              filterTab === "rejected" ? "bg-red-800 text-white" : "bg-red-100 text-red-800"
            }`}>
              {rejectedHRs.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab("all")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              filterTab === "all"
                ? "bg-slate-800 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>All ({allHRs.length})</span>
          </button>
        </div>

        {/* HR Request Cards Grid */}
        {displayedHRs.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-3xl">
              {filterTab === "pending" ? "🎉" : "📋"}
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {filterTab === "pending"
                ? "No pending HR account requests"
                : `No ${filterTab} HR accounts found`}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {filterTab === "pending"
                ? "When someone registers on the Create HR Account page, their request will appear here for review."
                : "Switch to other tabs above to view all HR accounts in the portal."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedHRs.map((hr) => {
              const isPending = hr.status === "pending";
              const isApproved = hr.status !== "pending" && hr.status !== "rejected";
              const isRejected = hr.status === "rejected";
              const isProcessing = processingId === hr.id;

              return (
                <Card
                  key={hr.id}
                  hover={false}
                  className={`p-5 sm:p-6 space-y-4 rounded-2xl transition-all border-2 ${
                    isPending
                      ? "border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/10 shadow-md ring-2 ring-amber-300/20"
                      : isApproved
                      ? "border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-80"
                  }`}
                >
                  {/* Top: Company Header & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0 shadow-sm ${
                        isPending
                          ? "bg-amber-500 text-white"
                          : isApproved
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-400 text-white"
                      }`}>
                        {hr.company.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                          {hr.company}
                        </h2>
                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                          Contact: {hr.name}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                      isPending
                        ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 animate-pulse"
                        : isApproved
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200"
                        : "bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/60 dark:text-red-200"
                    }`}>
                      {isPending ? "Pending Review" : isApproved ? "Assigned / Active" : "Rejected"}
                    </span>
                  </div>

                  {/* Details Grid (From Create HR Account page) */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Company Name:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{hr.company}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Full Name:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{hr.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Work Email:</span>
                      <a href={`mailto:${hr.email}`} className="text-primary-600 hover:underline font-mono">
                        {hr.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Mobile Number:</span>
                      <a href={`tel:${hr.phone}`} className="text-slate-700 dark:text-slate-300 font-mono font-semibold">
                        {hr.phone || "Not provided"}
                      </a>
                    </div>
                    {hr.createdAt && (
                      <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-1.5 text-[11px] text-slate-400">
                        <span>Submitted On:</span>
                        <span>{new Date(hr.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Assign & Reject */}
                  <div className="pt-1">
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <Button
                          fullWidth
                          size="md"
                          loading={isProcessing}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 shadow-sm"
                          onClick={() => handleAssign(hr)}
                        >
                          <span>✓</span> Assign Account
                        </Button>
                        <Button
                          fullWidth
                          size="md"
                          variant="secondary"
                          loading={isProcessing}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900 font-bold text-xs py-2.5"
                          onClick={() => handleReject(hr)}
                        >
                          <span>✗</span> Reject
                        </Button>
                      </div>
                    ) : isRejected ? (
                      <Button
                        fullWidth
                        size="sm"
                        variant="secondary"
                        loading={isProcessing}
                        className="text-primary-600 font-bold text-xs"
                        onClick={() => handleAssign(hr)}
                      >
                        Re-assign (Approve) Account →
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-1">
                        <span>✓ Active & Assigned</span>
                        <button
                          onClick={() => handleReject(hr)}
                          className="text-[11px] text-slate-400 hover:text-red-500 hover:underline cursor-pointer"
                        >
                          Revoke Access
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
