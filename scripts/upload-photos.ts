/**
 * Upload photos to Supabase Storage and insert metadata rows.
 *
 * Usage:
 *   npx tsx scripts/upload-photos.ts --event winery-event-2026 --dir ./photos/winery
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (bypasses RLS for inserts).
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { encode } from "blurhash";
import { readdir, readFile } from "fs/promises";
import { join, extname, basename } from "path";

const THUMB_WIDTH = 400;
const FULL_WIDTH = 1600;
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);

function parseArgs() {
  const args = process.argv.slice(2);
  let event = "";
  let dir = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--event" && args[i + 1]) event = args[++i];
    if (args[i] === "--dir" && args[i + 1]) dir = args[++i];
  }

  if (!event || !dir) {
    console.error("Usage: npx tsx scripts/upload-photos.ts --event <slug> --dir <path>");
    process.exit(1);
  }

  return { event, dir };
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  return createClient(url, key);
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
  // Load .env.local
  const { config } = await import("dotenv");
  config({ path: ".env.local" });

  const { event, dir } = parseArgs();
  const supabase = getSupabase();

  // Verify event exists
  const { data: eventRow, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("slug", event)
    .single();

  if (eventError || !eventRow) {
    console.error(`Event "${event}" not found. Create it first with: npx tsx scripts/create-event.ts --slug ${event} --title "..." --date YYYY-MM-DD`);
    process.exit(1);
  }

  // Read directory
  const files = (await readdir(dir)).filter((f) =>
    ALLOWED_EXTENSIONS.has(extname(f).toLowerCase())
  );

  if (files.length === 0) {
    console.error(`No image files found in ${dir}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} photos to upload for event "${event}"`);

  let uploaded = 0;

  for (const file of files) {
    const filePath = join(dir, file);
    const rawBuffer = await readFile(filePath);
    const name = basename(file, extname(file));

    // Process images — thumbs as webp (display-only), full as jpeg (downloadable)
    const thumbBuffer = await sharp(rawBuffer)
      .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const fullBuffer = await sharp(rawBuffer)
      .resize(FULL_WIDTH, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const fullMetadata = await sharp(fullBuffer).metadata();

    // Generate blurhash from thumbnail
    const blurhash = await generateBlurhash(thumbBuffer);

    // Upload to storage
    const thumbPath = `${event}/thumb/${name}.webp`;
    const fullPath = `${event}/full/${name}.jpg`;

    const { error: thumbErr } = await supabase.storage
      .from("event-photos")
      .upload(thumbPath, thumbBuffer, { contentType: "image/webp", upsert: true });

    if (thumbErr) {
      console.error(`  Failed to upload thumbnail for ${file}: ${thumbErr.message}`);
      continue;
    }

    const { error: fullErr } = await supabase.storage
      .from("event-photos")
      .upload(fullPath, fullBuffer, { contentType: "image/jpeg", upsert: true });

    if (fullErr) {
      console.error(`  Failed to upload full image for ${file}: ${fullErr.message}`);
      continue;
    }

    // Insert metadata row
    const { error: insertErr } = await supabase.from("photos").insert({
      event_id: eventRow.id,
      storage_path: fullPath,
      thumb_path: thumbPath,
      filename: file,
      width: fullMetadata.width ?? 0,
      height: fullMetadata.height ?? 0,
      blurhash,
      sort_order: uploaded,
    });

    if (insertErr) {
      console.error(`  Failed to insert metadata for ${file}: ${insertErr.message}`);
      continue;
    }

    uploaded++;
    console.log(`  Uploaded ${uploaded}/${files.length}: ${file}`);
  }

  console.log(`\nDone! Uploaded ${uploaded}/${files.length} photos.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
