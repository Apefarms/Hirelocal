"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";

export default function HLAdminPage() {
  const router = useRouter();
  const { mockData, assignHR, rejectHR, isHydrated, refetchData } = useSession();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login Form States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Dashboard Tab
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "candidates" | "hrs">("overview");
  const [actionSuccess, setActionSuccess] = useState("");

  // Check existing session
  useEffect(() => {
    const saved = localStorage.getItem("hirelocal_admin_session");
    if (saved === "authenticated") {
      setIsAdminAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!username.trim() || !password) {
      setLoginError("Please enter both username and password");
      return;
    }

    setLoginLoading(true);

    setTimeout(() => {
      // Validate credentials: Username "ADMIN", Password "AdminHL#180"
      if (username.trim() === "ADMIN" && password === "AdminHL#180") {
        localStorage.setItem("hirelocal_admin_session", "authenticated");
        setIsAdminAuthenticated(true);
        setLoginError("");
        if (refetchData) refetchData();
      } else {
        setLoginError("Invalid Administrator credentials. Please check your username and password.");
      }
      setLoginLoading(false);
    }, 400);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("hirelocal_admin_session");
    setIsAdminAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  if (!isHydrated || checkingAuth) {
    return <FullPageLoader />;
  }

  // ═══════════════════════════════════════════════════════
  // VIEW 1: ADMIN LOGIN SCREEN (Sri City Branded Theme)
  // ═══════════════════════════════════════════════════════
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
        {/* Sri City Background with fading overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20"
          style={{ backgroundImage: "url('/Sri_City_office_and_flags.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/60 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md animate-scale-in">
          {/* Logo badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-950/80 border border-primary-500/40 text-primary-300 text-xs font-bold tracking-wider uppercase shadow-lg mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              HireLocal System Administration
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admin Portal Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Authorized personnel only. Enter credentials to manage Sri City job portal.
            </p>
          </div>

          <Card hover={false} className="p-6 sm:p-8 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    👤
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    🔒
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/60 text-xs text-red-300 font-medium flex items-center gap-2">
                  <span>⚠️</span> {loginError}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loginLoading}
                className="py-3 mt-2 font-bold text-sm bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/40"
              >
                Sign In to Dashboard →
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <Link
                href="/"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Return to HireLocal Public Portal
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // VIEW 2: ADMIN DASHBOARD (When Authenticated)
  // ═══════════════════════════════════════════════════════
  const totalCandidates = mockData.candidates.length;
  const allHRs = mockData.hrUsers || [];
  const pendingHRs = allHRs.filter((h) => h.status === "pending");
  const approvedHRs = allHRs.filter((h) => h.status !== "pending" && h.status !== "rejected");
  const rejectedHRs = allHRs.filter((h) => h.status === "rejected");
  const totalJobs = mockData.jobs.length;
  const totalApplications = mockData.applications.length;
  const pendingHRCount = pendingHRs.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/HL-admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white font-extrabold flex items-center justify-center shadow-md">
                H
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  HireLocal
                </span>
                <span className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-300">
                  Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "overview"
                  ? "bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              Dashboard Overview
            </button>
            <Link
              href="/HL-admin/hr-assigning"
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <span>HR Assigning</span>
              {pendingHRCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-sm animate-pulse">
                  {pendingHRCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "jobs"
                  ? "bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              Jobs ({totalJobs})
            </button>
            <button
              onClick={() => setActiveTab("candidates")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "candidates"
                  ? "bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              Candidates ({totalCandidates})
            </button>
          </nav>

          {/* Admin User info & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>ADMIN</span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAdminLogout}
              className="text-xs"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Administrative Control Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time monitoring of candidates, jobs, companies, and pending HR registrations in Sri City.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/HL-admin/hr-assigning">
              <Button size="md" className="gap-2 shadow-md">
                <span>🛡️</span>
                <span>Review HR Requests</span>
                {pendingHRCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-white text-primary-700">
                    {pendingHRCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess("")} className="text-xs text-emerald-600 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
           KPI CARDS ROW
           ═══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* KPI 1: HR Assigning Card (Highlighted / Interactive) */}
          <Card
            hover={true}
            onClick={() => router.push("/HL-admin/hr-assigning")}
            className={`cursor-pointer transition-all duration-300 relative overflow-hidden border-2 ${
              pendingHRCount > 0
                ? "border-amber-400 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 shadow-md ring-2 ring-amber-400/20"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  HR Assigning
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {pendingHRCount}
                  </span>
                  <span className="text-xs text-slate-500">pending</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 flex items-center justify-center text-xl shadow-sm">
                🛡️
              </div>
            </div>

            {/* Prominent Badge Indicator */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              {pendingHRCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-sm animate-pulse">
                  <span>●</span>
                  <span>{pendingHRCount} Action Required</span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>✓</span> All HRs Assigned
                </span>
              )}
              <span className="text-xs font-bold text-primary-600 group-hover:translate-x-0.5 transition-transform">
                View →
              </span>
            </div>
          </Card>

          {/* KPI 2: Total Candidates */}
          <Card hover={false} className="border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Candidates
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {totalCandidates}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-xl">
                👥
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              Registered job seekers
            </p>
          </Card>

          {/* KPI 3: Approved HRs */}
          <Card hover={false} className="border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Approved HRs
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {approvedHRs.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center text-xl">
                🏢
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              Active employers in system
            </p>
          </Card>

          {/* KPI 4: Job Posts */}
          <Card hover={false} className="border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Job Posts
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {totalJobs}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center text-xl">
                💼
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              Active job openings
            </p>
          </Card>

          {/* KPI 5: Applications */}
          <Card hover={false} className="border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Applications
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {totalApplications}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center text-xl">
                📄
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              Total applications received
            </p>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════
           PENDING HR ASSIGNING QUICK ALERT QUEUE
           ═══════════════════════════════════════════════════════ */}
        {pendingHRCount > 0 && (
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 dark:border-amber-800/60 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-bold shadow">
                  ⚠️
                </span>
                <div>
                  <h2 className="text-base font-bold text-amber-950 dark:text-amber-200">
                    HR Account Creation Requests Awaiting Assignment ({pendingHRCount})
                  </h2>
                  <p className="text-xs text-amber-800 dark:text-amber-400">
                    The following employers entered their details on the Create HR Account page. Assign or reject them below:
                  </p>
                </div>
              </div>
              <Link
                href="/HL-admin/hr-assigning"
                className="text-xs font-bold text-amber-900 dark:text-amber-200 underline hover:text-amber-700"
              >
                Go to Dedicated HR Assigning Page →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {pendingHRs.map((hr) => (
                <div
                  key={hr.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {hr.company}
                      </h3>
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                        {hr.name}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                      Pending
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p>✉️ {hr.email}</p>
                    <p>📞 {hr.phone || "No phone provided"}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5"
                      onClick={async () => {
                        await assignHR(hr.id);
                        setActionSuccess(`Assigned and approved HR account for ${hr.name} (${hr.company})`);
                      }}
                    >
                      ✓ Assign
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs py-1.5"
                      onClick={async () => {
                        await rejectHR(hr.id);
                        setActionSuccess(`Rejected HR request for ${hr.company}`);
                      }}
                    >
                      ✗ Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
           TABBED DIRECTORIES & TABLES
           ═══════════════════════════════════════════════════════ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "overview"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Overview & All HRs ({allHRs.length})
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "jobs"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Job Postings ({totalJobs})
            </button>
            <button
              onClick={() => setActiveTab("candidates")}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "candidates"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Registered Candidates ({totalCandidates})
            </button>
          </div>

          {/* TAB 1: OVERVIEW & HR DIRECTORY */}
          {activeTab === "overview" && (
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    HR Accounts Directory ({allHRs.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage company employers, assignment status, and credentials.
                  </p>
                </div>
                <Link href="/HL-admin/hr-assigning">
                  <Button size="sm" variant="secondary" className="text-xs">
                    Open Full Assigning Page →
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">HR Name</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {allHRs.map((hr) => (
                      <tr key={hr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {hr.company}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {hr.name}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          <div>{hr.email}</div>
                          {hr.phone && <div className="text-[11px] text-slate-400">{hr.phone}</div>}
                        </td>
                        <td className="py-3 px-3">
                          {hr.status === "pending" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                              Pending
                            </span>
                          ) : hr.status === "rejected" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200">
                              Rejected
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                              Approved
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          {hr.status === "pending" ? (
                            <>
                              <button
                                onClick={async () => {
                                  await assignHR(hr.id);
                                  setActionSuccess(`Assigned HR ${hr.name}`);
                                }}
                                className="px-2 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                              >
                                Assign
                              </button>
                              <button
                                onClick={async () => {
                                  await rejectHR(hr.id);
                                  setActionSuccess(`Rejected HR ${hr.name}`);
                                }}
                                className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold text-[11px] hover:bg-red-200"
                              >
                                Reject
                              </button>
                            </>
                          ) : hr.status === "rejected" ? (
                            <button
                              onClick={async () => {
                                await assignHR(hr.id);
                                setActionSuccess(`Re-assigned HR ${hr.name}`);
                              }}
                              className="px-2 py-1 rounded bg-primary-100 text-primary-700 font-bold text-[11px] hover:bg-primary-200"
                            >
                              Re-assign
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                await rejectHR(hr.id);
                                setActionSuccess(`Revoked HR ${hr.name}`);
                              }}
                              className="px-2 py-1 rounded text-red-500 hover:bg-red-50 text-[11px]"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 2: JOBS LIST */}
          {activeTab === "jobs" && (
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                All Posted Jobs ({totalJobs})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Job Title</th>
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">Salary</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Applicants</th>
                      <th className="py-2.5 px-3">Posted Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mockData.jobs.map((job) => {
                      const appCount = mockData.applications.filter((a) => a.jobId === job.id).length;
                      return (
                        <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                            {job.title}
                          </td>
                          <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                            {job.company}
                          </td>
                          <td className="py-3 px-3 text-primary-600 font-semibold">
                            {job.salary}
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {job.location}
                          </td>
                          <td className="py-3 px-3 font-semibold">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {appCount} applicants
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400">
                            {job.postedDate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 3: CANDIDATES LIST */}
          {activeTab === "candidates" && (
            <Card hover={false} className="p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Registered Candidates ({totalCandidates})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Candidate</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Education</th>
                      <th className="py-2.5 px-3">Skills</th>
                      <th className="py-2.5 px-3">Resume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mockData.candidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {cand.name}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          <div>{cand.email}</div>
                          <div className="text-[11px] text-slate-400">{cand.phone}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300 truncate max-w-xs">
                          {cand.education || "Not specified"}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                            {cand.skills?.length || 0} skills
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {(cand.resume || cand.resumeUrl) && !(cand.resume || cand.resumeUrl)?.startsWith("/resumes/") ? (
                            <a
                              href={cand.resume || cand.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:underline font-semibold"
                            >
                              View Resume ↗
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
