"use client";

import { useState, useCallback, type FormEvent } from "react";
import { useNessusTracking } from "@/hooks/useNessusTracking";

const LEAD_ENDPOINT =
  "https://rjudjhjcfivugbyztnce.supabase.co/functions/v1/submit-lead";
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

export default function GimmiPage() {
  const { trackEvent } = useNessusTracking("Gimmi", "gimmi");
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
            utm_source: "gimmi",
            landing_page_url: window.location.href,
            referrer: document.referrer || null,
          }),
        });

        if (!res.ok) throw new Error("Submit failed");

        setStatus("success");
        trackEvent("phone_submitted", { notify_events: notifyEvents });
      } catch {
        setStatus("error");
      }
    },
    [name, phone, notifyEvents, trackEvent]
  );

  const isValid = normalizePhone(phone) !== null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div className="lead-form" style={{ maxWidth: 400, width: "100%" }}>
        {status === "success" ? (
          <div className="lead-form-success">
            <div className="lead-form-success-icon">&#10003;</div>
            <p className="lead-form-success-title">You&apos;re in!</p>
            <p className="lead-form-success-text">
              We&apos;ll be in touch soon.
            </p>
          </div>
        ) : (
          <>
            <h1
              className="lead-form-title"
              style={{ fontSize: "1.6rem", marginBottom: 4 }}
            >
              Get on the list
            </h1>

            <div className="memphis-divider" style={{ margin: "16px 0" }}>
              <span className="memphis-triangle" />
              <span className="memphis-circle" />
              <span className="memphis-square" />
              <span className="memphis-circle" />
              <span className="memphis-triangle" />
            </div>

            <p className="lead-form-subtitle" style={{ marginBottom: 20 }}>
              Drop your number and we&apos;ll keep you posted.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="lead-form-input"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
                style={{ width: "100%", marginBottom: 12 }}
              />

              <input
                type="tel"
                className="lead-form-input"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={handlePhoneChange}
                autoComplete="tel"
                style={{ width: "100%", marginBottom: 12 }}
              />

              <label className="lead-form-checkbox-label" style={{ marginBottom: 16 }}>
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
                style={{ width: "100%" }}
              >
                {status === "submitting"
                  ? "Sending..."
                  : status === "error"
                    ? "Something went wrong, try again"
                    : "Count me in!"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
