# Shrike Media

## What This Is

A dark, cinematic portfolio website for Shrike Media — a creative engineering company that does photography, videography, and software/technical work. The site targets businesses needing media production and serves as both a portfolio showcase and a booking gateway. The site itself is a portfolio piece: its technical execution and polished interactions prove Shrike Media's capabilities.

## Core Value

When someone lands on this site, they must immediately feel they're looking at the work of elite creative engineers who can solve any problem.

## Requirements

### Validated

- Full-screen video showreel hero — v1 Phase 2
- Dark cinematic visual design — v1 Phase 1
- Smooth scroll-driven animations and micro-interactions — v1 Phase 3
- Portfolio gallery with category filtering — v1 Phase 2
- Category-specific visual treatments — v1 Phase 2
- Services page with offerings — v1 Phase 2
- Calendly booking integration — v1 Phase 2
- Responsive design across devices — v1 Phase 1
- Fast load times with optimized media — v1 Phase 1
- Pinterest-style masonry photo grid with blurhash placeholders — v1.1 Phase 2
- Supabase Storage + Postgres backend for gallery — v1.1 Phase 1
- Anonymous like system (device-based, optimistic UI) — v1.1 Phase 3
- Anonymous comment system with spam protection — v1.1 Phase 3
- One-tap photo download (JPEG via OffscreenCanvas) — v1.1 Phase 3
- Warm/cute gallery theme isolated via route groups — v1.1 Phase 1
- Mobile-first gallery layout for non-tech audience — v1.1 Phase 2
- Photo lightbox with zoom, swipe, and download — v1.1 Phase 2
- Upload tooling (sharp resize + blurhash generation) — v1.1 Phase 1
- Dedicated event gallery pages (Press Club, College Thursday) — v1.2
- Per-photo download system (instant web-size + full-res email queue) — v1.2
- Download session page with ZIP bundling and 72-hour token expiry — v1.2
- Nexus event gallery hub with per-event photo previews — v1.2
- Cinema triptych video showcase on landing page — v1.2
- Services redesign with 4 dedicated subpages (photography, videography, technical, custom) — v1.2
- Lead capture forms on event gallery pages — v1.2
- Nessus CRM analytics integration (page visits + custom events) — v1.2
- Book Us FAB and promo popup on event pages — v1.2
- Chocolate-memphis theme for event pages via `(events)` route group — v1.2
- Real event video content in hero and triptych — v1.2
- Photography page with live Supabase photo feed — v1.2

### Active

*(No active requirements — between milestones)*

### Out of Scope

- About/Team page — the work speaks for itself
- Blog or news section — not needed
- E-commerce or payment processing — booking happens through Calendly
- Admin upload UI — photos uploaded via local script
- Real-time gallery updates — page refresh for new comments is fine
- User accounts or authentication — fully anonymous gallery

## Context

- Shrike Media is an early-stage media company doing photography, videography, and software/technical work
- Shrike Media is an early-stage media company doing photography, videography, and software/technical work
- v1 portfolio site shipped with 25 requirements (3 phases, dark cinematic design)
- v1.1 event photo gallery shipped with 15 requirements (3 phases, warm theme)
- v1.2 event platform expansion shipped with 12 requirements (organic development)
- Live event galleries: Press Club (300+ photos), College Thursday (784 photos)
- Gallery pages shared via direct URL; Nexus hub at `/nexus` links to all events
- Supabase project: `lualkffegfusyibldvqn` (us-east-1, Free plan)
- 5 Supabase tables: events, photos, photo_likes, photo_comments, download_sessions
- Nessus CRM integration for analytics (separate Supabase project)
- Three route groups: `(main)` dark theme, `(events)` chocolate-memphis theme, `(gallery)` warm theme

## Constraints

- **Hosting**: Vercel (Next.js)
- **Backend**: Supabase Free plan (Storage + Database)
- **Auth**: None — fully anonymous, device-based tracking for gallery
- **Design**: Main site = dark cinematic | Events = chocolate-memphis | Gallery = warm/cute (route group isolation)
- **Analytics**: Nessus CRM via Supabase edge functions (separate project)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No About/Team page | Work speaks for itself, keeps site focused | Good |
| Dark cinematic design | Conveys elite creative engineering identity | Good |
| Hardcoded content | Simplicity for v1, avoids CMS complexity | Good |
| Unified booking flow | One Calendly for media + technical, reduces friction | Good |
| Full-screen video hero | Maximum first-impression impact in first 3 seconds | Good |
| Category-based portfolio | Clear separation of Photography / Videography / Software | Good |
| Supabase for gallery backend | Storage + DB in one place, MCP tools for management | Good |
| Anonymous gallery interactions | Zero friction for non-tech-savvy audience, device-based likes | Good |
| Single /gallery route | Re-skin per event rather than multi-event routing, simpler | Good |
| No gallery link in main nav | Gallery is client-facing, not part of portfolio site | Good |
| Warm/cute gallery design | Matches winery audience expectations, distinct from main site | Good |
| CSS z-index blurhash layering | Eliminates JS timing issues with cached images and hydration | Good |
| JPEG downloads via OffscreenCanvas | Standard format, universal device support | Good |
| Post-hoc moderation with profanity filter | Preserves live event energy, word filter covers 99% | Good |
| Dedicated event routes over query params | `/events/pressclub` cleaner than `/gallery?event=...` for sharing | Good |
| Per-photo download with email queue | Two-tier: instant web-size (no gate) + full-res (email-gated) | Good |
| localStorage download queue persistence | Queue survives page reloads, no auth needed | Good |
| Token-based download pages (72h expiry) | Simple, no auth, time-limited access to full-res | Good |
| Client-side ZIP via JSZip | No server-side bundling needed, works on free tier | Good |
| Nessus CRM for analytics | Own tracking system, no third-party analytics dependency | Good |
| Chocolate-memphis theme for events | Distinct from main site and generic gallery, fun/energetic | Good |
| Services subpages over single page | Each service gets dedicated space, better SEO | Good |
| Cinema triptych with real video | Shows capability immediately, auto-rotates content | Good |

---
*Last updated: 2026-02-15 after v1.2 cleanup milestone*
