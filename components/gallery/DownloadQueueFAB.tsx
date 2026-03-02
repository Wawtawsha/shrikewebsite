"use client";

import { useDownloadQueue } from "./DownloadQueueContext";

interface DownloadQueueFABProps {
  onOpen: () => void;
  hidden?: boolean;
}

export function DownloadQueueFAB({ onOpen, hidden }: DownloadQueueFABProps) {
  const { count } = useDownloadQueue();

  if (count === 0 || hidden) return null;

  return (
    <button
      className="download-queue-fab"
      onClick={onOpen}
      aria-label={`${count} photo${count !== 1 ? "s" : ""} selected for full resolution download`}
      type="button"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {count} photo{count !== 1 ? "s" : ""} &mdash; Get Full Res
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </button>
  );
}
