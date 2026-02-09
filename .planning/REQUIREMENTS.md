# Requirements: Shrike Media

**Defined:** 2026-01-30
**Core Value:** When someone lands on this site, they must immediately feel they're looking at the work of elite creative engineers who can solve any problem.

## v1 Requirements (Complete)

### Hero & Landing

- [x] **HERO-01**: Full-screen video showreel plays behind Shrike Media name on landing
- [x] **HERO-02**: Subtle animated scroll-down indicator cues user to explore
- [x] **HERO-03**: Mobile devices display optimized static image fallback instead of video
- [x] **HERO-04**: Hero loads fast — video streams progressively, no blank screen waiting

### Portfolio

- [x] **PORT-01**: Portfolio page with category filtering (Photography / Videography / Software)
- [x] **PORT-02**: Thumbnail grid layout with cinematic hover effects revealing project info
- [x] **PORT-03**: Lightbox / detail view expands on click with project description and media
- [x] **PORT-04**: Projects animate in with scroll-driven reveal effects as user scrolls down

### Services & Booking

- [x] **SERV-01**: Services overview section describing media production and technical consulting
- [x] **SERV-02**: Service type selector — user picks Photography, Videography, or Technical Consultation
- [x] **SERV-03**: Embedded Calendly scheduling widget for direct booking
- [x] **SERV-04**: "Contact us for pricing" approach — no visible pricing, consultative model

### Animations & Interactions

- [x] **ANIM-01**: Smooth scrolling throughout the site via Lenis
- [x] **ANIM-02**: Cinematic page transitions between routes
- [x] **ANIM-03**: Micro-interactions on hover effects, button animations, and subtle motion elements
- [x] **ANIM-04**: Parallax depth effects on scroll for cinematic sections

### Design & Visual

- [x] **DSGN-01**: Dark cinematic color scheme with dramatic lighting and moody atmosphere
- [x] **DSGN-02**: Each portfolio category has distinct visual treatment appropriate to the medium
- [x] **DSGN-03**: Typography that conveys premium quality and technical precision
- [x] **DSGN-04**: Consistent dark theme across all pages and components

### Technical & Performance

- [x] **TECH-01**: Fully responsive design across mobile, tablet, and desktop
- [x] **TECH-02**: SEO optimization — meta tags, Open Graph, structured data for portfolio items
- [x] **TECH-03**: Accessibility — prefers-reduced-motion support, keyboard navigation, screen reader friendly
- [x] **TECH-04**: Lighthouse performance score 90+ despite rich media and animations
- [x] **TECH-05**: Optimized media loading — lazy loading, progressive video, WebP/AVIF images

---

## v1.1 Requirements — Event Photo Gallery

**Goal:** Pinterest-style photo gallery for delivering event photos to clients, with anonymous social features.
**Target audience:** Women 30-60, primarily mobile, not tech-savvy. Zero friction is non-negotiable.

### Gallery Foundation

- [x] **GALL-01**: Route group architecture — `/gallery` with separate root layout, completely isolated from main site's dark theme, Navigation, Footer, and Lenis
- [x] **GALL-02**: Supabase backend on Free plan — public Storage bucket for photos, Postgres DB for metadata/likes/comments
- [x] **GALL-03**: Database schema — `events`, `photos`, `photo_likes`, `photo_comments` tables with RLS policies, indexes, and like-count trigger
- [x] **GALL-04**: Upload tooling — local Node script using `sharp` to resize photos (thumbnail ~400px + full-size ~1600px) and generate blurhash, then upload to Supabase Storage with metadata INSERT

### Gallery Display

- [x] **GALL-05**: Pinterest-style masonry grid using `react-photo-album` MasonryPhotoAlbum with aspect-ratio-preserving layout
- [x] **GALL-06**: Progressive loading via "Load More" button — 50 photos per batch, progress indicator ("Showing 50 of 347 photos"), Server Component renders first batch
- [x] **GALL-07**: Photo lightbox via `yet-another-react-lightbox` — full-size image, pinch-to-zoom, swipe navigation, keyboard support
- [x] **GALL-08**: Blur placeholders — blurhash strings decoded client-side for instant visual feedback while images load

### Gallery Social

- [x] **GALL-09**: Anonymous likes — localStorage device ID (`crypto.randomUUID()`), `UNIQUE(photo_id, device_id)` constraint, denormalized `like_count` via Postgres trigger, optimistic UI toggle
- [x] **GALL-10**: Anonymous comments — optional display name (default "Guest"), 500 char limit, DB constraints for length and non-empty
- [x] **GALL-11**: Spam protection — honeypot field + 2-second time check on comment form, `obscenity` npm package for profanity filter, Postgres trigger rate limit (max 3 comments per device per 5 minutes)
- [x] **GALL-12**: Post-hoc moderation — `is_visible` flag on comments, owner delete via service role key (admin secret in URL or separate endpoint)

### Gallery Design

- [x] **GALL-13**: Warm/cute visual theme — oklch warm palette (cream background, coral accent, warm browns), completely distinct from dark cinematic main site
- [x] **GALL-14**: Mobile-first responsive layout — 2 cols phone, 3 cols tablet, 4-5 cols desktop; large tap targets (min 48px); intuitive for non-tech audience
- [x] **GALL-15**: One-tap photo download — download button in lightbox, uses native download attribute

---

## v2 Requirements (Future)

### Content Depth

- **CONT-01**: Deep case studies per project — process, challenges, results (500-1000 words)
- **CONT-02**: Video case studies with behind-the-scenes footage
- **CONT-03**: Technical blog showcasing software engineering expertise

### Enhanced Interactions

- **INTX-01**: Animated logo reveal on landing
- **INTX-02**: Custom cursor effects
- **INTX-03**: Kinetic typography in hero or section headers

### Content Management

- **CMS-01**: Admin interface to add/edit portfolio items without code changes
- **CMS-02**: Image/video upload pipeline with automatic optimization

## Out of Scope (v1.1)

| Feature | Reason |
|---------|--------|
| Multi-event routing | Single `/gallery` route, re-skinned per event via query param |
| Admin upload UI | Owner uploads via local script or Supabase dashboard |
| Photo editing/cropping | Photos served as-is |
| Real-time updates | Page refresh for new comments is fine |
| User accounts / auth | Fully anonymous, device-based tracking |
| Gallery link in main nav | Gallery is client-facing, shared via direct URL only |
| Supabase Pro plan features | Staying on Free — sharp resize at upload time instead of transforms |
| Browser fingerprinting | Privacy concerns, declining accuracy, overkill for private events |
| CAPTCHA | Friction for non-tech audience, no bot threat on private URL |
| Pre-moderation queue | Kills live event energy, burdens the host |

## Traceability

| Requirement | Milestone | Phase | Status |
|-------------|-----------|-------|--------|
| HERO-01 | v1 | Phase 2 | Complete |
| HERO-02 | v1 | Phase 2 | Complete |
| HERO-03 | v1 | Phase 2 | Complete |
| HERO-04 | v1 | Phase 2 | Complete |
| PORT-01 | v1 | Phase 2 | Complete |
| PORT-02 | v1 | Phase 2 | Complete |
| PORT-03 | v1 | Phase 2 | Complete |
| PORT-04 | v1 | Phase 2 | Complete |
| SERV-01 | v1 | Phase 2 | Complete |
| SERV-02 | v1 | Phase 2 | Complete |
| SERV-03 | v1 | Phase 2 | Complete |
| SERV-04 | v1 | Phase 2 | Complete |
| ANIM-01 | v1 | Phase 3 | Complete |
| ANIM-02 | v1 | Phase 3 | Complete |
| ANIM-03 | v1 | Phase 3 | Complete |
| ANIM-04 | v1 | Phase 3 | Complete |
| DSGN-01 | v1 | Phase 1 | Complete |
| DSGN-02 | v1 | Phase 2 | Complete |
| DSGN-03 | v1 | Phase 1 | Complete |
| DSGN-04 | v1 | Phase 1 | Complete |
| TECH-01 | v1 | Phase 1 | Complete |
| TECH-02 | v1 | Phase 1 | Complete |
| TECH-03 | v1 | Phase 1 | Complete |
| TECH-04 | v1 | Phase 3 | Complete |
| TECH-05 | v1 | Phase 1 | Complete |
| GALL-01 | v1.1 | Phase 1 | Complete |
| GALL-02 | v1.1 | Phase 1 | Complete |
| GALL-03 | v1.1 | Phase 1 | Complete |
| GALL-04 | v1.1 | Phase 1 | Complete |
| GALL-05 | v1.1 | Phase 2 | Complete |
| GALL-06 | v1.1 | Phase 2 | Complete |
| GALL-07 | v1.1 | Phase 2 | Complete |
| GALL-08 | v1.1 | Phase 2 | Complete |
| GALL-09 | v1.1 | Phase 3 | Complete |
| GALL-10 | v1.1 | Phase 3 | Complete |
| GALL-11 | v1.1 | Phase 3 | Complete |
| GALL-12 | v1.1 | Phase 3 | Complete |
| GALL-13 | v1.1 | Phase 2 | Complete |
| GALL-14 | v1.1 | Phase 2 | Complete |
| GALL-15 | v1.1 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 25/25 complete
- v1.1 requirements: 15/15 complete
- Total: 40/40 requirements complete

---
*Requirements defined: 2026-01-30*
*v1.1 requirements added: 2026-02-08*
