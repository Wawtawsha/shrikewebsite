# Feature Landscape: Event Photo Gallery with Anonymous Social Features

**Domain:** Event photo delivery gallery (Pinterest-style, mobile-first, anonymous social)
**Target audience:** Women 30-60 at winery events, primarily using phones, not tech-savvy
**Researched:** 2026-02-08
**Confidence:** MEDIUM-HIGH (multiple sources cross-referenced; iOS download behavior verified against official Apple/WebKit sources)

## Executive Summary

Event photo delivery galleries in 2026 have a clear competitive landscape. Professional platforms (Pixieset, Pic-Time, ShootProof) charge $10-50/month and focus on selling prints. Consumer-sharing platforms (GuestCam, Kululu, GUESTPIX) prioritize QR-code access and guest uploads. Neither category offers what Shrike Media needs: a branded, beautiful, warm-aesthetic gallery with anonymous social features that doubles as a portfolio piece proving Shrike's engineering capability.

The key insight for this audience: **every interaction must feel obvious.** These users do not experiment with UI. If the download button is not immediately apparent, they will screenshot the photo instead (losing quality). If commenting requires more than two taps, they will not comment. The UX bar is not "intuitive for a developer" -- it is "intuitive for someone who has never used anything except Facebook and the native Camera app."

The biggest technical risk is **mobile image download.** iOS Safari does not reliably support the HTML5 `download` attribute, and cross-origin restrictions make direct `<a download>` links fail silently. Supabase Storage's `?download` query parameter with Content-Disposition headers is the correct solution, but the UX must account for iOS still sometimes opening images in a new tab rather than triggering a save dialog.

---

## Table Stakes

Features users expect from any photo delivery gallery. Missing any = "why didn't they just use Google Drive?"

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Photo grid that loads fast** | Google Photos and iCloud set the bar. Any lag = "broken." | Medium | Must lazy-load. 200-1500 photos cannot load all at once. Blur placeholders (LQIP/BlurHash) prevent layout shift. |
| **Full-screen photo view (lightbox)** | Every photo app has this. Users long-press to zoom natively. | Medium | Must support swipe-to-navigate, pinch-to-zoom. PhotoSwipe or similar. Native `<dialog>` is not enough -- need touch gestures. |
| **Photo download** | The entire point. Users need their photos on their phone. | HIGH | This is the hardest "simple" feature. iOS Safari download attribute is broken for cross-origin URLs. Must proxy through same-origin or use Supabase's `?download` parameter. Test on real iPhones. |
| **Mobile-responsive layout** | 80%+ of this audience will use phones | Low | Already proven in v1 codebase. Masonry must collapse to 2 columns on phone, 1 column is too sparse for photos. |
| **No login or signup required** | Any friction = bounce. This audience will NOT create an account to see their event photos. | Low | Zero auth. Device-based tracking for likes via localStorage. |
| **Fast initial load** | Users arrive via shared link (text message, QR code). If the page doesn't show photos within 3 seconds, they'll assume it's broken. | Medium | Initial batch of 20-30 photos, then infinite scroll. Skeleton/blur placeholders while loading. |
| **Event branding** | Users need to know they're in the right place. "Napa Valley Wine Night - March 2026" | Low | Event title, date, maybe a banner image. Simple config object or env vars for re-skinning. |
| **Share button (native)** | Users want to text photos to friends not at the event | Low | Use `navigator.share()` API on mobile (falls back to copy-link on desktop). This is what users expect -- the native share sheet they know from every app. |

---

## Differentiators

Features that make this better than "here's a Google Drive link" or "check the photographer's Pixieset page." These justify building a custom gallery instead of using an off-the-shelf service.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Anonymous likes (heart button)** | Creates social energy. Users see which photos are popular. Winery attendees will love tapping hearts on each other's candid shots. No login friction. | Low-Medium | localStorage + device fingerprint (simple hash, not FingerprintJS -- that's overkill). Store like count in Supabase. Optimistic UI update. |
| **Anonymous comments** | Lets attendees reminisce: "OMG that's when Susan spilled the Merlot!" Creates emotional attachment to the gallery. | Medium | Must be dead simple: text field, submit button, name field (optional). Rate limit by device. Character limit (280 chars). No threading -- flat comments only. |
| **Like count display** | Social proof drives engagement. "42 people loved this photo" makes users spend more time browsing. | Low | Simple counter on each photo thumbnail and in lightbox view. |
| **Warm/cute aesthetic** | Pixieset and ShootProof are clinically clean. A warm, soft, slightly playful design feels more appropriate for a winery event gallery. This IS the brand differentiator. | Medium | Separate from main site's dark cinematic theme. Warm background tones, rounded corners, soft shadows, playful micro-interactions. Think "elegant Pinterest board" not "photographer portfolio." |
| **Pinterest-style masonry grid** | Variable-height images look better in masonry than forced-aspect-ratio grids. Landscape and portrait photos coexist naturally. | Medium | CSS columns approach is simplest and most performant. Native CSS masonry (grid-lanes) arriving mid-2026 but not ready for production yet. Use CSS columns with break-inside: avoid as the proven approach. |
| **Bulk download (select multiple)** | Power user feature: "I want all the photos of my table." Select mode with checkboxes, download as zip. | High | Server-side zip generation or client-side via JSZip. Defer to post-MVP -- single photo download is the priority. |
| **QR code access** | Print a card at the event: "Scan to see your photos!" Eliminates typing URLs on phones. | Low | Generate QR code pointing to gallery URL. Static image, not runtime generation. Print on cards at the event. |
| **Photo sorting (newest/most liked)** | Lets users find the "best" photos quickly, or browse chronologically to relive the event. | Low | Two sort options is enough. Default to chronological (event story order). |
| **Smooth scroll experience** | Existing Lenis integration from v1 can make the gallery feel premium while scrolling through hundreds of photos. | Low | Already have Lenis in the stack. Wrap gallery page. May need to disable on lightbox. |
| **"Find me" scroll prompt** | A gentle floating label: "Tap any photo to see it bigger, or just keep scrolling." Teaches the UI without a tutorial. | Low | Appears once, dismissed on first interaction. Stored in localStorage. Non-tech-savvy users need this. |

---

## Anti-Features

Features to explicitly NOT build. Each represents a trap that seems logical but will hurt this specific audience.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **User accounts / login** | This audience will not sign up. Period. Any login gate = 50%+ bounce rate. They are here to see photos from last night, not to create a relationship with your platform. | Device-based anonymous tracking via localStorage. Accept that some users will lose their likes if they clear browser data. That's fine. |
| **Photo upload by guests** | Turns the curated gallery into a dumping ground of blurry phone pics. Destroys the professional quality signal. Shrike shot these photos -- guest uploads dilute the brand. | Keep the gallery photographer-only. If guests want to share their own photos, they can use the event hashtag on Instagram. |
| **Nested comment threads / replies** | Adds massive complexity. This audience does not want Reddit-style discussions under a photo of someone holding a wine glass. | Flat comments only. Most recent first. No threading, no replies, no upvotes on comments. |
| **Facial recognition / "Find my photos"** | Privacy nightmare. Legally risky (GDPR, BIPA). Technically complex. And the audience doesn't expect it from a small media company's gallery. | Manual browsing. 200-1500 photos is browsable with a good masonry grid and infinite scroll. If needed later, add simple keyword tags per photo. |
| **E-commerce / print sales** | This is a delivery gallery, not a storefront. Adding purchase flows complicates the UX and confuses the value prop. Shrike already handles booking through Calendly. | Free delivery. All photos are free to download. The value is the photography service, not per-photo sales. |
| **Admin upload UI** | Building a CMS for photo management is a project unto itself. Direct Supabase Storage uploads via dashboard or CLI is faster for the photographer (you). | Upload directly to Supabase Storage bucket. Script or CLI tool to batch upload and generate thumbnails. |
| **Real-time updates / WebSockets** | Adds complexity for negligible benefit. Photos are uploaded once after the event, not during it. Comments appearing in real-time is a nice-to-have that costs 10x the effort. | Page refresh to see new comments. Or polling every 60 seconds if feeling generous. |
| **Infinite categories/albums** | Multi-album routing, album selection UI, breadcrumb navigation -- all complexity for a single-event gallery. | Single flat gallery. One event = one page. New event = re-skin the page with new photos and branding. |
| **Complex moderation dashboard** | Building admin tools for a gallery that might get 5 inappropriate comments per event is not worth the engineering time. | Use Supabase dashboard to delete offensive comments directly from the database. Add a simple "report" button on comments that flags them in the DB. |
| **Video playback in gallery** | Mixed media galleries are complex (different aspect ratios, loading behavior, autoplay policies). Event photos are photos. | Photos only. If event has video highlights, link to them separately (YouTube, Vimeo, or the main Shrike portfolio). |
| **Dark mode toggle** | The warm/cute aesthetic is the design. A dark mode variant doubles the design work and confuses the visual identity of the gallery. The main Shrike site is already dark -- the gallery being warm and light IS the contrast. | Single light/warm theme. No toggle. |
| **Search / text filtering** | There's nothing to search. Photos don't have meaningful text metadata that a winery attendee would query. "Search for photos of wine" returns all of them. | Sort by newest/most liked is sufficient. If the gallery is large, lazy loading with infinite scroll handles discovery. |
| **Animated page transitions** | The main site has Motion-based page transitions. The gallery page should feel fast and immediate, not cinematic. The audience wants to see their photos, not watch an animation. | Instant page load. No entrance animation beyond subtle fade-in of photo tiles as they lazy-load. |
| **Social media login ("Sign in with Facebook")** | Older audience sees this as suspicious ("why does a photo gallery need my Facebook?"). Creates privacy concerns. Adds OAuth complexity. | Fully anonymous. No login of any kind. |

---

## Feature Dependencies

```
Foundation (must exist first):
  Supabase project setup (Storage bucket + Database tables)
  Photo upload pipeline (batch upload script or manual)
  Gallery page route (/gallery)
  Photo data model (URL, thumbnail URL, dimensions, created_at)
       |
       v
Core Gallery (build second):
  Masonry grid layout (CSS columns)
  Lazy loading with blur placeholders
  Infinite scroll (IntersectionObserver)
  Photo lightbox with touch gestures (swipe, pinch-zoom)
  Single photo download (Supabase ?download param)
       |
       v
Social Layer (build third):
  Anonymous likes (localStorage + Supabase counter)
  Like count display on thumbnails and lightbox
  Anonymous comments (text input + Supabase table)
  Comment display in lightbox view
  Basic spam protection (rate limit, char limit)
       |
       v
Polish (build last):
  Warm/cute visual theme
  Event branding (title, date, banner)
  Sort controls (newest / most liked)
  Native share button
  "Find me" onboarding prompt
  QR code generation for print cards
```

**Critical dependency:** The lightbox component is the hub for all social features. Likes, comments, download, and share all live in the lightbox. Build the lightbox well and the social features plug in cleanly.

**Existing code reuse:**
- `ProjectLightbox.tsx` uses native `<dialog>` -- good foundation but needs touch gesture support (swipe, pinch-zoom) for the photo gallery version
- `useScrollReveal.ts` hook can trigger lazy-loading of photo tiles
- `useReducedMotion.ts` for accessibility
- Lenis provider for smooth scroll (already in layout)
- Motion library already installed for subtle animations

---

## MVP Recommendation

For MVP, prioritize the features that make this better than texting a Google Drive link.

### MUST HAVE (Launch blockers):
1. **Masonry grid with lazy loading** -- the core browsing experience
2. **Photo lightbox with swipe navigation** -- full-screen viewing
3. **Single photo download** -- the entire point of the gallery
4. **Event branding** (title, date) -- context for the user
5. **Mobile-responsive** -- 80%+ phone users
6. **Fast initial load** (<3s to first meaningful paint)

### SHOULD HAVE (First week after launch):
7. **Anonymous likes** -- social energy with minimal complexity
8. **Like count on thumbnails** -- drives browsing engagement
9. **Warm/cute theme** -- visual differentiation from the main site
10. **Native share button** -- organic distribution

### NICE TO HAVE (Post-launch iteration):
11. **Anonymous comments** -- more complex, needs spam protection
12. **Sort controls** -- useful once gallery has likes data
13. **Onboarding prompt** -- evaluate if users struggle without it
14. **QR code for print** -- only matters at next event

### DEFER to v1.2+:
- **Bulk download** -- complex, serves power users not primary audience
- **Photo tagging/categorization** -- only if gallery sizes exceed 500 consistently
- **Comment reporting** -- only if abuse becomes a problem

---

## Complexity Assessment

### Low Complexity (1-2 days):
- Event branding (title, date, banner)
- Native share button (navigator.share)
- Like count display
- Sort controls (newest/most liked)
- QR code generation (static image)
- "Find me" onboarding prompt

### Medium Complexity (3-5 days):
- Masonry grid with CSS columns
- Lazy loading with blur placeholders (LQIP)
- Infinite scroll via IntersectionObserver
- Anonymous likes system (localStorage + Supabase)
- Anonymous comments with spam protection
- Warm/cute visual theme (distinct from main site)

### High Complexity (1-2 weeks):
- Photo lightbox with touch gestures (swipe, pinch-zoom) -- PhotoSwipe integration or custom implementation
- Photo download that works reliably on iOS Safari -- requires same-origin proxy or Supabase `?download` parameter, extensive device testing
- Photo upload pipeline (batch processing, thumbnail generation, dimension extraction)
- Supabase schema design and RLS policies for anonymous access

### Critical Risk Items:
- **iOS Safari download:** Most likely source of user complaints. Must test on real iPhones (not just simulators). The `<a download>` attribute does NOT work for cross-origin URLs on iOS. Supabase `?download` query parameter sets Content-Disposition header server-side, which is the correct approach, but behavior varies by iOS version.
- **Performance at scale:** 1500 photos with masonry layout, lazy loading, and like counts = many DOM nodes and database queries. Must virtualize or paginate aggressively.

---

## Mobile UX Patterns for Non-Tech-Savvy Users (30-60 age range)

Research on UX design for older adults reveals specific patterns critical for this audience.

### Touch Targets
- **Minimum 48x48px** tap targets (Apple HIG recommends 44pt, Material Design recommends 48dp)
- Heart/like button must be large and obvious, not a tiny icon
- Download button must have both an icon AND text label ("Save Photo")
- Comment submit button must be clearly labeled, not just an arrow icon

### Visual Clarity
- **High contrast** between interactive elements and background
- **Text labels on all icons** -- do not rely on icon-only buttons. A download icon (arrow-down) is ambiguous to this audience. "Save Photo" text next to the icon removes all doubt.
- **Large readable text** -- 16px minimum body text, 14px minimum for metadata
- **No gesture-only interactions** -- every action reachable via a visible button. Swipe-to-navigate is supplementary to visible prev/next arrows.

### Feedback and Confirmation
- **Immediate visual feedback** when a like is tapped (heart fills, counter increments, brief scale animation)
- **Success confirmation** after download: "Photo saved!" toast message. Otherwise users tap download 5 times because they aren't sure it worked.
- **Error messages in plain language:** "Something went wrong. Try again." not "Network request failed: ERR_CROSS_ORIGIN"

### Cognitive Load
- **No multi-step flows.** Download = one tap. Like = one tap. Comment = type + tap "Post."
- **No modals on top of modals.** The lightbox IS the modal. Social actions happen inside it, not in a sub-modal.
- **No hidden menus or overflow menus.** Every action visible. Three-dot menus are invisible to this audience.
- **Default to the most common action.** The lightbox opens with the download and like buttons already visible, not behind a "more" button.

### Navigation
- **Visible scroll indicator** on the main grid if content extends below the fold
- **"Back to top" button** after scrolling past 20+ photos -- this audience does not know they can tap the status bar to scroll to top on iOS
- **No horizontal scrolling.** Vertical scroll only. Horizontal swipe is reserved for lightbox photo navigation.

### Error Recovery
- **No dead ends.** If download fails, show retry button immediately.
- **Forgiving input.** Comment field should not reject input silently. If character limit reached, show "You've reached the limit" not just stop accepting characters.
- **Offline tolerance.** If user loses connection while scrolling, show cached photos and a "No internet connection" banner, not a blank page.

---

## Competitive Positioning

### Why not use existing platforms?

| Platform | Monthly Cost | Why Not Sufficient |
|----------|-------------|-------------------|
| **Google Drive** | Free | Ugly, no social features, terrible mobile browsing, no branding |
| **Pixieset** | $10-26/mo | Focused on print sales, clinical design, not warm/cute aesthetic |
| **Pic-Time** | $15-50/mo | Feature-heavy, complex for simple event delivery |
| **ShootProof** | $12-40/mo | Business-focused, overkill for anonymous social gallery |
| **GuestCam/GUESTPIX** | Free-$50/mo | Guest upload focused (not what we want), generic design |
| **Custom Shrike gallery** | Free (hosting) | Branded, warm aesthetic, anonymous social, proves engineering skill |

### Why build custom?
1. **Portfolio piece** -- the gallery itself demonstrates Shrike's engineering capability
2. **Brand control** -- warm/cute aesthetic perfectly matched to winery clientele
3. **Zero recurring cost** -- Supabase free tier covers storage and DB for this scale
4. **Audience-specific UX** -- designed for this exact demographic, not generic
5. **Re-skinnable** -- swap photos and theme for each new event without platform fees

---

## Content Requirements

| Content | Format | Source | When Needed |
|---------|--------|--------|-------------|
| Event photos (200-1500) | JPEG, various aspect ratios | Shrike photography | Before gallery launch |
| Thumbnails (auto-generated) | JPEG, ~400px wide | Generated from originals via script or Supabase transforms | During upload pipeline |
| Blur placeholders | BlurHash strings or tiny base64 | Generated during upload | During upload pipeline |
| Event title | Text string | Client/event details | Configuration |
| Event date | Date string | Client/event details | Configuration |
| Event banner (optional) | JPEG/PNG, landscape | Shrike photography or stock | Configuration |

---

## Sources

**Event Photo Gallery Platforms:**
- [Pixieset Blog - Best Photo Gallery 2026](https://blog.pixieset.com/blog/best-photo-gallery/)
- [TurtlePic - Best Client Gallery Platforms 2026](https://turtlepic.com/blog/best-client-gallery-platforms-for-photographers/)
- [Fast.io - Photography Client Galleries 2026](https://www.fast.io/resources/photography-client-gallery/)
- [Pic-Time vs Pixieset Review 2026](https://greenhousecreativestudios.com/pic-time-review/)
- [Pixieset vs Pic-Time Feature Comparison](https://picflow.com/compare/pixieset-vs-pic-time)
- [GuestCam - Event Photo Sharing](https://guestcam.co/)
- [Kululu - Event Photo Sharing](https://www.kululu.com/)
- [GUESTPIX - Event Photo Sharing](https://guestpix.com/)

**Mobile UX for Older Adults:**
- [Eleken - UX Design for Seniors](https://www.eleken.co/blog-posts/examples-of-ux-design-for-seniors)
- [Toptal - Interface Design for Older Adults](https://www.toptal.com/designers/ui/ui-design-for-older-adults)
- [NN/g - Senior Citizens on the Web](https://www.nngroup.com/reports/senior-citizens-on-the-web/)
- [PMC - Design Guidelines for Mobile Apps for Older Adults](https://pmc.ncbi.nlm.nih.gov/articles/PMC10557006/)
- [UX Collective - Designing for Older Audiences](https://uxdesign.cc/designing-for-older-audiences-checklist-best-practices-b6ca3ec5bcbf)

**Masonry Layout & Photo Gallery UX:**
- [MDN - CSS Masonry Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Masonry_layout)
- [Chrome Developers - CSS Masonry Update](https://developer.chrome.com/blog/masonry-update)
- [CSS-Tricks - Making Masonry Layout That Works Today](https://css-tricks.com/making-a-masonry-layout-that-works-today/)
- [PhotoSwipe - Responsive Image Gallery](https://photoswipe.com/)
- [lightGallery - JavaScript Gallery](https://www.lightgalleryjs.com/)

**Image Download on Mobile:**
- [WebKit Bug 167341 - iOS download attribute](https://bugs.webkit.org/show_bug.cgi?id=167341)
- [Supabase Storage - Serving Downloads](https://supabase.com/docs/guides/storage/serving/downloads)
- [Supabase Storage - CDN Fundamentals](https://supabase.com/docs/guides/storage/cdn/fundamentals)
- [Supabase Storage - Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)

**Anonymous Interaction Patterns:**
- [FingerprintJS - Storing Anonymous Preferences](https://fingerprint.com/blog/storing-anonymous-browser-preferences/)
- [Picdrop - Photo Sharing Without Login](https://www.picdrop.com/web/how-it-works/photo-sharing-for-photographers)

**Performance & Loading:**
- [Cloudinary - LQIP Explained](https://cloudinary.com/blog/low_quality_image_placeholders_lqip_explained)
- [ImageKit - Lazy Loading Complete Guide](https://imagekit.io/blog/lazy-loading-images-complete-guide/)
- [imgix - LQIP for Fast Loading](https://www.imgix.com/blog/lqip-your-images)

**Winery Marketing Context:**
- [Crafted ERP - Instagram Marketing for Wineries](https://craftederp.com/the-buzz/instagram-marketing-for-wineries)
- [Walls.io - Social Wall for Events](https://walls.io/)

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| Table stakes features | HIGH | Cross-referenced across 8+ gallery platforms, consistent patterns |
| Anti-features | HIGH | Based on audience analysis and competitive review, strongly opinionated |
| Mobile UX patterns | HIGH | NN/g and PMC research papers, well-established guidelines |
| iOS download behavior | HIGH | Verified via WebKit bug tracker and Apple Developer Forums |
| Masonry layout approach | MEDIUM-HIGH | CSS columns proven, native grid-lanes not production-ready until mid-2026 |
| Anonymous likes implementation | MEDIUM | localStorage approach is standard, but device fingerprinting edge cases exist (private browsing, clearing data) |
| Comment spam prevention | MEDIUM | Rate limiting and char limits are standard, but effectiveness depends on actual abuse patterns |
| Supabase at this scale | MEDIUM | Free tier should handle 200-1500 photos, but CDN egress costs with 100+ concurrent users untested |

**Known gaps:**
- Supabase Storage egress costs at scale (need to check free tier limits for photo-heavy galleries)
- Exact BlurHash generation approach (during upload script vs build-time)
- PhotoSwipe vs custom lightbox tradeoff (need to evaluate bundle size impact)
- Whether CSS columns or a JS masonry library performs better with 1500+ items and lazy loading
