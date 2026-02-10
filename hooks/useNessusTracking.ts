"use client";

import { useEffect } from "react";

const TRACKING_ENDPOINT =
  "https://rjudjhjcfivugbyztnce.supabase.co/functions/v1/track-visitor";
const CLIENT_ID = "4f52c706-e3ae-47ae-8b6a-63e78495b214"; // Rosemont Vineyard

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
 * Tracks a page visit to the Nessus CRM analytics system.
 * Same pattern as Ausfaller: sendBeacon to track-visitor edge function.
 */
export function useNessusTracking(pagePath: string) {
  useEffect(() => {
    const data = {
      client_id: CLIENT_ID,
      page_path: pagePath,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      session_id: getSessionId(),
    };

    // Use fetch instead of sendBeacon — sendBeacon with application/json
    // triggers CORS preflight which it can't handle, silently failing.
    fetch(TRACKING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(() => {
      // Silently fail — don't impact user experience
    });
  }, [pagePath]);
}
