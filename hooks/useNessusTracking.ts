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

  return { trackEvent };
}
