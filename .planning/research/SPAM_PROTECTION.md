# Spam Protection: Anonymous Photo Gallery Likes & Comments

**Domain:** Supabase-backed photo gallery with anonymous likes and comments, integrated into existing Next.js 16 App Router site
**Researched:** 2026-02-08
**Overall confidence:** HIGH (patterns well-established; low threat model simplifies decision significantly)

---

## Context & Threat Model

- **Audience:** Women 30-60, primarily mobile, not tech-savvy
- **Scale:** 50-200 attendees per event
- **Distribution:** Private URL shared at events, not SEO-indexed
- **Auth model:** Fully anonymous -- no accounts, no login, no email
- **Primary threat:** Accidental spam or a bored attendee, not coordinated bot attacks
- **Core constraint:** Zero friction is non-negotiable for this audience

This threat model is **orders of magnitude lower** than a public-facing comment system. Most anti-spam literature targets public internet traffic with automated bot attacks. For a private event gallery, the overwhelming majority of those concerns do not apply. The research below covers the full spectrum, but the recommendation at the end is calibrated to this reality.

---

## 1. Anonymous Like Protection

### 1.1 localStorage-Based Device Tracking (Simplest)

**How it works:** Generate a random device ID (UUID) on first visit, store it in `localStorage`. Send it with every like request. The server checks if this device has already liked this photo.

```typescript
// Client-side
const getDeviceId = (): string => {
  let id = localStorage.getItem('gallery_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('gallery_device_id', id);
  }
  return id;
};
```

**Pros:**
- Zero friction -- completely invisible to users
- Simple to implement (5 lines of code)
- Works on all browsers
- No privacy concerns beyond what you'd have with any web app

**Cons:**
- Cleared when user clears browser data
- Different per browser/incognito window
- Trivially bypassable if someone wants to

**What happens when someone clears localStorage?**
They can like photos again. For a small event gallery, this is completely acceptable. Nobody is gaming likes on their friend's event photos. If someone deliberately clears storage to like a photo twice, they clearly care enough to want to express that -- not a problem worth solving.

### 1.2 Browser Fingerprinting (FingerprintJS / ThumbmarkJS)

**How it works:** Combines browser attributes (screen size, installed fonts, WebGL renderer, timezone, etc.) into a hash that persists across localStorage clears and incognito mode.

**Open-source options:**
- [FingerprintJS](https://github.com/fingerprintjs/fingerprintjs) (open-source, BSL license -- restricted production use)
- [ThumbmarkJS](https://github.com/thumbmarkjs/thumbmarkjs) (MIT, lighter)
- FingerprintJS Pro (paid, server-side correlation, most accurate)

**Pros:**
- Survives localStorage clears
- Works across incognito sessions

**Cons:**
- **Privacy concerns are real.** Under GDPR/ePrivacy, device fingerprints are classified as personal data. The EU Cookie Directive and its national implementations apply to "any technology that stores or accesses information on a user's device," which includes fingerprinting ([Piwik PRO](https://piwik.pro/blog/device-fingerprint-tracking-in-the-post-gdpr-era/), [datarequests.org](https://www.datarequests.org/blog/tracking-id-personal-data/)).
- Modern browser protections (Chrome Privacy Sandbox, Safari ITP, Firefox fingerprinting protection) are actively degrading fingerprint stability
- Adds 5-20KB to bundle size
- Accuracy declining year over year as browsers randomize signals
- Overkill for "did someone double-like a photo at a baby shower"

**Verdict for this use case: Not recommended.** The privacy cost and complexity far exceed the negligible benefit over localStorage for a private event gallery.

### 1.3 IP-Based Rate Limiting

**How it works:** Track likes per IP address. Limit to N likes per photo per IP.

**Pros:**
- Works server-side, cannot be bypassed client-side
- No client storage needed

**Cons:**
- Multiple attendees on the same Wi-Fi share an IP (event venue Wi-Fi is a near-certainty)
- Mobile carriers use CGNAT -- many users share IPs
- Blocking by IP would prevent legitimate likes from attendees on the same network
- Does not track "which photos this device liked" -- only total volume

**Verdict: Wrong tool for like deduplication.** IP limiting is useful for rate limiting (preventing 1000 likes/minute), but not for per-photo like deduplication. You would block legitimate users at events where everyone is on the same Wi-Fi.

### 1.4 Cookie-Based Tracking

**How it works:** Same as localStorage but using cookies instead.

**Pros:**
- Sent automatically with requests (no client-side code to attach it)
- Can be set as HttpOnly for slight tamper resistance

**Cons:**
- Same clearing problem as localStorage
- Cookie consent banners may be required in EU/UK (ePrivacy Directive)
- Cookies have size/count limits
- No meaningful advantage over localStorage for this use case
- Actually worse for SPA patterns since you need to manage cookie headers

**Verdict: localStorage is simpler and equivalent.** Cookies add cookie-consent complexity with no additional benefit.

### 1.5 Tradeoff Summary: Like Protection

| Approach | Accuracy | Privacy | Complexity | Friction | Recommendation |
|----------|----------|---------|------------|----------|----------------|
| localStorage device ID | Good enough | Low concern | Minimal | Zero | **USE THIS** |
| Browser fingerprinting | Better | High concern | Moderate | Zero | Overkill |
| IP-based | Poor (shared WiFi) | Moderate | Moderate | Zero | Wrong tool |
| Cookies | Same as localStorage | Cookie consent needed | Slightly more | Zero | No advantage |

---

## 2. Anonymous Comment Spam Protection

### 2.1 Rate Limiting Approaches

#### 2.1.1 Supabase Database-Level Rate Limiting (pgrst.db_pre_request)

Supabase supports a PostgreSQL `db_pre_request` function that runs before every Data API request. You can use this with `pg_headerkit` to extract the client IP from request headers and enforce rate limits.

**Implementation pattern:**

```sql
-- Private schema (not accessible via API)
CREATE TABLE private.rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL
);

-- Rate limit check function
CREATE OR REPLACE FUNCTION private.check_rate_limit(
  rate_key TEXT,
  max_requests INTEGER,
  window_seconds INTEGER
) RETURNS VOID AS $$
DECLARE
  now TIMESTAMPTZ := clock_timestamp();
  window_length INTERVAL := make_interval(secs => window_seconds);
  current_count INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(rate_key));

  INSERT INTO private.rate_limits (key, count, window_start)
  VALUES (rate_key, 1, now)
  ON CONFLICT (key) DO UPDATE
  SET count = CASE
    WHEN private.rate_limits.window_start + window_length <= now THEN 1
    ELSE private.rate_limits.count + 1
  END,
  window_start = CASE
    WHEN private.rate_limits.window_start + window_length <= now THEN now
    ELSE private.rate_limits.window_start
  END;

  SELECT count INTO current_count FROM private.rate_limits WHERE key = rate_key;

  IF current_count > max_requests THEN
    RAISE EXCEPTION 'Rate limit exceeded for %', rate_key
      USING ERRCODE = 'PGRST';  -- HTTP 420
  END IF;
END;
$$ LANGUAGE plpgsql;
```

Source: [Neon Rate Limiting Guide](https://neon.com/guides/rate-limiting), [Supabase API Security Docs](https://supabase.com/docs/guides/api/securing-your-api)

**Limitations:**
- Only works for POST/PUT/PATCH/DELETE (not GET) since read replicas cannot write
- Only works with the Data API (PostgREST), not Realtime or Storage
- Shared Wi-Fi means shared IP -- same problem as like protection
- Requires `pg_headerkit` extension for IP extraction
- Adds a database write for every rate-limited request

**Verdict: Viable but heavy for this use case.** Good to know it exists, but a simpler approach works better here.

#### 2.1.2 Supabase Edge Function Rate Limiting

Supabase documents rate limiting via Edge Functions using [Upstash Redis](https://supabase.com/docs/guides/functions/examples/rate-limiting). The Edge Function acts as a proxy that checks rate limits before forwarding requests.

**Pros:**
- Proper rate limiting with Redis (atomic operations, TTL-based windows)
- Can rate limit by IP, device ID, or any identifier
- Runs at the edge (low latency)

**Cons:**
- Requires Upstash Redis account (free tier: 10K commands/day, sufficient for this scale)
- Adds architectural complexity (Edge Function proxy layer)
- Another external service dependency

**Verdict: Good option if you need robust rate limiting, but a dependency you probably don't need at this scale.**

#### 2.1.3 Client-Side Cooldown Timers

**How it works:** After submitting a comment, disable the form for N seconds and show a countdown.

```typescript
const [cooldown, setCooldown] = useState(0);
const handleSubmit = async () => {
  await submitComment(text);
  setCooldown(30); // 30 second cooldown
};
// Timer decrements cooldown every second
```

**Pros:**
- Zero server complexity
- Good UX signal ("your comment was received")
- Prevents accidental double-submissions

**Cons:**
- Trivially bypassable (refresh page, open DevTools)
- Not a real security measure

**Verdict: Use as UX, not security.** Good to have for the user experience regardless, but don't rely on it as your only protection.

#### 2.1.4 Database Trigger Rate Limiting (Simplest Server-Side)

Instead of rate limiting at the API layer, use a PostgreSQL trigger on the comments table itself. When a new comment is inserted, the trigger checks how many comments this device_id has posted in the last N minutes.

```sql
CREATE OR REPLACE FUNCTION check_comment_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM comments
  WHERE device_id = NEW.device_id
    AND created_at > NOW() - INTERVAL '5 minutes';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Too many comments. Please wait a few minutes.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_comment_rate_limit
  BEFORE INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION check_comment_rate_limit();
```

**Pros:**
- No additional infrastructure
- Enforced at database level (cannot be bypassed by API)
- Uses the device_id you're already storing for likes
- Simple, readable SQL
- No external dependencies

**Cons:**
- Relies on client-supplied device_id (can be spoofed)
- Does not catch IP-based abuse
- Adds a query per insert (negligible at this scale)

**Verdict: Best fit for this use case.** Simple, server-enforced, no external dependencies, and the spoofing risk is irrelevant for a private event gallery.

### 2.2 Content Filtering

#### 2.2.1 Simple Word Blocklist

Several npm packages exist for profanity filtering:

- **[obscenity](https://github.com/jo3-l/obscenity)** -- Robust, extensible, handles obfuscation ("fuuuuck"), actively maintained
- **[bad-words](https://www.npmjs.com/package/bad-words)** -- Simple, popular, but less sophisticated
- **[leo-profanity](https://www.npmjs.com/package/leo-profanity)** -- Based on Shutterstock dictionary, multi-language

**Implementation:**

```typescript
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const isClean = (text: string): boolean => !matcher.hasMatch(text);
```

**Pros:**
- Catches obvious profanity
- No external API calls
- Fast (regex-based)

**Cons:**
- False positives (e.g., "Scunthorpe problem")
- Only catches English profanity by default
- Determined people can bypass with creative spelling

**Verdict: Worth including as a lightweight first pass.** Run it client-side to give immediate feedback ("please rephrase"), and also run it server-side in an Edge Function or trigger as a backup.

#### 2.2.2 PostgreSQL pg_trgm for Fuzzy Matching

PostgreSQL's `pg_trgm` extension enables fuzzy text matching using trigrams. You could use it to catch variations of blocked words.

**Verdict: Overkill.** The `obscenity` library already handles common obfuscation patterns. Adding database-level fuzzy matching for a few dozen profanity words at this scale is over-engineering.

#### 2.2.3 External APIs (Perspective API, OpenAI Moderation)

- **[Perspective API](https://perspectiveapi.com/)** -- Free, 1 QPS default quota. **BUT: being sunset, no longer in service after 2026.** Do not build on this.
- **OpenAI Moderation API** -- Free with OpenAI API key, good accuracy
- **OOPSpam** -- Anti-spam API with ML, 99.9% accuracy claimed

**Verdict: Not needed at this scale.** You're protecting against a bored person at a baby shower, not organized harassment campaigns. A word blocklist is sufficient. If you ever need to scale to public-facing galleries, revisit this.

### 2.3 Bot Prevention (Lightweight)

#### 2.3.1 Honeypot Fields (Invisible Form Fields)

**How it works:** Add a hidden form field. Bots that auto-fill all fields will fill it. Humans (and screen readers) won't see it. Reject submissions where the field has a value.

```tsx
{/* CSS-hidden, not display:none (bots detect that) */}
<div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
  <input
    type="text"
    name="website"  {/* Use a tempting name like "website" or "url" */}
    tabIndex={-1}
    autoComplete="off"
  />
</div>
```

**Key implementation detail:** Do NOT use `display: none` or `visibility: hidden` -- modern bots detect those. Use absolute positioning off-screen. The field name matters -- use something bots would want to fill like `website`, `url`, or `company` ([CSS-Tricks](https://css-tricks.com/building-a-honeypot-field-that-works/), [Vibe Coding With Fred](https://vibecodingwithfred.com/blog/honeypot-spam-protection/)).

**Effectiveness:** When combined with timing checks, honeypots "dropped spam from 20-50 per day to essentially zero" in real-world tests. However, modern AI-driven bots using DOM automation are starting to detect them. For a private URL not indexed by search engines, bot traffic is near-zero anyway.

**Verdict: Include it -- it's free.** Zero friction, 5 minutes to implement, catches dumb bots. Even if sophisticated bots can bypass it, those bots will never find your private gallery URL.

#### 2.3.2 Time-Based Submission Checks

**How it works:** Record when the form renders. Reject submissions that happen in under 2 seconds (no human can read, type, and submit that fast).

```typescript
const formRenderedAt = useRef(Date.now());

const handleSubmit = async () => {
  const elapsed = Date.now() - formRenderedAt.current;
  if (elapsed < 2000) return; // Silent reject
  // ... submit
};
```

**Verdict: Include it -- it's free.** One line of code, zero friction, catches automated submissions.

#### 2.3.3 Simple Math CAPTCHA

**How it works:** "What is 3 + 7?" before submitting.

**Verdict: Do NOT use.** This adds friction for your non-tech-savvy audience. Some users will struggle with it or find it condescending. The threat model does not justify any visible challenge.

#### 2.3.4 reCAPTCHA / hCaptcha / Cloudflare Turnstile

| Service | User Friction | Privacy | Bot Detection | Free Tier |
|---------|--------------|---------|---------------|-----------|
| reCAPTCHA v3 | Low (invisible) but can trigger challenges | Poor (Google tracking) | Good (69% catch rate) | Yes |
| hCaptcha | Moderate (visual challenges) | Better than reCAPTCHA | Good | Yes |
| Cloudflare Turnstile | Very low (truly invisible) | Good (minimal data) | Lower (33% catch rate) | Yes |

Source: [rCAPTCHA Blog](https://blog.rcaptcha.app/articles/cloudflare-turnstile-vs-recaptcha), [Talent500](https://talent500.com/blog/cloudflare-turnstile-vs-google-recaptcha-modern-captcha-alternative/)

**Turnstile is the best option IF you need a CAPTCHA.** It is genuinely invisible (no puzzles), adds <100ms, collects minimal data, and is free. But Supabase also natively supports CAPTCHA on auth endpoints.

**Counterpoint:** Even Turnstile's 33% bot detection rate is fine when your threat model is "bored human at an event." The real question is whether you need any CAPTCHA at all.

**Verdict: Reserve as an escalation option.** Don't ship with it. If you ever see bot traffic (you won't), add Turnstile. It can be added later with minimal code changes.

### 2.4 Moderation

#### 2.4.1 Post-Hoc Moderation (All Visible, Owner Can Delete)

**How it works:** All comments appear immediately. The gallery owner/event host can delete inappropriate ones via an admin interface.

**Pros:**
- Comments feel immediate and alive
- Minimal development work
- No moderation queue to check
- Natural for the "event vibe" -- feels like a live guestbook

**Cons:**
- Inappropriate content visible until manually removed
- Requires the owner to check periodically

#### 2.4.2 Pre-Moderation Queue

**How it works:** Comments go into a queue. The owner approves or rejects each one before it appears.

**Pros:**
- Nothing inappropriate ever appears publicly

**Cons:**
- **Kills the energy of a live event.** Comments submitted during the event won't appear until someone checks the queue.
- Creates obligation for the owner to constantly moderate
- At 50-200 attendees, this becomes tedious fast
- The owner is likely also an attendee, busy enjoying the event

#### 2.4.3 Hybrid: Auto-Approve Short, Queue Long

**How it works:** Comments under N characters auto-approve. Longer ones go to a queue.

**Pros:**
- Most "cute photo!" / "love this!" comments go through instantly
- Longer comments (where harmful content is more likely) get reviewed

**Cons:**
- Arbitrary threshold creates confusion
- Still requires the owner to check the queue
- A short "fuck you" auto-approves while a long heartfelt message gets queued

**Verdict: Post-hoc moderation is correct for this use case.** Combined with the word blocklist, the risk of inappropriate content surviving long enough to matter is extremely low. The gallery owner should have a simple "delete" button on each comment (visible only to them via a share secret or admin link).

---

## 3. Supabase-Specific Patterns

### 3.1 RLS Policies for Anonymous Writes

The gallery uses the Supabase `anon` key (no Supabase Auth, no user accounts). This means all requests use the `anon` Postgres role.

**Critical RLS pattern: INSERT only for public, no UPDATE/DELETE:**

```sql
-- Likes table
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes (for displaying counts)
CREATE POLICY "Anyone can read likes"
  ON likes FOR SELECT TO anon
  USING (true);

-- Anyone can insert likes (with device_id)
CREATE POLICY "Anyone can insert likes"
  ON likes FOR INSERT TO anon
  WITH CHECK (true);

-- No UPDATE or DELETE policies for anon = no updates or deletes allowed

-- Comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read non-hidden comments
CREATE POLICY "Anyone can read visible comments"
  ON comments FOR SELECT TO anon
  USING (hidden = false);

-- Anyone can insert comments
CREATE POLICY "Anyone can insert comments"
  ON comments FOR INSERT TO anon
  WITH CHECK (true);

-- No UPDATE/DELETE for anon
```

**Important Supabase detail:** When using `.insert()`, the Supabase client automatically does a SELECT to return the inserted row. If you have no SELECT policy, the insert will appear to fail even though it succeeds. Either:
1. Add a SELECT policy (recommended above), or
2. Use `{ returning: 'minimal' }` option: `.insert(data, { returning: 'minimal' })`

Source: [Supabase Discussion #4107](https://github.com/orgs/supabase/discussions/4107), [Supabase Discussion #6757](https://github.com/orgs/supabase/discussions/6757)

### 3.2 Admin Operations via Service Role

For the gallery owner to delete comments, use a separate admin endpoint (Edge Function or server-side API route) that uses the Supabase **service role key** to bypass RLS.

```typescript
// In a Next.js API route or Edge Function -- NEVER expose service role to client
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Never in client bundle
);

// Soft-delete: mark as hidden rather than actually deleting
await supabaseAdmin
  .from('comments')
  .update({ hidden: true })
  .eq('id', commentId);
```

### 3.3 Database-Level Constraints

```sql
-- Max comment length
ALTER TABLE comments
  ADD CONSTRAINT comment_length CHECK (char_length(content) <= 500);

-- Prevent empty comments
ALTER TABLE comments
  ADD CONSTRAINT comment_not_empty CHECK (char_length(trim(content)) > 0);

-- Require device_id
ALTER TABLE comments
  ADD CONSTRAINT comment_device_id_required CHECK (device_id IS NOT NULL);

-- Unique like per device per photo
ALTER TABLE likes
  ADD CONSTRAINT unique_like_per_device UNIQUE (photo_id, device_id);
```

The `UNIQUE` constraint on likes is the real MVP here. It prevents duplicate likes at the database level regardless of what the client does. If a device tries to like the same photo twice, Postgres returns a constraint violation error.

### 3.4 Supabase Realtime for Live Moderation

If the gallery owner wants to monitor comments in real-time:

```typescript
const channel = supabase
  .channel('comments')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'comments',
  }, (payload) => {
    // Show new comment in admin view with delete button
  })
  .subscribe();
```

**Verdict: Nice to have, not essential for v1.** The owner can check comments after the event. Real-time monitoring during an event they're attending is unlikely.

---

## 4. Device Identification Without Accounts

### 4.1 Generating Anonymous Device IDs

Use `crypto.randomUUID()` (available in all modern browsers including mobile Safari 15.4+).

```typescript
const getOrCreateDeviceId = (): string => {
  const STORAGE_KEY = 'shrike_gallery_device';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
};
```

### 4.2 Storage Options

| Storage | Persistence | Cross-Tab | Incognito | Capacity |
|---------|------------|-----------|-----------|----------|
| localStorage | Until cleared | Yes | No (separate) | ~5MB |
| sessionStorage | Until tab closed | No | No | ~5MB |
| Cookies | Configurable | Yes (with path) | No | ~4KB |
| IndexedDB | Until cleared | Yes | No | Large |

**localStorage is the correct choice.** It persists across page refreshes and tab closures (unlike sessionStorage), works across tabs (unlike sessionStorage), and doesn't require cookie consent mechanics.

### 4.3 Privacy / Legal Considerations

Under GDPR and the ePrivacy Directive:

- **A randomly generated UUID stored in localStorage IS personal data** if it can be linked to an identifiable person -- even indirectly ([datarequests.org](https://www.datarequests.org/blog/tracking-id-personal-data/), [legalweb.io](https://legalweb.io/en/news-en/browser-fingerprinting-and-the-gdpr/)).
- **The ePrivacy Directive (Cookie Law) applies to localStorage**, not just cookies. Any technology storing information on a user's device requires consent or a legitimate exemption ([iubenda](https://www.iubenda.com/blog/device-fingerprinting-and-cookie-law/)).
- **However:** The "strictly necessary" exemption likely applies here. The device ID is required for the core functionality (preventing duplicate likes, rate limiting comments). It is not used for tracking, advertising, or analytics.

**Practical risk assessment for a private event gallery:**
- The UUID is random -- not derived from personal data
- It is only used for spam prevention (functional purpose)
- The gallery is private, not commercial
- No cross-site tracking
- No data sharing with third parties

**Recommendation:** Include a brief note in the gallery footer: "This gallery uses a randomly generated device ID to prevent duplicate interactions. No personal data is collected." This provides transparency without requiring a consent banner. If operating under strict GDPR requirements, consult a privacy professional -- but for a private baby shower gallery, this is pragmatically sufficient.

### 4.4 Fallback When Storage Is Cleared

When a user clears localStorage, their device ID is lost. The gallery generates a new one on next visit. Consequences:

- **Likes:** They can like photos they already liked. Acceptable -- the UNIQUE constraint prevents server-side duplicates if the old device_id is gone, but the new device_id is a new identity. For 50-200 person events, this produces negligible inflation.
- **Comments:** Rate limiting resets for this "new device." Acceptable -- they are still rate limited going forward.
- **Session continuity:** None. The user is effectively a new visitor.

**This is acceptable.** The alternative (fingerprinting, account creation) adds complexity and privacy concerns that are not justified by the risk.

---

## 5. Recommendation for This Specific Use Case

### The Minimum Viable Protection Stack

Given the low threat model and zero-friction requirement, here is the recommended protection, ordered by implementation priority:

#### Layer 1: Database Constraints (Required, Day 1)

These are free, enforce themselves, and require zero client-side code:

```sql
-- Unique likes (THE most important protection)
ALTER TABLE likes ADD CONSTRAINT unique_like_per_device UNIQUE (photo_id, device_id);

-- Comment length limit
ALTER TABLE comments ADD CONSTRAINT comment_length CHECK (char_length(content) <= 500);

-- No empty comments
ALTER TABLE comments ADD CONSTRAINT comment_not_empty CHECK (char_length(trim(content)) > 0);
```

- **Effort:** 5 minutes
- **Effectiveness:** Prevents the most common issues (duplicate likes, spam-length comments)

#### Layer 2: localStorage Device ID (Required, Day 1)

```typescript
const getOrCreateDeviceId = (): string => {
  const key = 'shrike_gallery_device';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
};
```

- **Effort:** 5 minutes
- **Effectiveness:** Enables per-device like deduplication and comment rate limiting

#### Layer 3: RLS Policies (Required, Day 1)

INSERT + SELECT only for `anon` role. No UPDATE or DELETE. See Section 3.1 above.

- **Effort:** 10 minutes
- **Effectiveness:** Prevents any client from modifying or deleting data via the API

#### Layer 4: Database Trigger Rate Limit on Comments (Required, Day 1)

```sql
-- Max 3 comments per device per 5 minutes
CREATE OR REPLACE FUNCTION check_comment_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM comments
      WHERE device_id = NEW.device_id
        AND created_at > NOW() - INTERVAL '5 minutes') >= 3 THEN
    RAISE EXCEPTION 'Too many comments. Please wait a few minutes.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_comment_rate_limit
  BEFORE INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION check_comment_rate_limit();
```

- **Effort:** 10 minutes
- **Effectiveness:** Server-enforced rate limit, cannot be bypassed client-side

#### Layer 5: Honeypot + Time Check (Recommended, Day 1)

Zero-friction bot prevention on the comment form:

- Hidden "website" field (reject if filled)
- Reject if submitted < 2 seconds after form render

- **Effort:** 15 minutes
- **Effectiveness:** Catches automated submissions. Near-zero bots will find the private URL, but this costs nothing to add.

#### Layer 6: Client-Side Word Filter (Recommended, Day 1)

Use `obscenity` npm package for immediate feedback on obvious profanity.

- **Effort:** 15 minutes
- **Effectiveness:** Catches obvious profanity, gives instant feedback

#### Layer 7: Post-Hoc Moderation (Required, Day 1)

Gallery owner sees a "delete" button on each comment (via admin secret in URL or similar). Soft-delete via service role key on the server.

- **Effort:** 30 minutes
- **Effectiveness:** Final safety net for anything that gets through

### What to NOT build (for now)

| Approach | Why Not |
|----------|---------|
| Browser fingerprinting | Privacy concerns, complexity, declining accuracy |
| Upstash Redis rate limiting | External dependency for a problem that doesn't exist yet |
| Perspective API / AI moderation | Being sunset (2026), overkill for scale |
| CAPTCHA (any kind) | Friction for non-tech-savvy audience, no bot threat |
| Pre-moderation queue | Kills live event energy, burdens the host |
| IP-based rate limiting | Shared Wi-Fi at events makes this counterproductive |
| Supabase Anonymous Auth | Adds auth complexity for a system designed to have no auth |

### Escalation Path (If Problems Arise)

If the above proves insufficient (unlikely), escalate in this order:

1. **Add Cloudflare Turnstile** -- truly invisible, free, minimal code change
2. **Add server-side word filter** (Edge Function) -- in case client-side filter is bypassed
3. **Add IP-based rate limiting** via `db_pre_request` -- if a single device is spamming with rotating device IDs
4. **Enable pre-moderation** for comments over N characters -- hybrid approach

### Total Implementation Effort

Layers 1-7 combined: approximately **1.5-2 hours** of development time. This provides defense in depth that is calibrated to the actual threat -- a bored person at an event, not a bot army.

---

## Sources

- [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API Security / Rate Limiting](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase Edge Functions Rate Limiting](https://supabase.com/docs/guides/functions/examples/rate-limiting)
- [Supabase Discussion: Insert-Only RLS Policy](https://github.com/orgs/supabase/discussions/4107)
- [Supabase Discussion: Anon Insert RLS](https://github.com/orgs/supabase/discussions/6757)
- [Neon: Rate Limiting in Postgres](https://neon.com/guides/rate-limiting)
- [Rate Limiting Supabase with pgheaderkit](https://blog.mansueli.com/rate-limiting-supabase-requests-with-postgresql-and-pgheaderkit)
- [CSS-Tricks: Building a Honeypot Field That Works](https://css-tricks.com/building-a-honeypot-field-that-works/)
- [Honeypots Still Work (2025)](https://vibecodingwithfred.com/blog/honeypot-spam-protection/)
- [FingerprintJS (GitHub)](https://github.com/fingerprintjs/fingerprintjs)
- [ThumbmarkJS (GitHub)](https://github.com/thumbmarkjs/thumbmarkjs)
- [Obscenity Profanity Filter (GitHub)](https://github.com/jo3-l/obscenity)
- [Cloudflare Turnstile vs reCAPTCHA](https://blog.rcaptcha.app/articles/cloudflare-turnstile-vs-recaptcha)
- [Cloudflare Turnstile vs Google reCAPTCHA](https://talent500.com/blog/cloudflare-turnstile-vs-google-recaptcha-modern-captcha-alternative/)
- [Perspective API (Sunset Notice)](https://support.perspectiveapi.com/s/about-the-api-faqs)
- [Device Fingerprinting and GDPR](https://piwik.pro/blog/device-fingerprint-tracking-in-the-post-gdpr-era/)
- [Tracking IDs as Personal Data under GDPR](https://www.datarequests.org/blog/tracking-id-personal-data/)
- [Browser Fingerprinting and GDPR](https://legalweb.io/en/news-en/browser-fingerprinting-and-the-gdpr/)
- [Device Fingerprinting and Cookie Law](https://www.iubenda.com/blog/device-fingerprinting-and-cookie-law/)
- [Open Source Comment Systems and Anti-Spam](https://www.oopspam.com/blog/open-source-comment-systems-their-anti-spam-capabilities)
