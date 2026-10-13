"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BrandLoadingOverlay } from "./LoadingSpinner";

export function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Turn off loading once route change completes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Intercept internal link clicks to trigger instant brand transition overlay
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor || !anchor.href) return;

      // Skip modifiers or external/download targets
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      try {
        const currentOrigin = window.location.origin;
        const targetUrl = new URL(anchor.href, window.location.href);

        // Only handle internal routes
        if (targetUrl.origin !== currentOrigin) return;

        // Skip same-page hash jump
        if (
          targetUrl.pathname === window.location.pathname &&
          targetUrl.search === window.location.search &&
          targetUrl.hash
        ) {
          return;
        }

        // If target route differs from current, show brand overlay
        if (
          targetUrl.pathname !== window.location.pathname ||
          targetUrl.search !== window.location.search
        ) {
          setIsNavigating(true);
        }
      } catch {
        // Ignore invalid URL parsing
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, []);

  // Safety fallback: if navigation stalls or takes longer than 4s, auto-dismiss
  useEffect(() => {
    if (!isNavigating) return;
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, 4000);
    return () => clearTimeout(timeout);
  }, [isNavigating]);

  if (!isNavigating) return null;

  return (
    <BrandLoadingOverlay
      fullScreen={true}
      message="Loading page..."
      subtext="HireLocal • Loading next page"
    />
  );
}
