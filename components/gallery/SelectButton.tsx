"use client";

import { memo, useCallback } from "react";
import { useDownloadQueue } from "./DownloadQueueContext";

interface SelectButtonProps {
  photoId: string;
}

export const SelectButton = memo(function SelectButton({ photoId }: SelectButtonProps) {
  const { isSelected, togglePhoto } = useDownloadQueue();
  const selected = isSelected(photoId);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      togglePhoto(photoId);
    },
    [photoId, togglePhoto]
  );

  return (
    <button
      className={`select-button-overlay ${selected ? "select-button-overlay--selected" : ""}`}
      onClick={handleClick}
      aria-label={selected ? "Remove from download queue" : "Add to download queue"}
      type="button"
    >
      {selected ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}
    </button>
  );
});
