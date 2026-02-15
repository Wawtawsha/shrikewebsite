/**
 * Universal photo upload script — diff-based by default, fully CLI-driven.
 *
 * Usage:
 *   npx tsx scripts/upload.ts --event <slug> --dir "G:\path\to\photos"
 *   npx tsx scripts/upload.ts --event <slug> --dir "G:\path" --subdirs final
 *   npx tsx scripts/upload.ts --event <slug> --dir "G:\path" --recursive
 *   npx tsx scripts/upload.ts --event <slug> --dir "G:\path" --dry-run
 *   npx tsx scripts/upload.ts --event <slug> --dir "G:\path" --force
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { encode } from "blurhash";
import { readdir, readFile } from "fs/promises";
import { join, extname, basename, dirname } from "path";

const THUMB_WIDTH = 400;
const FULL_WIDTH = 1600;
const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);

interface DiskPhoto {
  filePath: string;
  storageName: string;
}

interface Args {
  event: string;
  dir: string;
  subdirs: string;
  recursive: boolean;
  dryRun: boolean;
  force: boolean;
}

function printUsage(): never {
  console.log(`
Usage: npx tsx scripts/upload.ts --event <slug> --dir <path> [options]

Options:
  --event <slug>     Event slug (must exist in events table)     [required]
  --dir <path>       Source directory                             [required]
  --subdirs <name>   Only enter subdirs matching this name (case-insensitive)
  --recursive        Walk all subdirs (mutually exclusive with --subdirs)
  --dry-run          Print what would be uploaded, skip actual upload
  --force            Re-upload all (upsert storage, skip existing DB rows)
`);
  process.exit(1);
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  let event = "";
  let dir = "";
  let subdirs = "";
  let recursive = false;
  let dryRun = false;
  let force = false;

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--event":
        event = argv[++i] ?? "";
        break;
      case "--dir":
        dir = argv[++i] ?? "";
        break;
      case "--subdirs":
        subdirs = argv[++i] ?? "";
        break;
      case "--recursive":
        recursive = true;
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "--force":
        force = true;
        break;
    }
  }

  if (!event || !dir) printUsage();
  if (subdirs && recursive) {
    console.error("Error: --subdirs and --recursive are mutually exclusive.");
    process.exit(1);
  }

  return { event, dir, subdirs, recursive, dryRun, force };
}

function sanitize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Recursively find directories matching a name (case-insensitive). */
async function findMatchingDirs(root: string, name: string): Promise<string[]> {
  const results: string[] = [];
  const target = name.toLowerCase();

  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = join(dir, entry.name);
        if (entry.name.toLowerCase() === target) {
          results.push(fullPath);
        } else {
          await walk(fullPath);
        }
      }
    }
  }

  await walk(root);
  return results;
}

/** Collect image files from a single directory (non-recursive). */
async function collectFlat(dir: string): Promise<string[]> {
  const entries = await readdir(dir);
  return entries
    .filter((f) => ALLOWED.has(extname(f).toLowerCase()))
    .map((f) => join(dir, f));
}

/** Recursively collect all image files. */
async function collectRecursive(
  dir: string,
  parentFolder?: string
): Promise<DiskPhoto[]> {
  const results: DiskPhoto[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      const folder = parentFolder ?? entry.name;
      results.push(...(await collectRecursive(full, folder)));
    } else if (ALLOWED.has(extname(entry.name).toLowerCase())) {
      const folder = parentFolder ?? basename(dir);
      const rawName = basename(entry.name, extname(entry.name));
      results.push({ filePath: full, storageName: `${sanitize(folder)}-${rawName}` });
    }
  }

  return results;
}

/** Build list of DiskPhoto objects based on CLI mode. */
async function collectPhotos(args: Args): Promise<DiskPhoto[]> {
  if (args.recursive) {
    return collectRecursive(args.dir);
  }

  if (args.subdirs) {
    const dirs = await findMatchingDirs(args.dir, args.subdirs);
    console.log(`Found ${dirs.length} "${args.subdirs}" directories`);
    const photos: DiskPhoto[] = [];

    for (const matchedDir of dirs) {
      // Parent of the matched subdir (e.g., person's folder name)
      const parentRaw = basename(dirname(matchedDir));
      const parentClean = sanitize(parentRaw);
      const files = await collectFlat(matchedDir);

      for (const filePath of files) {
        const rawName = basename(filePath, extname(filePath));
        photos.push({ filePath, storageName: `${parentClean}-${rawName}` });
      }
    }
    return photos;
  }

  // Flat mode — storage name is just the filename (no parent prefix)
  const files = await collectFlat(args.dir);
  return files.map((filePath) => ({
    filePath,
    storageName: basename(filePath, extname(filePath)),
  }));
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

  const args = parseArgs();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  const supabase = createClient(url, key);

  // 1. Verify event exists
  const { data: eventRow, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("slug", args.event)
    .single();

  if (eventError || !eventRow) {
    console.error(
      `Event "${args.event}" not found. Create it first with:\n  npx tsx scripts/create-event.ts --slug ${args.event} --title "..." --date YYYY-MM-DD`
    );
    process.exit(1);
  }

  // 2. Collect local files
  const diskPhotos = await collectPhotos(args);
  if (diskPhotos.length === 0) {
    console.error(`No image files found in ${args.dir}`);
    process.exit(1);
  }
  console.log(`Found ${diskPhotos.length} photos on disk`);

  // 3. Query existing photos for diff
  const { data: existing, error: dbErr } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("event_id", eventRow.id);

  if (dbErr) {
    console.error("DB query failed:", dbErr.message);
    process.exit(1);
  }

  const existingNames = new Set(
    (existing ?? []).map((r: { storage_path: string }) =>
      r.storage_path
        .replace(`${args.event}/full/`, "")
        .replace(".jpg", "")
    )
  );
  console.log(`Existing photos in DB: ${existingNames.size}`);

  // 4. Diff
  const toUpload = args.force
    ? diskPhotos
    : diskPhotos.filter((p) => !existingNames.has(p.storageName));

  const skipped = diskPhotos.length - toUpload.length;
  console.log(`New photos to upload: ${toUpload.length} (${skipped} already exist)`);

  if (toUpload.length === 0) {
    console.log("Nothing to upload — all photos already in DB.");
    return;
  }

  // 5. Dry run
  if (args.dryRun) {
    console.log("\n--- DRY RUN (no uploads) ---");
    for (const { storageName } of toUpload) {
      console.log(`  Would upload: ${storageName}`);
    }
    console.log(`\nTotal: ${toUpload.length} photos would be uploaded.`);
    return;
  }

  // 6. Get max sort_order
  const { data: maxRow } = await supabase
    .from("photos")
    .select("sort_order")
    .eq("event_id", eventRow.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  let sortOrder = (maxRow?.sort_order ?? -1) + 1;

  // 7. Upload
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

      const thumbPath = `${args.event}/thumb/${storageName}.webp`;
      const fullPath = `${args.event}/full/${storageName}.jpg`;

      // Upload storage files (upsert so --force re-uploads work)
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

      // Insert DB row only if it doesn't already exist (prevents duplicates with --force)
      if (!existingNames.has(storageName)) {
        const { error: insertErr } = await supabase.from("photos").insert({
          event_id: eventRow.id,
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
      }

      uploaded++;
      console.log(`  [${uploaded + failed}/${toUpload.length}] Uploaded ${storageName}`);
    } catch (err) {
      console.error(`  Error processing ${storageName}:`, err);
      failed++;
    }
  }

  console.log(`\nDone! Uploaded ${uploaded}, failed ${failed}, skipped ${skipped}.`);
  console.log(`Total photos for event: ${existingNames.size + uploaded}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
