# Domain Pitfalls: Event Photo Gallery with Supabase Backend

**Domain:** Event photo delivery gallery added to existing Next.js 16 dark cinematic portfolio site
**Researched:** 2026-02-08
**Confidence:** MEDIUM-HIGH (mix of verified Supabase docs, cross-referenced community findings, and codebase-specific analysis)

---

## Critical Pitfalls

Mistakes that cause rewrites, runaway costs, or broken core functionality.

---

### Pitfall 1: Supabase Bandwidth Costs Exploding with Unoptimized Images

**What goes wrong:** Admin uploads 1500 full-resolution event photos (3-8MB each) directly to Supabase Storage. Every gallery view loads full-res images. With 200 guests each viewing 1500 photos, bandwidth hits 200 x 1500 x 5MB = 1.5TB. At $0.09/GB uncached, that is $135 for a single event, PER EVENT. The free tier (10GB total bandwidth) blows out after 2 guests viewing the gallery.

**Why it happens:** Developers test with 5-10 images on localhost and never calculate real-world bandwidth. Admin uploads straight from camera (5-8MB JPEGs), and since "it works" in dev, nobody notices until the Supabase bill arrives. The mental model is "storage is cheap" without realizing egress is the real cost.

**Consequences:**
- Free tier (10GB bandwidth) exhausted within hours of gallery launch
- Pro tier ($25/mo, 250GB included) exhausted within a day for a popular event
- Overage charges at $0.09/GB uncached or $0.03/GB cached add up rapidly
- Site slows to a crawl as images load on mobile over cellular
- Users abandon gallery before photos finish loading

**Prevention:**
- NEVER serve original uploads directly to end users
- Generate multiple resolutions on upload: thumbnail (300px wide, ~15KB), medium (800px wide, ~80KB), full (1600px wide, ~200KB)
- Use Supabase Image Transformations for on-the-fly resizing (Pro plan required, $5/1000 origin images)
- OR pre-generate resized variants server-side during upload (avoids transformation billing entirely)
- Configure Smart CDN caching with high cache-control headers (cached egress is $0.03/GB vs $0.09/GB uncached)
- Calculate expected bandwidth BEFORE launch: (guests x photos x avg_image_size x avg_views_per_guest)
- Set a realistic budget alert in Supabase dashboard

**Detection:**
- Supabase dashboard shows egress climbing fast after gallery launch
- Network tab shows individual image requests >500KB
- Users complain about slow loading on mobile
- Supabase billing page shows unexpected overages

**Phase to address:** Phase 1 (Storage & Upload). Image optimization pipeline MUST be built before any gallery frontend exists.

**Source confidence:** HIGH (verified with [Supabase Bandwidth Docs](https://supabase.com/docs/guides/storage/serving/bandwidth), [Supabase Pricing](https://supabase.com/pricing), [Supabase Storage Scaling](https://supabase.com/docs/guides/storage/production/scaling))

---

### Pitfall 2: Image Transformation Billing Surprise

**What goes wrong:** Using Supabase Image Transformations for on-the-fly resizing seems convenient, but Pro plan only includes 100 origin images per billing cycle. With 1500 event photos, you exceed the quota by 1400 images on day one, triggering $10 in overage charges ($5/1000 images). Worse: the billing counts DISTINCT origin images per cycle, so each new event resets the count and adds more cost.

**Why it happens:** Developers read "image transformations" in docs and assume it is unlimited or cheap. The 100-image quota is buried in billing docs, not prominently displayed in the feature documentation. One real-world case showed a developer's usage surging to 196 transformations/month and needing emergency optimization.

**Consequences:**
- $5-10+ per event in transformation charges on top of egress
- Cannot disable transformations -- any user who discovers your image URLs can request arbitrary transformations, churning through your billing (confirmed by Supabase support: no way to disable this)
- Multiple events per month compound the cost

**Prevention:**
- Pre-generate all size variants during upload rather than relying on on-the-fly transformation
- Use a Next.js API route or Edge Function to resize images during the admin upload flow
- Store pre-generated thumbnails, medium, and full variants as separate files in storage
- This eliminates transformation billing entirely
- If you must use transformations, use Smart CDN to cache transformed results aggressively

**Detection:**
- Check Supabase dashboard > Usage > Storage Image Transformations
- Origin image count exceeding 100/month = overage territory
- Transformation URLs in client-side code (e.g., `?width=300&height=300` appended to storage URLs)

**Phase to address:** Phase 1 (Storage & Upload). Decide pre-generation vs on-the-fly BEFORE building the gallery frontend.

**Source confidence:** HIGH (verified with [Supabase Image Transformations Billing](https://supabase.com/docs/guides/platform/manage-your-usage/storage-image-transformations), [Supabase Image Transformations Docs](https://supabase.com/docs/guides/storage/serving/image-transformations))

---

### Pitfall 3: Mobile Photo Download Broken on iOS Safari

**What goes wrong:** The HTML5 `download` attribute on `<a>` tags does not work on iOS Safari. Period. Users tap "Download" and nothing happens, or the browser opens the image in a new tab instead of saving it. This is the PRIMARY user action for your target audience (non-tech-savvy women 30-60 who want to save event photos to their camera roll).

**Why it happens:** iOS Safari has historically refused to support the `download` attribute. Cross-origin resources make it worse -- even Chrome ignores `download` for cross-origin URLs (which Supabase Storage URLs always are). Developers test on desktop Chrome where `download` works fine and never test on actual iPhones.

**Consequences:**
- Core feature completely broken for ~50% of mobile users (iOS)
- Target audience (non-tech-savvy women 30-60) will not know to long-press and "Save Image"
- "Download" button does nothing or opens image in new tab
- Users think the site is broken, cannot get their event photos
- The entire value proposition of the gallery fails

**Prevention:**
- Do NOT rely on the `<a download>` attribute at all
- Implement a fetch-then-save approach: fetch the image as a blob via JavaScript, create an object URL, then trigger download via programmatic click on a dynamically created anchor
- For iOS Safari specifically: the fetch must happen in response to a user gesture (tap), not in a setTimeout or async callback, or Safari blocks it as a popup
- Add a `Content-Disposition: attachment` header via a Next.js API route that proxies the download (Supabase Storage does not natively support this header)
- Create a `/api/download` route that fetches from Supabase Storage and streams to the client with proper headers
- Provide clear UX fallback: if programmatic download fails, show instructions to "Long press the image and tap 'Save Image'" with a visual guide
- Test on REAL iOS Safari devices, not just simulators

**Detection:**
- Testing download on iOS Safari shows no file saved
- Users report inability to save photos
- Download button opens image in new tab
- Console shows no errors (silent failure)

**Phase to address:** Phase 2 (Gallery Frontend). Download UX is a core feature that needs specific mobile testing.

**Source confidence:** HIGH (verified with [Can I Use: download attribute](https://caniuse.com/download), [Apple Developer Forums: download attribute](https://developer.apple.com/forums/thread/115102), [WebKit Bug 167341](https://bugs.webkit.org/show_bug.cgi?id=167341), [Supabase Storage Downloads](https://supabase.com/docs/guides/storage/serving/downloads))

---

### Pitfall 4: Masonry Grid Destroying Mobile Performance with 1500 Photos

**What goes wrong:** Rendering 1500 photos in a masonry grid without virtualization creates 1500 DOM nodes with 1500 image elements. Mobile browsers choke -- Safari crashes, Chrome runs out of memory, scroll becomes janky. Even "lazy loading" via `loading="lazy"` does not help because the DOM nodes still exist and the browser pre-calculates layout for all of them.

**Why it happens:** CSS-only masonry (columns or flexbox) renders all items in the DOM. Developers see "lazy loading" and assume images are handled, but the DOM itself is the bottleneck on mobile, not just image downloads. Testing with 20 photos feels smooth; 1500 photos exposes the real problem.

**Consequences:**
- iOS Safari tab crashes with >500 unvirtualized image nodes
- Android Chrome uses 500MB+ memory, triggers system kill
- Scroll frame rate drops below 10fps
- Battery drain from constant layout recalculation
- CLS as images of varying sizes load and shift content

**Prevention:**
- Use virtualized masonry (only render visible items): Masonic library is purpose-built for this
- Masonic uses a red-black interval tree for O(log n + m) scroll position lookups, handling tens of thousands of items
- Implement infinite scroll with pagination: load 50-100 photos at a time from Supabase
- Pre-measure image aspect ratios (store width/height in database at upload time) to avoid layout recalculation when images load
- Set explicit aspect ratios on placeholders BEFORE images load to prevent CLS
- Limit initial render to 50-100 items, load more on scroll
- Use `contain: layout` CSS on grid items to isolate reflows

**Detection:**
- Safari Developer Tools > Memory tab shows increasing memory usage during scroll
- Chrome DevTools Performance tab shows long "Recalculate Style" and "Layout" tasks
- DOM node count exceeds 3000 in Elements panel
- Mobile device becomes warm during gallery browsing
- Users report app/tab crashing

**Phase to address:** Phase 2 (Gallery Frontend). Virtualization must be the foundation, not an afterthought.

**Source confidence:** MEDIUM-HIGH (verified with [Masonic GitHub](https://github.com/jaredLunde/masonic), [react-virtualized Masonry crash issue](https://github.com/bvaughn/react-virtualized/issues/1685), [web.dev CLS optimization](https://web.dev/articles/optimize-cls))

---

### Pitfall 5: Lenis Smooth Scroll Conflicting with Virtualized Masonry

**What goes wrong:** The existing Shrike site uses Lenis for smooth scroll (confirmed in `LenisProvider.tsx`). Lenis intercepts native scroll events and runs its own requestAnimationFrame loop. Virtualized masonry libraries like Masonic rely on native scroll position (`window.scrollY` / `scrollTop`) to determine which items to render. Lenis's scroll interception can cause the virtualization to miscalculate visible range, rendering wrong items or showing blank space.

**Why it happens:** Lenis works by overriding native scroll behavior with smoothed physics. It manages its own scroll position that may temporarily differ from the browser's reported `scrollY`. Libraries that read `scrollY` to determine visible viewport get stale or smoothed values, causing render mismatches.

**Consequences:**
- Gallery shows blank rows during fast scroll (virtualization renders wrong range)
- Items pop in/out as Lenis catches up to actual position
- Double scroll handling creates performance overhead
- Scroll position jumps when transitioning between gallery sections
- Infinite scroll triggers at wrong positions (loads too early or too late)

**Prevention:**
- Option A: Disable Lenis specifically on the `/gallery` route. The gallery has a different design aesthetic anyway, so native scroll is appropriate. Check the current `LenisProvider.tsx` -- it wraps the entire app in `layout.tsx`. Add a pathname check to skip Lenis on gallery routes.
- Option B: Use Masonic's `scrollContainer` prop to specify a dedicated scroll container that Lenis does not manage.
- Option C: Use Lenis's `lenis.actualScroll` property (raw position without smoothing) for virtualization calculations.
- The simplest approach is Option A: the gallery is a warm/cute aesthetic that does not need cinematic smooth scrolling anyway.

**Detection:**
- Blank areas in the masonry grid during scroll
- Items "popping" in and out visibly
- Scroll position mismatch between Lenis and actual viewport
- Infinite scroll callback firing at wrong times

**Phase to address:** Phase 2 (Gallery Frontend). Must be resolved when implementing the masonry grid.

**Source confidence:** MEDIUM (based on analysis of existing `LenisProvider.tsx` code, Lenis's documented scroll interception behavior from [Lenis GitHub](https://github.com/darkroomengineering/lenis), and general knowledge of virtualization scroll requirements)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or poor user experience.

---

### Pitfall 6: Theme Bleed Between Dark Cinematic Site and Warm Gallery

**What goes wrong:** The existing Shrike site defines theme colors as CSS custom properties in `globals.css` using oklch dark palette (`--color-background: oklch(0.1 0.01 240)`). Adding a warm/cute gallery theme without proper isolation causes the dark theme to "bleed" into gallery components, or gallery's warm colors to break the main site. Navigation and Footer use Tailwind classes referencing these dark theme variables (`bg-background`, `text-foreground`, `border-border-subtle`) -- these will look wrong against a warm gallery background.

**Why it happens:** The theme is defined globally via CSS custom properties in `globals.css`, and Navigation/Footer are rendered outside `PageTransition` in `layout.tsx`. There is no per-route theme scoping. Developers override variables in a gallery CSS file, not realizing the Navigation component still references the global dark values, or vice versa.

**Consequences:**
- Dark navigation bar clashes against warm gallery background
- Gallery text invisible (light text on light background)
- Footer styling breaks in gallery context
- Inconsistent hover states between themes
- Users perceive two different, broken sites rather than one cohesive experience

**Prevention:**
- Use a route group `(gallery)` with its own `layout.tsx` that applies a `data-theme="gallery"` attribute to the body/container
- Override CSS custom properties under `[data-theme="gallery"]` scope in globals.css or a separate gallery CSS file
- Consider whether the gallery should have its OWN Navigation component (simpler, different links, warm colors) rather than reusing the dark cinematic one
- If reusing Navigation, ensure it adapts via the data-theme selector: `[data-theme="gallery"] .nav-link` etc.
- Test both themes in the same browser session -- navigate from homepage to gallery and back
- WARNING: Using multiple root layouts in Next.js route groups causes FULL PAGE RELOAD when navigating between groups (not client-side navigation). This is acceptable if gallery is a separate experience, but know this is the tradeoff.

**Detection:**
- Visual inspection: navigate between `/` and `/gallery` -- colors should feel intentional, not broken
- Check Navigation component renders correctly in both contexts
- Verify Tailwind utility classes that reference theme variables resolve correctly in gallery

**Phase to address:** Phase 2 (Gallery Frontend). Theme system must be designed before any gallery UI components.

**Source confidence:** HIGH (verified by reading existing `globals.css`, `layout.tsx`, and `Navigation.tsx` source code, confirmed with [Next.js Route Groups docs](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups))

---

### Pitfall 7: Anonymous Social Features Abused by Bots and Trolls

**What goes wrong:** Anonymous likes (localStorage-based) and anonymous comments (no auth) are trivially abusable. A script can clear localStorage and re-like infinitely. Anonymous comments become a spam/harassment vector. For an event gallery targeting non-tech-savvy women 30-60, a single troll comment visible to all guests poisons the entire experience.

**Why it happens:** "Anonymous" is chosen because requiring auth creates friction for the target audience. But truly anonymous systems have no accountability. Developers underestimate the speed at which bots or motivated bad actors can exploit these features.

**Consequences:**
- Like counts become meaningless (bot inflation or manipulation)
- Spam comments (ads, phishing links, offensive content)
- Harassment comments targeting individuals in photos
- Loss of trust -- guests associate bad comments with the event host/photographer
- Moderating comments after the fact is too late (damage done)

**Prevention:**
- **Likes:** Use localStorage + device fingerprint hash (canvas fingerprint, screen resolution, etc.) stored in a Supabase table. One like per device-fingerprint per photo. Not bulletproof, but raises the bar above "clear localStorage."
- **Comments:** Implement approval queue. Comments are inserted with `approved: false` and only visible after admin approval. This is the single most important safeguard.
- **Rate limiting:** Use Supabase Edge Functions or a Next.js API route with IP-based rate limiting (max 10 comments per hour per IP). Supabase anonymous sign-ins have a built-in 30 requests/hour rate limit.
- **Content filtering:** Basic profanity/spam filter on comment text before insertion. Block URLs in comments entirely (no legitimate reason for URLs in event photo comments).
- **RLS policies:** Even with anonymous access, write RLS policies that validate input shape (comment length < 500 chars, no HTML, etc.)
- **Nuclear option:** If abuse becomes a problem, switch to invite-only access with a simple PIN code per event (e.g., "Enter the event code from your email"). This adds minimal friction for legitimate guests.

**Detection:**
- Sudden spike in like counts on specific photos
- Comments containing URLs, repeated text, or profanity
- Multiple comments from same IP in short timeframe
- Supabase logs showing unusual INSERT patterns

**Phase to address:** Phase 3 (Social Features). Must be designed with abuse prevention from day one, not bolted on later.

**Source confidence:** MEDIUM (based on general security best practices, [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), and [FingerprintJS](https://github.com/fingerprintjs/fingerprintjs) for device fingerprinting)

---

### Pitfall 8: Supabase `storage.list()` Performance with 1500 Objects

**What goes wrong:** Using `supabase.storage.from('photos').list()` to fetch the list of photos in a gallery slows dramatically with large object counts. This method retrieves both folders and objects generically and does not scale well. For 1500 photos, the list operation can take several seconds, blocking gallery load.

**Why it happens:** `storage.list()` was designed for general-purpose file listing, not high-performance gallery queries. Developers use it because it is the obvious API, not realizing it scans objects linearly.

**Consequences:**
- Gallery takes 3-5 seconds to display photo list on load
- Every pagination request re-lists objects with offset
- Users stare at loading spinner while object list is fetched
- Mobile users on cellular connections experience even longer waits

**Prevention:**
- Store photo metadata (URL, dimensions, event_id, upload order) in a Supabase Postgres table, not just in Storage
- Query the Postgres table for gallery listings (indexed, fast, supports pagination natively)
- Use Storage only for actual file serving, not for discovery/listing
- Add database indexes on event_id and created_at for fast gallery queries
- Supabase docs specifically recommend creating a custom Postgres function for large object counts instead of using `storage.list()`

**Detection:**
- Network tab shows storage API list requests taking >1 second
- Gallery load time degrades as photo count increases
- Supabase logs show slow queries on storage schema

**Phase to address:** Phase 1 (Storage & Database Schema). Schema design must separate metadata from storage from the start.

**Source confidence:** HIGH (verified with [Supabase Storage Scaling Docs](https://supabase.com/docs/guides/storage/production/scaling) which explicitly recommends custom Postgres functions over `storage.list()`)

---

### Pitfall 9: Next.js Image Component Incompatibility with Supabase Storage

**What goes wrong:** Using Next.js `<Image>` component with Supabase Storage URLs triggers "url parameter is valid but upstream response is invalid" errors. The Next.js image optimization proxy cannot process Supabase Storage responses correctly. Developers waste hours debugging configuration that fundamentally does not work.

**Why it happens:** Next.js Image component fetches the image through its own optimization proxy (`/_next/image`), which expects specific response headers. Supabase Storage responses do not always conform. This is a documented, unresolved incompatibility.

**Consequences:**
- Images fail to load entirely
- Broken image placeholders throughout gallery
- Hours wasted on `remotePatterns` configuration that does not fix the core issue
- Fallback to `unoptimized={true}` negates all Next.js image optimization benefits

**Prevention:**
- Use standard `<img>` tags or a custom image component instead of Next.js `<Image>` for Supabase-hosted photos
- Handle image optimization at the Supabase level (pre-generate sizes, use Supabase Image Transformations) rather than Next.js level
- If you want Next.js-style lazy loading, use `loading="lazy"` on native `<img>` tags (browser-native, works everywhere)
- If you want blur placeholders, generate blurhash strings at upload time and use them with a custom component
- OR: Create a custom Next.js image loader that points to Supabase Image Transformation URLs
- Test the chosen approach with actual Supabase URLs before building the gallery

**Detection:**
- Console errors mentioning "upstream response is invalid"
- Broken images with Next.js `<Image>` but working with `<img>`
- `remotePatterns` configured but images still fail

**Phase to address:** Phase 2 (Gallery Frontend). Decide image rendering strategy early.

**Source confidence:** MEDIUM-HIGH (verified with [Supabase Issue #3821](https://github.com/supabase/supabase/issues/3821), [Vercel Community discussion](https://community.vercel.com/t/images-from-supabase-storage-result-in-invalid-image-optimize-request/6009))

---

### Pitfall 10: CLS (Cumulative Layout Shift) in Masonry Grid

**What goes wrong:** Masonry layouts by definition have variable-height items. As images load, their heights change from placeholder size to actual size, causing the entire grid to re-flow. Content below shifts down unpredictably. On mobile, users trying to tap a photo hit the wrong one because layout shifted.

**Why it happens:** Neither HTML nor CSS has native masonry layout support (CSS masonry is experimental and not production-ready). JavaScript masonry implementations position items after calculating image sizes, causing layout to shift when images load. Without pre-known aspect ratios, every image load triggers a reflow.

**Consequences:**
- Users accidentally tap wrong photos
- CLS score tanks (>0.25 is "poor" per Google)
- Visual jank as images pop into place
- Content "jumps" during scroll, disorienting users
- Especially bad on slow connections where images load incrementally

**Prevention:**
- Store image width and height in database at upload time (this is CRITICAL)
- Set explicit aspect ratios on image placeholders using `aspect-ratio: width/height` CSS BEFORE images load
- Use Masonic's auto-recalculation capability, but pre-measure whenever possible for best UX
- Show colored placeholders or blur placeholders with correct aspect ratios while images load
- For the masonry grid, calculate positions based on known dimensions, not on loaded images

**Detection:**
- Lighthouse CLS score > 0.1
- Visual test: throttle network to Slow 3G, watch grid items jump as images load
- Grid items have no explicit height/aspect-ratio before image loads

**Phase to address:** Phase 1 (Upload pipeline must capture dimensions) and Phase 2 (Gallery must use pre-computed dimensions).

**Source confidence:** HIGH (verified with [web.dev CLS optimization](https://web.dev/articles/optimize-cls), Masonic documentation)

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable without major rework.

---

### Pitfall 11: Public Bucket URL Guessing

**What goes wrong:** Public Supabase Storage buckets allow anyone with a URL to access files. If file naming is predictable (e.g., `event-123/photo-1.jpg`, `event-123/photo-2.jpg`), anyone can enumerate all photos by incrementing the filename. For event galleries, this means uninvited people can access photos.

**Why it happens:** Admin uploads with sequential or predictable filenames. Public bucket means no auth check on file access. Developers assume obscurity equals security.

**Prevention:**
- Use UUID filenames for all uploads (e.g., `events/{event_uuid}/{photo_uuid}.jpg`)
- Events themselves should have UUID or random slugs, not sequential IDs
- For sensitive events, use a private bucket with signed URLs instead (but this adds complexity)
- For most event galleries, UUID filenames + public bucket is sufficient (guests share the gallery link, individual file URLs are not guessable)

**Detection:**
- File paths contain sequential numbers or predictable patterns
- Events accessible without the gallery link by guessing URLs

**Phase to address:** Phase 1 (Storage & Upload).

**Source confidence:** HIGH (verified with [Supabase Storage Buckets docs](https://supabase.com/docs/guides/storage/buckets/fundamentals))

---

### Pitfall 12: localStorage Likes Not Persisting Across Devices/Browsers

**What goes wrong:** User likes a photo on their phone (Safari), then opens the gallery on their iPad (Safari) -- likes are gone. Each device/browser has its own localStorage. Users perceive their likes as "lost" and become frustrated.

**Why it happens:** localStorage is per-origin AND per-browser. There is no synchronization between devices. Users expect their actions to follow them (because social media trained them to expect this).

**Consequences:**
- Users confused about why their likes disappeared
- Users re-like photos, creating duplicate engagement data
- "My likes" feature shows different results on different devices
- Perceived unreliability

**Prevention:**
- Accept this as a known limitation and set expectations via UX ("Likes are saved on this device")
- Do NOT try to solve this with anonymous auth sync -- it adds massive complexity for low value
- The like count itself is still accurate (stored server-side), only the "did I already like this?" indicator is per-device
- If users request cross-device sync, that is the signal to add optional sign-in (future milestone)

**Detection:**
- User reports: "I liked this photo on my phone but it does not show as liked on my computer"

**Phase to address:** Phase 3 (Social Features). Acknowledge limitation in UX copy.

**Source confidence:** HIGH (fundamental browser behavior, no source needed)

---

### Pitfall 13: Supabase RLS Misconfiguration Exposing All Events

**What goes wrong:** If RLS policies are not properly scoped, a query to the `photos` table returns ALL photos across ALL events. A user viewing Event A's gallery inadvertently receives photo data for Events B, C, D. This is both a privacy violation and a performance problem.

**Why it happens:** RLS policies are written for the "happy path" (authenticated admin can see everything) without considering anonymous client queries. Developers forget that the `anon` key used by the client can bypass poorly written policies.

**Prevention:**
- RLS policy on `photos` table should filter by `event_id` matching the requested event
- Never expose a query endpoint that returns photos without an event_id filter
- Use a Supabase view or function that enforces event scoping
- Test RLS by making raw API calls with the anon key and no event filter -- verify it returns empty, not everything

**Detection:**
- Network tab shows more photos returned than expected
- Supabase SQL editor: run `SELECT * FROM photos` with anon role -- should return nothing

**Phase to address:** Phase 1 (Database Schema & RLS).

**Source confidence:** HIGH (verified with [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security))

---

### Pitfall 14: Forgetting to Handle the "No Photos Yet" and Loading States

**What goes wrong:** Gallery page loads but the event has 0 photos (admin has not uploaded yet). Users see a blank page with no indication of what is happening. Or during loading, users see a flash of empty grid before photos appear.

**Why it happens:** Developers always test with data. Empty states and loading states are afterthoughts. For event galleries shared via link BEFORE photos are uploaded (common pattern: "Here is your gallery link, photos will be available tomorrow"), this is the FIRST thing users see.

**Prevention:**
- Design a warm, branded empty state: "Photos are being prepared -- check back soon!" with the event branding
- Show a progress indicator if upload is in progress
- Loading state should show skeleton/placeholder grid (with warm theme colors, not generic gray)
- Error state for failed photo loads ("Some photos could not be loaded, please refresh")

**Detection:**
- Visit gallery URL for an event with 0 photos -- should be a designed experience, not blank page

**Phase to address:** Phase 2 (Gallery Frontend).

**Source confidence:** HIGH (UX best practice, verified by the project's target audience being non-tech-savvy users who will be confused by blank pages)

---

## Integration-Specific Pitfalls (Existing Shrike Codebase)

---

### Pitfall 15: PageTransition AnimatePresence Conflicting with Gallery Scroll Position

**What goes wrong:** The existing `PageTransition` component wraps all page content in `AnimatePresence` with `mode="wait"`, applying fade + slide animations on route change. When navigating from gallery photo detail back to gallery grid, AnimatePresence unmounts the grid, destroying scroll position. User returns to top of gallery instead of where they left off.

**Why it happens:** `AnimatePresence` with `mode="wait"` fully unmounts the exiting component before mounting the entering one. Scroll position is lost because the DOM is destroyed and recreated.

**Prevention:**
- For gallery, use a lightbox/modal overlay pattern instead of route navigation for photo detail
- Native `<dialog>` element (already used in the codebase for `ProjectLightbox.tsx`) preserves the gallery scroll behind the modal
- If using route-based photo detail (e.g., `/gallery/[event]/[photo]`), store scroll position in state/sessionStorage and restore on back navigation
- Consider whether the gallery even needs PageTransition animations (warm aesthetic, different from cinematic main site)

**Detection:**
- Navigate to photo detail then back to gallery -- scroll position should be preserved
- User complains about "losing their place" in the gallery

**Phase to address:** Phase 2 (Gallery Frontend). Architecture decision: lightbox vs route-based detail.

**Source confidence:** HIGH (verified by reading `PageTransition.tsx` source code which uses `mode="wait"`)

---

### Pitfall 16: Supabase Client Initialization Overhead

**What goes wrong:** Every page component creates a new Supabase client instance. For a gallery with infinite scroll loading 50 photos at a time, each scroll-triggered fetch creates a new client. This is wasteful and can trigger rate limits.

**Why it happens:** Supabase docs show client creation at the top of example files. Developers copy the pattern without realizing the client should be a singleton.

**Prevention:**
- Create a single Supabase client instance in a shared utility file (`lib/supabase.ts`)
- Use the same client instance across all gallery components
- For server components, create the client per-request (this is correct for server-side)
- For client components, use a shared singleton initialized once

**Detection:**
- Multiple `createClient()` calls across components
- Rate limit errors from Supabase

**Phase to address:** Phase 1 (Project setup).

**Source confidence:** HIGH (standard Supabase best practice from [Supabase Docs](https://supabase.com/docs/guides/api/securing-your-api))

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation Strategy |
|-------------|---------------|---------------------|
| Storage & Upload Pipeline | #1 (Bandwidth costs), #2 (Transformation billing), #8 (storage.list perf), #11 (URL guessing) | Pre-generate image variants, store metadata in Postgres, use UUID filenames |
| Database Schema & RLS | #13 (RLS misconfiguration), #10 (CLS from missing dimensions) | Store photo dimensions at upload, scope all queries by event_id, test RLS with anon key |
| Gallery Frontend (Masonry) | #4 (Mobile performance), #5 (Lenis conflict), #6 (Theme bleed), #9 (Next.js Image), #10 (CLS), #14 (Empty states), #15 (Scroll position) | Use Masonic with virtualization, disable Lenis on gallery route, pre-compute aspect ratios, use native `<img>` tags |
| Photo Download | #3 (iOS Safari download) | Proxy downloads through API route with Content-Disposition header, test on real iOS devices |
| Anonymous Social Features | #7 (Abuse), #12 (localStorage sync) | Comment approval queue, device fingerprint for likes, accept per-device limitation |
| Project Setup | #16 (Supabase client) | Singleton client pattern from day one |

---

## Confidence Assessment

| Pitfall Category | Confidence | Source Quality |
|------------------|-----------|----------------|
| Supabase Storage/Bandwidth (#1, #2, #8) | HIGH | Official Supabase docs, billing documentation |
| Mobile Download (#3) | HIGH | MDN, Can I Use, Apple Developer Forums, WebKit bug tracker |
| Masonry Performance (#4, #10) | MEDIUM-HIGH | Library documentation, GitHub issues, web.dev |
| Lenis Integration (#5) | MEDIUM | Codebase analysis + library documentation (no specific conflict reports found) |
| Theme Isolation (#6) | HIGH | Codebase analysis + Next.js route groups documentation |
| Abuse Prevention (#7) | MEDIUM | General security best practices, Supabase RLS/auth docs |
| Next.js + Supabase Images (#9) | MEDIUM-HIGH | GitHub issues with confirmed reports, Vercel community |
| Scroll Position (#15) | HIGH | Codebase analysis of PageTransition.tsx behavior |

---

## Research Gaps

Areas where deeper investigation would be valuable during implementation:

1. **Masonic + React 19 compatibility**: Masonic was built for earlier React versions. Need to verify it works with React 19's concurrent features and the version of React used in Next.js 16.1.6. If incompatible, CSS columns with IntersectionObserver may be the fallback.

2. **Supabase Edge Functions for image processing**: Can Edge Functions handle image resizing during upload? What are the timeout limits and memory constraints? Sharp/libvips availability in Deno runtime?

3. **Supabase real-time for live upload notifications**: If admin uploads photos while guests have the gallery open, can Supabase Realtime push new photos to the gallery without refresh? What is the performance cost?

4. **Blurhash generation**: For placeholder images, blurhash strings need to be generated at upload time. What library/approach works in the upload pipeline (server-side Node.js)?

5. **Safari PWA "Add to Home Screen" behavior**: For the target audience, would a PWA approach improve the gallery experience? How does iOS handle PWA photo downloads?

---

## Sources

### High Confidence (Authoritative / Official Docs)
- [Supabase Storage Bandwidth & Egress](https://supabase.com/docs/guides/storage/serving/bandwidth)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Storage Scaling / Production Optimization](https://supabase.com/docs/guides/storage/production/scaling)
- [Supabase Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Supabase Image Transformations Billing](https://supabase.com/docs/guides/platform/manage-your-usage/storage-image-transformations)
- [Supabase Storage Downloads](https://supabase.com/docs/guides/storage/serving/downloads)
- [Supabase Storage Buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Can I Use: download attribute](https://caniuse.com/download)
- [Next.js Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
- [web.dev CLS Optimization](https://web.dev/articles/optimize-cls)

### Medium Confidence (Cross-Verified Community Sources)
- [Masonic: High-performance masonry for React](https://github.com/jaredLunde/masonic)
- [react-virtualized Masonry crash with large data](https://github.com/bvaughn/react-virtualized/issues/1685)
- [Supabase + Next.js Image incompatibility](https://github.com/supabase/supabase/issues/3821)
- [Supabase Storage Content-Disposition issue](https://github.com/supabase/storage/issues/251)
- [Apple Developer Forums: download attribute](https://developer.apple.com/forums/thread/115102)
- [WebKit Bug 167341: iOS download attribute](https://bugs.webkit.org/show_bug.cgi?id=167341)
- [Lenis GitHub](https://github.com/darkroomengineering/lenis)
- [FingerprintJS](https://github.com/fingerprintjs/fingerprintjs)
- [Supabase Image Transformation cost reduction case study](https://medium.com/@muhaimincs/how-i-reduced-supabase-storage-image-transformed-by-48-8ff0949eaa47)

### Codebase Analysis (Direct Source)
- `app/globals.css` -- Theme variables, dark palette, Lenis CSS
- `app/layout.tsx` -- LenisProvider wrapping, Navigation/Footer outside PageTransition
- `components/LenisProvider.tsx` -- Lenis scroll interception via requestAnimationFrame
- `components/PageTransition.tsx` -- AnimatePresence mode="wait" unmounting behavior
- `components/Navigation.tsx` -- Dark theme Tailwind classes, nav links array
- `components/Footer.tsx` -- Dark theme border/text classes
- `package.json` -- Next.js 16.1.6, React 19, Tailwind v4, Motion
