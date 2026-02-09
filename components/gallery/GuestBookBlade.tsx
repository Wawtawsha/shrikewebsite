"use client";

import { CommentSection } from "./CommentSection";

interface GuestBookBladeProps {
  open: boolean;
  onToggle: () => void;
  eventId: string;
  firstPhotoId: string;
}

export function GuestBookBlade({ open, onToggle, eventId, firstPhotoId }: GuestBookBladeProps) {
  return (
    <>
      {/* Floating toggle button */}
      {!open && (
        <button
          onClick={onToggle}
          className="guestbook-fab"
          aria-label="Open guest book"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Guest Book
        </button>
      )}

      {/* Blade panel */}
      <aside
        className={`guestbook-blade ${open ? "guestbook-blade--open" : ""}`}
        aria-hidden={!open}
      >
        <div className="guestbook-blade-header">
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Guest Book
          </h2>
          <button
            onClick={onToggle}
            className="guestbook-blade-close"
            aria-label="Close guest book"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="guestbook-blade-content">
          <CommentSection eventId={eventId} firstPhotoId={firstPhotoId} />
        </div>
      </aside>
    </>
  );
}
