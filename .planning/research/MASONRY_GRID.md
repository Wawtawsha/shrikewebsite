# Masonry Grid Library Research

Research for Pinterest-style event photo gallery (v1.1 milestone).

**Context:** Next.js 16.1.6, React 19, Tailwind CSS 4, TypeScript. Displaying 200-1500 photos in a warm/cute aesthetic. Target audience is women 30-60, primarily mobile, not tech-savvy. Existing animation stack: motion/react + Lenis smooth scroll.

**Research date:** 2026-02-08

---

## Table of Contents

1. [Library Comparison](#1-library-comparison)
2. [Virtualization Strategy](#2-virtualization-strategy)
3. [Infinite Scroll vs Pagination](#3-infinite-scroll-vs-pagination)
4. [Animation Integration](#4-animation-integration)
5. [Mobile-First Considerations](#5-mobile-first-considerations)
6. [Recommendation](#6-recommendation)

---

## 1. Library Comparison

### 1a. CSS-Only Approaches

#### CSS Columns (`column-count`)

The oldest CSS-only masonry technique. Items flow top-to-bottom within columns, then wrap to the next column.

| Aspect | Assessment |
|--------|------------|
| Browser support | Universal (all modern browsers) |
| Responsive | Manual media queries for `column-count` changes |
| Virtualization | None; all items in DOM |
| Aspect ratio | Preserved naturally (items are block-level) |
| Ordering | **Top-to-bottom, then left-to-right** (not left-to-right row order) |
| Dynamic content | Poor; adding items causes full reflow of all columns |
| Lazy loading | Compatible but order issues make it awkward |

**Verdict:** The column ordering problem is a dealbreaker for photo galleries where chronological left-to-right ordering matters. Users expect to read a gallery like text -- left to right, top to bottom. CSS columns read top to bottom within each column, which breaks mental models for event photos.

#### CSS Grid with `masonry` / `grid-lanes`

The long-awaited native CSS masonry. After a five-year debate, the CSS Working Group voted in January 2025 to adopt `display: grid-lanes` syntax (CSS Grid Layout Level 3, spec published March 2025).

| Browser | Status (Feb 2026) |
|---------|-------------------|
| Safari | Shipped in Safari Technology Preview 234 (Dec 2025) |
| Chrome/Edge | Behind flag in v140 (Jul 2025); switching from `display: masonry` to `grid-lanes` |
| Firefox | Prototype behind `about:config` flag; needs syntax update to `grid-lanes` |

**Production-ready?** No. Safari TP only, Chrome/Edge still behind flags, Firefox incomplete. Realistic cross-browser availability: **Q2-Q3 2026 at earliest**. Not viable for a feature shipping now.

**Limitations even when shipped:**
- No virtualization (all items in DOM)
- Dense packing, reverse placement, subgrid, DevTools, and fragmentation support are all still incomplete
- No built-in lazy loading integration

**Sources:**
- [WebKit: When will CSS Grid Lanes arrive?](https://webkit.org/blog/17758/when-will-css-grid-lanes-arrive-how-long-until-we-can-use-it/)
- [Chrome: Brick by brick: Help us build CSS Masonry](https://developer.chrome.com/blog/masonry-update)
- [CSS-Tricks: Masonry Layout is Now grid-lanes](https://css-tricks.com/masonry-layout-is-now-grid-lanes/)
- [MDN: Masonry layout](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Masonry_layout)

---

### 1b. react-masonry-css

Lightweight React component using CSS multi-column layout under the hood.

| Criterion | Details |
|-----------|---------|
| npm weekly downloads | ~136,000 |
| GitHub stars | ~1,026 |
| Bundle size | ~2 kB minified + gzipped |
| Last published | **5+ years ago** (v1.0.16) |
| React 19 compat | No explicit peer dep on React version; likely works but untested by maintainer |
| TypeScript | Community `@types/react-masonry-css` available |
| Next.js App Router | Works as client component (`'use client'`); no SSR layout calculation |
| Virtualization | **None** -- renders all items to DOM |
| Responsive | Breakpoint object maps viewport widths to column counts |
| Aspect ratio | Preserves naturally (items are block-level) |
| Accessibility | None built-in |
| Maintenance | **Effectively abandoned.** No commits in 5+ years. Open issues unanswered. |
| Item ordering | **Top-to-bottom columns** (same CSS columns problem) |

**Verdict:** Popular by downloads (legacy installs / tutorials), but abandoned and has the same column-ordering problem as raw CSS columns. Not suitable for 200-1500 photos with no virtualization. **Avoid.**

**Source:** [react-masonry-css on npm](https://www.npmjs.com/package/react-masonry-css)

---

### 1c. react-responsive-masonry

Responsive masonry component built with CSS flexbox.

| Criterion | Details |
|-----------|---------|
| npm weekly downloads | ~87,000 |
| Last published | ~1 year ago (v2.7.1, early 2025) |
| React 19 compat | No explicit peer dep specification; may work with `--legacy-peer-deps` |
| TypeScript | Community `@types/react-responsive-masonry` available |
| Bundle size | ~3 kB minified + gzipped |
| Virtualization | **None** |
| Responsive | `ResponsiveMasonry` wrapper with `columnsCountBreakPoints` prop |
| Next.js App Router | Client component only |
| Accessibility | None built-in |
| Maintenance | Slow; last publish ~1 year ago, sporadic commits |

**Verdict:** Slightly more maintained than react-masonry-css, simpler API. But still no virtualization, making it unsuitable for 200-1500 photos. Column ordering may also be top-to-bottom depending on implementation. **Not recommended for this scale.**

**Source:** [react-responsive-masonry on npm](https://www.npmjs.com/package/react-responsive-masonry)

---

### 1d. @tanstack/react-virtual

Headless virtualization library from the TanStack ecosystem. Not a masonry library per se, but provides the primitives to build one.

| Criterion | Details |
|-----------|---------|
| npm weekly downloads | **~8.2 million** |
| GitHub stars | ~5,700+ (TanStack/virtual monorepo) |
| Bundle size | ~20 kB minified |
| Last published | Actively maintained (latest v3.13.x) |
| React 19 compat | Yes, explicit support |
| TypeScript | First-class |
| Next.js App Router | Compatible (client component for scroll hooks) |
| Virtualization | **Core feature** -- only renders visible items |
| Masonry support | **Not built-in.** Requires custom implementation for variable-height masonry. |
| Responsive | Manual breakpoint handling |
| Accessibility | Headless, so a11y is your responsibility |

**Key challenge:** TanStack Virtual assumes you know item heights before rendering (or can estimate them). Masonry layouts with unknown image aspect ratios require a two-pass approach: measure image dimensions first, then calculate positions. The library provides a `variable` example, but building a true masonry grid on top of it is significant custom work.

There is a community library [another-react-responsive-masonry](https://github.com/hmpthz/another-react-responsive-masonry) built on @tanstack/virtual that adds masonry behavior, but it has minimal adoption (<50 GitHub stars, not on npm).

**Verdict:** Best-in-class virtualization, but building masonry on top of it is a DIY project. Only choose this if no purpose-built solution meets your needs.

**Source:** [TanStack Virtual](https://tanstack.com/virtual/latest)

---

### 1e. masonic

High-performance virtualized masonry grid built on react-virtualized concepts (red-black interval tree for cell lookup).

| Criterion | Details |
|-----------|---------|
| npm weekly downloads | ~26,000-37,000 |
| GitHub stars | ~1,212 |
| Bundle size | ~8 kB minified + gzipped |
| Last published | ~April 2025 (v4.1.0) -- 10 months ago |
| React 19 compat | **Uncertain.** Peer deps may not include React 19. Known issues with ResizeObserver in SSR contexts. |
| TypeScript | Yes, built-in |
| Next.js App Router | **Problematic.** Relies on ResizeObserver, window scroll position, and other browser APIs. Must be wrapped in `'use client'`. Reports of "ResizeObserver is not defined" errors. Multiple GitHub issues about Next.js compatibility. |
| Virtualization | **Yes -- core feature.** Can render tens of thousands of items. |
| Responsive | Column count based on container width and `columnWidth` prop |
| Aspect ratio | Items are measured after render; autosizing handles lazy-loaded images |
| Accessibility | None documented |
| Maintenance | Sporadic. Last publish 10 months ago. Issues pile up without responses. |

**Strengths:**
- True virtualization with masonry layout (the specific combination we need)
- Autosizing: re-measures items when content changes (e.g., image loads)
- Efficient data structures (interval tree) for scroll-based cell lookup
- Handles tens of thousands of items

**Weaknesses:**
- SSR/Next.js integration is painful (browser API dependencies)
- Maintenance is declining
- React 19 compatibility is untested/unconfirmed
- API surface is complex (useMasonry, usePositioner, useResizeObserver, useContainerPosition, useScroller)

**Verdict:** Strongest virtualized masonry option, but carries real risk with React 19 + Next.js 16 compatibility and declining maintenance. Worth prototyping but have a backup plan.

**Sources:**
- [masonic on npm](https://www.npmjs.com/package/masonic)
- [masonic GitHub](https://github.com/jaredLunde/masonic)
- [Next.js issue](https://github.com/jaredLunde/masonic/issues/173)
- [ResizeObserver issue](https://github.com/jaredLunde/masonic/discussions/165)

---

### 1f. react-photo-album (TOP CONTENDER)

Purpose-built responsive photo gallery component. Successor to react-photo-gallery, rewritten from scratch.

| Criterion | Details |
|-----------|---------|
| npm weekly downloads | ~38,000 |
| GitHub stars | ~725 |
| Bundle size | ~19 kB minified (full); **tree-shakeable** -- MasonryPhotoAlbum alone is smaller |
| Last published | **9 days ago** (v3.3.0, late Jan 2026) |
| React 19 compat | **Yes.** Explicit `"^18 \|\| ^19"` peer dependency. Tested against React 19.2.0. |
| TypeScript | First-class, built-in types |
| Next.js App Router | **Excellent.** SSR-friendly with `defaultContainerWidth` prop. Provides a pure Server Component option with zero client JS. |
| Virtualization | **No built-in windowing**, but provides `InfiniteScroll` component for progressive loading |
| Responsive | Automatic resolution switching with `sizes` and `srcset` generation |
| Aspect ratio | **Core feature.** Photos declared with width/height; layout algorithm preserves ratios perfectly |
| Layouts | Rows, Columns, and **Masonry** -- import only what you need |
| Accessibility | Semantic HTML, supports custom `alt` text per photo, keyboard navigation via standard focus |
| Maintenance | **Actively maintained.** Regular releases, responsive maintainer. |
| Lightbox | First-party integration with `yet-another-react-lightbox` (same author) |
| Infinite scroll | Built-in `InfiniteScroll` component (import from `react-photo-album/scroll`) |

**v3 Architecture (released 2024):**
- Tree-shakeable: Import `MasonryPhotoAlbum` + `masonry.css` only
- Replaced CSS-in-JS with external CSS stylesheet (smaller bundle, better performance)
- Uses CSS flexbox + `calc()` for layout -- no runtime JS layout calculations after initial render
- Server-side rendered markup is pixel-perfect before hydration
- Responsive images: automatically generates `sizes` and `srcset` attributes

**Lightbox ecosystem:**
Same author maintains [yet-another-react-lightbox](https://yet-another-react-lightbox.com/) which provides:
- Pinch-to-zoom on mobile
- Swipe navigation
- Keyboard shortcuts
- Fullscreen mode
- Plugin architecture (captions, thumbnails, slideshow, download, zoom)

**Verdict:** The most complete solution for photo galleries specifically. Actively maintained, React 19 tested, excellent Next.js support, built-in infinite scroll, lightbox integration from the same author. The only gap is true virtualization/windowing for the initial render of very large sets. The InfiniteScroll component mitigates this by loading photos progressively.

**Sources:**
- [react-photo-album documentation](https://react-photo-album.com/documentation)
- [react-photo-album on npm](https://www.npmjs.com/package/react-photo-album)
- [react-photo-album GitHub](https://github.com/igordanchenko/react-photo-album)
- [Masonry layout example](https://react-photo-album.com/examples/masonry)
- [Infinite scroll example](https://assets.react-photo-album.com/examples/infinite-scroll)

---

### 1g. @virtuoso.dev/masonry

Virtualized masonry component from the React Virtuoso ecosystem.

| Criterion | Details |
|-----------|---------|
| npm weekly downloads | ~28,000 |
| Bundle size | ~24.3 kB |
| Last published | ~2 months ago (v1.3.5, Dec 2025) |
| React 19 compat | Not explicitly confirmed, but React Virtuoso has broad compatibility |
| TypeScript | Yes |
| Virtualization | **Yes -- core feature** |
| Responsive | Dynamic column count based on container width |
| Next.js App Router | Client component required (scroll-dependent) |
| Maintenance | Active (part of Virtuoso ecosystem, commercial backing) |

**Key features:**
- Only renders visible items (true windowing)
- Variable item heights, automatically measured
- Window scroll support
- Just-in-time item distribution

**Verdict:** Newer entrant, actively maintained, true virtualization. Less community traction than masonic but more recent activity. Worth considering as alternative to masonic if virtualization is essential. The ~24 kB bundle size is heavier than ideal.

**Source:** [@virtuoso.dev/masonry on npm](https://www.npmjs.com/package/@virtuoso.dev/masonry)

---

### 1h. react-grid-gallery

Justified image gallery with selection support.

| Criterion | Details |
|-----------|---------|
| Maintenance | **Abandoned.** Maintainer officially ended support August 2025. |
| Layout | Justified rows, not masonry |
| Virtualization | None |

**Verdict:** Dead project, wrong layout type. **Do not use.**

**Source:** [react-grid-gallery GitHub](https://github.com/benhowell/react-grid-gallery)

---

### 1i. Other Notable Libraries (2024-2026)

| Library | Notes |
|---------|-------|
| **masonry-grid** (1.4 kB) | Vanilla JS + framework adapters. Ultra-small. No virtualization. SSR compatible. No React-specific features. |
| **react-plock** (1 kB) | Ultra-minimal masonry. No virtualization. 3 columns default. Cute for small grids, not for 1500 photos. |
| **MUI Masonry** | Part of Material UI. Heavy dependency chain. SSR support via `defaultHeight`/`defaultColumns`. No virtualization. Overkill to pull in MUI for one component. |
| **react-layout-masonry** | Lightweight responsive masonry. No virtualization. Low adoption. |

---

### Comparison Summary Table

| Library | Virtualization | React 19 | Next.js SSR | Active Maint. | Bundle | Best For |
|---------|---------------|----------|-------------|---------------|--------|----------|
| **react-photo-album** | Progressive (InfiniteScroll) | Yes | Excellent | Yes (9 days ago) | ~19 kB (tree-shakeable) | Photo galleries specifically |
| **@virtuoso.dev/masonry** | Yes (windowing) | Likely | Client only | Yes (2 months ago) | ~24 kB | Large datasets needing windowing |
| **masonic** | Yes (windowing) | Uncertain | Problematic | Declining | ~8 kB | Performance-critical grids |
| **@tanstack/react-virtual** | Yes (DIY masonry) | Yes | Client only | Yes | ~20 kB | Custom implementations |
| **react-masonry-css** | No | Untested | Client only | Abandoned | ~2 kB | Small grids, legacy projects |
| **react-responsive-masonry** | No | Untested | Client only | Slow | ~3 kB | Simple prototypes |
| **CSS grid-lanes** | No | N/A | Yes | N/A (spec) | 0 kB | Future (Q3 2026+) |

---

## 2. Virtualization Strategy

### Why Virtualization Matters for 200-1500 Photos

Without virtualization, rendering 1500 photos means:
- **1500 DOM nodes** (img elements + wrappers) = ~3000+ total nodes
- Each `<img>` with `loading="lazy"` still creates a DOM node even before loading
- Mobile browsers struggle with 1000+ nodes; scroll jank begins at ~500 image nodes on mid-range phones
- Memory: each decoded image in the viewport consumes GPU texture memory. 50 visible images at 500x500 ~= 50MB GPU memory. 1500 decoded images = impossible on mobile.

**The math for 1500 photos on mobile:**
- Viewport shows ~6-12 photos at a time
- With 2x overscan buffer: ~18-36 photos need to be in DOM
- Virtualization reduces DOM from 1500 to ~30 nodes = **98% reduction**

### How Masonry + Virtualization Interact

The fundamental challenge: masonry layouts have **variable-height items** arranged in **multiple columns**, and you need to know the height of every item above the viewport to calculate scroll positions.

**Height calculation approaches:**

1. **Known dimensions (react-photo-album approach):** Photos are declared with `width` and `height` metadata. Layout is calculated mathematically without measuring DOM. This is the most performant approach but requires image dimensions to be known upfront.

2. **Measure-then-position (masonic approach):** Render items, measure their height via ResizeObserver, then position them. Uses a red-black interval tree to efficiently determine which items are visible at any scroll position. More flexible (works with any content) but has a measurement overhead.

3. **Estimate-then-correct (@tanstack/virtual approach):** Provide estimated heights, render visible items, measure actual heights, correct positions. Works well for near-uniform items but can cause visual jumps for highly variable masonry.

**For photo galleries specifically:** Approach #1 is ideal because image dimensions are known from metadata (EXIF, API response, or pre-processing). This eliminates the measure-then-position overhead entirely.

### Intersection Observer vs Scroll Position

| Approach | Pros | Cons |
|----------|------|------|
| **IntersectionObserver** | Event-driven (no scroll listener), battery-efficient, built-in browser API | Cannot predict positions ahead of scroll; only fires when threshold crossed |
| **Scroll position + requestAnimationFrame** | Precise control, can pre-render ahead of scroll direction | Continuous computation, higher CPU on mobile |
| **Hybrid (used by masonic, @virtuoso.dev)** | IO for coarse detection, scroll position for fine-grained windowing | More complex implementation |

**For progressive loading (react-photo-album InfiniteScroll):** IntersectionObserver is sufficient. A sentinel element near the bottom triggers loading the next batch.

**For true windowing (masonic, @virtuoso.dev):** Scroll position tracking is necessary to determine exactly which items should be in the DOM at any given scroll offset.

### Memory Management for Large Image Sets

- **Next.js Image component** handles responsive `srcset` generation -- mobile devices download smaller images
- **Browser native lazy loading** (`loading="lazy"`) defers off-screen image requests
- **Decode off-thread:** `decoding="async"` attribute prevents image decode from blocking main thread
- **Thumbnail strategy:** Load 200px thumbnails for grid; full-resolution only in lightbox
- **Batch loading:** Load 20-50 photos per batch, not all at once
- **Image format:** WebP/AVIF via Next.js Image optimization cuts payload 60-80%

---

## 3. Infinite Scroll vs Pagination

### UX Research Summary

UX research from [Smashing Magazine](https://www.smashingmagazine.com/2016/03/pagination-infinite-scrolling-load-more-buttons/) and [Interaction Design Foundation](https://www.interaction-design.org/literature/topics/infinite-scrolling) consistently finds:

| Pattern | Mobile UX | For photo galleries |
|---------|-----------|-------------------|
| **Traditional pagination** | Clunky; page numbers are small tap targets; full page reload breaks flow | Poor -- disrupts visual browsing |
| **True infinite scroll** | Disorienting; no sense of position; scroll bar lies; impossible to reach footer; higher cognitive load | Risky -- users lose track of where they are in 1500 photos |
| **"Load More" button** | Best balance. User controls pace. Small milestones. Can still reach footer. Works on all devices. | **Best fit** -- users feel in control, can stop when they want |

### Recommendation: "Load More" with Progressive Enhancement

For our target audience (women 30-60, not tech-savvy, primarily mobile):

1. **Initial load:** 30-50 photos (fills ~3-4 screens of scrolling)
2. **"Load More" button** at bottom, large touch target (min 48px), friendly label like "See more photos"
3. **Optional:** After 2 manual taps, offer "Auto-load as you scroll" toggle (opt-in infinite scroll)
4. **Batch size:** 30-50 photos per load
5. **Progress indicator:** "Showing 50 of 347 photos" -- gives users context

react-photo-album's `InfiniteScroll` component supports this pattern directly. It can be configured as either true infinite scroll or "load more" button.

### Back-Navigation / Scroll Position Restoration

This is the hardest UX problem with any progressive loading pattern:

**The scenario:** User loads 200 photos, taps photo #150 to view in lightbox or detail page, presses back. Where are they?

**Solutions:**
1. **Lightbox overlay (best):** Photo opens in a `<dialog>` overlay. No navigation occurs. User closes lightbox and is exactly where they were. react-photo-album + yet-another-react-lightbox handles this natively.
2. **URL state:** Track loaded batch count in URL query param (`?loaded=200`). On back-nav, re-fetch up to that point.
3. **sessionStorage:** Store scroll offset and batch count. Restore on back-nav.
4. **Next.js scroll restoration:** Experimental `scrollRestoration` config in `next.config.js`.

**For this project:** Using a lightbox overlay for photo viewing eliminates the back-nav problem entirely. The photo view is a modal, not a page navigation.

---

## 4. Animation Integration

### Compatibility with motion/react

All the evaluated libraries render standard React elements (`<div>`, `<img>`), so motion/react can wrap them. However, the integration approach differs:

**react-photo-album:** Supports custom `renderPhoto` prop, allowing you to wrap each photo in a `<motion.div>` for entrance animations. The layout positions are calculated by the library; animation is just visual sugar on top.

```tsx
// Conceptual example
<MasonryPhotoAlbum
  photos={photos}
  renderPhoto={({ photo, imageProps }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <img {...imageProps} />
    </motion.div>
  )}
/>
```

**masonic / @virtuoso.dev/masonry:** Custom `render` prop for each cell. Same wrapping approach works, but be cautious -- virtualized items mount/unmount rapidly on scroll, so entrance animations fire on every scroll-into-view, not just initial load.

### Staggered Reveal Animations on Scroll

motion/react provides `staggerChildren` and `delayChildren` via variants:

```tsx
const container = {
  visible: {
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
```

**Caveat for virtualized lists:** Stagger delays based on index don't work well because the "index" resets as items enter/leave the viewport. For virtualized masonry, prefer **IntersectionObserver-triggered** fade-ins (your existing `useScrollReveal` hook) over index-based staggers.

**Caveat for non-virtualized (react-photo-album):** Stagger works naturally for each "batch" loaded via InfiniteScroll. New photos animate in as a group. Previously loaded photos are already visible and don't re-animate.

### Performance Implications

- motion/react only animates `transform` and `opacity` (GPU-accelerated) -- aligns with your existing animation rules
- Animating 30-50 photos per batch is fine; animating 500+ simultaneously would cause frame drops
- `LazyMotion` can reduce motion/react's bundle contribution to <5 kB if needed
- On mobile, keep stagger delays short (0.02-0.04s per item) to avoid the gallery feeling "slow"
- `prefers-reduced-motion`: Disable stagger entirely, show photos immediately

---

## 5. Mobile-First Considerations

### Touch Interactions

**Pinch-to-zoom on individual photos:**
Not possible on grid thumbnails (conflicts with page zoom). Handle this in the lightbox instead:
- [yet-another-react-lightbox](https://yet-another-react-lightbox.com/) supports pinch-to-zoom via its Zoom plugin
- [PhotoSwipe](https://photoswipe.com/) (alternative) has native gesture support
- Tap a photo -> opens lightbox -> pinch/zoom/swipe within lightbox

**Swipe behaviors:**
- Horizontal swipe in lightbox: navigate photos
- Vertical swipe down in lightbox: close (common mobile pattern)
- Pull-to-refresh: Let the browser/OS handle this natively; don't interfere

### Responsive Column Counts

| Viewport | Columns | Rationale |
|----------|---------|-----------|
| < 480px (phone portrait) | 2 | Large enough thumbnails for tap targets; 1 column wastes space |
| 480-768px (phone landscape / small tablet) | 3 | |
| 768-1024px (tablet) | 3-4 | |
| 1024-1440px (desktop) | 4 | |
| > 1440px (large desktop) | 5 | Cap here; wider grids lose intimacy |

react-photo-album handles this automatically via container width detection and its layout algorithm.

### Scroll Performance on Mobile

**Key metrics:**
- Target: 60fps scroll (16.7ms frame budget)
- DOM nodes: Keep below 500 visible at any time
- Image decoding: Use `decoding="async"` to prevent main thread blocking
- Compositor-only properties: Only animate `transform` and `opacity`

**Strategies:**
1. Progressive loading (30-50 photos per batch) keeps DOM manageable
2. Next.js `<Image>` with `loading="lazy"` defers off-screen images
3. `content-visibility: auto` on off-screen sections (CSS containment, broad browser support)
4. Thumbnail sizes: 300-400px wide for grid; full res only in lightbox

### Image Sizing Strategy for Mobile Bandwidth

Using Next.js Image component's built-in optimization:

| Device | Thumbnail width | Estimated file size (WebP) | For 50 visible photos |
|--------|----------------|---------------------------|----------------------|
| Phone (2 cols) | ~180px | ~15-25 kB each | ~750 kB - 1.25 MB |
| Tablet (3 cols) | ~250px | ~25-40 kB each | ~1.25 - 2 MB |
| Desktop (4 cols) | ~350px | ~35-55 kB each | ~1.75 - 2.75 MB |

Next.js Image generates `srcset` with multiple resolutions. The browser picks the appropriate one based on viewport width and device pixel ratio.

**Configuration approach:**
```tsx
<Image
  src={photo.src}
  width={photo.width}
  height={photo.height}
  sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
  loading="lazy"
  decoding="async"
  placeholder="blur"
  blurDataURL={photo.blurHash}
/>
```

**BlurHash/LQIP strategy:**
Generate low-quality image placeholders (BlurHash or 10px-wide base64 thumbnails) at build time or upload time. These render instantly while the full image loads, giving the gallery a polished feel that matches the "warm/cute" aesthetic.

---

## 6. Recommendation

### Top Pick: react-photo-album + yet-another-react-lightbox

**Why react-photo-album wins:**

1. **Purpose-built for exactly this use case.** It is a photo gallery library, not a generic masonry layout. Every design decision optimizes for displaying photos.

2. **Actively maintained.** Last publish 9 days ago. Explicit React 19 support. Tested against React 19.2.0.

3. **Best-in-class Next.js integration.** SSR-friendly markup that is pixel-perfect before hydration. Optional pure Server Component with zero client JS. `defaultContainerWidth` prop for SSR.

4. **Tree-shakeable v3.** Import only `MasonryPhotoAlbum` + `masonry.css`. No CSS-in-JS runtime.

5. **Built-in InfiniteScroll.** `import { InfiniteScroll } from "react-photo-album/scroll"` -- handles progressive loading natively.

6. **Lightbox ecosystem.** Same author maintains yet-another-react-lightbox with pinch-to-zoom, swipe, keyboard nav, plugins. First-party integration means no glue code.

7. **Responsive images.** Automatic `srcset` and `sizes` generation works with Next.js Image optimization.

8. **Custom render props.** `renderPhoto` allows wrapping items in `motion.div` for entrance animations without fighting the library.

9. **Aspect ratio preservation.** Core design principle -- photos are declared with dimensions and layout algorithm respects them.

**The virtualization gap -- and why it does not matter here:**

react-photo-album does not do DOM windowing (removing off-screen items from DOM). This sounds like a problem for 1500 photos, but consider the implementation:

- With InfiniteScroll loading 50 photos per batch, the user starts with 50 DOM nodes
- After 4 "Load More" taps: 200 DOM nodes. Smooth on any modern phone.
- After 10 taps: 500 DOM nodes. Some mid-range phones may start to feel it.
- With `loading="lazy"` on images, off-screen images are not decoded/consuming GPU memory
- CSS `content-visibility: auto` can be applied to offscreen batches to skip layout/paint

For a photo gallery where users browse casually (not programmatically scrolling through 1500 photos), most users will view 50-200 photos in a session. The progressive loading approach keeps the DOM size proportional to what the user has actually browsed.

If profiling reveals DOM size is a problem at 500+ photos, a hybrid approach is possible: use react-photo-album for layout/rendering and add a custom IntersectionObserver that unmounts photo batches that are far off-screen.

### Runner-Up: @virtuoso.dev/masonry

**Choose this if:**
- Profiling proves that 500+ photo DOM nodes cause unacceptable scroll performance on target devices
- The gallery must support browsing through all 1500 photos in a single session (power user behavior)
- You need true windowing from day one

**Tradeoffs vs react-photo-album:**
- No built-in photo-specific features (aspect ratio preservation, srcset, responsive images are all DIY)
- No lightbox integration
- No SSR layout
- Heavier bundle (~24 kB)
- Less proven React 19 compatibility
- You are building a photo gallery from primitives rather than using a purpose-built one

### What to Avoid

| Library | Why |
|---------|-----|
| **react-masonry-css** | Abandoned 5+ years. Top-to-bottom column ordering. No virtualization. |
| **react-grid-gallery** | Officially abandoned Aug 2025. |
| **masonic** | Declining maintenance. Known Next.js SSR issues. Uncertain React 19 compat. Risk of adopting a library heading toward abandonment. |
| **CSS grid-lanes** | Not production-ready in any stable browser as of Feb 2026. Revisit Q4 2026. |
| **MUI Masonry** | Pulls in Material UI dependency chain for one component. |
| **DIY @tanstack/react-virtual masonry** | Significant custom work for something react-photo-album solves out of the box. |

### Implementation Architecture

```
app/gallery/
  page.tsx              -- Server component: fetch photo metadata, render shell
  GalleryContent.tsx    -- 'use client': MasonryPhotoAlbum + InfiniteScroll + Lightbox
  gallery.css           -- Masonry CSS import + custom warm/cute overrides

Components:
  MasonryPhotoAlbum    (from react-photo-album)
  InfiniteScroll       (from react-photo-album/scroll)
  Lightbox             (from yet-another-react-lightbox)
  LoadMoreButton       (custom: styled for warm aesthetic)
  PhotoCard            (custom renderPhoto: motion.div wrapper)
```

**Key dependencies to add:**
```
react-photo-album       (v3.3.x)  -- ~19 kB, tree-shakeable
yet-another-react-lightbox (v3.x) -- ~15 kB, plugin architecture
```

---

## Sources

- [WebKit: When will CSS Grid Lanes arrive?](https://webkit.org/blog/17758/when-will-css-grid-lanes-arrive-how-long-until-we-can-use-it/)
- [Chrome: Help us build CSS Masonry](https://developer.chrome.com/blog/masonry-update)
- [CSS-Tricks: Masonry Layout is Now grid-lanes](https://css-tricks.com/masonry-layout-is-now-grid-lanes/)
- [MDN: Masonry layout](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Masonry_layout)
- [react-photo-album documentation](https://react-photo-album.com/documentation)
- [react-photo-album npm](https://www.npmjs.com/package/react-photo-album)
- [react-photo-album GitHub](https://github.com/igordanchenko/react-photo-album)
- [masonic GitHub](https://github.com/jaredLunde/masonic)
- [masonic npm](https://www.npmjs.com/package/masonic)
- [@virtuoso.dev/masonry npm](https://www.npmjs.com/package/@virtuoso.dev/masonry)
- [React Virtuoso](https://virtuoso.dev/masonry/)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [react-masonry-css npm](https://www.npmjs.com/package/react-masonry-css)
- [react-responsive-masonry npm](https://www.npmjs.com/package/react-responsive-masonry)
- [react-grid-gallery GitHub](https://github.com/benhowell/react-grid-gallery)
- [yet-another-react-lightbox](https://yet-another-react-lightbox.com/)
- [npm trends comparison](https://npmtrends.com/masonic-vs-react-masonry-component-vs-react-masonry-css-vs-react-masonry-infinite-vs-react-responsive-masonry)
- [Smashing Magazine: Infinite Scrolling, Pagination Or Load More](https://www.smashingmagazine.com/2016/03/pagination-infinite-scrolling-load-more-buttons/)
- [Interaction Design Foundation: Infinite Scrolling](https://www.interaction-design.org/literature/topics/infinite-scrolling)
- [motion/react stagger documentation](https://www.framer.com/motion/stagger/)
- [Next.js Image Component docs](https://nextjs.org/docs/app/api-reference/components/image)
- [another-react-responsive-masonry (TanStack Virtual masonry)](https://github.com/hmpthz/another-react-responsive-masonry)
