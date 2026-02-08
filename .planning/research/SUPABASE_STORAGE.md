# Supabase Storage + Next.js Integration for Event Photo Gallery

**Domain:** Photo gallery (200-1500 photos per event) with anonymous social features (likes, comments)
**Researched:** 2026-02-08
**Stack:** Next.js 16.1.6, React 19, Supabase (Storage + Postgres), Tailwind CSS 4
**Overall confidence:** HIGH (mature, well-documented integration path)

---

## 1. Supabase Storage Setup for Photos

### Bucket Configuration

**Recommendation: Public bucket for event photos.**

A public bucket is the correct choice here. In a public bucket, anyone with the asset URL can access (download/view) files -- no authentication or signed URLs needed. This is exactly the behavior you want for a public photo gallery.

Critical distinction: "public" only affects *read/download* access. Upload, delete, move, and copy operations **still require authentication and RLS policies** even on public buckets. This means visitors can view photos but cannot upload or delete anything.

```sql
-- Create the bucket via SQL (or use Supabase Dashboard)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-photos',
  'event-photos',
  true,                              -- public bucket
  10485760,                          -- 10MB per file limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);
```

Alternatively, create via the Supabase Dashboard under Storage > New Bucket.

**Why not a private bucket?** Private buckets require signed URLs or JWT authentication for every image request. For a photo gallery serving hundreds of images to anonymous visitors, this would:
- Kill CDN cache hit rates (signed URLs are per-user, so the CDN treats each request as unique)
- Add latency for URL generation on every page load
- Require server-side signed URL generation for every image
- Add unnecessary complexity with zero security benefit (these are meant to be public photos)

### RLS Policies for Storage

Even with a public bucket, you need RLS policies for non-read operations (uploads/deletes by the site owner):

```sql
-- Allow anyone to view/download files (public bucket handles this, but explicit policy is good practice)
CREATE POLICY "Public read access for event photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-photos');

-- Only authenticated users (site owner) can upload
CREATE POLICY "Owner can upload event photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-photos');

-- Only authenticated users (site owner) can delete
CREATE POLICY "Owner can delete event photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-photos');
```

For tighter security, you could restrict uploads to a specific user ID:

```sql
CREATE POLICY "Only specific owner can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-photos'
  AND (SELECT auth.uid()) = 'your-owner-uuid-here'
);
```

### Folder Structure Convention

Organize by event using a flat prefix structure:

```
event-photos/
  {event-slug}/
    photo-001.jpg
    photo-002.jpg
    ...
    photo-1500.jpg
```

Example: `event-photos/johnson-wedding-2026/IMG_0001.jpg`

This structure works well because:
- `storage.from('event-photos').list('{event-slug}/')` retrieves all photos for an event
- The `storage.foldername()` helper can be used in RLS policies to restrict access per event if needed later
- Simple, flat structure avoids nested folder performance issues in `storage.list()`

**Naming convention:** Use the original filenames or sequential numbering. Avoid deeply nested subfolders -- Supabase's `list()` method slows down when computing folder hierarchies. A single folder per event with flat files is optimal.

### Image Transformations (Pro Plan Required)

Supabase Storage has **built-in image transformations** on the Pro plan ($25/month). This is significant -- it means you do NOT need a separate image CDN like Cloudinary or Imgix.

**Supported parameters:**
- `width`: 1-2500px
- `height`: 1-2500px
- `quality`: 20-100 (default 80)
- `resize`: `cover` (default, crop to fill), `contain` (fit within), `fill` (stretch)
- `format`: auto-detected (serves WebP to compatible browsers; AVIF support coming)

**Limits:**
- Maximum source image size: 25MB
- Maximum source resolution: 50 megapixels
- Dimensions capped at 2500px per side

**Usage via SDK:**

```typescript
// Thumbnail (300px wide, auto height, 60% quality)
const { data } = supabase.storage
  .from('event-photos')
  .getPublicUrl('johnson-wedding-2026/IMG_0001.jpg', {
    transform: { width: 300, quality: 60 }
  });

// Medium size for gallery view
const { data } = supabase.storage
  .from('event-photos')
  .getPublicUrl('johnson-wedding-2026/IMG_0001.jpg', {
    transform: { width: 800, quality: 75 }
  });

// Full resolution for lightbox
const { data } = supabase.storage
  .from('event-photos')
  .getPublicUrl('johnson-wedding-2026/IMG_0001.jpg');
// No transform = original file
```

**URL structure for transformed images:**
```
https://{project-ref}.supabase.co/storage/v1/render/image/public/event-photos/{event-slug}/photo.jpg?width=300&quality=60
```

vs. original (no transform):
```
https://{project-ref}.supabase.co/storage/v1/object/public/event-photos/{event-slug}/photo.jpg
```

**Pricing note:** Image transforms are charged at $5 per 1,000 unique origin images transformed. The Pro plan includes 100 origin images. For a 1500-photo event, that is approximately $7.50 in transform charges (assuming each original is transformed once; cached variants are free). This is very affordable compared to dedicated image CDN services.

**Format auto-detection:** Supabase automatically serves WebP to browsers that support it. No code changes needed. AVIF is noted as "coming in the near future." Since your `next.config.ts` already specifies `formats: ["image/avif", "image/webp"]`, you get double optimization: Supabase transforms + Next.js Image optimization.

### CDN and Caching Behavior

**Smart CDN (Pro plan, auto-enabled):**
- Assets cached at edge locations globally
- Cache invalidated within 60 seconds when files are updated/deleted
- Transformed images are also cache-invalidated when originals change
- Significantly better cache hit rates than standard CDN

**Cache-control configuration:** Set at upload time per file:

```typescript
await supabase.storage
  .from('event-photos')
  .upload(`${eventSlug}/${filename}`, file, {
    cacheControl: '31536000',  // 1 year -- photos don't change
    upsert: false
  });
```

For event photos that never change after upload, `cacheControl: '31536000'` (1 year) is appropriate. Browser caches the image locally, CDN caches at edge. A photo is downloaded once per visitor per device, then served from cache.

**Public bucket advantage:** Public buckets have better CDN cache hit rates than private buckets because there is no per-user authorization check. Two different visitors accessing the same photo hit the same CDN cache entry.

### Upload Limits and Considerations

**File size limits by method:**
- Standard upload: up to 5GB (but 6MB+ recommended to use multipart)
- Resumable upload: up to 50GB
- S3 multipart upload: up to 500GB

For event photos (typically 5-15MB each), standard upload is fine.

**Bulk upload for 200-1500 photos:**
Since the site owner uploads via Supabase Dashboard or CLI (no admin UI needed), the practical approaches are:

1. **Supabase Dashboard:** Drag-and-drop multiple files. Works for smaller batches but can be tedious for 1500 files.

2. **Supabase CLI:** Bulk upload via script:
   ```bash
   # Using the Supabase JS client in a Node script
   for file in ./event-photos/*; do
     npx supabase storage cp "$file" "ss:///event-photos/event-slug/$(basename $file)"
   done
   ```

3. **S3-compatible tools:** Supabase Storage is S3-compatible. Use `aws s3 sync` or `rclone`:
   ```bash
   aws s3 sync ./local-photos s3://event-photos/event-slug/ \
     --endpoint-url https://{project-ref}.supabase.co/storage/v1/s3
   ```

4. **Custom upload script (recommended for best control):**
   ```typescript
   // upload-event-photos.ts (run locally)
   import { createClient } from '@supabase/supabase-js';
   import fs from 'fs';
   import path from 'path';

   const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

   async function uploadEventPhotos(eventSlug: string, photosDir: string) {
     const files = fs.readdirSync(photosDir);
     for (const file of files) {
       const filePath = path.join(photosDir, file);
       const fileBuffer = fs.readFileSync(filePath);
       const { error } = await supabase.storage
         .from('event-photos')
         .upload(`${eventSlug}/${file}`, fileBuffer, {
           cacheControl: '31536000',
           contentType: 'image/jpeg',
         });
       if (error) console.error(`Failed: ${file}`, error);
       else console.log(`Uploaded: ${file}`);
     }
   }
   ```

**Storage costs (Pro plan):**
- 100GB included
- Overage: $0.021/GB/month
- 1500 photos at ~10MB each = ~15GB = well within the 100GB quota

---

## 2. Next.js Integration Patterns

### next.config.ts Configuration

Your current `next.config.ts` needs `remotePatterns` to allow `next/image` to optimize Supabase Storage URLs:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/**',
      },
    ],
  },
};

export default nextConfig;
```

**Important trade-off:** You can use EITHER Supabase image transforms OR Next.js Image optimization -- using both is wasteful (double processing). The recommended approach:

- **Option A (Simpler):** Use Supabase transforms for sizing, skip `next/image`. Serve `<img>` tags with Supabase-transformed URLs. The CDN + cache-control handles performance.
- **Option B (More control):** Use `next/image` with raw Supabase URLs (no transforms). Let Next.js optimize on the fly. Requires Vercel hosting for best performance.
- **Option C (Hybrid, recommended):** Use Supabase transforms for thumbnails in the grid (many images, size matters most), and `next/image` for the lightbox/full view (fewer images, quality matters most).

### Supabase Client Setup

**Required packages:**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Environment variables (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

The anon key is safe to expose client-side -- it only grants permissions defined by your RLS policies.

**Browser client (for Client Components):**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Server client (for Server Components, Route Handlers, Server Actions):**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component -- can't set cookies
          }
        },
      },
    }
  );
}
```

**Note on auth:** Since your gallery is fully anonymous (no user accounts), you technically don't need the full `@supabase/ssr` cookie machinery for auth. You could use the simpler `@supabase/supabase-js` directly with just the anon key. The `@supabase/ssr` setup is still recommended because:
- It is the canonical pattern, well-maintained
- If you ever add anonymous sign-ins for like tracking, the plumbing is already there
- Server/client separation is clean

### Fetching Images: Server Component vs Client Component

**Initial page load -- Server Component (recommended):**
```typescript
// app/(gallery)/gallery/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server';

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event } = await searchParams;
  if (!event) return <EventSelector />;

  const supabase = await createClient();

  // Fetch first batch of photo metadata from DB (not storage.list)
  const { data: photos } = await supabase
    .from('photos')
    .select('id, storage_path, width, height, blurhash, created_at')
    .eq('event_id', event)
    .order('created_at', { ascending: true })
    .range(0, 49); // First 50 photos

  return <GalleryGrid initialPhotos={photos} eventId={event} />;
}
```

**Why fetch from DB, not `storage.list()`?** The `storage.list()` method is designed for file browsing, not performant listing of large directories. It computes folder hierarchies and slows down with many objects. Instead, store photo metadata in a `photos` table and query that. The DB query is indexed, paginated, and can include extra data (blurhash, dimensions, like counts) that `storage.list()` cannot.

**Subsequent batches -- Client Component with infinite scroll:**
```typescript
// components/GalleryGrid.tsx (Client Component)
'use client';

import { useCallback, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const PAGE_SIZE = 50;

export function GalleryGrid({
  initialPhotos,
  eventId,
}: {
  initialPhotos: Photo[];
  eventId: string;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(initialPhotos.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastPhotoRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore]
  );

  async function loadMore() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('photos')
      .select('id, storage_path, width, height, blurhash, created_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (data) {
      setPhotos((prev) => [...prev, ...data]);
      setOffset((prev) => prev + PAGE_SIZE);
      if (data.length < PAGE_SIZE) setHasMore(false);
    }
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {photos.map((photo, i) => (
        <div
          key={photo.id}
          ref={i === photos.length - 1 ? lastPhotoRef : undefined}
        >
          <GalleryImage photo={photo} />
        </div>
      ))}
      {loading && <LoadingSpinner />}
    </div>
  );
}
```

### Pagination Strategy

**Offset-based pagination is correct here.** Cursor-based pagination is better for infinite-scroll feeds with real-time inserts (social media). For an event gallery with a fixed set of photos ordered by `created_at`, offset pagination is simpler and perfectly performant with a proper index.

**Page size: 50 photos.** This balances:
- Initial page weight (50 thumbnails at ~30KB each = ~1.5MB)
- Number of network requests (1500 photos / 50 = 30 pages max)
- Perceived load speed (50 images fill the viewport several times)

### ISR/SSG vs Client-Side Fetching

**Recommended: Server Component with client-side infinite scroll (hybrid approach).**

| Strategy | Pros | Cons |
|----------|------|------|
| Full SSG (`generateStaticParams`) | Fastest initial load, full SEO | Rebuild needed when photos change; 1500-photo pages are huge |
| ISR (revalidate) | Good caching, auto-updates | Gallery changes are infrequent; still heavy initial payload |
| Server Component + client infinite scroll | Fast first paint (50 photos SSR), lazy loads rest | Slightly more complex; requires client component for scroll |
| Full client-side (SPA) | Simplest data flow | No SEO, slower first paint, loading spinner |

The hybrid approach (Server Component renders first 50, client loads rest) is the sweet spot. The first 50 photos are in the initial HTML (good for SEO, fast first paint), and the rest load on demand. Since the gallery URL includes the event ID, each event page is independently cacheable.

---

## 3. Database Schema for Gallery Metadata

### Tables

```sql
-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  cover_photo_path TEXT,  -- storage path for cover image
  photo_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Photos table (metadata, not the files themselves)
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,  -- e.g., 'johnson-wedding-2026/IMG_0001.jpg'
  filename TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  blurhash TEXT,               -- pre-computed blurhash for placeholder
  sort_order INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_photos_event_id ON photos(event_id);
CREATE INDEX idx_photos_event_order ON photos(event_id, sort_order, created_at);

-- Anonymous likes (device-based)
CREATE TABLE photo_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,     -- client-generated UUID stored in localStorage
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(photo_id, device_id)  -- one like per device per photo
);

CREATE INDEX idx_likes_photo_id ON photo_likes(photo_id);
CREATE INDEX idx_likes_device_id ON photo_likes(device_id);

-- Anonymous comments
CREATE TABLE photo_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  body TEXT NOT NULL CHECK (char_length(body) <= 500),
  is_visible BOOLEAN DEFAULT true,  -- for moderation
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_photo_id ON photo_comments(photo_id);
```

### Anonymous Likes: Device ID Approach

**How it works:**
1. On first visit, generate a UUID and store in `localStorage`
2. Send this `device_id` with every like/unlike request
3. The `UNIQUE(photo_id, device_id)` constraint prevents double-likes

```typescript
// lib/device-id.ts
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('shrike-device-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('shrike-device-id', id);
  }
  return id;
}
```

**Tradeoffs and honest assessment:**

| Approach | Pros | Cons |
|----------|------|------|
| localStorage UUID | Simple, no auth needed, works immediately | Cleared when user clears browser data; different per browser/device |
| Supabase anonymous sign-in | Real user ID, persists via JWT | Still lost on sign-out/clear; adds auth complexity; rate limit concerns |
| Browser fingerprinting (FingerprintJS) | Survives localStorage clears | Privacy concerns; GDPR implications; false positives; adds dependency |
| IP-based | No client storage needed | Shared IPs (offices, mobile); VPNs; too many false collisions |

**Recommendation: localStorage UUID.** It is the simplest approach that works well enough. The "like" feature is casual engagement, not a voting system where integrity is critical. If someone clears their data and likes again, the world does not end.

**Denormalized `like_count` on photos table:** To avoid expensive `COUNT(*)` queries on every photo render, maintain a `like_count` column on the `photos` table and update it via a trigger:

```sql
-- Trigger to update like_count on photos
CREATE OR REPLACE FUNCTION update_photo_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photos SET like_count = like_count + 1 WHERE id = NEW.photo_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photos SET like_count = like_count - 1 WHERE id = OLD.photo_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_photo_like_count
AFTER INSERT OR DELETE ON photo_likes
FOR EACH ROW EXECUTE FUNCTION update_photo_like_count();
```

### Anonymous Comments

Comments use the same `device_id` pattern. The `display_name` field lets visitors optionally enter a name (defaults to "Anonymous"). The `is_visible` boolean allows the site owner to moderate via the Supabase Dashboard.

**Rate limiting comments:** Add a check constraint or RLS policy to prevent spam:

```sql
-- Simple rate limit: max 1 comment per device per photo per minute
-- (enforced at app level, or via RLS with a function)
```

### RLS Policies for Gallery Tables

```sql
-- Events: public read, no public write
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published events"
ON events FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Photos: public read, no public write
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos"
ON photos FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM events WHERE events.id = photos.event_id AND events.is_published = true
  )
);

-- Likes: public read, public insert (with device_id), public delete (own likes only)
ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view like counts"
ON photo_likes FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can insert a like"
ON photo_likes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can remove their own like"
ON photo_likes FOR DELETE
TO anon, authenticated
USING (true);  -- Client must provide correct device_id; UNIQUE constraint handles duplicates

-- Comments: public read, public insert, no public delete
ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible comments"
ON photo_comments FOR SELECT
TO anon, authenticated
USING (is_visible = true);

CREATE POLICY "Anyone can post a comment"
ON photo_comments FOR INSERT
TO anon, authenticated
WITH CHECK (char_length(body) <= 500 AND char_length(display_name) <= 50);
```

**Security note on anon INSERT policies:** These policies allow anyone with your anon key to insert likes and comments. This is intentional for a public gallery. To prevent abuse:
- Rate limit at the application layer (Server Actions or Edge Functions)
- The `UNIQUE(photo_id, device_id)` constraint prevents like flooding
- The `char_length` check prevents oversized comments
- The `is_visible` flag allows manual moderation
- Consider adding CAPTCHA for comments if spam becomes an issue

---

## 4. Performance Considerations

### Lazy Loading Strategy

**Three-tier image loading:**

1. **Immediate (above the fold):** First 8-12 photos load eagerly with blurhash placeholders
2. **Near viewport:** Next 20-30 photos use `loading="lazy"` (native browser lazy loading)
3. **Below fold:** Remaining photos load via infinite scroll (IntersectionObserver triggers data fetch)

```typescript
function GalleryImage({ photo, index }: { photo: Photo; index: number }) {
  const isEager = index < 12;
  const src = getTransformedUrl(photo.storage_path, { width: 400, quality: 65 });

  return (
    <img
      src={src}
      alt=""
      width={photo.width}
      height={photo.height}
      loading={isEager ? 'eager' : 'lazy'}
      decoding="async"
      style={{
        backgroundImage: photo.blurhash ? `url(${blurhashToDataUrl(photo.blurhash)})` : undefined,
        backgroundSize: 'cover',
      }}
    />
  );
}
```

### Blur Placeholder Generation (Blurhash)

**What:** Blurhash encodes an image into a ~30-character string that decodes to a blurred placeholder. The string is small enough to inline in HTML.

**When to generate:** At upload time (not at render time). When the owner uploads photos, a script generates blurhash for each image and stores it in the `photos.blurhash` column.

**Generation script (run during upload):**
```typescript
import { encode } from 'blurhash';
import sharp from 'sharp';

async function generateBlurhash(imageBuffer: Buffer): Promise<string> {
  const { data, info } = await sharp(imageBuffer)
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });

  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}
```

**Client-side decoding:**
```typescript
import { decode } from 'blurhash';

function blurhashToDataUrl(hash: string, width = 32, height = 32): string {
  const pixels = decode(hash, width, height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
```

**Alternative: CSS gradient placeholders.** If you want to avoid the blurhash dependency, extract the dominant color during upload and use a solid color placeholder. Simpler but less visually appealing.

**Alternative: Supabase transform as placeholder.** Request a tiny (20px wide, quality 20) version of the image as a placeholder. This is a real blur of the actual image but requires an extra network request per photo.

### Bandwidth Optimization

**Thumbnail sizes for the grid:**

| Device | Grid Columns | Thumbnail Width | Quality |
|--------|-------------|-----------------|---------|
| Mobile (< 640px) | 2 | 300px | 60 |
| Tablet (640-1024px) | 3 | 350px | 65 |
| Desktop (> 1024px) | 4 | 400px | 70 |

Use Supabase transforms to serve the right size:

```typescript
function getPhotoUrl(path: string, width: number, quality: number): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${baseUrl}/storage/v1/render/image/public/event-photos/${path}?width=${width}&quality=${quality}`;
}
```

**Estimated bandwidth per visitor (1500-photo event, assuming they scroll through ~200 photos):**
- 200 thumbnails x ~30KB = ~6MB
- 10 full-resolution lightbox views x ~500KB = ~5MB
- Total: ~11MB per session (very reasonable)

**WebP auto-serving:** Supabase transforms automatically detect browser support and serve WebP, reducing file sizes by 25-35% over JPEG. No code changes needed.

### Mobile Performance

Key concerns with 200-1500 photos on mobile:

1. **DOM size:** Do NOT render 1500 `<img>` elements. The infinite scroll pattern (fetch 50 at a time) keeps DOM size manageable. Consider virtualization (e.g., `react-window`) only if you observe performance issues -- it adds complexity.

2. **Memory:** Lazy loading + `decoding="async"` prevents the browser from decoding all images at once. The browser's native lazy loading handles off-screen image unloading.

3. **Touch interactions:** Ensure the lightbox is touch-friendly (swipe to navigate). The native `<dialog>` element you already use handles focus trapping.

4. **Network:** Progressive loading matters more on mobile. Load thumbnails first; only fetch full resolution on lightbox open.

---

## 5. Supabase Client Setup in Next.js (Complete Guide)

### Package Installation

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Both are prefixed with `NEXT_PUBLIC_` because they are safe to expose to the browser. The anon key only grants permissions defined by RLS policies.

For the upload script (server-side only), you also need:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Never expose the service role key to the browser.** It bypasses all RLS policies.

### Client Files

**Browser client:**
```typescript
// lib/supabase/client.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Server client:**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context -- cookies are read-only
          }
        },
      },
    }
  );
}
```

### TypeScript Types

Generate types from your Supabase schema for type-safe queries:

```bash
npx supabase gen types typescript --project-id your-project-ref > lib/supabase/database.types.ts
```

Then use them:
```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Middleware Considerations

For a fully anonymous gallery (no user auth), you likely do NOT need Supabase middleware. The middleware is primarily for:
- Refreshing expired auth tokens
- Protecting authenticated routes
- Setting cookies for server-side session access

Since gallery visitors are anonymous and use the anon key directly, middleware adds overhead without benefit. If you later add anonymous sign-ins for enhanced like tracking, then add the middleware.

### Server Actions for Likes and Comments

```typescript
// app/(gallery)/gallery/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';

export async function toggleLike(photoId: string, deviceId: string) {
  const supabase = await createClient();

  // Check if already liked
  const { data: existing } = await supabase
    .from('photo_likes')
    .select('id')
    .eq('photo_id', photoId)
    .eq('device_id', deviceId)
    .single();

  if (existing) {
    // Unlike
    await supabase
      .from('photo_likes')
      .delete()
      .eq('photo_id', photoId)
      .eq('device_id', deviceId);
    return { liked: false };
  } else {
    // Like
    await supabase
      .from('photo_likes')
      .insert({ photo_id: photoId, device_id: deviceId });
    return { liked: true };
  }
}

export async function addComment(
  photoId: string,
  deviceId: string,
  body: string,
  displayName?: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('photo_comments')
    .insert({
      photo_id: photoId,
      device_id: deviceId,
      body: body.slice(0, 500),
      display_name: displayName?.slice(0, 50) || 'Anonymous',
    })
    .select()
    .single();

  if (error) throw new Error('Failed to post comment');
  return data;
}
```

---

## 6. Critical Decision Points and Counterpoints

### Should you use Supabase transforms or Next.js Image?

**The case for Supabase transforms only (skip next/image for gallery):**
- Supabase transforms are CDN-cached globally. `next/image` optimization happens on your Vercel instance.
- For 1500 photos, Vercel Image Optimization has usage limits on the free/hobby plan (1000 source images/month).
- Supabase transforms return pre-sized images; no additional processing on the Next.js server.
- Simpler code: plain `<img>` tags with transform URLs instead of `<Image>` component with all its props.

**The case for next/image:**
- Better integration with Next.js's built-in lazy loading and priority hints.
- Automatic `srcset` generation for responsive images.
- Built-in blur placeholder support (though you would need to provide `blurDataURL`).

**Verdict:** Use Supabase transforms for the thumbnail grid (raw `<img>` tags). The CDN-cached transforms at specific sizes are more efficient than running 1500 images through Vercel's optimizer. Use `next/image` only if you need responsive `srcset` for a small number of hero/featured images.

### Should you use Supabase anonymous sign-ins?

**Against (keep it simple):**
- Anonymous sign-ins add auth complexity (JWTs, refresh tokens, middleware)
- They still lose the session on browser data clear
- For likes and comments, localStorage device ID achieves the same outcome
- You do not need the `authenticated` role -- your RLS policies work with `anon`

**For:**
- If you later want to let visitors "link" their anonymous account to a real account
- Slightly more robust than localStorage (persists across tabs via JWT)
- Supabase's built-in rate limiting works per-user with anonymous auth

**Verdict:** Skip anonymous sign-ins for v1. Use the anon key + localStorage device ID. It is simpler and sufficient.

### Should you store photo metadata in DB or rely on storage.list()?

**DB wins, hands down:**
- `storage.list()` is slow with many files (computes folder hierarchy)
- DB queries are indexed and paginated
- DB can store extra metadata (blurhash, dimensions, like counts, sort order)
- DB allows complex queries (filter by event, sort by likes, etc.)
- The custom `list_objects` Postgres function from the docs is a workaround, not a solution

**Upload workflow:** When the owner uploads photos (via script or dashboard), also insert a row in the `photos` table for each file. This is a one-time cost at upload, not a per-request cost at render.

---

## 7. Pricing Summary (Pro Plan)

| Item | Included | Overage |
|------|----------|---------|
| Plan | $25/month | - |
| Storage | 100GB | $0.021/GB/month |
| Egress | 250GB | $0.09/GB |
| Image transforms | 100 origin images | $5 per 1,000 images |
| Database | 8GB | $0.125/GB/month |
| Smart CDN | Included on Pro | - |

**Estimated monthly cost for the gallery feature (one 1000-photo event, moderate traffic):**
- Storage: ~10GB (well within 100GB quota) = $0
- Transforms: ~1000 origin images = ~$4.50
- Egress: depends on traffic; 1000 visitors viewing 200 photos each at ~30KB = ~6GB = within quota
- Total additional cost: ~$5/month above base Pro plan

---

## Sources

- [Supabase Storage Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Supabase Smart CDN](https://supabase.com/docs/guides/storage/cdn/smart-cdn)
- [Supabase CDN Fundamentals](https://supabase.com/docs/guides/storage/cdn/fundamentals)
- [Supabase Storage Optimizations / Scaling](https://supabase.com/docs/guides/storage/production/scaling)
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Storage Buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Supabase Storage Helper Functions](https://supabase.com/docs/guides/storage/schema/helper-functions)
- [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase SSR Client Creation](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase Next.js Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Supabase Storage v2 Blog Post](https://supabase.com/blog/storage-image-resizing-smart-cdn)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase storage.list() API Reference](https://supabase.com/docs/reference/javascript/storage-from-list)
- [Upload File Size Restrictions](https://github.com/orgs/supabase/discussions/27431)
- [Next.js Image Configuration (remotePatterns)](https://nextjs.org/docs/app/api-reference/config/next-config-js/images)
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Infinite Scroll with Next.js, Framer Motion, and Supabase](https://supabase.com/blog/infinite-scroll-with-nextjs-framer-motion)
- [Infinite Scroll with React Query & Supabase Pagination](https://medium.com/@ctrlaltmonique/how-to-implement-infinite-scroll-with-react-query-supabase-pagination-in-next-js-6db8ed4f664c)
- [Infinite Scroll with React Intersection Observer in Next.js 14](https://medium.com/@ngene.christina/create-infinite-scroll-with-react-intersection-observer-in-nextjs-14-supabase-ssr-05f1cd1b9f9c)
- [Supabase Storage Guide for Next.js](https://supalaunch.com/blog/supabase-storage-guide-for-nextjs)
- [Improving Next.js App Performance with BlurHash](https://blog.logrocket.com/improving-nextjs-app-performance-blurhash/)
- [Next.js, Supabase & Tailwind CSS Image Gallery (Cloudinary)](https://cloudinary.com/blog/guest_post/next.js-supabase-and-tailwind-css-image-gallery)
- [Supabase Manage Storage Size Usage](https://supabase.com/docs/guides/platform/manage-your-usage/storage-size)
- [Supabase Image Transformations Usage](https://supabase.com/docs/guides/platform/manage-your-usage/storage-image-transformations)
