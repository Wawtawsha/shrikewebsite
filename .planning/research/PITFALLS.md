# Domain Pitfalls: Animation-Heavy Creative Portfolio Website

**Domain:** High-end creative portfolio with cinematic video and scroll-driven animations
**Researched:** 2026-01-30
**Confidence:** MEDIUM (WebSearch findings cross-verified with authoritative MDN/web.dev sources)

## Critical Pitfalls

Mistakes that cause rewrites, major performance issues, or user abandonment.

### Pitfall 1: Animating Layout-Triggering CSS Properties

**What goes wrong:** Using `top`, `left`, `width`, `height` for animations triggers layout recalculation on every frame, causing jank and contributing to poor Cumulative Layout Shift (CLS) scores. Sites feel sluggish, animations stutter, and Core Web Vitals fail.

**Why it happens:** Developers intuitively use positional/sizing properties without understanding the browser rendering pipeline. CSS tutorials often demonstrate simple property animations without performance context.

**Consequences:**
- Missing the 16.7ms frame budget for 60fps (jank visible to users)
- CLS scores above 0.25 (Google ranking penalty)
- Layout recalculation + repaint on every frame
- Battery drain on mobile devices
- Failed Core Web Vitals = SEO impact

**Prevention:**
- Use `transform: translate()` instead of `top`/`left`/`right`/`bottom`
- Use `transform: scale()` instead of `width`/`height`
- Only animate `transform` and `opacity` (GPU-accelerated, no layout recalc)
- Reserve layout-triggering properties for discrete state changes, not continuous animations
- Test with Chrome DevTools Performance tab to identify forced reflows

**Detection:**
- Frame rate drops below 60fps during scroll/animation
- Performance tab shows "Recalculate Style" + "Layout" operations during animation
- CLS score above 0.1 in Lighthouse
- Janky scroll on mid-range mobile devices
- DevTools warning: "Forced reflow is a likely performance bottleneck"

**Source confidence:** HIGH (verified with [MDN Animation Performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate) and [web.dev CLS](https://web.dev/articles/cls))

---

### Pitfall 2: Video Hero Without Mobile/Data Optimization

**What goes wrong:** Auto-playing full-resolution video on mobile burns through users' data plans (70MB per 5 minutes for HD video), causes slow page loads, and browsers block autoplay anyway. Users on metered connections bounce immediately.

**Why it happens:** Desktop-first design mindset. Developers test on WiFi with unlimited data, missing the mobile data consumption reality. Video looks amazing in design reviews, so it ships without optimization.

**Consequences:**
- 70MB+ data consumption for 5-minute hero video
- Browsers block autoplay on mobile (iOS Safari, Chrome data saver mode)
- 53% of users abandon sites taking over 3 seconds to load
- Hero section shows blank space instead of video
- User frustration with data overage charges
- Immediate bounce on metered/slow connections

**Prevention:**
- Provide high-quality static fallback image (1280x720, optimized WebP/AVIF)
- Detect connection type and disable autoplay on cellular (`navigator.connection.effectiveType`)
- Use adaptive bitrate: 720p max for web (not 1080p or 4K)
- Keep video under 5MB through aggressive compression
- Strip audio track (reduces file size 20-30%)
- Use `.mp4` with H.264 for broad compatibility, `.webm` for modern browsers
- Set `poster` attribute with optimized placeholder
- Consider not autoplaying on mobile at all (respect `prefers-reduced-data`)
- Use CDN with adaptive streaming for global delivery

**Detection:**
- Network tab shows >10MB video file on page load
- Mobile testing reveals blank hero section
- Lighthouse flags "Defer offscreen videos"
- Users report slow loading on mobile
- Video file lacks multiple quality variants
- Console errors: "Autoplay policy prevented playback"

**Source confidence:** MEDIUM (verified with [Cloudinary autoplay guide](https://cloudinary.com/guides/video-effects/video-autoplay-in-html), WebSearch findings on mobile data consumption)

---

### Pitfall 3: Ignoring Accessibility for Motion-Sensitive Users

**What goes wrong:** Animation-heavy sites trigger vestibular disorders, causing nausea, dizziness, and migraines for 25-30% of users. Sites ignore `prefers-reduced-motion`, creating inaccessible experiences and potential WCAG violations.

**Why it happens:** Designers prioritize aesthetic over accessibility. `prefers-reduced-motion` is seen as afterthought, not core requirement. Teams lack users with motion sensitivity in testing.

**Consequences:**
- Users with vestibular disorders experience physical illness
- WCAG 2.3.3 (AAA) violation if motion can't be disabled
- Legal risk (ADA compliance lawsuits)
- Parallax effects universally problematic for motion sensitivity
- 25-30% of users may avoid site entirely
- Reputational damage for "premium" brand that excludes users

**Prevention:**
- Implement `prefers-reduced-motion` media query for ALL animations
- Provide manual toggle switch at top of page to disable animations
- For reduced motion: crossfade instead of slide, instant instead of animated scroll
- Avoid parallax effects entirely (no accessible alternative exists)
- Keep animations between 200-500ms (not multi-second effects)
- Don't flash content more than 3 times per second (WCAG 2.3.1)
- Auto-stop motion animations within 5 seconds unless user-initiated
- Opacity/color transitions are safe (no motion), scale/translate require reduced-motion handling

**Detection:**
- No `@media (prefers-reduced-motion: reduce)` in CSS
- Animations run identically regardless of OS motion settings
- Parallax scrolling effects present
- No user-facing toggle to disable animations
- Animations exceed 5 seconds without pause
- Testing with macOS "Reduce Motion" enabled shows no difference

**Source confidence:** HIGH (verified with [W3C WCAG 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) and [web.dev motion accessibility](https://web.dev/learn/accessibility/motion/))

---

### Pitfall 4: SPA Without SEO Strategy

**What goes wrong:** Single-page application portfolios render content via JavaScript, resulting in blank HTML for search engines. Google sees empty page, indexes nothing, portfolio invisible in search results.

**Why it happens:** Modern framework defaults (React, Vue SPA mode) prioritize developer experience over SEO. Assumption that "Google renders JavaScript" without understanding limitations and delays in JavaScript rendering.

**Consequences:**
- Search engines index blank/incomplete HTML
- Portfolio case studies invisible to Google
- Client-side redirects don't pass link equity
- Metadata (title, description) doesn't update per "page"
- No unique URLs for individual projects/case studies
- URL fragments (`#/project/abc`) not indexed
- Competitors with SSR outrank you despite worse portfolio
- Lost organic traffic from potential clients searching for work samples

**Prevention:**
- Use server-side rendering (SSR) or static site generation (SSG)
- Next.js for React, Nuxt.js for Vue, SvelteKit for Svelte
- Generate unique URLs for each project/case study
- Use proper HTTP redirects (301/302), not JavaScript-based navigation
- Update `<title>` and meta tags server-side for each route
- Implement structured data (JSON-LD) for portfolio items
- Provide `<noscript>` fallback with critical content
- Test with Google Search Console's URL Inspection (Fetch as Googlebot)
- Don't rely on JavaScript to display primary content

**Detection:**
- "View Source" shows minimal HTML, no content
- Lighthouse SEO audit fails "Document doesn't have a meta description"
- Google Search Console shows indexing issues
- URL structure uses hash fragments (`#/project`)
- Title tag same on all routes
- Fetch as Googlebot shows blank page
- Organic search traffic near zero despite quality content

**Source confidence:** MEDIUM (verified with [Jesper SEO SPA guide](https://jesperseo.com/blog/seo-for-single-page-applications-complete-2026-guide/) and [DebugBear SPA SEO](https://www.debugbear.com/docs/single-page-application-seo))

---

### Pitfall 5: GSAP ScrollTrigger Animating Pinned Elements

**What goes wrong:** Animating the pinned element itself (the element with `pin: true`) throws off ScrollTrigger's measurements, causing animations to desync, jump, or fail entirely. Scroll position calculations become incorrect.

**Why it happens:** Intuitive to animate the element you're pinning. ScrollTrigger documentation buries this warning. Developers don't understand that ScrollTrigger pre-calculates positions based on static layout.

**Consequences:**
- Scroll animations jump or stutter
- Pin timing desyncs from scroll position
- Elements snap to wrong positions
- Animations trigger at incorrect scroll depths
- Layout shifts as calculations fail
- Hours of debugging "why isn't this working?"

**Prevention:**
- Never animate the pinned element directly
- Nest content inside pinned element and animate children
- ScrollTrigger pre-calculates positions; animating trigger breaks measurements
- Use separate elements for pinning vs animating
- Example structure:
  ```html
  <div data-pin> <!-- This gets pinned, don't animate -->
    <div data-animate> <!-- Animate this instead -->
  ```

**Detection:**
- Pinned sections jump or snap unexpectedly
- Scroll animations don't align with scroll depth
- DevTools shows element transform changing on both pin AND animation
- ScrollTrigger `markers: true` shows misaligned start/end points
- Console warnings about refresh/update calls

**Source confidence:** HIGH (verified with [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/))

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or poor user experience.

### Pitfall 6: No Performance Budget for Animations

**What goes wrong:** Teams add scroll effects, micro-interactions, and transitions without measuring cumulative performance cost. Page eventually exceeds 16.7ms frame budget, causing pervasive jank.

**Why it happens:** Animations added incrementally. Each one tested in isolation looks fine. Cumulative cost never measured. "Just one more effect" mentality.

**Consequences:**
- Frame rate drops below 60fps
- Smooth on developer MacBook Pro, janky on client's mid-range laptop
- Mobile performance significantly worse
- Battery drain on mobile
- Professional portfolio feels amateur due to jank

**Prevention:**
- Set performance budget: maintain 60fps (16.7ms per frame)
- Use Chrome DevTools Performance recorder to capture real scroll sessions
- Identify frames exceeding budget (red bars in Performance timeline)
- Limit concurrent animations (no more than 3-4 simultaneous effects)
- Test on mid-range devices (Moto G Power, not just flagship phones)
- Use `will-change` sparingly (memory cost if overused)
- Profile before adding each major animation feature
- Remove animations if budget exceeded (design tradeoff for performance)

**Detection:**
- Performance timeline shows frames exceeding 16.7ms
- DevTools FPS meter shows drops below 60fps
- Janky scroll on anything but high-end devices
- CPU usage spikes during scroll/interactions
- Mobile feels sluggish despite desktop smoothness

**Source confidence:** MEDIUM (verified with [MDN Animation Performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate) and WebSearch findings on frame budgets)

---

### Pitfall 7: Custom Fonts Causing FOIT (Flash of Invisible Text)

**What goes wrong:** Browser hides text for 3+ seconds while downloading custom fonts (FOIT), leaving users staring at blank sections. 53% of users abandon sites taking over 3 seconds to load.

**Why it happens:** Default browser behavior is FOIT. Designers specify custom fonts without considering loading strategy. Font files too large (multiple weights/styles bundled).

**Consequences:**
- Blank text for 3+ seconds on slow connections
- User perceives site as broken/slow
- Increased bounce rate (53% abandon >3s)
- Poor First Contentful Paint (FCP) score
- Brand messaging invisible during critical first impression

**Prevention:**
- Use `font-display: swap` (shows fallback immediately, swaps when custom loads)
- Or `font-display: fallback` (shorter wait period, better for performance)
- Preload critical fonts: `<link rel="preload" href="font.woff2" as="font">`
- Use WOFF2 format (smaller, faster decompression than TTF/OTF)
- Subset fonts (only characters actually used)
- Limit to 2-3 font weights max (not entire family)
- Match fallback font metrics to reduce layout shift on swap
- Use system fonts for body copy, custom fonts for headings only

**Detection:**
- Lighthouse flags "Ensure text remains visible during webfont load"
- Blank text on simulated slow 3G connection
- No `font-display` property in @font-face rules
- Font files exceed 100KB each
- Multiple font weights/styles loaded but unused
- FCP score above 2.5 seconds

**Source confidence:** MEDIUM (verified with [CSS-Tricks FOIT/FOUT](https://css-tricks.com/fout-foit-foft/) and WebSearch findings on font-display strategies)

---

### Pitfall 8: Scroll-Jacking Without Escape Hatch

**What goes wrong:** Custom scroll behavior (smooth scroll libraries, hijacked scroll physics) breaks user expectations and browser controls. Users can't scroll at their own pace, back button breaks, keyboard navigation fails.

**Why it happens:** Desire for "cinematic" scroll experience. Smooth scroll libraries look impressive in demos. Teams don't test keyboard/assistive tech navigation.

**Consequences:**
- Disorienting for users accustomed to native scroll
- Breaks browser back button (scroll position not preserved)
- Keyboard navigation (Page Down, Space, Home/End) doesn't work
- Screen readers can't navigate properly
- Motion-sensitive users triggered by eased scroll
- Mobile momentum scrolling feels wrong
- Users feel loss of control

**Prevention:**
- Use native CSS `scroll-behavior: smooth` instead of JavaScript libraries
- If using custom scroll (Locomotive Scroll, Lenis), provide disable toggle
- Respect `prefers-reduced-motion` (disable custom scroll entirely)
- Ensure keyboard navigation still works (test with Tab, Space, Page Down)
- Preserve scroll position in history (popstate events)
- Don't prevent default scroll behavior without strong justification
- Mobile: use native scroll (custom scroll feels wrong on touch)
- Test with screen readers (NVDA, JAWS, VoiceOver)

**Detection:**
- Back button doesn't restore scroll position
- Page Down / Space bar doesn't scroll
- Screen reader users report navigation issues
- Custom scroll library in dependencies (locomotive-scroll, smoothscroll-polyfill)
- JavaScript event listeners on `wheel` or `touchmove` with `preventDefault()`
- Accessibility audit shows keyboard navigation failures

**Source confidence:** LOW (based on general WebSearch findings and UX best practices, not domain-specific source)

---

### Pitfall 9: Video Without Optimized Poster Frame

**What goes wrong:** Hero video shows blank space or low-quality placeholder while loading, harming Largest Contentful Paint (LCP). First impression is broken layout, not premium brand.

**Why it happens:** Video element added without `poster` attribute. Default browser poster is first frame (often black or blurry). Poster image not optimized (wrong size, format).

**Consequences:**
- LCP delayed until video loads (often 3-5 seconds)
- Blank or black hero section during load
- Layout shift when video finally appears
- Poor first impression (premium brand shows broken layout)
- Google ranking penalty (Core Web Vitals)
- Mobile users see placeholder longer (slower connections)

**Prevention:**
- Always set `poster` attribute with optimized image
- Poster dimensions match video (1280x720 for 720p video)
- Use modern formats (WebP, AVIF) with JPEG fallback
- Optimize poster image (<100KB, ideally <50KB)
- Choose compelling frame (not black screen or motion blur)
- Poster should be visually representative of video content
- Preload poster if it's LCP element: `<link rel="preload" as="image" href="poster.webp">`
- Ensure poster loads before video starts downloading

**Detection:**
- Lighthouse: "Largest Contentful Paint element" is video without poster
- LCP score above 2.5 seconds
- Hero section blank during load on slow 3G
- Network tab shows video downloading before poster image
- No `poster` attribute on `<video>` element
- Layout shift when video appears

**Source confidence:** MEDIUM (verified with [TwicPics hero video guide](https://www.twicpics.com/blog/3-examples-and-3-tips-for-engaging-hero-section-videos) and WebSearch findings on video optimization)

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 10: Overuse of Skeleton Screens

**What goes wrong:** Skeleton screens displayed for too long become annoying. Users prefer fast content over elaborate loading states. Skeletons that don't match final layout cause jarring shifts.

**Why it happens:** Skeleton screens feel polished in design phase. Teams spend time perfecting skeleton UI instead of optimizing actual load time. Skeletons left visible even after content loads.

**Consequences:**
- Skeletons lose effect if displayed over 2-3 seconds
- Users frustrated by "fake" content
- Layout shift when skeleton replaced by real content
- Development time wasted on loading states instead of performance
- Skeleton mismatch makes load feel slower, not faster

**Prevention:**
- Don't use skeletons for pages loading under 500ms (not worth it)
- Skeleton should match final layout exactly (same heights, widths, positions)
- Replace progressively as content arrives (not all at once)
- Optimize actual load time first, skeleton second
- Limit skeleton display to 2-3 seconds max
- After 3 seconds, show real loading indicator or error state
- Test with slow 3G to ensure skeletons don't overstay

**Detection:**
- Skeleton visible for 5+ seconds on slow connection
- Layout shifts when skeleton replaced with content
- Skeleton dimensions don't match loaded content
- Users report "fake content" annoyance
- Development time skewed toward loading states vs performance optimization

**Source confidence:** MEDIUM (verified with [HubSpot skeleton screens article](https://blog.hubspot.com/website/skeleton-screens) and WebSearch findings on UX best practices)

---

### Pitfall 11: Overkill Animations on Simple Interactions

**What goes wrong:** Using GSAP for simple fade-ins or CSS transitions. Adds 40-50KB of JavaScript for effects achievable with 5 lines of CSS. Increases parse/compile time on page load.

**Why it happens:** GSAP is developer's comfort zone. Don't realize CSS can handle 80% of effects. Framework/library lock-in mentality.

**Consequences:**
- Unnecessary JavaScript bundle size (40-50KB for GSAP core)
- Longer parse/compile time on initial load
- Dependency maintenance burden
- Simple effects could run on main thread without JS
- Intersection Observer + CSS is lighter for basic reveals

**Prevention:**
- Use CSS for simple effects: fade, slide, scale, rotate
- Reserve GSAP for complex sequences, timelines, scroll-driven animations
- Intersection Observer API + CSS for scroll reveals (no library needed)
- Benchmark: if effect achievable in <10 lines of CSS, skip JavaScript
- Use native CSS animations for micro-interactions (hover, focus states)
- Only import GSAP plugins actually needed (not full bundle)

**Detection:**
- GSAP imported but only used for basic tweens
- Animations could be replaced with CSS `transition` or `@keyframes`
- Bundle analysis shows GSAP in bundle but minimal usage
- Simple fade-in effects using `gsap.to()`
- No complex timelines or scroll-driven sequences

**Source confidence:** MEDIUM (verified with [CL Creative Intersection Observer vs GSAP](https://www.clcreative.co/blog/should-you-use-the-intersection-observer-api-or-gsap-for-scroll-animations) and GSAP docs)

---

### Pitfall 12: Autoplaying Sound Without User Interaction

**What goes wrong:** Browsers block autoplaying media with sound. Video with audio track fails to autoplay, breaking hero video. Users startled by sudden sound if autoplay succeeds.

**Why it happens:** Designers want immersive sound design. Browsers changed autoplay policies (2018+) but developers missed memo. Video exported with audio track by default.

**Consequences:**
- Autoplay blocked entirely (Chrome, Safari autoplay policy)
- Console error: "Autoplay was prevented"
- Hero video doesn't play, defeating its purpose
- If it works, users startled (bad UX)
- Accessibility issue (sudden audio without warning)
- File size 20-30% larger due to audio track

**Prevention:**
- Always strip audio from autoplay videos (use muted attribute)
- Set `muted` attribute on `<video>` element
- Remove audio track during export/encoding
- Reduces file size 20-30%
- If audio needed, require user interaction (play button)
- Never autoplay sound without explicit user action
- Add visible indicator if video has sound option

**Detection:**
- Console error: "Autoplay policy prevented playback"
- Video file has audio track but doesn't autoplay
- No `muted` attribute on `<video>` element
- Lighthouse accessibility audit flags autoplay media
- Video file size suspiciously large

**Source confidence:** MEDIUM (verified with [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay) and video optimization guides)

---

## Phase-Specific Warnings

Mapping pitfalls to likely project phases for proactive prevention.

| Phase Topic | Likely Pitfall | Mitigation Strategy |
|-------------|---------------|---------------------|
| Hero Video Implementation | Pitfall #2 (Video without mobile optimization) | Phase should include mobile-first video strategy, poster frame optimization, connection detection |
| Scroll Animation Foundation | Pitfall #1 (Animating layout properties), #5 (GSAP pinned element) | Research phase should establish animation constraints, test performance on target devices |
| Micro-interactions / Hover Effects | Pitfall #11 (Overkill animations) | Use CSS-first approach, only introduce GSAP if complexity demands it |
| Portfolio Gallery / Case Studies | Pitfall #4 (SPA without SEO) | Architecture decision must include SSR/SSG, unique URLs for each project |
| Typography / Font Loading | Pitfall #7 (FOIT) | Font strategy should include font-display, preloading, WOFF2 format |
| Accessibility Pass | Pitfall #3 (Motion sensitivity) | Test with reduced-motion enabled, implement toggle, avoid parallax |
| Performance Optimization | Pitfall #6 (No performance budget) | Establish 60fps budget early, profile continuously, test on mid-range devices |
| Custom Scroll Implementation | Pitfall #8 (Scroll-jacking) | Evaluate whether custom scroll worth accessibility trade-offs, test keyboard navigation |

---

## Confidence Assessment

| Pitfall Category | Confidence | Source Quality |
|------------------|-----------|----------------|
| Animation Performance (1, 5, 6, 11) | HIGH | MDN, web.dev, GSAP docs (authoritative) |
| Video Optimization (2, 9, 12) | MEDIUM | Industry guides, WebSearch cross-verified |
| Accessibility (3, 8) | HIGH | W3C WCAG, web.dev (authoritative) |
| SEO (4) | MEDIUM | SEO consultant guides, multiple sources agree |
| Font Loading (7) | MEDIUM | CSS-Tricks, developer blogs, multiple sources |
| UX Patterns (10) | MEDIUM | UX research, general best practices |

---

## Research Gaps

Areas where deeper investigation would be valuable:

1. **Specific GSAP ScrollTrigger best practices**: GSAP docs reference "common mistakes" guide but didn't provide exhaustive list. Phase-specific research should dive into ScrollTrigger patterns for creative portfolios.

2. **Video codec comparison (H.264 vs H.265 vs AV1)**: WebSearch found general "use H.264" guidance but didn't compare modern codecs. What's the file size/quality/compatibility trade-off in 2026?

3. **Calendly integration performance impact**: Project requires Calendly booking. How does embedded Calendly affect page weight and performance? Any known conflicts with animation libraries?

4. **Creative portfolio case study structure for SEO**: Found general SPA SEO guidance but not portfolio-specific schema markup or structured data patterns. What JSON-LD schema optimizes portfolio pieces for search?

5. **3D effects performance**: Shrike may want 3D transforms or WebGL effects for premium feel. Research didn't cover WebGL performance pitfalls or Three.js integration with scroll animations.

---

## Sources

### High Confidence (Authoritative)
- [Cumulative Layout Shift (CLS) | web.dev](https://web.dev/articles/cls)
- [Animation Performance and Frame Rate | MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)
- [GSAP ScrollTrigger Documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [Understanding WCAG 2.3.3: Animation from Interactions | W3C](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [Animation and Motion Accessibility | web.dev](https://web.dev/learn/accessibility/motion/)
- [Chrome Autoplay Policy | Chrome Developers](https://developer.chrome.com/blog/autoplay)

### Medium Confidence (Cross-Verified)
- [SEO for Single Page Applications: Complete 2026 Guide | Jesper SEO](https://jesperseo.com/blog/seo-for-single-page-applications-complete-2026-guide/)
- [How To Optimize Single Page Applications For SEO | DebugBear](https://www.debugbear.com/docs/single-page-application-seo)
- [Video Autoplay in HTML | Cloudinary](https://cloudinary.com/guides/video-effects/video-autoplay-in-html)
- [How to Optimize a Silent Background Video | Design TLC](https://designtlc.com/how-to-optimize-a-silent-background-video-for-your-websites-hero-area/)
- [3 Examples and 3 Tips for Engaging Hero Section Videos | TwicPics](https://www.twicpics.com/blog/3-examples-and-3-tips-for-engaging-hero-section-videos)
- [FOUT, FOIT, FOFT | CSS-Tricks](https://css-tricks.com/fout-foit-foft/)
- [Optimizing Web Fonts: FOIT vs FOUT vs Font Display Strategies | Talent500](https://talent500.com/blog/optimizing-fonts-foit-fout-font-display-strategies/)
- [Should You Use Intersection Observer API or GSAP for Scroll Animations? | CL Creative](https://www.clcreative.co/blog/should-you-use-the-intersection-observer-api-or-gsap-for-scroll-animations)
- [GSAP In Practice: Avoid The Pitfalls | Marmelab](https://marmelab.com/blog/2024/05/30/gsap-in-practice-avoid-the-pitfalls.html)

### Lower Confidence (General UX Guidance)
- [13 UX Design Mistakes You Should Avoid in 2026 | TENET](https://www.wearetenet.com/blog/ux-design-mistakes)
- [8 Common Website Design Mistakes to Avoid in 2026 | Zach Sean](https://www.zachsean.com/post/8-common-website-design-mistakes-to-avoid-in-2026-for-better-conversions-and-user-experience)
- [What Are Skeleton Screens? | HubSpot](https://blog.hubspot.com/website/skeleton-screens)
- [Motion Designer Portfolio: Crafting Digital Showcases | Medium](https://medium.com/@pratheekjose18/motion-designer-portfolio-crafting-digital-showcases-for-creative-excellence-0b4511e51ab3)
- [Portfolio Websites: 25+ Inspiring Examples (2026) | Site Builder Report](https://www.sitebuilderreport.com/inspiration/portfolio-websites)
