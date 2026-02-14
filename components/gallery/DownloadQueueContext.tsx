"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react";

interface DownloadQueueState {
  selectedPhotos: Set<string>;
}

type Action =
  | { type: "add"; id: string }
  | { type: "remove"; id: string }
  | { type: "toggle"; id: string }
  | { type: "clear" }
  | { type: "init"; ids: string[] };

function reducer(state: DownloadQueueState, action: Action): DownloadQueueState {
  const next = new Set(state.selectedPhotos);
  switch (action.type) {
    case "add":
      next.add(action.id);
      return { selectedPhotos: next };
    case "remove":
      next.delete(action.id);
      return { selectedPhotos: next };
    case "toggle":
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return { selectedPhotos: next };
    case "clear":
      return { selectedPhotos: new Set() };
    case "init":
      return { selectedPhotos: new Set(action.ids) };
  }
}

interface DownloadQueueContextValue {
  selectedPhotos: Set<string>;
  count: number;
  addPhoto: (id: string) => void;
  removePhoto: (id: string) => void;
  togglePhoto: (id: string) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
}

const DownloadQueueContext = createContext<DownloadQueueContextValue | null>(null);

function storageKey(eventId: string) {
  return `download-queue-${eventId}`;
}

export function DownloadQueueProvider({ eventId, children }: { eventId: string; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { selectedPhotos: new Set<string>() });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(eventId));
      if (saved) {
        const ids = JSON.parse(saved) as string[];
        if (Array.isArray(ids) && ids.length > 0) {
          dispatch({ type: "init", ids });
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [eventId]);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      const ids = Array.from(state.selectedPhotos);
      if (ids.length > 0) {
        localStorage.setItem(storageKey(eventId), JSON.stringify(ids));
      } else {
        localStorage.removeItem(storageKey(eventId));
      }
    } catch {
      // Ignore storage errors
    }
  }, [state.selectedPhotos, eventId]);

  const addPhoto = useCallback((id: string) => dispatch({ type: "add", id }), []);
  const removePhoto = useCallback((id: string) => dispatch({ type: "remove", id }), []);
  const togglePhoto = useCallback((id: string) => dispatch({ type: "toggle", id }), []);
  const clearAll = useCallback(() => dispatch({ type: "clear" }), []);
  const isSelected = useCallback((id: string) => state.selectedPhotos.has(id), [state.selectedPhotos]);

  return (
    <DownloadQueueContext.Provider
      value={{
        selectedPhotos: state.selectedPhotos,
        count: state.selectedPhotos.size,
        addPhoto,
        removePhoto,
        togglePhoto,
        clearAll,
        isSelected,
      }}
    >
      {children}
    </DownloadQueueContext.Provider>
  );
}

export function useDownloadQueue(): DownloadQueueContextValue {
  const ctx = useContext(DownloadQueueContext);
  if (!ctx) throw new Error("useDownloadQueue must be used within DownloadQueueProvider");
  return ctx;
}
