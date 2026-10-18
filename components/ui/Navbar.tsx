"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";

export function Navbar() {
  const { candidateSession, hrSession, logout, isHydrated } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = candidateSession || hrSession;
  const userName = candidateSession?.name || hrSession?.name || "";
  const userRole = candidateSession ? "Candidate" : hrSession ? "HR" : null;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-700/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-primary-600 text-white font-black flex items-center justify-center text-sm shadow-sm select-none">
              S
            </div>
            Sri city Jobs
          </Link>

          {/* Desktop nav */}
          {isHydrated && isLoggedIn && (
            <div className="hidden sm:flex items-center gap-4">
              {candidateSession && (
                <>
                  <Link
                    href="/jobs"
                    className="text-sm text-slate-600 hover:text-primary-600 transition-colors font-medium"
                  >
                    Browse Jobs
                  </Link>
                  <Link
                    href="/candidate/applications"
                    className="text-sm text-slate-600 hover:text-primary-600 transition-colors font-medium"
                  >
                    My Applications
                  </Link>
                </>
              )}
              {hrSession && (
                <Link
                  href="/hr/dashboard"
                  className="text-sm text-slate-600 hover:text-primary-600 transition-colors font-medium"
                >
                  Dashboard
                </Link>
              )}
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-200">
                  {userName ? userName[0]?.toUpperCase() : "?"}
                </div>
                <div className="text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {userName || "User"}
                  </span>
                  {userRole && (
                    <span className="ml-1.5 text-xs text-slate-400">
                      ({userRole})
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={logout}
                className="text-sm text-slate-500 hover:text-error transition-colors font-medium cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          {isHydrated && isLoggedIn && (
            <button
              className="sm:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {isHydrated && menuOpen && isLoggedIn && (
        <div className="sm:hidden border-t border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-200">
                {userName ? userName[0]?.toUpperCase() : "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{userName || "User"}</p>
                <p className="text-xs text-slate-400">{userRole}</p>
              </div>
            </div>
            {candidateSession && (
              <>
                <Link
                  href="/jobs"
                  className="block py-2 text-sm text-slate-600 hover:text-primary-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Browse Jobs
                </Link>
                <Link
                  href="/candidate/applications"
                  className="block py-2 text-sm text-slate-600 hover:text-primary-600"
                  onClick={() => setMenuOpen(false)}
                >
                  My Applications
                </Link>
              </>
            )}
            {hrSession && (
              <Link
                href="/hr/dashboard"
                className="block py-2 text-sm text-slate-600 hover:text-primary-600"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm text-red-500 hover:text-red-600 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
