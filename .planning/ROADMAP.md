# Roadmap: Shrike Media

**Created:** 2026-01-30
**Current milestone:** v1.1 Event Photo Gallery
**Core Value:** When someone lands on this site, they must immediately feel they're looking at the work of elite creative engineers who can solve any problem.

---

## v1 Phases (Complete)

### Phase 1: Performance Foundation — COMPLETE
### Phase 2: Rich Media & Core Features — COMPLETE
### Phase 3: Cinematic Polish & Performance — COMPLETE

**v1 total: 25/25 requirements, 7/7 plans, 3/3 phases**

---

## v1.1 Phases — Event Photo Gallery

### Phase 1: Gallery Foundation & Infrastructure — COMPLETE

**Goal:** Restructure the app for dual-theme support, set up Supabase backend, create upload tooling, and verify the main site is unbroken.

**Requirements:**
- GALL-01: Route group architecture (separate root layout for gallery)
- GALL-02: Supabase backend on Free plan (Storage bucket + DB)
- GALL-03: Database schema (events, photos, photo_likes, photo_comments + RLS + triggers)
- GALL-04: Upload tooling (sharp resize + blurhash + Supabase upload script)

**Success Criteria:**
1. Existing main site works identically at `/`, `/services`, `/work` after route group restructure
2. `app/(gallery)/gallery/` route renders a placeholder page with the warm theme, no dark theme bleeding
3. Supabase bucket `event-photos` exists with correct RLS policies (public read, authenticated write)
4. All four DB tables created with RLS, indexes, UNIQUE constraints, and like-count trigger functioning
5. Upload script processes a batch of test photos: resizes to thumbnail (400px) + full (1600px), generates blurhash, uploads to Storage, inserts metadata rows

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Route group restructure + CSS theme split + Supabase client setup
- [x] 01-02-PLAN.md — Database schema + RLS + triggers + upload tooling with sharp/blurhash

---

### Phase 2: Gallery Display & Design — COMPLETE

**Goal:** Build the visible gallery experience — masonry grid, lightbox, progressive loading, warm visual design, and mobile-first responsive layout.

**Requirements:**
- GALL-05: Masonry grid via react-photo-album
- GALL-06: Progressive loading via "Load More" button
- GALL-07: Photo lightbox via yet-another-react-lightbox
- GALL-08: Blur placeholders via blurhash
- GALL-13: Warm/cute visual theme
- GALL-14: Mobile-first responsive layout

**Success Criteria:**
1. Gallery page at `/gallery?event={slug}` renders photos in a Pinterest-style masonry grid with correct aspect ratios
2. First 50 photos render server-side (in HTML); "Load More" button fetches next 50 with progress indicator
3. Tapping a photo opens lightbox with full-size image, pinch-to-zoom on mobile, swipe to navigate, ESC/tap-outside to close
4. Photos show blurhash placeholder instantly, replaced by actual image when loaded
5. Gallery uses warm oklch palette (cream, coral, warm browns) with zero dark theme artifacts
6. Layout is 2 cols on phone, 3 on tablet, 4-5 on desktop; all interactive elements have min 48px tap targets

**Plans:** 2 plans

Plans:
- [x] 02-01-PLAN.md — Masonry grid + progressive loading + blurhash placeholders + Server Component data flow
- [x] 02-02-PLAN.md — Lightbox with zoom/swipe + warm theme CSS polish + mobile-first responsive design

---

### Phase 3: Social Features & Polish

**Goal:** Add anonymous like/comment interactions with spam protection, moderation capability, photo download, and final UX polish.

**Requirements:**
- GALL-09: Anonymous likes
- GALL-10: Anonymous comments
- GALL-11: Spam protection
- GALL-12: Post-hoc moderation
- GALL-15: One-tap photo download

**Success Criteria:**
1. User can tap heart to like a photo; heart animates, count increments optimistically; unliking works; same device cannot double-like (UNIQUE constraint)
2. User can post a comment with optional display name; comment appears immediately; 500 char limit enforced
3. Spam protection active: honeypot rejects bot fills, time check rejects sub-2-second submissions, profanity filter catches obvious words, rate limit trigger blocks >3 comments per 5 minutes per device
4. Gallery owner can delete comments via admin mechanism (service role key endpoint)
5. Download button in lightbox triggers native file download of full-size photo
6. All interactions feel instant on mobile — optimistic UI, no loading spinners for likes

**Plans:** 2 plans

Plans:
- [ ] 03-01-PLAN.md — Anonymous likes with device ID + optimistic UI + anonymous comments with form/display
- [ ] 03-02-PLAN.md — Spam protection layers + moderation endpoint + photo download + final UX polish

---

## Progress Tracker

| Phase | Status | Requirements | Plans | Progress |
|-------|--------|--------------|-------|----------|
| v1 Phase 1 | Complete | 7 | 2/2 | 100% |
| v1 Phase 2 | Complete | 13 | 3/3 | 100% |
| v1 Phase 3 | Complete | 5 | 2/2 | 100% |
| v1.1 Phase 1 - Foundation | Complete | 4 | 2/2 | 100% |
| v1.1 Phase 2 - Display & Design | Complete | 6 | 2/2 | 100% |
| v1.1 Phase 3 - Social & Polish | Planned | 5 | 2 plans | 0% |

**v1 Total:** 25 requirements, 7 plans — COMPLETE
**v1.1 Total:** 15 requirements, 6 plans — IN PROGRESS

---

## Dependencies

```
v1.1 Phase 1 (Foundation) — COMPLETE
    |
v1.1 Phase 2 (Display) — depends on route groups, Supabase setup, uploaded test photos
    |
v1.1 Phase 3 (Social) — depends on gallery UI being in place to add interactions to
```

**Key dependency notes:**
- Phase 1 restructures the app; Phase 2 cannot start until route groups work and test data exists
- Phase 2 builds the read-only gallery; Phase 3 adds write operations (likes/comments) on top
- Upload tooling (Phase 1) must produce test data for Phase 2 to render
- The warm theme (Phase 2) must be in place before social UI (Phase 3) can be styled

---

## Key Technical Decisions (v1.1)

| Decision | Rationale |
|----------|-----------|
| Route groups with separate root layouts | Clean theme isolation, no conditional logic, standard Next.js pattern |
| Supabase Free plan + sharp resize | Avoids $25/mo Pro plan; resize at upload time instead of on-the-fly transforms |
| `@supabase/supabase-js` (not `@supabase/ssr`) | No auth = no cookie management needed; simpler |
| react-photo-album + yet-another-react-lightbox | Purpose-built, React 19 tested, SSR support, same author ecosystem |
| "Load More" button (not infinite scroll) | Target audience prefers control and orientation; UX research supports this |
| localStorage device ID (not cookies/fingerprinting) | Simplest, zero friction, sufficient for private events |
| Postgres trigger for rate limiting | Server-enforced, no external dependencies, uses existing device_id |
| Post-hoc moderation (not pre-moderation) | Preserves live event energy; word filter + rate limit handle 99% of cases |
| Denormalized like_count via trigger | Avoids expensive COUNT(*) on every photo render |
| Two image sizes at upload (thumb + full) | Free plan has no transforms; sharp handles this at upload time |

---

*Roadmap created: 2026-01-30*
*v1 phases complete: 2026-02-01*
*v1.1 roadmap added: 2026-02-08*
*v1.1 Phase 2 planned: 2026-02-08*
*v1.1 Phase 3 planned: 2026-02-08*
