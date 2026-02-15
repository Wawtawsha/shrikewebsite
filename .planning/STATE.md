# State: Shrike Media

**Last Updated:** 2026-02-15

---

## Project Reference

**Project file:** `.planning/PROJECT.md` (updated 2026-02-15)

**Core value:** When someone lands on this site, they must immediately feel they're looking at the work of elite creative engineers who can solve any problem.

**Current focus:** Between milestones — v1.2 complete, ready for v1.3 or v2.0

---

## Current Position

**Phase:** None (between milestones)
**Plan:** None
**Status:** v1.2 milestone cataloged
**Progress:** N/A

**Last activity:** 2026-02-15 — Cleanup milestone: cataloged all post-v1.1 work as v1.2

---

## Milestone History

| Milestone | Completed | Requirements | Phases |
|-----------|-----------|-------------|--------|
| v1.0 — Dark Cinematic Portfolio | 2026-02-01 | 25/25 | 3 |
| v1.1 — Event Photo Gallery | 2026-02-08 | 15/15 | 3 |
| v1.2 — Event Platform & Services Expansion | 2026-02-15 | 12/12 | organic |

**Total shipped:** 52 requirements across 3 milestones

---

## Accumulated Context

### Architecture

- **Route groups:** `(main)` dark cinematic, `(events)` chocolate-memphis, `(gallery)` warm theme
- **Supabase project:** `lualkffegfusyibldvqn` (us-east-1, Free plan)
- **Supabase tables:** events, photos, photo_likes, photo_comments, download_sessions
- **Analytics:** Nessus CRM via separate Supabase project (edge functions)
- **Hosting:** Vercel (Next.js 16.1.6)

### Live Event Galleries

| Event | Route | Photos | Status |
|-------|-------|--------|--------|
| 2016 Night at Press Club | `/events/pressclub` | 300+ | Live |
| College Thursday | `/events/collegethursday` | 784 | Live |

### Key Technical Notes

- CSS z-index blurhash approach (not JS load detection)
- `toAlbumPhotos()` must always be memoized with `useMemo`
- Playwright blade buttons outside viewport — use `form.requestSubmit()` workaround
- Vercel auto-deploy sometimes doesn't trigger — use `npx vercel --prod` as fallback
- Download queue persists to localStorage per event (`download-queue-{eventId}`)
- DB column is `author_name` (not `display_name`)

### Active TODOs

- [ ] Test on actual mobile device
- [ ] Add Resend email delivery for download links (currently direct redirect only)
- [ ] Add more events to Nexus hub (SAE, Theta Chi noted as TODOs in code)

### Blockers

None

---

## Session Continuity

**Last session:** 2026-02-15 — Cleanup milestone
**Session outcome:** All planning docs updated to reflect v1.2

**Stopped at:** Between milestones
**Resume file:** None

**Context for next session:**
- All planning docs current as of 2026-02-15
- `MILESTONES.md` has v1.0, v1.1, v1.2 entries
- Next step: `/gsd:new-milestone` when ready for v1.3 or v2.0

---

*State file initialized: 2026-01-30*
*Last updated: 2026-02-15 after v1.2 cleanup milestone*
