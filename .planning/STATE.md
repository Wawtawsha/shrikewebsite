# State: Shrike Media

**Last Updated:** 2026-01-31

---

## Project Reference

**Project file:** `.planning/PROJECT.md` (updated 2026-01-30)

**Core value:** When someone lands on this site, they must immediately feel they're looking at the work of elite creative engineers who can solve any problem.

**Current focus:** Phase 2 - Rich Media & Core Features

---

## Current Position

**Phase:** 2 of 3 (Rich Media & Core Features)
**Plan:** 3 of 3 complete (02-01, 02-02, 02-03)
**Status:** Phase complete
**Progress:** ~71% (Phase 1 + Phase 2 complete)

**Last activity:** 2026-01-31 - Completed 02-03-PLAN.md (services page + Calendly)

**Progress bar:**
```
██████████████████░░░░░░░░ 71%
```

---

## Progress Overview

| Phase | Status | Plans | Requirement Coverage |
|-------|--------|-------|---------------------|
| 1 - Performance Foundation | ✅ Complete | 2/2 | 7 reqs (TECH-01, TECH-02, TECH-03, TECH-05, DSGN-01, DSGN-03, DSGN-04) |
| 2 - Rich Media & Core Features | ✅ Complete | 3/3 | 13 reqs (HERO-01–04, PORT-01–04, SERV-01–04, DSGN-02) |
| 3 - Cinematic Polish & Performance | ○ Pending | 0/? | 5 reqs (ANIM-01–04, TECH-04) |

**Total phases:** 3
**Total requirements:** 25
**Coverage:** 25/25 (100%)

---

## Performance Metrics

### Current
- Lighthouse Performance: Not measured
- LCP: Not measured (next/font with display:swap configured)
- CLS: Not measured (sticky nav may impact)
- FID: Not measured

### Targets (Phase 3)
- Lighthouse Performance: 90+
- LCP: < 2.5s
- CLS: < 0.1
- FID: < 100ms

---

## Accumulated Context

### Decisions Made

| Date | Phase | Decision | Rationale |
|------|-------|----------|-----------|
| 2026-01-30 | Roadmap | Three-phase roadmap: Foundation → Media → Polish | Research-driven approach (performance infrastructure before visual polish) |
| 2026-01-30 | Roadmap | Motion accessibility (TECH-03) established in Phase 1 | Enforce early to avoid retrofit |
| 2026-01-30 | Roadmap | Portfolio and animation requirements flagged for review gates | Owner wants to evaluate execution before committing |
| 2026-01-30 | 01-01 | Dark mode enforced via className='dark' on html | Prevent flash of unstyled content |
| 2026-01-30 | 01-01 | Tailwind v4 with oklch colors | Perceptually uniform dark cinematic palette (no banding) |
| 2026-01-30 | 01-01 | Premium typography: Inter (body), Geist (headlines), Source Code Pro (mono) | Readability + modern bold aesthetic + technical messaging |
| 2026-01-30 | 01-01 | Responsive navigation: sticky header with mobile hamburger | Desktop inline nav, mobile menu, ARIA landmarks, keyboard support |
| 2026-01-30 | 01-01 | Next.js 16 dynamic routes with async params | Follow Next.js 16 best practices for [slug] routes |
| 2026-01-31 | 01-02 | SITE_URL from env var with fallback | Defaults to https://shrikemedia.com, allows override for staging/preview |
| 2026-01-31 | 01-02 | Title template: "%s \| Shrike Media" | Consistent branding across all pages |
| 2026-01-31 | 01-02 | AVIF prioritized over WebP | Better compression ratios, Next.js falls back automatically |
| 2026-01-31 | 01-02 | Global motion accessibility enforcement | All animations/transitions disabled when prefers-reduced-motion active |
| 2026-01-31 | 01-02 | JSON-LD structured data (Organization + CreativeWork) | schema.org best practice for search engines |
| 2026-01-30 | 02-01 | matchMedia for mobile video fallback | Conditional render (video vs OptimizedImage) requires JS, not CSS-only |
| 2026-01-31 | 02-02 | Native dialog over div+z-index for lightbox | Free focus trapping, ESC close, backdrop, accessibility |
| 2026-01-31 | 02-02 | URL search params for portfolio filtering | Shareable/bookmarkable filter state, SEO-friendly |
| 2026-01-31 | 02-02 | Suspense boundary with skeleton fallback | Required by useSearchParams; skeleton matches grid layout |
| 2026-01-31 | 02-03 | Server-client split for services page | SEO metadata in server component, interactivity in client wrapper |

### Active TODOs
- [x] SEO foundation (01-02 complete) - sitemap, robots, metadata, JSON-LD ✅
- [ ] Continue Phase 1 plans (remaining: analytics, performance monitoring, error tracking)
- [ ] Add og-image.jpg to public/ directory (referenced in metadata but not yet created)
- [ ] Review research flags: Calendly performance impact, video codec comparison, GSAP ScrollTrigger patterns
- [ ] Establish performance testing device matrix (mid-range devices)
- [ ] Measure baseline Lighthouse scores after Phase 1 complete

### Blockers
None

### Notes
- Research recommends foundation-first approach: performance infrastructure before visual polish ✅ Completed 01-01
- Review gates set for PORT-01–04 and ANIM-01–04 — owner wants to evaluate execution before committing
- Depth setting = quick (3-5 phases, 1-3 plans each)
- Build passing with 0 errors (Next.js 16.1.6 Turbopack)
- All routes render: /, /work, /services, /work/[slug], 404
- SEO infrastructure complete (01-02): sitemap.xml, robots.txt, Open Graph, Twitter Cards, JSON-LD
- Motion accessibility enforced globally via CSS (prefers-reduced-motion respected)
- Image optimization ready: OptimizedImage component + AVIF/WebP formats configured

---

## Session Continuity

**Last session:** 2026-01-31 — Phase 2 verified and completed
**Session outcome:** All 13 requirements verified. 1 gap fixed (lightbox thumbnail rendering).

**Stopped at:** Phase 2 complete
**Resume file:** None

**Context for next session:**
- Phase 2 COMPLETE: All 13 requirements verified (HERO-01-04, PORT-01-04, SERV-01-04, DSGN-02)
- Hero: full-screen video with mobile fallback, scroll indicator
- Portfolio: category filtering, cinematic cards, native dialog lightbox, scroll reveals
- Services: 3-card selector, Calendly embed (placeholder URL), no pricing
- Calendly URL placeholder needs real account URL
- Build passing, all routes render with real data
- Ready for Phase 3: Cinematic Polish & Performance (Lenis, GSAP, page transitions)

---

*State file initialized: 2026-01-30*
*Last updated: 2026-01-31 after 02-03 completion*
