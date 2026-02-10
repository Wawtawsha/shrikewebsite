"use client";

import { useState } from "react";

export function ThemeSwitcher() {
  const [dark, setDark] = useState(false);

  function toggle() {
    const next = !dark;
    setDark(next);
    const el = document.querySelector(".gallery-theme");
    if (!el) return;
    if (next) {
      el.setAttribute("data-gallery-theme", "regency");
    } else {
      el.removeAttribute("data-gallery-theme");
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-switcher"
      style={{
        position: "relative",
        width: 52,
        height: 28,
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        cursor: "pointer",
        background: dark
          ? "linear-gradient(135deg, oklch(0.18 0.03 270), oklch(0.22 0.04 270))"
          : "linear-gradient(135deg, oklch(0.94 0.02 80), oklch(0.90 0.03 80))",
        boxShadow: dark
          ? "inset 0 1px 3px rgba(0,0,0,0.4)"
          : "inset 0 1px 2px rgba(0,0,0,0.06)",
        transition: "background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: dark ? 27 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: dark ? "oklch(0.82 0.12 85)" : "#fff",
          boxShadow: dark
            ? "0 1px 4px rgba(0,0,0,0.3), 0 0 6px oklch(0.72 0.15 85 / 0.3)"
            : "0 1px 3px rgba(0,0,0,0.15)",
          transition: "left 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease, box-shadow 0.4s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {dark ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="oklch(0.18 0.03 270)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="oklch(0.65 0.12 80)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </span>
    </button>
  );
}
