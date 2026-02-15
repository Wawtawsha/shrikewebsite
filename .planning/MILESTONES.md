# Milestones: Shrike Media

## v1.0 — Dark Cinematic Portfolio Site

**Completed:** 2026-02-01
**Phases:** 3 | **Requirements:** 25/25

Built the foundation: full-screen video hero, portfolio grid with category filtering, services page with Calendly booking, dark cinematic design, smooth scroll animations, page transitions, parallax effects, accessibility compliance, Lighthouse 90+ performance.

**Key decisions:** Dark oklch palette, Lenis smooth scroll, Motion/Framer Motion animations, native `<dialog>` lightbox, URL search params for filtering, `prefers-reduced-motion` throughout.

---

## v1.1 — Event Photo Gallery

**Completed:** 2026-02-08
**Phases:** 3 | **Requirements:** 15/15
**Archive:** `.planning/milestones/v1.1-ROADMAP.md`, `.planning/milestones/v1.1-REQUIREMENTS.md`

Added Pinterest-style photo gallery for event client delivery. Supabase backend (Storage + Postgres), masonry grid with blurhash placeholders, lightbox with zoom/download, anonymous likes and comments, spam protection, post-hoc moderation. Completely isolated from main site via route groups with separate warm theme.

**Key decisions:** Supabase Free plan + sharp resize at upload, react-photo-album masonry, localStorage device ID, CSS z-index blurhash layering, "Load More" over infinite scroll, JPEG downloads via OffscreenCanvas conversion, post-hoc moderation with profanity filter.

**Stats:** 54 files changed, +7600/-1834 lines, ~3968 LOC added

---

## v1.2 — Event Platform & Services Expansion

**Completed:** 2026-02-15
**Phases:** Organic (no formal phases) | **Requirements:** 12/12

Evolved from single generic gallery into a full event delivery platform. Two dedicated event galleries (Press Club 300+ photos, College Thursday 784 photos) with chocolate-memphis theme. Two-tier download system: instant web-size (1024px, no gate) and full-res email queue (download sessions with 72-hour token expiry, ZIP bundling). Nexus event hub for discovery. Landing page upgraded with cinema triptych video showcase and real event videos. Services completely redesigned with 4 dedicated subpages. Lead capture forms and promo popups on event pages. Nessus CRM analytics throughout.

**Key decisions:** Dedicated event routes over query params, localStorage download queue persistence, token-based download pages (no auth), client-side ZIP via JSZip, Nessus CRM for analytics (own tracking, no third-party), chocolate-memphis theme distinct from main site and generic gallery, cinema triptych with auto-rotating real video content.

**New Supabase table:** `download_sessions` (token, email, photo_ids array, 72h expiry)

---

*Last milestone completed: v1.2 (2026-02-15)*
*Total requirements shipped: 52*
