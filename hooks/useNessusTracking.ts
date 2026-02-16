"use client";

import { useEffect, useCallback } from "react";

const TRACKING_ENDPOINT =
  "https://rjudjhjcfivugbyztnce.supabase.co/functions/v1/track-visitor";
const CLIENT_ID = "da6fa735-8143-4cdf-941c-5b6021cbc961"; // Shrike Media Website

function getSessionId(): string {
  let sessionId = sessionStorage.getItem("nessus_session_id");
  if (!sessionId) {
    sessionId =
      "sess_" +
      Math.random().toString(36).substring(2, 11) +
      "_" +
      Date.now();
    sessionStorage.setItem("nessus_session_id", sessionId);
  }
  return sessionId;
}

/**
 * Tracks page visits and custom events to the Nessus CRM analytics system.
 * Returns { trackEvent } for granular interaction tracking.
 */
export function useNessusTracking(pagePath: string, websiteLabel: string) {
  useEffect(() => {
    const data = {
      client_id: CLIENT_ID,
      page_path: pagePath,
      website_label: websiteLabel,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      session_id: getSessionId(),
    };

    fetch(TRACKING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(() => {});
  }, [pagePath, websiteLabel]);

  const trackEvent = useCallback(
    (eventName: string, eventData?: Record<string, unknown>) => {
      fetch(TRACKING_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          page_path: pagePath,
          website_label: websiteLabel,
          event_name: eventName,
          event_data: eventData ?? null,
          session_id: getSessionId(),
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        }),
        keepalive: true,
      }).catch(() => {});
    },
    [pagePath, websiteLabel]
  );

  // Scroll depth tracking
  useEffect(() => {
    // Short page guard: skip tracking if page content is already fully visible
    if (
      document.documentElement.scrollHeight <=
      window.innerHeight + 100
    ) {
      return;
    }

    const milestones = [25, 50, 75, 90, 100];
    const fired = new Set<number>();
    const observers: IntersectionObserver[] = [];
    const sentinels: HTMLElement[] = [];

    milestones.forEach((percent) => {
      // Create sentinel element at scroll depth using PIXEL positioning
      const pixelTop =
        (percent / 100) * document.documentElement.scrollHeight;
      const sentinel = document.createElement("div");
      sentinel.setAttribute("data-scroll-sentinel", "true");
      sentinel.style.cssText = `
        position: absolute;
        top: ${pixelTop}px;
        height: 1px;
        width: 1px;
        pointer-events: none;
        visibility: hidden;
      `;
      document.body.appendChild(sentinel);
      sentinels.push(sentinel);

      // Create IntersectionObserver for this milestone
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !fired.has(percent)) {
              fired.add(percent);
              trackEvent("scroll_depth", { percent_scrolled: percent });
            }
          });
        },
        { threshold: 0 }
      );

      observer.observe(sentinel);
      observers.push(observer);
    });

    // Cleanup: disconnect observers and remove sentinels
    return () => {
      observers.forEach((obs) => obs.disconnect());
      sentinels.forEach((el) => el.remove());
    };
  }, [pagePath, trackEvent]);

  return { trackEvent };
}
