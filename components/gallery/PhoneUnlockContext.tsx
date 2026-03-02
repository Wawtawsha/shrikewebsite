"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface PhoneUnlockContextValue {
  isUnlocked: boolean;
  unlock: () => void;
}

const PhoneUnlockContext = createContext<PhoneUnlockContextValue>({
  isUnlocked: false,
  unlock: () => {},
});

export function usePhoneUnlock() {
  return useContext(PhoneUnlockContext);
}

export function PhoneUnlockProvider({
  websiteLabel,
  children,
}: {
  websiteLabel: string;
  children: ReactNode;
}) {
  const storageKey = `phone-unlocked-${websiteLabel}`;
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    setIsUnlocked(sessionStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  const unlock = useCallback(() => {
    setIsUnlocked(true);
    sessionStorage.setItem(storageKey, "1");
  }, [storageKey]);

  return (
    <PhoneUnlockContext.Provider value={{ isUnlocked, unlock }}>
      {children}
    </PhoneUnlockContext.Provider>
  );
}
