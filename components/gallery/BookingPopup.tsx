"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "shrike-booking-popup-dismissed";

export function BookingPopup() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    dialogRef.current?.showModal();
  }, []);

  function close() {
    dialogRef.current?.close();
    sessionStorage.setItem(STORAGE_KEY, "1");
  }

  return (
    <dialog
      ref={dialogRef}
      className="booking-popup"
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
    >
      <div className="booking-popup-content">
        <button
          onClick={close}
          className="booking-popup-close"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="booking-popup-icon" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>

        <h2 className="booking-popup-title">
          We&rsquo;re Now Booking
        </h2>
        <p className="booking-popup-body">
          Shrike Media is opening its doors for professional photography work.
          Whether it&rsquo;s events, portraits, or something uniquely yours &mdash;
          we&rsquo;d love to work with you.
        </p>

        <a
          href="https://calendly.com/realshrikeproductions/technical-consultation?month=2026-02"
          target="_blank"
          rel="noopener noreferrer"
          className="booking-popup-cta"
        >
          Book a Consultation
        </a>

        <button onClick={close} className="booking-popup-dismiss">
          Maybe later
        </button>
      </div>
    </dialog>
  );
}
