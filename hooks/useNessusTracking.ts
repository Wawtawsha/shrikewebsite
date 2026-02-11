"use client";

import { useEffect, useCallback } from "react";

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
 * Tracks page visits and custom events to the Nessus CRM analytics system.
 * Returns { trackEvent } for granular interaction tracking.
 */
export function useNessusTracking(pagePath: string, clientId?: string) {
  const resolvedClientId = clientId ?? CLIENT_ID;

  useEffect(() => {
    const data = {
      client_id: resolvedClientId,
      page_path: pagePath,
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
  }, [pagePath, resolvedClientId]);

  const trackEvent = useCallback(
    (eventName: string, eventData?: Record<string, unknown>) => {
      fetch(TRACKING_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: resolvedClientId,
          page_path: pagePath,
          event_name: eventName,
          event_data: eventData ?? null,
          session_id: getSessionId(),
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        }),
        keepalive: true,
      }).catch(() => {});
    },
    [pagePath, resolvedClientId]
  );

  return { trackEvent };
}
