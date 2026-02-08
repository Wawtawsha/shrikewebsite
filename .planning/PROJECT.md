# Shrike Media

## What This Is

A dark, cinematic portfolio website for Shrike Media — a creative engineering company that does photography, videography, and software/technical work. The site targets businesses needing media production and serves as both a portfolio showcase and a booking gateway. The site itself is a portfolio piece: its technical execution and polished interactions prove Shrike Media's capabilities.

## Core Value

When someone lands on this site, they must immediately feel they're looking at the work of elite creative engineers who can solve any problem.

## Current Milestone: v1.1 Event Photo Gallery

**Goal:** Add a Pinterest-style photo gallery page for delivering event photos to clients, with anonymous social features (like, comment, download).

**Target features:**
- Pinterest-style masonry grid photo gallery at `/gallery`
- Supabase backend (Storage for photos, Database for likes/comments)
- Anonymous social: device-based likes, anonymous comments, one-tap download
- Mobile-first design — target audience is women 30-60 who primarily use phones
- Cute, warm aesthetic appropriate for winery event clientele
- No navigation links from main site — accessed via direct URL only
- 200-1500 photos per event, re-skinned per event (not multi-event routing)
- Basic spam protection on comments (rate limiting, character limits)

## Requirements

### Validated

- ✓ Full-screen video showreel hero — v1 Phase 2
- ✓ Dark cinematic visual design — v1 Phase 1
- ✓ Smooth scroll-driven animations and micro-interactions — v1 Phase 3
- ✓ Portfolio gallery with category filtering — v1 Phase 2
- ✓ Category-specific visual treatments — v1 Phase 2
- ✓ Services page with offerings — v1 Phase 2
- ✓ Calendly booking integration — v1 Phase 2
- ✓ Responsive design across devices — v1 Phase 1
- ✓ Fast load times with optimized media — v1 Phase 1

### Active

- [ ] Pinterest-style masonry photo grid with lazy loading for 200-1500 photos
- [ ] Supabase Storage integration for photo hosting and delivery
- [ ] Anonymous like system (device-based via localStorage, no auth)
- [ ] Anonymous comment system with basic spam protection
- [ ] One-tap photo download optimized for mobile
- [ ] Cute, warm visual design distinct from main site's dark cinematic theme
- [ ] Mobile-first responsive layout (primary audience uses phones)
- [ ] Photo lightbox/detail view with social actions

### Out of Scope

- About/Team page — the work speaks for itself
- Blog or news section — not needed
- E-commerce or payment processing — booking happens through Calendly
- User accounts or authentication — fully anonymous gallery
- Multi-event routing system — single `/gallery` route, re-skinned per event
- Admin upload UI — photos uploaded directly to Supabase Storage
- Photo editing/cropping — photos served as-is
- Real-time updates — page refresh to see new comments is fine
- Comment moderation UI — manual cleanup via Supabase dashboard if needed

## Context

- Shrike Media is an early-stage media company doing photography, videography, and software/technical work
- v1 portfolio site shipped with all 25 requirements (3 phases, dark cinematic design)
- First gallery use case: winery event, target audience women aged 30-60
- Audience is not tech-savvy — mobile-first, zero-friction interactions are critical
- Photos uploaded directly to Supabase Storage (200-1500 per event)
- Gallery page is unlisted — no nav links from main site, shared via direct URL
- Page will be re-skinned for future events (swap photos, adjust theme colors)

## Constraints

- **Backend**: Supabase (Storage + Database) — already connected via MCP
- **Auth**: None — fully anonymous, device-based like tracking
- **Design**: Cute/warm aesthetic for winery audience — NOT the dark cinematic main site theme
- **Mobile**: Must work flawlessly on phones — primary device for this audience
- **Scale**: Must handle 200-1500 photos with smooth scrolling and lazy loading
- **Upload**: Direct to Supabase Storage — no admin UI needed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No About/Team page | Work speaks for itself, keeps site focused | ✓ Good |
| Dark cinematic design | Conveys elite creative engineering identity | ✓ Good |
| Hardcoded content | Simplicity for v1, avoids CMS complexity | ✓ Good |
| Unified booking flow | One Calendly for media + technical, reduces friction | ✓ Good |
| Full-screen video hero | Maximum first-impression impact in first 3 seconds | ✓ Good |
| Category-based portfolio | Clear separation of Photography / Videography / Software | ✓ Good |
| Supabase for gallery backend | Storage + DB in one place, already connected via MCP | — Pending |
| Anonymous gallery interactions | Zero friction for non-tech-savvy audience, device-based likes | — Pending |
| Single /gallery route | Re-skin per event rather than multi-event routing, simpler | — Pending |
| No gallery link in main nav | Gallery is client-facing, not part of portfolio site | — Pending |
| Warm/cute gallery design | Matches winery audience expectations, distinct from main site | — Pending |

---
*Last updated: 2026-02-08 after v1.1 milestone start*
