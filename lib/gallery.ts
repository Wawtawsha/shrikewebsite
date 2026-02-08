import { supabase } from "./supabase";
import type { GalleryEvent, GalleryPhoto, PhotoBatch } from "@/types/gallery";

export function getStorageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${path}`;
}

export async function fetchEvent(slug: string): Promise<GalleryEvent | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data as GalleryEvent;
}

export async function fetchPhotos(
  eventId: string,
  offset: number,
  limit: number
): Promise<PhotoBatch> {
  const { count } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  const totalCount = count ?? 0;

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    return { photos: [], totalCount, hasMore: false };
  }

  return {
    photos: data as GalleryPhoto[],
    totalCount,
    hasMore: offset + limit < totalCount,
  };
}
