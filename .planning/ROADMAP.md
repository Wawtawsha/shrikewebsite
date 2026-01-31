# Roadmap: Shrike Media

**Created:** 2026-01-30
**Depth:** Quick (3-5 phases, 1-3 plans each)
**Core Value:** When someone lands on this site, they must immediately feel they're looking at the work of elite creative engineers who can solve any problem.

---

## Phase 1: Performance Foundation

**Goal:** Establish fast, responsive infrastructure that proves technical capability before adding visual richness.

**Requirements:**
- TECH-01: Fully responsive design across mobile, tablet, and desktop
- TECH-02: SEO optimization — meta tags, Open Graph, structured data for portfolio items
- TECH-03: Accessibility — prefers-reduced-motion support, keyboard navigation, screen reader friendly
- TECH-05: Optimized media loading — lazy loading, progressive video, WebP/AVIF images
- DSGN-01: Dark cinematic color scheme with dramatic lighting and moody atmosphere
- DSGN-03: Typography that conveys premium quality and technical precision
- DSGN-04: Consistent dark theme across all pages and components

**Success Criteria:**
1. User can access the site from mobile, tablet, or desktop and see properly scaled layout with no horizontal scroll
2. User can navigate the entire site using only keyboard (Tab, Enter, Escape)
3. User sees dark cinematic theme consistently across all pages with premium typography
4. Search engines can crawl and index all pages with proper metadata and structured data
5. User on slow connection sees optimized images (WebP/AVIF) that load progressively with blur placeholders

**Plans:** 2 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold Next.js 16 with dark theme, typography, responsive layout, and navigation
- [ ] 01-02-PLAN.md — SEO metadata, JSON-LD structured data, sitemap, accessibility, image optimization

---

## Phase 2: Rich Media & Core Features

**Goal:** Deliver cinematic hero experience, portfolio showcase, and booking conversion path.

**Requirements:**
- HERO-01: Full-screen video showreel plays behind Shrike Media name on landing
- HERO-02: Subtle animated scroll-down indicator cues user to explore
- HERO-03: Mobile devices display optimized static image fallback instead of video
- HERO-04: Hero loads fast — video streams progressively, no blank screen waiting
- PORT-01: Portfolio page with category filtering (Photography / Videography / Software)
- PORT-02: Thumbnail grid layout with cinematic hover effects revealing project info
- PORT-03: Lightbox / detail view expands on click with project description and media
- PORT-04: Projects animate in with scroll-driven reveal effects as user scrolls down
- SERV-01: Services overview section describing media production and technical consulting
- SERV-02: Service type selector — user picks Photography, Videography, or Technical Consultation
- SERV-03: Embedded Calendly scheduling widget for direct booking
- SERV-04: "Contact us for pricing" approach — no visible pricing, consultative model
- DSGN-02: Each portfolio category has distinct visual treatment appropriate to the medium

**Success Criteria:**
1. User lands on homepage and immediately sees full-screen video showreel playing behind brand name (desktop) or cinematic static image (mobile)
2. User can filter portfolio by Photography, Videography, or Software and see only relevant projects
3. User can click any portfolio item to view full project details in lightbox with description and media
4. User can select a service type and book a consultation directly via embedded Calendly widget
5. Video hero loads progressively — user sees poster frame instantly, video streams in background without blocking interaction

**Plans:** 0 (created during /gsd:plan-phase 2)

---

## Phase 3: Cinematic Polish & Performance

**Goal:** Add scroll-driven animations and microinteractions that differentiate from competitors while maintaining 60fps performance.

**Requirements:**
- ANIM-01: Smooth scrolling throughout the site via Lenis
- ANIM-02: Cinematic page transitions between routes
- ANIM-03: Micro-interactions on hover effects, button animations, and subtle motion elements
- ANIM-04: Parallax depth effects on scroll for cinematic sections
- TECH-04: Lighthouse performance score 90+ despite rich media and animations

**Success Criteria:**
1. User experiences buttery smooth scrolling throughout the site (Lenis integration)
2. User sees portfolio items and sections reveal with scroll-driven animations as they scroll down the page
3. User hovers over buttons, portfolio items, and interactive elements and sees smooth microinteractions respond immediately
4. User runs Lighthouse audit and sees performance score 90+ with LCP < 2.5s and CLS < 0.1
5. User with motion sensitivity preferences enabled (prefers-reduced-motion) sees crossfade transitions instead of parallax, no vestibular-triggering animations

**Plans:** 0 (created during /gsd:plan-phase 3)

---

## Progress Tracker

| Phase | Status | Requirements | Plans | Progress |
|-------|--------|--------------|-------|----------|
| 1 - Performance Foundation | ● Planning | 7 | 0/2 | 0% |
| 2 - Rich Media & Core Features | ○ Pending | 13 | 0/? | 0% |
| 3 - Cinematic Polish & Performance | ○ Pending | 5 | 0/? | 0% |

**Total Requirements:** 25 v1 requirements
**Coverage:** 25/25 (100%)

---

## Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (Media & Features) — depends on responsive layout, dark theme, image optimization
    ↓
Phase 3 (Polish) — depends on all content and features being in place
```

**Key dependency notes:**
- Phase 2 requires Phase 1's responsive layout system and optimized media pipeline
- Phase 3 animations require Phase 2's content to be complete (can't animate what doesn't exist)
- Motion accessibility (TECH-03) established in Phase 1, enforced in Phase 3 animations

---

## Review Gates

**PORT-01 through PORT-04** — Owner wants to evaluate portfolio implementation before committing to keeping all four requirements. Review after Phase 2 completion.

**ANIM-01 through ANIM-04** — Owner wants to evaluate animation execution before committing to keeping all four requirements. Review after Phase 3 completion.

---

*Roadmap created: 2026-01-30*
*Next action: /gsd:execute-phase 1*
