# Technology Stack

**Project:** Shrike Media Portfolio
**Domain:** High-end creative portfolio with cinematic design
**Researched:** 2026-01-30

## Executive Summary

For a premium creative portfolio in 2026, the standard stack is **Next.js 16 + React 19 + TypeScript + Tailwind CSS** for the foundation, with **GSAP + Lenis** for scroll-driven animations and **Mux or Cloudinary** for video optimization. This stack prioritizes performance despite rich media, offers best-in-class animation capabilities, and delivers the cinematic feel expected of award-winning creative portfolios.

**Overall confidence: HIGH** - This stack is proven across Awwwards-winning portfolios, has authoritative documentation, and represents current 2026 best practices.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js** | 16.1.x | Full-stack React framework | Industry standard for 2026 (68% of JS devs use it). Turbopack stable, excellent performance, built-in image optimization, App Router for clean code structure. Perfect for portfolio with both marketing pages and booking integration. |
| **React** | 19.x | UI library | Required by Next.js 16. React 19 pairs with Next.js 16, stable and production-ready. |
| **TypeScript** | 5.x | Type safety | Next.js 16 is TypeScript-first. Type safety prevents bugs in animation logic and prevents runtime errors. Recommended to stay on TS 5.x until TS 7.0 mid-2026 (breaking changes coming). |
| **Node.js** | 22.x or 23.x | Runtime | Node.js 22.18+ has native TypeScript support. Node 24.3.0 removed TypeScript warnings. Use LTS (22.x) for stability. |

**Confidence: HIGH** - All versions verified from official sources as of January 2026.

**Rationale:** Next.js 16 dominates high-end portfolios because it solves the performance-vs-richness paradox. You get server-side rendering for fast initial load, then client-side interactivity for smooth animations. Vercel deployment is trivial, which matters when the site itself is a demonstration of technical skill.

### Styling & Design System

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Tailwind CSS** | 4.x | Utility-first CSS | Standard for 2026 portfolios. Fast development, consistent design tokens, dark mode built-in via `class` strategy. Tiny bundle size with JIT compilation. |
| **next-themes** | 0.x (latest) | Dark mode management | Solves SSR flash problem, persists user preference, detects system preference. Zero-flicker dark mode is table stakes for premium portfolios. |

**Confidence: HIGH** - Tailwind dominates creative portfolios. next-themes is the standard dark mode solution.

**Why NOT alternatives:**
- **Bootstrap**: Too corporate, not flexible enough for custom cinematic design
- **Chakra UI**: Component library adds unnecessary abstraction for a custom portfolio
- **CSS-in-JS (Emotion/styled-components)**: Slower than Tailwind, harder to theme, not worth complexity for hardcoded content

**Dark mode implementation:**
```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class", // Class-based for full control
  // ...
}
```
Use `next-themes` provider to wrap app, add `dark:` prefix to all color utilities.

### Animation & Scroll

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **GSAP** | 3.14.x | Timeline-based animations | Industry standard for high-end creative work. Powers Awwwards-winning sites. ScrollTrigger plugin is unmatched for scroll-driven effects. Now 100% free (including premium plugins like SplitText, MorphSVG). 23KB gzipped. |
| **Lenis** | 1.3.x | Smooth scroll | Lightweight (minimal overhead), designed by darkroom.engineering specifically for pairing with GSAP. Provides cinematic smooth scroll that elevates the experience. |
| **Framer Motion** | 7.x (optional) | React-native animations | Use ONLY for simple UI transitions (menu open/close, fade-ins). GSAP handles hero animations and scroll effects. Don't mix paradigms unnecessarily. |

**Confidence: HIGH** - GSAP + Lenis is the proven combination for 2026 creative portfolios.

**Integration pattern:**
```javascript
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
```

**Why this combination:**
- **GSAP**: Full control over complex timelines, SVG morphs, parallax, scroll-driven sequences. Powers hero sections and category transitions.
- **Lenis**: Smooth scroll foundation that makes everything feel premium. Syncs perfectly with GSAP's ScrollTrigger.
- **Framer Motion** (sparingly): React-declarative for simple component transitions. Use where GSAP would be overkill (e.g., modal fade-in).

**Why NOT alternatives:**
- **Vanilla CSS animations**: Not powerful enough for cinematic scroll-driven effects
- **AOS/ScrollReveal**: Too basic, limited customization
- **Locomotive Scroll**: Lenis is lighter and more actively maintained
- **Only Framer Motion**: Doesn't have timeline control or ScrollTrigger equivalent

### 3D Graphics (Optional - Use Sparingly)

| Technology | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| **React Three Fiber** | 9.5.x | React renderer for Three.js | ONLY if you need 3D elements (e.g., rotating logo, 3D text effect). R3F integrates with React better than vanilla Three.js. Use declarative JSX for 3D scenes. |
| **Three.js** | r169+ | WebGL library | Required by R3F. Don't use vanilla Three.js unless you need extreme performance tuning. |
| **@react-three/drei** | Latest | Helper components | Pre-built camera controls, loaders, effects. Saves time if using R3F. |

**Confidence: MEDIUM** - 3D can elevate portfolio, but can also destroy performance and feel gimmicky. Use judiciously.

**Recommendation:** Skip 3D for MVP unless it directly demonstrates your software capabilities. A well-executed GSAP hero with video is more impressive than amateur WebGL. If you do 3D, keep it subtle (e.g., floating particles, depth-of-field on portfolio items).

**Performance warning:** Three.js portfolios achieving 120+ FPS require serious optimization (LOD, instancing, WebGPU). Don't add 3D unless you can execute it flawlessly - a janky 3D experience destroys credibility.

### Video Optimization & Hosting

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Mux** | API | Video hosting & optimization | API-first video platform. Automatic adaptive bitrate streaming, comprehensive analytics, excellent Next.js integration. Simpler than Cloudinary for video-only use cases. GDPR compliant (8.0 rating). Ease of use: 8.9/10. |
| **next-video** | 1.x | Video component | Drop-in `<Video>` component for Next.js. Works with Mux, Vercel Blob, S3. Handles optimization automatically. |

**Confidence: HIGH** - Mux is the standard for developer-friendly video in 2026.

**Why Mux over alternatives:**
- **Cloudinary**: Better if you need image + video transformations. Mux is simpler and cheaper for video-only.
- **Self-hosted on Vercel**: Will consume massive bandwidth. Vercel's NEXTJS_NO_SELF_HOSTED_VIDEOS conformance rule warns against this.
- **YouTube/Vimeo embed**: Not premium enough for a creative portfolio. Loses control over player design.

**Video best practices:**
- MP4 with H.264 codec (universal compatibility)
- 720p for web (65% of video is mobile)
- Adaptive bitrate streaming (Mux handles automatically)
- Lazy load videos below fold
- Preload="metadata" for hero video

**File size targets:**
- Hero video: <10MB (3-5 seconds loop)
- Portfolio videos: <50MB each
- Use Mux's optimization to automatically generate WebM fallback

### Image Optimization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **next/image** | Built-in | Image optimization | Next.js built-in Image component. Automatic WebP/AVIF conversion, lazy loading, blur placeholder. Prevents layout shift. |
| **sharp** | Latest | Image processing | Required for production Next.js image optimization. Reduces file size 40-70%. Install with `npm install sharp`. |

**Confidence: HIGH** - Standard Next.js image optimization.

**Usage:**
```javascript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Photography work"
  width={1920}
  height={1080}
  priority // For above-fold images
  placeholder="blur"
/>
```

**Why this matters:** 53% of mobile users abandon sites when images take >3 seconds to load. Portfolio sites have heavy images - optimization is non-negotiable.

### Integrations

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **react-calendly** | 4.x | Calendly booking | Official React component for Calendly embeds. Use `InlineWidget` for embedded calendar or `PopupWidget` for modal. Handles SSR correctly with dynamic import. |

**Confidence: HIGH** - Standard Calendly integration for React.

**Implementation:**
```javascript
import { InlineWidget } from "react-calendly";

<InlineWidget url="https://calendly.com/your-link" />
```

**SSR note:** Calendly requires browser DOM. Use Next.js dynamic import with `ssr: false`:
```javascript
const CalendlyWidget = dynamic(() => import('./CalendlyWidget'), {
  ssr: false
});
```

### Infrastructure

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vercel** | N/A | Hosting & deployment | Next.js creator. Zero-config deployment, global CDN, automatic HTTPS, preview deployments for every git push. Perfect for showcasing technical execution. Free tier sufficient for portfolio. |
| **Vercel Analytics** | Built-in | Web vitals tracking | Track Core Web Vitals (LCP, FID, CLS). Prove your portfolio is fast. Free on hobby plan. |

**Confidence: HIGH** - Vercel is the standard for Next.js hosting in 2026.

**Why NOT alternatives:**
- **Netlify**: Good, but Vercel has tighter Next.js integration (same company)
- **AWS/Azure**: Overkill for a portfolio, harder to configure
- **Shared hosting**: Can't handle Next.js SSR

### Development Tools

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **ESLint** | Latest | Linting | Next.js includes eslint-config-next. Catches errors before runtime. |
| **Prettier** | Latest | Code formatting | Consistent formatting. Integrates with Tailwind (prettier-plugin-tailwindcss sorts classes). |
| **Git** | Latest | Version control | Vercel deploys from Git. Commit often, use feature branches for experiments. |

**Confidence: HIGH** - Standard tooling.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **Framework** | Next.js 16 | Astro | Great for content sites, but overkill for a portfolio with limited pages. Next.js animation integration is better. |
| **Framework** | Next.js 16 | Remix | Good, but smaller ecosystem. Next.js has more examples of creative portfolios. |
| **Framework** | Next.js 16 | Vanilla React (Vite) | Loses SSR, image optimization, routing. Too much manual work. |
| **Animations** | GSAP | Only Framer Motion | Framer Motion can't match GSAP's timeline control or ScrollTrigger power. Fine for simple sites, inadequate for "technically impressive". |
| **Smooth Scroll** | Lenis | Locomotive Scroll | Lenis is lighter, more actively maintained, better GSAP integration. |
| **Video** | Mux | Cloudinary | Cloudinary wins if you need heavy image transformations. Mux is simpler and cheaper for video-centric portfolio. |
| **Video** | Mux | Self-hosted | Bandwidth costs will explode. Vercel literally has a conformance rule against this. |
| **Styling** | Tailwind | CSS Modules | CSS Modules are fine, but Tailwind's dark mode and responsive utilities are superior for this use case. |
| **3D** | React Three Fiber | Vanilla Three.js | R3F integrates with React better. Only use vanilla Three.js if you need extreme performance control. |
| **Hosting** | Vercel | Netlify | Netlify is good, but Vercel built Next.js - tighter integration, better DX. |

---

## Installation

### 1. Initialize Project

```bash
# Create Next.js project with TypeScript and Tailwind
npx create-next-app@latest shrike-portfolio --typescript --tailwind --app --no-src-dir --import-alias "@/*"

cd shrike-portfolio
```

This creates a Next.js 16 project with:
- TypeScript enabled
- Tailwind CSS configured
- App Router (not Pages Router)
- No `src/` directory (cleaner structure)
- Import alias `@/` for absolute imports

### 2. Install Core Dependencies

```bash
# Animation & Scroll
npm install gsap lenis

# Dark mode
npm install next-themes

# Calendly integration
npm install react-calendly

# Image optimization (production requirement)
npm install sharp
```

### 3. Install Video (Choose One)

**Option A: Mux (Recommended)**
```bash
npm install next-video
npm install @mux/mux-node @mux/mux-player-react
```

**Option B: Cloudinary (If you need image + video)**
```bash
npm install next-cloudinary
```

### 4. Install 3D (Optional - Skip for MVP)

```bash
npm install three @react-three/fiber @react-three/drei
npm install --save-dev @types/three
```

### 5. Install Dev Dependencies

```bash
npm install --save-dev prettier prettier-plugin-tailwindcss
```

### 6. Configuration Files

**tailwind.config.js:**
```javascript
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define your dark cinematic palette here
      },
    },
  },
  plugins: [],
}
```

**.prettierrc:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## Performance Targets

A technically impressive portfolio must be fast despite rich media.

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| **Lighthouse Score** | 90+ | SSR, image optimization, code splitting, minimal JS |
| **First Contentful Paint** | <1.5s | Optimize hero image, inline critical CSS |
| **Largest Contentful Paint** | <2.5s | Lazy load below-fold content, optimize video |
| **Cumulative Layout Shift** | <0.1 | Use `next/image` with width/height, reserve space for videos |
| **Time to Interactive** | <3.5s | Code split GSAP animations, defer non-critical JS |
| **Total Bundle Size** | <300KB (JS) | Tree-shake GSAP, lazy load Calendly, avoid unnecessary deps |

**Measurement:** Use Vercel Analytics and Chrome DevTools to verify. A slow creative portfolio undermines credibility.

---

## Architecture Recommendations

### File Structure

```
shrike-portfolio/
├── app/
│   ├── layout.tsx           # Root layout, ThemeProvider
│   ├── page.tsx             # Homepage (hero + portfolio grid)
│   ├── about/page.tsx       # About page
│   ├── contact/page.tsx     # Contact with Calendly
│   └── globals.css          # Tailwind imports
├── components/
│   ├── Hero.tsx             # Full-screen video hero
│   ├── PortfolioGrid.tsx    # Category-based portfolio
│   ├── VideoPlayer.tsx      # Mux video component
│   ├── ThemeToggle.tsx      # Dark mode toggle
│   └── CalendlyEmbed.tsx    # Calendly integration
├── lib/
│   ├── animations.ts        # GSAP timeline presets
│   └── smooth-scroll.ts     # Lenis initialization
├── public/
│   ├── videos/              # Self-hosted video (if any)
│   └── images/              # Optimized images
└── types/
    └── portfolio.ts         # TypeScript types
```

### Component Boundaries

- **Hero.tsx**: Owns hero video, GSAP timeline for entrance animation
- **PortfolioGrid.tsx**: Owns portfolio items, GSAP ScrollTrigger for scroll animations
- **VideoPlayer.tsx**: Wraps Mux player, handles loading states
- **ThemeToggle.tsx**: Uses next-themes hook, animates with Framer Motion
- **CalendlyEmbed.tsx**: Dynamic import with ssr: false

### Data Flow

Hardcoded content (no CMS):
- Portfolio items: `const portfolioItems: PortfolioItem[]` in `lib/data.ts`
- No database, no API calls
- All content committed to Git

For future CMS integration, replace `lib/data.ts` with API calls to Contentful/Sanity.

---

## Pitfalls to Avoid

### 1. Video Performance
**Problem:** Self-hosting large videos on Vercel causes bandwidth overages and slow load times.
**Solution:** Use Mux or Cloudinary. Compress videos to <10MB for hero, <50MB for portfolio items.

### 2. Animation Overload
**Problem:** Too many GSAP animations cause jank, especially on mobile.
**Solution:** Use `matchMedia` to reduce motion on mobile. Respect `prefers-reduced-motion`. Test on low-end devices.

### 3. Dark Mode Flash
**Problem:** Page loads light, then flashes dark (or vice versa).
**Solution:** Use `next-themes` with class strategy. Add script to `<head>` to set class before paint.

### 4. 3D Performance
**Problem:** Three.js scenes tank mobile performance.
**Solution:** Skip 3D for MVP. If you add it, use `useEffect` to check device capability before initializing. Provide fallback.

### 5. Over-Engineering
**Problem:** Adding CMS, authentication, comments, etc. when content is hardcoded.
**Solution:** YAGNI. Build the MVP with hardcoded content. Add complexity only when needed.

### 6. Sharp Missing in Production
**Problem:** Deploying to Vercel without `sharp` causes slow image optimization.
**Solution:** `npm install sharp` before deploying. Vercel will build it correctly.

### 7. TypeScript 7.0 Breaking Changes
**Problem:** TypeScript 7.0 (mid-2026) has breaking changes.
**Solution:** Stay on TS 5.x for now. When 7.0 lands, migrate carefully (strict-by-default, no ES5 target).

---

## Sources

### Framework & Core Technologies
- [Next.js 16 Release](https://nextjs.org/blog/next-16)
- [Next.js 16.1 Release](https://nextjs.org/blog/next-16-1)
- [Next.js npm Package](https://www.npmjs.com/package/next)
- [React Three Fiber vs Three.js 2026 Comparison](https://graffersid.com/react-three-fiber-vs-three-js/)
- [Next.js & Tailwind 2025 Guide](https://codeparrot.ai/blogs/nextjs-and-tailwind-css-2025-guide-setup-tips-and-best-practices)

### Animation & Scroll
- [GSAP npm Package](https://www.npmjs.com/package/gsap)
- [Lenis GitHub Repository](https://github.com/darkroomengineering/lenis)
- [Lenis npm Package](https://www.npmjs.com/package/lenis)
- [GSAP vs Framer Motion Comparison](https://pentaclay.com/blog/framer-vs-gsap-which-animation-library-should-you-choose)
- [Building Scroll-Driven Animations with GSAP](https://tympanus.net/codrops/2026/01/15/building-a-scroll-driven-dual-wave-text-animation-with-gsap/)

### Video Optimization
- [How to Optimize Video for Web: Complete 2025 Guide](https://natclark.com/how-to-optimize-video-for-web-complete-2025-guide/)
- [Vercel Video Best Practices](https://vercel.com/guides/best-practices-for-hosting-videos-on-vercel-nextjs-mp4-gif)
- [Next.js Video Guide](https://nextjs.org/docs/app/guides/videos)
- [Cloudinary vs Mux Comparison](https://slashdot.org/software/comparison/Cloudinary-vs-Mux/)
- [next-video Documentation](https://next-video.dev/docs)

### Creative Portfolio Examples
- [Best Three.js Portfolio Examples 2025](https://www.creativedevjobs.com/blog/best-threejs-portfolio-examples-2025)
- [Awwwards Best Web Agencies](https://www.awwwards.com/websites/design-agencies/)
- [14islands Agency Interview](https://tympanus.net/codrops/2025/11/24/building-a-different-kind-of-agency-inside-14islands-people-first-creative-vision/)
- [WebGL Portfolio Creative Process](https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/)

### Image & Performance
- [Sharp Installation for Next.js](https://nextjs.org/docs/messages/install-sharp)
- [Next.js Image Optimization Guide](https://strapi.io/blog/nextjs-image-optimization-developers-guide)
- [Web Performance News 2025](https://rankinggenerals.com/web-performance-news/)

### Dark Mode
- [Tailwind CSS Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode)
- [Implementing Dark Mode in Next.js with Tailwind](https://dev.to/chinmaymhatre/implementing-dark-mode-in-nextjs-with-tailwind-css-and-next-themes-a4e)

### Integrations
- [Integrate Calendly with Next.js Guide](https://medium.com/@dileep18052001/integrate-calendly-with-next-js-step-by-step-guide-dbb0b2fc30c9)
- [react-calendly npm Package](https://www.npmjs.com/package/react-calendly)
- [Calendly React Embed Help](https://help.calendly.com/hc/en-us/articles/31644195810199-How-to-embed-Calendly-in-a-React-app)

### TypeScript
- [TypeScript 6.0 2026 Features](https://medium.com/@mernstackdevbykevin/typescript-6-0-in-2026-the-evolution-of-full-stack-javascript-is-here-bd662846a5a2)
- [State of TypeScript 2026](https://devnewsletter.com/p/state-of-typescript-2026)
- [Next.js TypeScript Configuration](https://nextjs.org/docs/app/api-reference/config/typescript)

---

## Research Methodology

**Sources prioritized:**
1. Official documentation (Next.js, GSAP, Tailwind)
2. npm package pages (for current versions)
3. GitHub releases (for version confirmation)
4. Awwwards/Codrops (for creative portfolio patterns)
5. Web search (for ecosystem trends, verified against official sources)

**Confidence levels:**
- **HIGH**: Verified with official documentation or npm registry as of January 2026
- **MEDIUM**: Based on web search verified with multiple credible sources
- **LOW**: Based on single source or unverified web search

**Gaps identified:**
- 3D implementation (MEDIUM confidence - powerful but can backfire if poorly executed)
- Video codec specifics beyond H.264/WebM (LOW confidence on AV1 browser support)
- Exact performance benchmarks for GSAP vs Framer Motion (qualitative consensus, not quantitative)

**Date context:** All recommendations current as of 2026-01-30. Next.js 16.1.2, GSAP 3.14.2, React 19, Lenis 1.3.17 are latest stable versions.
