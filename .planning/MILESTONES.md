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

*Last milestone completed: v1.1 (2026-02-08)*
*Total requirements shipped: 40*
