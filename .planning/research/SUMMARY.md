# Project Research Summary

**Project:** Shrike Media Portfolio
**Domain:** High-end creative portfolio (photography, videography, software)
**Researched:** 2026-01-30
**Confidence:** HIGH

## Executive Summary

Shrike Media requires a **performance-first cinematic portfolio** where the site itself demonstrates technical capability. The 2026 standard for creative portfolios is Next.js 16 + React 19 + GSAP + Lenis, with heavy emphasis on Core Web Vitals as proof of engineering skill. The key insight from research: **clarity and performance beat creative gimmicks**—users evaluate technical execution before appreciating visual creativity.

The recommended approach is **server-first architecture with client islands**: Next.js App Router with Server Components as the foundation, targeted Client Components for scroll/animation control, and strategic lazy loading for video/media. This delivers cinematic feel without sacrificing performance. Video optimization via Mux, dark mode as table stakes, and Calendly integration for booking conversion are non-negotiable.

**Critical risk:** Animation-heavy creative portfolios easily become performance disasters. The research uncovered 12 pitfalls that sink creative sites—animating layout-triggering CSS properties causes jank, unoptimized video destroys mobile experience, and ignoring motion accessibility alienates 25-30% of users. Mitigation requires establishing 60fps performance budget upfront, testing on mid-range devices throughout, and implementing `prefers-reduced-motion` from day one.

## Key Findings

### Recommended Stack

The 2026 creative portfolio stack has converged on **Next.js 16 as the universal foundation** (68% adoption among JS developers), with GSAP + Lenis as the proven animation combination for Awwwards-winning sites. The stack prioritizes performance despite rich media—Server Components reduce client bundle, next/image provides automatic optimization, and GSAP delivers GPU-accelerated animations.

**Core technologies:**
- **Next.js 16.1.x + React 19**: Full-stack framework with Server Components, App Router, built-in image optimization, Turbopack stability—perfect for marketing pages with booking integration
- **TypeScript 5.x**: Type safety prevents animation logic bugs; wait for TS 7.0 (breaking changes mid-2026)
- **Tailwind CSS 4.x**: Utility-first styling with dark mode via class strategy, tiny bundle with JIT compilation
- **GSAP 3.14.x + Lenis 1.3.x**: Industry-standard animation (23KB) + cinematic smooth scroll, designed to work together via ticker sync
- **Mux + next-video**: API-first video hosting with adaptive bitrate, simpler than Cloudinary for video-only use cases
- **next/image + sharp**: Automatic WebP/AVIF conversion, lazy loading, blur placeholders—critical for performance
- **react-calendly**: Official Calendly React component with SSR handling via dynamic import
- **Vercel**: Zero-config deployment, global CDN, automatic HTTPS, tight Next.js integration

**Version specifics:** Node.js 22.x LTS (native TypeScript support), avoid TS 7.0 until mid-2026, React Three Fiber 9.5.x only if 3D needed (defer for MVP).

**Why this stack wins:** Server-side rendering for fast initial load, client-side interactivity for smooth animations, proven across Awwwards portfolios. Solves the performance-vs-richness paradox.

### Expected Features

Creative portfolios in 2026 split into **table stakes** (expected hygiene) and **differentiators** (competitive advantage). The feature landscape shifted from "looks creative" to "proves technical mastery through execution."

**Must have (table stakes):**
- **Mobile-responsive design** — 50%+ traffic is mobile, breaks trust if missing
- **Fast load times (<3s)** — performance = brand perception in 2026; slow = unprofessional
- **Full-screen hero section** — establishes tone immediately (video or static image)
- **Clear navigation (5-7 items)** — Home, Portfolio, Services, About, Contact minimum
- **Portfolio gallery with filtering** — category filtering expected (Photo/Video/Software)
- **Contact/booking integration** — 1-click contact; friction = lost leads
- **HTTPS/SSL** — security baseline; Google penalizes HTTP
- **Dark mode option** — expected standard in 2026, not just trendy
- **SEO fundamentals** — meta tags, structured data, semantic HTML
- **Accessibility basics** — alt text, keyboard nav, ARIA labels

**Should have (competitive differentiators):**
- **Scroll-driven animations** — creates cinematic narrative, proves technical skill (use GSAP ScrollTrigger)
- **Video hero (cinematic)** — immediate emotional impact, premium feel (<10s, <10MB, 720p)
- **Performance as feature** — Lighthouse 90+ proves engineering capability; measurable and brandable
- **Deep case studies** — process transparency builds trust more than perfect final images
- **Interactive microinteractions** — hover effects, animated CTAs signal craft
- **Bento grid/asymmetric layout** — modern visual interest with structure
- **3-5 curated projects** — quality > quantity; industry best practice
- **Calendly booking integration** — instant conversion vs high-friction forms
- **Real-time availability** — live calendar slots convert browsers to leads

**Defer (v2+):**
- **Video case studies** — content-heavy, requires production pipeline
- **Kinetic typography** — polish, not necessity
- **Custom cursor** — nice-to-have detail
- **Technical blog** — only if committed to 1+ post/month
- **3D/WebGL effects** — can backfire if poorly executed; skip unless flawless

**Anti-features to avoid:**
- Splash screen/intro animation (delays content access)
- Auto-play audio (universally hated)
- Scroll-jacking (breaks expectations)
- Too many portfolio items (decision paralysis)
- Generic contact forms (high friction)
- Dead blog (abandoned site signal)

### Architecture Approach

High-end portfolios in 2026 follow **server-first, client-islands architecture**: Next.js App Router with Server Components for structure, targeted Client Components for interactivity, GPU-accelerated animations via GSAP. The critical decision: default to Server Components, opt into Client Components only at interactive boundaries (scroll controllers, video players, menu interactions).

**Major components:**

1. **Server Foundation (Layer 1)** — Page layouts (app/page.tsx, portfolio/, services/), UI shell (Header, Footer), static content. Renders on server, zero client JS for static content, SEO-friendly full HTML, fast initial load.

2. **Client Islands (Layer 2)** — ScrollController (Lenis + GSAP sync, ~15KB), AnimationEngine (GSAP context provider, ~8KB), VideoHero (lazy loading, ~12KB), InteractiveMenu (mobile menu, ~6KB), FilterBar (portfolio filter, ~4KB), CalendlyEmbed (external widget). Client Components isolated to interactive boundaries requiring React hooks, browser APIs, or event handlers.

3. **Animation Architecture (Layer 3)** — GSAP + Lenis integration: ScrollController initializes Lenis smooth scroll, syncs with GSAP ticker, provides scroll context to children. Each animated section owns its GSAP context (automatic cleanup, scoped selectors, isolated timelines). Uses `useGSAP` hook for modular ScrollTrigger animations.

4. **Media Optimization (Layer 4)** — Video strategy: source selection (desktop 1080p, mobile 720p, fallback poster), lazy loading (above-fold preload, below-fold Intersection Observer), format optimization (WebM primary, MP4 fallback, H.264 codec), CDN delivery (Vercel Blob/Cloudinary). Image strategy: next/image for automatic WebP/AVIF, lazy loading, blur placeholders.

**Data flow:** Server renders structure + static content at build/request time → sends HTML + minimal JS to client → client hydrates interactive islands → user interaction triggers scroll events (Lenis → GSAP ScrollTrigger), viewport intersection (lazy load media), route changes (prefetch + animate).

**Key patterns:**
- Server-first component design (default Server, opt into Client)
- GSAP context isolation (each section owns cleanup)
- Intersection Observer for lazy loading (below-fold media)
- Animation state machine (menu transitions, prevent conflicts)
- Progressive enhancement (works without JS, animations enhance)

**Anti-patterns to avoid:**
- Client-first thinking (bloated bundle)
- Direct scroll event listeners (use ScrollTrigger)
- Eager media loading (slow LCP)
- Inline styles for animations (no GPU acceleration)
- Global animation contexts (memory leaks)

### Critical Pitfalls

Research identified 12 domain-specific pitfalls; top 5 are launch-critical:

1. **Animating layout-triggering CSS properties** — Using `top`/`left`/`width`/`height` for animations triggers layout recalculation every frame, causing jank and CLS failures. Use `transform: translate()` and `transform: scale()` instead (GPU-accelerated, no layout recalc). Test with Chrome DevTools Performance tab; watch for frames exceeding 16.7ms budget.

2. **Video hero without mobile optimization** — Auto-playing full-resolution video burns through data plans (70MB per 5 minutes), causes slow loads, browsers block autoplay anyway. Provide static fallback image (WebP/AVIF), detect connection type (`navigator.connection.effectiveType`), use 720p max, keep video under 5MB, strip audio track, set poster attribute. Mobile: static image, not video.

3. **Ignoring motion accessibility** — Animation-heavy sites trigger vestibular disorders (nausea, dizziness, migraines) for 25-30% of users. Implement `prefers-reduced-motion` for ALL animations, provide manual toggle, avoid parallax entirely (no accessible alternative), keep animations 200-500ms, crossfade instead of slide for reduced motion.

4. **SPA without SEO strategy** — Client-side rendering leaves blank HTML for search engines, portfolio invisible in search results. Use Next.js SSR/SSG, generate unique URLs per project, update metadata server-side, implement structured data (JSON-LD), test with "Fetch as Googlebot." Don't rely on JavaScript to display primary content.

5. **GSAP ScrollTrigger animating pinned elements** — Animating the pinned element itself (element with `pin: true`) throws off ScrollTrigger's measurements, causing desync, jumps, or failures. Never animate the pinned element directly—nest content inside pinned element and animate children. ScrollTrigger pre-calculates positions; animating trigger breaks measurements.

**Moderate pitfalls:**
- No performance budget for animations (frame rate drops, test on mid-range devices)
- Custom fonts causing FOIT (use `font-display: swap`, preload critical fonts, subset to used characters)
- Scroll-jacking without escape hatch (respect `prefers-reduced-motion`, ensure keyboard nav works)
- Video without optimized poster frame (delays LCP, set poster attribute with optimized WebP)

## Implications for Roadmap

Based on research, creative portfolios require **foundation-first approach**: performance infrastructure before visual polish. Animations built on slow foundation = disaster. Suggested 3-phase structure:

### Phase 1: Performance Foundation (Week 1-2)
**Rationale:** Everything depends on fast, responsive base. Animation and media systems must be performant before building pages. Research shows slow creative portfolios undermine credibility—performance proves engineering skill.

**Delivers:**
- Next.js App Router setup with Server Components architecture
- Core infrastructure: ScrollController (Lenis + GSAP sync), Image optimization pipeline (next/image + sharp)
- Mobile-responsive layout system with dark mode foundation (Tailwind class strategy)
- Page structure (Home, Portfolio, Services) as Server Components
- SEO fundamentals (meta tags, semantic HTML, structured data)

**Addresses features:**
- Table stakes: mobile-responsive design, HTTPS/SSL, SEO fundamentals, clear navigation
- Foundation for: fast load times, performance as feature

**Avoids pitfalls:**
- Pitfall #1 (layout-triggering animations) — establishes GPU-accelerated transform patterns upfront
- Pitfall #6 (no performance budget) — sets 60fps budget from day one, profiles throughout
- Pitfall #7 (FOIT) — font loading strategy with `font-display: swap`, preloading

**Tech stack focus:** Next.js 16, Tailwind CSS 4, GSAP core, Lenis, next-themes setup

### Phase 2: Rich Media & Interactivity (Week 2-3)
**Rationale:** Once performant foundation exists, layer in video, images, and core interactions. Video hero is emotional anchor; portfolio filtering is usability requirement. Booking integration converts visitors to leads.

**Delivers:**
- Video hero with mobile optimization (720p, <10MB, static fallback, poster frame)
- Portfolio gallery with category filtering (Photo/Video/Software)
- Interactive components: VideoHero (lazy loading), FilterBar (client state), GridAnimator (scroll reveals)
- Calendly booking integration (dynamic import with SSR: false)
- Image optimization for portfolio items (next/image with blur placeholders)

**Addresses features:**
- Table stakes: full-screen hero, portfolio gallery, contact/booking integration
- Differentiators: video hero (cinematic), Calendly booking, performance as feature (Lighthouse 90+)

**Avoids pitfalls:**
- Pitfall #2 (video without mobile optimization) — connection detection, static fallback, 720p max, stripped audio
- Pitfall #9 (video without poster) — optimized poster frame, preload LCP element
- Pitfall #12 (autoplay sound) — muted attribute, audio track removed
- Pitfall #4 (SPA without SEO) — Server Components ensure full HTML, unique URLs per project

**Tech stack focus:** Mux + next-video, react-calendly, Intersection Observer API, GSAP ScrollTrigger basics

### Phase 3: Cinematic Polish & Accessibility (Week 3-4)
**Rationale:** With foundation + interactivity working, add scroll-driven animations and accessibility passes. This phase differentiates from competitors but isn't launch-blocking. Accessibility is moral and legal requirement, not optional polish.

**Delivers:**
- Scroll-driven animations (hero parallax, section reveals, portfolio item entrance)
- Microinteractions (hover effects, animated CTAs, smooth transitions)
- Motion accessibility implementation (`prefers-reduced-motion`, manual toggle, crossfade alternatives)
- Performance optimization pass (Lighthouse 90+, LCP < 2.5s, CLS < 0.1)
- Keyboard navigation and screen reader testing

**Addresses features:**
- Differentiators: scroll-driven animations, interactive microinteractions, performance as feature (provable metrics)
- Table stakes: accessibility basics, dark mode option (completed)

**Avoids pitfalls:**
- Pitfall #3 (motion accessibility) — `prefers-reduced-motion` for all animations, manual toggle, avoid parallax
- Pitfall #5 (GSAP pinned elements) — nested animation structure, no direct pinned element animation
- Pitfall #8 (scroll-jacking) — keyboard nav testing, respects reduced motion
- Pitfall #11 (overkill animations) — CSS for simple effects, GSAP only for complex sequences

**Tech stack focus:** GSAP ScrollTrigger advanced, animation state machines, accessibility testing tools

### Phase 4 (Deferred to v2): Content Depth & Advanced Features
**Rationale:** Deep case studies, video case studies, technical blog require ongoing content strategy. Better to launch with 3-5 curated projects and add depth iteratively than delay launch for content production.

**Delivers (post-launch):**
- Deep case studies with process documentation (problem/solution/result)
- Video case studies for flagship projects
- Bento grid/asymmetric layout experiments
- Kinetic typography effects
- Custom cursor (if theme-appropriate)
- Technical blog (only if 1+ post/month commitment)

### Phase Ordering Rationale

**Why this order:**
1. **Foundation first** — Performance infrastructure is prerequisite for everything. Research shows animations on slow base = technical debt and rewrites.
2. **Media before polish** — Video hero and portfolio gallery are core value proposition; scroll animations are enhancement.
3. **Accessibility integrated, not retrofitted** — Phase 3 includes accessibility as part of animation implementation, not post-launch fix.
4. **Content depth deferred** — Case study narrative can evolve post-launch; 3-5 curated projects sufficient for MVP.

**Dependency chains identified:**
- Dark mode requires complete design system (Phase 1 foundation)
- Scroll animations require performant base (Phase 1) + media loaded (Phase 2)
- Motion accessibility must be built into animation system (Phase 3), not added later
- Video optimization must precede video hero implementation (Phase 2)
- SEO strategy must be architectural decision (Phase 1), not retrofit

**Pitfall-informed grouping:**
- Phase 1 establishes patterns that prevent Pitfalls #1, #6, #7 (layout animations, performance budget, FOIT)
- Phase 2 directly addresses Pitfalls #2, #4, #9, #12 (video optimization, SEO, poster frames, autoplay)
- Phase 3 handles Pitfalls #3, #5, #8, #11 (motion accessibility, GSAP pinned elements, scroll-jacking, overkill)

### Research Flags

**Phases needing deeper research during planning:**

- **Phase 2 (Video optimization)** — Video codec comparison (H.264 vs H.265 vs AV1), Mux vs Cloudinary performance trade-offs, Calendly integration performance impact needs validation. Research found "use H.264" guidance but not exhaustive codec analysis.

- **Phase 3 (GSAP ScrollTrigger patterns)** — Research identified common pitfalls but didn't provide exhaustive ScrollTrigger best practices for creative portfolios. Phase planning should dive into advanced ScrollTrigger patterns, pinned section techniques, and performance profiling.

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Next.js setup)** — Well-documented, official Next.js docs comprehensive, Tailwind setup standard. No research needed.

- **Phase 2 (Calendly integration)** — Official react-calendly docs sufficient, SSR handling documented. Straightforward implementation.

- **Phase 3 (Accessibility)** — W3C WCAG authoritative, MDN motion accessibility guides complete. Clear requirements, no ambiguity.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified from npm registry (Next.js 16.1.2, GSAP 3.14.2, React 19, Lenis 1.3.17). Official docs for Next.js, Tailwind, GSAP authoritative. Node.js 22.x LTS verified. TypeScript 7.0 breaking changes documented. |
| Features | MEDIUM | WebSearch verified across multiple 2026 sources (Awwwards, portfolio examples, design blogs). Table stakes and differentiators cross-verified. Video optimization numbers (720p, <500KB) consistent across sources. Dark theme trends and microinteractions verified through multiple 2026-dated sources. |
| Architecture | HIGH | Next.js App Router server-first pattern official (Next.js docs). GSAP + Lenis integration verified via GitHub repos and Codrops examples. Intersection Observer API standard (MDN). Server Components vs Client Components boundary patterns documented in Next.js 16 guides. |
| Pitfalls | HIGH | Animation performance pitfalls verified with MDN and web.dev (authoritative). WCAG 2.3.3 motion accessibility official W3C standard. GSAP ScrollTrigger pitfalls from official docs. Video optimization cross-verified with Cloudinary, TwicPics, multiple guides. SPA SEO verified with SEO consultant guides and DebugBear. |

**Overall confidence:** HIGH

The stack recommendations have HIGH confidence (official sources, npm registry verification). Feature landscape has MEDIUM confidence (community consensus across multiple sources, not official specs). Architecture patterns and pitfalls have HIGH confidence (authoritative MDN, web.dev, W3C, GSAP docs).

### Gaps to Address

**Areas requiring validation during implementation:**

1. **Video codec specifics beyond H.264** — Research found "use H.264 for universal compatibility" but didn't compare modern codecs (H.265, AV1) in depth. What's the file size/quality/compatibility trade-off in 2026? Phase 2 planning should research codec comparison.

2. **Calendly performance impact** — Project requires Calendly booking but research didn't quantify performance impact of embedded widget. How does Calendly affect page weight, load time, and animation performance? Does it conflict with GSAP? Validate during Phase 2 implementation.

3. **3D effects performance (if considered)** — Research deferred 3D to v2+ but didn't cover WebGL performance pitfalls or Three.js + scroll animation integration. If Shrike wants 3D elements (rotating logo, depth effects), Phase 4 needs dedicated WebGL research.

4. **Portfolio-specific SEO schema** — Found general SPA SEO guidance but not portfolio-specific structured data patterns. What JSON-LD schema optimizes portfolio pieces for search? What's the best way to mark up case studies? Phase 1 should research creative work schema.org markup.

5. **Bento grid implementation patterns** — Features research identified bento grid as differentiator but Architecture research didn't cover implementation patterns. How to achieve asymmetric layout while maintaining responsive design and accessibility? Phase 4 research topic.

6. **Performance benchmarks on mid-range devices** — Research established 60fps budget and Lighthouse 90+ targets but didn't provide device-specific benchmarks. What's acceptable performance on Moto G Power vs iPhone 12 vs MacBook Pro? Phase 1 should establish testing device matrix.

## Sources

### Primary (HIGH confidence)

**Framework & Stack:**
- [Next.js 16 Release](https://nextjs.org/blog/next-16) — App Router, Server Components, Turbopack
- [Next.js 16.1 Release](https://nextjs.org/blog/next-16-1) — Latest stable version confirmation
- [Next.js npm Package](https://www.npmjs.com/package/next) — Version 16.1.2 verified
- [GSAP npm Package](https://www.npmjs.com/package/gsap) — Version 3.14.2, now 100% free
- [Lenis GitHub Repository](https://github.com/darkroomengineering/lenis) — Version 1.3.17, integration patterns
- [Tailwind CSS Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode) — Class strategy official

**Architecture:**
- [Next.js Getting Started: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — Official architecture guidance
- [Next.js Guides: Videos](https://nextjs.org/docs/app/guides/videos) — Video optimization patterns
- [Next.js Guides: Lazy Loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading) — Intersection Observer integration
- [GSAP ScrollTrigger Documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — Official API and pitfalls

**Performance & Accessibility:**
- [Animation Performance and Frame Rate | MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate) — GPU acceleration, layout-triggering properties
- [Cumulative Layout Shift (CLS) | web.dev](https://web.dev/articles/cls) — CLS metric definition, thresholds
- [Understanding WCAG 2.3.3: Animation from Interactions | W3C](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) — Motion accessibility requirements
- [Animation and Motion Accessibility | web.dev](https://web.dev/learn/accessibility/motion/) — `prefers-reduced-motion` implementation
- [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay) — Video autoplay restrictions

### Secondary (MEDIUM confidence)

**Feature Landscape:**
- [Best design portfolio inspiration sites in 2026](https://www.adhamdannaway.com/blog/web-design/design-portfolio-inspiration) — Portfolio trends
- [20 Top Web Design Trends 2026](https://www.theedigital.com/blog/web-design-trends) — Dark mode, bento grid, microinteractions
- [Portfolio Websites: 25+ Inspiring Examples (2026)](https://www.sitebuilderreport.com/inspiration/portfolio-websites) — 3-5 projects standard
- [Best Three.js Portfolio Examples 2025](https://www.creativedevjobs.com/blog/best-threejs-portfolio-examples-2025) — 3D usage patterns
- [Awwwards Best Web Agencies](https://www.awwwards.com/websites/design-agencies/) — Competitive analysis

**Video Optimization:**
- [How to Optimize Video for Web: Complete 2025 Guide](https://natclark.com/how-to-optimize-video-for-web-complete-2025-guide/) — 720p recommendation, file size targets
- [Vercel Video Best Practices](https://vercel.com/guides/best-practices-for-hosting-videos-on-vercel-nextjs-mp4-gif) — Self-hosting warnings
- [Video Autoplay in HTML | Cloudinary](https://cloudinary.com/guides/video-effects/video-autoplay-in-html) — Mobile data consumption, browser policies
- [3 Examples and 3 Tips for Engaging Hero Section Videos | TwicPics](https://www.twicpics.com/blog/3-examples-and-3-tips-for-engaging-hero-section-videos) — Poster frame optimization

**Animation Integration:**
- [Building a Scroll-Driven Dual-Wave Text Animation with GSAP](https://tympanus.net/codrops/2026/01/15/building-a-scroll-driven-dual-wave-text-animation-with-gsap/) — ScrollTrigger patterns
- [How to implement smooth scrolling in Next.js with Lenis and GSAP](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap) — Ticker sync implementation
- [GSAP In Practice: Avoid The Pitfalls | Marmelab](https://marmelab.com/blog/2024/05/30/gsap-in-practice-avoid-the-pitfalls.html) — Pinned element warning

**SEO & Fonts:**
- [SEO for Single Page Applications: Complete 2026 Guide | Jesper SEO](https://jesperseo.com/blog/seo-for-single-page-applications-complete-2026-guide/) — SSR requirements
- [How To Optimize Single Page Applications For SEO | DebugBear](https://www.debugbear.com/docs/single-page-application-seo) — Googlebot rendering limitations
- [FOUT, FOIT, FOFT | CSS-Tricks](https://css-tricks.com/fout-foit-foft/) — Font loading strategies
- [Optimizing Web Fonts: FOIT vs FOUT | Talent500](https://talent500.com/blog/optimizing-fonts-foit-fout-font-display-strategies/) — `font-display` options

### Tertiary (LOW confidence, needs validation)

- [Cloudinary vs Mux Comparison](https://slashdot.org/software/comparison/Cloudinary-vs-Mux/) — Feature comparison, needs hands-on validation
- [TypeScript 6.0 2026 Features](https://medium.com/@mernstackdevbykevin/typescript-6-0-in-2026-the-evolution-of-full-stack-javascript-is-here-bd662846a5a2) — TS 7.0 breaking changes mentioned but not official
- [Should You Use Intersection Observer API or GSAP for Scroll Animations? | CL Creative](https://www.clcreative.co/blog/should-you-use-the-intersection-observer-api-or-gsap-for-scroll-animations) — Performance comparison anecdotal

---

**Research completed:** 2026-01-30
**Ready for roadmap:** Yes

**Next steps:** Roadmapper agent should use phase structure as starting point, validate Calendly performance assumptions in Phase 2 planning, and consider video codec research for Phase 2.
