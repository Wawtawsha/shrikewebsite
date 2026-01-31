# Requirements: Shrike Media

**Defined:** 2026-01-30
**Core Value:** When someone lands on this site, they must immediately feel they're looking at the work of elite creative engineers who can solve any problem.

## v1 Requirements

### Hero & Landing

- [ ] **HERO-01**: Full-screen video showreel plays behind Shrike Media name on landing
- [ ] **HERO-02**: Subtle animated scroll-down indicator cues user to explore
- [ ] **HERO-03**: Mobile devices display optimized static image fallback instead of video
- [ ] **HERO-04**: Hero loads fast — video streams progressively, no blank screen waiting

### Portfolio

- [ ] **PORT-01**: Portfolio page with category filtering (Photography / Videography / Software)
- [ ] **PORT-02**: Thumbnail grid layout with cinematic hover effects revealing project info
- [ ] **PORT-03**: Lightbox / detail view expands on click with project description and media
- [ ] **PORT-04**: Projects animate in with scroll-driven reveal effects as user scrolls down

> **Review gate:** PORT-01 through PORT-04 to be reviewed after implementation — owner wants to evaluate execution before committing to keeping all four.

### Services & Booking

- [ ] **SERV-01**: Services overview section describing media production and technical consulting
- [ ] **SERV-02**: Service type selector — user picks Photography, Videography, or Technical Consultation
- [ ] **SERV-03**: Embedded Calendly scheduling widget for direct booking
- [ ] **SERV-04**: "Contact us for pricing" approach — no visible pricing, consultative model

### Animations & Interactions

- [ ] **ANIM-01**: Smooth scrolling throughout the site via Lenis
- [ ] **ANIM-02**: Cinematic page transitions between routes
- [ ] **ANIM-03**: Micro-interactions on hover effects, button animations, and subtle motion elements
- [ ] **ANIM-04**: Parallax depth effects on scroll for cinematic sections

> **Review gate:** ANIM-01 through ANIM-04 to be reviewed after implementation — owner wants to evaluate execution before committing to keeping all four.

### Design & Visual

- [x] **DSGN-01**: Dark cinematic color scheme with dramatic lighting and moody atmosphere
- [ ] **DSGN-02**: Each portfolio category has distinct visual treatment appropriate to the medium
- [x] **DSGN-03**: Typography that conveys premium quality and technical precision
- [x] **DSGN-04**: Consistent dark theme across all pages and components

### Technical & Performance

- [x] **TECH-01**: Fully responsive design across mobile, tablet, and desktop
- [x] **TECH-02**: SEO optimization — meta tags, Open Graph, structured data for portfolio items
- [x] **TECH-03**: Accessibility — prefers-reduced-motion support, keyboard navigation, screen reader friendly
- [ ] **TECH-04**: Lighthouse performance score 90+ despite rich media and animations
- [x] **TECH-05**: Optimized media loading — lazy loading, progressive video, WebP/AVIF images

## v2 Requirements

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

## Out of Scope

| Feature | Reason |
|---------|--------|
| About/Team page | Work speaks for itself — owner's explicit decision |
| CMS or admin panel | Hardcoded content for v1 simplicity |
| Blog | No content strategy yet; deferred to v2 |
| E-commerce / payments | Booking through Calendly, no direct payment |
| User accounts / auth | Public-facing portfolio site only |
| Visible pricing / packages | Consultative "contact for pricing" model instead |
| 3D / WebGL effects | High execution risk, can backfire if not perfect |
| Real-time chat | Overkill for portfolio site |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HERO-01 | Phase 2 | Pending |
| HERO-02 | Phase 2 | Pending |
| HERO-03 | Phase 2 | Pending |
| HERO-04 | Phase 2 | Pending |
| PORT-01 | Phase 2 | Pending |
| PORT-02 | Phase 2 | Pending |
| PORT-03 | Phase 2 | Pending |
| PORT-04 | Phase 2 | Pending |
| SERV-01 | Phase 2 | Pending |
| SERV-02 | Phase 2 | Pending |
| SERV-03 | Phase 2 | Pending |
| SERV-04 | Phase 2 | Pending |
| ANIM-01 | Phase 3 | Pending |
| ANIM-02 | Phase 3 | Pending |
| ANIM-03 | Phase 3 | Pending |
| ANIM-04 | Phase 3 | Pending |
| DSGN-01 | Phase 1 | Complete |
| DSGN-02 | Phase 2 | Pending |
| DSGN-03 | Phase 1 | Complete |
| DSGN-04 | Phase 1 | Complete |
| TECH-01 | Phase 1 | Complete |
| TECH-02 | Phase 1 | Complete |
| TECH-03 | Phase 1 | Complete |
| TECH-04 | Phase 3 | Pending |
| TECH-05 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0

**Phase distribution:**
- Phase 1 (Performance Foundation): 7 requirements
- Phase 2 (Rich Media & Core Features): 13 requirements
- Phase 3 (Cinematic Polish & Performance): 5 requirements

---
*Requirements defined: 2026-01-30*
*Last updated: 2026-01-31 after Phase 1 completion*
