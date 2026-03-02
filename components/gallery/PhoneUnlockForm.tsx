"use client";

import { useState, useCallback, type FormEvent } from "react";

const LEAD_ENDPOINT = "https://rjudjhjcfivugbyztnce.supabase.co/functions/v1/submit-lead";
const CLIENT_ID = "da6fa735-8143-4cdf-941c-5b6021cbc961";

type Status = "idle" | "submitting" | "success" | "error";

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits[0] === "1") return digits.slice(1);
  return null;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

interface PhoneUnlockFormProps {
  websiteLabel: string;
  eventTitle: string;
  onUnlock: () => void;
  trackEvent: (name: string, props?: Record<string, unknown>) => void;
  theme: "memphis" | "blacklight";
}

export function PhoneUnlockForm({
  websiteLabel,
  eventTitle,
  onUnlock,
  trackEvent,
  theme,
}: PhoneUnlockFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notifyEvents, setNotifyEvents] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPhone(formatPhone(e.target.value));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const normalized = normalizePhone(phone);
      if (!normalized) return;

      setStatus("submitting");

      try {
        const res = await fetch(LEAD_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            first_name: name.trim() || null,
            phone: normalized,
            preferred_contact: "phone",
            notify_events: notifyEvents,
            utm_source: `${websiteLabel}-gallery`,
            notes: `Download unlock — ${eventTitle}`,
            landing_page_url: window.location.href,
            referrer: document.referrer || null,
          }),
        });

        if (!res.ok) throw new Error("Submit failed");

        setStatus("success");
        trackEvent("phone_unlock_submit", { notify_events: notifyEvents });
        onUnlock();
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    },
    [name, phone, notifyEvents, websiteLabel, eventTitle, trackEvent, onUnlock]
  );

  const isValid = normalizePhone(phone) !== null;

  if (status === "success") {
    return (
      <div className="header-unlock-form header-unlock-form--success">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-accent)" }}>
          Downloads unlocked!
        </span>
      </div>
    );
  }

  return (
    <div className="header-unlock-form">
      <p className="header-unlock-title">Unlock Downloads</p>
      {theme === "memphis" ? (
        <div className="memphis-divider" style={{ padding: "6px 0" }}>
          <span className="memphis-triangle" />
          <span className="memphis-circle" />
          <span className="memphis-triangle" />
        </div>
      ) : (
        <div className="uv-divider" style={{ padding: "6px 0" }}>
          <span className="uv-dot" />
          <span className="uv-dot uv-dot--green" />
          <span className="uv-dot" />
        </div>
      )}
      <form onSubmit={handleSubmit} className="header-unlock-fields">
        <input
          type="text"
          className="lead-form-input"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="given-name"
        />
        <input
          type="tel"
          className="lead-form-input"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={handlePhoneChange}
          autoComplete="tel"
          required
        />
        <label className="lead-form-checkbox-label" style={{ margin: 0 }}>
          <input
            type="checkbox"
            checked={notifyEvents}
            onChange={(e) => setNotifyEvents(e.target.checked)}
          />
          <span>Notify me when Shrike Media will be at an event!</span>
        </label>
        <button
          type="submit"
          className="lead-form-submit"
          disabled={!isValid || status === "submitting"}
          style={{ marginTop: 4 }}
        >
          {status === "submitting"
            ? "Sending..."
            : status === "error"
              ? "Something went wrong — try again"
              : "Unlock Downloads"}
        </button>
      </form>
    </div>
  );
}
