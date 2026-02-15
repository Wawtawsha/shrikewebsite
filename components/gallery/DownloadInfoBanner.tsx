"use client";

import { useState } from "react";

export function DownloadInfoBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div className="download-info-banner">
      <p className="download-info-text">
        Please note: These pictures are being displayed in a lower resolution in
        order to keep the website running smoothly. The full resolution images
        are freely available for download.
      </p>
      <button
        type="button"
        className="download-info-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? "Hide instructions" : "Click here to see how"}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`download-info-chevron ${open ? "download-info-chevron--open" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="download-info-howto">
          <div className="download-info-method">
            <h3 className="download-info-method-title">Single Photo</h3>
            <p>
              Hover over (or tap) any photo and press the{" "}
              <span className="download-info-icon-inline" aria-label="download icon">&darr;</span>{" "}
              button to save it directly to your device.
            </p>
          </div>
          <div className="download-info-method">
            <h3 className="download-info-method-title">Multiple Photos (Full Resolution)</h3>
            <ol className="download-info-steps">
              <li>
                Tap the{" "}
                <span className="download-info-icon-inline" aria-label="plus icon">+</span>{" "}
                button on each photo you want.
              </li>
              <li>
                A floating button will appear at the bottom showing your
                selection count. Tap it to open the download panel.
              </li>
              <li>
                Enter your email and hit{" "}
                <strong>&ldquo;Get Download Link.&rdquo;</strong>{" "}
                You&rsquo;ll be taken to a page where you can download all
                selected photos in full resolution.
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
