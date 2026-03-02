"use client";

import { memo, useCallback, useState, useRef } from "react";
import { downloadWebSize } from "@/lib/download";
import { usePhoneUnlock } from "./PhoneUnlockContext";

interface InstantDownloadButtonProps {
  photoUrl: string;
  filename: string;
  onDownload?: () => void;
}

export const InstantDownloadButton = memo(function InstantDownloadButton({
  photoUrl,
  filename,
  onDownload,
}: InstantDownloadButtonProps) {
  const [status, setStatus] = useState<"idle" | "downloading" | "done">("idle");
  const [showChyron, setShowChyron] = useState(false);
  const [wiggling, setWiggling] = useState(false);
  const chyronTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { isUnlocked } = usePhoneUnlock();

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!isUnlocked) {
        // Wiggle + chyron
        setWiggling(true);
        setShowChyron(true);
        clearTimeout(chyronTimer.current);
        chyronTimer.current = setTimeout(() => {
          setShowChyron(false);
          setWiggling(false);
        }, 3000);
        return;
      }

      if (status === "downloading") return;

      setStatus("downloading");
      await downloadWebSize(photoUrl, filename);
      setStatus("done");
      onDownload?.();

      setTimeout(() => setStatus("idle"), 1500);
    },
    [photoUrl, filename, onDownload, status, isUnlocked]
  );

  const className = [
    "instant-download-overlay",
    status === "done" ? "instant-download-overlay--done" : "",
    wiggling ? "instant-download-wiggle" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <button
        className={className}
        onClick={handleClick}
        onAnimationEnd={() => setWiggling(false)}
        aria-label="Download web-size photo"
        type="button"
        disabled={status === "downloading"}
      >
        {status === "done" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : status === "downloading" ? (
          <span className="gallery-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
      </button>
      {showChyron && (
        <div className="download-toast" key={Date.now()}>
          Enter your phone number above to unlock downloads
        </div>
      )}
    </>
  );
});
