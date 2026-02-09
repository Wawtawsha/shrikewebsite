import { supabase } from "./supabase";
import type {
  GalleryEvent,
  GalleryPhoto,
  GalleryComment,
  PhotoBatch,
} from "@/types/gallery";

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

export async function fetchUserLikes(
  eventId: string,
  deviceId: string
): Promise<Set<string>> {
  const { data: photos } = await supabase
    .from("photos")
    .select("id")
    .eq("event_id", eventId);

  if (!photos || photos.length === 0) return new Set();

  const photoIds = photos.map((p) => p.id);

  const { data: likes } = await supabase
    .from("photo_likes")
    .select("photo_id")
    .eq("device_id", deviceId)
    .in("photo_id", photoIds);

  return new Set((likes ?? []).map((l) => l.photo_id));
}

export async function fetchComments(
  eventId: string
): Promise<GalleryComment[]> {
  const { data: photos } = await supabase
    .from("photos")
    .select("id")
    .eq("event_id", eventId);

  if (!photos || photos.length === 0) return [];

  const photoIds = photos.map((p) => p.id);

  const { data } = await supabase
    .from("photo_comments")
    .select("*")
    .in("photo_id", photoIds)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(100);

  return (data as GalleryComment[]) ?? [];
}
