/**
 * Upload only MISSING photos to Supabase — diffs disk vs DB, uploads the gap.
 *
 * Usage:
 *   npx tsx scripts/upload-missing-photos.ts
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { encode } from "blurhash";
import { readdir, readFile } from "fs/promises";
import { join, extname, basename } from "path";

const ROOT = String.raw`G:\My Drive\Town of Farmville\Press Club\2016 Night`;
const EVENT_SLUG = "2016-night-at-press-club";
const EVENT_ID = "73e389e2-8d94-4480-b82d-62a9fad80797";
const THUMB_WIDTH = 400;
const FULL_WIDTH = 1600;
const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);
const SUFFIX_RE = /\s*-\s*(sent|semt|Could Not Find)\s*$/i;

interface DiskPhoto {
  filePath: string;
  storageName: string;
}

function sanitize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

/** Recursively find directories named "final" (case-insensitive). */
async function findFinalDirs(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const full = join(dir, entry.name);
      if (entry.name.toLowerCase() === "final") {
        results.push(full);
      } else {
        results.push(...(await findFinalDirs(full)));
      }
    }
  }
  return results;
}

/** Collect image files from a single directory. */
async function collectImages(dir: string): Promise<string[]> {
  const entries = await readdir(dir);
  return entries
    .filter((f) => ALLOWED.has(extname(f).toLowerCase()))
    .map((f) => join(dir, f));
}

async function generateBlurhash(buffer: Buffer): Promise<string> {
  const { data, info } = await sharp(buffer)
    .resize(32, 32, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}

async function main() {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) {
    console.error("Missing SUPABASE env vars in .env.local");
    process.exit(1);
  }
  const supabase = createClient(url, key);

  // 1. Collect all photos on disk from Final dirs
  console.log(`Scanning ${ROOT} for Final directories...`);
  const finalDirs = await findFinalDirs(ROOT);
  console.log(`Found ${finalDirs.length} Final directories`);

  const diskPhotos: DiskPhoto[] = [];
  for (const finalDir of finalDirs) {
    // Parent dir = grandparent of the file (person's folder)
    const parentRaw = basename(join(finalDir, ".."));
    const parentClean = parentRaw.replace(SUFFIX_RE, "");
    const parentSanitized = sanitize(parentClean);

    const files = await collectImages(finalDir);
    for (const filePath of files) {
      const rawName = basename(filePath, extname(filePath));
      const storageName = `${parentSanitized}-${rawName}`;
      diskPhotos.push({ filePath, storageName });
    }
  }
  console.log(`Total photos on disk: ${diskPhotos.length}`);

  // 2. Get existing storage names from DB
  const { data: existing, error: dbErr } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("event_id", EVENT_ID);

  if (dbErr) {
    console.error("DB query failed:", dbErr.message);
    process.exit(1);
  }

  const existingNames = new Set(
    (existing ?? []).map((r: { storage_path: string }) =>
      r.storage_path
        .replace(`${EVENT_SLUG}/full/`, "")
        .replace(".jpg", "")
    )
  );
  console.log(`Existing photos in DB: ${existingNames.size}`);

  // 3. Diff
  const toUpload = diskPhotos.filter((p) => !existingNames.has(p.storageName));
  console.log(`Photos to upload: ${toUpload.length}`);

  if (toUpload.length === 0) {
    console.log("Nothing to upload — all photos already in DB.");
    return;
  }

  // 4. Get max sort_order
  const { data: maxRow } = await supabase
    .from("photos")
    .select("sort_order")
    .eq("event_id", EVENT_ID)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  let sortOrder = (maxRow?.sort_order ?? 0) + 1;

  // 5. Upload missing photos
  let uploaded = 0;
  let failed = 0;

  for (const { filePath, storageName } of toUpload) {
    try {
      const rawBuffer = await readFile(filePath);

      const thumbBuffer = await sharp(rawBuffer)
        .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const fullBuffer = await sharp(rawBuffer)
        .resize(FULL_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const fullMeta = await sharp(fullBuffer).metadata();
      const blurhash = await generateBlurhash(thumbBuffer);

      const thumbPath = `${EVENT_SLUG}/thumb/${storageName}.webp`;
      const fullPath = `${EVENT_SLUG}/full/${storageName}.jpg`;

      const { error: thumbErr } = await supabase.storage
        .from("event-photos")
        .upload(thumbPath, thumbBuffer, { contentType: "image/webp", upsert: true });
      if (thumbErr) {
        console.error(`  Thumb upload failed for ${storageName}: ${thumbErr.message}`);
        failed++;
        continue;
      }

      const { error: fullErr } = await supabase.storage
        .from("event-photos")
        .upload(fullPath, fullBuffer, { contentType: "image/jpeg", upsert: true });
      if (fullErr) {
        console.error(`  Full upload failed for ${storageName}: ${fullErr.message}`);
        failed++;
        continue;
      }

      const { error: insertErr } = await supabase.from("photos").insert({
        event_id: EVENT_ID,
        storage_path: fullPath,
        thumb_path: thumbPath,
        filename: basename(filePath),
        width: fullMeta.width ?? 0,
        height: fullMeta.height ?? 0,
        blurhash,
        sort_order: sortOrder++,
      });

      if (insertErr) {
        console.error(`  DB insert failed for ${storageName}: ${insertErr.message}`);
        failed++;
        continue;
      }

      uploaded++;
      if (uploaded % 10 === 0 || uploaded === toUpload.length) {
        console.log(`  Uploaded ${uploaded}/${toUpload.length} (${failed} failed)`);
      }
    } catch (err) {
      console.error(`  Error processing ${storageName}:`, err);
      failed++;
    }
  }

  console.log(`\nDone! Uploaded ${uploaded}/${toUpload.length} (${failed} failed).`);
  console.log(`Total photos now: ${existingNames.size + uploaded}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
